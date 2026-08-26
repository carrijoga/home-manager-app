import { zodResolver } from '@hookform/resolvers/zod';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  HelpCircle,
  Home,
  Info,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Star,
  Tag,
  Trash2,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { RoleBadge } from '@/components/common/RoleBadge';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { resolveUserAvatar } from '@/constants/koboyoAvatars';
import { useApp } from '@/contexts/AppContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cardVariants, pageVariants, transitions } from '@/lib/animations';
import { CURATED_NEST_ICONS, getIconComponent, KOBOYO_NEST_ICONS } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import { InviteStatus, NestRole } from '@/schemas/enums';
import type { NestInvite, NestMember } from '@/schemas/nest';
import { CreateNestRequestSchema, type UpdateNestRequest } from '@/schemas/nest';
import * as nestService from '@/services/nestService';
import type { AppUserNest } from '@/types';

import { CategoriesPanel } from './CategoriesPanel';
import { NestConfigurationPanel } from './NestConfigurationPanel';

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'list' | 'create' | 'edit';
type EditSection = 'info' | 'members' | 'categories' | 'permissions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function inviteStatusLabel(status: number): string {
  if (status === InviteStatus.Pending) return 'Pendente';
  if (status === InviteStatus.Accepted) return 'Aceito';
  if (status === InviteStatus.Cancelled) return 'Cancelado';
  if (status === InviteStatus.Expired) return 'Expirado';
  if (status === InviteStatus.Rejected) return 'Rejeitado';
  return 'Desconhecido';
}

function inviteStatusVariant(status: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === InviteStatus.Pending) return 'default';
  if (status === InviteStatus.Accepted) return 'secondary';
  return 'outline';
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

// ── Edit Nav Sections ─────────────────────────────────────────────────────────

const EDIT_SECTIONS: { id: EditSection; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Informações', icon: Info },
  { id: 'members', label: 'Membros', icon: Users },
  { id: 'categories', label: 'Categorias', icon: Tag },
  { id: 'permissions', label: 'Configurações', icon: Shield },
];

// ── Icon Picker Subcomponent ─────────────────────────────────────────────────

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

function IconPicker({ value, onChange }: IconPickerProps) {
  const [category, setCategory] = React.useState<'koboyo' | 'classic'>(
    value.includes('koboyo') || value.startsWith('http') ? 'koboyo' : 'classic'
  );
  const [search, setSearch] = React.useState('');

  const rawIconsList = category === 'koboyo' ? KOBOYO_NEST_ICONS : CURATED_NEST_ICONS;
  const filteredList = React.useMemo(() => {
    if (!search.trim()) return rawIconsList;
    const term = search.toLowerCase().trim();
    return rawIconsList.filter((item) => item.label.toLowerCase().includes(term));
  }, [rawIconsList, search]);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ícone do Ninho
        </Label>
        <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setCategory('koboyo')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs transition-all font-medium',
              category === 'koboyo'
                ? 'bg-background font-semibold text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Hand-drawn
          </button>
          <button
            type="button"
            onClick={() => setCategory('classic')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs transition-all font-medium',
              category === 'classic'
                ? 'bg-background font-semibold text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Clássicos
          </button>
        </div>
      </div>

      {/* Search Input for Icons */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar ícone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 bg-muted/30 pl-8 text-xs border-border/40 hover:border-border/80 focus-visible:ring-1"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Icons Grid */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-card/50 p-2">
        {filteredList.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">Nenhum ícone encontrado.</p>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {filteredList.map(({ name, label }) => {
              const IconComp = getIconComponent(name);
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={label}
                  onClick={() => onChange(name)}
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
                    <IconComp className="size-4" />
                  </div>
                  <span className="w-full truncate text-center text-[10px] leading-tight">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nest List Panel ───────────────────────────────────────────────────────────

function NestListPanel({
  nests,
  activeNestId,
  onEdit,
  onCreate,
  onSetActive,
  onLeave,
  onSetDefault,
}: {
  nests: AppUserNest[];
  activeNestId: string | null;
  onEdit: (nest: AppUserNest) => void;
  onCreate: () => void;
  onSetActive: (nestId: string) => void;
  onLeave: (nest: AppUserNest) => void;
  onSetDefault: (nestId: string) => void;
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="space-y-3 overflow-y-auto pr-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Seus Ninhos</h3>
            <p className="text-xs text-muted-foreground">
              Selecione o ninho ativo para gerenciar suas tarefas e finanças.
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-muted/40">
            {nests.length} {nests.length === 1 ? 'ninho' : 'ninhos'}
          </Badge>
        </div>

        {nests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <Home className="size-6" />
            </div>
            <p className="text-sm font-medium">Nenhum ninho encontrado</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
              Crie seu primeiro ninho para começar a organizar sua rotina doméstica.
            </p>
            <Button size="sm" className="mt-4" onClick={onCreate}>
              <Plus className="mr-1.5 size-4" /> Criar Ninho
            </Button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {nests.map((nest) => {
              const Icon = getIconComponent(nest.icon);
              const isActive = nest.nestId === activeNestId;
              const canManage = nest.role === NestRole.Owner || nest.role === NestRole.Admin;

              const content = (
                <div
                  className={cn(
                    'group relative flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all duration-200',
                    isActive
                      ? 'border-primary/40 bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-border/40 bg-card hover:border-border/80 hover:bg-accent/30'
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
                    onClick={() => !isActive && onSetActive(nest.nestId)}
                  >
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-colors',
                        isActive
                          ? 'border-primary/40 bg-background text-primary'
                          : 'border-border/50 bg-muted/40 text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {nest.name}
                        </span>
                        {nest.isDefault && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center">
                                  <Star className="size-3.5 text-amber-500 fill-amber-500/20" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Ninho Principal</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isActive && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1 py-0 px-2"
                          >
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ativo
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <RoleBadge role={nest.role} className="h-5 px-2 text-[10px]" />
                      </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    {!nest.isDefault && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(nest.nestId);
                              }}
                              title="Definir como ninho principal"
                              aria-label="Definir como ninho principal"
                            >
                              <Star className="size-4 text-muted-foreground/60 hover:text-amber-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Definir como ninho principal</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {canManage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => onEdit(nest)}
                        title="Editar ninho"
                        aria-label="Editar ninho"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    )}
                    {isActive && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onLeave(nest)}
                        title="Sair do ninho"
                        aria-label="Sair do ninho"
                      >
                        <LogOut className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );

              return reducedMotion ? (
                <div key={nest.nestId}>{content}</div>
              ) : (
                <motion.div
                  key={nest.nestId}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                >
                  {content}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button
          variant="outline"
          className="w-full justify-center border-dashed border-border/70 bg-muted/20 hover:bg-muted/60 hover:border-primary/50 transition-colors"
          onClick={onCreate}
        >
          <Plus className="mr-2 size-4 text-primary" />
          Criar Novo Ninho
        </Button>
      </div>
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────────────

type CreateFormValues = { name: string; description: string; icon?: string | null };

function CreateNestForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { createNest } = useApp();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(CreateNestRequestSchema) as never,
    defaultValues: { name: '', description: '', icon: 'koboyo:face-beaming' },
  });

  const selectedIcon = watch('icon') || 'koboyo:face-beaming';
  const nameValue = watch('name');
  const PreviewIcon = getIconComponent(selectedIcon);

  const onSubmit = async (data: CreateFormValues) => {
    try {
      await createNest(data);
      toast.success('Ninho criado com sucesso!');
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar ninho.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
      {/* Live Preview Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Pré-visualização
        </p>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-background text-primary shadow-xs">
            <PreviewIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {nameValue.trim() ? nameValue : 'Nome do Ninho'}
            </p>
            <p className="text-xs text-muted-foreground">Seu novo espaço de organização</p>
          </div>
        </div>
      </div>

      {/* Field: Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="create-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Nome do Ninho
        </Label>
        <Input
          id="create-name"
          placeholder="Ex: Casa Principal, Apartamento 102"
          className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
          {...register('name')}
        />
        {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
      </div>

      {/* Field: Descrição */}
      <div className="space-y-1.5">
        <Label htmlFor="create-desc" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Descrição (Opcional)
        </Label>
        <Textarea
          id="create-desc"
          placeholder="Ex: Nossa casa em São Paulo para controle de tarefas e finanças"
          rows={2}
          className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors resize-none"
          {...register('description')}
        />
      </div>

      {/* Icon Picker Component */}
      <IconPicker value={selectedIcon} onChange={(icon) => setValue('icon', icon)} />

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="size-4 animate-spin" /> Criando...
            </span>
          ) : (
            'Criar Ninho'
          )}
        </Button>
      </div>
    </form>
  );
}

// ── Info Panel ────────────────────────────────────────────────────────────────

function InfoPanel({
  nest,
  onBack,
  onDelete,
  onSetDefault,
}: {
  nest: AppUserNest;
  onBack: () => void;
  onDelete: () => void;
  onSetDefault: (nestId: string) => void;
}) {
  const { updateNest } = useApp();
  const isOwner = nest.role === NestRole.Owner;
  const [iconValue, setIconValue] = React.useState(nest.icon ?? 'Home');
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Omit<UpdateNestRequest, 'nestId'>>({
    defaultValues: { name: nest.name, description: '', icon: nest.icon ?? 'Home' },
  });

  const nameVal = watch('name');
  const PreviewIcon = getIconComponent(iconValue);

  const onSubmit = async (data: Omit<UpdateNestRequest, 'nestId'>) => {
    setIsSaving(true);
    try {
      await updateNest(nest.nestId, { ...data, icon: iconValue });
      toast.success('Ninho atualizado com sucesso!');
      onBack();
    } catch {
      toast.error('Erro ao atualizar ninho.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
      {/* Header Preview */}
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-2xs">
            <PreviewIcon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{nameVal || nest.name}</p>
            <div className="flex items-center gap-1.5 text-xs pt-0.5">
              <RoleBadge role={nest.role} className="h-5 px-2 text-[10px]" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nest.isDefault ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold gap-1 py-1 px-2.5">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              Ninho Principal
            </Badge>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => onSetDefault(nest.nestId)}
            >
              <Star className="size-3.5 text-amber-500" />
              Definir Principal
            </Button>
          )}
        </div>
      </div>

      {/* Field: Nome */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="edit-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            Nome do Ninho
            {!isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Somente o proprietário (Owner) pode alterar o nome.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
        </div>
        <Input
          id="edit-name"
          {...register('name')}
          disabled={!isOwner}
          className={cn(
            'bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors',
            !isOwner && 'opacity-60 cursor-not-allowed bg-muted/60'
          )}
        />
        {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
      </div>

      {/* Field: Descrição */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-desc" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Descrição
        </Label>
        <Textarea
          id="edit-desc"
          rows={2}
          className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors resize-none"
          {...register('description')}
        />
      </div>

      {/* Icon Picker */}
      <IconPicker value={iconValue} onChange={setIconValue} />

      {/* Actions */}
      <div className="flex items-center justify-between pt-3">
        {isOwner ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 size-4" />
            Excluir ninho
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ── Members Panel ─────────────────────────────────────────────────────────────

function MembersPanel({ nest }: { nest: AppUserNest }) {
  const { user } = useApp();
  const [members, setMembers] = React.useState<NestMember[]>([]);
  const [invites, setInvites] = React.useState<NestInvite[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviting, setInviting] = React.useState(false);
  const [removingMember, setRemovingMember] = React.useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = React.useState<NestMember | null>(null);

  const isOwner = nest.role === NestRole.Owner;
  const isAdmin = nest.role === NestRole.Admin;
  const canInvite = isOwner || isAdmin;

  React.useEffect(() => {
    let mounted = true;
    setLoadingData(true);
    setMembers([]);
    setInvites([]);
    Promise.all([
      nestService.getNestMembers(nest.nestId),
      nestService.getNestInvites(nest.nestId).catch(() => []),
    ])
      .then(([m, i]) => {
        if (!mounted) return;
        let list = m;
        if (list.length === 0 && user) {
          list = [
            {
              userId: user.id,
              name: user.name || user.callmeby || user.email || 'Você',
              nestId: nest.nestId,
              role: nest.role,
            },
          ];
        } else if (
          user &&
          !list.some(
            (mem) =>
              mem.userId === user.id ||
              mem.name.toLowerCase().includes('(você)') ||
              mem.name.toLowerCase().includes('(voce)')
          )
        ) {
          list = [
            {
              userId: user.id,
              name: user.name || user.callmeby || user.email || 'Você',
              nestId: nest.nestId,
              role: nest.role,
            },
            ...list,
          ];
        }
        list.sort((a, b) => {
          const roleA = typeof a.role === 'number' ? a.role : 99;
          const roleB = typeof b.role === 'number' ? b.role : 99;
          if (roleA !== roleB) return roleA - roleB;
          return a.name.localeCompare(b.name, 'pt-BR');
        });
        setMembers(list);
        setInvites(i ?? []);
        setLoadingData(false);
      })
      .catch(() => {
        if (!mounted) return;
        if (user) {
          setMembers([
            {
              userId: user.id,
              name: user.name || user.callmeby || user.email || 'Você',
              nestId: nest.nestId,
              role: nest.role,
            },
          ]);
        }
        setLoadingData(false);
      });
    return () => {
      mounted = false;
    };
  }, [nest.nestId, nest.role, user]);

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('E-mail inválido.');
      return;
    }
    setInviting(true);
    try {
      await nestService.inviteMember(email, nest.nestId);
      setInvites((prev) => [
        ...prev,
        {
          nestInviteId: crypto.randomUUID(),
          nestId: nest.nestId,
          email,
          role: NestRole.Member,
          status: InviteStatus.Pending,
          createdAtUtc: new Date().toISOString(),
        },
      ]);
      setInviteEmail('');
      toast.success(`Convite enviado para ${email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar convite.');
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (invite: NestInvite) => {
    try {
      await nestService.resendInvite(invite.nestInviteId, nest.nestId);
      toast.success(`Convite reenviado para ${invite.email}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao reenviar convite.');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(memberToRemove.userId);
    try {
      await nestService.removeMember(memberToRemove.userId, nest.nestId);
      setMembers((prev) => prev.filter((m) => m.userId !== memberToRemove.userId));
      toast.success(`${memberToRemove.name} removido do ninho.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover membro.');
    } finally {
      setRemovingMember(null);
      setMemberToRemove(null);
    }
  };

  const pendingInvites = invites.filter((i) => i.status === InviteStatus.Pending);
  const pastInvites = invites.filter((i) => i.status !== InviteStatus.Pending);

  return (
    <>
      <div className="space-y-6 pt-1">
        {/* Members list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Membros do Ninho</h3>
              <p className="text-xs text-muted-foreground">Pessoas com acesso a este ninho.</p>
            </div>
            <Badge variant="outline" className="text-xs bg-muted/40">
              {members.length} {members.length === 1 ? 'membro' : 'membros'}
            </Badge>
          </div>

          {loadingData ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-muted/60" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado.
            </p>
          ) : (
            <div className="grid gap-2">
              {members.map((member) => {
                const isSelf = member.userId === user?.id;
                const displayName = member.name || 'Membro';
                const initial = displayName.replace(/\(Você\)/i, '').trim().charAt(0).toUpperCase() || 'M';
                const avatarSrc = resolveUserAvatar(member.photoUrl, member.avatarSlug);

                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-9 shrink-0 border border-slate-200 bg-white p-0.5 shadow-2xs">
                        {avatarSrc && (
                          <AvatarImage src={avatarSrc} alt={displayName} className="size-full object-contain" />
                        )}
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="truncate text-sm font-medium text-foreground block">
                          {displayName}
                          {isSelf && !displayName.toLowerCase().includes('(você)') && !displayName.toLowerCase().includes('(voce)') && (
                            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(você)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={member.role} className="h-6 px-2 text-xs" />
                      {isOwner && !isSelf && member.role !== NestRole.Owner && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          disabled={!!removingMember}
                          onClick={() => setMemberToRemove(member)}
                          title="Remover membro"
                          aria-label="Remover membro"
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite section */}
        {canInvite && (
          <>
            <Separator className="bg-border/60" />
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Convidar Novo Membro</h3>
                <p className="text-xs text-muted-foreground">Envie um convite por e-mail para participar deste ninho.</p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="email@exemplo.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleInvite())}
                  disabled={inviting}
                  className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
                />
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="shrink-0"
                >
                  {inviting ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-1.5 size-4" /> Convidar
                    </>
                  )}
                </Button>
              </div>

              {invites.length === 0 && !loadingData && (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center">
                  <Mail className="mx-auto size-5 text-muted-foreground/60" />
                  <p className="mt-1 text-xs text-muted-foreground font-medium">
                    Nenhum membro foi convidado no momento.
                  </p>
                </div>
              )}

              {pendingInvites.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Convites Pendentes ({pendingInvites.length})
                  </p>
                  <div className="grid gap-1.5">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.nestInviteId}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="size-3.5 shrink-0 text-amber-500" />
                          <span className="truncate text-foreground font-medium">{invite.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant={inviteStatusVariant(invite.status)} className="text-[10px] h-5">
                            {inviteStatusLabel(invite.status)}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-foreground"
                            onClick={() => handleResend(invite)}
                            title="Reenviar convite"
                            aria-label="Reenviar convite"
                          >
                            <RefreshCw className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pastInvites.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Histórico de Convites
                  </p>
                  <div className="grid gap-1.5">
                    {pastInvites.map((invite) => (
                      <div
                        key={invite.nestInviteId}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/30 bg-muted/10 px-3 py-2 text-xs text-muted-foreground"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate">{invite.email}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={inviteStatusVariant(invite.status)} className="text-[10px] h-5">
                            {inviteStatusLabel(invite.status)}
                          </Badge>
                          <span className="text-[10px] opacity-75">
                            {formatDate(invite.createdAtUtc)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(v) => {
          if (!v) setMemberToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberToRemove?.name}</strong> deste ninho?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!removingMember}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={!!removingMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removingMember ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Leave / Delete dialogs ────────────────────────────────────────────────────

function LeaveNestDialog({
  nest,
  memberCount,
  isOnlyNest,
  onConfirm,
  onClose,
}: {
  nest: AppUserNest;
  memberCount: number;
  isOnlyNest: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const isOwner = nest.role === NestRole.Owner;
  const ownerBlocked = isOwner && memberCount > 0;
  const needsConfirmText = isOwner;
  const confirmed = !needsConfirmText || confirmText === nest.name;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            {isOwner ? 'Sair do ninho (Owner)' : 'Sair do ninho'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm">
              {isOnlyNest ? (
                <p>Este é o seu único ninho. Não é possível sair sem ter outro ninho disponível.</p>
              ) : ownerBlocked ? (
                <p>
                  Você é o <strong>Owner</strong> e ainda há{' '}
                  <strong>{memberCount} membro(s)</strong> neste ninho. Remova todos os membros
                  antes de sair.
                </p>
              ) : (
                <>
                  <p>
                    Você está prestes a sair de <strong>&ldquo;{nest.name}&rdquo;</strong>.
                    {isOwner && ' Como Owner, esta ação é irreversível.'}
                  </p>
                  {needsConfirmText && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Digite <strong>{nest.name}</strong> para confirmar:
                      </p>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={nest.name}
                        disabled={loading}
                        className="bg-muted/30 border-border/40"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          {!isOnlyNest && !ownerBlocked && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading || !confirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Saindo...' : 'Sair do ninho'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteNestDialog({
  nest,
  memberCount,
  onConfirm,
  onClose,
}: {
  nest: AppUserNest;
  memberCount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const confirmed = confirmText === nest.name;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            Excluir ninho
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-sm">
              {memberCount > 0 ? (
                <p>
                  O ninho ainda tem <strong>{memberCount} membro(s)</strong>. Remova todos antes de
                  excluir.
                </p>
              ) : (
                <>
                  <p>
                    Esta ação é <strong>permanente</strong> e não pode ser desfeita. Todos os dados
                    de <strong>&ldquo;{nest.name}&rdquo;</strong> serão perdidos.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Digite <strong>{nest.name}</strong> para confirmar:
                    </p>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={nest.name}
                      disabled={loading}
                      className="bg-muted/30 border-border/40"
                    />
                  </div>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          {memberCount === 0 && (
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading || !confirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Excluindo...' : 'Excluir ninho'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

interface NestManagerModalProps {
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function NestManagerModal({ open, onClose, onOpenChange }: NestManagerModalProps) {
  const { user, activeNestId, setActiveNestId, deleteNest, leaveNest, setDefaultNest } = useApp();
  const nests = user?.nests ?? [];
  const reducedMotion = usePrefersReducedMotion();

  const [mode, setMode] = React.useState<Mode>('list');
  const [editingNest, setEditingNest] = React.useState<AppUserNest | null>(null);
  const [editSection, setEditSection] = React.useState<EditSection>('info');
  const [leaveTarget, setLeaveTarget] = React.useState<AppUserNest | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AppUserNest | null>(null);
  const [memberCounts, setMemberCounts] = React.useState<Record<string, number>>({});
  const fetchedNests = React.useRef<Set<string>>(new Set());

  const fetchMemberCount = React.useCallback(
    async (nestId: string) => {
      if (fetchedNests.current.has(nestId)) return;
      fetchedNests.current.add(nestId);
      try {
        const members = await nestService.getNestMembers(nestId);
        setMemberCounts((prev) => ({
          ...prev,
          [nestId]: members.filter((m) => m.userId !== user?.id).length,
        }));
      } catch {
        fetchedNests.current.delete(nestId);
      }
    },
    [user?.id]
  );

  const handleClose = () => {
    setMode('list');
    setEditingNest(null);
    setEditSection('info');
    onClose?.();
    onOpenChange?.(false);
  };

  const handleEdit = (nest: AppUserNest) => {
    setEditingNest(nest);
    setEditSection('info');
    setMode('edit');
  };

  const handleBackToList = () => {
    setMode('list');
    setEditingNest(null);
    setEditSection('info');
  };

  const handleSetDefault = async (nestId: string) => {
    try {
      await setDefaultNest(nestId);
      toast.success('Ninho definido como principal!');
    } catch {
      toast.error('Erro ao definir ninho como principal.');
    }
  };

  const handleLeave = async () => {
    if (!leaveTarget) return;
    try {
      await leaveNest(leaveTarget.nestId);
      toast.success('Você saiu do ninho.');
      setLeaveTarget(null);
      handleClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao sair do ninho.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNest(deleteTarget.nestId);
      toast.success('Ninho excluído.');
      setDeleteTarget(null);
      handleClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir ninho.');
    }
  };

  const isEditMode = mode === 'edit' && editingNest !== null;
  const EditIcon = editingNest ? getIconComponent(editingNest.icon) : null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
      >
        <DialogContent
          hideBuiltinClose
          className="inset-0 flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-2xl md:inset-auto md:left-[50%] md:top-[50%] md:h-[85vh] md:max-w-4xl md:translate-x-[-50%] md:translate-y-[-50%] md:flex-row md:rounded-2xl md:border md:border-border/60"
        >
          <VisuallyHidden.Root>
            <DialogTitle>Gerenciar Ninhos</DialogTitle>
          </VisuallyHidden.Root>

          {/* Mobile Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-xs px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              {isEditMode || mode === 'create' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="size-4" />
                </Button>
              ) : null}
              <span className="text-base font-semibold">
                {isEditMode
                  ? editingNest.name
                  : mode === 'create'
                    ? 'Novo ninho'
                    : 'Gerenciar Ninhos'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>

          {/* ── Edit Mode Navigation & View ── */}
          {isEditMode ? (
            <>
              {/* Desktop Sidebar Navigation for Edit Mode */}
              <nav className="hidden w-64 shrink-0 flex-col justify-between border-r border-border/50 bg-muted/20 p-4 md:flex">
                <div className="space-y-3">
                  {/* Brand / Nest Identity Header */}
                  <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3">
                    <div className="flex items-center gap-3">
                      {EditIcon && (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-background text-primary shadow-xs">
                          <EditIcon className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{editingNest.name}</p>
                        <div className="flex items-center gap-1 text-xs pt-0.5">
                          <RoleBadge role={editingNest.role} className="h-4 px-1.5 text-[9px] py-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" /> Voltar aos ninhos
                  </button>

                  <Separator className="bg-border/60" />

                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu do Ninho
                  </p>
                  <div className="space-y-1">
                    {EDIT_SECTIONS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setEditSection(id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all',
                          editSection === id
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-2xs font-semibold'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground text-center">
                  Organizando seu lar 🪺
                </div>
              </nav>

              {/* Mobile horizontal tab bar */}
              <nav className="flex shrink-0 border-b border-border/50 bg-background md:hidden">
                {EDIT_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setEditSection(id)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors',
                      editSection === id
                        ? 'border-b-2 border-primary font-semibold text-primary'
                        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              {/* Edit content panel */}
              <main className="flex-1 overflow-y-auto bg-background p-6">
                {/* Desktop Header */}
                <div className="mb-6 hidden items-center justify-between pb-3 border-b border-border/40 md:flex">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {EDIT_SECTIONS.find((s) => s.id === editSection)?.label}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Gerencie as opções do seu ninho &quot;{editingNest.name}&quot;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {reducedMotion ? (
                  <div>
                    {editSection === 'info' && (
                      <InfoPanel
                        nest={editingNest}
                        onBack={handleBackToList}
                        onSetDefault={handleSetDefault}
                        onDelete={() => {
                          fetchMemberCount(editingNest.nestId);
                          setDeleteTarget(editingNest);
                        }}
                      />
                    )}
                    {editSection === 'members' && <MembersPanel nest={editingNest} />}
                    {editSection === 'categories' && <CategoriesPanel nest={editingNest} />}
                    {editSection === 'permissions' && <NestConfigurationPanel nest={editingNest} />}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={editSection}
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={transitions.fast}
                    >
                      {editSection === 'info' && (
                        <InfoPanel
                          nest={editingNest}
                          onBack={handleBackToList}
                          onSetDefault={handleSetDefault}
                          onDelete={() => {
                            fetchMemberCount(editingNest.nestId);
                            setDeleteTarget(editingNest);
                          }}
                        />
                      )}
                      {editSection === 'members' && <MembersPanel nest={editingNest} />}
                      {editSection === 'categories' && <CategoriesPanel nest={editingNest} />}
                      {editSection === 'permissions' && <NestConfigurationPanel nest={editingNest} />}
                    </motion.div>
                  </AnimatePresence>
                )}
              </main>
            </>
          ) : (
            /* ── List / Create Mode Navigation & Content ── */
            <>
              {/* Desktop Sidebar */}
              <nav className="hidden w-64 shrink-0 flex-col justify-between border-r border-border/50 bg-muted/20 p-4 md:flex">
                <div className="space-y-4">
                  {/* App Brand Header */}
                  <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 shadow-2xs">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg border border-primary/20">
                      🪺
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Ninhos</h3>
                      <p className="text-xs text-muted-foreground">Gestão de Lares</p>
                    </div>
                  </div>

                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu Principal
                  </p>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setMode('list')}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all',
                        mode === 'list'
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-2xs font-semibold'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="size-4 shrink-0" />
                        <span>Meus Ninhos</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                        {nests.length}
                      </Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('create')}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all',
                        mode === 'create'
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-2xs font-semibold'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <Plus className="size-4 shrink-0" />
                      <span>Novo Ninho</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground text-center">
                  Ninho v2.0 • PWA
                </div>
              </nav>

              {/* Main Content Pane */}
              <main className="flex-1 overflow-y-auto bg-background p-6">
                {/* Desktop Close & Header */}
                <div className="mb-6 hidden items-center justify-between pb-3 border-b border-border/40 md:flex">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {mode === 'create' ? 'Criar Novo Ninho' : 'Gerenciar Ninhos'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {mode === 'create'
                        ? 'Cadastre um novo espaço para gerenciar com sua família ou equipe'
                        : 'Troque de ninho ativo ou edite suas preferências'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {reducedMotion ? (
                  <div>
                    {mode === 'list' && (
                      <NestListPanel
                        nests={nests}
                        activeNestId={activeNestId}
                        onEdit={handleEdit}
                        onCreate={() => setMode('create')}
                        onSetActive={(id) => setActiveNestId(id)}
                        onLeave={(nest) => {
                          fetchMemberCount(nest.nestId);
                          setLeaveTarget(nest);
                        }}
                        onSetDefault={handleSetDefault}
                      />
                    )}
                    {mode === 'create' && (
                      <CreateNestForm
                        onSuccess={() => setMode('list')}
                        onCancel={() => setMode('list')}
                      />
                    )}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={transitions.fast}
                    >
                      {mode === 'list' && (
                        <NestListPanel
                          nests={nests}
                          activeNestId={activeNestId}
                          onEdit={handleEdit}
                          onCreate={() => setMode('create')}
                          onSetActive={(id) => setActiveNestId(id)}
                          onLeave={(nest) => {
                            fetchMemberCount(nest.nestId);
                            setLeaveTarget(nest);
                          }}
                          onSetDefault={handleSetDefault}
                        />
                      )}
                      {mode === 'create' && (
                        <CreateNestForm
                          onSuccess={() => setMode('list')}
                          onCancel={() => setMode('list')}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </main>
            </>
          )}
        </DialogContent>
      </Dialog>

      {leaveTarget && (
        <LeaveNestDialog
          nest={leaveTarget}
          memberCount={memberCounts[leaveTarget.nestId] ?? 0}
          isOnlyNest={nests.length <= 1}
          onConfirm={handleLeave}
          onClose={() => setLeaveTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteNestDialog
          nest={deleteTarget}
          memberCount={memberCounts[deleteTarget.nestId] ?? 0}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
