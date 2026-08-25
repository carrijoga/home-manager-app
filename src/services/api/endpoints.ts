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
    meWeather: '/api/dashboard/weather',
    meConfiguration: '/api/users/me/configuration',
    meNotifications: '/api/users/me/notification',
    meNests: '/api/users/me/nests',
    usernamePreview: '/api/users/username/preview',
    avatarOptions: '/api/users/avatar-options',
    changeAvatarSlug: '/api/users/me/avatar-slug',
    profilePicture: '/api/users/me/profile-picture',
  },

  // Nest (grupo/família)
  nests: {
    create: '/api/nests/create',
    update: '/api/nests/update',
    leave: '/api/nests/leave',
    setDefault: (nestId: string) => `/api/nests/${nestId}/set-default`,
    delete: (nestId: string) => `/api/nests/${nestId}`,
    invites: '/api/nests/invites',
    invite: (email: string) => `/api/nests/invite/${encodeURIComponent(email)}`,
    resendInvite: (inviteId: string) => `/api/nests/resend-invite/${inviteId}`,
    acceptInvite: (tokenHash: string) =>
      `/api/nests/accept-invite/${encodeURIComponent(tokenHash)}`,
    configuration: '/api/nests/configuration',
    removeMember: (userId: string) => `/api/nests/remove-member/${userId}`,
    members: (nestId: string) => `/api/nests/members/${nestId}`,
  },

  // Transações financeiras
  financial: {
    create: '/api/financial-transactions/create',
    list: '/api/financial-transactions/list',
    getById: '/api/financial-transactions/get-by-id',
    addPayment: '/api/financial-transactions/add-payment',
    removePayment: '/api/financial-transactions/remove-payment',
    // NÃO EXPOSTO no back-end ainda: GetDashboardFinancialCommand existe no handler
    // mas não tem rota no DashboardController. Em modo API isto vai retornar 404.
    dashboard: '/api/financial-transactions/dashboard',
    update: (id: string) => `/api/financial-transactions/${id}`,
    delete: (id: string) => `/api/financial-transactions/${id}`,
  },

  // Categorias
  categories: {
    create: '/api/categories/create',
    list: '/api/categories/list',
    listOptions: '/api/categories/list-options',
    getById: '/api/categories/get-by-id',
    update: (id: string) => `/api/categories/${id}`,
    delete: (id: string) => `/api/categories/${id}`,
  },

  // Contas bancárias
  bankAccounts: {
    list: '/api/bank-account',
    create: '/api/bank-account',
    getById: (id: string) => `/api/bank-account/${id}`,
    update: (id: string) => `/api/bank-account/${id}`,
    delete: (id: string) => `/api/bank-account/${id}`,
    canDelete: (id: string) => `/api/bank-account/${id}/can-delete`,
    inactivate: (id: string) => `/api/bank-account/${id}/inactivate`,
    activate: (id: string) => `/api/bank-account/${id}/activate`,
  },

  // Cartões de pagamento
  paymentCards: {
    create: '/api/payment-cards/create',
    list: '/api/payment-cards/list',
    getById: (id: string) => `/api/payment-cards/get-by-id?id=${id}`,
    updateDetails: (id: string) => `/api/payment-cards/update-details/${id}`,
    updateCreditSettings: (id: string) => `/api/payment-cards/update-credit-settings/${id}`,
    inactivate: (id: string) => `/api/payment-cards/inactivate/${id}`,
    activate: (id: string) => `/api/payment-cards/activate/${id}`,
    canDelete: (id: string) => `/api/payment-cards/can-delete/${id}`,
    delete: (id: string) => `/api/payment-cards/delete/${id}`,
    // Fatura/lançamentos: SEM contrato de API (mock-only), igual future-items.
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
    unmarkAsPurchased: (listId: string, itemId: string) =>
      `/api/shopping-item/${listId}/unpurchase/${itemId}`,
    upload: (listId: string) => `/api/shopping-item/${listId}/upload`,
  },

  // Categorias de compra
  shoppingCategories: {
    list: '/api/shopping-category',
    create: '/api/shopping-category',
    delete: (id: string) => `/api/shopping-category/${id}`,
  },

  // Hub SignalR — Listas de compras.
  // Sem VITE_API_URL a URL fica relativa e passa pelo proxy do dev server
  // (ver `server.proxy` em vite.config.ts), evitando CORS.
  shoppingHub: (nestId: string) => {
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    return `${base}/hubs/shopping-list?nestId=${nestId}`;
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
    reaction: (id: string) => `/api/notices/${id}/reaction`,
    unreaction: (id: string) => `/api/notices/${id}/unreaction`,
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

  // Configurações do usuário
  settings: {
    profile: '/api/users/me/profile',
    configuration: '/api/users/me/configuration',
  },

  // Dashboard
  dashboard: {
    summary: '/api/dashboard',
    weather: '/api/dashboard/weather',
  },

  // Health
  health: '/health',
} as const;
