import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { isHexColor } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { CategoryResponse, MoveCategoryRequest } from '@/schemas/category';

import { ColorPicker } from './EmojiColorFields';

export function MoveCategoryDialog({
  open,
  onOpenChange,
  tree,
  category,
  parent,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tree: CategoryResponse[];
  category: CategoryResponse;
  parent: CategoryResponse | null;
  onSubmit: (id: string, req: MoveCategoryRequest) => Promise<void>;
}) {
  const isMobile = useIsMobile();
  const [targetId, setTargetId] = useState<string | null | undefined>(undefined);
  const [color, setColor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTargetId(undefined);
    setColor(parent?.color ?? '');
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hasChildren = category.children.length > 0;

  const rootOptions = tree.filter(
    (root) => root.categoryId !== category.categoryId && root.categoryId !== parent?.categoryId
  );

  const canMakeRoot = parent !== null;

  const anyEnabled = canMakeRoot || (!hasChildren && rootOptions.length > 0);

  const targetIsRoot = targetId === null;

  const valid =
    targetId !== undefined && (!targetIsRoot || isHexColor(color));

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await onSubmit(category.categoryId, {
        parentCategoryId: targetId ?? null,
        color: targetIsRoot ? color : null,
      });
      toast.success('Categoria movida.');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível mover a categoria.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const body = (
    <div className="space-y-3">
      {hasChildren && (
        <p className="text-xs text-muted-foreground">
          Mova ou exclua as subcategorias primeiro.
        </p>
      )}
      <div className="space-y-1.5">
        {canMakeRoot && (
          <button
            type="button"
            onClick={() => setTargetId(null)}
            aria-pressed={targetId === null}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
              targetId === null ? 'border-primary bg-primary/10' : 'border-border/50'
            )}
          >
            Tornar categoria principal
          </button>
        )}
        {rootOptions.map((root) => {
          const disabled = hasChildren;
          return (
            <button
              key={root.categoryId}
              type="button"
              disabled={disabled}
              onClick={() => setTargetId(root.categoryId)}
              aria-pressed={targetId === root.categoryId}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                disabled
                  ? 'cursor-not-allowed border-border/30 opacity-50'
                  : 'hover:bg-accent',
                targetId === root.categoryId && !disabled
                  ? 'border-primary bg-primary/10'
                  : 'border-border/50'
              )}
            >
              {root.icon} {root.name}
            </button>
          );
        })}
      </div>

      {targetIsRoot && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Cor</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      )}
    </div>
  );

  const footer = (
    <Button
      type="button"
      onClick={() => void handleSubmit()}
      disabled={!valid || saving || !anyEnabled}
      className="w-full sm:w-auto"
    >
      {saving ? 'Salvando…' : 'Mover'}
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>Mover categoria</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-2">{body}</div>
          <div className="border-t border-border/40 pt-4">{footer}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover categoria</DialogTitle>
        </DialogHeader>
        {body}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
