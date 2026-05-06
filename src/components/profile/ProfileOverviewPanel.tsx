import { Avatar, AvatarFallback, AvatarImage, Badge, Separator } from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import { Building2, Mail } from 'lucide-react';

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
      <div>
        <h2 className="text-lg font-semibold">Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral da sua conta e do seu acesso ao Ninho.
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-xl border p-4">
        <Avatar className="h-16 w-16 border-2 border-border">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-none">{user.name}</h3>
            <Badge variant="secondary">Ativo</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.callmeby || 'Sem apelido definido'}</p>
          <div className="space-y-1 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="size-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span>{primaryNest?.name ?? 'Sem ninho principal'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ninhos</p>
          <p className="mt-2 text-2xl font-semibold">{user.nests?.length ?? 0}</p>
          <p className="text-sm text-muted-foreground">vinculados à sua conta</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Apelido</p>
          <p className="mt-2 text-2xl font-semibold">{user.callmeby || user.name}</p>
          <p className="text-sm text-muted-foreground">como o Ninho vai te chamar</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Acesso</p>
          <p className="mt-2 text-2xl font-semibold">Online</p>
          <p className="text-sm text-muted-foreground">sessão ativa no aplicativo</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Dica</h3>
        <div className="rounded-xl border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            Use as abas de Conta e Segurança para atualizar seus dados de acesso e senha.
          </p>
        </div>
      </div>
    </div>
  );
}