import { Check, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { getIconComponent } from '@/lib/nestIcons';
import * as userService from '@/services/userService';
import type { AppUserNest } from '@/types';

import { CreateNestModal } from './CreateNestModal';

interface NestManagerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function NestManagerSheet({ open, onClose }: NestManagerSheetProps) {
  const { user, activeNestId, refreshNests, setDefaultNest } = useApp();
  const nests = user?.nests ?? [];

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingNest, setEditingNest] = React.useState<AppUserNest | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AppUserNest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEditNest = (nest: AppUserNest) => {
    setEditingNest(nest);
    setEditOpen(true);
  };

  const handleSetDefault = async (nestId: string) => {
    try {
      await setDefaultNest(nestId);
      toast.success('Ninho definido como principal!');
    } catch {
      toast.error('Erro ao definir ninho principal.');
    }
  };

  const handleDeleteClick = (nest: AppUserNest) => {
    setDeleteTarget(nest);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await userService.deleteNest(deleteTarget.nestId);
      await refreshNests();
      toast.success('Ninho removido.');
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover ninho.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-sm">
          <SheetHeader className="border-b px-6 pb-4 pt-6">
            <SheetTitle>Gerenciar ninhos 🪺</SheetTitle>
            <SheetDescription>Troque, edite ou remova os seus ninhos.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
            {nests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum ninho encontrado.
              </p>
            ) : (
              nests.map((nest) => {
                const NestIcon = getIconComponent(nest.icon);
                const isActive = nest.nestId === activeNestId;
                return (
                  <div
                    key={nest.nestId}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                      <NestIcon className="size-4" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{nest.name}</span>
                    {nest.isDefault ? (
                      <Star className="size-3.5 shrink-0 text-amber-500 fill-amber-500" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-amber-500"
                        title="Definir como ninho principal"
                        aria-label="Definir como ninho principal"
                        onClick={() => handleSetDefault(nest.nestId)}
                      >
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    {isActive && <Check className="size-3.5 shrink-0 text-primary" />}
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label="Editar ninho"
                        onClick={() => handleEditNest(nest)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        aria-label="Remover ninho"
                        disabled={isActive}
                        onClick={() => handleDeleteClick(nest)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <SheetFooter className="border-t px-4 py-4">
            <Button variant="outline" className="w-full" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Novo ninho
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modals mounted outside Sheet to avoid Radix nested portal focus-trap conflict */}
      <CreateNestModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CreateNestModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        nest={editingNest ?? undefined}
      />
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(v) => {
          if (!v) setDeleteConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover ninho</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o ninho{' '}
              <strong>&quot;{deleteTarget?.name}&quot;</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
