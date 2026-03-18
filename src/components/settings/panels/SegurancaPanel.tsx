import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ChevronDown } from 'lucide-react';
import { changePasswordSchema, type ChangePasswordData } from '@/schemas/settingsSchemas';
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
      <div>
        <h2 className="text-lg font-semibold">Segurança</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua senha e acesso ao Ninho.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Senha</h3>

        <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              Alterar Senha
              <ChevronDown className={`size-4 transition-transform ${passwordOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3 rounded-lg border p-4">
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
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar senha'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
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
          onClick={handleLogoutOthers}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Saindo...' : 'Logout de outros dispositivos'}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Avançado / Social Login</h3>
        <div className="rounded-lg border border-dashed p-4 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Em breve</p>
          <Badge variant="secondary">Em breve</Badge>
        </div>
      </div>
    </div>
  );
}
