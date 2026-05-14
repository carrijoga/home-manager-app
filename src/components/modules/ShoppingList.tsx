import { formatCurrency } from '@utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Flame,
  ListChecks,
  Minus,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { UNIT_TYPE_LABELS } from '@/schemas/enums';
import type { AppShoppingItem, AppShoppingList } from '@/types';
import MoneyInput from '@components/common/MoneyInput';

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
  estimatedPrice: number | null;
  notes: string;
}

interface PurchaseFormData {
  price: number | null;
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
  estimatedPrice: null,
  notes: '',
});
const emptyPurchaseForm = (est?: number | null): PurchaseFormData => ({
  price: est ?? null,
  purchasedAt: todayISO(),
});

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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
      >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_TYPE_LABELS).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>{lbl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" role="combobox" className="w-full justify-between font-normal">
                  <span className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}>
                    {selectedCategoryName ?? 'Sem categoria'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="__none__" onSelect={() => { setData((d) => ({ ...d, categoryId: '' })); setCategoryOpen(false); }}>
                        Sem categoria
                      </CommandItem>
                      {sortedCategories.map((c) => (
                        <CommandItem key={c.shoppingCategoryId} value={c.name} onSelect={() => { setData((d) => ({ ...d, categoryId: c.shoppingCategoryId })); setCategoryOpen(false); }}>
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
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={maskBRL(data.estimatedPrice.replace(/\D/g, ''))}
              onChange={(e) => setData((d) => ({ ...d, estimatedPrice: parseBRLMask(maskBRL(e.target.value.replace(/\D/g, ''))) }))}
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
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving || !data.name.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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
    <Sheet open={open && !!item} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
      >
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 size={18} style={{ color: '#78dc77' }} />
            Marcar como comprado
          </SheetTitle>
          {item && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{item.name}</span>
              {' — '}
              {quantityLabel(item.quantity, item.unitType)}
            </p>
          )}
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="purchase-price">
              Preço pago (R$) <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="purchase-price"
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={maskBRL(data.price.replace(/\D/g, ''))}
              onChange={(e) => setData((d) => ({ ...d, price: parseBRLMask(maskBRL(e.target.value.replace(/\D/g, ''))) }))}
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
      </SheetContent>
    </Sheet>
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
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity('');
      setUnitType('');
      setCategoryId('');
      setEstimatedPrice(null);
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
    if (estimatedPrice !== null) patch.estimatedPrice = estimatedPrice;
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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
      >
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>Editar {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Apenas os campos preenchidos serão alterados.
          </p>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full justify-between font-normal"
                >
                  <span className={selectedCategoryName ? 'text-foreground' : 'text-muted-foreground'}>
                    {categoryId === '__clear__' ? 'Remover categoria' : (selectedCategoryName ?? '— sem alteração —')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="__clear__" onSelect={() => { setCategoryId('__clear__'); setCategoryOpen(false); }}>
                        Remover categoria
                      </CommandItem>
                      {sortedCategories.map((c) => (
                        <CommandItem key={c.shoppingCategoryId} value={c.name} onSelect={() => { setCategoryId(c.shoppingCategoryId); setCategoryOpen(false); }}>
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
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={maskBRL(estimatedPrice.replace(/\D/g, ''))}
              onChange={(e) => setEstimatedPrice(parseBRLMask(maskBRL(e.target.value.replace(/\D/g, ''))))}
            />
          </div>

          <div className="bg-muted/30 space-y-1 rounded-xl border border-border px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Itens afetados</p>
            {previewNames.map((name) => (
              <p key={name} className="flex items-center gap-1.5 text-xs text-foreground">
                <span className="text-primary">•</span>{name}
              </p>
            ))}
            {overflow > 0 && <p className="text-xs italic text-muted-foreground">e mais +{overflow} {overflow === 1 ? 'item' : 'itens'}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
// ── SwipeableItem removed — row tap opens drawer on mobile ───────────────────────

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

  // ── Inline edit state (desktop) / mobile drawer ─────────────────────────────
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineForm, setInlineForm] = useState<{ qty: string; estimated: number | null; paid: number | null }>({
    qty: '',
    estimated: null,
    paid: null,
  });
  const [inlineSaving, setInlineSaving] = useState(false);
  const [showMobileEditSheet, setShowMobileEditSheet] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

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
    let items = detailData.items;
    if (categoryFilter === '__unpurchased__') {
      items = items.filter((i) => !i.isPurchased);
    } else if (categoryFilter === '__purchased__') {
      items = items.filter((i) => i.isPurchased);
    } else if (categoryFilter) {
      items = items.filter((i) => i.categoryName === categoryFilter);
    }
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
        data.estimatedPrice ?? null,
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
      estimatedPrice: selectedItem.estimatedPrice ?? null,
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
        data.estimatedPrice ?? null,
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
                  estimatedPrice: data.estimatedPrice ?? null,
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
      const price = data.price ?? 0;
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

  // ── Helpers: inline edit ────────────────────────────────────────────────────
  const openInlineEdit = useCallback((item: AppShoppingItem) => {
    setInlineEditingId(item.shoppingItemId);
    setInlineForm({
      qty: String(item.quantity),
      estimated: item.estimatedPrice ?? null,
      paid: item.price ?? null,
    });
  }, []);

  const cancelInlineEdit = useCallback(() => {
    setInlineEditingId(null);
    setInlineSaving(false);
  }, []);

  const saveInlineEdit = useCallback(
    async (item: AppShoppingItem) => {
      setInlineSaving(true);
      try {
        const newQty = parseFloat(inlineForm.qty) || item.quantity;
        const newEstimated = inlineForm.estimated;
        const newPaid = inlineForm.paid;

        await updateShoppingItem(
          item.shoppingItemId,
          selectedListId!,
          item.name,
          newQty,
          item.unitType,
          item.shoppingCategoryId ?? null,
          newEstimated,
          item.notes ?? null
        );

        if (newPaid != null && !item.isPurchased) {
          await markItemAsPurchased(
            item.shoppingItemId,
            selectedListId!,
            newQty,
            item.unitType,
            newPaid,
            `${todayISO()}T12:00:00Z`
          );
          setDetailData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              items: prev.items.map((i) =>
                i.shoppingItemId === item.shoppingItemId
                  ? {
                      ...i,
                      quantity: newQty,
                      estimatedPrice: newEstimated,
                      isPurchased: true,
                      price: newPaid,
                    }
                  : i
              ),
            };
          });
        } else {
          setDetailData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              items: prev.items.map((i) =>
                i.shoppingItemId === item.shoppingItemId
                  ? { ...i, quantity: newQty, estimatedPrice: newEstimated }
                  : i
              ),
            };
          });
        }

        showSuccess('Item atualizado!');
        setInlineEditingId(null);
      } finally {
        setInlineSaving(false);
      }
    },
    [inlineForm, selectedListId, updateShoppingItem, markItemAsPurchased, showSuccess]
  );

  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

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
  const detailPurchasedItems = detailData?.items.filter((i) => i.isPurchased).length ?? 0;
  const detailTotalItems = detailData?.items.length ?? 0;
  const detailPct =
    detailTotalItems === 0 ? 0 : Math.round((detailPurchasedItems / detailTotalItems) * 100);
  // Calculated live from detailData so they reflect inline edits immediately
  const totalEstimated =
    detailData?.items.reduce((s, i) => s + (i.estimatedPrice ?? 0), 0) ?? 0;
  const totalSpent =
    detailData?.items.filter((i) => i.isPurchased).reduce((s, i) => s + (i.price ?? 0), 0) ?? 0;
  const remaining = Math.max(0, totalEstimated - totalSpent);

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-full space-y-5 pb-32"
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Left: title area */}
        <div className="space-y-1">
          {/* Module context pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-card px-3 py-1">
            <div className="h-2 w-2 rounded-full" style={{ background: '#ffcad9' }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: '#ffcad9' }}
            >
              Lista de Compras
            </span>
          </div>

          {/* Back + list name */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={backToLists}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Voltar para listas"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {detailData?.name ?? '...'}
            </h1>
          </div>

          {/* Date */}
          {detailData && (
            <p className="flex items-center gap-1.5 pl-9 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <ShoppingCart size={11} />
              {new Date(detailData.monthYear).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          )}
        </div>

        {/* Right: summary bento cards */}
        {detailData && (
          <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
            {/* Estimado */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
              <div
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
                style={{ background: 'rgba(216,226,255,0.1)' }}
              >
                <Tag size={16} style={{ color: '#adc6ff' }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[9px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                  Estimado
                </p>
                <p className="text-sm font-semibold text-foreground sm:text-lg">
                  {totalEstimated > 0 ? formatCurrency(totalEstimated) : '—'}
                </p>
              </div>
            </div>

            {/* Pago até agora */}
            <div
              className="relative flex items-center gap-2 overflow-hidden rounded-2xl border-l-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4"
              style={{
                borderColor: '#78dc77',
                background: 'rgba(120,220,119,0.05)',
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(120,220,119,0.06)] to-transparent pointer-events-none" />
              <div
                className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card sm:flex"
                style={{ background: 'rgba(148,249,144,0.1)' }}
              >
                <CheckCircle2 size={16} style={{ color: '#78dc77' }} />
              </div>
              <div className="relative min-w-0">
                <p
                  className="truncate text-[9px] font-medium uppercase tracking-widest sm:text-[10px]"
                  style={{ color: '#78dc77' }}
                >
                  Pago
                </p>
                <p className="text-sm font-semibold sm:text-lg" style={{ color: '#78dc77' }}>
                  {totalSpent > 0 ? formatCurrency(totalSpent) : '—'}
                </p>
              </div>
            </div>

            {/* Restante */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
              <div
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
                style={{ background: 'rgba(197,184,255,0.1)' }}
              >
                <ShoppingCart size={16} style={{ color: '#c5b8ff' }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[9px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                  Restante
                </p>
                <p className="text-sm font-semibold sm:text-lg" style={{ color: '#c5b8ff' }}>
                  {totalEstimated > 0 ? formatCurrency(remaining) : '—'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sort + action toolbar ─────────────────────────────────────────────── */}
      {isBulkMode ? (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(120,160,255,0.2)] bg-[rgba(120,160,255,0.07)] px-4 py-2.5">
          <span className="text-sm font-semibold text-[#7ba0ff]">
            {selectedItems.length} selecionado{selectedItems.length !== 1 ? 's' : ''}
          </span>
          <button
            className="ml-auto rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={exitBulkMode}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 border-b border-border/50 pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          {/* Sort pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ArrowUpDown size={12} className="shrink-0 text-muted-foreground" />
            <span className="hidden text-xs font-medium uppercase tracking-widest text-muted-foreground sm:inline">
              Ordenar por
            </span>
            {(
              [
                { value: 'name', label: 'Nome' },
                { value: 'count', label: 'Qtd.' },
                { value: 'purchased', label: 'Pendentes' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSortOrder(value)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-xs',
                  sortOrder === value
                    ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                    : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="flex items-center gap-1 rounded-full border border-[#adc6ff]/50 px-2.5 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-xs"
              onClick={() => uploadInputRef.current?.click()}
              disabled={!detailData || isUploading}
            >
              <Upload size={11} />
              {isUploading ? 'Importando...' : 'Importar'}
            </button>
            <button
              className="flex items-center gap-1 rounded-full border border-[#adc6ff]/50 px-2.5 py-1 text-[10px] font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50 sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-xs"
              onClick={() => setIsBulkMode(true)}
              disabled={!detailData}
            >
              <ListChecks size={11} />
              Selecionar
            </button>
            <button
              className="flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors disabled:opacity-50 sm:gap-1.5 sm:px-5 sm:py-1.5 sm:text-xs"
              style={{ background: 'rgba(173,198,255,0.26)', border: '1px solid #adc6ff', color: '#e5e2e1' }}
              onClick={() => setShowAddItem(true)}
              disabled={!detailData}
            >
              <Plus size={11} />
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* ── Category filter pills ─────────────────────────────────────────────── */}
      {!isBulkMode && (
        <div className="flex items-center gap-2">
          <button
            className="hidden rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
            onClick={() => scrollCategories('left')}
            aria-label="Categorias anteriores"
          >
            <ChevronLeft size={14} />
          </button>
          <div
            ref={categoryScrollRef}
            className="scrollbar-hide flex flex-1 snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto scroll-smooth whitespace-nowrap touch-pan-x"
            onPointerDown={handleCategoryPointerDown}
            onPointerMove={handleCategoryPointerMove}
            onPointerUp={handleCategoryPointerUp}
            onPointerLeave={handleCategoryPointerUp}
          >
            <button
              onClick={() => setCategoryFilter(null)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors',
                categoryFilter === null
                  ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                  : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setCategoryFilter('__unpurchased__' === categoryFilter ? null : '__unpurchased__')}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors',
                categoryFilter === '__unpurchased__'
                  ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                  : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              Não Comprados
            </button>
            <button
              onClick={() => setCategoryFilter('__purchased__' === categoryFilter ? null : '__purchased__')}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors',
                categoryFilter === '__purchased__'
                  ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                  : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              Comprados
            </button>
            {categoriesInDetail.length > 0 && (
              <div className="mx-1 h-6 w-px self-center bg-border/40" />
            )}
            {categoriesInDetail.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors',
                  categoryFilter === cat
                    ? 'border-[rgba(216,226,255,0.3)] bg-[rgba(216,226,255,0.2)] text-[#adc6ff]'
                    : 'border-border/40 bg-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            className="hidden rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:flex"
            onClick={() => scrollCategories('right')}
            aria-label="Próximas categorias"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Search input */}
      {!isBulkMode && (
        <div className="relative flex items-center">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar itens..."
            className="rounded-xl pr-8"
          />
          {isSearchPending && (
            <span className="pointer-events-none absolute right-2 flex items-center">
              <Spinner size="sm" className="text-muted-foreground" />
            </span>
          )}
        </div>
      )}

      <input
        ref={uploadInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleUploadFile}
        className="hidden"
      />

      {/* Item list */}
      {isLoadingDetail ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <Skeleton className="h-8 w-8 rounded-2xl" />
                <Skeleton className="h-4 w-32" />
              </div>
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-4 border-t border-border/30 px-6 py-4">
                  <Skeleton className="h-6 w-6 rounded-lg" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
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
      ) : (
        <div className="space-y-4">
          {groupedItemEntries.map(([category, items]) => {
            const isCollapsed = collapsedCategories.has(category);
            const purchasedCount = items.filter((i) => i.isPurchased).length;
            const unpurchased = items.filter((i) => !i.isPurchased);
            const allGroupSelected =
              unpurchased.length > 0 && unpurchased.every((i) => selectedItemIds.has(i.shoppingItemId));
            const someGroupSelected = unpurchased.some((i) => selectedItemIds.has(i.shoppingItemId));

            return (
              <div
                key={category}
                className="overflow-hidden rounded-2xl border border-border bg-card dark:bg-[#1e1e1e]"
              >
                {/* Category header */}
                <div className="flex items-center justify-between border-b border-border/50 bg-card px-5 py-3.5 dark:bg-[#242424]">
                  <div className="flex items-center gap-3">
                    {isBulkMode && unpurchased.length > 0 && (
                      <Checkbox
                        checked={allGroupSelected}
                        data-state={someGroupSelected && !allGroupSelected ? 'indeterminate' : undefined}
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
                    )}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(173,198,255,0.1)' }}
                    >
                      <Tag size={13} style={{ color: '#adc6ff' }} />
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
                      {category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {purchasedCount}/{items.length}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleCategoryCollapse(category)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={isCollapsed ? 'Expandir categoria' : 'Recolher categoria'}
                  >
                    {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  </button>
                </div>

                {/* Items */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => {
                          const isEditing = inlineEditingId === item.shoppingItemId;

                          return (
                            <motion.div
                              key={item.shoppingItemId}
                              layout
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20, scale: 0.98 }}
                              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                              className={cn(idx > 0 && 'border-t border-border/30')}
                            >
                              {/* ── Editing state (desktop inline) ── */}
                              {isEditing ? (
                                <div className="relative border-l-2 border-[#adc6ff] bg-[rgba(173,198,255,0.04)] px-5 py-5">
                                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(173,198,255,0.04)] to-transparent pointer-events-none" />
                                  <div className="relative flex flex-wrap items-center gap-4">
                                    {/* Checkbox checked */}
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#adc6ff]">
                                      <Check size={13} style={{ color: '#0e0e0e' }} strokeWidth={3} />
                                    </div>
                                    <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                                      {item.name}
                                    </span>

                                    {/* Qty stepper */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                        Quantidade
                                      </span>
                                      <div className="flex h-9 items-center gap-0 rounded-xl border border-border bg-background">
                                        <button
                                          type="button"
                                          className="flex h-full w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                          onClick={() =>
                                            setInlineForm((f) => ({
                                              ...f,
                                              qty: String(Math.max(0, parseFloat(f.qty || '1') - 1)),
                                            }))
                                          }
                                        >
                                          <Minus size={12} />
                                        </button>
                                        <span className="w-16 text-center text-sm text-foreground">
                                          {inlineForm.qty} {UNIT_TYPE_LABELS[item.unitType] ?? 'un'}
                                        </span>
                                        <button
                                          type="button"
                                          className="flex h-full w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                          onClick={() =>
                                            setInlineForm((f) => ({
                                              ...f,
                                              qty: String(parseFloat(f.qty || '0') + 1),
                                            }))
                                          }
                                        >
                                          <Plus size={12} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Estimated price */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                        Estimado (R$)
                                      </span>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0,00"
                                        value={maskBRL(inlineForm.estimated.replace(/\D/g, ''))}
                                        onChange={(e) =>
                                          setInlineForm((f) => ({ ...f, estimated: parseBRLMask(maskBRL(e.target.value.replace(/\D/g, ''))) }))
                                        }
                                        className="h-9 w-28 rounded-xl bg-background text-sm"
                                      />
                                    </div>

                                    {/* Paid price */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                        Pago (R$)
                                      </span>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0,00"
                                        value={maskBRL(inlineForm.paid.replace(/\D/g, ''))}
                                        onChange={(e) =>
                                          setInlineForm((f) => ({ ...f, paid: parseBRLMask(maskBRL(e.target.value.replace(/\D/g, ''))) }))
                                        }
                                        className="h-9 w-28 rounded-xl bg-background text-sm"
                                      />
                                    </div>

                                    {/* Actions */}
                                    <div className="ml-auto flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={cancelInlineEdit}
                                        className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        disabled={inlineSaving}
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => saveInlineEdit(item)}
                                        disabled={inlineSaving}
                                        className="rounded-2xl px-6 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                                        style={{ background: '#adc6ff', color: '#0e0e0e' }}
                                      >
                                        {inlineSaving ? 'Salvando...' : 'Salvar'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : item.isPurchased ? (
                                /* ── Purchased (checked) state ── */
                                <div
                                  className={cn(
                                    'flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-accent/20',
                                    isBulkMode && selectedItemIds.has(item.shoppingItemId)
                                      ? 'bg-[rgba(120,160,255,0.06)]'
                                      : 'opacity-70'
                                  )}
                                  onClick={() => {
                                    if (!isBulkMode) {
                                      setSelectedItem(item);
                                      setShowMobileEditSheet(true);
                                    }
                                  }}
                                >
                                  {isBulkMode ? (
                                    <Checkbox
                                      checked={selectedItemIds.has(item.shoppingItemId)}
                                      onCheckedChange={() => toggleItemSelection(item.shoppingItemId)}
                                      className="shrink-0"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => handleUnmarkAsPurchased(item)}
                                      disabled={pendingId === item.shoppingItemId}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#78dc77] transition-opacity hover:opacity-80 disabled:opacity-50"
                                    >
                                      {pendingId === item.shoppingItemId ? (
                                        <Spinner size="sm" />
                                      ) : (
                                        <Check size={13} style={{ color: '#131313' }} strokeWidth={3} />
                                      )}
                                    </button>
                                  )}

                                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground line-through">
                                    {item.name}
                                  </span>

                                  <div className="hidden items-center gap-8 pr-2 sm:flex">
                                    <span className="w-16 text-right text-sm text-muted-foreground">
                                      {quantityLabel(item.quantity, item.unitType)}
                                    </span>
                                    <span className="w-24 text-right text-sm text-muted-foreground line-through">
                                      {item.estimatedPrice != null
                                        ? formatCurrency(item.estimatedPrice)
                                        : '---'}
                                    </span>
                                    <span className="w-24 text-right text-sm font-medium text-[#78dc77]">
                                      {item.price != null ? formatCurrency(item.price) : '---'}
                                    </span>
                                  </div>

                                  {/* Mobile: paid value only */}
                                  <span className="shrink-0 text-xs font-medium text-[#78dc77] sm:hidden">
                                    {item.price != null ? formatCurrency(item.price) : '---'}
                                  </span>

                                  {!isBulkMode && (
                                    <div
                                      className="flex shrink-0 items-center gap-0.5 opacity-50"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                        onClick={() => handleUnmarkAsPurchased(item)}
                                        title="Desfazer compra"
                                        disabled={pendingId === item.shoppingItemId}
                                      >
                                        <RotateCcw size={13} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : isBulkMode ? (
                                /* ── Bulk selection state ── */
                                <div
                                  className={cn(
                                    'flex items-center gap-4 px-5 py-4 transition-colors duration-200',
                                    selectedItemIds.has(item.shoppingItemId)
                                      ? 'bg-[rgba(120,160,255,0.06)]'
                                      : ''
                                  )}
                                >
                                  <Checkbox
                                    checked={selectedItemIds.has(item.shoppingItemId)}
                                    onCheckedChange={() => toggleItemSelection(item.shoppingItemId)}
                                    className="shrink-0"
                                  />
                                  <div className="h-6 w-6 shrink-0 rounded-lg border border-border/60" />
                                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                                    {item.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {quantityLabel(item.quantity, item.unitType)}
                                  </span>
                                  {item.estimatedPrice != null && (
                                    <span className="text-sm text-muted-foreground">
                                      {formatCurrency(item.estimatedPrice)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                /* ── Normal (unpurchased) state ── */
                                <div
                                  className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-accent/30 active:bg-accent/50"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowMobileEditSheet(true);
                                  }}
                                >

                                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                    {item.name}
                                  </span>

                                  {/* Desktop columns: qty | estimated | paid */}
                                  <div className="hidden items-center gap-8 pr-8 sm:flex">
                                    <span className="w-16 text-right text-sm text-muted-foreground">
                                      {quantityLabel(item.quantity, item.unitType)}
                                    </span>
                                    <span className="w-24 text-right text-sm text-muted-foreground">
                                      {item.estimatedPrice != null ? formatCurrency(item.estimatedPrice) : '---'}
                                    </span>
                                    <span className="w-24 text-right text-sm text-muted-foreground">---</span>
                                  </div>

                                  {/* Mobile: compact qty */}
                                  <span className="shrink-0 text-xs text-muted-foreground sm:hidden">
                                    {quantityLabel(item.quantity, item.unitType)}
                                  </span>

                                  {/* Desktop action icons */}
                                  <div
                                    className="hidden shrink-0 items-center gap-0.5 opacity-50 transition-opacity hover:opacity-100 sm:flex"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                      onClick={() => openInlineEdit(item)}
                                      title="Editar item"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                                      onClick={() => handleDeleteItem(item)}
                                      title="Remover item"
                                      disabled={pendingId === item.shoppingItemId}
                                    >
                                      {pendingId === item.shoppingItemId ? <Spinner size="sm" /> : <Trash2 size={13} />}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile edit/purchase sheet */}
      {selectedItem && (
        <Sheet
          open={showMobileEditSheet}
          onOpenChange={(v) => {
            if (!v) {
              setShowMobileEditSheet(false);
              setSelectedItem(null);
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="rounded-t-2xl border-t border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e]"
          >
            <SheetHeader className="mb-5 text-left">
              <SheetTitle className="text-base font-semibold text-foreground">
                {selectedItem.name}
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                {quantityLabel(selectedItem.quantity, selectedItem.unitType)}
                {selectedItem.estimatedPrice != null && (
                  <> · estimado {formatCurrency(selectedItem.estimatedPrice)}</>
                )}
              </p>
            </SheetHeader>

            <div className="space-y-4">
              {/* Quick mark as purchased */}
              {!selectedItem.isPurchased && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors"
                  style={{ background: '#78dc77', color: '#131313' }}
                  onClick={() => {
                    setShowMobileEditSheet(false);
                    setShowPurchase(true);
                  }}
                >
                  <Check size={16} strokeWidth={3} />
                  Marcar como comprado
                </button>
              )}

              {/* Edit + Delete — only when not purchased */}
              {!selectedItem.isPurchased && (
                <>
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    onClick={() => {
                      setShowMobileEditSheet(false);
                      setShowEditItem(true);
                    }}
                  >
                    <Pencil size={15} />
                    Editar item
                  </button>

                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    onClick={() => {
                      handleDeleteItem(selectedItem);
                      setShowMobileEditSheet(false);
                      setSelectedItem(null);
                    }}
                    disabled={pendingId === selectedItem.shoppingItemId}
                  >
                    <Trash2 size={15} />
                    Remover item
                  </button>
                </>
              )}

              {/* Undo purchase — only when purchased */}
              {selectedItem.isPurchased && (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                  onClick={() => {
                    handleUnmarkAsPurchased(selectedItem);
                    setShowMobileEditSheet(false);
                    setSelectedItem(null);
                  }}
                  disabled={pendingId === selectedItem.shoppingItemId}
                >
                  <RotateCcw size={15} />
                  Desfazer compra
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Floating bulk action bar */}
      {isBulkMode && selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
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

      {/* ── Sticky footer bar ────────────────────────────────────────────────── */}
      {detailData && !isBulkMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-6 border-t border-border/20 bg-card/90 px-6 py-4 backdrop-blur-md dark:bg-[rgba(28,28,28,0.92)] md:left-[var(--sidebar-width,0px)]">
          {/* Left: remaining balance */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/30 bg-background"
            >
              <ShoppingCart size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-foreground">
                {totalEstimated > 0 ? formatCurrency(remaining) : '—'}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Restante para finalizar
              </p>
            </div>
          </div>

          {/* Center: progress bar */}
          <div className="hidden flex-1 items-center gap-3 md:flex">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Progresso
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[rgba(255,202,217,0.6)] to-[#ffcad9] transition-all duration-500"
                style={{ width: `${detailPct}%` }}
              />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {detailPct}%
            </span>
          </div>

          {/* Right: finish button */}
          <button
            className="flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#131313] shadow-lg transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(90deg, #adc6ff 0%, #8cafff 100%)',
            }}
            onClick={() => setShowDeleteAlert(false)}
            disabled={detailTotalItems === 0}
          >
            <Check size={14} strokeWidth={3} />
            Finalizar Compra
          </button>
        </div>
      )}
    </motion.div>
  );
});

ShoppingList.displayName = 'ShoppingList';
export default ShoppingList;
