import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Checkbox,
  Input,
  Label,
  Separator,
} from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import {
  updateProfileSchema,
  updateUsernameSchema,
  type UpdateProfileData,
  type UpdateUsernameData,
} from '@/schemas/settingsSchemas';
import * as settingsService from '@/services/settingsService';

export function ContaPanel() {
  const { user, loadUserProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    tasks: true,
    financial: true,
    shopping: true,
    notices: true,
  });

  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      callmeby: user?.callmeby ?? '',
    },
  });

  const usernameForm = useForm<UpdateUsernameData>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: { username: '' },
  });

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setIsUploadingAvatar(true);
    try {
      await settingsService.uploadAvatar(file);
      await loadUserProfile();
      toast.success('Foto atualizada!');
    } catch {
      toast.error('Erro ao enviar foto.');
      setAvatarPreview(user?.avatar);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await settingsService.removeAvatar();
      setAvatarPreview(undefined);
      await loadUserProfile();
      toast.success('Foto removida.');
    } catch {
      toast.error('Erro ao remover foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onProfileSubmit = async (data: UpdateProfileData) => {
    try {
      await settingsService.updateProfile(data);
      await loadUserProfile();
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao atualizar perfil.');
    }
  };

  const onUsernameSubmit = async (data: UpdateUsernameData) => {
    try {
      await settingsService.updateUsername(data);
      toast.success('Username atualizado!');
    } catch {
      toast.error('Erro ao atualizar username.');
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifications, checked: boolean) => {
    const next = { ...notifications, [key]: checked };
    setNotifications(next);
    try {
      await settingsService.updateNotifications(next);
    } catch {
      setNotifications(notifications);
      toast.error('Erro ao salvar notificações.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Conta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as informações da sua conta.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-border">
          <AvatarImage src={avatarPreview} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(user?.name ?? 'U')}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
          >
            {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
          </Button>
          {avatarPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isUploadingAvatar}
              className="text-destructive hover:text-destructive"
            >
              Remover
            </Button>
          )}
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" {...profileForm.register('name')} />
          {profileForm.formState.errors.name && (
            <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...profileForm.register('email')} />
          {profileForm.formState.errors.email && (
            <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="callmeby">Apelido</Label>
          <Input id="callmeby" {...profileForm.register('callmeby')} placeholder="Como prefere ser chamado?" />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={profileForm.formState.isSubmitting}
        >
          {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar perfil'}
        </Button>
      </form>

      <Separator />

      {/* Username */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Perfil público</h3>
        <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...usernameForm.register('username')} placeholder="@seunome" />
            {usernameForm.formState.errors.username && (
              <p className="text-xs text-destructive">{usernameForm.formState.errors.username.message}</p>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={usernameForm.formState.isSubmitting}
          >
            {usernameForm.formState.isSubmitting ? 'Salvando...' : 'Atualizar username'}
          </Button>
        </form>
      </div>

      <Separator />

      {/* Notifications */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Notificações</h3>
        <div className="space-y-3">
          {(
            [
              { key: 'tasks' as const, label: 'Tarefas' },
              { key: 'financial' as const, label: 'Financeiro' },
              { key: 'shopping' as const, label: 'Compras' },
              { key: 'notices' as const, label: 'Aviso do Ninho' },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <Checkbox
                id={`notif-${key}`}
                checked={notifications[key]}
                onCheckedChange={(checked) => handleNotificationToggle(key, Boolean(checked))}
              />
              <label htmlFor={`notif-${key}`} className="text-sm cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
