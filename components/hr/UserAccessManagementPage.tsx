
import React, { useState, useEffect, useMemo } from 'react';
import type { User, AllPermissions, ModulePermissions, PagePermissions, Employee } from '../../types';
import { modulePages } from '../moduleNavigation';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { MasbotLogo } from '../icons/MasbotLogo';

interface UserAccessManagementPageProps {
  users: User[];
  employees: Employee[];
  allPermissions: AllPermissions;
  onUserPermissionsChange: (userEmail: string, newUserPermissions: { [moduleId: string]: ModulePermissions }) => void;
}

const modules = [
  { id: 'hr', name: 'HR Module', color: 'bg-purple-600', icon: '👥' },
  { id: 'inventory_management', name: 'Inventory Management', color: 'bg-blue-600', icon: '📦' },
  { id: 'supply_chain', name: 'Supply Chain', color: 'bg-green-600', icon: '🚚' },
  { id: 'task_manager', name: 'Task Manager', color: 'bg-indigo-600', icon: '✅' },
  { id: 'finance', name: 'Finance Module', color: 'bg-teal-600', icon: '💰' },
  { id: 'student', name: 'Student Module', color: 'bg-orange-600', icon: '🎓' },
  { id: 'website', name: 'Website & Portals', color: 'bg-pink-600', icon: '🌐' },
];

const permissionTypes: { id: keyof PagePermissions; label: string; icon: string }[] = [
  { id: 'view', label: 'View', icon: '👁️' },
  { id: 'edit', label: 'Edit', icon: '✏️' },
  { id: 'update', label: 'Update', icon: '🔄' },
  { id: 'delete', label: 'Delete', icon: '🗑️' },
];

const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void; label?: string; size?: 'sm' | 'md' }> = ({ checked, onChange, label, size = 'md' }) => (
    <label className="flex items-center cursor-pointer group">
        <div className="relative" onClick={(e) => { e.stopPropagation(); onChange(!checked); }}>
            {/* Track */}
            <div className={`block rounded-full transition-all duration-300 ${size === 'sm' ? 'w-11 h-6' : 'w-14 h-8'} ${checked ? 'bg-purple-600 shadow-inner' : 'bg-slate-300'}`}></div>
            {/* Slider knob */}
            <div className={`absolute left-1 top-1 bg-white rounded-full transition-transform duration-300 shadow-lg ${size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'} ${checked ? (size === 'sm' ? 'translate-x-5' : 'translate-x-6') : 'translate-x-0'}`}></div>
        </div>
        {label && <span className={`ml-3 text-xs font-black uppercase tracking-wider ${checked ? 'text-purple-700' : 'text-slate-400'}`}>{label}</span>}
    </label>
);

const UserAccessManagementPage: React.FC<UserAccessManagementPageProps> = ({ users, employees, allPermissions, onUserPermissionsChange }) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<{ [moduleId: string]: ModulePermissions } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const filteredUsersList = useMemo(() => {
    const nonAdminUsers = users.filter(u => u.email !== 'admin');
    if (!userSearchQuery) return nonAdminUsers;
    const q = userSearchQuery.toLowerCase();
    return nonAdminUsers.filter(u => {
        const emp = employees.find(e => e.email === u.email);
        return u.email.toLowerCase().includes(q) || 
               (emp && `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q));
    });
  }, [users, employees, userSearchQuery]);

  useEffect(() => {
    if (selectedUserEmail) {
        setUserPermissions(allPermissions[selectedUserEmail] || {});
        setExpandedModules(new Set());
    } else {
        setUserPermissions(null);
    }
  }, [selectedUserEmail, allPermissions]);

  const handleModuleAccessToggle = (moduleId: string, isEnabled: boolean) => {
    setUserPermissions(prev => {
        if (!prev) return null;
        const newUserPermissions = { ...prev };
        if (isEnabled) {
            const pagesForModule = modulePages[moduleId] || [];
            const defaultModulePermissions: ModulePermissions = {};
            pagesForModule.forEach(page => {
                defaultModulePermissions[page.id] = { view: false, edit: false, delete: false, update: false };
            });
            newUserPermissions[moduleId] = defaultModulePermissions;
            setExpandedModules(prev => new Set(prev).add(moduleId));
        } else {
            delete newUserPermissions[moduleId];
            setExpandedModules(prev => {
                const n = new Set(prev);
                n.delete(moduleId);
                return n;
            });
        }
        return newUserPermissions;
    });
  };
  
  const handleToggleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
        const newSet = new Set(prev);
        if (newSet.has(moduleId)) newSet.delete(moduleId);
        else newSet.add(moduleId);
        return newSet;
    });
  };

  const handlePagePermissionChange = (moduleId: string, pageId: string, permissionType: keyof PagePermissions, value: boolean) => {
    setUserPermissions(prev => {
      if (!prev) return null;
      const currentModule = prev[moduleId] || {};
      const currentPage = currentModule[pageId] || { view: false, edit: false, delete: false, update: false };
      return {
        ...prev,
        [moduleId]: {
          ...currentModule,
          [pageId]: { ...currentPage, [permissionType]: value },
        },
      };
    });
  };

  const handleSave = async () => {
    if (!selectedUserEmail || userPermissions === null) return;
    setSaveStatus('saving');
    onUserPermissionsChange(selectedUserEmail, userPermissions);
    setTimeout(() => {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const selectedUserInfo = useMemo(() => {
      if (!selectedUserEmail) return null;
      const emp = employees.find(e => e.email === selectedUserEmail);
      return {
          name: emp ? `${emp.firstName} ${emp.lastName}` : selectedUserEmail,
          email: selectedUserEmail,
          dept: emp?.department || 'System User',
          role: emp?.role || 'Staff',
          initials: (emp ? `${emp.firstName[0]}${emp.lastName[0]}` : selectedUserEmail[0]).toUpperCase()
      };
  }, [selectedUserEmail, employees]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-fade-in">
        {/* LEFT PANEL: User Selection */}
        <div className="lg:w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-black text-blue-900 uppercase tracking-widest text-[10px]">User Directory</h2>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-black">{filteredUsersList.length}</span>
                </div>
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search for a user..." 
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                        value={userSearchQuery}
                        onChange={e => setUserSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredUsersList.map(user => {
                    const emp = employees.find(e => e.email === user.email);
                    const isActive = selectedUserEmail === user.email;
                    return (
                        <button
                            key={user.email}
                            onClick={() => setSelectedUserEmail(user.email)}
                            className={`w-full flex items-center gap-3 p-4 text-left transition-all border-b border-slate-50 last:border-0 ${isActive ? 'bg-purple-50 border-r-4 border-r-purple-600' : 'hover:bg-slate-50'}`}
                        >
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform ${isActive ? 'bg-purple-600 text-white scale-105' : 'bg-blue-50 text-blue-900'}`}>
                                {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : user.email[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className={`text-sm font-black truncate ${isActive ? 'text-purple-900' : 'text-blue-900'}`}>
                                    {emp ? `${emp.firstName} ${emp.lastName}` : user.email}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-wider">
                                    {emp?.department || 'Operations'}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* RIGHT PANEL: Permissions Management */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {selectedUserInfo ? (
                <>
                    {/* User Header */}
                    <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg rotate-3">
                                {selectedUserInfo.initials}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-blue-900 leading-none">{selectedUserInfo.name}</h1>
                                <p className="text-sm text-slate-500 mt-1.5 font-bold">
                                    <span className="text-purple-600">{selectedUserInfo.role}</span> • <span>{selectedUserInfo.email}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setSelectedUserEmail(null)}
                                className="px-5 py-2.5 text-sm font-black text-slate-400 hover:text-blue-900 transition-colors uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                                className={`px-8 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95 flex items-center gap-3 ${
                                    saveStatus === 'success' ? 'bg-green-500 text-white' : 
                                    saveStatus === 'saving' ? 'bg-slate-400 text-white' : 
                                    'bg-purple-900 text-white hover:bg-purple-800'
                                }`}
                            >
                                {saveStatus === 'saving' && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                {saveStatus === 'success' ? 'ACCESS UPDATED' : saveStatus === 'saving' ? 'UPDATING...' : 'SAVE PERMISSIONS'}
                            </button>
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-1 w-10 bg-purple-600 rounded-full"></div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-[0.4em]">Module Security Matrix</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-5">
                                {modules.map(module => {
                                    const hasAccess = !!userPermissions?.[module.id];
                                    const isExpanded = expandedModules.has(module.id);
                                    const pages = modulePages[module.id] || [];
                                    const activePermissionsCount = hasAccess && userPermissions && userPermissions[module.id]
                                        ? Object.values(userPermissions[module.id]).reduce((acc: number, p: any) => acc + (p?.view ? 1 : 0), 0)
                                        : 0;

                                    return (
                                        <div key={module.id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${hasAccess ? 'border-purple-200 shadow-xl ring-4 ring-purple-50/50' : 'border-slate-200 opacity-80'}`}>
                                            <div className={`p-6 flex items-center justify-between transition-colors ${hasAccess ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                <div className="flex items-center gap-5 flex-1">
                                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${hasAccess ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                        {module.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-lg font-black ${hasAccess ? 'text-blue-900' : 'text-slate-500'}`}>{module.name}</h4>
                                                        {hasAccess && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                                                <p className="text-[10px] text-purple-700 font-black uppercase tracking-widest">
                                                                    {activePermissionsCount} of {pages.length} components enabled
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-10">
                                                    <Toggle 
                                                        checked={hasAccess} 
                                                        onChange={(val) => handleModuleAccessToggle(module.id, val)}
                                                        label={hasAccess ? "Enabled" : "Disabled"}
                                                    />
                                                    
                                                    {hasAccess && (
                                                        <button 
                                                            onClick={() => handleToggleExpand(module.id)}
                                                            className={`p-3 rounded-2xl transition-all ${isExpanded ? 'bg-purple-100 text-purple-700 rotate-180 shadow-inner' : 'bg-slate-100 text-slate-400 hover:text-blue-900'}`}
                                                        >
                                                            <ChevronDownIcon className="h-6 w-6" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Granular Permissions Matrix */}
                                            {hasAccess && isExpanded && (
                                                <div className="bg-slate-50 p-6 border-t border-slate-100 animate-slide-down">
                                                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                        <table className="min-w-full text-left">
                                                            <thead>
                                                                <tr className="bg-blue-900 text-white">
                                                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em]">Application Component</th>
                                                                    {permissionTypes.map(type => (
                                                                        <th key={type.id} className="px-4 py-5 text-[11px] font-black uppercase tracking-widest text-center">
                                                                            <div className="flex flex-col items-center gap-1.5">
                                                                                <span className="text-base">{type.icon}</span>
                                                                                <span>{type.label}</span>
                                                                            </div>
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {pages.map(page => (
                                                                    <tr key={page.id} className="hover:bg-purple-50/50 transition-colors group">
                                                                        <td className="px-8 py-5">
                                                                            <p className="text-sm font-black text-blue-900 group-hover:text-purple-900">{page.label}</p>
                                                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-60">REF: {page.id}</p>
                                                                        </td>
                                                                        {permissionTypes.map(type => (
                                                                            <td key={type.id} className="px-4 py-5">
                                                                                <div className="flex justify-center transform scale-110">
                                                                                    <Toggle 
                                                                                        size="sm"
                                                                                        checked={(userPermissions && userPermissions[module.id] && userPermissions[module.id][page.id] && (userPermissions[module.id][page.id] as any)[type.id]) || false}
                                                                                        onChange={(val) => handlePagePermissionChange(module.id, page.id, type.id, val)}
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Toggle shifts are auto-saved to current draft session</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/20">
                    <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 animate-bounce-slow border border-slate-100">
                        <MasbotLogo className="h-16 w-auto opacity-20 grayscale" />
                    </div>
                    <h2 className="text-3xl font-black text-blue-900 mb-3 tracking-tight">Access Control Center</h2>
                    <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                        Please select a team member from the left directory to audit or adjust their application-wide access rights.
                    </p>
                </div>
            )}
        </div>
        <style>{`
            .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0, 1, 0.5, 1); }
            .animate-bounce-slow { animation: bounceSlow 4s infinite ease-in-out; }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes bounceSlow { 0%, 100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-15px) rotate(-2deg); } }
        `}</style>
    </div>
  );
};

export default UserAccessManagementPage;
