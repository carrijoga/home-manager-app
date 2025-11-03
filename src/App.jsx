import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { FadeIn } from './components/common/FadeIn';
import Navigation from './components/Navigation';
import { DashboardSkeleton, ExpenseListSkeleton, ShoppingListSkeleton, TaskListSkeleton } from './components/skeletons';
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
    </AppProvider>
  );
};

/**
 * Layout principal para as páginas autenticadas
 */
const HomeLayout = () => {
  // Tema
  const { theme, setTheme } = useTheme();
  
  // Location para passar para Navigation
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <Navigation
        currentPath={location.pathname}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default App;
