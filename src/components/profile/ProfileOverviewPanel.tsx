import { Building2, Mail, UserCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage, Badge, Separator } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function ProfileOverviewPanel() {
  const { user } = useApp();

  if (!user) return null;

  const primaryNest = user.nests?.find((nest) => nest.isDefault) ?? user.nests?.[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Hero Banner Header */}
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Perfil
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Visão geral do seu perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe o estado da sua conta, ninho ativo e dados cadastrais no Ninho.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <Avatar className="h-16 w-16 overflow-hidden rounded-full border-2 border-slate-200 bg-white p-1 shadow-xs">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-none text-foreground">{user.name}</h3>
            <Badge variant="secondary" className="rounded-md">
              Ativo
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.callmeby || 'Sem apelido definido'}</p>
          <div className="space-y-1 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground/80" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground/80" />
              <span>{primaryNest?.name ?? 'Sem ninho principal'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ninhos
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{user.nests?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">vinculados à sua conta</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Apelido
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{user.callmeby || user.name}</p>
          <p className="text-xs text-muted-foreground">como o Ninho te chama</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-2xs">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sessão
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">Online</p>
          <p className="text-xs text-muted-foreground">sessão ativa no aplicativo</p>
        </div>
      </div>

      <Separator />

      {/* Guidance Tip */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Dica de Gestão</h3>
        </div>
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use as abas de <strong className="font-medium text-foreground">Dados da Conta</strong> e{' '}
            <strong className="font-medium text-foreground">Segurança</strong> para atualizar seus
            dados pessoais, avatar exclusivo e alterar sua senha de acesso.
          </p>
        </div>
      </div>
    </div>
  );
}

