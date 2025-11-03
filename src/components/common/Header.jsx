import { useTheme } from '../../contexts/ThemeContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

/**
 * Componente de cabeçalho da aplicação Ninho
 */
const Header = ({ useLogo = true }) => {
  const { theme, isDark, effectiveTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md border-b border-gray-100 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {useLogo ? (
            <Logo size="default" showText={true} />
          ) : (
            <h1 className="text-3xl font-bold text-indigo-500 dark:text-indigo-400">🪺 Ninho</h1>
          )}
          {/* Debug info */}
          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
            Theme: {theme} | isDark: {isDark ? 'true' : 'false'}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
