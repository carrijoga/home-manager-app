/**
 * @fileoverview Serviço para gerenciar avisos/notícias
 * Abstrai a fonte de dados (mock ou API)
 */

import { mockNotices } from '../mocks/data';
import { DATA_MODE, apiRequest, API_ENDPOINTS } from './api/config';

/**
 * Busca todos os avisos
 * @returns {Promise<Notice[]>}
 */
export async function getAllNotices() {
  if (DATA_MODE === 'mock') {
    // Simula delay de rede
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockNotices]), 100);
    });
  }

  // Quando a API estiver pronta:
  return await apiRequest(API_ENDPOINTS.notices);
}

/**
 * Adiciona um novo aviso
 * @param {Partial<Notice>} notice - Dados do aviso
 * @returns {Promise<Notice>}
 */
export async function addNotice(notice) {
  const newNotice = {
    id: Date.now(),
    text: notice.text,
    author: notice.author || 'Você',
    date: notice.date || new Date().toISOString().split('T')[0]
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(newNotice), 100);
    });
  }

  // Quando a API estiver pronta:
  return await apiRequest(API_ENDPOINTS.notices, {
    method: 'POST',
    body: JSON.stringify(newNotice)
  });
}

/**
 * Atualiza um aviso existente
 * @param {number} id - ID do aviso
 * @param {Partial<Notice>} updates - Dados a atualizar
 * @returns {Promise<Notice>}
 */
export async function updateNotice(id, updates) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id, ...updates }), 100);
    });
  }

  // Quando a API estiver pronta:
  return await apiRequest(`${API_ENDPOINTS.notices}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Remove um aviso
 * @param {number} id - ID do aviso
 * @returns {Promise<void>}
 */
export async function deleteNotice(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }

  // Quando a API estiver pronta:
  return await apiRequest(`${API_ENDPOINTS.notices}/${id}`, {
    method: 'DELETE'
  });
}

export default {
  getAllNotices,
  addNotice,
  updateNotice,
  deleteNotice
};
