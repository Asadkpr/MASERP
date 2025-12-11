
import React from 'react';
import { MasbotLogo } from './icons/MasbotLogo';
import { inventoryPages, inventorySubPagesForAccess } from './moduleNavigation';
import type { InventoryPage, ModulePermissions, Employee } from '../types';

interface SidebarProps {
  currentPage: InventoryPage | null;
  onNavigate: (page: InventoryPage) => void;
  permissions?: ModulePermissions;
  currentUserEmail: string;
  employees: Employee[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, permissions, currentUserEmail, employees }) => {
  const isAdmin = currentUserEmail === 'admin';
  
  const inventorySubPageIds = inventorySubPagesForAccess.map(p => p.id);

  const visibleNavItems = isAdmin 
    ? inventoryPages 
    : inventoryPages.filter(link => {
        if (link.id === 'assets') {
          // Show 'Inventory' link if user has view access to any of its sub-pages
          return inventorySubPageIds.some(subPageId => permissions?.[subPageId]?.view);
        }
        return permissions?.[link.id]?.view;
      });

  const currentUserEmployee = employees.find(emp => emp.email === currentUserEmail);
  const displayName = isAdmin
    ? 'Administrator'
    : currentUserEmployee
      ? `${currentUserEmployee.firstName} ${currentUserEmployee.lastName}`
      : currentUserEmail;
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-gray-700 flex-shrink-0 px-4">
        <MasbotLogo className="w-full h-10" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as InventoryPage)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  currentPage === item.id
                    ? 'bg-purple-50 text-purple-900 font-bold border-r-4 border-purple-900'
                    : 'text-blue-900 dark:text-blue-300 hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 ${currentPage === item.id ? 'text-purple-900' : 'text-purple-800'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold text-purple-900 dark:text-purple-300">
            {displayInitial}
          </div>
          <div>
            <p className="font-semibold text-sm text-blue-900 dark:text-white" title={displayName}>{displayName}</p>
            <p className="text-xs text-blue-800 dark:text-gray-400" title={currentUserEmail}>{currentUserEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
