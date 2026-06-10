import { zodResolver } from '@hookform/resolvers/zod';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
  AlertTriangle,
  Check,
  Clock,
  Crown,
  Info,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Trash2,
  User,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { CURATED_NEST_ICONS, getIconComponent } from '@/lib/nestIcons';
import { cn } from '@/lib/utils';
import { InviteStatus, NestRole } from '@/schemas/enums';
import type { NestInvite, NestMember } from '@/schemas/nest';
import { CreateNestRequestSchema, type UpdateNestRequest } from '@/schemas/nest';
import * as nestService from '@/services/nestService';
import type { AppUserNest } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'list' | 'create' | 'edit';
type EditSection = 'info' | 'members' | 'permissions';

// ── Helpers ───────────────────────────────────────────────────────────────────

function roleLabel(role: number): string {
  if (role === NestRole.Owner) return 'Dono';
  if (role === NestRole.Admin) return 'Admin';
  return 'Membro';
}

function roleIcon(role: number) {
  if (role === NestRole.Owner) return <Crown className="size-3" />;
  if (role === NestRole.Admin) return <Shield className="size-3" />;
  return <User className="size-3" />;
}

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

// ── Edit Nav ──────────────────────────────────────────────────────────────────

const EDIT_SECTIONS: { id: EditSection; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Informações do Ninho', icon: Info },
  { id: 'members', label: 'Membros & Convites', icon: Users },
  { id: 'permissions', label: 'Permissões', icon: Shield },
];

// ── Nest List Panel ───────────────────────────────────────────────────────────

function NestListPanel({
  nests,
  activeNestId,
  onEdit,
  onCreate,
  onSetActive,
  onLeave,
}: {
  nests: AppUserNest[];
  activeNestId: string | null;
  onEdit: (nest: AppUserNest) => void;
  onCreate: () => void;
  onSetActive: (nestId: string) => void;
  onLeave: (nest: AppUserNest) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-1 overflow-y-auto py-2">
        {nests.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum ninho encontrado.
          </p>
        ) : (
          nests.map((nest) => {
            const Icon = getIconComponent(nest.icon);
            const isActive = nest.nestId === activeNestId;
            const canManage = nest.role === NestRole.Owner || nest.role === NestRole.Admin;
            return (
              <div
                key={nest.nestId}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive ? 'bg-primary/10 border-primary/20 border' : 'hover:bg-muted'
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => !isActive && onSetActive(nest.nestId)}
                >
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-md border',
                      isActive ? 'bg-primary/10 border-primary/30' : 'bg-background'
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{nest.name}</span>
                      {nest.isDefault && <Star className="size-3 shrink-0 text-amber-500" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {roleIcon(nest.role)}
                      <span>{roleLabel(nest.role)}</span>
                    </div>
                  </div>
                  {isActive && <Check className="size-4 shrink-0 text-primary" />}
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {canManage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => onEdit(nest)}
                      title="Editar ninho"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  )}
                  {isActive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onLeave(nest)}
                      title="Sair do ninho"
                    >
                      <LogOut className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <Separator />
      <div className="pt-3">
        <Button variant="outline" className="w-full" onClick={onCreate}>
          <Plus className="mr-2 size-4" />
          Novo ninho
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
    defaultValues: { name: '', description: '', icon: 'Home' },
  });
  const selectedIcon = watch('icon');

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label htmlFor="create-name">Nome</Label>
        <Input id="create-name" placeholder="Ex: Casa Principal" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="create-desc">Descrição</Label>
        <Textarea
          id="create-desc"
          placeholder="Ex: Nossa casa em São Paulo"
          rows={2}
          {...register('description')}
        />
      </div>
      <div className="space-y-2">
        <Label>Ícone</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {CURATED_NEST_ICONS.map(({ name, label }) => {
            const Icon = getIconComponent(name);
            return (
              <button
                key={name}
                type="button"
                title={label}
                onClick={() => setValue('icon', name)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md p-1.5 text-xs transition-colors',
                  selectedIcon === name
                    ? 'bg-primary/10 text-primary ring-2 ring-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className="size-4" />
                <span className="w-full truncate text-center leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
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
          {isSubmitting ? 'Criando...' : 'Criar ninho'}
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
}: {
  nest: AppUserNest;
  onBack: () => void;
  onDelete: () => void;
}) {
  const { updateNest } = useApp();
  const isOwner = nest.role === NestRole.Owner;
  const [iconValue, setIconValue] = React.useState(nest.icon ?? 'Home');
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<UpdateNestRequest, 'nestId'>>({
    defaultValues: { name: nest.name, description: '', icon: nest.icon ?? 'Home' },
  });

  const onSubmit = async (data: Omit<UpdateNestRequest, 'nestId'>) => {
    setIsSaving(true);
    try {
      await updateNest(nest.nestId, { ...data, icon: iconValue });
      toast.success('Ninho atualizado!');
      onBack();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="edit-name">
          Nome
          {!isOwner && <span className="ml-1 text-xs text-muted-foreground">(somente Owner)</span>}
        </Label>
        <Input
          id="edit-name"
          {...register('name')}
          disabled={!isOwner}
          className={!isOwner ? 'opacity-60' : ''}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="edit-desc">Descrição</Label>
        <Textarea id="edit-desc" rows={2} {...register('description')} />
      </div>

      <div className="space-y-2">
        <Label>Ícone</Label>
        <div className="grid grid-cols-6 gap-1.5">
          {CURATED_NEST_ICONS.map(({ name, label }) => {
            const Ic = getIconComponent(name);
            return (
              <button
                key={name}
                type="button"
                title={label}
                onClick={() => setIconValue(name)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md p-1.5 text-xs transition-colors',
                  iconValue === name
                    ? 'bg-primary/10 text-primary ring-2 ring-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Ic className="size-4" />
                <span className="w-full truncate text-center leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        {isOwner && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:bg-destructive/10 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 size-4" />
            Excluir ninho
          </Button>
        )}
        <Button type="submit" className="ml-auto" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
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
    Promise.all([nestService.getNestMembers(nest.nestId), nestService.getNestInvites(nest.nestId)])
      .then(([m, i]) => {
        if (!mounted) return;
        setMembers(m);
        setInvites(i);
        setLoadingData(false);
      })
      .catch(() => {
        if (mounted) setLoadingData(false);
      });
    return () => {
      mounted = false;
    };
  }, [nest.nestId]);

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
      <div className="space-y-6">
        {/* Members list */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Membros</h3>
            <Badge variant="secondary" className="text-xs">
              {members.length}
            </Badge>
          </div>

          {loadingData ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">
              Nenhum membro encontrado.
            </p>
          ) : (
            <div className="space-y-1">
              {members.map((member) => {
                const isSelf = member.userId === user?.id;
                return (
                  <div
                    key={member.userId}
                    className="hover:bg-muted/50 flex items-center gap-2.5 rounded-md px-2 py-1.5"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-xs font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 truncate text-sm">
                      {member.name}
                      {isSelf && <span className="ml-1 text-muted-foreground">(você)</span>}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {roleIcon(member.role)}
                      <span>{roleLabel(member.role)}</span>
                    </div>
                    {isOwner && !isSelf && member.role !== NestRole.Owner && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 size-6 text-destructive hover:text-destructive"
                        disabled={!!removingMember}
                        onClick={() => setMemberToRemove(member)}
                        title="Remover membro"
                      >
                        <UserMinus className="size-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite section */}
        {canInvite && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Convidar membro</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="email@exemplo.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleInvite())}
                  disabled={inviting}
                />
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                >
                  {inviting ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </Button>
              </div>

              {pendingInvites.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Pendentes</p>
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.nestInviteId}
                      className="bg-muted/40 flex items-center gap-2 rounded-md px-2 py-1.5"
                    >
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm">{invite.email}</span>
                      <Badge variant={inviteStatusVariant(invite.status)} className="text-xs">
                        {inviteStatusLabel(invite.status)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => handleResend(invite)}
                        title="Reenviar convite"
                      >
                        <RefreshCw className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {pastInvites.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Histórico</p>
                  {pastInvites.map((invite) => (
                    <div
                      key={invite.nestInviteId}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5"
                    >
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm text-muted-foreground">
                        {invite.email}
                      </span>
                      <Badge variant={inviteStatusVariant(invite.status)} className="text-xs">
                        {inviteStatusLabel(invite.status)}
                      </Badge>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(invite.createdAtUtc)}
                      </span>
                    </div>
                  ))}
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
              Tem certeza que deseja remover <strong>{memberToRemove?.name}</strong> do ninho?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!removingMember}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={!!removingMember}
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
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
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            {isOwner ? 'Sair do ninho (Owner)' : 'Sair do ninho'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
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
                    Você está prestes a sair de <strong>"{nest.name}"</strong>.
                    {isOwner && ' Como Owner, esta ação é irreversível.'}
                  </p>
                  {needsConfirmText && (
                    <div className="space-y-1">
                      <p className="text-sm">
                        Digite <strong>{nest.name}</strong> para confirmar:
                      </p>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={nest.name}
                        disabled={loading}
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
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
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
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            Excluir ninho
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {memberCount > 0 ? (
                <p>
                  O ninho ainda tem <strong>{memberCount} membro(s)</strong>. Remova todos antes de
                  excluir.
                </p>
              ) : (
                <>
                  <p>
                    Esta ação é <strong>permanente</strong> e não pode ser desfeita. Todos os dados
                    de <strong>"{nest.name}"</strong> serão perdidos.
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Digite <strong>{nest.name}</strong> para confirmar:
                    </p>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={nest.name}
                      disabled={loading}
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
              className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
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
  onClose: () => void;
}

export function NestManagerModal({ open, onClose }: NestManagerModalProps) {
  const { user, activeNestId, setActiveNestId, deleteNest, leaveNest } = useApp();
  const nests = user?.nests ?? [];

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
    onClose();
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
          className="inset-0 flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 md:inset-auto md:left-[50%] md:top-[50%] md:h-[85vh] md:max-w-4xl md:translate-x-[-50%] md:translate-y-[-50%] md:flex-row md:rounded-lg"
        >
          <VisuallyHidden.Root>
            <DialogTitle>Gerenciar Ninhos</DialogTitle>
          </VisuallyHidden.Root>

          {/* Mobile header */}
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 md:hidden">
            <span className="text-base font-semibold">
              {isEditMode
                ? editingNest.name
                : mode === 'create'
                  ? 'Novo ninho'
                  : 'Gerenciar Ninhos'}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors"
            >
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>

          {/* ── Edit mode: sidebar + content ── */}
          {isEditMode ? (
            <>
              {/* Desktop sidebar */}
              <nav className="hidden w-56 shrink-0 flex-col gap-0.5 border-r p-3 md:flex">
                {/* Nest identity header */}
                <div className="mb-1 flex items-center gap-2.5 px-3 py-2">
                  {EditIcon && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                      <EditIcon className="size-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{editingNest.name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel(editingNest.role)}</p>
                  </div>
                </div>

                <Separator className="mb-1" />

                <button
                  type="button"
                  onClick={handleBackToList}
                  className="hover:bg-accent/60 mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  ← Todos os ninhos
                </button>

                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ninho
                </p>
                {EDIT_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setEditSection(id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                      editSection === id
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'hover:bg-accent/60 text-muted-foreground hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>

              {/* Mobile tab bar for edit sections */}
              <nav className="flex shrink-0 border-b md:hidden">
                {EDIT_SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setEditSection(id)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors',
                      editSection === id
                        ? 'border-b-2 border-primary font-medium text-primary'
                        : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              {/* Edit content */}
              <main className="flex-1 overflow-y-auto p-6">
                {/* Desktop close button */}
                <div className="mb-5 hidden items-center justify-between md:flex">
                  <h2 className="text-base font-semibold">
                    {EDIT_SECTIONS.find((s) => s.id === editSection)?.label}
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {editSection === 'info' && (
                  <InfoPanel
                    nest={editingNest}
                    onBack={handleBackToList}
                    onDelete={() => {
                      fetchMemberCount(editingNest.nestId);
                      setDeleteTarget(editingNest);
                    }}
                  />
                )}
                {editSection === 'members' && <MembersPanel nest={editingNest} />}
              </main>
            </>
          ) : (
            /* ── List / Create mode ── */
            <>
              {/* Desktop sidebar */}
              <nav className="hidden w-56 shrink-0 flex-col gap-0.5 border-r p-3 md:flex">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gerenciar Ninhos
                </p>
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    mode === 'list'
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'hover:bg-accent/60 text-muted-foreground hover:text-accent-foreground'
                  )}
                >
                  <Users className="size-4 shrink-0" />
                  Meus ninhos
                </button>
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    mode === 'create'
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'hover:bg-accent/60 text-muted-foreground hover:text-accent-foreground'
                  )}
                >
                  <Plus className="size-4 shrink-0" />
                  Novo ninho
                </button>
              </nav>

              {/* Main content */}
              <main className="flex-1 overflow-y-auto p-6">
                {/* Desktop close button + title */}
                <div className="mb-5 hidden items-center justify-between md:flex">
                  <h2 className="text-base font-semibold">
                    {mode === 'create' ? 'Novo ninho' : 'Meus ninhos'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="hover:bg-muted/80 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

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
                  />
                )}
                {mode === 'create' && (
                  <CreateNestForm
                    onSuccess={() => setMode('list')}
                    onCancel={() => setMode('list')}
                  />
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
