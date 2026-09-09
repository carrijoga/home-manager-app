import { http, HttpResponse } from 'msw';

export const mswHandlers = [
  http.get('/api/dashboard/weather', () => {
    return HttpResponse.json({
      city: 'São Paulo',
      temperature: 24,
      condition: 'sunny',
      humidity: 60,
    });
  }),
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      id: 'mock-user-1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      avatarUrl: '',
    });
  }),
  http.get('/api/categories/list-options', () => {
    return HttpResponse.json([
      { id: 'cat-1', name: 'Alimentação', color: '#10b981', icon: 'utensils' },
      { id: 'cat-2', name: 'Transporte', color: '#3b82f6', icon: 'car' },
      { id: 'cat-3', name: 'Moradia', color: '#f59e0b', icon: 'home' },
    ]);
  }),
];
