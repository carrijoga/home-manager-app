import { Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ManageCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Array<{ shoppingCategoryId: string; name: string; isDefault: boolean }>;
  onCreateCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function ManageCategoriesDialog({
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
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-border bg-card px-6 pb-8 pt-6 dark:bg-[#1e1e1e] sm:max-w-md"
      >
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <Tag size={18} />
            Gerenciar Categorias
          </SheetTitle>
        </SheetHeader>

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
                  className="group flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
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
      </SheetContent>
    </Sheet>
  );
}
