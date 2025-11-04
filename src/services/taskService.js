/**
 * @fileoverview Serviço para gerenciar tarefas
 * Abstrai a fonte de dados (mock ou API)
 */

import { mockTasks } from '../mocks/data';
import { API_ENDPOINTS, DATA_MODE, apiRequest } from './api/config';

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
    id: task.id || Date.now(),
    title: task.title,
    assignedTo: task.assignedTo || 'Geral',
    completed: task.completed || false,
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
      setTimeout(() => {
        // Encontra a tarefa nos dados mock
        const task = mockTasks.find(t => t.id === id);
        if (!task) {
          resolve({ id, ...updates });
          return;
        }
        
        // Atualiza a tarefa nos dados mock
        Object.assign(task, updates);
        
        // Retorna a tarefa atualizada
        resolve({ ...task });
      }, 100);
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
      setTimeout(() => {
        // Encontra a tarefa nos dados mock
        const task = mockTasks.find(t => t.id === id);
        if (!task) {
          resolve({ id, completed: false });
          return;
        }
        
        // Atualiza o status nos dados mock para persistir durante a sessão
        task.completed = !task.completed;
        
        // Retorna a tarefa atualizada
        resolve({ ...task });
      }, 100);
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
