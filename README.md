# 🪺 Ninho

**Seu lar, organizado.**

Aplicativo completo de gerenciamento doméstico para toda a família. Com múltiplos módulos integrados, o Ninho facilita o dia a dia, centralizando tarefas, despesas, compras e muito mais em um único lugar.

## 📋 Sobre o Projeto

**Ninho** é uma aplicação web desenvolvida em React que ajuda você a construir e manter a organização do seu lar. Assim como os pássaros constroem seus ninhos com cuidado, o Ninho oferece as ferramentas para você cuidar da sua casa com praticidade e eficiência.

## ✨ Funcionalidades

### 🔐 Login

- Interface de login com Google OAuth (UI implementada)
- Design moderno e responsivo
- Suporte a dark mode
- Estados de loading e erro
- Preparado para integração futura com backend ASP.NET Core

### 📊 Dashboard

- Visão geral de todas as atividades da casa
- Quadro de avisos para comunicação familiar
- Resumo de tarefas pendentes
- Indicadores de gastos mensais
- Lista rápida de itens a comprar

### ✅ Tarefas

- Criação e gerenciamento de tarefas domésticas
- Atribuição de responsáveis
- Definição de prazos
- Marcação de tarefas concluídas
- Visualização separada de pendentes e concluídas

### 🛒 Lista de Compras

- Organização de itens por categoria (Alimentos, Limpeza, etc.)
- Definição de quantidades
- Marcação de itens já comprados
- Controle mensal de compras

### 💰 Financeiro

- Registro de despesas com categorização
- Visualização de gastos por categoria
- Cálculo automático de totais e médias
- Histórico completo de despesas

### 📦 Compras Futuras

- Planejamento de compras maiores
- Definição de prioridades (alta, média, baixa)
- Estimativa de custos
- Organização por prioridade

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
│   │   └── ThemeContext.jsx
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
└── README.md            # Documentação

```

### 🔄 Sistema de Roteamento

O app utiliza **React Router v6** com uma arquitetura híbrida:

- **`/login`** - Tela de login (rota independente)
- **`/*`** - Aplicação principal com navegação por estado
  - Dashboard, Tarefas, Compras, Financeiro, Futuro, Calendário
  - Troca de módulos via tabs sem mudança de URL
  - Estado gerenciado no componente `HomeLayout`

Este design permite:

- ✅ Login com URL própria para deep linking
- ✅ Navegação rápida entre módulos (sem reload)
- ✅ Estado preservado ao trocar de módulo
- ✅ Preparado para autenticação futura

## 🛠️ Tecnologias Utilizadas

- **React 18.3** - Biblioteca JavaScript para interfaces
- **TypeScript 5.9** - Superset JavaScript com tipagem estática (migração parcial)
- **React Router 6** - Roteamento declarativo para React
- **Vite 5.4** - Build tool e dev server
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **shadcn/ui** - Sistema de componentes baseado em Radix UI
- **Lucide React** - Biblioteca de ícones
- **date-fns** - Manipulação de datas
- **Framer Motion** - Animações e transições
- **React Hot Toast** - Notificações toast

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

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção (com type-check)
- `npm run preview` - Visualiza o build de produção
- `npm run type-check` - Verifica tipos TypeScript sem fazer build
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier

## 🔧 Configuração

### Modo de Dados

Por padrão, a aplicação usa **dados mockados** localmente. Para alterar:

**Arquivo `.env`:**

```env
# Modo mock (dados locais)
VITE_DATA_MODE=mock

# Modo API (dados de servidor externo)
VITE_DATA_MODE=api
VITE_API_URL=http://localhost:3001/api
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

- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

## 🎨 Personalização

### Cores

As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Suas cores aqui
      }
    }
  }
}
```

### Componentes

Todos os componentes em `src/components/common/` são reutilizáveis e podem ser customizados.

## 🎨 Sistema de Design - shadcn/ui

O projeto utiliza [shadcn/ui](https://ui.shadcn.com) como sistema de componentes base. O shadcn/ui oferece componentes acessíveis, customizáveis e bem documentados, construídos sobre Radix UI e Tailwind CSS.

### Componentes Instalados

O projeto possui uma biblioteca completa de componentes UI baseados em shadcn/ui:

#### Formulários

- **Button** - Botões com 6 variantes e 4 tamanhos
- **Input** - Campos de entrada de texto
- **Textarea** - Área de texto multi-linha
- **Label** - Labels acessíveis para formulários
- **Select** - Dropdown de seleção
- **DatePicker** - Seletor de data com calendário (formato DD/MM/YYYY)

#### Layout

- **Card** - Containers para conteúdo
- **Separator** - Linha separadora

#### Overlay

- **Dialog** - Modais e diálogos

#### Display

- **Badge** - Tags e badges de status
- **Avatar** - Avatares circulares com fallback

**📦 Total**: 11 componentes (10 base + DatePicker customizado)

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

Para mais detalhes sobre a migração TypeScript, consulte [TYPESCRIPT.md](./TYPESCRIPT.md).

## 🔮 Roadmap Futuro

- [ ] Integração com Google Calendar
- [ ] Sistema de autenticação de usuários
- [ ] Backend com Node.js e Express
- [ ] Banco de dados (MongoDB/PostgreSQL)
- [ ] Notificações push
- [ ] Modo offline com Service Workers
- [ ] Aplicativo mobile (React Native)
- [ ] Relatórios financeiros detalhados
- [ ] Gráficos e estatísticas
- [ ] Exportação de dados (PDF, Excel)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

Desenvolvido com ❤️ para facilitar a organização doméstica.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Nota:** Este projeto está em desenvolvimento ativo. Novas funcionalidades serão adicionadas regularmente.
