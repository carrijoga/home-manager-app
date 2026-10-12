import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CATEGORY_EMOJIS,
  CATEGORY_NAME_MAX,
  isHexColor,
  isSingleEmoji,
  nextPaletteColor,
} from '@/lib/categories';
import type {
  CategoryResponse,
  CategoryScope,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/schemas/category';

import { ColorPicker, EmojiPicker } from './EmojiColorFields';

const ROOT_VALUE = '__root__';

export function CategoryFormDialog({
  open,
  onOpenChange,
  scope,
  tree,
  mode,
  category,
  parent,
  onSubmitCreate,
  onSubmitUpdate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  scope: CategoryScope;
  tree: CategoryResponse[];
  mode: 'create' | 'edit';
  category?: CategoryResponse;
  parent: CategoryResponse | null;
  onSubmitCreate: (req: Omit<CreateCategoryRequest, 'scope'>) => Promise<unknown>;
  onSubmitUpdate: (id: string, req: UpdateCategoryRequest) => Promise<void>;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
      setParentId(category.parentCategoryId);
    } else {
      setName('');
      setIcon(CATEGORY_EMOJIS[scope][0]);
      setColor(nextPaletteColor(tree.map((r) => r.color)));
      setParentId(parent?.categoryId ?? null);
    }
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isRoot = parentId === null;
  const inheritedColor = tree.find((r) => r.categoryId === parentId)?.color;

  const nameError =
    name.trim() === ''
      ? t('categoriesSettings.form.nameRequired')
      : name.length > CATEGORY_NAME_MAX
        ? t('categoriesSettings.form.nameMax', { max: CATEGORY_NAME_MAX })
        : null;

  const valid = !nameError && isSingleEmoji(icon) && (!isRoot || isHexColor(color));

  const title =
    mode === 'edit'
      ? t('categoriesSettings.form.editTitle')
      : parent
        ? t('categoriesSettings.form.newSubTitle', { parent: parent.name })
        : t('categoriesSettings.form.newTitle');

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      if (mode === 'create') {
        await onSubmitCreate({
          parentCategoryId: parentId,
          name: name.trim(),
          icon,
          color: isRoot ? color : null,
        });
        toast.success(t('categoriesSettings.form.created'));
      } else if (category) {
        await onSubmitUpdate(category.categoryId, {
          name: name.trim(),
          icon,
          color: isRoot ? color : null,
        });
        toast.success(t('categoriesSettings.form.updated'));
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('categoriesSettings.form.saveError');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const body = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="category-name">{t('categoriesSettings.form.name')}</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={CATEGORY_NAME_MAX}
          aria-invalid={!!nameError}
        />
        <div className="flex items-center justify-between">
          {nameError ? (
            <p className="text-xs text-destructive">{nameError}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground">
            {name.length}/{CATEGORY_NAME_MAX}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t('categoriesSettings.form.icon')}</Label>
        <EmojiPicker scope={scope} value={icon} onChange={setIcon} />
      </div>

      {mode === 'create' && (
        <div className="space-y-1.5">
          <Label>{t('categoriesSettings.form.parent')}</Label>
          <Select
            value={parentId ?? ROOT_VALUE}
            onValueChange={(v) => setParentId(v === ROOT_VALUE ? null : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROOT_VALUE}>{t('categoriesSettings.form.noParent')}</SelectItem>
              {tree.map((root) => (
                <SelectItem key={root.categoryId} value={root.categoryId}>
                  {root.icon} {root.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isRoot ? (
        <div className="space-y-1.5">
          <Label>{t('categoriesSettings.form.color')}</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>{t('categoriesSettings.form.color')}</Label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="size-4 shrink-0 rounded-full border border-border/50"
              style={{ backgroundColor: inheritedColor }}
            />
            {t('categoriesSettings.form.inheritedColor')}
          </div>
        </div>
      )}
    </div>
  );

  const footer = (
    <Button type="button" onClick={() => void handleSubmit()} disabled={!valid || saving} className="w-full sm:w-auto">
      {saving ? t('categoriesSettings.form.saving') : t('categoriesSettings.form.save')}
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
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
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
