/**
 * @fileoverview Serviço para gerenciar despesas/gastos
 * Abstrai a fonte de dados (mock ou API)
 */

import { mockExpenses } from '../mocks/data';
import { DATA_MODE, apiRequest, API_ENDPOINTS } from './api/config';

/**
 * Busca todas as despesas
 * @returns {Promise<Expense[]>}
 */
export async function getAllExpenses() {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockExpenses]), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.expenses);
}

/**
 * Adiciona uma nova despesa
 * @param {Partial<Expense>} expense - Dados da despesa
 * @returns {Promise<Expense>}
 */
export async function addExpense(expense) {
  const newExpense = {
    id: Date.now(),
    description: expense.description,
    value: parseFloat(expense.value),
    date: expense.date || new Date().toISOString().split('T')[0],
    category: expense.category || 'Geral'
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(newExpense), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.expenses, {
    method: 'POST',
    body: JSON.stringify(newExpense)
  });
}

/**
 * Atualiza uma despesa existente
 * @param {number} id - ID da despesa
 * @param {Partial<Expense>} updates - Dados a atualizar
 * @returns {Promise<Expense>}
 */
export async function updateExpense(id, updates) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id, ...updates }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.expenses}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Remove uma despesa
 * @param {number} id - ID da despesa
 * @returns {Promise<void>}
 */
export async function deleteExpense(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.expenses}/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Busca despesas por categoria
 * @param {string} category - Categoria a filtrar
 * @returns {Promise<Expense[]>}
 */
export async function getExpensesByCategory(category) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      const filtered = mockExpenses.filter(exp => exp.category === category);
      setTimeout(() => resolve(filtered), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.expenses}?category=${category}`);
}

/**
 * Calcula estatísticas de gastos
 * @param {Expense[]} expenses - Lista de despesas
 * @returns {Object} Estatísticas calculadas
 */
export function calculateExpenseStats(expenses) {
  const total = expenses.reduce((sum, exp) => sum + exp.value, 0);

  const byCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.value;
    return acc;
  }, {});

  return {
    total,
    average: expenses.length > 0 ? total / expenses.length : 0,
    byCategory,
    count: expenses.length,
    categories: Object.keys(byCategory).length
  };
}

export default {
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpensesByCategory,
  calculateExpenseStats
};
