import React from 'react';

/**
 * Componente de cabeçalho da aplicação Ninho
 */
const Header = ({ title = '🪺 Ninho' }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      </div>
    </header>
  );
};

export default Header;
