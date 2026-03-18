import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { getIconComponent, CURATED_NEST_ICONS } from '@/lib/nestIcons';
import {
  CreateNestRequestSchema,
  UpdateNestRequestSchema,
  type CreateNestRequest,
  type UpdateNestRequest,
} from '@/schemas';
import type { AppUserNest } from '@/types';
import * as userService from '@/services/userService';
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NestFormValues>({
    resolver: zodResolver(isEdit ? UpdateNestRequestSchema : CreateNestRequestSchema) as unknown as Resolver<NestFormValues>,
    defaultValues: {
      name: '',
      description: '',
      icon: 'Home',
    },
  });

  // Seed form with existing nest data when opening in edit mode
  useEffect(() => {
    if (open) {
      reset({
        name: nest?.name ?? '',
        description: '',
        icon: nest?.icon ?? 'Home',
      });
    }
  }, [open, nest, reset]);

  const selectedIcon = watch('icon');

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
      const message = error instanceof Error ? error.message : isEdit ? 'Erro ao atualizar ninho.' : 'Erro ao criar ninho.';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar ninho 🪺' : 'Criar novo ninho 🪺'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize o nome, descrição ou ícone do ninho.'
              : 'Ninhos são grupos para organizar sua casa, escritório ou qualquer espaço.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1">
            <Label htmlFor="nest-name">Nome</Label>
            <Input
              id="nest-name"
              placeholder="Ex: Casa Principal"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <Label htmlFor="nest-description">Descrição</Label>
            <Textarea
              id="nest-description"
              placeholder={isEdit ? 'Deixe em branco para manter a descrição atual' : 'Ex: Nossa casa em São Paulo'}
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-1.5">
              {CURATED_NEST_ICONS.map(({ name, label }) => {
                const Icon = getIconComponent(name);
                const isSelected = selectedIcon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    title={label}
                    onClick={() => setValue('icon', name)}
                    className={`flex flex-col items-center gap-0.5 rounded-md p-1.5 text-xs transition-colors
                      ${isSelected
                        ? 'bg-primary/10 text-primary ring-2 ring-primary dark:bg-primary/20'
                        : 'hover:bg-muted text-muted-foreground'
                      }`}
                  >
                    <Icon className="size-4" />
                    <span className="truncate w-full text-center leading-none">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit ? 'Salvando...' : 'Criando...'
                : isEdit ? 'Salvar alterações' : 'Criar ninho'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
