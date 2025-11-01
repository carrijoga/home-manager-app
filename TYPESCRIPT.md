# 📘 Guia de Migração para TypeScript

Este documento descreve o processo de migração do projeto Ninho de JavaScript para TypeScript e fornece orientações para continuar a migração gradual.

## ✅ Status Atual da Migração

### Concluído

- ✅ Instalação de dependências TypeScript
- ✅ Configuração do TypeScript (tsconfig.json, tsconfig.node.json)
- ✅ Migração de arquivos de configuração para TypeScript
  - `vite.config.ts`
  - `tailwind.config.ts`
  - `components.json` (tsx: true)
- ✅ Criação de tipos centralizados em `src/types/index.ts`
- ✅ Migração de utilitários
  - `src/lib/utils.ts`
- ✅ Migração de componentes UI (shadcn/ui) para `.tsx`
  - `button.tsx`
  - `input.tsx`
  - `card.tsx`
  - `dialog.tsx`
- ✅ Migração do ponto de entrada
  - `src/main.tsx`
  - `index.html` atualizado
- ✅ Build de produção funcionando
- ✅ Type-check sem erros

### Pendente (Migração Gradual)

Arquivos que ainda estão em JavaScript (.jsx):

#### Contextos
- `src/contexts/ThemeContext.jsx`

#### Componentes Comuns
- `src/components/common/Button.jsx`
- `src/components/common/Card.jsx`
- `src/components/common/Input.jsx`
- `src/components/common/Header.jsx`
- `src/components/common/Logo.jsx`
- `src/components/common/ThemeToggle.jsx`

#### Componentes de Módulos
- `src/components/modules/Dashboard.jsx`
- `src/components/modules/Tasks.jsx`
- `src/components/modules/ShoppingList.jsx`
- `src/components/modules/Financial.jsx`
- `src/components/modules/FutureItems.jsx`
- `src/components/modules/Calendar.jsx`

#### Outros Componentes
- `src/components/Navigation.jsx`
- `src/App.jsx`

#### Serviços
- `src/services/api/config.js`
- `src/services/noticeService.js`
- `src/services/taskService.js`
- `src/services/shoppingService.js`
- `src/services/financialService.js`
- `src/services/futureItemsService.js`

#### Utilitários e Dados
- `src/utils/formatters.js`
- `src/mocks/data.js`
- `src/models/types.js` (deprecated, use `src/types/index.ts`)

## 🔧 Configuração TypeScript

### tsconfig.json

O projeto está configurado com as seguintes opções:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "allowJs": true,          // Permite importar arquivos .js/.jsx
    "checkJs": false,          // Não faz type-check em arquivos JS
    "noEmit": true,

    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

### Modo Híbrido

O projeto está configurado em **modo híbrido**, permitindo que arquivos `.ts`/`.tsx` e `.js`/`.jsx` coexistam. Isso facilita a migração gradual sem quebrar o aplicativo.

## 📚 Tipos Disponíveis

Todos os tipos estão centralizados em `src/types/index.ts`:

### Enums

- `ExpenseCategory` - Categorias de gastos
- `ShoppingCategory` - Categorias de compras
- `Priority` - Níveis de prioridade
- `ModuleId` - IDs dos módulos
- `PaymentMethod` - Métodos de pagamento
- `PaymentStatus` - Status de pagamento
- `FutureItemStatus` - Status de itens futuros

### Interfaces

- `Notice` - Avisos do quadro
- `Task` - Tarefas
- `ShoppingItem` - Item de compra
- `ShoppingList` - Lista de compras mensal
- `Expense` - Despesas/gastos
- `FutureItem` - Itens de compras futuras
- `User` - Usuário
- `Installment` - Parcelamento
- `Payment` - Informações de pagamento

### Exemplo de Uso

```typescript
import { Task, Priority, ModuleId } from '@/types';

const newTask: Task = {
  id: '1',
  title: 'Limpar cozinha',
  assignedTo: 'João',
  completed: false,
  dueDate: '2025-11-02',
  priority: Priority.HIGH
};
```

## 🚀 Como Continuar a Migração

### Passo 1: Escolher um Arquivo

Comece pelos arquivos menores e menos dependentes:
1. Utilitários (`src/utils/formatters.js`)
2. Dados mockados (`src/mocks/data.js`)
3. Serviços
4. Contextos
5. Componentes comuns
6. Componentes de módulos
7. Componentes principais

### Passo 2: Migrar o Arquivo

#### Para Serviços

```typescript
// Antes (noticeService.js)
export const getNotices = async () => {
  const response = await fetch('/api/notices');
  return response.json();
};

// Depois (noticeService.ts)
import { Notice } from '@/types';

export const getNotices = async (): Promise<Notice[]> => {
  const response = await fetch('/api/notices');
  return response.json();
};
```

#### Para Componentes

```typescript
// Antes (Button.jsx)
const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};

// Depois (Button.tsx)
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};

export default Button;
```

### Passo 3: Renomear e Testar

1. Renomear `.js/.jsx` para `.ts/.tsx`
2. Adicionar tipos e interfaces
3. Executar `npm run type-check`
4. Executar `npm run build`
5. Testar funcionalidade

## 📝 Scripts NPM

```bash
# Verificar tipos sem fazer build
npm run type-check

# Build de produção (com type-check)
npm run build

# Desenvolvimento (hot reload)
npm run dev

# Linting (agora suporta .ts/.tsx)
npm run lint

# Formatação (agora suporta .ts/.tsx)
npm run format
```

## 🎯 Benefícios Já Alcançados

1. **Type Safety nos Componentes UI**: Todos os componentes shadcn/ui agora têm tipagem completa
2. **Infraestrutura Pronta**: Configuração TypeScript completa e funcional
3. **Tipos Centralizados**: Todos os tipos de dados disponíveis em `src/types/index.ts`
4. **Build Validado**: Projeto compila sem erros
5. **Migração Gradual**: Possibilidade de migrar arquivos aos poucos sem quebrar o app

## 🔍 Verificando o Progresso

Para ver quantos arquivos ainda precisam ser migrados:

```bash
# Arquivos TypeScript
find src -name "*.ts" -o -name "*.tsx" | wc -l

# Arquivos JavaScript
find src -name "*.js" -o -name "*.jsx" | wc -l
```

## 📖 Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)

---

**Última atualização**: 2025-11-01
**Status**: Migração Parcial Concluída ✅
