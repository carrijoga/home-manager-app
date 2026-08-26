import { useTheme } from '../../contexts/ThemeContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

/**
 * Componente de cabeçalho da aplicação Ninho
 */
const Header = ({ useLogo = true }) => {
  const { theme, isDark } = useTheme();

  return (
    <header className="border-b border-gray-100 bg-white shadow-md transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          {useLogo ? (
            <Logo size="default" showText={true} />
          ) : (
            <h1 className="text-3xl font-bold text-indigo-500 dark:text-indigo-400">🪺 Ninho</h1>
          )}
          {/* Debug info */}
          <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Theme: {theme} | isDark: {isDark ? 'true' : 'false'}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
