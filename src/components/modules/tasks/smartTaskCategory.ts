import { ApiCategory, ApiPriority } from '@/types';

export interface SmartTaskResult {
  title: string;
  category: ApiCategory | null;
  priority: ApiPriority | null;
}

const CLEANING_KEYWORDS = ['limpar', 'limpeza', 'lavar', 'varrer', 'esfregar', 'pano', 'louça', 'lixo', 'organizar'];
const MAINTENANCE_KEYWORDS = ['consertar', 'arrumar', 'trocar', 'lâmpada', 'torneira', 'cano', 'pia', 'furar', 'parafuso', 'pintar', 'bateria', 'filtro'];
const FINANCE_KEYWORDS = ['pagar', 'conta', 'boleto', 'imposto', 'comprar', 'fatura', 'transferir', 'dinheiro', 'pix'];

export function analyzeTaskTitle(title: string): SmartTaskResult {
  const lowerTitle = title.toLowerCase();
  
  let detectedCategory: ApiCategory | null = null;
  let detectedPriority: ApiPriority | null = null;

  // Check priorities
  if (lowerTitle.includes('!urgente') || lowerTitle.includes('urgente') || lowerTitle.includes('emergência')) {
    detectedPriority = ApiPriority.Urgente;
  } else if (lowerTitle.includes('!alta')) {
    detectedPriority = ApiPriority.Alta;
  } else if (lowerTitle.includes('!media') || lowerTitle.includes('!média')) {
    detectedPriority = ApiPriority.Media;
  } else if (lowerTitle.includes('!baixa')) {
    detectedPriority = ApiPriority.Baixa;
  }

  // Check categories (first match wins)
  if (CLEANING_KEYWORDS.some(kw => lowerTitle.includes(kw))) {
    detectedCategory = ApiCategory.Limpeza;
  } else if (MAINTENANCE_KEYWORDS.some(kw => lowerTitle.includes(kw))) {
    detectedCategory = ApiCategory.Manutencao;
  } else if (FINANCE_KEYWORDS.some(kw => lowerTitle.includes(kw))) {
    detectedCategory = ApiCategory.Financas;
  }

  // Remove priority tags from title if they were explicitly typed as commands
  let cleanTitle = title
    .replace(/!urgente/gi, '')
    .replace(/!alta/gi, '')
    .replace(/!m[eé]dia/gi, '')
    .replace(/!baixa/gi, '')
    .trim();

  // clean up extra spaces
  cleanTitle = cleanTitle.replace(/\s+/g, ' ');

  return {
    title: cleanTitle,
    category: detectedCategory,
    priority: detectedPriority
  };
}
