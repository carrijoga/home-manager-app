/**
 * Rotas reais da API (derivadas de docs/api.json).
 * NÃO adicionar rotas que não existam no contrato da API.
 *
 * Rotas sem contrato de API (mock-only):
 *   tasks, shopping, notices, future-items
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
    meConfiguration: '/api/users/me/configuration',
    meNotifications: '/api/users/me/notification',
    meNests: '/api/users/me/nests',
    usernamePreview: '/api/users/username/preview',
  },

  // Nest (grupo/família)
  nests: {
    create: '/api/nests/create',
    // TODO: confirmar rota exata quando os endpoints estiverem no contrato da API
    update: (nestId: string) => `/api/nests/${nestId}`,
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
  },

  // Itens de compra
  shoppingItems: {
    create: '/api/shopping-item',
    update: (id: string) => `/api/shopping-item/${id}`,
    delete: (id: string) => `/api/shopping-item/${id}`,
    markAsPurchased: (id: string) => `/api/shopping-item/${id}/purchase`,
    unmarkAsPurchased: (id: string) => `/api/shopping-item/${id}/unpurchase`,
  },

  // Categorias de compra
  shoppingCategories: {
    list: '/api/shopping-category',
    create: '/api/shopping-category',
    delete: (id: string) => `/api/shopping-category/${id}`,
  },

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
  },

  // Health
  health: '/health',
} as const;
