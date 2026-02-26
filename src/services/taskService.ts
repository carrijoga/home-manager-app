/**
 * Serviço para gerenciar tarefas.
 * TODO: API not available yet — este módulo opera apenas em modo mock.
 */

import type { Task } from '@/types';
import { DATA_MODE } from './api/config';
import { mockTasks } from '../mocks/data';

export async function getAllTasks(): Promise<Task[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve([...mockTasks]), 100));
  }

  // TODO: API not available yet
  throw new Error('[taskService] API mode not implemented.');
}

export async function addTask(task: Omit<Task, 'id'>): Promise<Task> {
  const newTask: Task = {
    id: crypto.randomUUID(),
    title: task.title,
    assignedTo: task.assignedTo || 'Geral',
    completed: task.completed ?? false,
    dueDate: task.dueDate || new Date().toISOString().split('T')[0],
    description: task.description,
    priority: task.priority,
    category: task.category,
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(newTask), 100));
  }

  // TODO: API not available yet
  throw new Error('[taskService] API mode not implemented.');
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockTasks.find((t) => t.id === id);
        if (!task) {
          resolve({ id, ...updates } as Task);
          return;
        }
        Object.assign(task, updates);
        resolve({ ...task });
      }, 100);
    });
  }

  // TODO: API not available yet
  throw new Error('[taskService] API mode not implemented.');
}

export async function toggleTaskCompletion(id: string): Promise<Task> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockTasks.find((t) => t.id === id);
        if (!task) {
          resolve({ id, completed: false } as Task);
          return;
        }
        task.completed = !task.completed;
        resolve({ ...task });
      }, 100);
    });
  }

  // TODO: API not available yet
  throw new Error('[taskService] API mode not implemented.');
}

export async function deleteTask(_id: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(), 100));
  }

  // TODO: API not available yet
  throw new Error('[taskService] API mode not implemented.');
}
