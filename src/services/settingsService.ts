import type {
  UpdateProfileData,
  UpdateUsernameData,
  ChangePasswordData,
  UpdateNotificationsData,
  UpdatePrivacyData,
} from '@/schemas/settingsSchemas';
import { httpClient } from './api/httpClient';
import { ENDPOINTS } from './api/endpoints';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isMock = import.meta.env.VITE_DATA_MODE !== 'api';

export async function updateProfile(data: UpdateProfileData): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.patch(ENDPOINTS.settings.profile, data);
}

export async function updateUsername(data: UpdateUsernameData): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.patch(ENDPOINTS.settings.username, data);
}

export async function updateNotifications(data: UpdateNotificationsData): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.patch(ENDPOINTS.settings.notifications, data);
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  if (isMock) {
    await delay(100);
    if (!data.currentPassword) {
      throw Object.assign(new Error('Senha atual incorreta'), { status: 401 });
    }
    return;
  }
  await httpClient.post(ENDPOINTS.settings.changePassword, data);
}

export async function logoutOtherDevices(): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.post(ENDPOINTS.settings.logoutOthers, {});
}

export async function uploadAvatar(file: File): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  const formData = new FormData();
  formData.append('avatar', file);
  await httpClient.post(ENDPOINTS.settings.avatar, formData);
}

export async function removeAvatar(): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.del(ENDPOINTS.settings.avatar);
}

export async function updatePrivacySettings(data: UpdatePrivacyData): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.patch(ENDPOINTS.settings.privacy, data);
}

export async function clearData(): Promise<void> {
  if (isMock) {
    await delay(100);
    return;
  }
  await httpClient.del(ENDPOINTS.settings.data);
}
