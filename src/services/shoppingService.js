/**
 * @fileoverview Serviço para gerenciar lista de compras
 * Abstrai a fonte de dados (mock ou API)
 */

import { mockShoppingList } from '../mocks/data';
import { DATA_MODE, apiRequest, API_ENDPOINTS } from './api/config';

/**
 * Busca a lista de compras atual
 * @returns {Promise<ShoppingList>}
 */
export async function getShoppingList() {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...mockShoppingList, items: [...mockShoppingList.items] }), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.shopping);
}

/**
 * Adiciona um item à lista de compras
 * @param {Partial<ShoppingItem>} item - Dados do item
 * @returns {Promise<ShoppingItem>}
 */
export async function addShoppingItem(item) {
  const newItem = {
    id: Date.now(),
    name: item.name,
    quantity: item.quantity,
    category: item.category || 'Geral',
    checked: false
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(newItem), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.shopping}/items`, {
    method: 'POST',
    body: JSON.stringify(newItem)
  });
}

/**
 * Atualiza um item da lista
 * @param {number} id - ID do item
 * @param {Partial<ShoppingItem>} updates - Dados a atualizar
 * @returns {Promise<ShoppingItem>}
 */
export async function updateShoppingItem(id, updates) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id, ...updates }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.shopping}/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Marca/desmarca um item como comprado
 * @param {number} id - ID do item
 * @returns {Promise<ShoppingItem>}
 */
export async function toggleShoppingItem(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.shopping}/items/${id}/toggle`, {
    method: 'PATCH'
  });
}

/**
 * Remove um item da lista
 * @param {number} id - ID do item
 * @returns {Promise<void>}
 */
export async function deleteShoppingItem(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.shopping}/items/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Atualiza o mês da lista de compras
 * @param {string} month - Novo mês
 * @returns {Promise<ShoppingList>}
 */
export async function updateShoppingMonth(month) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ month }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.shopping}/month`, {
    method: 'PUT',
    body: JSON.stringify({ month })
  });
}

export default {
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  updateShoppingMonth
};
