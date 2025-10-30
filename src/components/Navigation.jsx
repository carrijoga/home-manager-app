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
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-2 overflow-x-auto py-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  currentModule === module.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                <span>{module.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
