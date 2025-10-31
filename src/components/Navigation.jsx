import React from 'react';
import { Home, CheckSquare, ShoppingCart, DollarSign, Package, Calendar } from 'lucide-react';
import { ModuleIds } from '../models/types';

/**
 * Componente de navegação entre módulos
 */
const Navigation = ({ currentModule, onModuleChange }) => {
  const modules = [
    { id: ModuleIds.DASHBOARD, name: 'Dashboard', icon: Home },
    { id: ModuleIds.TASKS, name: 'Tarefas', icon: CheckSquare },
    { id: ModuleIds.SHOPPING, name: 'Lista de Compras', icon: ShoppingCart },
    { id: ModuleIds.FINANCIAL, name: 'Financeiro', icon: DollarSign },
    { id: ModuleIds.FUTURE, name: 'Compras Futuras', icon: Package },
    { id: ModuleIds.CALENDAR, name: 'Calendário', icon: Calendar }
  ];

  return (
    <nav className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-gray-100 dark:border-dark-border-default sticky top-0 z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 overflow-x-auto py-3 scrollbar-hide">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 stagger-item hover-lift ${
                  currentModule === module.id
                    ? 'bg-ninho-600 dark:bg-dark-accent-ninho text-white dark:text-dark-text-primary shadow-lg'
                    : 'bg-ninho-50 dark:bg-dark-bg-elevated text-ninho-700 dark:text-dark-text-secondary hover:bg-ninho-100 dark:hover:bg-dark-bg-hover'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon size={18} />
                <span className="text-sm sm:text-base">{module.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
