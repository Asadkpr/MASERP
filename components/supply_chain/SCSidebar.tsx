
import React, { useState } from 'react';
import { supplyChainPages } from '../moduleNavigation';
import { MasbotLogo } from '../icons/MasbotLogo';

interface SCSidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    currentUserEmail: string;
}

const SCSidebar: React.FC<SCSidebarProps> = ({ activePage, setActivePage, currentUserEmail }) => {
    const isAdmin = currentUserEmail === 'admin';
    
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
            <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
                <MasbotLogo className="h-8 w-auto" />
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-4 px-2">
                    Supply Chain
                </div>
                {supplyChainPages.map(page => {
                    if (page.id === 'sc_approvals' && !isAdmin) return null; // Only CEO
                    
                    const Icon = page.icon;
                    const isActive = activePage === page.id;
                    return (
                        <button
                            key={page.id}
                            onClick={() => setActivePage(page.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                isActive 
                                ? 'bg-purple-50 text-purple-900' 
                                : 'text-blue-900 hover:bg-purple-50'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-purple-900' : 'text-purple-400'}`} />
                            <span>{page.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900 font-bold text-xs">
                        {currentUserEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-blue-900 truncate">{currentUserEmail}</p>
                        <p className="text-xs text-blue-800 truncate">{isAdmin ? 'CEO / Admin' : 'User'}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SCSidebar;
