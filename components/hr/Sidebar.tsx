
import React from 'react';
import type { PagePermissions, SidebarLink, Employee } from '../../types';
import { LogoutIcon } from '../icons/LogoutIcon';
import { hrMainLinks, hrModuleLinks } from '../moduleNavigation';
import { MasbotLogo } from '../icons/MasbotLogo';


interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isCollapsed: boolean;
  onLogout: () => void;
  permissions: { [pageId: string]: PagePermissions };
  currentUserEmail: string;
  employees: Employee[];
}

const NavLink: React.FC<{link: SidebarLink, activePage: string, setActivePage: (page:string) => void, isCollapsed: boolean}> = ({ link, activePage, setActivePage, isCollapsed }) => {
    const isActive = activePage === link.id;
    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                setActivePage(link.id);
            }}
            className={`flex items-center py-2.5 px-4 rounded-md transition-colors duration-200 ${
                isActive
                ? 'bg-purple-50 text-purple-900 font-bold border-r-4 border-purple-900'
                : 'text-blue-900 hover:bg-purple-50 hover:text-purple-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
        >
            <link.icon className={`h-5 w-5 ${isActive ? 'text-purple-900' : 'text-purple-400'}`} />
            {!isCollapsed && <span className="ml-3 text-sm">{link.label}</span>}
        </a>
    )
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isCollapsed, onLogout, permissions, currentUserEmail, employees }) => {
  const isAdmin = currentUserEmail === 'admin';
  
  const currentUserEmployee = employees.find(emp => emp.email === currentUserEmail);
  const displayName = isAdmin
    ? 'Administrator'
    : currentUserEmployee
      ? `${currentUserEmployee.firstName} ${currentUserEmployee.lastName}`
      : currentUserEmail;

  // Filter links: Admin sees all, regular users see based on permission.
  // Additionally, hide 'dashboard' link for Employees to prevent accessing stats.
  const visibleMainLinks = (isAdmin ? hrMainLinks : hrMainLinks.filter(link => permissions[link.id]?.view))
    .filter(link => {
        if (currentUserEmployee?.role === 'Employee' && link.id === 'dashboard') return false;
        return true;
    });

  const visibleHrModuleLinks = isAdmin ? hrModuleLinks : hrModuleLinks.filter(link => permissions[link.id]?.view);

  return (
    <aside className={`bg-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center border-b h-16 px-4 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
            {!isCollapsed ? (
                 <MasbotLogo className="h-8 w-auto" />
            ) : (
                <div className="bg-purple-900 text-white font-bold text-lg rounded-md p-2 w-9 h-9 flex items-center justify-center">
                    M
                </div>
            )}
        </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleMainLinks.map(link => <NavLink key={link.id} link={link} activePage={activePage} setActivePage={setActivePage} isCollapsed={isCollapsed} />)}
        
        {visibleHrModuleLinks.length > 0 && (
          <div className="pt-4">
              {!isCollapsed && <h3 className="px-4 text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">HR Module</h3>}
              <div className="space-y-2">
                  {visibleHrModuleLinks.map(link => <NavLink key={link.id} link={link} activePage={activePage} setActivePage={setActivePage} isCollapsed={isCollapsed} />)}
              </div>
          </div>
        )}

      </nav>

      <div className="mt-auto border-t border-slate-200">
        <div className="p-4">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                <div 
                    className="h-9 w-9 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-purple-900 font-bold" 
                    aria-label="User avatar placeholder"
                >
                    {displayName.charAt(0)}
                </div>
                {!isCollapsed && (
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-semibold text-blue-900 truncate" title={displayName}>{displayName}</p>
                    <p className="text-xs text-blue-800 truncate" title={currentUserEmail}>{currentUserEmail}</p>
                  </div>
                )}
            </div>
        </div>
        <div className="p-4 border-t border-slate-200">
            <button
                onClick={onLogout}
                className={`flex items-center w-full py-2.5 px-4 rounded-md transition-colors duration-200 text-blue-900 hover:bg-red-50 hover:text-red-600 ${isCollapsed ? 'justify-center' : ''}`}
            >
                <LogoutIcon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3 text-sm font-medium">Logout</span>}
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
