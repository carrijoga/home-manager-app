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

### 🔐 Login

- Interface de login com Google OAuth (UI implementada)
- Design moderno e responsivo
- Suporte a dark mode
- Estados de loading e erro
- Preparado para integração futura com backend ASP.NET Core

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
- Atribuição de responsáveis
- Definição de prazos com validação de datas
- Marcação de tarefas concluídas com confirmação
- **Visualização separada** de pendentes e concluídas em tabs
- **Filtros e ordenação** para facilitar organização
- Edição inline de tarefas existentes

### 🛒 Lista de Compras

- Organização de itens por categoria (Alimentos, Limpeza, Higiene, Outros)
- **Badges coloridos** para cada categoria
- Definição de quantidades com validação
- Marcação de itens já comprados com confirmação visual
- **Filtros por categoria** e status (pendente/comprado)
- Controle mensal de compras
- **Estatísticas** de itens comprados vs. pendentes

### 💰 Financeiro

- Registro de despesas com categorização detalhada
- **14 categorias** (Alimentação, Transporte, Moradia, Saúde, Educação, etc.)
- Visualização de gastos por categoria com cores distintas
- Cálculo automático de totais e médias mensais
- **Gráficos e estatísticas** visuais
- Histórico completo de despesas com busca
- **Análise de tendências** de gastos

### 📦 Compras Futuras

- Planejamento de compras maiores e investimentos
- **Sistema de prioridades** (Alta, Média, Baixa) com cores e ícones
- Estimativa de custos com formatação em R$
- Organização por prioridade com filtros
- **Notas e descrições** detalhadas para cada item
- Marcação de itens já adquiridos
- Cálculo do total estimado de investimentos pendentes

### 📅 Calendário

- Espaço reservado para integração futura com Google Calendar
- Sincronização de eventos familiares (em desenvolvimento)

## 🏗️ Arquitetura do Projeto

O projeto foi refatorado seguindo os princípios de **Clean Architecture** e **Separation of Concerns**:

```
ninho/
├── src/
│   ├── components/          # Componentes React
│   │   ├── common/         # Componentes reutilizáveis
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Logo.jsx
│   │   ├── ui/             # Componentes shadcn/ui (TypeScript)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── spinner.tsx
│   │   ├── modules/        # Módulos principais
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── ShoppingList.jsx
│   │   │   ├── Financial.jsx
│   │   │   ├── FutureItems.jsx
│   │   │   └── Calendar.jsx
│   │   ├── skeletons/      # Loading skeletons
│   │   │   ├── DashboardSkeleton.tsx
│   │   │   └── ListSkeleton.tsx
│   │   └── Navigation.tsx  # Navegação por tabs
│   ├── pages/             # Páginas com rotas próprias
│   │   └── Login.tsx      # Tela de login
│   ├── lib/               # Utilitários e helpers
│   │   └── utils.ts       # Função cn() para merge de classes
│   ├── services/          # Camada de serviços
│   │   ├── api/          # Configuração de API
│   │   │   └── config.js
│   │   ├── noticeService.js
│   │   ├── taskService.js
│   │   ├── shoppingService.js
│   │   ├── financialService.js
│   │   └── futureItemsService.js
│   ├── types/            # Definições TypeScript
│   │   └── index.ts      # Tipos centralizados
│   ├── models/           # Tipos legados (deprecated)
│   │   └── types.js
│   ├── mocks/            # Dados mockados
│   │   └── data.js
│   ├── utils/            # Funções utilitárias
│   │   ├── formatters.js
│   │   └── dashboardMetrics.ts
│   ├── contexts/         # Contextos React
│   │   ├── ThemeContext.jsx  # Gerenciamento de tema claro/escuro
│   │   └── AppContext.jsx    # Estado global da aplicação
│   ├── hooks/           # Custom hooks
│   │   └── use-toast-notifications.ts  # Hook para notificações
│   ├── App.jsx           # Componente principal com roteamento
│   ├── main.tsx          # Entry point (TypeScript)
│   └── index.css         # Estilos globais
├── public/               # Arquivos públicos
│   ├── icons/           # Ícones PWA
│   ├── manifest.json    # Manifest PWA
│   └── sw.js            # Service Worker
├── index.html           # HTML principal
├── package.json         # Dependências
├── jsconfig.json        # Configuração de aliases JS
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite
├── tailwind.config.ts   # Configuração Tailwind
├── components.json      # Configuração shadcn/ui
├── docs/                # Documentação organizada
│   ├── README.md       # Índice da documentação
│   ├── ENVIRONMENTS.md # Configuração de ambientes
│   ├── DEPLOY.md       # Guias de deploy
│   └── ROADMAP.md      # Roadmap de features
├── .github/
│   └── copilot-instructions.md  # Instruções para GitHub Copilot
└── README.md           # Documentação principal

```

### 🎯 Path Aliases

O projeto utiliza path aliases configurados em `vite.config.ts` e `tsconfig.json` para facilitar imports:

```typescript
// Aliases disponíveis
@/*            → src/*
@components/*  → src/components/*
@services/*    → src/services/*
@types/*       → src/types/*
@utils/*       → src/utils/*
@lib/*         → src/lib/*
```

**Exemplo de uso:**

```typescript
// ✅ Com alias (recomendado)
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import * as taskService from "@services/taskService";

// ❌ Sem alias (não recomendado)
import { Button } from "../../components/ui/button";
```

### 🔄 Sistema de Roteamento

O app utiliza **React Router v7** com uma arquitetura híbrida:

- **`/login`** - Tela de login (rota independente)
- **`/*`** - Aplicação principal com navegação por estado
  - Dashboard, Tarefas, Compras, Financeiro, Futuro, Calendário
  - Troca de módulos via tabs sem mudança de URL
  - Estado gerenciado no componente `App.jsx`

Este design permite:

- ✅ Login com URL própria para deep linking
- ✅ Navegação rápida entre módulos (sem reload)
- ✅ Estado preservado ao trocar de módulo
- ✅ Preparado para autenticação futura

### 📐 Padrões de Arquitetura

#### Service Layer (Obrigatório)

**TODAS** as operações de dados DEVEM passar pela camada de serviços (`src/services/`). Nunca acesse mocks ou APIs diretamente dos componentes.

```javascript
// ✅ CORRETO: Use o serviço
import * as taskService from "@services/taskService";
const tasks = await taskService.getAllTasks();

// ❌ ERRADO: Acesso direto aos dados
import { mockTasks } from "@mocks/data";
```

Cada serviço implementa acesso dual controlado por `VITE_DATA_MODE`:

- **`mock`** (padrão) - Retorna promises com delay de 100ms de `src/mocks/data.js`
- **`api`** - Faz requisições HTTP via helper `apiRequest()` em `src/services/api/config.js`

#### Gerenciamento de Estado

- **Estado global**: Vive em `App.jsx` usando hooks useState do React
- **Props down**: Dados fluem de App.jsx → componentes de módulo
- **Callbacks up**: Componentes chamam handlers passados via props
- **Context**: Apenas `ThemeContext` para tema claro/escuro (use hook `useTheme()`)
- **Sem Redux/Zustand**: Mantém gerenciamento simples com props

#### Sistema de Módulos

Navegação baseada em tabs definida pelo enum `ModuleIds` em `src/models/types.js`:

- `App.jsx` gerencia o estado `currentModule`
- `Navigation.tsx` renderiza tabs e alterna módulos
- Cada módulo é um componente auto-contido em `src/components/modules/`

## 🛠️ Tecnologias Utilizadas

### Frontend Core

- **React 18.3** - Biblioteca JavaScript para interfaces
- **TypeScript 5.9** - Superset JavaScript com tipagem estática (migração parcial)
- **React Router 7** - Roteamento declarativo para React
- **Vite 5.4** - Build tool e dev server ultrarrápido

### UI e Estilização

- **Tailwind CSS 3.4** - Framework CSS utilitário
- **shadcn/ui** - Sistema de componentes baseado em Radix UI
- **Radix UI** - Primitivos de UI acessíveis e não-estilizados
- **Lucide React** - Biblioteca de ícones modernas (1000+ ícones)
- **Framer Motion** - Animações e transições suaves

### Utilitários

- **date-fns** - Manipulação e formatação de datas
- **React Hot Toast** - Notificações toast elegantes
- **Sonner** - Sistema alternativo de toasts
- **clsx** - Utilitário para construção de classNames
- **tailwind-merge** - Merge inteligente de classes Tailwind

### PWA

- **Workbox** - Ferramentas para Service Workers
- **Web App Manifest** - Configuração de instalação PWA

## 📦 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd ninho
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse no navegador:

```
http://localhost:3000      # Página principal (Dashboard)
http://localhost:3000/login # Tela de login
```

**Nota**: A tela de login está implementada apenas com a interface (UI). A integração com autenticação Google OAuth será feita quando o backend ASP.NET Core estiver pronto.

## 🚀 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento na porta 3000
- `npm run build` - Gera build de produção (com type-check)
- `npm run preview` - Visualiza o build de produção localmente
- `npm run type-check` - Verifica tipos TypeScript sem fazer build
- `npm run lint` - Executa o ESLint em arquivos .js, .jsx, .ts, .tsx
- `npm run format` - Formata o código com Prettier

### Desenvolvimento

O servidor de desenvolvimento abre automaticamente o navegador na porta 3000. Suporta:

- ⚡️ Hot Module Replacement (HMR)
- 🔍 Type-checking em tempo real
- 🎨 Recarga automática de estilos
- 📱 Teste responsivo em múltiplos devices

## 🔧 Configuração

### Ambientes (Development, Staging, Production)

O Ninho suporta múltiplos ambientes com configurações específicas para cada um. Para detalhes completos sobre como configurar e usar diferentes ambientes, consulte [docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md).

**Resumo rápido:**

```bash
# Desenvolvimento local (dados mockados)
npm run dev

# Staging (API de testes)
npm run dev:staging
npm run build:staging

# Production (API de produção)
npm run dev:production
npm run build:production
```

### Modo de Dados

Por padrão, a aplicação usa **dados mockados** localmente. Para alterar:

**Arquivo `.env`:**

```env
# Modo mock (dados locais)
VITE_DATA_MODE=mock

# Modo API (dados de servidor externo)
VITE_DATA_MODE=api

# Ambiente (development, staging, production)
VITE_ENVIRONMENT=development
```

### Integração com API Externa

Os serviços já estão preparados para consumir uma API REST. Quando implementar o backend:

1. Configure a URL da API no arquivo `.env`
2. Altere `VITE_DATA_MODE` para `api`
3. Implemente os endpoints correspondentes no backend

**Endpoints esperados:**

- `GET /api/notices` - Lista avisos
- `POST /api/notices` - Cria aviso
- `GET /api/tasks` - Lista tarefas
- `POST /api/tasks` - Cria tarefa
- `PATCH /api/tasks/:id/toggle` - Alterna status
- E assim por diante...

### CORS

⚠️ **Importante**: Se a API estiver em outro domínio, será necessário configurar CORS no backend:

**Exemplo com Express.js:**

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000", // URL do frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
```

### Autenticação (Em Desenvolvimento)

A tela de login com Google OAuth já está implementada (`/login`), mas ainda não está integrada com o backend:

**Status Atual**:

- ✅ Interface de login completa e responsiva
- ✅ Botão Google com ícone oficial
- ✅ Estados de loading e erro
- ✅ Suporte a dark mode
- ⏳ Integração com backend ASP.NET Core (planejado)
- ⏳ AuthContext para gerenciamento de sessão (planejado)
- ⏳ ProtectedRoute para rotas privadas (planejado)

**Próximos Passos**:

1. Implementar backend ASP.NET Core com Google OAuth
2. Criar AuthContext para gerenciar token e usuário
3. Adicionar componente ProtectedRoute
4. Integrar logout na Navigation
5. Persistir sessão no localStorage

## 📱 Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela:

- 📱 **Mobile** (< 768px) - Interface otimizada para telas pequenas com carrossel de métricas
- 💻 **Tablet** (768px - 1024px) - Layout intermediário com grid adaptativo
- 🖥️ **Desktop** (> 1024px) - Experiência completa com múltiplas colunas

### Design Responsivo

- **Navigation**: Tabs horizontais com scroll suave no mobile
- **Dashboard**: Carrossel de métricas no mobile, grid no desktop
- **Cards**: Stack vertical no mobile, grid multi-coluna no desktop
- **Formulários**: Inputs e botões com tamanhos adaptados ao touch
- **Tipografia**: Escalas responsivas para melhor legibilidade

## 🎨 Tema e Personalização

### Sistema de Temas

O Ninho possui suporte completo a **tema claro/escuro**:

- 🌞 **Tema Claro** - Interface limpa e moderna
- 🌙 **Tema Escuro** - Reduz fadiga visual em ambientes com pouca luz
- 🔄 **Toggle suave** - Transição animada entre temas
- 💾 **Persistência** - Preferência salva no localStorage
- 🎯 **Cores otimizadas** - Paleta especialmente ajustada para cada tema

### Paleta de Cores

As cores podem ser personalizadas no arquivo `tailwind.config.ts`:

```javascript
theme: {
  extend: {
    colors: {
      // Cores primárias modernas e vibrantes
      primary: colors.indigo,
      secondary: colors.purple,
      accent: colors.cyan,
      success: colors.emerald,

      // Tokens específicos para dark mode
      dark: {
        bg: {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#cbd5e1',
          muted: '#94a3b8',
        },
        // ... mais tokens
      }
    }
  }
}
```

### Animações Customizadas

O projeto inclui animações personalizadas em `src/animations.css`:

- `fade-in` - Entrada suave com opacidade
- `slide-in` - Deslizamento lateral
- `scale-in` - Crescimento com escala
- `pulse-soft` - Pulso suave para indicadores

### Componentes

Todos os componentes em `src/components/common/` são reutilizáveis e podem ser customizados através de:

1. **Props de variante** - Estilos pré-definidos (primary, secondary, ghost, etc.)
2. **Classes Tailwind** - Adicione classes diretamente via prop `className`
3. **Função `cn()`** - Utilitário para merge inteligente de classes

## 🎨 Sistema de Design - shadcn/ui

O projeto utiliza [shadcn/ui](https://ui.shadcn.com) como sistema de componentes base. O shadcn/ui oferece componentes acessíveis, customizáveis e bem documentados, construídos sobre Radix UI e Tailwind CSS.

### Componentes Instalados

O projeto possui uma biblioteca completa de componentes UI baseados em shadcn/ui:

#### Formulários & Input

- **Button** - Botões com 6 variantes (default, destructive, outline, secondary, ghost, link) e 4 tamanhos
- **Input** - Campos de entrada de texto acessíveis
- **Textarea** - Área de texto multi-linha
- **Label** - Labels para formulários com acessibilidade
- **Select** - Dropdown de seleção estilizado
- **Checkbox** - Caixas de seleção com estados
- **DatePicker** - Seletor de data com calendário interativo (formato DD/MM/YYYY)

#### Layout & Container

- **Card** - Containers modulares (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Separator** - Linha separadora horizontal ou vertical
- **Accordion** - Painéis expansíveis para conteúdo

#### Overlay & Feedback

- **Dialog** - Modais e diálogos com overlay
- **AlertDialog** - Diálogos de confirmação
- **Popover** - Popovers posicionáveis
- **DropdownMenu** - Menus dropdown contextuais

#### Display & Visual

- **Badge** - Tags e badges de status coloridos
- **Avatar** - Avatares circulares com fallback e imagem
- **Skeleton** - Placeholders de carregamento animados
- **Spinner** - Indicadores de loading personalizados

#### Notificações

- **Sonner** - Sistema de toasts elegante

**📦 Total**: 20+ componentes reutilizáveis

Para documentação completa, exemplos de uso e guia de customização, consulte [COMPONENTS.md](./COMPONENTS.md).

### Adicionando Novos Componentes

Para adicionar novos componentes do shadcn/ui:

```bash
# Exemplo: adicionando o componente Select
npx shadcn@latest add select

# Exemplo: adicionando múltiplos componentes
npx shadcn@latest add dropdown-menu avatar badge
```

Os componentes são adicionados em `src/components/ui/` e podem ser importados em qualquer parte do projeto:

```jsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function MeuComponente() {
  return (
    <Card>
      <Button>Clique aqui</Button>
    </Card>
  );
}
```

### Customização de Componentes

Os componentes do shadcn/ui são totalmente customizáveis através de:

1. **Classes Tailwind**: Adicione classes diretamente aos componentes
2. **Variáveis CSS**: Modifique as cores no `src/index.css`
3. **Arquivo de configuração**: Ajuste `components.json` para mudar comportamentos globais

### Documentação

Para mais informações sobre os componentes disponíveis, visite a [documentação oficial do shadcn/ui](https://ui.shadcn.com/docs/components).

## 📘 TypeScript

O projeto está em processo de migração para TypeScript. A infraestrutura está completa e funcional:

### Status Atual

✅ **Concluído:**

- Configuração TypeScript (tsconfig.json)
- Tipos centralizados em `src/types/index.ts`
- Componentes UI shadcn/ui em TypeScript
- Utilitários e ferramentas
- Build e type-check funcionando

🔄 **Em Progresso:**

- Migração gradual de componentes e serviços
- Modo híbrido (JS/TS) habilitado para transição suave

### Como Usar Tipos

```typescript
import { Task, Priority, Expense } from "@/types";

const newTask: Task = {
  id: "1",
  title: "Limpar cozinha",
  assignedTo: "João",
  completed: false,
  dueDate: "2025-11-02",
  priority: Priority.HIGH,
};
```

Para mais detalhes sobre a arquitetura, padrões e guia TypeScript, consulte [.github/copilot-instructions.md](./.github/copilot-instructions.md).

## 🎯 Recursos de UX

### Skeleton Loaders

Carregamento elegante com placeholders animados:

- **DashboardSkeleton** - Para a tela inicial
- **ListSkeleton** - Para listas de itens
- **CardSkeleton** - Para cards individuais

### Notificações Toast

Sistema de notificações com som opcional:

- **Toast visual** - Alertas elegantes com react-hot-toast
- **Som de notificação** - Feedback sonoro configurável
- **Toggle de som** - Controle no header para habilitar/desabilitar sons
- **Posições customizáveis** - Top, bottom, left, right

### Busca Global

Sistema de busca unificado no header:

- Busca simultânea em **tarefas**, **itens de compras** e **despesas**
- Resultados em tempo real conforme você digita
- Destaque visual dos termos encontrados
- Navegação rápida para o módulo correspondente

### Micro-interações

- **Hover states** - Feedback visual em todos os elementos interativos
- **Animações suaves** - Transições com Framer Motion
- **Loading states** - Spinners e skeletons durante carregamento
- **Confirmações visuais** - Feedback ao completar ações

### Acessibilidade

- **Suporte a teclado** - Navegação completa por teclado
- **ARIA labels** - Labels apropriados para screen readers
- **Contraste adequado** - Cores otimizadas para WCAG AA
- **Focus indicators** - Indicadores visuais de foco

## 🔮 Roadmap Futuro

### Curto Prazo (Próximas Sprints)

- [ ] Sistema completo de autenticação com Google OAuth
- [ ] Backend ASP.NET Core com Entity Framework
- [ ] Banco de dados PostgreSQL/SQL Server
- [ ] API REST completa para todos os módulos
- [ ] AuthContext e ProtectedRoute

### Médio Prazo

- [ ] Integração com Google Calendar API
- [ ] Sistema de notificações push
- [ ] Modo offline avançado com sincronização
- [ ] Multi-usuário com permissões e roles
- [ ] Compartilhamento de listas entre membros da família
- [ ] Relatórios financeiros em PDF
- [ ] Gráficos avançados com recharts ou chart.js
- [ ] Exportação de dados (CSV, Excel)

### Longo Prazo

- [ ] Aplicativo mobile nativo (React Native)
- [ ] Integração com assistentes de voz (Google Assistant, Alexa)
- [ ] Machine Learning para sugestões de gastos
- [ ] Gamificação de tarefas domésticas
- [ ] Dashboard de métricas avançadas
- [ ] Integração com apps de delivery e supermercados
- [ ] Sistema de receitas e planejamento de refeições
- [ ] Módulo de manutenção preventiva da casa

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. **Fork o projeto**

   ```bash
   gh repo fork carrijoga/home-manager-app
   ```

2. **Clone seu fork**

   ```bash
   git clone https://github.com/SEU_USUARIO/home-manager-app.git
   cd home-manager-app
   ```

3. **Crie uma branch para sua feature**

   ```bash
   git checkout -b feature/MinhaFeature
   ```

4. **Instale as dependências**

   ```bash
   npm install
   ```

5. **Faça suas alterações seguindo os padrões do projeto:**
   - Use path aliases (`@/`, `@components/`, etc.)
   - Siga a Service Layer Pattern para dados
   - Mantenha componentes responsivos
   - Adicione TypeScript em novos arquivos
   - Use componentes shadcn/ui quando possível
   - Teste em tema claro e escuro

6. **Commit suas mudanças**

   ```bash
   git commit -m 'feat: Adiciona MinhaFeature'
   ```

   Siga o padrão de commits:
   - `feat:` - Nova funcionalidade
   - `fix:` - Correção de bug
   - `docs:` - Apenas documentação
   - `style:` - Formatação, ponto e vírgula, etc
   - `refactor:` - Refatoração de código
   - `test:` - Adição de testes
   - `chore:` - Atualização de dependências, config, etc

7. **Push para sua branch**

   ```bash
   git push origin feature/MinhaFeature
   ```

8. **Abra um Pull Request**
   - Descreva claramente o que foi implementado
   - Adicione screenshots se houver mudanças visuais
   - Referencie issues relacionadas

### 🐛 Reportando Bugs

Ao reportar bugs, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Informações do ambiente (navegador, OS)

### 💡 Sugerindo Funcionalidades

Para sugerir novas funcionalidades:

- Descreva o problema que ela resolve
- Explique a solução proposta
- Considere alternativas
- Indique a prioridade (baixa, média, alta)

## ⚡ Performance e Otimizações

### Build de Produção

O build otimizado inclui:

- **Code splitting** - Carregamento lazy de módulos
- **Tree shaking** - Remoção de código não utilizado
- **Minificação** - CSS e JavaScript minificados
- **Asset optimization** - Imagens e ícones otimizados
- **Cache busting** - Hashes em nomes de arquivos

### Service Worker

O PWA inclui Service Worker para:

- **Cache de assets** - Arquivos estáticos em cache
- **Offline fallback** - Funcionalidade básica offline
- **Background sync** - Sincronização quando online
- **Update checks** - Verificação de atualizações a cada 60s

### Best Practices

- **Lazy loading** - Componentes carregados sob demanda
- **Memoization** - React.memo para prevenir re-renders
- **Debouncing** - Em buscas e inputs de texto
- **Virtual scrolling** - Para listas longas (futuro)

## 📚 Documentação

Toda a documentação do projeto está organizada na pasta **`docs/`**:

### 📖 Guias de Configuração
- **[docs/ENVIRONMENTS.md](./docs/ENVIRONMENTS.md)** - Configuração de ambientes (development, staging, production)
- **[docs/DEPLOY.md](./docs/DEPLOY.md)** - Guias de deploy para Vercel, Netlify, Docker e mais

### 🎯 Planejamento
- **[docs/ROADMAP.md](./docs/ROADMAP.md)** - Roadmap de features e ideias futuras

### 🏗️ Arquitetura e Desenvolvimento
- **[components.json](./components.json)** - Configuração shadcn/ui
- **[src/types/index.ts](./src/types/index.ts)** - Definições TypeScript centralizadas
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Instruções para GitHub Copilot

### 📑 Índice Completo
Consulte **[docs/README.md](./docs/README.md)** para o índice completo da documentação.

## 🔐 Segurança

### Práticas Atuais

- ✅ Validação de inputs do usuário
- ✅ Sanitização de dados exibidos
- ✅ HTTPS obrigatório em produção (via Vercel)
- ✅ Content Security Policy configurado

### Planejado (com Backend)

- 🔄 Autenticação JWT ou OAuth2
- 🔄 Rate limiting em APIs
- 🔄 Criptografia de dados sensíveis
- 🔄 Proteção CSRF
- 🔄 Input validation server-side

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autor

Desenvolvido com ❤️ para facilitar a organização doméstica e fortalecer a conexão familiar.

**GitHub**: [@carrijoga](https://github.com/carrijoga)  
**Repositório**: [home-manager-app](https://github.com/carrijoga/home-manager-app)

## 📞 Suporte e Contato

- 🐛 **Bugs e Issues**: [GitHub Issues](https://github.com/carrijoga/home-manager-app/issues)
- 💡 **Sugestões**: [GitHub Discussions](https://github.com/carrijoga/home-manager-app/discussions)
- 📧 **Contato direto**: Abra uma issue ou discussion

## 🌟 Agradecimentos

- **shadcn/ui** - Sistema de componentes elegante
- **Radix UI** - Primitivos de UI acessíveis
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide Icons** - Biblioteca de ícones modernos
- **React** e toda comunidade open source

## 📊 Status do Projeto

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React](https://img.shields.io/badge/react-18.3-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

**🪺 Ninho** - Construindo lares organizados, uma tarefa de cada vez.

**Última atualização**: Novembro 2025
