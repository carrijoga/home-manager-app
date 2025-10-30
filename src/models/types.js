/**
 * @fileoverview Definições de tipos para o aplicativo Home Manager
 * Este arquivo contém todas as interfaces e tipos de dados usados na aplicação
 */

/**
 * @typedef {Object} Notice
 * @property {number} id - Identificador único do aviso
 * @property {string} text - Texto do aviso
 * @property {string} author - Autor do aviso
 * @property {string} date - Data do aviso no formato ISO (YYYY-MM-DD)
 */

/**
 * @typedef {Object} Task
 * @property {number} id - Identificador único da tarefa
 * @property {string} title - Título/descrição da tarefa
 * @property {string} assignedTo - Pessoa responsável pela tarefa
 * @property {boolean} completed - Status de conclusão da tarefa
 * @property {string} dueDate - Data de vencimento no formato ISO (YYYY-MM-DD)
 */

/**
 * @typedef {Object} ShoppingItem
 * @property {number} id - Identificador único do item
 * @property {string} name - Nome do item
 * @property {string} quantity - Quantidade do item (ex: "5kg", "3un")
 * @property {boolean} checked - Se o item já foi comprado
 * @property {string} category - Categoria do item (ex: "Alimentos", "Limpeza")
 * @property {string} month - Mês da lista de compras
 */

/**
 * @typedef {Object} ShoppingList
 * @property {string} month - Mês de referência da lista
 * @property {ShoppingItem[]} items - Array de itens da lista
 */

/**
 * @typedef {Object} Expense
 * @property {number} id - Identificador único do gasto
 * @property {string} description - Descrição do gasto
 * @property {number} value - Valor do gasto em reais
 * @property {string} date - Data do gasto no formato ISO (YYYY-MM-DD)
 * @property {string} category - Categoria do gasto (ex: "Fixo", "Manutenção", "Novo item")
 */

/**
 * @typedef {Object} FutureItem
 * @property {number} id - Identificador único do item
 * @property {string} name - Nome do item a ser comprado
 * @property {('alta'|'média'|'baixa')} priority - Prioridade da compra
 * @property {string} estimatedCost - Custo estimado (ex: "R$ 2.500")
 */

/**
 * Categorias válidas para gastos
 * @readonly
 * @enum {string}
 */
export const ExpenseCategories = {
  FIXED: 'Fixo',
  MAINTENANCE: 'Manutenção',
  NEW_ITEM: 'Novo item',
  GENERAL: 'Geral'
};

/**
 * Categorias válidas para itens de compra
 * @readonly
 * @enum {string}
 */
export const ShoppingCategories = {
  FOOD: 'Alimentos',
  CLEANING: 'Limpeza',
  GENERAL: 'Geral'
};

/**
 * Níveis de prioridade para itens futuros
 * @readonly
 * @enum {string}
 */
export const PriorityLevels = {
  HIGH: 'alta',
  MEDIUM: 'média',
  LOW: 'baixa'
};

/**
 * IDs dos módulos da aplicação
 * @readonly
 * @enum {string}
 */
export const ModuleIds = {
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  SHOPPING: 'shopping',
  FINANCIAL: 'financial',
  FUTURE: 'future',
  CALENDAR: 'calendar'
};

export default {
  ExpenseCategories,
  ShoppingCategories,
  PriorityLevels,
  ModuleIds
};
