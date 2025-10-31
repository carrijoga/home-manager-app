import React from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

/**
 * Componente de cabeçalho da aplicação Ninho
 */
const Header = ({ useLogo = true }) => {
  return (
    <header className="bg-white dark:bg-ninho-900 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          {useLogo ? (
            <Logo size="default" showText={true} />
          ) : (
            <h1 className="text-3xl font-bold text-ninho-500 dark:text-aconchego-400">🪺 Ninho</h1>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
