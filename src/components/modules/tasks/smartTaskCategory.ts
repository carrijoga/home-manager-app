import type { CategoryNode } from '@/lib/categories';
import { suggestTaskCategoryId } from '@/lib/taskCategories';
import { ApiPriority } from '@/schemas/enums';

export interface SmartTaskResult {
  title: string;
  categoryId: string | null;
  priority: number | null;
}

/** Detecta prioridade (tags !urgente/!alta/…) e sugere categoria pela árvore de Tarefas. */
export function analyzeTaskTitle(title: string, tree: CategoryNode[]): SmartTaskResult {
  const lowerTitle = title.toLowerCase();

  let detectedPriority: number | null = null;
  if (lowerTitle.includes('!urgente') || lowerTitle.includes('urgente') || lowerTitle.includes('emergência')) {
    detectedPriority = ApiPriority.Urgente;
  } else if (lowerTitle.includes('!alta')) {
    detectedPriority = ApiPriority.Alta;
  } else if (lowerTitle.includes('!media') || lowerTitle.includes('!média')) {
    detectedPriority = ApiPriority.Media;
  } else if (lowerTitle.includes('!baixa')) {
    detectedPriority = ApiPriority.Baixa;
  }

  const cleanTitle = title
    .replace(/!urgente/gi, '')
    .replace(/!alta/gi, '')
    .replace(/!m[eé]dia/gi, '')
    .replace(/!baixa/gi, '')
    .trim()
    .replace(/\s+/g, ' ');

  return {
    title: cleanTitle,
    categoryId: suggestTaskCategoryId(cleanTitle, tree),
    priority: detectedPriority,
  };
}
