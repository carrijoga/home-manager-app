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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  Flame,
  ListChecks,
  MoreVertical,
  Pencil,
  Plus,
  Upload,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    <div className={cn('w-full h-1.5 bg-linen-300 dark:bg-muted rounded-full overflow-hidden', className)}>
      <div
        className="h-full bg-gradient-to-r from-terracotta-400 to-honey-400 rounded-full transition-all duration-[length:var(--dur-slow)]"
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
              maxLength={100}
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
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setData(initialData ?? emptyItemForm());
      setSaving(false);
      setCategoryOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories],
  );

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.shoppingCategoryId === data.categoryId)?.name ?? null,
    [categories, data.categoryId],
  );

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
              maxLength={150}
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
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className="w-full justify-between font-normal"
                >
                  <span className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedCategoryName ?? 'Sem categoria'}
                  </span>
                  <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M16 15l-4 4-4-4" /></svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__none__"
                        onSelect={() => {
                          setData((d) => ({ ...d, categoryId: '' }));
                          setCategoryOpen(false);
                        }}
                      >
                        Sem categoria
                      </CommandItem>
                      {sortedCategories.map((c) => (
                        <CommandItem
                          key={c.shoppingCategoryId}
                          value={c.name}
                          onSelect={() => {
                            setData((d) => ({ ...d, categoryId: c.shoppingCategoryId }));
                            setCategoryOpen(false);
                          }}
                        >
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            <CheckCircle2 className="text-sage-500" size={20} />
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
              variant="secondary"
              className="flex-1"
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
            maxLength={50}
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
    uploadShoppingItems,
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
  const [monthNavDir, setMonthNavDir] = useState<1 | -1>(1);
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
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // ── Bulk selection state ────────────────────────────────────────────────────
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const uniqueCategories = useMemo(() => {
    const map = new Map<string, { shoppingCategoryId: string; name: string; isDefault: boolean }>();
    shoppingCategories.forEach((c) => {
      if (!map.has(c.shoppingCategoryId)) {
        map.set(c.shoppingCategoryId, c);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [shoppingCategories]);

  const selectedItems = useMemo(
    () => detailData?.items.filter((i) => selectedItemIds.has(i.shoppingItemId)) ?? [],
    [detailData, selectedItemIds],
  );

  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false);
    setSelectedItemIds(new Set());
  }, []);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // suppress noUnusedLocals until tasks 3-7 wire these into JSX
  void showBulkEdit; void setShowBulkEdit;
  void showBulkDelete; void setShowBulkDelete;
  void selectedItems;
  void exitBulkMode;

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

  // derived from shoppingLists summary for lists-view context menu
  const editingListSummaryData = useMemo((): ListFormData | undefined => {
    if (!editingListId) return undefined;
    const s = shoppingLists.find((l) => l.shoppingListId === editingListId);
    if (!s) return undefined;
    return { name: s.name, monthYear: fromISOMonthYear(s.monthYear), notes: s.notes ?? '' };
  }, [editingListId, shoppingLists]);

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

  // ── Handlers: edit/delete list from lists view ──────────────────────────────
  const handleEditListFromGrid = useCallback(
    async (data: ListFormData) => {
      if (!editingListId) return;
      await updateShoppingList(editingListId, data.name, toISOMonthYear(data.monthYear), data.notes || undefined);
      showSuccess('Lista atualizada!');
      setEditingListId(null);
    },
    [editingListId, updateShoppingList, showSuccess],
  );

  const handleDeleteListFromGrid = useCallback(async () => {
    if (!editingListId) return;
    setIsDeleting(true);
    try {
      await deleteShoppingList(editingListId);
      showSuccess('Lista excluída!');
    } catch {
      showError('Erro ao excluir lista.');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
      setEditingListId(null);
    }
  }, [editingListId, deleteShoppingList, showSuccess, showError]);

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

  const handleUploadFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file || !selectedListId) return;
      setIsUploading(true);
      try {
        const detail = await uploadShoppingItems(selectedListId, file);
        setDetailData(detail);
        showSuccess('Itens importados!');
      } catch {
        showError('Erro ao importar itens.');
      } finally {
        setIsUploading(false);
      }
    },
    [selectedListId, uploadShoppingItems, showSuccess, showError],
  );

  // ── Render: lists view ──────────────────────────────────────────────────────
  if (viewMode === 'lists') {
    const cardIcons = [ShoppingCart, Flame, Sparkles] as const;
    const cardIconBgs = [
      'bg-honey-400/10 text-honey-400',
      'bg-terracotta-400/10 text-terracotta-400',
      'bg-sage-500/10 text-sage-500',
    ] as const;

    const activeLists = filteredLists.filter((l) => l.purchasedItems < l.totalItems || l.totalItems === 0).length;
    const totalItems = filteredLists.reduce((s, l) => s + l.totalItems, 0);
    const totalSpent = filteredLists.reduce((s, l) => s + (l.totalSpent ?? 0), 0);

    return (
      <motion.div
        key="lists"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        className="space-y-8 max-w-full pb-24"
      >
        {/* Editorial header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="border-l-4 border-honey-400 pl-7 space-y-1">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-honey-400">
              Lista de Compras
            </p>
            <div className="relative overflow-hidden" style={{ minHeight: '2.5rem' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h2
                  key={filterMonth}
                  initial={{ opacity: 0, x: monthNavDir * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: monthNavDir * -24, position: 'absolute' }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="font-display font-bold text-3xl text-foreground"
                >
                  {(() => { const s = formatMonthYearPT(filterMonth); return s.charAt(0).toUpperCase() + s.slice(1); })()}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.1 }}
              onClick={() => { setMonthNavDir(-1); setFilterMonth((m) => addMonths(m, -1)); }}
              className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <button
              onClick={() => { setMonthNavDir(1); setFilterMonth(currentMonthValue()); }}
              className="px-5 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Hoje
            </button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.1 }}
              onClick={() => { setMonthNavDir(1); setFilterMonth((m) => addMonths(m, 1)); }}
              className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Stats summary card */}
        {filteredLists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="rounded-2xl border border-border bg-card px-8 py-7 flex items-center justify-around gap-4"
          >
            <div className="flex-1 text-center space-y-1">
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">Gasto no Mês</p>
              <p className="text-2xl font-bold font-display text-honey-400 dark:text-honey-300">
                {totalSpent > 0 ? formatCurrency(totalSpent) : '—'}
              </p>
            </div>
            <div className="w-px h-12 bg-border shrink-0" />
            <div className="flex-1 text-center space-y-1">
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">Listas Ativas</p>
              <p className="text-2xl font-bold font-display" style={{ color: '#adc6ff' }}>
                {String(activeLists).padStart(2, '0')}
              </p>
            </div>
            <div className="w-px h-12 bg-border shrink-0" />
            <div className="flex-1 text-center space-y-1">
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">Items Totais</p>
              <p className="text-2xl font-bold font-display text-foreground">
                {totalItems}
              </p>
            </div>
          </motion.div>
        )}

        {/* Bento grid / empty state */}
        {filteredLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-honey-100 to-linen-200 dark:from-honey-900/30 dark:to-muted border border-honey-200/60 dark:border-honey-800/30 flex items-center justify-center">
              <ShoppingCart size={28} className="text-honey-600 dark:text-honey-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">Nenhuma lista em {formatMonthYearShort(filterMonth)}</p>
              <p className="text-sm text-muted-foreground mt-1">Use o botão + para criar uma lista.</p>
            </div>
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {filteredLists.map((list, idx) => {
              const isComplete = list.totalItems > 0 && list.purchasedItems === list.totalItems;
              const Icon = cardIcons[idx % 3];
              const iconBg = cardIconBgs[idx % 3];
              return (
                <motion.div
                  key={list.shoppingListId}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
                  }}
                  className="relative group"
                >
                  {/* 3-dots context menu */}
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button
                        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground peer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden hidden peer-focus:flex focus-within:flex flex-col z-20">
                        <button
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-accent transition-colors w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingListId(list.shoppingListId);
                            setShowEditList(true);
                          }}
                        >
                          <Pencil size={13} />
                          Editar
                        </button>
                        <button
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingListId(list.shoppingListId);
                            setShowDeleteAlert(true);
                          }}
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <button
                    className="w-full text-left bg-card border border-border rounded-3xl p-6 hover:border-honey-300 dark:hover:border-honey-700 hover:shadow-md transition-all duration-200 space-y-4"
                    onClick={() => openListDetail(list.shoppingListId)}
                  >
                    {/* Icon + badge */}
                    <div className="flex items-start justify-between">
                      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
                        <Icon size={20} />
                      </div>
                      {isComplete ? (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-xl bg-sage-500/15 text-sage-500">
                          Finalizada
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-3 py-1 rounded-xl" style={{ background: 'rgba(173,198,255,0.15)', color: '#adc6ff' }}>
                          Em aberto
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <p className="font-display font-bold text-xl text-foreground leading-snug">
                      {list.name}
                    </p>

                    {/* Notes */}
                    {list.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {list.notes}
                      </p>
                    )}

                    {/* Divider + footer stats */}
                    <div className="border-t border-border pt-5 grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">Itens</p>
                        <p className="text-base font-semibold text-foreground">{list.totalItems} produtos</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground">Total Est.</p>
                        <p className="text-base font-semibold text-foreground">
                          {list.totalEstimated ? formatCurrency(list.totalEstimated) : '—'}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Dialogs */}
        <ListFormDialog
          open={showCreateList}
          onClose={() => setShowCreateList(false)}
          onSubmit={handleCreateList}
          title="Nova Lista de Compras"
        />
        <ListFormDialog
          open={showEditList && !!editingListId}
          onClose={() => { setShowEditList(false); setEditingListId(null); }}
          onSubmit={handleEditListFromGrid}
          initialData={editingListSummaryData}
          title="Editar Lista"
        />
        <AlertDialog open={showDeleteAlert && !!editingListId} onOpenChange={(o) => { if (!o) { setShowDeleteAlert(false); setEditingListId(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita. Todos os itens serão removidos.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteListFromGrid} disabled={isDeleting}>
                {isDeleting ? 'Excluindo…' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Floating Action Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <div className="relative flex items-center">
            <span className="absolute right-[72px] whitespace-nowrap bg-card border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Nova Lista
            </span>
            <button
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: '#adc6ff' }}
              onClick={() => setShowCreateList(true)}
              aria-label="Nova Lista"
            >
              <Plus size={20} style={{ color: '#131313' }} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── Render: detail view ─────────────────────────────────────────────────────
  const summary = shoppingLists.find((l) => l.shoppingListId === selectedListId);
  const detailPurchasedItems = detailData?.items.filter((i) => i.isPurchased).length ?? 0;
  const detailTotalItems = detailData?.items.length ?? 0;
  const detailPct = detailTotalItems === 0 ? 0 : Math.round((detailPurchasedItems / detailTotalItems) * 100);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-5 max-w-full"
    >
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
                <p className="text-xs text-sage-600 dark:text-sage-400 font-medium">
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
              'px-3 py-1 rounded-full text-xs font-medium transition-colors border max-w-[120px] truncate',
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
            )}
            title={cat}
          >
            {cat}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5 text-xs shrink-0"
          onClick={() => uploadInputRef.current?.click()}
          disabled={!detailData || isUploading}
          title="Importar itens por arquivo"
        >
          <Upload size={14} />
          {isUploading ? 'Importando...' : 'Importar arquivo'}
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-xs shrink-0"
          onClick={() => setShowAddItem(true)}
          disabled={!detailData}
        >
          <Plus size={14} />
          Adicionar Item
        </Button>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleUploadFile}
        className="hidden"
      />

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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-honey-100 to-linen-200 dark:from-honey-900/30 dark:to-muted border border-honey-200/60 dark:border-honey-800/30 flex items-center justify-center">
            <ListChecks size={24} className="text-honey-600 dark:text-honey-400" />
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
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.shoppingItemId}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: item.isPurchased ? 0.6 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors duration-200',
                      item.isPurchased
                        ? 'bg-muted/30 border-border'
                        : isBulkMode && selectedItemIds.has(item.shoppingItemId)
                          ? 'bg-[rgba(120,160,255,0.08)] border-[#7ba0ff]'
                          : 'bg-card border-border hover:border-primary/30',
                    )}
                  >
                    {/* Bulk checkbox (bulk mode) or unmark button (purchased) */}
                    {isBulkMode && !item.isPurchased ? (
                      <Checkbox
                        checked={selectedItemIds.has(item.shoppingItemId)}
                        onCheckedChange={() => toggleItemSelection(item.shoppingItemId)}
                        className="shrink-0"
                      />
                    ) : item.isPurchased ? (
                      <button
                        className="shrink-0 text-sage-500 hover:text-honey-500 transition-colors rounded"
                        onClick={() => handleUnmarkAsPurchased(item)}
                        title="Desmarcar como comprado"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    ) : null}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium text-foreground',
                          item.isPurchased && 'line-through decoration-honey-500 text-muted-foreground',
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
                      <Badge variant="success" className="text-xs shrink-0">
                        Comprado
                      </Badge>
                    )}

                    {/* Actions — hidden in bulk mode */}
                    {!item.isPurchased && !isBulkMode && (
                      <button
                        className="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
                        style={{
                          background: 'rgba(130,200,130,0.12)',
                          color: '#5a9a6a',
                          borderColor: 'rgba(130,200,130,0.35)',
                        }}
                        onClick={() => {
                          setSelectedItem(item);
                          setShowPurchase(true);
                        }}
                        title="Marcar como comprado"
                      >
                        ✓ Comprado
                      </button>
                    )}
                    {!item.isPurchased && !isBulkMode && (
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
                    {!item.isPurchased && !isBulkMode && (
                      <button
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        onClick={() => handleDeleteItem(item)}
                        title="Remover item"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
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
        categories={uniqueCategories}
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
        categories={uniqueCategories}
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
        categories={uniqueCategories}
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
    </motion.div>
  );
});

ShoppingList.displayName = 'ShoppingList';
export default ShoppingList;
