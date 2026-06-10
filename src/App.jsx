import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AppSidebar } from './components/app-sidebar';
import { FadeIn } from './components/common/FadeIn';
import RequireAuth from './components/common/RequireAuth';
import { SplashScreen } from './components/common/SplashScreen';
import { TopNavbar } from './components/common/TopNavbar';
import { DashboardSkeleton, FinancialSkeleton, ShoppingListSkeleton, TaskListSkeleton } from './components/skeletons';
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoadingProvider, useAppReady } from './contexts/LoadingContext';
import { useTheme } from './contexts/ThemeContext';

// Lazy loading dos módulos para code splitting
const DashboardModule = lazy(() => import('./components/modules/Dashboard'));
const TasksModule = lazy(() => import('./components/modules/Tasks'));
const ShoppingListModule = lazy(() => import('./components/modules/ShoppingList'));
const FinancialModule = lazy(() => import('./components/modules/Financial'));
const CalendarModule = lazy(() => import('./components/modules/Calendar'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const InviteAccept = lazy(() => import('./pages/InviteAccept'));

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

const FinancialGoals = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Metas</h1>
  </div>
);

const FinancialRecurrences = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Recorrências</h1>
  </div>
);

const FinancialAccount = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Conta</h1>
  </div>
);

const FinancialCard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Cartão</h1>
  </div>
);

const Calendar = () => {
  return <CalendarModule />;
};

const AppShell = ({ children }) => {
  const appReady = useAppReady();
  return (
    <>
      <AnimatePresence>
        {!appReady && <SplashScreen key="splash" />}
      </AnimatePresence>
      {children}
    </>
  );
};

/**
 * Componente principal da aplicação Home Manager
 * Gerencia o roteamento e a lógica principal da aplicação
 */
const App = () => {
  return (
    <AppProvider>
      <LoadingProvider>
        <AppShell>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Login />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Register />
              </Suspense>
            } />
            <Route path="/auth/google/callback" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <GoogleCallback />
              </Suspense>
            } />

            {/* Rota privada sem layout — aceite de convite */}
            <Route path="/invite" element={
              <RequireAuth>
                <Suspense fallback={<DashboardSkeleton />}>
                  <InviteAccept />
                </Suspense>
              </RequireAuth>
            } />

            {/* Rotas privadas com layout compartilhado */}
            <Route path="/" element={<RequireAuth><HomeLayout /></RequireAuth>}>
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
                <Suspense fallback={<FinancialSkeleton />}>
                  <FadeIn><Financial /></FadeIn>
                </Suspense>
              } />
              <Route path="financial/goals" element={
                <FadeIn><FinancialGoals /></FadeIn>
              } />
              <Route path="financial/recurrences" element={
                <FadeIn><FinancialRecurrences /></FadeIn>
              } />
              <Route path="financial/account" element={
                <FadeIn><FinancialAccount /></FadeIn>
              } />
              <Route path="financial/card" element={
                <FadeIn><FinancialCard /></FadeIn>
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
        </AppShell>
      </LoadingProvider>
    </AppProvider>
  );
};

/**
 * Layout principal para as páginas autenticadas
 */
const HomeLayout = () => {
  // Tema (necessário manter o ThemeContext ativo)
  useTheme();

  // User do contexto
  const { user } = useApp();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="overflow-x-hidden">
        <TopNavbar />
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="flex-1 max-w-full">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default App;
