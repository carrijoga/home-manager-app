/**
 * @fileoverview Serviço para gerenciar tarefas
 * Abstrai a fonte de dados (mock ou API)
 */

import { mockTasks } from '../mocks/data';
import { DATA_MODE, apiRequest, API_ENDPOINTS } from './api/config';

/**
 * Busca todas as tarefas
 * @returns {Promise<Task[]>}
 */
export async function getAllTasks() {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockTasks]), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.tasks);
}

/**
 * Adiciona uma nova tarefa
 * @param {Partial<Task>} task - Dados da tarefa
 * @returns {Promise<Task>}
 */
export async function addTask(task) {
  const newTask = {
    id: Date.now(),
    title: task.title,
    assignedTo: task.assignedTo || 'Geral',
    completed: false,
    dueDate: task.dueDate || new Date().toISOString().split('T')[0]
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(newTask), 100);
    });
  }

  return await apiRequest(API_ENDPOINTS.tasks, {
    method: 'POST',
    body: JSON.stringify(newTask)
  });
}

/**
 * Atualiza uma tarefa existente
 * @param {number} id - ID da tarefa
 * @param {Partial<Task>} updates - Dados a atualizar
 * @returns {Promise<Task>}
 */
export async function updateTask(id, updates) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id, ...updates }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.tasks}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Alterna o status de conclusão de uma tarefa
 * @param {number} id - ID da tarefa
 * @returns {Promise<Task>}
 */
export async function toggleTaskCompletion(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ id }), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.tasks}/${id}/toggle`, {
    method: 'PATCH'
  });
}

/**
 * Remove uma tarefa
 * @param {number} id - ID da tarefa
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }

  return await apiRequest(`${API_ENDPOINTS.tasks}/${id}`, {
    method: 'DELETE'
  });
}

export default {
  getAllTasks,
  addTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask
};
