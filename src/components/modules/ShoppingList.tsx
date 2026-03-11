import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem, AppShoppingList } from '@/types';
import { formatCurrency } from '@utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Pencil,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────────

type ViewMode = 'lists' | 'detail';

interface ListFormData {
  name: string;
  monthYear: string; // YYYY-MM
  notes: string;
}

interface ItemFormData {
  name: string;
  quantity: string;
  unitType: string;
  categoryId: string;
  estimatedPrice: string;
  notes: string;
}

interface PurchaseFormData {
  price: string;
  purchasedAt: string; // YYYY-MM-DD
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

function toISOMonthYear(ymStr: string): string {
  return `${ymStr}-01T00:00:00Z`;
}

function fromISOMonthYear(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatMonthYearPT(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function formatMonthYearShort(ymStr: string): string {
  return new Date(`${ymStr}-01T00:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function quantityLabel(quantity: number, unitType: number): string {
  return `${quantity} ${UNIT_TYPE_LABELS[unitType] ?? 'un'}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(ymStr: string, delta: number): string {
  const [y, m] = ymStr.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const emptyListForm = (): ListFormData => ({ name: '', monthYear: currentMonthValue(), notes: '' });
const emptyItemForm = (): ItemFormData => ({
  name: '',
  quantity: '1',
  unitType: '0',
  categoryId: '',
  estimatedPrice: '',
  notes: '',
});
const emptyPurchaseForm = (est?: number | null): PurchaseFormData => ({
  price: est != null ? String(est) : '',
  purchasedAt: todayISO(),
});

// ── ProgressBar ──────────────────────────────────────────────────────────────────

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('w-full h-1.5 bg-slate-200 dark:bg-dark-border-default rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── ListFormDialog ───────────────────────────────────────────────────────────────

interface ListFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ListFormData;
  onSubmit: (data: ListFormData) => Promise<void>;
  title: string;
}
function ListFormDialog({ open, onClose, initialData, onSubmit, title }: ListFormDialogProps) {
  const [data, setData] = useState<ListFormData>(initialData ?? emptyListForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(initialData ?? emptyListForm());
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ ...data });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="list-name">Nome *</Label>
            <Input
              id="list-name"
              placeholder="Ex: Semana 1 de Março"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="list-month">Mês/Ano *</Label>
            <Input
              id="list-month"
              type="month"
              value={data.monthYear}
              onChange={(e) => setData((d) => ({ ...d, monthYear: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="list-notes">Observações</Label>
            <Textarea
              id="list-notes"
              placeholder="Opcional..."
              value={data.notes}
              onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving || !data.name.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── ItemFormDialog ───────────────────────────────────────────────────────────────

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => Promise<void>;
  title: string;
  categories: Array<{ shoppingCategoryId: string; name: string }>;
}
function ItemFormDialog({ open, onClose, initialData, onSubmit, title, categories }: ItemFormDialogProps) {
  const [data, setData] = useState<ItemFormData>(initialData ?? emptyItemForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(initialData ?? emptyItemForm());
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ ...data });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Item *</Label>
            <Input
              id="item-name"
              placeholder="Ex: Arroz"
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-qty">Quantidade *</Label>
              <Input
                id="item-qty"
                type="number"
                min="0.001"
                step="any"
                placeholder="1"
                value={data.quantity}
                onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Select value={data.unitType} onValueChange={(v) => setData((d) => ({ ...d, unitType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_TYPE_LABELS).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>
                      {lbl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={data.categoryId || '__none__'} onValueChange={(v) => setData((d) => ({ ...d, categoryId: v === '__none__' ? '' : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sem categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.shoppingCategoryId} value={c.shoppingCategoryId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-price">Preço estimado (R$)</Label>
            <Input
              id="item-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={data.estimatedPrice}
              onChange={(e) => setData((d) => ({ ...d, estimatedPrice: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-notes">Observações</Label>
            <Input
              id="item-notes"
              placeholder="Opcional..."
              value={data.notes}
              onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving || !data.name.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── MarkAsPurchasedDialog ────────────────────────────────────────────────────────

interface MarkAsPurchasedDialogProps {
  open: boolean;
  onClose: () => void;
  item: AppShoppingItem | null;
  onSubmit: (data: PurchaseFormData) => Promise<void>;
}
function MarkAsPurchasedDialog({ open, onClose, item, onSubmit }: MarkAsPurchasedDialogProps) {
  const [data, setData] = useState<PurchaseFormData>(emptyPurchaseForm(item?.estimatedPrice));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setData(emptyPurchaseForm(item?.estimatedPrice));
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open && !!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={20} />
            Marcar como comprado
          </DialogTitle>
        </DialogHeader>
        {item && (
          <div className="text-sm text-muted-foreground pb-1">
            <span className="font-medium text-foreground">{item.name}</span>
            {' — '}
            {quantityLabel(item.quantity, item.unitType)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="purchase-price">
              Preço pago (R$){' '}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <Input
              id="purchase-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={data.price}
              onChange={(e) => setData((d) => ({ ...d, price: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchase-date">Data da compra</Label>
            <Input
              id="purchase-date"
              type="date"
              value={data.purchasedAt}
              onChange={(e) => setData((d) => ({ ...d, purchasedAt: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
              disabled={saving}
            >
              {saving ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── ManageCategoriesDialog ───────────────────────────────────────────────────────

interface ManageCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Array<{ shoppingCategoryId: string; name: string; isDefault: boolean }>;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}
function ManageCategoriesDialog({
  open,
  onClose,
  categories,
  onCreateCategory,
  onDeleteCategory,
}: ManageCategoriesDialogProps) {
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaultCats = categories.filter((c) => c.isDefault);
  const customCats = categories.filter((c) => !c.isDefault);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await onCreateCategory(newName.trim());
      setNewName('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteCategory(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag size={18} />
            Gerenciar Categorias
          </DialogTitle>
        </DialogHeader>

        {/* Nova categoria */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder="Nome da nova categoria..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" className="px-3" disabled={saving || !newName.trim()}>
            <Plus size={16} />
          </Button>
        </form>

        <Separator />

        <div className="overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Categorias personalizadas */}
          {customCats.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Personalizadas</p>
              {customCats.map((c) => (
                <div
                  key={c.shoppingCategoryId}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 group"
                >
                  <span className="text-sm">{c.name}</span>
                  <button
                    onClick={() => handleDelete(c.shoppingCategoryId)}
                    disabled={deletingId === c.shoppingCategoryId}
                    className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {customCats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">Nenhuma categoria personalizada ainda.</p>
          )}

          {/* Categorias padrão */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Padrão do sistema</p>
            <div className="flex flex-wrap gap-1.5">
              {defaultCats.map((c) => (
                <Badge key={c.shoppingCategoryId} variant="secondary" className="text-xs font-normal">
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-2" onClick={onClose}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────────

const ShoppingList = memo(() => {
  const {
    shoppingLists,
    shoppingCategories,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    loadShoppingListDetail,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    markItemAsPurchased,
    unmarkItemAsPurchased,
    createShoppingCategory,
    deleteShoppingCategory,
  } = useApp();

  const { showSuccess, showError } = useToastNotifications();

  // ── View state ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('lists');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<AppShoppingList | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterMonth, setFilterMonth] = useState(currentMonthValue);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // ── Dialog state ────────────────────────────────────────────────────────────
  const [showCreateList, setShowCreateList] = useState(false);
  const [showEditList, setShowEditList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AppShoppingItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Derived: filtered lists ─────────────────────────────────────────────────
  const [filterYear, filterMonthNum] = filterMonth.split('-').map(Number);
  const filteredLists = useMemo(
    () =>
      shoppingLists.filter((l) => {
        const d = new Date(l.monthYear);
        return d.getUTCFullYear() === filterYear && d.getUTCMonth() + 1 === filterMonthNum;
      }),
    [shoppingLists, filterYear, filterMonthNum],
  );

  // ── Derived: month summary stats ────────────────────────────────────────────
  const monthStats = useMemo(() => {
    const totalItems = filteredLists.reduce((s, l) => s + l.totalItems, 0);
    const pendingItems = filteredLists.reduce((s, l) => s + (l.totalItems - l.purchasedItems), 0);
    const totalEstimated = filteredLists.reduce((s, l) => s + (l.totalEstimated ?? 0), 0);
    const totalPurchasedEstimated = filteredLists.reduce((s, l) => s + (l.totalSpent ?? 0), 0);
    return { totalItems, pendingItems, totalEstimated, totalPurchasedEstimated };
  }, [filteredLists]);

  // ── Derived: categories present in the detail ───────────────────────────────
  const categoriesInDetail = useMemo((): string[] => {
    if (!detailData) return [];
    const set = new Set<string>();
    detailData.items.forEach((i) => {
      if (i.categoryName) set.add(i.categoryName);
    });
    return Array.from(set);
  }, [detailData]);

  const groupedItems = useMemo(() => {
    if (!detailData) return {};
    const items = categoryFilter
      ? detailData.items.filter((i) => i.categoryName === categoryFilter)
      : detailData.items;
    return items.reduce<Record<string, AppShoppingItem[]>>((acc, item) => {
      const key = item.categoryName ?? 'Sem categoria';
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [detailData, categoryFilter]);

  // ── Handlers: list navigation ───────────────────────────────────────────────
  const openListDetail = useCallback(
    async (id: string) => {
      setSelectedListId(id);
      setIsLoadingDetail(true);
      setDetailData(null);
      setViewMode('detail');
      setCategoryFilter(null);
      try {
        const data = await loadShoppingListDetail(id);
        setDetailData(data);
      } catch {
        showError('Erro ao carregar lista.');
        setViewMode('lists');
        setSelectedListId(null);
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [loadShoppingListDetail, showError],
  );

  const backToLists = useCallback(() => {
    setViewMode('lists');
    setSelectedListId(null);
    setDetailData(null);
    setCategoryFilter(null);
  }, []);

  // ── Handlers: create list ───────────────────────────────────────────────────
  const handleCreateList = useCallback(
    async (data: ListFormData) => {
      await createShoppingList(data.name, toISOMonthYear(data.monthYear), data.notes || undefined);
      showSuccess('Lista criada!');
    },
    [createShoppingList, showSuccess],
  );

  // ── Handlers: edit list ─────────────────────────────────────────────────────
  const editListInitialData = useMemo((): ListFormData | undefined => {
    if (!detailData) return undefined;
    return {
      name: detailData.name,
      monthYear: fromISOMonthYear(detailData.monthYear),
      notes: detailData.notes ?? '',
    };
  }, [detailData]);

  const handleEditList = useCallback(
    async (data: ListFormData) => {
      if (!selectedListId) return;
      await updateShoppingList(selectedListId, data.name, toISOMonthYear(data.monthYear), data.notes || undefined);
      setDetailData((prev) =>
        prev
          ? { ...prev, name: data.name, monthYear: toISOMonthYear(data.monthYear), notes: data.notes || null }
          : prev,
      );
      showSuccess('Lista atualizada!');
    },
    [selectedListId, updateShoppingList, showSuccess],
  );

  // ── Handlers: delete list ───────────────────────────────────────────────────
  const handleDeleteList = useCallback(async () => {
    if (!selectedListId) return;
    setIsDeleting(true);
    try {
      await deleteShoppingList(selectedListId);
      showSuccess('Lista excluída!');
      backToLists();
    } catch {
      showError('Erro ao excluir lista.');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  }, [selectedListId, deleteShoppingList, backToLists, showSuccess, showError]);

  // ── Handlers: add item ──────────────────────────────────────────────────────
  const handleAddItem = useCallback(
    async (data: ItemFormData) => {
      if (!selectedListId) return;
      const newItem = await addShoppingItem(
        selectedListId,
        data.name,
        parseFloat(data.quantity) || 1,
        parseInt(data.unitType) || 0,
        data.categoryId || null,
        data.estimatedPrice ? parseFloat(data.estimatedPrice) : null,
        data.notes || null,
      );
      setDetailData((prev) => (prev ? { ...prev, items: [...prev.items, newItem] } : prev));
      showSuccess('Item adicionado!');
    },
    [selectedListId, addShoppingItem, showSuccess],
  );

  // ── Handlers: edit item ─────────────────────────────────────────────────────
  const editItemInitialData = useMemo((): ItemFormData | undefined => {
    if (!selectedItem) return undefined;
    return {
      name: selectedItem.name,
      quantity: String(selectedItem.quantity),
      unitType: String(selectedItem.unitType),
      categoryId: selectedItem.shoppingCategoryId ?? '',
      estimatedPrice: selectedItem.estimatedPrice != null ? String(selectedItem.estimatedPrice) : '',
      notes: selectedItem.notes ?? '',
    };
  }, [selectedItem]);

  const handleEditItem = useCallback(
    async (data: ItemFormData) => {
      if (!selectedItem || !selectedListId) return;
      await updateShoppingItem(
        selectedItem.shoppingItemId,
        selectedListId,
        data.name,
        parseFloat(data.quantity) || 1,
        parseInt(data.unitType) || 0,
        data.categoryId || null,
        data.estimatedPrice ? parseFloat(data.estimatedPrice) : null,
        data.notes || null,
      );
      const catName = shoppingCategories.find((c) => c.shoppingCategoryId === data.categoryId)?.name ?? null;
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === selectedItem.shoppingItemId
              ? {
                  ...i,
                  name: data.name,
                  quantity: parseFloat(data.quantity) || 1,
                  unitType: parseInt(data.unitType) || 0,
                  shoppingCategoryId: data.categoryId || null,
                  categoryName: catName,
                  estimatedPrice: data.estimatedPrice ? parseFloat(data.estimatedPrice) : null,
                  notes: data.notes || null,
                }
              : i,
          ),
        };
      });
      showSuccess('Item atualizado!');
    },
    [selectedItem, selectedListId, updateShoppingItem, shoppingCategories, showSuccess],
  );

  // ── Handlers: delete item ───────────────────────────────────────────────────
  const handleDeleteItem = useCallback(
    async (item: AppShoppingItem) => {
      try {
        await deleteShoppingItem(item.shoppingItemId, selectedListId!, item.quantity, item.unitType, item.estimatedPrice, item.isPurchased, item.price);
        setDetailData((prev) =>
          prev ? { ...prev, items: prev.items.filter((i) => i.shoppingItemId !== item.shoppingItemId) } : prev,
        );
        showSuccess('Item removido!');
      } catch {
        showError('Erro ao remover item.');
      }
    },
    [deleteShoppingItem, selectedListId, showSuccess, showError],
  );

  // ── Handlers: mark as purchased ─────────────────────────────────────────────
  const handleMarkAsPurchased = useCallback(
    async (data: PurchaseFormData) => {
      if (!selectedItem) return;
      const price = parseFloat(data.price) || 0;
      const purchasedAt = `${data.purchasedAt}T12:00:00Z`;
      await markItemAsPurchased(selectedItem.shoppingItemId, selectedListId!, selectedItem.quantity, selectedItem.unitType, price, purchasedAt);
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === selectedItem.shoppingItemId
              ? { ...i, isPurchased: true, price, purchasedAt }
              : i,
          ),
        };
      });
      showSuccess('Item marcado como comprado!');
    },
    [selectedItem, markItemAsPurchased, showSuccess],
  );

  // ── Handlers: unmark as purchased ───────────────────────────────────────────
  const handleUnmarkAsPurchased = useCallback(
    async (item: AppShoppingItem) => {
      await unmarkItemAsPurchased(item.shoppingItemId, selectedListId!, item.quantity, item.unitType, item.price ?? 0);
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.shoppingItemId === item.shoppingItemId
              ? { ...i, isPurchased: false, price: null, purchasedAt: null }
              : i,
          ),
        };
      });
      showSuccess('Item desmarcado como comprado.');
    },
    [selectedListId, unmarkItemAsPurchased, showSuccess],
  );

  // ── Render: lists view ──────────────────────────────────────────────────────
  if (viewMode === 'lists') {
    return (
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Listas de Compras</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Organize suas compras por lista e mês</p>
          </div>
          <Button className="gap-1.5 shrink-0" onClick={() => setShowCreateList(true)}>
            <Plus size={16} />
            Nova Lista
          </Button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterMonth((m) => addMonths(m, -1))}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[130px] text-center capitalize">
            {formatMonthYearShort(filterMonth)}
          </span>
          <button
            onClick={() => setFilterMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Month stats strip */}
        {filteredLists.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-3 text-center space-y-0.5">
              <p className="text-xs text-muted-foreground leading-tight">Listas</p>
              <p className="text-xl font-bold text-foreground">{filteredLists.length}</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center space-y-0.5">
              <p className="text-xs text-muted-foreground leading-tight">Itens pendentes</p>
              <p className="text-xl font-bold text-foreground">{monthStats.pendingItems}</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center space-y-0.5">
              <p className="text-xs text-muted-foreground leading-tight">Estimado</p>
              <p className="text-lg font-bold text-foreground truncate">
                {monthStats.totalEstimated > 0 ? formatCurrency(monthStats.totalEstimated) : '—'}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center space-y-0.5">
              <p className="text-xs text-muted-foreground leading-tight">Gasto</p>
              <p className="text-lg font-bold text-foreground truncate">
                {monthStats.totalPurchasedEstimated > 0 ? formatCurrency(monthStats.totalPurchasedEstimated) : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Lists grid */}
        {filteredLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Nenhuma lista em {formatMonthYearShort(filterMonth)}</p>
              <p className="text-sm text-muted-foreground mt-1">Crie uma lista para começar a organizar suas compras.</p>
            </div>
            <Button variant="outline" className="gap-1.5" onClick={() => setShowCreateList(true)}>
              <Plus size={15} />
              Criar lista
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredLists.map((list) => {
              const isComplete = list.totalItems > 0 && list.purchasedItems === list.totalItems;
              const isEmpty = list.totalItems === 0;
              return (
                <button
                  key={list.shoppingListId}
                  className="text-left p-5 rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 space-y-4 group"
                  onClick={() => openListDetail(list.shoppingListId)}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {list.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {formatMonthYearPT(list.monthYear)}
                      </p>
                    </div>
                    <Badge
                      variant={isComplete ? 'default' : 'secondary'}
                      className={cn(
                        'shrink-0 text-xs',
                        isComplete && 'bg-emerald-500 hover:bg-emerald-500 text-white',
                        isEmpty && 'text-muted-foreground',
                      )}
                    >
                      {isComplete ? 'Concluída' : isEmpty ? 'Vazia' : 'Em progresso'}
                    </Badge>
                  </div>

                  {/* Progress */}
                  {!isEmpty && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {list.purchasedItems}/{list.totalItems} comprados
                        </span>
                        <span>{list.totalItems > 0 ? Math.round((list.purchasedItems / list.totalItems) * 100) : 0}%</span>
                      </div>
                      <ProgressBar value={list.purchasedItems} max={list.totalItems} />
                    </div>
                  )}

                  {/* Financial */}
                  <div className="flex justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>
                      Estimado:{' '}
                      <span className="font-medium text-foreground">
                        {list.totalEstimated ? formatCurrency(list.totalEstimated) : '—'}
                      </span>
                    </span>
                    <span>
                      Gasto:{' '}
                      <span className={cn('font-medium', list.totalSpent ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground')}>
                        {list.totalSpent ? formatCurrency(list.totalSpent) : '—'}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <ListFormDialog
          open={showCreateList}
          onClose={() => setShowCreateList(false)}
          onSubmit={handleCreateList}
          title="Nova Lista de Compras"
        />
      </div>
    );
  }

  // ── Render: detail view ─────────────────────────────────────────────────────
  const summary = shoppingLists.find((l) => l.shoppingListId === selectedListId);
  const detailPurchasedItems = detailData?.items.filter((i) => i.isPurchased).length ?? 0;
  const detailTotalItems = detailData?.items.length ?? 0;
  const detailPct = detailTotalItems === 0 ? 0 : Math.round((detailPurchasedItems / detailTotalItems) * 100);

  return (
    <div className="space-y-5 max-w-full">
      {/* Breadcrumb toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={backToLists}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span>Listas</span>
          <span className="text-muted-foreground/50 mx-0.5">/</span>
          <span className="text-foreground font-semibold truncate max-w-40">
            {detailData?.name ?? '...'}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowCategories(true)}>
            <Tag size={13} />
            Categorias
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowEditList(true)}
            disabled={!detailData}
          >
            <Pencil size={13} />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-transparent px-2"
            onClick={() => setShowDeleteAlert(true)}
            title="Excluir lista"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {detailData && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-foreground">{detailData.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{formatMonthYearPT(detailData.monthYear)}</p>
              {detailData.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">{detailData.notes}</p>
              )}
            </div>
            <div className="text-right space-y-0.5 shrink-0">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground text-base">{detailPurchasedItems}</span>
                /{detailTotalItems} itens
              </p>
              {(summary?.totalEstimated ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Est. <span className="font-medium text-foreground">{formatCurrency(summary!.totalEstimated!)}</span>
                </p>
              )}
              {(summary?.totalSpent ?? 0) > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatCurrency(summary!.totalSpent!)} gastos
                </p>
              )}
            </div>
          </div>
          {detailTotalItems > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span className="font-medium">{detailPct}%</span>
              </div>
              <ProgressBar value={detailPurchasedItems} max={detailTotalItems} className="h-2" />
            </div>
          )}
        </div>
      )}

      {/* Category pills + Add button */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter(null)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
            categoryFilter === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
          )}
        >
          Todos
        </button>
        {categoriesInDetail.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
            )}
          >
            {cat}
          </button>
        ))}
        <Button
          size="sm"
          className="ml-auto gap-1.5 text-xs shrink-0"
          onClick={() => setShowAddItem(true)}
          disabled={!detailData}
        >
          <Plus size={14} />
          Adicionar Item
        </Button>
      </div>

      {/* Item list */}
      {isLoadingDetail ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-7 w-14" />
            </div>
          ))}
        </div>
      ) : detailData && detailData.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <ListChecks size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Lista vazia</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione o primeiro item para começar.</p>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={() => setShowAddItem(true)}>
            <Plus size={15} />
            Adicionar item
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {category}
                </span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {items.filter((i) => i.isPurchased).length}/{items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.shoppingItemId}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200',
                      item.isPurchased
                        ? 'bg-muted/30 border-border opacity-60'
                        : 'bg-card border-border hover:border-primary/30',
                    )}
                  >
                    {/* Checkbox / unmark button */}
                    {item.isPurchased ? (
                      <button
                        className="shrink-0 text-emerald-500 hover:text-amber-500 transition-colors rounded"
                        onClick={() => handleUnmarkAsPurchased(item)}
                        title="Desmarcar como comprado"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    ) : (
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => {
                          setSelectedItem(item);
                          setShowPurchase(true);
                        }}
                        className="shrink-0"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium text-foreground',
                          item.isPurchased && 'line-through text-muted-foreground',
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quantityLabel(item.quantity, item.unitType)}
                        {item.estimatedPrice != null && !item.isPurchased && (
                          <> · est. {formatCurrency(item.estimatedPrice)}</>
                        )}
                        {item.isPurchased && item.price != null && (
                          <> · pago {formatCurrency(item.price)}</>
                        )}
                      </p>
                    </div>

                    {/* Badge comprado */}
                    {item.isPurchased && (
                      <Badge variant="secondary" className="text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                        Comprado
                      </Badge>
                    )}

                    {/* Actions */}
                    {!item.isPurchased && (
                      <button
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowEditItem(true);
                        }}
                        title="Editar item"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {!item.isPurchased && (
                      <button
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        onClick={() => handleDeleteItem(item)}
                        title="Remover item"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ListFormDialog
        open={showEditList}
        onClose={() => setShowEditList(false)}
        initialData={editListInitialData}
        onSubmit={handleEditList}
        title="Editar Lista"
      />
      <ItemFormDialog
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        onSubmit={handleAddItem}
        title="Adicionar Item"
        categories={shoppingCategories}
      />
      <ItemFormDialog
        open={showEditItem}
        onClose={() => {
          setShowEditItem(false);
          setSelectedItem(null);
        }}
        initialData={editItemInitialData}
        onSubmit={handleEditItem}
        title="Editar Item"
        categories={shoppingCategories}
      />
      <MarkAsPurchasedDialog
        open={showPurchase}
        onClose={() => {
          setShowPurchase(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSubmit={handleMarkAsPurchased}
      />
      <ManageCategoriesDialog
        open={showCategories}
        onClose={() => setShowCategories(false)}
        categories={shoppingCategories}
        onCreateCategory={async (name) => {
          await createShoppingCategory(name);
          showSuccess('Categoria criada!');
        }}
        onDeleteCategory={async (id) => {
          await deleteShoppingCategory(id);
          showSuccess('Categoria excluída!');
        }}
      />

      {/* Delete list alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente a lista{' '}
              <span className="font-semibold text-foreground">{detailData?.name}</span> e todos os seus itens. Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

ShoppingList.displayName = 'ShoppingList';
export default ShoppingList;
