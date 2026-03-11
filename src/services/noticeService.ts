/**
 * Serviço para gerenciar avisos do quadro.
 * TODO: API not available yet — este módulo opera apenas em modo mock.
 */

import type { Notice } from '@/types';
import { DATA_MODE } from './api/config';
import { mockNotices } from '../mocks/data';

export async function getAllNotices(): Promise<Notice[]> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve([...mockNotices]), 100));
  }

  // TODO: API not available yet
  throw new Error('[noticeService] API mode not implemented.');
}

export async function addNotice(notice: Omit<Notice, 'id'>): Promise<Notice> {
  const newNotice: Notice = {
    id: crypto.randomUUID(),
    text: notice.text,
    author: notice.author || 'Você',
    date: notice.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(newNotice), 100));
  }

  // TODO: API not available yet
  throw new Error('[noticeService] API mode not implemented.');
}

export async function updateNotice(id: string, updates: Partial<Notice>): Promise<Notice> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve({ id, ...updates } as Notice), 100));
  }

  // TODO: API not available yet
  throw new Error('[noticeService] API mode not implemented.');
}

export async function deleteNotice(_id: string): Promise<void> {
  if (DATA_MODE === 'mock') {
    return new Promise((resolve) => setTimeout(() => resolve(), 100));
  }

  // TODO: API not available yet
  throw new Error('[noticeService] API mode not implemented.');
}
