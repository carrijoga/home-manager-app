import { TaskStatus } from '@/types';

export const PRIORITY_CONFIG = {
  0: {
    label: 'Urgente',
    dot: 'bg-terracotta-600',
    text: 'text-terracotta-700 dark:text-terracotta-300',
    pill: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300',
  },
  1: {
    label: 'Alta',
    dot: 'bg-honey-500',
    text: 'text-honey-700 dark:text-honey-300',
    pill: 'bg-honey-100 text-honey-700 dark:bg-honey-900/40 dark:text-honey-300',
  },
  2: {
    label: 'Média',
    dot: 'bg-honey-300',
    text: 'text-honey-600 dark:text-honey-200',
    pill: 'bg-linen-200 text-honey-700 dark:bg-linen-900/30 dark:text-honey-200',
  },
  3: {
    label: 'Baixa',
    dot: 'bg-sage-400',
    text: 'text-sage-700 dark:text-sage-300',
    pill: 'bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300',
  },
} as const;

export const PRIORITIES = [
  { value: '0', label: 'Urgente' },
  { value: '1', label: 'Alta' },
  { value: '2', label: 'Média' },
  { value: '3', label: 'Baixa' },
] as const;

export const CATEGORIES = [
  { value: '0', label: 'Geral' },
  { value: '1', label: 'Limpeza' },
  { value: '2', label: 'Manutenção' },
  { value: '3', label: 'Finanças' },
  { value: '4', label: 'Outros' },
] as const;

export const KANBAN_COLUMNS = [
  {
    status: TaskStatus.AFazer,
    label: 'A Fazer',
    color: 'text-honey-700 dark:text-honey-300',
    headerBg: 'bg-honey-50 dark:bg-honey-900/20',
  },
  {
    status: TaskStatus.EmAndamento,
    label: 'Em Andamento',
    color: 'text-blue-700 dark:text-blue-300',
    headerBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    status: TaskStatus.Concluido,
    label: 'Concluído',
    color: 'text-sage-700 dark:text-sage-300',
    headerBg: 'bg-sage-50 dark:bg-sage-900/20',
  },
] as const;
