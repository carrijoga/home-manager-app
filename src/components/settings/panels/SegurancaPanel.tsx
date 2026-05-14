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
import { type ChangePasswordData,changePasswordSchema } from '@/schemas/settingsSchemas';
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
      <div className="rounded-3xl border p-5 sm:p-6 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--destructive)_8%,var(--card))_100%)]">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">Segurança</p>
        <h2 className="mt-1 text-lg font-semibold">Proteção da sua conta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua senha e acesso ao Ninho.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border p-4">
        <h3 className="text-sm font-semibold">Senha</h3>

        <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-2xl">
              Alterar Senha
              <ChevronDown className={`size-4 transition-transform ${passwordOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3 rounded-2xl border p-4 bg-card/60">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword')}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="rounded-2xl" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar senha'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-2xl"
                  onClick={() => { reset(); setPasswordOpen(false); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CollapsibleContent>
        </Collapsible>

        <Button
          variant="destructive"
          size="sm"
          className="rounded-2xl"
          onClick={handleLogoutOthers}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Saindo...' : 'Logout de outros dispositivos'}
        </Button>
      </section>

      <Separator />

      <section className="space-y-2 rounded-2xl border p-4 bg-card/60">
        <h3 className="text-sm font-semibold">Avançado / Social Login</h3>
        <div className="rounded-xl border border-dashed p-4 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Em breve</p>
          <Badge variant="secondary">Em breve</Badge>
        </div>
      </section>
    </div>
  );
}
