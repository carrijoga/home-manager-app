# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ninho** is a Brazilian Portuguese home management web application built with React and TypeScript. It helps families organize household tasks, shopping lists, expenses, and future purchases. The app is a Progressive Web App (PWA) with dark mode support and smooth animations.

## TypeScript Migration Status

The project is in **hybrid mode** - partially migrated to TypeScript:

### ✅ Migrated to TypeScript

- Configuration files (`vite.config.ts`, `tailwind.config.ts`)
- Type definitions (`src/types/index.ts`)
- shadcn/ui components (`src/components/ui/*.tsx`)
- Sidebar component (`src/components/app-sidebar.tsx`)
- Skeleton components (`src/components/skeletons/*.tsx`)
- Pages (`src/pages/Login.tsx`)
- Utilities (`src/lib/utils.ts`)
- Entry point (`src/main.tsx`)

### 🔄 Remaining in JavaScript

- Most React components (`.jsx` files in `components/modules/` and `components/common/`)
- Main App component (`src/App.jsx`)
- Contexts (`src/contexts/AppContext.jsx`, `src/contexts/ThemeContext.jsx`)
- Services (`src/services/*.js`)
- Mocks and utilities

**Important**: The `tsconfig.json` has `allowJs: true` and `checkJs: false`, allowing seamless imports between TS and JS files during the migration period.

### Type Usage

All types are centralized in `src/types/index.ts`. Use them like this:

```typescript
import { Task, Priority, Expense } from "@/types";

const task: Task = {
  id: "1",
  title: "Example",
  // ...
};
```

For detailed migration guide, see `TYPESCRIPT.md`.

## Common Patterns & Examples

### Adding a New Module

To add a new module to the application, follow these steps:

1. **Create the service** (`src/services/myModuleService.js`):
```javascript
import { DATA_MODE } from './api/config';
import * as mockData from '../mocks/data';

export const getAllItems = async () => {
  if (DATA_MODE === 'mock') {
    return new Promise(resolve =>
      setTimeout(() => resolve(mockData.myItems), 100)
    );
  }
  // API implementation here
};
```

2. **Add state to AppContext** (`src/contexts/AppContext.jsx`):
```javascript
import * as myModuleService from '@/services/myModuleService';

export function AppProvider({ children }) {
  const [myItems, setMyItems] = useState([]);

  const addMyItem = async (item) => {
    const newItem = await myModuleService.addItem(item);
    setMyItems([...myItems, newItem]);
  };

  // Add to memoized value
  const value = useMemo(() => ({
    myItems,
    addMyItem,
    // ...
  }), [myItems]);
}
```

3. **Create module component** (`src/components/modules/MyModule.jsx`):
```javascript
import { useApp } from '@/contexts/AppContext';

export default function MyModule() {
  const { myItems, addMyItem } = useApp();

  return (
    <div>
      {/* Module UI */}
    </div>
  );
}
```

4. **Add route to App.jsx**:
```javascript
const MyModuleModule = lazy(() => import('./components/modules/MyModule'));

<Route path="my-module" element={
  <Suspense fallback={<DashboardSkeleton />}>
    <FadeIn><MyModule /></FadeIn>
  </Suspense>
} />
```

5. **Add to AppSidebar** (`src/components/app-sidebar.tsx`):
```typescript
{
  title: "My Module",
  url: "/my-module",
  icon: MyIcon,
}
```

### Working with Forms

Use shadcn/ui components with controlled inputs:

```javascript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

function MyForm() {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTask({ title });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="title">Título</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}
```

### Navigating Programmatically

Use React Router's `useNavigate` hook:

```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const goToTasks = () => {
    navigate('/tasks');
  };

  return <button onClick={goToTasks}>Ver Tarefas</button>;
}
```

## Development Commands

### Essential Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (runs on http://localhost:3000, opens automatically)
- `npm run build` - Create production build (includes TypeScript type-check)
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking without building
- `npm run lint` - Run ESLint on src/ directory (supports .js, .jsx, .ts, .tsx)
- `npm run format` - Format code with Prettier

### Testing & Quality

- No test suite currently configured
- Linting checks .jsx, .js, .tsx, and .ts files in src/
- TypeScript type-checking enforces type safety

## Architecture

### Routing Architecture

The application uses **React Router v7** with proper route-based navigation:

**Route Structure**:

```
/ (root)
├── /login → Login page (public)
└── / → HomeLayout (authenticated app shell)
    ├── /dashboard → Dashboard module
    ├── /tasks → Tasks module
    ├── /shopping → Shopping List module
    ├── /financial → Financial module
    ├── /future → Future Items module
    └── /calendar → Calendar module
```

**Key Points**:

- `App.jsx` manages top-level routing with `<Routes>` and `<Route>`
- `/login` route renders the Login component (public access)
- All other routes render through `HomeLayout` component with `<Outlet />`
- Each module has its own route and URL (e.g., `/tasks`, `/shopping`)
- **Lazy loading**: Modules are loaded on-demand using `React.lazy()` and `<Suspense>`
- Root path `/` redirects to `/dashboard`

**Benefits**:

- Proper deep linking and browser history support
- Code splitting for optimized initial load
- Better UX with URL-based navigation
- Easier to implement protected routes in the future

### Data Flow Architecture

The application uses a **service layer pattern** with dual-mode data access:

1. **Mock Mode** (default): Uses local data from `src/mocks/data.js`
2. **API Mode**: Ready for REST API integration (not yet implemented)

**Configuration**: Set `VITE_DATA_MODE` in `.env` to switch between 'mock' and 'api'

### State Management

- **Global State**: Managed in `AppContext` (`src/contexts/AppContext.jsx`) using React Context API
- **App Context**: Centralized state management with `AppProvider` and `useApp()` hook
- **Theme Context**: Separate `ThemeContext` for dark/light theme management
- All data (notices, tasks, shopping, expenses, future items) stored in AppContext
- Modules consume state via `useApp()` hook instead of props
- Actions (add, delete, toggle) provided through context, not callbacks

### Layer Structure

```
┌─────────────────────────────────────────┐
│   Components (UI Layer)                 │
│   - modules/ (feature components)       │
│   - common/ (reusable UI components)    │
└─────────────────────────────────────────┘
             ↕
┌─────────────────────────────────────────┐
│   Services (Business Logic)             │
│   - All data operations                 │
│   - Mock/API mode abstraction           │
└─────────────────────────────────────────┘
             ↕
┌─────────────────────────────────────────┐
│   Data Layer                            │
│   - mocks/data.js (mock data)           │
│   - api/config.js (API configuration)   │
└─────────────────────────────────────────┘
```

**Critical Pattern**: ALL data operations must go through services. Never access mock data or API directly from components.

### Service Layer Pattern

Each domain has its own service file (`taskService.js`, `financialService.js`, etc.):

- Services check `DATA_MODE` to determine data source
- Mock mode: Returns promises with simulated delay (100ms)
- API mode: Makes HTTP requests using `apiRequest()` helper
- Services handle ID generation, data transformation, and error handling

**When adding new features**: Always create or extend services rather than putting business logic in components.

### AppContext Pattern

The application uses a centralized Context API pattern for state management:

**AppContext** (`src/contexts/AppContext.jsx`):
- Wraps entire app via `<AppProvider>` in `App.jsx`
- Stores all application data (notices, tasks, shopping, expenses, future items)
- Provides actions (add, delete, toggle) through context
- Handles initial data loading on mount using service layer
- Uses `useMemo` to optimize context value updates

**Usage in Components**:
```javascript
import { useApp } from '@/contexts/AppContext';

function MyComponent() {
  const { tasks, addTask, deleteTask } = useApp();

  // Access data and actions directly
  const handleAdd = () => addTask({ title: 'New Task' });
}
```

**Important**:
- NEVER import services directly in module components
- ALWAYS use `useApp()` hook to access data and actions
- Services are ONLY called from AppContext
- This ensures single source of truth and consistent state updates

### Module System

The app uses **route-based navigation** with sidebar:

**Routes** (React Router):

- `/login` - Login page with Google OAuth UI
- `/dashboard` - Dashboard overview
- `/tasks` - Tasks management
- `/shopping` - Shopping list
- `/financial` - Financial tracking
- `/future` - Future purchases
- `/calendar` - Calendar (placeholder)

**Navigation**:

- `AppSidebar` component (TypeScript) provides collapsible sidebar navigation
- Uses shadcn/ui `Sidebar` component with `SidebarProvider`
- User avatar, notifications, and theme toggle in sidebar
- Navigation items trigger route changes via `react-router-dom`
- Each module is a self-contained feature component in `components/modules/`
- Modules are lazy-loaded for performance optimization

**Navigation Flow**:

```
User clicks sidebar item → React Router navigates to route
→ HomeLayout renders with <Outlet />
→ Route component lazy loads and renders
```

### Authentication & Pages Structure

**Pages Directory** (`src/pages/`):

- `Login.tsx` - Login page with Google OAuth button (UI only, no backend integration yet)
  - Responsive design with card layout
  - Google icon (official SVG)
  - Loading states (2-second simulation)
  - Error message display
  - Dark mode support
  - TODO: Future integration with ASP.NET Core backend

**Note**: Authentication logic, protected routes, and session management are planned for future implementation.

### Component Organization

- `components/common/` - Reusable UI components (Button, Card, Input, Header, Logo, FadeIn, etc.)
- `components/ui/` - shadcn/ui components (button, card, dialog, select, spinner, sidebar, etc.)
- `components/modules/` - Feature modules (Dashboard, Tasks, ShoppingList, Financial, FutureItems, Calendar)
- `components/app-sidebar.tsx` - Main sidebar navigation with user profile and notifications
- `components/skeletons/` - Loading skeletons for async data (TypeScript)
- `pages/` - Standalone pages with their own routes (Login, etc.)
- `contexts/` - React contexts (AppContext, ThemeContext)
- Each component follows React functional component pattern with hooks

## Styling System

### Tailwind Configuration

The app uses a custom color palette defined in `tailwind.config.js`:

**Theme Colors**:

- `ninho` (brown/earth tones) - Primary brand color
- `aconchego` (warm yellow) - Warmth and coziness
- `natureza` (green) - Growth and life
- `serenidade` (blue) - Tranquility and organization
- `aviso` (yellow) - Warnings

**Dark Mode Colors**:

- `dark.bg.*` - Background layers (primary, secondary, tertiary, elevated, hover)
- `dark.text.*` - Text hierarchy (primary, secondary, tertiary, muted)
- `dark.border.*` - Border variations (subtle, default, emphasis)
- `dark.accent.*` - Accent color adaptations for dark mode

**Dark Mode**: Enabled via class mode (`class` strategy), managed by ThemeContext

### Animations

- Custom Tailwind animations: `animate-fade-in`, `animate-slide-in`, `animate-scale-in`, `animate-pulse-soft`
- Framer Motion installed for advanced animations
- Additional animations in `src/animations.css`

## PWA Implementation

The app is configured as a Progressive Web App:

- **Manifest**: `/public/manifest.json` defines app metadata and icons
- **Service Worker**: `/public/sw.js` handles offline caching and updates
- **Registration**: Service Worker registered in `src/main.jsx`
- **Icons**: Multiple sizes in `/public/icons/` directory
- **Install Prompt**: Code in place for custom install UI (deferredPrompt)

The service worker checks for updates every 60 seconds when the app is running.

## Environment Configuration

Create `.env` file (use `.env.example` as template):

```bash
VITE_DATA_MODE=mock                    # 'mock' or 'api'
VITE_API_URL=http://localhost:3001/api # API base URL (when using API mode)
```

**Future**: Google Calendar integration variables are documented but not yet implemented.

## Type System

The app uses TypeScript for type safety (see `src/types/index.ts`):

- **TypeScript interfaces** for all data models (Notice, Task, ShoppingItem, Expense, FutureItem, User)
- **TypeScript enums** for categories, priorities, payment methods, and module IDs
- **Centralized types** in `src/types/index.ts` - import using `@/types`
- **Legacy JSDoc** in `src/models/types.js` (deprecated, use `src/types/index.ts` instead)

### Available Types

```typescript
// Enums
(ExpenseCategory,
  ShoppingCategory,
  Priority,
  ModuleId,
  PaymentMethod,
  PaymentStatus,
  FutureItemStatus);

// Interfaces
(Notice,
  Task,
  ShoppingItem,
  ShoppingList,
  Expense,
  FutureItem,
  User,
  Installment,
  Payment);

// Type Aliases
(ISODate, Currency);
```

## API Integration (Future)

The codebase is prepared for REST API integration:

**Expected Endpoints** (see `src/services/api/config.js`):

- `GET/POST /api/notices` - Notice board management
- `GET/POST/PUT/PATCH/DELETE /api/tasks` - Task CRUD + toggle completion
- `GET/POST/DELETE /api/shopping` - Shopping list operations
- `GET/POST/DELETE /api/expenses` - Financial expense tracking
- `GET/POST/DELETE /api/future-items` - Future purchases planning

**CORS Note**: Backend must enable CORS with origin `http://localhost:3000` and appropriate methods.

## Key Architecture Decisions

### Why AppContext Instead of Props?

The app evolved from a prop-drilling architecture to AppContext for several reasons:

1. **Simplified component signatures**: Components no longer need to pass callbacks down multiple levels
2. **Easier refactoring**: Adding new actions doesn't require updating all intermediate components
3. **Better separation of concerns**: Components focus on UI, AppContext handles data orchestration
4. **Consistent state updates**: Single point of truth for all state mutations
5. **Performance**: Memoized context value prevents unnecessary re-renders

### Why React Router Routes Instead of State-Based Tabs?

The app migrated from state-based module switching to proper React Router routes:

1. **Deep linking**: Users can bookmark specific modules (e.g., `/tasks`, `/shopping`)
2. **Browser history**: Back/forward buttons work as expected
3. **Code splitting**: Lazy loading reduces initial bundle size
4. **Better UX**: URL reflects current view, easier to share specific sections
5. **SEO-ready**: Proper routing structure for future SSR/SSG implementation

### Why shadcn/ui Components?

The app uses shadcn/ui instead of custom components where possible:

1. **Accessibility**: Built on Radix UI primitives with WCAG compliance
2. **Customizable**: Components are copied to your codebase, not imported from a package
3. **TypeScript-first**: Full type safety out of the box
4. **Consistent design**: Pre-built components follow best practices
5. **No lock-in**: You own the code and can modify as needed

## Recent Architectural Changes

The application has undergone significant refactoring from its original implementation:

### Changes from Previous Architecture

**Before** (State-based navigation):
- Module switching via `currentModule` state in App.jsx
- Tab-based navigation with `Navigation.tsx`
- Props drilling for data and callbacks
- No lazy loading, all modules loaded upfront

**After** (Route-based navigation):
- Proper React Router routes (`/dashboard`, `/tasks`, etc.)
- Sidebar navigation with `AppSidebar.tsx`
- AppContext with `useApp()` hook for state management
- Lazy loading with `React.lazy()` and `<Suspense>`
- Better performance and UX

### Deprecated Patterns

❌ **Don't use these patterns** (from old architecture):
```javascript
// Old: Props drilling
function App() {
  const [tasks, setTasks] = useState([]);
  return <Tasks tasks={tasks} onAddTask={setTasks} />;
}

// Old: State-based module switching
const [currentModule, setCurrentModule] = useState('dashboard');

// Old: Direct service imports in components
import * as taskService from '@/services/taskService';
```

✅ **Use these patterns instead** (current architecture):
```javascript
// New: AppContext hook
function Tasks() {
  const { tasks, addTask } = useApp();
}

// New: Route-based navigation
<Route path="tasks" element={<Tasks />} />

// New: Services only in AppContext
// Components should NEVER import services directly
```

## Code Conventions

### General

- Portuguese language for UI text, comments, and variable names
- Functional components with hooks (no class components)
- Props destructuring in component parameters
- Named exports for services, default exports for components
- Async/await for asynchronous operations
- Use `useApp()` hook instead of props for accessing global state

### TypeScript

- **TypeScript files**: Use `.ts` for utilities/services, `.tsx` for React components
- **Type imports**: Import types from `@/types` (centralized)
- **Interface naming**: PascalCase without 'I' prefix (e.g., `Task`, not `ITask`)
- **Component props**: Define as interface (e.g., `interface ButtonProps`)
- **Type annotations**: Always add return types to functions
- **Strict mode**: TypeScript strict mode is enabled

### During Migration

- **Hybrid support**: Both `.js/.jsx` and `.ts/.tsx` files are supported
- **New code**: Write all new code in TypeScript
- **Refactoring**: Convert to TypeScript when touching existing files
- **Imports**: TypeScript files can import JavaScript files seamlessly

## Browser Compatibility

- Modern browsers supporting ES6+ (Chrome, Firefox, Safari, Edge)
- Service Worker API for PWA features
- LocalStorage for theme persistence
- Vite build tool ensures broad compatibility

## Project Structure Quick Reference

```
src/
├── components/
│   ├── app-sidebar.tsx          # Main sidebar navigation (TS)
│   ├── common/                  # Reusable UI components (JS)
│   ├── modules/                 # Feature modules (JS)
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── ShoppingList.jsx
│   │   ├── Financial.jsx
│   │   ├── FutureItems.jsx
│   │   └── Calendar.jsx
│   ├── skeletons/              # Loading states (TS)
│   └── ui/                     # shadcn/ui components (TS)
├── contexts/
│   ├── AppContext.jsx          # Global state management
│   └── ThemeContext.jsx        # Theme (dark/light)
├── pages/
│   └── Login.tsx               # Login page
├── services/                   # Data layer (all JS)
│   ├── api/
│   │   └── config.js           # API configuration
│   ├── taskService.js
│   ├── shoppingService.js
│   ├── financialService.js
│   ├── futureItemsService.js
│   └── noticeService.js
├── types/
│   └── index.ts                # All TypeScript types
├── lib/
│   └── utils.ts                # Helper utilities
├── mocks/
│   └── data.js                 # Mock data
├── App.jsx                     # Main app + routing
└── main.tsx                    # Entry point
```

## Development Notes

1. **Theme Management**: Use `useTheme()` hook from ThemeContext, never manipulate DOM classes directly
2. **State Management**: Use `useApp()` hook from AppContext to access state and actions, never import services directly in components
3. **Adding New Services**: Follow existing service patterns with DATA_MODE check
4. **Color Usage**: Use Tailwind theme colors, avoid hardcoded values
5. **Component Reuse**: Check `components/common/` and `components/ui/` before creating new UI components
6. **Date Handling**: date-fns library available for date formatting and manipulation
7. **Navigation**: Use React Router's `useNavigate()` or `<Link>` for routing, never manipulate URL directly
8. **Lazy Loading**: Wrap lazy-loaded components in `<Suspense>` with appropriate fallback skeletons
9. **Sidebar**: Add new navigation items to `AppSidebar.tsx`, not inline in components
