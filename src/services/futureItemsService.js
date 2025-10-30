/**
 * @fileoverview Serviço para gerenciar itens futuros
 * Abstrai a fonte de dados (mock ou API)
 */

import { mockFutureItems } from '../mocks/data';
import { DATA_MODE, apiRequest, API_ENDPOINTS } from './api/config';

/**
 * Busca todos os itens futuros
 * @returns {Promise<FutureItem[]>}
 */
export async function getAllFutureItems() {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockFutureItems]), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.futureItems);
}

/**
 * Adiciona um novo item futuro
 * @param {Partial<FutureItem>} item - Dados do item
 * @returns {Promise<FutureItem>}
 */
export async function addFutureItem(item) {
  const newItem = {
    id: Date.now(),
    name: item.name,
    priority: item.priority || 'média',
    estimatedCost: item.estimatedCost
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(newItem), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.futureItems, {
    method: 'POST',
    body: JSON.stringify(newItem)
  });
}

/**
 * Atualiza um item futuro existente
 * @param {number} id - ID do item
 * @param {Partial<FutureItem>} updates - Dados a atualizar
 * @returns {Promise<FutureItem>}
 */
export async function updateFutureItem(id, updates) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id, ...updates }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.futureItems}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Remove um item futuro
 * @param {number} id - ID do item
 * @returns {Promise<void>}
 */
export async function deleteFutureItem(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.futureItems}/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Busca itens por prioridade
 * @param {('alta'|'média'|'baixa')} priority - Prioridade a filtrar
 * @returns {Promise<FutureItem[]>}
 */
export async function getFutureItemsByPriority(priority) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      const filtered = mockFutureItems.filter(item => item.priority === priority);
      setTimeout(() => resolve(filtered), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.futureItems}?priority=${priority}`);
}

/**
 * Organiza itens por prioridade
 * @param {FutureItem[]} items - Lista de itens
 * @returns {Object} Itens agrupados por prioridade
 */
export function groupItemsByPriority(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.priority]) {
      acc[item.priority] = [];
    }
    acc[item.priority].push(item);
    return acc;
  }, {});
}

export default {
  getAllFutureItems,
  addFutureItem,
  updateFutureItem,
  deleteFutureItem,
  getFutureItemsByPriority,
  groupItemsByPriority
};
