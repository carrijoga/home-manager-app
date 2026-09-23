# 🪺 Ninho

**Seu lar, organizado.**

Aplicativo completo de gerenciamento doméstico para toda a família. Com múltiplos módulos integrados, o Ninho facilita o dia a dia, centralizando tarefas, despesas, compras, cartões de crédito, contas bancárias e muito mais em um único lugar.

---

## 📋 Sobre o Projeto

**Ninho** é uma Progressive Web App (PWA) desenvolvida em React e TypeScript que ajuda você a construir e manter a organização do seu lar. Assim como os pássaros constroem seus ninhos com cuidado, o Ninho oferece as ferramentas para você cuidar da sua casa com praticidade e eficiência.

### 📱 Progressive Web App (PWA)

O Ninho é uma PWA completa, oferecendo:

- **✅ Instalável** - Instale no seu celular ou computador como um app nativo
- **🔄 Service Worker** - Cache inteligente para melhor performance e atualizações automáticas
- **📴 Funcionamento offline** - Acesse dados mesmo sem conexão
- **🚀 Performance otimizada** - Carregamento rápido com code-splitting por rota
- **🔔 Notificações** - Sistema de notificações toast enriquecido via Sonner com suporte a áudio
- **🌓 Tema claro/escuro** - Alterna entre temas com suporte a preferências do sistema
- **⚡ Sincronização em Tempo Real** - Conexão WebSocket via SignalR para atualizações em tempo real

---

## ✨ Funcionalidades

### 🔐 Autenticação & Gestão de Ninhos

- Login com e-mail/senha e Google OAuth via `/auth/google/callback` (`GoogleCallback.tsx`)
- Registro de nova conta de usuário
- Suporte a múltiplos ninhos familiares e troca rápida entre eles
- Aceite de convites de membros via link direto (`/invite`) com `InviteAccept.tsx`
- Rotas protegidas com o guard `RequireAuth`

### 📊 Dashboard

- Visão geral unificada de todas as atividades da casa
- **Quadro de avisos** interativo com post-its para comunicação familiar
- **Métricas visuais** com mini-gráficos e tendências operacionais
- Resumos dedicados de tarefas pendentes, despesas mensais e lista rápida de compras
- **Carrossel de métricas** para visualização compacta no mobile
- **Skeleton loaders** por view para melhor experiência de carregamento
- **Busca global** (`GlobalSearch`) para encontrar tarefas, itens e despesas instantaneamente

### ✅ Tarefas

- Criação e gerenciamento completo de tarefas domésticas
- **Três níveis de prioridade** (Alta, Média, Baixa) com indicadores visuais
- Atribuição de responsáveis, categorias e definição de prazos
- Marcação de tarefas concluídas com confirmação visual
- **Visualização separada** em abas de tarefas pendentes e concluídas
- **Filtros e ordenação** por prioridade, responsável e data de vencimento

### 🛒 Lista de Compras

- Organização de itens por categoria (Alimentos, Limpeza, Higiene, Outros)
- Definição de quantidades, unidades e valores estimados
- **Edição em lote** (*Bulk Edit*) de itens da lista
- **Sincronização em Tempo Real** via SignalR para atualização simultânea entre dispositivos familiares
- Estatísticas instantâneas de itens comprados vs. pendentes

### 💰 Financeiro (V1 e V2)

- **Gestão de Despesas e Receitas**: Categorização detalhada, status de pagamento e histórico
- **Contas Bancárias (`/financial/account`)**: Cadastro de contas, saldos e monitoramento de transações
- **Cartões de Crédito (`/financial/card`)**: Gestão de cartões, limites, datas de fechamento e vencimento de fatura
- **Metas Financeiras (`/financial/goals`)**: Acompanhamento de objetivos financeiros da família
- **Recorrências (`/financial/recurrences`)**: Controle de despesas e receitas recorrentes
- **Visão Financeiro V2 (`/financial-v2`)**: Interface analítica aprimorada com dashboards interativos

### 📦 Compras Futuras & 📅 Calendário

- **Compras Futuras**: Planejamento de compras maiores com estimativa de custos em R$ e priorização
- **Calendário**: Visualização de eventos domésticos preparada para integração com Google Calendar

---

## 🏗️ Arquitetura do Projeto

```
src/
├── components/
│   ├── animated/        # Wrappers animados (AnimatedCard, AnimatedList, etc.)
│   ├── common/          # Primitivos e widgets reutilizáveis (MetricCard, PostIt, etc.)
│   ├── financial/       # Componentes específicos do módulo financeiro
│   ├── modals/          # Diálogos e sheets interativos (PaymentCardSheet, etc.)
│   ├── modules/         # Páginas principais dos módulos (Dashboard, Tasks, Financial, etc.)
│   ├── profile/         # Componentes de perfil e gestão do usuário
│   ├── settings/        # Modais e painéis de configuração
│   ├── skeletons/       # Loading skeletons por view
│   ├── ui/              # Componentes shadcn/Radix (vendor primitives)
│   ├── Navigation.tsx   # Barra de navegação por tabs
│   └── app-sidebar.tsx  # Sidebar lateral retrátil
├── contexts/
│   ├── AppContext.tsx       # Estado global — acesse via useApp()
│   ├── LoadingContext.tsx   # Gestão de telas de carregamento — useAppReady()
│   └── ThemeContext.jsx     # Tema claro/escuro — acesse via useTheme()
├── hooks/               # Custom hooks (useSignalR, useToastNotifications, etc.)
├── lib/                 # Utilitários (animations.ts, avatarUtils.ts, nestIcons.tsx)
├── mocks/               # Dados mockados fortemente tipados (data.ts)
├── pages/               # Páginas auth e convites (Login, Register, GoogleCallback, InviteAccept)
├── schemas/             # Schemas Zod (contratos API em 16 módulos)
├── services/            # Camada de serviços em TypeScript (dual-mode mock/api)
│   └── api/             # httpClient.ts, endpoints.ts, config.ts
├── types/               # Interfaces TypeScript e enums do domínio (index.ts)
├── utils/               # Helpers de métricas (dashboardMetrics, financialUtils, formatters)
├── App.jsx              # Roteamento principal e layouts
└── main.tsx             # Entry point e inicializador do PWA
```

### 🎯 Path Aliases

```typescript
@/*           → src/*
@components/* → src/components/*
@services/*   → src/services/*
@contexts/*   → src/contexts/*
@types/*      → src/types/*
@schemas/*    → src/schemas/*
```

Sempre use aliases — nunca imports relativos como `../../`.

---

### 🔄 Roteamento

React Router v7 em `src/App.jsx`. Rotas protegidas via `RequireAuth`.

- **Públicas**: `/login`, `/register`, `/auth/google/callback`, `/invite`
- **Protegidas (Lazy Loaded)**:
  - `/dashboard` — Painel principal
  - `/tasks` — Gestão de tarefas
  - `/shopping` — Lista de compras
  - `/financial` — Módulo financeiro principal
  - `/financial-v2` — Visão financeira analítica V2
  - `/financial/account` — Contas bancárias
  - `/financial/card` — Cartões de crédito
  - `/financial/goals` — Metas financeiras
  - `/financial/recurrences` — Transações recorrentes
  - `/calendar` — Calendário

---

### 📐 Service Layer & Cliente HTTP

Todos os dados fluem por `src/services/`. Cada serviço implementa a arquitetura **dual-mode** controlada pela variável `VITE_DATA_MODE`:

- **`mock`** — retorna dados tipados de `src/mocks/data.ts` com simulação de latência (100ms)
- **`api`** — realiza requisições HTTP via `httpClient` (`src/services/api/httpClient.ts`) com autenticação baseada em cookies e auto-refresh token de sessão

---

### 🏷️ Sistema de Tipos (Duas Camadas)

- **Layer 1 — Contratos API:** `src/schemas/` — Schemas Zod espelhando a especificação `docs/api.json`
- **Layer 2 — Tipos do App:** `src/types/index.ts` — Interfaces TypeScript e enums do frontend

Use sempre `Schema.safeParse()`, nunca `.parse()`.

---

## 🛠️ Tecnologias

| Categoria | Tecnologias |
|-----------|------------|
| Core | React 18, TypeScript 5.9, Vite 5.4 |
| Roteamento | React Router v7 |
| UI & Estilos | Tailwind CSS 3.4, shadcn/ui, Radix UI, Lucide React |
| Animações | Framer Motion |
| Validação | Zod, React Hook Form |
| Comunicação | Fetch API unificado, SignalR (WebSockets) |
| Utilitários | date-fns, Sonner (toasts), clsx, tailwind-merge |
| PWA | Workbox, Web App Manifest, Service Worker |

---

## 📦 Instalação

```bash
git clone https://github.com/carrijoga/home-manager-app.git
cd home-manager-app
npm install
cp .env.example .env
npm run dev
```

Acesse a aplicação em `http://localhost:3000`.

---

## 🚀 Scripts

```bash
npm run dev            # Dev server na porta 3000
npm run build          # Build de produção (tsc + vite build)
npm run type-check     # Verificação de tipos TypeScript sem emitir código
npm run lint           # Análise estática com ESLint
npm run format         # Formatação de código com Prettier

# Multi-ambiente
npm run dev:staging      # Executa em modo staging
npm run build:staging    # Build direcionado ao ambiente staging
npm run dev:production   # Executa em modo produção local
npm run build:production # Build final de produção
```

---

## 🔧 Variáveis de Ambiente

```env
VITE_DATA_MODE=mock          # mock | api
VITE_ENVIRONMENT=development # development | staging | production
VITE_API_URL=http://localhost:5026
VITE_SIGNALR_URL=http://localhost:5026/hubs/shopping
```

---

## 📚 Documentação Adicional

Toda a documentação técnica detalhada do projeto está disponível na pasta `docs/`:

- [docs/api.json](./docs/api.json) — Especificação OpenAPI do backend (~70KB, fonte da verdade)
- [docs/DESIGN.md](./docs/DESIGN.md) — Racional de UI/UX, acessibilidade e componentes
- [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md) — Guia de ambientes e variáveis de configuração
- [docs/DEPLOY.md](./docs/DEPLOY.md) — Instruções de implantação (Vercel, Netlify, Docker)
- [docs/ROADMAP.md](./docs/ROADMAP.md) — Histórico de entregas e mapa de funcionalidades futuras

---

## 🤝 Contribuindo

1. Fork e clone o repositório
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Siga os padrões: use path aliases, service layer para dados, TypeScript em arquivos novos, componentes shadcn/ui
4. Commit: `git commit -m 'feat: Adiciona MinhaFeature'`
5. Abra um Pull Request com descrição e telas das alterações visuais

Padrão de commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`

---

## 📄 Licença

MIT. Veja o arquivo `LICENSE`.

---

## 👥 Autor

**GitHub**: [@carrijoga](https://github.com/carrijoga)  
**Repositório**: [home-manager-app](https://github.com/carrijoga/home-manager-app)

---

**🪺 Ninho** — Construindo lares organizados, uma tarefa de cada vez.
