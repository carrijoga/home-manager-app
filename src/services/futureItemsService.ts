/**
 * Serviço para gerenciar itens de compra futura.
 * TODO: API not available yet — este módulo opera apenas em modo mock.
 */

import type { FutureItem, Priority } from '@/types';
import { DATA_MODE } from './api/config';
import { mockFutureItems } from '../mocks/data';

export async function getAllFutureItems(): Promise<FutureItem[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve([...mockFutureItems]), 100));
  }

  // TODO: API not available yet
  throw new Error('[futureItemsService] API mode not implemented.');
}

export async function addFutureItem(item: Omit<FutureItem, 'id'>): Promise<FutureItem> {
  const newItem: FutureItem = {
    id: crypto.randomUUID(),
    name: item.name,
    priority: item.priority || 'média',
    estimatedCost: item.estimatedCost,
    estimatedValue: item.estimatedValue,
    description: item.description,
    category: item.category,
    link: item.link,
    notes: item.notes,
    status: item.status,
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(newItem), 100));
  }

  // TODO: API not available yet
  throw new Error('[futureItemsService] API mode not implemented.');
}

export async function updateFutureItem(id: string, updates: Partial<FutureItem>): Promise<FutureItem> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ id, ...updates } as FutureItem), 100),
    );
  }

  // TODO: API not available yet
  throw new Error('[futureItemsService] API mode not implemented.');
}

export async function deleteFutureItem(_id: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(), 100));
  }

  // TODO: API not available yet
  throw new Error('[futureItemsService] API mode not implemented.');
}

export async function getFutureItemsByPriority(priority: Priority): Promise<FutureItem[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => {
      const filtered = mockFutureItems.filter((item) => item.priority === priority);
      setTimeout(() => resolve(filtered), 100);
    });
  }

  // TODO: API not available yet
  throw new Error('[futureItemsService] API mode not implemented.');
}

export function groupItemsByPriority(items: FutureItem[]): Record<Priority, FutureItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.priority]) acc[item.priority] = [];
      acc[item.priority].push(item);
      return acc;
    },
    {} as Record<Priority, FutureItem[]>,
  );
}
