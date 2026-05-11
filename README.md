# 🪺 Ninho

**Seu lar, organizado.**

Aplicativo completo de gerenciamento doméstico para toda a família. Com múltiplos módulos integrados, o Ninho facilita o dia a dia, centralizando tarefas, despesas, compras e muito mais em um único lugar.

## 📋 Sobre o Projeto

**Ninho** é uma Progressive Web App (PWA) desenvolvida em React que ajuda você a construir e manter a organização do seu lar. Assim como os pássaros constroem seus ninhos com cuidado, o Ninho oferece as ferramentas para você cuidar da sua casa com praticidade e eficiência.

### 📱 Progressive Web App (PWA)

O Ninho é uma PWA completa, oferecendo:

- **✅ Instalável** - Instale no seu celular ou computador como um app nativo
- **🔄 Service Worker** - Cache inteligente para melhor performance
- **📴 Funcionamento offline** - Acesse dados mesmo sem conexão
- **🚀 Performance otimizada** - Carregamento rápido e experiência fluída
- **🔔 Notificações** - Sistema de notificações toast com sons opcionais
- **🌓 Tema claro/escuro** - Alterna entre temas com suporte a preferências do sistema

## ✨ Funcionalidades

### 🔐 Autenticação

- Login com e-mail/senha e Google OAuth
- Registro de nova conta com geração de nome de usuário
- Toggle de visibilidade de senha
- Redirecionamento via `/auth/google/callback` para concluir o fluxo OAuth e validar a autenticação retornada pelo provedor
- Rotas protegidas com `RequireAuth`

### 📊 Dashboard

- Visão geral de todas as atividades da casa
- **Quadro de avisos** interativo para comunicação familiar
- **Métricas visuais** com mini-gráficos e tendências
- Resumo de tarefas pendentes com seção dedicada
- Indicadores de gastos mensais
- Lista rápida de itens a comprar prioritários
- **Carrossel de métricas** para visualização compacta no mobile
- **Skeleton loaders** para melhor experiência de carregamento
- **Busca global** para encontrar tarefas, itens e despesas rapidamente

### ✅ Tarefas

- Criação e gerenciamento de tarefas domésticas
- **Três níveis de prioridade** (Alta, Média, Baixa) com indicadores visuais
- Atribuição de responsáveis e definição de prazos
- Marcação de tarefas concluídas com confirmação
- **Visualização separada** de pendentes e concluídas em tabs
- **Filtros e ordenação** para facilitar organização

### 🛒 Lista de Compras

- Organização de itens por categoria (Alimentos, Limpeza, Higiene, Outros)
- Definição de quantidades e marcação de itens comprados
- **Filtros por categoria** e status (pendente/comprado)
- **Estatísticas** de itens comprados vs. pendentes

### 💰 Financeiro

- Registro de despesas com categorização detalhada (14 categorias)
- Visualização de gastos por categoria com cores distintas
- Cálculo automático de totais e médias mensais
- **Gráficos e estatísticas** visuais e histórico completo

### 📦 Compras Futuras

- Planejamento de compras maiores com estimativa de custos em R$
- **Sistema de prioridades** com cores e ícones
- Marcação de itens já adquiridos e cálculo do total estimado

### 📅 Calendário

- Espaço reservado para integração futura com Google Calendar

## 🏗️ Arquitetura do Projeto

```
src/
├── components/
│   ├── common/          # Primitivos e widgets reutilizáveis
│   ├── modules/         # Páginas de cada rota (Dashboard, Tasks, etc.)
│   ├── skeletons/       # Loading skeletons por view
│   ├── ui/              # Componentes shadcn/Radix — tratar como vendor
│   ├── animated/        # Re-exports de wrappers animados
│   ├── Navigation.tsx   # Barra de navegação por tabs
│   └── app-sidebar.tsx  # Sidebar lateral
├── contexts/
│   ├── AppContext.jsx    # Estado global — acesse via useApp()
│   └── ThemeContext.jsx  # Tema claro/escuro — acesse via useTheme()
├── hooks/               # Custom hooks
├── lib/                 # Utilitários (utils.ts, animations.ts, avatarUtils.ts)
├── mocks/               # Dados mockados (data.js)
├── models/              # Tipos legados (deprecated — use src/types/)
├── pages/               # Páginas auth: Login, Register, GoogleCallback
├── schemas/             # Schemas Zod (contratos da API)
├── services/            # Camada de serviços (dual-mode mock/api)
│   └── api/             # config.js — helper HTTP base
├── types/               # Interfaces TypeScript do app (index.ts)
├── utils/               # Formatters e helpers de métricas
├── App.jsx              # Roteamento principal
└── main.tsx             # Entry point
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

### 🔄 Roteamento

React Router v7 em `src/App.jsx`. Rotas protegidas via `RequireAuth`.

- `/login`, `/register`, `/auth/google/callback` — auth (não protegidas)
- `/dashboard`, `/tasks`, `/shopping`, `/financial`, `/future`, `/calendar` — app (protegidas, lazy-loaded)

### 📐 Service Layer (Obrigatório)

Todos os dados fluem por `src/services/`. Cada serviço implementa dual-mode controlado por `VITE_DATA_MODE`:

- **`mock`** — retorna dados de `src/mocks/data.js` com delay de 100ms
- **`api`** — faz requisições HTTP via `src/services/api/config.js`

### 🏷️ Sistema de Tipos (Duas Camadas)

- **Layer 1 — Contratos API:** `src/schemas/` — Zod schemas espelhando `docs/api.json`
- **Layer 2 — Tipos do app:** `src/types/index.ts` — interfaces TypeScript do frontend

Use sempre `Schema.safeParse()`, nunca `.parse()`.

## 🛠️ Tecnologias

| Categoria | Tecnologias |
|-----------|------------|
| Core | React 18, TypeScript 5.9 (migração híbrida), Vite 5.4 |
| Roteamento | React Router v7 |
| UI | Tailwind CSS 3.4, shadcn/ui, Radix UI, Lucide React |
| Animações | Framer Motion |
| Validação | Zod |
| Utilitários | date-fns, Sonner (toasts), clsx, tailwind-merge |
| PWA | Workbox, Web App Manifest |

## 📦 Instalação

```bash
git clone https://github.com/carrijoga/home-manager-app.git
cd home-manager-app
npm install
cp .env.example .env
npm run dev
```

Acesse em `http://localhost:3000`.

## 🚀 Scripts

```bash
npm run dev            # Dev server na porta 3000
npm run build          # Build de produção (tsc + vite build)
npm run type-check     # Verificação TypeScript sem build
npm run lint           # ESLint em JS/TS
npm run format         # Prettier

# Multi-ambiente
npm run dev:staging
npm run build:staging
npm run dev:production
npm run build:production
```

## 🔧 Variáveis de Ambiente

```env
VITE_DATA_MODE=mock          # mock | api
VITE_ENVIRONMENT=development # development | staging | production
VITE_API_URL=http://localhost:5026
```

## 📘 TypeScript

Migração híbrida em andamento (`allowJs: true`, `checkJs: false`). Services, schemas, types, contexts e pages estão em `.ts`/`.tsx`. Componentes em `src/components/modules/` ainda são `.jsx` — migrar gradualmente ao editar, nunca reescrever por completo.

## 🎨 Tema

Tema claro/escuro gerenciado em `ThemeContext.jsx`. Preferência salva em `localStorage` com a chave `'ninho-theme'`. Use o hook `useTheme()` — nunca acesse o contexto diretamente.

## 📚 Documentação

- A documentação versionada do projeto está concentrada neste README e em `docs/api.json`.
- [docs/api.json](./docs/api.json) — Spec OpenAPI do backend (~70KB, fonte da verdade)

## 🤝 Contribuindo

1. Fork e clone o repositório
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Siga os padrões: use path aliases, service layer para dados, TypeScript em arquivos novos, componentes shadcn/ui
4. Commit: `git commit -m 'feat: Adiciona MinhaFeature'`
5. Abra um Pull Request com screenshots para mudanças visuais

Padrão de commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`

## 📄 Licença

MIT. Veja o arquivo `LICENSE`.

## 👥 Autor

**GitHub**: [@carrijoga](https://github.com/carrijoga)
**Repositório**: [home-manager-app](https://github.com/carrijoga/home-manager-app)

---

**🪺 Ninho** - Construindo lares organizados, uma tarefa de cada vez.
