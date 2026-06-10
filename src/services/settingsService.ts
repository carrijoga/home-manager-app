import type {
  ChangePasswordData,
  UpdateUserConfigurationRequest,
  UpdateUsernameData,
} from '@/schemas/settingsSchemas';
import type { UpdateProfileRequest } from '@/schemas/user';

import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isMock = import.meta.env.VITE_DATA_MODE !== 'api';

// ── Endpoints com contrato de API ─────────────────────────────────────────────

export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  if (isMock) { await delay(100); return; }
  await httpClient.put(ENDPOINTS.users.me, data);
}

export async function updateConfiguration(data: UpdateUserConfigurationRequest): Promise<void> {
  if (isMock) { await delay(100); return; }
  await httpClient.put(ENDPOINTS.settings.configuration, data);
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

export async function uploadAvatar(_file: File): Promise<void> {
  await delay(100);
}

export async function removeAvatar(): Promise<void> {
  await delay(100);
}

export async function updatePrivacySettings(_data: { anonymousDataSharing: boolean }): Promise<void> {
  await delay(100);
}

export async function clearData(): Promise<void> {
  await delay(100);
}
