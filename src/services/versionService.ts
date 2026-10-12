import {
  type CurrentVersionResponse,
  CurrentVersionResponseSchema,
  type VersionChangelogResponse,
  VersionChangelogResponseSchema,
} from '@/schemas/version';

import { ENDPOINTS } from './api/endpoints';
import { ApiError, httpClient } from './api/httpClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isMock = import.meta.env.VITE_DATA_MODE !== 'api';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CURRENT_VERSION: CurrentVersionResponse = {
  version: '1.0.1',
  releaseDate: '2026-09-24T00:00:00Z',
  environment: 'production',
};

const MOCK_CHANGELOG_VERSIONS: VersionChangelogResponse['versions'] = [
  {
    versionHistoryId: '550e8400-e29b-41d4-a716-446655440000',
    version: '1.0.1',
    releaseDate: '2026-09-24T00:00:00Z',
    environment: 'production',
    changelogs: [
      {
        type: 'Fixed',
        title: 'DI registration bug',
        description: 'Fixed IVersionHistoryRepository not being registered',
      },
      {
        type: 'Added',
        title: 'Semver validation',
        description: 'Added semantic versioning format validation',
      },
      {
        type: 'Added',
        title: 'Tela de Changelog & Notas de Versão',
        description: 'Implementada visualização completa das notas de lançamento e histórico no app.',
      },
    ],
    createdAt: '2026-09-24T15:30:00Z',
  },
  {
    versionHistoryId: '660e8400-e29b-41d4-a716-446655440001',
    version: '1.0.0',
    releaseDate: '2026-09-15T00:00:00Z',
    environment: 'production',
    changelogs: [
      {
        type: 'Added',
        title: 'Lançamento Oficial Ninho App',
        description: 'Primeira versão de produção com gerenciamento familiar de tarefas, compras e finanças.',
      },
      {
        type: 'Added',
        title: 'Notificações em tempo real',
        description: 'Integração com SignalR para atualizações instantâneas no dashboard.',
      },
      {
        type: 'Security',
        title: 'Criptografia e Autenticação JWT',
        description: 'Implementação de renovação automática de token e rotação de credenciais.',
      },
    ],
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    versionHistoryId: '770e8400-e29b-41d4-a716-446655440002',
    version: '0.9.0',
    releaseDate: '2026-09-01T00:00:00Z',
    environment: 'staging',
    changelogs: [
      {
        type: 'Added',
        title: 'Módulo de Finanças V2',
        description: 'Suporte a cartões de crédito, contas bancárias e transferências entre contas.',
      },
      {
        type: 'Changed',
        title: 'Interface do Usuário',
        description: 'Refatoração da barra de navegação superior e temas claro/escuro.',
      },
      {
        type: 'Fixed',
        title: 'Cálculo de parcelas no cartão',
        description: 'Correção no cálculo da data de vencimento das faturas subsequentes.',
      },
    ],
    createdAt: '2026-09-01T14:20:00Z',
  },
];

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Busca o histórico de versões com notas de atualização (changelog) paginado.
 */
export async function getChangelogHistory(
  skip = 0,
  take = 10
): Promise<VersionChangelogResponse> {
  if (isMock) {
    await delay(100);
    const sliced = MOCK_CHANGELOG_VERSIONS.slice(skip, skip + take);
    const totalCount = MOCK_CHANGELOG_VERSIONS.length;
    const pageCount = Math.ceil(totalCount / Math.max(take, 1));
    return {
      versions: sliced,
      totalCount,
      pageCount,
    };
  }

  const response = await httpClient.get<unknown>(ENDPOINTS.version.changelog(skip, take));
  const parsed = VersionChangelogResponseSchema.safeParse(response);

  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.error('[getChangelogHistory] Failed to parse API response:', parsed.error);
    }
    throw new ApiError('Formato de resposta inválido ao buscar o histórico de alterações.', 422);
  }

  return parsed.data;
}

/**
 * Busca as informações da versão atual do aplicativo.
 */
export async function getCurrentVersion(): Promise<CurrentVersionResponse> {
  if (isMock) {
    await delay(100);
    return MOCK_CURRENT_VERSION;
  }

  const response = await httpClient.get<unknown>(ENDPOINTS.version.current);
  const parsed = CurrentVersionResponseSchema.safeParse(response);

  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.error('[getCurrentVersion] Failed to parse API response:', parsed.error);
    }
    throw new ApiError('Formato de resposta inválido ao buscar a versão atual.', 422);
  }

  return parsed.data;
}
