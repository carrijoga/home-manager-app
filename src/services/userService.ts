import { UserProfileResponseSchema, UserSummaryResponseSchema } from '@/schemas/user';
import type {
  CreateNestRequest,
  UpdateNestRequest,
  UpdateProfileRequest,
  UserConfigurationResponse,
  UserNestResponse,
  UserProfileResponse,
  UserSummaryResponse,
} from '@/schemas/user';
import { httpClient } from './api/httpClient';
import { ENDPOINTS } from './api/endpoints';

function safeParse<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } } }, raw: unknown, name: string): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.warn(`[userService] ${name}: schema inesperado`, result.error?.flatten());
    }
    return raw as T;
  }
  return result.data!;
}

/** Resumo do usuário autenticado */
export async function getMe(): Promise<UserSummaryResponse> {
  const raw = await httpClient.get<unknown>(ENDPOINTS.users.me);
  return safeParse(UserSummaryResponseSchema, raw, 'getMe');
}

/** Perfil completo do usuário autenticado */
export async function getProfile(): Promise<UserProfileResponse> {
  const raw = await httpClient.get<unknown>(ENDPOINTS.users.meProfile);
  return safeParse(UserProfileResponseSchema, raw, 'getProfile');
}

/** Atualiza o perfil do usuário autenticado */
export async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
  const raw = await httpClient.put<unknown>(ENDPOINTS.users.me, payload);
  return safeParse(UserProfileResponseSchema, raw, 'updateProfile');
}

/** Configurações do usuário */
export async function getConfiguration(): Promise<UserConfigurationResponse> {
  return httpClient.get<UserConfigurationResponse>(ENDPOINTS.users.meConfiguration);
}

/** Nests (grupos/famílias) do usuário */
export async function getNests(): Promise<UserNestResponse[]> {
  return httpClient.get<UserNestResponse[]>(ENDPOINTS.users.meNests);
}

/** Cria um novo ninho para o usuário autenticado */
export async function createNest(payload: CreateNestRequest): Promise<void> {
  await httpClient.post<void>(ENDPOINTS.nests.create, payload);
}

/** Atualiza um ninho existente
 * TODO: confirmar rota e método HTTP quando o endpoint estiver no contrato da API
 */
export async function updateNest(nestId: string, payload: UpdateNestRequest): Promise<void> {
  await httpClient.put<void>(ENDPOINTS.nests.update(nestId), payload);
}

/** Remove um ninho
 * TODO: confirmar rota e método HTTP quando o endpoint estiver no contrato da API
 */
export async function deleteNest(nestId: string): Promise<void> {
  await httpClient.del(ENDPOINTS.nests.delete(nestId));
}
