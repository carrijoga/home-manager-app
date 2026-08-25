import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { KoboyoAvatarPickerModal } from '@/components/profile/KoboyoAvatarPickerModal';
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await settingsService.uploadAvatar(file);
      await loadUserProfile();
      toast.success('Foto de perfil atualizada!');
    } catch {
      toast.error('Erro ao enviar foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSelectKoboyoAvatar = async (slug: string) => {
    setIsUploadingAvatar(true);
    try {
      await settingsService.changeAvatarSlug(slug);
      await loadUserProfile();
      toast.success('Avatar atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await settingsService.removeAvatar();
      await loadUserProfile();
      toast.success('Foto personalizada removida! Revertido para o avatar de ilustração.');
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
      <div className="rounded-3xl border border-border/50 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card))_0%,color-mix(in_srgb,var(--secondary)_8%,var(--card))_100%)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
          Conta
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Dados da sua conta</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie as informações do seu perfil e o seu avatar exclusivo no Ninho.
        </p>
      </div>

      {/* Avatar Section */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 overflow-hidden rounded-full border-2 border-slate-200 bg-white p-1.5 shadow-xs">
              <AvatarImage
                src={user?.avatar}
                alt={user?.name}
                className="h-full w-full object-contain"
              />
              <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                {getInitials(user?.name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Avatar do Usuário</p>
                {user?.profilePictureUrl && (
                  <Badge variant="secondary" className="text-xs rounded-md">
                    Foto Personalizada
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Escolha uma das ilustrações ou faça upload de uma foto própria.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-md">
            Conta ativa
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 rounded-xl shadow-xs"
            onClick={() => setIsPickerOpen(true)}
            disabled={isUploadingAvatar}
          >
            <Sparkles className="h-4 w-4" />
            <span>Escolher Avatar</span>
          </Button>

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
            className="gap-1.5 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
          >
            <Upload className="h-4 w-4" />
            <span>{isUploadingAvatar ? 'Enviando...' : 'Enviar foto'}</span>
          </Button>

          {user?.profilePictureUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleRemoveAvatar}
              disabled={isUploadingAvatar}
            >
              Remover foto
            </Button>
          )}
        </div>
      </section>

      {/* Koboyo Avatar Picker Modal */}
      <KoboyoAvatarPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        currentSlug={user?.avatarSlug}
        onSelectAvatar={handleSelectKoboyoAvatar}
      />

      {/* Profile form */}
      <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-2xs">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Informações pessoais</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Esses dados aparecem no seu perfil dentro do Ninho.
          </p>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nome
            </Label>
            <Input
              id="name"
              className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
              {...profileForm.register('name')}
            />
            {profileForm.formState.errors.name && (
              <p className="text-xs font-medium text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              disabled
              className="bg-muted/60 border-border/40 cursor-not-allowed opacity-75"
              {...profileForm.register('email')}
            />
            {profileForm.formState.errors.email && (
              <p className="text-xs font-medium text-destructive">
                {profileForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="callmeby" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Apelido
            </Label>
            <Input
              id="callmeby"
              className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
              {...profileForm.register('callmeby')}
              placeholder="Como prefere ser chamado?"
            />
          </div>
          <div className="pt-1">
            <Button
              type="submit"
              size="sm"
              className="rounded-xl"
              disabled={profileForm.formState.isSubmitting}
            >
              {profileForm.formState.isSubmitting ? 'Salvando...' : 'Salvar perfil'}
            </Button>
          </div>
        </form>
      </section>

      <Separator />

      {/* Username */}
      <section className="space-y-4 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Perfil público</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Defina seu nome de usuário único no Ninho.
          </p>
        </div>
        <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Username
            </Label>
            <Input
              id="username"
              className="bg-muted/30 border-border/40 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
              {...usernameForm.register('username')}
              placeholder="@seunome"
            />
            {usernameForm.formState.errors.username && (
              <p className="text-xs font-medium text-destructive">
                {usernameForm.formState.errors.username.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={usernameForm.formState.isSubmitting}
          >
            {usernameForm.formState.isSubmitting ? 'Salvando...' : 'Atualizar username'}
          </Button>
        </form>
      </section>
    </div>
  );
}

