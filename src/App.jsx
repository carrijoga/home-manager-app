import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AppSidebar } from './components/app-sidebar';
import { FadeIn } from './components/common/FadeIn';
import { DashboardSkeleton, ExpenseListSkeleton, ShoppingListSkeleton, TaskListSkeleton } from './components/skeletons';
import { Separator } from './components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import { AppProvider } from './contexts/AppContext';
import { useTheme } from './contexts/ThemeContext';

// Lazy loading dos módulos para code splitting
const DashboardModule = lazy(() => import('./components/modules/Dashboard'));
const TasksModule = lazy(() => import('./components/modules/Tasks'));
const ShoppingListModule = lazy(() => import('./components/modules/ShoppingList'));
const FinancialModule = lazy(() => import('./components/modules/Financial'));
const FutureItemsModule = lazy(() => import('./components/modules/FutureItems'));
const CalendarModule = lazy(() => import('./components/modules/Calendar'));
const Login = lazy(() => import('./pages/Login'));

// Componentes wrapper que conectam o context aos módulos
const Dashboard = () => {
  return <DashboardModule />;
};

const Tasks = () => {
  return <TasksModule />;
};

const ShoppingList = () => {
  return <ShoppingListModule />;
};

const Financial = () => {
  return <FinancialModule />;
};

const FutureItems = () => {
  return <FutureItemsModule />;
};

const Calendar = () => {
  return <CalendarModule />;
};

/**
 * Componente principal da aplicação Home Manager
 * Gerencia o roteamento e a lógica principal da aplicação
 */
const App = () => {
  return (
    <AppProvider>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <Login />
          </Suspense>
        } />

        {/* Rotas privadas com layout compartilhado */}
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <FadeIn><Dashboard /></FadeIn>
            </Suspense>
          } />
          <Route path="tasks" element={
            <Suspense fallback={<TaskListSkeleton />}>
              <FadeIn><Tasks /></FadeIn>
            </Suspense>
          } />
          <Route path="shopping" element={
            <Suspense fallback={<ShoppingListSkeleton />}>
              <FadeIn><ShoppingList /></FadeIn>
            </Suspense>
          } />
          <Route path="financial" element={
            <Suspense fallback={<ExpenseListSkeleton />}>
              <FadeIn><Financial /></FadeIn>
            </Suspense>
          } />
          <Route path="future" element={
            <Suspense fallback={<ExpenseListSkeleton />}>
              <FadeIn><FutureItems /></FadeIn>
            </Suspense>
          } />
          <Route path="calendar" element={
            <Suspense fallback={<DashboardSkeleton />}>
              <FadeIn><Calendar /></FadeIn>
            </Suspense>
          } />
        </Route>

        {/* Fallback para rotas não encontradas */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </AppProvider>
  );
};

/**
 * Layout principal para as páginas autenticadas
 */
const HomeLayout = () => {
  // Tema (necessário manter o ThemeContext ativo)
  const { theme } = useTheme();
  
  // Location para título dinâmico
  const location = useLocation();

  // Mapa de títulos por rota
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Tarefas',
    '/shopping': 'Lista de Compras',
    '/financial': 'Financeiro',
    '/future': 'Compras Futuras',
    '/calendar': 'Calendário',
  };

  const pageTitle = pageTitles[location.pathname] || 'Ninho';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-x-hidden">
          <div className="flex-1 max-w-full">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default App;
