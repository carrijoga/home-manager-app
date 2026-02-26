/**
 * Serviço para gerenciar a lista de compras.
 * TODO: API not available yet — este módulo opera apenas em modo mock.
 */

import type { ShoppingItem, ShoppingList } from '@/types';
import { DATA_MODE } from './api/config';
import { mockShoppingList } from '../mocks/data';

export async function getShoppingList(): Promise<ShoppingList> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(
        () => resolve({ ...mockShoppingList, items: [...mockShoppingList.items] }),
        100,
      ),
    );
  }

  // TODO: API not available yet
  throw new Error('[shoppingService] API mode not implemented.');
}

export async function addShoppingItem(item: Omit<ShoppingItem, 'id' | 'checked'>): Promise<ShoppingItem> {
  const newItem: ShoppingItem = {
    id: crypto.randomUUID(),
    name: item.name,
    quantity: item.quantity,
    category: item.category || 'Geral',
    checked: false,
    month: item.month,
    price: item.price,
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(newItem), 100));
  }

  // TODO: API not available yet
  throw new Error('[shoppingService] API mode not implemented.');
}

export async function updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ id, ...updates } as ShoppingItem), 100),
    );
  }

  // TODO: API not available yet
  throw new Error('[shoppingService] API mode not implemented.');
}

export async function toggleShoppingItem(id: string): Promise<ShoppingItem> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve({ id } as ShoppingItem), 100));
  }

  // TODO: API not available yet
  throw new Error('[shoppingService] API mode not implemented.');
}

export async function deleteShoppingItem(_id: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(), 100));
  }

  // TODO: API not available yet
  throw new Error('[shoppingService] API mode not implemented.');
}

export async function updateShoppingMonth(month: string): Promise<Pick<ShoppingList, 'month'>> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve({ month }), 100));
  }

  // TODO: API not available yet
  throw new Error('[shoppingService] API mode not implemented.');
}
