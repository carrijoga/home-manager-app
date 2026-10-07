import { z } from 'zod';

/**
 * Tipos de alteração no changelog.
 */
export type ChangelogType =
  | 'Added'
  | 'Fixed'
  | 'Changed'
  | 'Removed'
  | 'Deprecated'
  | 'Security'
  | string;

/**
 * Schema e tipo de uma entrada individual do changelog.
 */
export const ChangelogItemSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ChangelogItem = z.infer<typeof ChangelogItemSchema>;

/**
 * Schema e tipo do registro de uma versão no histórico.
 */
export const VersionHistoryItemSchema = z.object({
  versionHistoryId: z.string(),
  version: z.string(),
  releaseDate: z.string(),
  environment: z.string(),
  changelogs: z.array(ChangelogItemSchema),
  createdAt: z.string(),
});

export type VersionHistoryItem = z.infer<typeof VersionHistoryItemSchema>;

/**
 * Schema e tipo da resposta paginada do GET /api/version/changelog.
 */
export const VersionChangelogResponseSchema = z.object({
  versions: z.array(VersionHistoryItemSchema),
  totalCount: z.number(),
  pageCount: z.number(),
});

export type VersionChangelogResponse = z.infer<typeof VersionChangelogResponseSchema>;

/**
 * Schema e tipo da resposta do GET /api/version/current.
 */
export const CurrentVersionResponseSchema = z.object({
  version: z.string(),
  releaseDate: z.string(),
  environment: z.string(),
});

export type CurrentVersionResponse = z.infer<typeof CurrentVersionResponseSchema>;
