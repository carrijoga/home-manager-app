import type {
  CreateNestRequest,
  NestConfigurationResponse,
  NestInvite,
  NestMember,
  UpdateNestConfigurationRequest,
  UpdateNestRequest,
} from '@/schemas/nest';
import { NestConfigurationResponseSchema } from '@/schemas/nest';
import type { AppUserNest } from '@/types';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_NESTS: AppUserNest[] = [
  { nestId: 'nest-mock-0001', name: 'Casa Principal', icon: 'Home', isDefault: true, role: 1 },
  { nestId: 'nest-mock-0002', name: 'Trabalho', icon: 'Briefcase', isDefault: false, role: 2 },
];

const MOCK_INVITES: NestInvite[] = [
  {
    nestInviteId: 'invite-mock-0001',
    nestId: 'nest-mock-0001',
    email: 'ana@example.com',
    role: 3,
    status: 1,
    createdAtUtc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    nestInviteId: 'invite-mock-0002',
    nestId: 'nest-mock-0001',
    email: 'pedro@example.com',
    role: 3,
    status: 2,
    createdAtUtc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_MEMBERS: NestMember[] = [
  { userId: 'user-mock-0001', name: 'João (Você)', nestId: 'nest-mock-0001', role: 1, avatarSlug: 'face-beaming' },
  { userId: 'user-mock-0002', name: 'Maria', nestId: 'nest-mock-0001', role: 3, avatarSlug: 'grinning-face' },
  { userId: 'user-mock-0001', name: 'Usuário Mock (Você)', nestId: 'mock-nest-id-0000-0000-000000000001', role: 1, avatarSlug: 'face-beaming' },
  { userId: 'user-mock-0002', name: 'Maria Santos', nestId: 'mock-nest-id-0000-0000-000000000001', role: 3, avatarSlug: 'smiling-face' },
  { userId: 'user-mock-0001', name: 'Usuário Mock (Você)', nestId: 'nest-mock-0002', role: 2, avatarSlug: 'face-beaming' },
];

function extractArray<T = unknown>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.members)) return obj.members as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.result)) return obj.result as T[];
    if (Array.isArray(obj.value)) return obj.value as T[];
  }
  return [];
}

function normalizeNestMember(rawItem: unknown, fallbackNestId: string): NestMember {
  if (!rawItem || typeof rawItem !== 'object') {
    return {
      userId: crypto.randomUUID(),
      name: 'Membro',
      nestId: fallbackNestId,
      role: 3,
    };
  }
  const item = rawItem as Record<string, unknown>;
  const userId = String(item.userId || item.id || item.memberId || crypto.randomUUID());
  const name = String(
    item.name ||
      item.fullName ||
      item.callbyName ||
      item.userName ||
      item.username ||
      item.email ||
      'Membro'
  ).trim();
  const nestId = String(item.nestId || fallbackNestId);
  const photoUrl = (item.photoUrl as string) || (item.profilePictureUrl as string) || null;
  const avatarSlug = (item.avatarSlug as string) || null;

  let role = 3;
  if (typeof item.role === 'number') {
    role = item.role;
  } else if (typeof item.role === 'string') {
    const lower = (item.role as string).toLowerCase();
    if (lower.includes('owner') || lower.includes('dono')) role = 1;
    else if (lower.includes('admin')) role = 2;
    else role = 3;
  }

  return { userId, name, nestId, role, photoUrl, avatarSlug };
}

function normalizeNestInvite(rawItem: unknown, fallbackNestId: string): NestInvite {
  const item = (rawItem && typeof rawItem === 'object' ? rawItem : {}) as Record<string, unknown>;
  return {
    nestInviteId: String(item.nestInviteId || item.id || item.inviteId || crypto.randomUUID()),
    nestId: String(item.nestId || fallbackNestId),
    email: String(item.email || ''),
    role: typeof item.role === 'number' ? item.role : 3,
    status: typeof item.status === 'number' ? item.status : 1,
    createdAtUtc: String(item.createdAtUtc || item.createdAt || new Date().toISOString()),
  };
}

// ── Nest CRUD ─────────────────────────────────────────────────────────────────

export async function createNest(payload: CreateNestRequest): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const nestId = crypto.randomUUID();
    MOCK_NESTS.push({
      nestId,
      name: payload.name,
      icon: payload.icon ?? 'Home',
      isDefault: false,
      role: 1,
    });
    MOCK_MEMBERS.push({
      userId: 'user-mock-0001',
      name: 'João (Você)',
      nestId,
      role: 1,
    });
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.create, payload);
}

export async function updateNest(
  nestId: string,
  payload: Omit<UpdateNestRequest, 'nestId'>
): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const nest = MOCK_NESTS.find((n) => n.nestId === nestId);
    if (nest) Object.assign(nest, { ...payload });
    return;
  }
  await httpClient.put<void>(ENDPOINTS.nests.update, { ...payload, nestId }, nestId);
}

export async function deleteNest(nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const idx = MOCK_NESTS.findIndex((n) => n.nestId === nestId);
    if (idx >= 0) MOCK_NESTS.splice(idx, 1);
    return;
  }
  await httpClient.del<void>(ENDPOINTS.nests.delete(nestId));
}

export async function leaveNest(nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.leave, undefined, { nestId });
}

export async function setDefaultNest(nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    MOCK_NESTS.forEach((n) => {
      n.isDefault = n.nestId === nestId;
    });
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.setDefault(nestId), undefined, { nestId });
}

export function getMockNests(): AppUserNest[] {
  return [...MOCK_NESTS];
}

function sortMembers(members: NestMember[]): NestMember[] {
  return [...members].sort((a, b) => {
    const roleA = typeof a.role === 'number' ? a.role : 99;
    const roleB = typeof b.role === 'number' ? b.role : 99;
    if (roleA !== roleB) return roleA - roleB;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getNestMembers(nestId: string): Promise<NestMember[]> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const found = MOCK_MEMBERS.filter((m) => m.nestId === nestId);
    const list =
      found.length > 0
        ? found
        : [
            { userId: 'user-mock-0001', name: 'João (Você)', nestId, role: 1 },
            { userId: 'user-mock-0002', name: 'Maria', nestId, role: 3 },
          ];
    return sortMembers(list);
  }
  try {
    let raw: unknown;
    try {
      raw = await httpClient.post<unknown>(ENDPOINTS.nests.members(nestId), undefined, { nestId });
    } catch {
      raw = await httpClient.get<unknown>(ENDPOINTS.nests.members(nestId), nestId);
    }
    const items = extractArray(raw);
    const list = items.map((item) => normalizeNestMember(item, nestId));
    return sortMembers(list);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[nestService] getNestMembers erro para ${nestId}:`, error);
    }
    return [];
  }
}

export async function removeMember(userId: string, nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const idx = MOCK_MEMBERS.findIndex((m) => m.userId === userId && m.nestId === nestId);
    if (idx >= 0) MOCK_MEMBERS.splice(idx, 1);
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.removeMember(userId), undefined, { nestId });
}

// ── Invites ───────────────────────────────────────────────────────────────────

export async function getNestInvites(nestId: string): Promise<NestInvite[]> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return MOCK_INVITES.filter((i) => i.nestId === nestId);
  }
  try {
    let raw: unknown;
    try {
      raw = await httpClient.get<unknown>(ENDPOINTS.nests.invites, nestId);
    } catch {
      raw = await httpClient.post<unknown>(ENDPOINTS.nests.invites, undefined, { nestId });
    }
    const list = extractArray(raw);
    return list.map((item) => normalizeNestInvite(item, nestId));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[nestService] getNestInvites erro para ${nestId}:`, error);
    }
    return [];
  }
}

export async function inviteMember(email: string, nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    MOCK_INVITES.push({
      nestInviteId: crypto.randomUUID(),
      nestId,
      email,
      role: 3,
      status: 1,
      createdAtUtc: new Date().toISOString(),
    });
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.invite(email), undefined, { nestId });
}

export async function resendInvite(inviteId: string, nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.resendInvite(inviteId), undefined, { nestId });
}

export async function acceptInvite(tokenHash: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.acceptInvite(tokenHash));
}

// ── NestConfiguration ─────────────────────────────────────────────────────────

const MOCK_CONFIGURATIONS: Record<string, NestConfigurationResponse> = {};

function getMockNestConfiguration(nestId: string): NestConfigurationResponse {
  if (!MOCK_CONFIGURATIONS[nestId]) {
    MOCK_CONFIGURATIONS[nestId] = {
      nestConfigurationId: `nest-config-${nestId}`,
      nestId,
      finishedShoppingListGenerateFinancial: false,
      defaultShoppingExpenseCategoryId: null,
    };
  }
  return { ...MOCK_CONFIGURATIONS[nestId] };
}

export async function getNestConfiguration(nestId: string): Promise<NestConfigurationResponse> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return getMockNestConfiguration(nestId);
  }
  const raw = await httpClient.get<unknown>(ENDPOINTS.nests.configuration, nestId);
  const result = NestConfigurationResponseSchema.safeParse(raw);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn('[nestService] getNestConfiguration erro de schema:', result.error.flatten());
    }
    return raw as NestConfigurationResponse;
  }
  return result.data;
}

export async function updateNestConfiguration(
  payload: UpdateNestConfigurationRequest,
  nestId: string
): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const current = getMockNestConfiguration(nestId);
    MOCK_CONFIGURATIONS[nestId] = {
      ...current,
      finishedShoppingListGenerateFinancial: payload.finishedShoppingListGenerateFinancial,
      defaultShoppingExpenseCategoryId: payload.defaultShoppingExpenseCategoryId,
    };
    return;
  }
  await httpClient.put<void>(ENDPOINTS.nests.configuration, payload, nestId);
}

