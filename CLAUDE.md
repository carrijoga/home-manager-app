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
- Navigation component (`src/components/Navigation.tsx`)
- Pages (`src/pages/Login.tsx`)
- Utilities (`src/lib/utils.ts`)
- Entry point (`src/main.tsx`)

### 🔄 Remaining in JavaScript

- Most React components (`.jsx` files in `components/modules/` and `components/common/`)
- Main App component (`src/App.jsx`)
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

The application uses **React Router v6** for navigation:

**Route Structure**:

```
/ (root)
├── /login → Login page (public)
└── /* → HomeLayout (main app)
    └── Module switching via state (Dashboard, Tasks, Shopping, etc.)
```

**Key Points**:

- `App.jsx` manages top-level routing with `<Routes>` and `<Route>`
- `/login` route renders the Login component (public access)
- All other routes (`/*`) render `HomeLayout` component
- **Module navigation** within HomeLayout uses **state-based switching**, not routes
- This hybrid approach allows a separate login page while keeping the existing module system

**Why Hybrid?**:

- Login has its own URL for deep linking and bookmarking
- Main app modules use state for faster transitions and simpler architecture
- No URL changes when switching between Dashboard, Tasks, Shopping, etc.
- Preserves existing module system without breaking changes

### Data Flow Architecture

The application uses a **service layer pattern** with dual-mode data access:

1. **Mock Mode** (default): Uses local data from `src/mocks/data.js`
2. **API Mode**: Ready for REST API integration (not yet implemented)

**Configuration**: Set `VITE_DATA_MODE` in `.env` to switch between 'mock' and 'api'

### State Management

- **Global State**: Managed in `HomeLayout` (inside `App.jsx`) using React useState hooks
- **Context**: `ThemeContext` for dark/light theme management
- All data flows down from HomeLayout to module components via props
- Callbacks flow up from modules to HomeLayout for state updates

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

### Module System

The app uses a **hybrid routing system**:

**Top-Level Routes** (React Router):

- `/login` - Login page with Google OAuth UI
- `/*` - Main application (HomeLayout)

**Module Switching** (State-based, inside HomeLayout):

- **ModuleIds** enum defines all available modules (Dashboard, Tasks, Shopping, Financial, Future, Calendar)
- `HomeLayout` component (inside `App.jsx`) manages the current module state
- `Navigation.tsx` renders tabs and handles module switching via `setCurrentModule`
- Each module is a self-contained feature component in `components/modules/`
- Modules switch instantly without URL changes (better UX, preserves state)

**Navigation Flow**:

```
User clicks tab → Navigation calls onModuleChange(moduleId)
→ HomeLayout updates currentModule state
→ renderCurrentModule() displays new module
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

- `components/common/` - Reusable UI components (Button, Card, Input, Header, Logo, etc.)
- `components/ui/` - shadcn/ui components (button, card, dialog, select, spinner, etc.)
- `components/modules/` - Feature modules (Dashboard, Tasks, ShoppingList, Financial, FutureItems, Calendar)
- `components/Navigation.tsx` - Tab-based navigation for module switching
- `components/skeletons/` - Loading skeletons for async data
- `pages/` - Standalone pages with their own routes (Login, etc.)
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

## Known Issues & Planned Improvements

See `FIX.md` for comprehensive list of planned enhancements:

- **Critical**: Many cards use hardcoded white backgrounds instead of theme colors
- **Planned**: Integration with shadcn/ui component library
- **Planned**: Enhanced date picker with default behavior (current date)
- **Planned**: Redesigned navigation bar with user profile and notifications
- **Planned**: Monthly shopping lists (currently single list)
- **Planned**: Payment status tracking in Financial module
- **Planned**: Edit functionality for expenses and future items
- **Planned**: Post-it style design for notice board

## Code Conventions

### General

- Portuguese language for UI text, comments, and variable names
- Functional components with hooks (no class components)
- Props destructuring in component parameters
- Named exports for services, default exports for components
- Async/await for asynchronous operations

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

## Development Notes

1. **Theme Management**: Use `useTheme()` hook from ThemeContext, never manipulate DOM classes directly
2. **Adding New Services**: Follow existing service patterns with DATA_MODE check
3. **Color Usage**: Use Tailwind theme colors, avoid hardcoded values
4. **Component Reuse**: Check `components/common/` before creating new UI components
5. **State Updates**: Always use provided callbacks from App.jsx, never mutate props
6. **Date Handling**: date-fns library available for date formatting and manipulation
