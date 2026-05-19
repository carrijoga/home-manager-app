/**
 * Rotas reais da API (derivadas de docs/api.json).
 * NÃO adicionar rotas que não existam no contrato da API.
 *
 * Rotas sem contrato de API (mock-only):
 *   future-items
 */

export const ENDPOINTS = {
  // Auth
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    google: '/api/auth/google',
    googleCallback: '/api/auth/google/callback',
  },

  // Usuário
  users: {
    me: '/api/users/me',
    meProfile: '/api/users/me/profile',
    meWeather: '/api/users/me/weather',
    meConfiguration: '/api/users/me/configuration',
    meNotifications: '/api/users/me/notification',
    meNests: '/api/users/me/nests',
    usernamePreview: '/api/users/username/preview',
  },

  // Nest (grupo/família)
  nests: {
    create: '/api/nests/create',
    update: '/api/nests/update',
    delete: (nestId: string) => `/api/nests/${nestId}`,
  },

  // Transações financeiras
  financial: {
    create: '/api/financial-transactions/create',
    list: '/api/financial-transactions/list',
    getById: '/api/financial-transactions/get-by-id',
    addPayment: '/api/financial-transactions/add-payment',
    removePayment: '/api/financial-transactions/remove-payment',
  },

  // Categorias
  categories: {
    create: '/api/categories/create',
    list: '/api/categories/list',
    getById: '/api/categories/get-by-id',
  },

  // Contas bancárias
  bankAccounts: {
    create: '/api/bank-account',
    getById: (id: string) => `/api/bank-account/${id}`,
    update: (id: string) => `/api/bank-account/${id}`,
  },

  // Segurança
  security: {
    requestPasswordRecovery: '/api/recovery-password/request',
    resetPassword: '/api/recovery-password/reset',
  },

  // Listas de compras
  shoppingLists: {
    list: '/api/shopping-list',
    create: '/api/shopping-list',
    getById: (id: string) => `/api/shopping-list/${id}`,
    update: (id: string) => `/api/shopping-list/${id}`,
    delete: (id: string) => `/api/shopping-list/${id}`,
    finish: (id: string) => `/api/shopping-list/${id}/finish`,
    unfinish: (id: string) => `/api/shopping-list/${id}/unfinished`,
  },

  // Itens de compra
  shoppingItems: {
    create: '/api/shopping-item',
    update: (id: string) => `/api/shopping-item/${id}`,
    delete: (id: string) => `/api/shopping-item/${id}`,
    markAsPurchased: (id: string) => `/api/shopping-item/${id}/purchase`,
    unmarkAsPurchased: (listId: string, itemId: string) => `/api/shopping-item/${listId}/unpurchase/${itemId}`,
    upload: (listId: string) => `/api/shopping-item/${listId}/upload`,
  },

  // Categorias de compra
  shoppingCategories: {
    list: '/api/shopping-category',
    create: '/api/shopping-category',
    delete: (id: string) => `/api/shopping-category/${id}`,
  },

  // Hub SignalR — Listas de compras
  shoppingHub: (nestId: string) =>
    `${(import.meta.env.VITE_API_URL || 'http://localhost:5026').replace(/\/$/, '')}/hubs/shopping-list?nestId=${nestId}`,

  // Avisos (Notices)
  notices: {
    list: '/api/notices',
    create: '/api/notices',
    history: '/api/notices/history',
    update: (id: string) => `/api/notices/${id}`,
    delete: (id: string) => `/api/notices/${id}`,
    pin: (id: string) => `/api/notices/${id}/pin`,
    unpin: (id: string) => `/api/notices/${id}/unpin`,
  },

  // Tarefas (Tasks)
  tasks: {
    list: '/api/tasks',
    create: '/api/tasks',
    createQuick: '/api/tasks/quick',
    history: '/api/tasks/history',
    getById: (id: string) => `/api/tasks/${id}`,
    update: (id: string) => `/api/tasks/${id}`,
    delete: (id: string) => `/api/tasks/${id}`,
    complete: (id: string) => `/api/tasks/${id}/complete`,
    uncomplete: (id: string) => `/api/tasks/${id}/uncomplete`,
  },

  // Configurações do usuário (mock-only por ora)
  settings: {
    profile: '/api/users/me/profile',
    username: '/api/users/me/username',
    notifications: '/api/users/me/notifications',
    changePassword: '/api/users/me/change-password',
    logoutOthers: '/api/auth/logout-others',
    avatar: '/api/users/me/avatar',
    privacy: '/api/users/me/privacy',
    data: '/api/users/me/data',
  },

  // Health
  health: '/health',
} as const;
