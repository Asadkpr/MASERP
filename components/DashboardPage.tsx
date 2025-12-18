
import React from 'react';
import type { Module } from '../types';
import { MasbotLogo } from './icons/MasbotLogo';
import { HrIcon } from './icons/HrIcon';
import { SupplyChainIcon } from './icons/SupplyChainIcon';
import { FinanceIcon } from './icons/FinanceIcon';
import { StudentIcon } from './icons/StudentIcon';
import { WebsiteIcon } from './icons/WebsiteIcon';
import { TaskIcon } from './icons/TaskIcon';
import ModuleCard from './ModuleCard';
import { LogoutIcon } from './icons/LogoutIcon';

interface DashboardPageProps {
  onModuleSelect: (moduleId: string) => void;
  onLogout: () => void;
  accessibleModules?: string[];
}


export const modules: Module[] = [
  {
    id: 'hr',
    icon: <HrIcon className="w-12 h-12" />,
    title: 'HR Module',
    description: 'Attendance, Shifts, CCTV snapshots, Employee management',
  },
  {
    id: 'inventory_management',
    icon: <SupplyChainIcon className="w-12 h-12" />,
    title: 'Inventory Management',
    description: 'Manage assets, labs, printers, and consumables.',
  },
  {
    id: 'supply_chain',
    icon: <SupplyChainIcon className="w-12 h-12" />,
    title: 'Supply Chain Module',
    description: 'Manage procurement, logistics, and supplier relations.',
  },
  {
    id: 'task_manager',
    icon: <TaskIcon className="w-12 h-12" />,
    title: 'Task Manager',
    description: 'Assign, track, and complete tasks with automated workflows.',
  },
  {
    id: 'finance',
    icon: <FinanceIcon className="w-12 h-12" />,
    title: 'Finance Module',
    description: 'Budgeting, Payments, Receipts, WhatsApp receipts',
  },
  {
    id: 'student',
    icon: <StudentIcon className="w-12 h-12" />,
    title: 'Student Module',
    description: 'Applicants, Student Portal, Attendance, Course delivery',
  },
  {
    id: 'website',
    icon: <WebsiteIcon className="w-12 h-12" />,
    title: 'Website & Portals',
    description: 'Applicant Portal, Student Portal, Teacher/Admin Dashboards',
  },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ onModuleSelect, onLogout, accessibleModules }) => {
  const displayedModules = accessibleModules
    ? modules.filter(m => accessibleModules.includes(m.id))
    : modules;

  return (
    <div className="relative w-full max-w-6xl mx-auto p-4 sm:p-8">
      <header className="text-center mb-10 flex flex-col items-center">
        <MasbotLogo className="h-20 w-auto mb-6" />
        <p className="text-blue-900 text-lg">Select a module to continue</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedModules.length > 0 ? (
          displayedModules.map((module) => (
            <ModuleCard key={module.id} module={module} onSelect={() => onModuleSelect(module.id)} />
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blue-900">No Modules Assigned</h2>
            <p className="text-blue-900 mt-2">You have not been assigned any modules. Please contact an administrator.</p>
          </div>
        )}
      </main>
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-white text-purple-900 px-4 py-2 rounded-lg shadow-md hover:bg-purple-50 transition-colors border border-purple-200"
          aria-label="Logout"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
