import type { CreateNestRequest, NestInvite, NestMember, UpdateNestRequest } from '@/schemas/nest';
import { NestInviteSchema, NestMemberSchema } from '@/schemas/nest';
import type { AppUserNest } from '@/types';

import { DATA_MODE } from './api/config';
import { ENDPOINTS } from './api/endpoints';
import { httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  { userId: 'user-mock-0001', name: 'João (Você)', nestId: 'nest-mock-0001', role: 1 },
  { userId: 'user-mock-0002', name: 'Maria', nestId: 'nest-mock-0001', role: 3 },
];

// ── Nest CRUD ─────────────────────────────────────────────────────────────────

export async function createNest(payload: CreateNestRequest): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    MOCK_NESTS.push({
      nestId: crypto.randomUUID(),
      name: payload.name,
      icon: payload.icon ?? 'Home',
      isDefault: false,
      role: 1,
    });
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.create, payload);
}

export async function updateNest(nestId: string, payload: Omit<UpdateNestRequest, 'nestId'>): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const nest = MOCK_NESTS.find(n => n.nestId === nestId);
    if (nest) Object.assign(nest, { ...payload });
    return;
  }
  await httpClient.put<void>(ENDPOINTS.nests.update, { ...payload, nestId }, nestId);
}

export async function deleteNest(nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const idx = MOCK_NESTS.findIndex(n => n.nestId === nestId);
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

// ── Members ───────────────────────────────────────────────────────────────────

export async function getNestMembers(nestId: string): Promise<NestMember[]> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return MOCK_MEMBERS.filter(m => m.nestId === nestId);
  }
  try {
    const raw = await httpClient.post<unknown[]>(ENDPOINTS.nests.members(nestId));
    return (Array.isArray(raw) ? raw : []).map(item => {
      const parsed = NestMemberSchema.safeParse(item);
      return parsed.success ? parsed.data : (item as NestMember);
    });
  } catch {
    return [];
  }
}

export async function removeMember(userId: string, nestId: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    const idx = MOCK_MEMBERS.findIndex(m => m.userId === userId);
    if (idx >= 0) MOCK_MEMBERS.splice(idx, 1);
    return;
  }
  await httpClient.post<void>(ENDPOINTS.nests.removeMember(userId), undefined, { nestId });
}

// ── Invites ───────────────────────────────────────────────────────────────────

export async function getNestInvites(nestId: string): Promise<NestInvite[]> {
  if (DATA_MODE === 'mock') {
    await delay(100);
    return MOCK_INVITES.filter(i => i.nestId === nestId);
  }
  const raw = await httpClient.get<unknown[]>(ENDPOINTS.nests.invites, nestId);
  return (Array.isArray(raw) ? raw : []).map(item => {
    const parsed = NestInviteSchema.safeParse(item);
    return parsed.success ? parsed.data : (item as NestInvite);
  });
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
