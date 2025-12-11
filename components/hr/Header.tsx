
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { HomeIcon } from '../icons/HomeIcon';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarCollapsed: boolean;
    onLogout: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarCollapsed, onLogout, searchQuery, onSearchChange, onBack }) => {
  return (
    <header className="bg-purple-900 border-b border-purple-800 h-16 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-purple-200 hover:text-white mr-4">
          {isSidebarCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-purple-100 hover:text-white mr-4">
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
        </button>
        <div className="flex items-center text-sm">
            <span className="font-semibold text-white text-lg tracking-wide">MASERP</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-purple-300" />
            </div>
            <input 
                type="text" 
                placeholder="Search employees, users..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full bg-purple-800 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-purple-700"
            />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-sm font-medium text-purple-200 hover:text-white">Invite</button>
        <button className="text-purple-200 hover:text-white" aria-label="Settings">
            <SettingsIcon className="w-5 h-5" />
        </button>
        <button onClick={onLogout} className="text-purple-200 hover:text-red-300" aria-label="Logout">
            <LogoutIcon className="w-5 h-5" />
        </button>
        <div 
            className="h-8 w-8 rounded-full bg-purple-700 text-purple-200 flex items-center justify-center text-xs font-bold border border-purple-600"
            aria-label="User avatar placeholder"
        >
            U
        </div>
      </div>
    </header>
  );
};

export default Header;
