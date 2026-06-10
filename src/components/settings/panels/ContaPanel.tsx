import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Label,
  Separator,
} from '@/components/ui';
import { useApp } from '@/contexts/AppContext';
import {
  type UpdateProfileData,
  updateProfileSchema,
  type UpdateUsernameData,
  updateUsernameSchema,
} from '@/schemas/settingsSchemas';
import * as settingsService from '@/services/settingsService';

export function ContaPanel() {
  const { user, loadUserProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
      const [firstName, ...rest] = data.name.trim().split(' ');
      await settingsService.updateProfile({
        firstName: firstName ?? data.name,
        lastName: rest.join(' ') || (firstName ?? ''),
        callbyName: data.callmeby ?? data.name,
      });
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border p-5 sm:p-6 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)]">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">Conta</p>
        <h2 className="mt-1 text-lg font-semibold">Dados da sua conta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as informações da sua conta.
        </p>
      </div>

      {/* Avatar */}
      <section className="rounded-2xl border p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(user?.name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Foto de perfil</p>
              <p className="text-xs text-muted-foreground">Use uma imagem para facilitar sua identificação.</p>
            </div>
          </div>
          <Badge variant="secondary">Conta ativa</Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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
            className="rounded-2xl"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
          >
            {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
          </Button>
          {avatarPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-2xl text-destructive hover:text-destructive"
              onClick={handleRemoveAvatar}
              disabled={isUploadingAvatar}
            >
              Remover
            </Button>
          )}
        </div>
      </section>

      {/* Profile form */}
      <section className="rounded-2xl border p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold">Informações pessoais</h3>
          <p className="text-xs text-muted-foreground mt-1">Esses dados aparecem no seu perfil dentro do Ninho.</p>
        </div>

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
            className="rounded-2xl"
            disabled={profileForm.formState.isSubmitting}
          >
            {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar perfil'}
          </Button>
        </form>
      </section>

      <Separator />

      {/* Username */}
      <section className="space-y-3 rounded-2xl border p-4 bg-card/60">
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
            className="rounded-2xl"
            disabled={usernameForm.formState.isSubmitting}
          >
            {usernameForm.formState.isSubmitting ? 'Salvando...' : 'Atualizar username'}
          </Button>
        </form>
      </section>

      <Separator />
    </div>
  );
}
