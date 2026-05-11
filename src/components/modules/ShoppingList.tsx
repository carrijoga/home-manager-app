import { formatCurrency } from '@utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  ListChecks,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { ShoppingListSkeleton } from '@/components/skeletons';
import { Spinner } from '@/components/ui/spinner';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem, AppShoppingList } from '@/types';

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
  return new Date(isoStr).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
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

const emptyListForm = (): ListFormData => ({
  name: '',
  monthYear: currentMonthValue(),
  notes: '',
});
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

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div
      className={cn(
        'h-1.5 w-full overflow-hidden rounded-full bg-linen-300 dark:bg-muted',
        className
      )}
    >
      <div
        className="duration-[length:var(--dur-slow)] h-full rounded-full bg-gradient-to-r from-terracotta-400 to-honey-400 transition-all"
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
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
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
function ItemFormDialog({
  open,
  onClose,
  initialData,
  onSubmit,
  title,
  categories,
}: ItemFormDialogProps) {
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
    [categories]
  );

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.shoppingCategoryId === data.categoryId)?.name ?? null,
    [categories, data.categoryId]
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
              <Select
                value={data.unitType}
                onValueChange={(v) => setData((d) => ({ ...d, unitType: v }))}
              >
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
                  <span
                    className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}
                  >
                    {selectedCategoryName ?? 'Sem categoria'}
                  </span>
                  <svg
                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 9l4-4 4 4M16 15l-4 4-4-4"
                    />
                  </svg>
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
                            setData((d) => ({
                              ...d,
                              categoryId: c.shoppingCategoryId,
                            }));
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
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
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
          <div className="pb-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.name}</span>
            {' — '}
            {quantityLabel(item.quantity, item.unitType)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="purchase-price">
              Preço pago (R$) <span className="text-xs text-muted-foreground">(opcional)</span>
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
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
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
  categories: Array<{
    shoppingCategoryId: string;
    name: string;
    isDefault: boolean;
  }>;
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
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col">
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

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Categorias personalizadas */}
          {customCats.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Personalizadas
              </p>
              {customCats.map((c) => (
                <div
                  key={c.shoppingCategoryId}
                  className="bg-muted/50 group flex items-center justify-between rounded-lg px-3 py-2"
                >
                  <span className="text-sm">{c.name}</span>
                  <button
                    onClick={() => handleDelete(c.shoppingCategoryId)}
                    disabled={deletingId === c.shoppingCategoryId}
                    className="text-muted-foreground opacity-0 transition-colors hover:text-destructive disabled:opacity-40 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {customCats.length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">
              Nenhuma categoria personalizada ainda.
            </p>
          )}

          {/* Categorias padrão */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Padrão do sistema
            </p>
            <div className="flex flex-wrap gap-1.5">
              {defaultCats.map((c) => (
                <Badge
                  key={c.shoppingCategoryId}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button variant="outline" className="mt-2 w-full" onClick={onClose}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── BulkEditDialog ───────────────────────────────────────────────────────────

interface BulkEditPatch {
  quantity?: number;
  unitType?: number;
  categoryId?: string | null;
  estimatedPrice?: number;
}

interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: AppShoppingItem[];
  categories: Array<{ shoppingCategoryId: string; name: string }>;
  onSubmit: (patch: BulkEditPatch) => Promise<void>;
}

function BulkEditDialog({
  open,
  onClose,
  selectedItems,
  categories,
  onSubmit,
}: BulkEditDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [unitType, setUnitType] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity('');
      setUnitType('');
      setCategoryId('');
      setEstimatedPrice('');
      setCategoryOpen(false);
      setSaving(false);
    }
  }, [open]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [categories]
  );

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.shoppingCategoryId === categoryId)?.name ?? null,
    [categories, categoryId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch: BulkEditPatch = {};
    if (quantity !== '') patch.quantity = parseFloat(quantity);
    if (unitType !== '') patch.unitType = parseInt(unitType);
    if (categoryId === '__clear__') patch.categoryId = null;
    else if (categoryId !== '') patch.categoryId = categoryId;
    if (estimatedPrice !== '') patch.estimatedPrice = parseFloat(estimatedPrice);
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(patch);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const previewNames = selectedItems.slice(0, 3).map((i) => i.name);
  const overflow = selectedItems.length - 3;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar itens selecionados ({selectedItems.length})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <p className="border-primary/20 bg-primary/5 rounded-lg border px-3 py-2 text-xs text-muted-foreground">
            Apenas os campos preenchidos serão alterados. Campos em branco não serão modificados.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bulk-qty">Quantidade</Label>
              <Input
                id="bulk-qty"
                type="number"
                min="0.001"
                step="any"
                placeholder="Ex: 2"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Select value={unitType} onValueChange={setUnitType}>
                <SelectTrigger>
                  <SelectValue placeholder="— sem alteração —" />
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
                  <span
                    className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}
                  >
                    {categoryId === '__clear__'
                      ? 'Remover categoria'
                      : (selectedCategoryName ?? '— sem alteração —')}
                  </span>
                  <svg
                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 9l4-4 4 4M16 15l-4 4-4-4"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__clear__"
                        onSelect={() => {
                          setCategoryId('__clear__');
                          setCategoryOpen(false);
                        }}
                      >
                        Remover categoria
                      </CommandItem>
                      {sortedCategories.map((c) => (
                        <CommandItem
                          key={c.shoppingCategoryId}
                          value={c.name}
                          onSelect={() => {
                            setCategoryId(c.shoppingCategoryId);
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
            <Label htmlFor="bulk-price">Preço estimado (R$)</Label>
            <Input
              id="bulk-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
          </div>

          {/* Affected items */}
          <div className="bg-muted/30 space-y-1 rounded-lg border border-border px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Itens afetados
            </p>
            {previewNames.map((name) => (
              <p key={name} className="flex items-center gap-1.5 text-xs text-foreground">
                <span className="text-primary">•</span>
                {name}
              </p>
            ))}
            {overflow > 0 && (
              <p className="text-xs italic text-muted-foreground">
                e mais +{overflow} {overflow === 1 ? 'item' : 'itens'}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// ── SwipeableItem ────────────────────────────────────────────────────────────────

interface SwipeableItemProps {
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

function SwipeableItem({ onEdit, onDelete, children }: SwipeableItemProps) {
  const REVEAL = 112;
  const offsetRef = useRef(0);
  const startXRef = useRef<number | null>(null);
  const isSettled = useRef(true); // false while finger is down
  const rowRef = useRef<HTMLDivElement>(null);

  const applyTransform = (px: number, animated: boolean) => {
    if (!rowRef.current) return;
    rowRef.current.style.transition = animated
      ? 'transform 0.35s cubic-bezier(0.22,1,0.36,1)'
      : 'none';
    rowRef.current.style.transform = `translateX(${px}px)`;
    offsetRef.current = px;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isSettled.current = false;
    applyTransform(offsetRef.current, false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const next = Math.max(-REVEAL, Math.min(0, offsetRef.current + dx));
    // update startX so delta is incremental
    startXRef.current = e.touches[0].clientX;
    applyTransform(next, false);
  };

  const handleTouchEnd = () => {
    isSettled.current = true;
    startXRef.current = null;
    applyTransform(offsetRef.current < -REVEAL / 2 ? -REVEAL : 0, true);
  };

  const close = () => applyTransform(0, true);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe actions — behind the row, mobile only */}
      <div className="absolute inset-y-0 right-0 flex sm:hidden" style={{ width: REVEAL }}>
        <button
          className="bg-primary/15 active:bg-primary/25 flex flex-1 flex-col items-center justify-center gap-0.5 text-primary transition-colors"
          onClick={() => {
            close();
            onEdit();
          }}
        >
          <Pencil size={15} />
          <span className="text-[10px] font-semibold">Editar</span>
        </button>
        <button
          className="bg-destructive/15 active:bg-destructive/25 flex flex-1 flex-col items-center justify-center gap-0.5 text-destructive transition-colors"
          onClick={() => {
            close();
            onDelete();
          }}
        >
          <Trash2 size={15} />
          <span className="text-[10px] font-semibold">Excluir</span>
        </button>
      </div>

      {/* Row — solid bg so it fully covers the actions beneath when at rest */}
      <div
        ref={rowRef}
        className="relative bg-background"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (offsetRef.current !== 0) close();
        }}
      >
        {children}
      </div>
    </div>
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
  const [sortOrder, setSortOrder] = useState<'name' | 'count' | 'purchased'>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const isSearchPending = searchTerm !== debouncedSearch;
  const [pendingId, setPendingId] = useState<string | null>(null);

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
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const categoryDragRef = useRef({ startX: 0, scrollLeft: 0, isDragging: false });

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
    [detailData, selectedItemIds]
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

  const scrollCategories = useCallback((dir: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const amount = Math.max(160, el.clientWidth * 0.6);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  const handleCategoryPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (window.matchMedia('(min-width: 768px)').matches) return;
      categoryDragRef.current.isDragging = true;
      categoryDragRef.current.startX = e.clientX;
      categoryDragRef.current.scrollLeft = e.currentTarget.scrollLeft;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    []
  );

  const handleCategoryPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!categoryDragRef.current.isDragging) return;
      const dx = e.clientX - categoryDragRef.current.startX;
      e.currentTarget.scrollLeft = categoryDragRef.current.scrollLeft - dx;
    },
    []
  );

  const handleCategoryPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!categoryDragRef.current.isDragging) return;
    categoryDragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // ── Derived: filtered lists ─────────────────────────────────────────────────
  const [filterYear, filterMonthNum] = filterMonth.split('-').map(Number);
  const filteredLists = useMemo(
    () =>
      shoppingLists.filter((l) => {
        const d = new Date(l.monthYear);
        return d.getUTCFullYear() === filterYear && d.getUTCMonth() + 1 === filterMonthNum;
      }),
    [shoppingLists, filterYear, filterMonthNum]
  );

  // ── Derived: categories present in the detail ───────────────────────────────
  const categoriesInDetail = useMemo((): string[] => {
    if (!detailData) return [];
    const set = new Set<string>();
    detailData.items.forEach((i) => {
      if (i.categoryName) set.add(i.categoryName);
    });
    return Array.from(set).sort((a, b) => {
      if (a === 'Sem categoria') return 1;
      if (b === 'Sem categoria') return -1;
      return a.localeCompare(b, 'pt-BR');
    });
  }, [detailData]);

  const groupedItems = useMemo(() => {
    if (!detailData) return {};
    let items = categoryFilter
      ? detailData.items.filter((i) => i.categoryName === categoryFilter)
      : detailData.items;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    return items.reduce<Record<string, AppShoppingItem[]>>((acc, item) => {
      const key = item.categoryName ?? 'Sem categoria';
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [detailData, categoryFilter, debouncedSearch]);

  const groupedItemEntries = useMemo(() => {
    const entries = Object.entries(groupedItems);
    switch (sortOrder) {
      case 'name':
        return entries.sort(([a], [b]) => {
          if (a === 'Sem categoria') return 1;
          if (b === 'Sem categoria') return -1;
          return a.localeCompare(b, 'pt-BR');
        });
      case 'count':
        return entries.sort(([, a], [, b]) => b.length - a.length);
      case 'purchased':
        return entries.sort(([, a], [, b]) => {
          const unpurchasedA = a.filter((i) => !i.isPurchased).length;
          const unpurchasedB = b.filter((i) => !i.isPurchased).length;
          return unpurchasedB - unpurchasedA;
        });
    }
  }, [groupedItems, sortOrder]);

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
    [loadShoppingListDetail, showError]
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
    [createShoppingList, showSuccess]
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
    return {
      name: s.name,
      monthYear: fromISOMonthYear(s.monthYear),
      notes: s.notes ?? '',
    };
  }, [editingListId, shoppingLists]);

  const handleEditList = useCallback(
    async (data: ListFormData) => {
      if (!selectedListId) return;
      await updateShoppingList(
        selectedListId,
        data.name,
        toISOMonthYear(data.monthYear),
        data.notes || undefined
      );
      setDetailData((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              monthYear: toISOMonthYear(data.monthYear),
              notes: data.notes || null,
            }
          : prev
      );
      showSuccess('Lista atualizada!');
    },
    [selectedListId, updateShoppingList, showSuccess]
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
      await updateShoppingList(
        editingListId,
        data.name,
        toISOMonthYear(data.monthYear),
        data.notes || undefined
      );
      showSuccess('Lista atualizada!');
      setEditingListId(null);
    },
    [editingListId, updateShoppingList, showSuccess]
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
        data.notes || null
      );
      setDetailData((prev) => (prev ? { ...prev, items: [...prev.items, newItem] } : prev));
      showSuccess('Item adicionado!');
    },
    [selectedListId, addShoppingItem, showSuccess]
  );

  // ── Handlers: edit item ─────────────────────────────────────────────────────
  const editItemInitialData = useMemo((): ItemFormData | undefined => {
    if (!selectedItem) return undefined;
    return {
      name: selectedItem.name,
      quantity: String(selectedItem.quantity),
      unitType: String(selectedItem.unitType),
      categoryId: selectedItem.shoppingCategoryId ?? '',
      estimatedPrice:
        selectedItem.estimatedPrice != null ? String(selectedItem.estimatedPrice) : '',
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
        data.notes || null
      );
      const catName =
        shoppingCategories.find((c) => c.shoppingCategoryId === data.categoryId)?.name ?? null;
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
              : i
          ),
        };
      });
      showSuccess('Item atualizado!');
    },
    [selectedItem, selectedListId, updateShoppingItem, shoppingCategories, showSuccess]
  );

  // ── Handlers: delete item ───────────────────────────────────────────────────
  const handleDeleteItem = useCallback(
    async (item: AppShoppingItem) => {
      setPendingId(item.shoppingItemId);
      try {
        await deleteShoppingItem(
          item.shoppingItemId,
          selectedListId!,
          item.quantity,
          item.unitType,
          item.estimatedPrice,
          item.isPurchased,
          item.price
        );
        setDetailData((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((i) => i.shoppingItemId !== item.shoppingItemId),
              }
            : prev
        );
        showSuccess('Item removido!');
      } catch {
        showError('Erro ao remover item.');
      } finally {
        setPendingId(null);
      }
    },
    [deleteShoppingItem, selectedListId, showSuccess, showError]
  );

  // ── Handlers: mark as purchased ─────────────────────────────────────────────
  const handleMarkAsPurchased = useCallback(
    async (data: PurchaseFormData) => {
      if (!selectedItem) return;
      const price = parseFloat(data.price) || 0;
      const purchasedAt = `${data.purchasedAt}T12:00:00Z`;
      setPendingId(selectedItem.shoppingItemId);
      try {
        await markItemAsPurchased(
          selectedItem.shoppingItemId,
          selectedListId!,
          selectedItem.quantity,
          selectedItem.unitType,
          price,
          purchasedAt
        );
        setDetailData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.shoppingItemId === selectedItem.shoppingItemId
                ? { ...i, isPurchased: true, price, purchasedAt }
                : i
            ),
          };
        });
        showSuccess('Item marcado como comprado!');
      } catch {
        // AppContext handles revert; toast is shown by useToastNotifications
      } finally {
        setPendingId(null);
      }
    },
    [selectedItem, markItemAsPurchased, selectedListId, showSuccess]
  );

  // ── Handlers: unmark as purchased ───────────────────────────────────────────
  const handleUnmarkAsPurchased = useCallback(
    async (item: AppShoppingItem) => {
      setPendingId(item.shoppingItemId);
      try {
        await unmarkItemAsPurchased(
          item.shoppingItemId,
          selectedListId!,
          item.quantity,
          item.unitType,
          item.price ?? 0
        );
        setDetailData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.shoppingItemId === item.shoppingItemId
                ? { ...i, isPurchased: false, price: null, purchasedAt: null }
                : i
            ),
          };
        });
        showSuccess('Item desmarcado como comprado.');
      } catch {
        // AppContext handles revert; toast is shown by useToastNotifications
      } finally {
        setPendingId(null);
      }
    },
    [selectedListId, unmarkItemAsPurchased, showSuccess]
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
    [selectedListId, uploadShoppingItems, showSuccess, showError]
  );

  const handleBulkEdit = useCallback(
    async (patch: BulkEditPatch) => {
      for (const item of selectedItems) {
        await updateShoppingItem(
          item.shoppingItemId,
          selectedListId!,
          item.name,
          patch.quantity ?? item.quantity,
          patch.unitType ?? item.unitType,
          'categoryId' in patch ? (patch.categoryId ?? null) : (item.shoppingCategoryId ?? null),
          patch.estimatedPrice ?? item.estimatedPrice ?? null,
          item.notes ?? null
        );
      }
      const catMap = new Map(shoppingCategories.map((c) => [c.shoppingCategoryId, c.name]));
      setDetailData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((i) => {
            if (!selectedItemIds.has(i.shoppingItemId)) return i;
            const newCategoryId =
              'categoryId' in patch ? (patch.categoryId ?? null) : (i.shoppingCategoryId ?? null);
            return {
              ...i,
              quantity: patch.quantity ?? i.quantity,
              unitType: patch.unitType ?? i.unitType,
              shoppingCategoryId: newCategoryId,
              categoryName: newCategoryId ? (catMap.get(newCategoryId) ?? null) : null,
              estimatedPrice: patch.estimatedPrice ?? i.estimatedPrice,
            };
          }),
        };
      });
      showSuccess(
        `${selectedItems.length} ${selectedItems.length === 1 ? 'item atualizado' : 'itens atualizados'}!`
      );
      exitBulkMode();
    },
    [
      selectedItems,
      selectedItemIds,
      selectedListId,
      updateShoppingItem,
      shoppingCategories,
      showSuccess,
      exitBulkMode,
    ]
  );

  const handleBulkDelete = useCallback(async () => {
    for (const item of selectedItems) {
      await deleteShoppingItem(
        item.shoppingItemId,
        selectedListId!,
        item.quantity,
        item.unitType,
        item.estimatedPrice,
        item.isPurchased,
        item.price
      );
    }
    const deletedIds = new Set(selectedItems.map((i) => i.shoppingItemId));
    setDetailData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((i) => !deletedIds.has(i.shoppingItemId)),
          }
        : prev
    );
    showSuccess(
      `${selectedItems.length} ${selectedItems.length === 1 ? 'item excluído' : 'itens excluídos'}!`
    );
    exitBulkMode();
  }, [selectedItems, selectedListId, deleteShoppingItem, showSuccess, exitBulkMode]);

  // ── Render: lists view ──────────────────────────────────────────────────────
  if (viewMode === 'lists') {
    const cardIcons = [ShoppingCart, Flame, Sparkles] as const;
    const cardIconBgs = [
      'bg-honey-400/10 text-honey-400',
      'bg-terracotta-400/10 text-terracotta-400',
      'bg-sage-500/10 text-sage-500',
    ] as const;

    const activeLists = filteredLists.filter(
      (l) => l.purchasedItems < l.totalItems || l.totalItems === 0
    ).length;
    const totalItems = filteredLists.reduce((s, l) => s + l.totalItems, 0);
    const totalSpent = filteredLists.reduce((s, l) => s + (l.totalSpent ?? 0), 0);

    return (
      <motion.div
        key="lists"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        className="max-w-full space-y-8 pb-24"
      >
        {/* Editorial header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1 border-l-4 border-honey-400 pl-7">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-honey-400">
              Lista de Compras
            </p>
            <div className="relative overflow-hidden" style={{ minHeight: '2.5rem' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.h2
                  key={filterMonth}
                  initial={{ opacity: 0, x: monthNavDir * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: monthNavDir * -24,
                    position: 'absolute',
                  }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="font-display text-3xl font-bold text-foreground"
                >
                  {(() => {
                    const s = formatMonthYearPT(filterMonth);
                    return s.charAt(0).toUpperCase() + s.slice(1);
                  })()}
                </motion.h2>
              </AnimatePresence>
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.1 }}
              onClick={() => {
                setMonthNavDir(-1);
                setFilterMonth((m) => addMonths(m, -1));
              }}
              className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <button
              onClick={() => {
                setMonthNavDir(1);
                setFilterMonth(currentMonthValue());
              }}
              className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Hoje
            </button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              transition={{ duration: 0.1 }}
              onClick={() => {
                setMonthNavDir(1);
                setFilterMonth((m) => addMonths(m, 1));
              }}
              className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
            className="flex items-center justify-around gap-4 rounded-2xl border border-border bg-card px-8 py-7"
          >
            <div className="flex-1 space-y-1 text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Gasto no Mês
              </p>
              <p className="font-display text-2xl font-bold text-honey-400 dark:text-honey-300">
                {totalSpent > 0 ? formatCurrency(totalSpent) : '—'}
              </p>
            </div>
            <div className="h-12 w-px shrink-0 bg-border" />
            <div className="flex-1 space-y-1 text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Listas Ativas
              </p>
              <p className="font-display text-2xl font-bold" style={{ color: '#adc6ff' }}>
                {String(activeLists).padStart(2, '0')}
              </p>
            </div>
            <div className="h-12 w-px shrink-0 bg-border" />
            <div className="flex-1 space-y-1 text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Items Totais
              </p>
              <p className="font-display text-2xl font-bold text-foreground">{totalItems}</p>
            </div>
          </motion.div>
        )}

        {/* Bento grid / empty state */}
        {filteredLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-honey-200/60 bg-gradient-to-br from-honey-100 to-linen-200 dark:border-honey-800/30 dark:from-honey-900/30 dark:to-muted">
              <ShoppingCart size={28} className="text-honey-600 dark:text-honey-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Nenhuma lista em {formatMonthYearShort(filterMonth)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use o botão + para criar uma lista.
              </p>
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
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
                    },
                  }}
                  className="group relative"
                >
                  {/* 3-dots context menu */}
                  <div className="absolute right-4 top-4 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="relative">
                      <button
                        className="peer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg focus-within:flex peer-focus:flex">
                        <button
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
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
                          className="hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive transition-colors"
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
                    className="w-full space-y-4 rounded-3xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-honey-300 hover:shadow-md dark:hover:border-honey-700"
                    onClick={() => openListDetail(list.shoppingListId)}
                  >
                    {/* Icon + badge */}
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                          iconBg
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      {isComplete ? (
                        <span className="rounded-xl bg-sage-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500">
                          Finalizada
                        </span>
                      ) : (
                        <span
                          className="rounded-xl px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
                          style={{
                            background: 'rgba(173,198,255,0.15)',
                            color: '#adc6ff',
                          }}
                        >
                          Em aberto
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <p className="font-display text-xl font-bold leading-snug text-foreground">
                      {list.name}
                    </p>

                    {/* Notes */}
                    {list.notes && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {list.notes}
                      </p>
                    )}

                    {/* Divider + footer stats */}
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Itens
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {list.totalItems} produtos
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Total Est.
                        </p>
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
          onClose={() => {
            setShowEditList(false);
            setEditingListId(null);
          }}
          onSubmit={handleEditListFromGrid}
          initialData={editingListSummaryData}
          title="Editar Lista"
        />
        <AlertDialog
          open={showDeleteAlert && !!editingListId}
          onOpenChange={(o) => {
            if (!o) {
              setShowDeleteAlert(false);
              setEditingListId(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir lista?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os itens serão removidos.
              </AlertDialogDescription>
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
          className="group fixed bottom-6 right-6 z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute right-[72px] whitespace-nowrap rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Nova Lista
            </span>
            <button
              className="flex h-16 w-16 items-center justify-center rounded-xl shadow-2xl"
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
  const detailPct =
    detailTotalItems === 0 ? 0 : Math.round((detailPurchasedItems / detailTotalItems) * 100);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-full space-y-5"
    >
      {/* Breadcrumb toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={backToLists}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span>Listas</span>
          <span className="text-muted-foreground/50 mx-0.5">/</span>
          <span className="max-w-40 truncate font-semibold text-foreground">
            {detailData?.name ?? '...'}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowCategories(true)}
          >
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
            Editar Lista
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-destructive/10 border-transparent px-2 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteAlert(true)}
            title="Excluir lista"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {detailData && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{detailData.name}</h2>
              <p className="text-sm capitalize text-muted-foreground">
                {formatMonthYearPT(detailData.monthYear)}
              </p>
              {detailData.notes && (
                <p className="mt-1 text-xs italic text-muted-foreground">{detailData.notes}</p>
              )}
            </div>
            <div className="shrink-0 space-y-0.5 text-right">
              <p className="text-sm text-muted-foreground">
                <span className="text-base font-bold text-foreground">{detailPurchasedItems}</span>/
                {detailTotalItems} itens
              </p>
              {(summary?.totalEstimated ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Est.{' '}
                  <span className="font-medium text-foreground">
                    {formatCurrency(summary!.totalEstimated!)}
                  </span>
                </p>
              )}
              {(summary?.totalSpent ?? 0) > 0 && (
                <p className="text-xs font-medium text-sage-600 dark:text-sage-400">
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

      {/* Toolbar — normal or bulk mode */}
      {isBulkMode ? (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(120,160,255,0.2)] bg-[rgba(120,160,255,0.07)] px-1 py-1">
          <span className="px-2 text-sm font-semibold text-[#7ba0ff]">
            {selectedItems.length} selecionado
            {selectedItems.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0 text-xs"
            onClick={exitBulkMode}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Row 1: categories + actions */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
              <button
                className="hidden rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
                onClick={() => scrollCategories('left')}
                aria-label="Categorias anteriores"
              >
                <ChevronLeft size={14} />
              </button>
              <div
                ref={categoryScrollRef}
                className="scrollbar-hide flex w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto scroll-smooth whitespace-nowrap touch-pan-x"
                onPointerDown={handleCategoryPointerDown}
                onPointerMove={handleCategoryPointerMove}
                onPointerUp={handleCategoryPointerUp}
                onPointerLeave={handleCategoryPointerUp}
              >
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    categoryFilter === null
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:border-primary/40 border-border bg-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  Todos
                </button>
                {categoriesInDetail.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      categoryFilter === cat
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:border-primary/40 border-border bg-transparent text-muted-foreground hover:text-foreground'
                    )}
                    title={cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                className="hidden rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
                onClick={() => scrollCategories('right')}
                aria-label="Proximas categorias"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="ml-auto shrink-0 gap-1.5 text-xs"
                onClick={() => uploadInputRef.current?.click()}
                disabled={!detailData || isUploading}
                title="Importar itens por arquivo"
              >
                <Upload size={14} />
                {isUploading ? 'Importando...' : 'Importar arquivo'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 text-xs"
                onClick={() => setIsBulkMode(true)}
                disabled={!detailData}
              >
                <ListChecks size={14} />
                Selecionar
              </Button>
              <Button
                size="sm"
                className="shrink-0 gap-1.5 text-xs"
                onClick={() => setShowAddItem(true)}
                disabled={!detailData}
              >
                <Plus size={14} />
                Adicionar Item
              </Button>
            </div>
          </div>

          {/* Row 2: sort control */}
          <div className="flex items-center justify-end gap-2">
            <ArrowUpDown size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ordenar por</span>
            <div className="flex gap-1">
              {(
                [
                  { value: 'name', label: 'Nome' },
                  { value: 'count', label: 'Qtd. itens' },
                  { value: 'purchased', label: 'Não comprados' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSortOrder(value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    sortOrder === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <input
        ref={uploadInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleUploadFile}
        className="hidden"
      />

      {/* Search input */}
      {!isBulkMode && (
        <div className="relative flex items-center">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar itens..."
            className="pr-8"
          />
          {isSearchPending && (
            <span className="pointer-events-none absolute right-2 flex items-center">
              <Spinner size="sm" className="text-muted-foreground" />
            </span>
          )}
        </div>
      )}

      {/* Item list */}
      {isLoadingDetail ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
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
        <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-honey-200/60 bg-gradient-to-br from-honey-100 to-linen-200 dark:border-honey-800/30 dark:from-honey-900/30 dark:to-muted">
            <ListChecks size={24} className="text-honey-600 dark:text-honey-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">Lista vazia</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adicione o primeiro item para começar.
            </p>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={() => setShowAddItem(true)}>
            <Plus size={15} />
            Adicionar item
          </Button>
        </div>
      ) : isSearchPending ? (
        <ShoppingListSkeleton items={4} />
      ) : (
        <div className="space-y-6">
          {groupedItemEntries.map(([category, items]) => (
            <div key={category}>
              <div className="mb-2 flex items-center gap-2">
                {isBulkMode &&
                  (() => {
                    const unpurchased = items.filter((i) => !i.isPurchased);
                    if (unpurchased.length === 0) return null;
                    const allSelected = unpurchased.every((i) =>
                      selectedItemIds.has(i.shoppingItemId)
                    );
                    const someSelected = unpurchased.some((i) =>
                      selectedItemIds.has(i.shoppingItemId)
                    );
                    return (
                      <Checkbox
                        checked={allSelected}
                        data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                        onCheckedChange={(checked) => {
                          setSelectedItemIds((prev) => {
                            const next = new Set(prev);
                            unpurchased.forEach((i) => {
                              if (checked) next.add(i.shoppingItemId);
                              else next.delete(i.shoppingItemId);
                            });
                            return next;
                          });
                        }}
                        className="shrink-0"
                      />
                    );
                  })()}
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {category}
                </span>
                <div className="h-px flex-1 bg-border" />
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
                      animate={{ opacity: item.isPurchased ? 0.55 : 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                    >
                      {item.isPurchased ? (
                        /* Purchased row — inert, just badge + undo */
                        <div
                          className={cn(
                            'flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors duration-200',
                            isBulkMode && selectedItemIds.has(item.shoppingItemId)
                              ? 'border-[#7ba0ff] bg-[rgba(120,160,255,0.08)]'
                              : 'bg-muted/30 border-border'
                          )}
                        >
                          {/* Filled checkmark */}
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-500/80">
                            <CheckCircle2 size={13} className="text-white" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-muted-foreground line-through decoration-honey-500/60">
                              {item.name}
                            </p>
                            <p className="text-muted-foreground/70 text-xs">
                              {quantityLabel(item.quantity, item.unitType)}
                              {item.price != null && <> · pago {formatCurrency(item.price)}</>}
                            </p>
                          </div>

                          {/* Badge + undo */}
                          {!isBulkMode && (
                            <div className="flex shrink-0 items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full border border-sage-500/30 bg-sage-500/15 px-2 py-0.5 text-[11px] font-semibold text-sage-600 dark:text-sage-400">
                                Comprado
                              </span>
                              <button
                                className="text-muted-foreground/50 hover:bg-destructive/10 shrink-0 touch-manipulation rounded-lg p-1.5 transition-all duration-150 hover:text-destructive active:scale-90 disabled:pointer-events-none disabled:opacity-50"
                                onClick={() => handleUnmarkAsPurchased(item)}
                                title="Desfazer compra"
                                disabled={pendingId === item.shoppingItemId}
                              >
                                {pendingId === item.shoppingItemId ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <RotateCcw size={13} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : isBulkMode ? (
                        <div
                          className={cn(
                            'flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors duration-200',
                            selectedItemIds.has(item.shoppingItemId)
                              ? 'border-[#7ba0ff] bg-[rgba(120,160,255,0.08)]'
                              : 'bg-card border-border'
                          )}
                        >
                          {/* Bulk checkbox */}
                          <Checkbox
                            checked={selectedItemIds.has(item.shoppingItemId)}
                            onCheckedChange={() => toggleItemSelection(item.shoppingItemId)}
                            className="shrink-0"
                          />

                          {/* Empty circle affordance */}
                          <div className="border-muted-foreground/55 h-5 w-5 shrink-0 rounded-full border-2 transition-colors duration-150" />

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {quantityLabel(item.quantity, item.unitType)}
                              {item.estimatedPrice != null && (
                                <> · est. {formatCurrency(item.estimatedPrice)}</>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Swipe wrapper — only active for unpurchased non-bulk items */
                        <SwipeableItem
                          onEdit={() => {
                            setSelectedItem(item);
                            setShowEditItem(true);
                          }}
                          onDelete={() => handleDeleteItem(item)}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedItem(item);
                              setShowPurchase(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedItem(item);
                                setShowPurchase(true);
                              }
                            }}
                            className="hover:border-primary/30 hover:bg-accent/50 flex cursor-pointer touch-manipulation items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors duration-150 active:bg-accent"
                          >
                            {/* Empty circle affordance */}
                            <div className="border-muted-foreground/55 h-5 w-5 shrink-0 rounded-full border-2 transition-colors duration-150" />

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {quantityLabel(item.quantity, item.unitType)}
                                {item.estimatedPrice != null && (
                                  <> · est. {formatCurrency(item.estimatedPrice)}</>
                                )}
                              </p>
                            </div>

                            {/* Desktop-only edit/delete icons */}
                            <div
                              className="hidden shrink-0 items-center gap-0.5 sm:flex"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowEditItem(true);
                                }}
                                title="Editar item"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                                onClick={() => handleDeleteItem(item)}
                                title="Remover item"
                                disabled={pendingId === item.shoppingItemId}
                              >
                                {pendingId === item.shoppingItemId ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        </SwipeableItem>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating bulk action bar */}
      {isBulkMode && selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/40 bg-primary/10 hover:bg-primary/15 flex-1 gap-1.5 text-xs text-primary hover:text-primary"
              onClick={() => setShowBulkEdit(true)}
            >
              <Pencil size={13} />
              Editar selecionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-destructive/10 border-destructive/30 flex-1 gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={() => setShowBulkDelete(true)}
            >
              <Trash2 size={13} />
              Excluir selecionados
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <BulkEditDialog
        open={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        selectedItems={selectedItems}
        categories={uniqueCategories}
        onSubmit={handleBulkEdit}
      />
      <AlertDialog
        open={showBulkDelete}
        onOpenChange={(o) => {
          if (!o) setShowBulkDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}?
            </AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
              <span className="font-semibold text-foreground">{detailData?.name}</span> e todos os
              seus itens. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
              disabled={isDeleting}
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
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
