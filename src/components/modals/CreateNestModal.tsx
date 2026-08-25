import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { CURATED_NEST_ICONS, getIconComponent, KOBOYO_NEST_ICONS } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import { type CreateNestRequest, CreateNestRequestSchema, type UpdateNestRequest } from '@/schemas';
import * as userService from '@/services/userService';
import type { AppUserNest } from '@/types';

type NestFormValues = {
  name: string;
  description: string;
  icon?: string | null;
};

interface CreateNestModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  nest?: AppUserNest;
}

export function CreateNestModal({ open, onClose, mode = 'create', nest }: CreateNestModalProps) {
  const { refreshNests } = useApp();
  const isEdit = mode === 'edit';
  const [iconCategory, setIconCategory] = useState<'koboyo' | 'classic'>('koboyo');
  const [iconSearch, setIconSearch] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NestFormValues>({
    resolver: zodResolver(CreateNestRequestSchema) as unknown as Resolver<NestFormValues>,
    defaultValues: {
      name: '',
      description: '',
      icon: 'koboyo:face-beaming',
    },
  });

  // Seed form with existing nest data when opening in edit mode
  useEffect(() => {
    if (open) {
      const currentIcon = nest?.icon ?? 'koboyo:face-beaming';
      reset({
        name: nest?.name ?? '',
        description: '',
        icon: currentIcon,
      });
      if (currentIcon.includes('koboyo') || currentIcon.startsWith('http')) {
        setIconCategory('koboyo');
      } else {
        setIconCategory('classic');
      }
      setIconSearch('');
    }
  }, [open, nest, reset]);

  const selectedIcon = watch('icon') || 'koboyo:face-beaming';
  const nameValue = watch('name');
  const PreviewIcon = getIconComponent(selectedIcon);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: NestFormValues) => {
    try {
      if (isEdit && nest) {
        await userService.updateNest(nest.nestId, data as UpdateNestRequest);
        await refreshNests();
        toast.success('Ninho atualizado com sucesso!');
      } else {
        await userService.createNest(data as CreateNestRequest);
        await refreshNests();
        toast.success('Ninho criado com sucesso!');
      }
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEdit
            ? 'Erro ao atualizar ninho.'
            : 'Erro ao criar ninho.';
      toast.error(message);
    }
  };

  const rawIconsList = iconCategory === 'koboyo' ? KOBOYO_NEST_ICONS : CURATED_NEST_ICONS;
  const filteredList = useMemo(() => {
    if (!iconSearch.trim()) return rawIconsList;
    const term = iconSearch.toLowerCase().trim();
    return rawIconsList.filter((item) => item.label.toLowerCase().includes(term));
  }, [rawIconsList, iconSearch]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[500px] border-border/60 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Editar Ninho 🪺' : 'Criar Novo Ninho 🪺'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? 'Atualize o nome, descrição ou ícone do ninho.'
              : 'Ninhos são espaços para organizar a rotina familiar ou do seu grupo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Preview Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Pré-visualização
            </p>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-background text-primary shadow-xs">
                <PreviewIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {nameValue.trim() ? nameValue : isEdit ? nest?.name : 'Nome do Ninho'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isEdit ? 'Ninho existente' : 'Seu novo lar no app'}
                </p>
              </div>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nest-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nome do Ninho
            </Label>
            <Input
              id="nest-name"
              placeholder="Ex: Casa Principal"
              className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
              {...register('name')}
            />
            {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="nest-description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="nest-description"
              placeholder={
                isEdit
                  ? 'Deixe em branco para manter a descrição atual'
                  : 'Ex: Nossa casa em São Paulo'
              }
              rows={2}
              className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Ícone */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ícone do Ninho
              </Label>
              <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setIconCategory('koboyo')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs transition-all font-medium',
                    iconCategory === 'koboyo'
                      ? 'bg-background font-semibold text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Hand-drawn
                </button>
                <button
                  type="button"
                  onClick={() => setIconCategory('classic')}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs transition-all font-medium',
                    iconCategory === 'classic'
                      ? 'bg-background font-semibold text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Clássicos
                </button>
              </div>
            </div>

            {/* Icon Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar ícone..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="h-8 bg-muted/30 pl-8 text-xs border-border/40 hover:border-border/80 focus-visible:ring-1"
              />
              {iconSearch && (
                <button
                  type="button"
                  onClick={() => setIconSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Icons Grid */}
            <div className="max-h-44 overflow-y-auto rounded-xl border border-border/50 bg-card/50 p-2">
              {filteredList.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">Nenhum ícone encontrado.</p>
              ) : (
                <div className="grid grid-cols-6 gap-1.5">
                  {filteredList.map(({ name, label }) => {
                    const Icon = getIconComponent(name);
                    const isSelected = selectedIcon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={label}
                        onClick={() => setValue('icon', name)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg p-1.5 text-xs transition-all hover:scale-105',
                          isSelected
                            ? 'bg-primary/10 font-semibold text-primary ring-2 ring-primary border-primary/30 shadow-xs'
                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                      >
                        <div className={cn(
                          'flex size-7 items-center justify-center rounded-md border p-0.5 transition-colors',
                          isSelected ? 'border-primary/40 bg-background text-primary' : 'border-border/30 bg-background'
                        )}>
                          <Icon className="size-4" />
                        </div>
                        <span className="w-full truncate text-center text-[10px] leading-none">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  {isEdit ? 'Salvando...' : 'Criando...'}
                </span>
              ) : isEdit ? (
                'Salvar Alterações'
              ) : (
                'Criar Ninho'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
