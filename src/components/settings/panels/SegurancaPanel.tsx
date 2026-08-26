import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
  Separator,
} from '@/components/ui';
import { type ChangePasswordData, changePasswordSchema } from '@/schemas/settingsSchemas';
import * as settingsService from '@/services/settingsService';

export function SegurancaPanel() {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    try {
      await settingsService.changePassword(data);
      toast.success('Senha alterada com sucesso!');
      reset();
      setPasswordOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha.';
      toast.error(message);
    }
  };

  const handleLogoutOthers = async () => {
    setIsLoggingOut(true);
    try {
      await settingsService.logoutOtherDevices();
      toast.success('Logout realizado em outros dispositivos.');
    } catch {
      toast.error('Erro ao realizar logout em outros dispositivos.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--destructive)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Segurança
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Proteção da sua conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie sua senha e acesso ao Ninho.</p>
      </div>

      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Senha de Acesso</h3>
            <p className="text-xs text-muted-foreground">
              Altere sua senha periodicamente para manter a conta segura.
            </p>
          </div>
        </div>

        <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl">
              <span>{passwordOpen ? 'Fechar Formulário' : 'Alterar Senha'}</span>
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${passwordOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4"
            >
              <div className="space-y-1.5">
                <Label
                  htmlFor="currentPassword"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Senha atual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
                  {...register('currentPassword')}
                />
                {errors.currentPassword && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="newPassword"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Nova senha
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Confirmar nova senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" className="rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    reset();
                    setPasswordOpen(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CollapsibleContent>
        </Collapsible>

        <div className="pt-2 border-t border-border/40">
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl"
            onClick={handleLogoutOthers}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Saindo...' : 'Logout de outros dispositivos'}
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <h3 className="text-sm font-semibold text-foreground">Avançado / Social Login</h3>
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 p-4">
          <p className="text-xs text-muted-foreground">Autenticação social via Google/Apple em breve.</p>
          <Badge variant="secondary" className="rounded-md text-[10px]">Em breve</Badge>
        </div>
      </section>
    </div>
  );
}

