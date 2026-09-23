import { KOBOYO_FACE_SLUGS } from '@/constants/koboyoAvatars';
import { languageToApiLocale, type SupportedLanguage } from '@/i18n';
import type {
  ChangePasswordData,
  UpdateUserConfigurationRequest,
  UpdateUsernameData,
} from '@/schemas/settingsSchemas';
import type { ChangeAvatarSlugRequest, UpdateProfileRequest } from '@/schemas/user';

import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';
import { MOCK_USER_PROFILE } from './authService';
import { getConfiguration } from './userService';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isMock = import.meta.env.VITE_DATA_MODE !== 'api';

// ── Endpoints com contrato de API ─────────────────────────────────────────────

export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.put(ENDPOINTS.users.me, data);
}

export async function updateConfiguration(data: UpdateUserConfigurationRequest): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.put(ENDPOINTS.settings.configuration, data);
}

export async function updateUserLocale(lang: SupportedLanguage): Promise<void> {
  const localeEnum = languageToApiLocale(lang);

  if (isMock) {
    await delay(100);
    if (MOCK_USER_PROFILE.profile?.configuration) {
      MOCK_USER_PROFILE.profile.configuration.language = localeEnum;
      MOCK_USER_PROFILE.profile.configuration.locale = lang;
    }
    return;
  }

  try {
    const current = await getConfiguration();
    await httpClient.put(ENDPOINTS.settings.configuration, {
      theme: current.theme ?? 0,
      locale: localeEnum,
      city: current.city ?? null,
      allowLocationByIp: current.allowLocationByIp ?? false,
      allowLocationByGps: current.allowLocationByGps ?? false,
      notifyInformative: current.notifyInformative ?? true,
      notifyWarning: current.notifyWarning ?? true,
      notifyError: current.notifyError ?? true,
      notifySuccess: current.notifySuccess ?? true,
      shareDataForAnalytics: current.shareDataForAnalytics ?? false,
    });
  } catch {
    await httpClient.put(ENDPOINTS.settings.configuration, {
      locale: localeEnum,
      theme: 0,
    });
  }
}

export async function getAvatarOptions(): Promise<string[]> {
  if (isMock) {
    await delay(100);
    return KOBOYO_FACE_SLUGS;
  }
  return httpClient.get<string[]>(ENDPOINTS.users.avatarOptions);
}

export async function changeAvatarSlug(avatarSlug: string): Promise<void> {
  if (isMock) {
    await delay(100);
    MOCK_USER_PROFILE.avatarSlug = avatarSlug;
    return;
  }
  const payload: ChangeAvatarSlugRequest = { avatarSlug };
  await httpClient.patch(ENDPOINTS.users.changeAvatarSlug, payload);
}

export async function uploadAvatar(file: File): Promise<void> {
  if (isMock) {
    await delay(100);
    MOCK_USER_PROFILE.profilePictureUrl = URL.createObjectURL(file);
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  await httpClient.post(ENDPOINTS.users.profilePicture, formData);
}

export async function removeAvatar(): Promise<void> {
  if (isMock) {
    await delay(100);
    MOCK_USER_PROFILE.profilePictureUrl = null;
    return;
  }
  await httpClient.del(ENDPOINTS.users.profilePicture);
}

// ── Mock-only (sem contrato de API ainda) ─────────────────────────────────────

export async function updateUsername(_data: UpdateUsernameData): Promise<void> {
  await delay(100);
}

export async function changePassword(_data: ChangePasswordData): Promise<void> {
  await delay(100);
}

export async function logoutOtherDevices(): Promise<void> {
  await delay(100);
}

export async function updatePrivacySettings(_data: {
  anonymousDataSharing: boolean;
}): Promise<void> {
  await delay(100);
}

export async function clearData(): Promise<void> {
  await delay(100);
}
