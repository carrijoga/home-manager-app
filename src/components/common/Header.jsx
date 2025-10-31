import React from 'react';
import Logo from './Logo';

/**
 * Componente de cabeçalho da aplicação Ninho
 */
const Header = ({ useLogo = true }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {useLogo ? (
          <Logo size="default" showText={true} />
        ) : (
          <h1 className="text-3xl font-bold text-ninho-500">🪺 Ninho</h1>
        )}
      </div>
    </header>
  );
};

export default Header;
