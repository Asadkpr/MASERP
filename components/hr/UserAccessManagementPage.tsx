
import React, { useState, useEffect } from 'react';
import type { User, AllPermissions, ModulePermissions, PagePermissions, Employee } from '../../types';
import { modulePages } from '../moduleNavigation';
import CustomSelect from '../CustomSelect';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface UserAccessManagementPageProps {
  users: User[];
  employees: Employee[];
  allPermissions: AllPermissions;
  onUserPermissionsChange: (userEmail: string, newUserPermissions: { [moduleId: string]: ModulePermissions }) => void;
}

const modules = [
  { id: 'hr', name: 'HR Module' },
  { id: 'inventory_management', name: 'Inventory Management' },
  { id: 'supply_chain', name: 'Supply Chain Module' },
  { id: 'task_manager', name: 'Task Manager' },
  { id: 'finance', name: 'Finance Module' },
  { id: 'student', name: 'Student Module' },
  { id: 'website', name: 'Website & Portals' },
];

const permissionTypes: (keyof PagePermissions)[] = ['view', 'edit', 'delete', 'update'];

const UserAccessManagementPage: React.FC<UserAccessManagementPageProps> = ({ users, employees, allPermissions, onUserPermissionsChange }) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<{ [moduleId: string]: ModulePermissions } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const nonAdminUsers = users.filter(u => u.email !== 'admin');

  const userOptions = nonAdminUsers.map(user => {
    const employee = employees.find(emp => emp.email === user.email);
    const primaryText = employee ? `${employee.firstName} ${employee.lastName}` : user.email;
    const secondaryText = employee ? user.email : 'No employee record';
    return {
      value: user.email,
      primaryText,
      secondaryText,
    };
  });

  useEffect(() => {
    if (selectedUser) {
        setUserPermissions(allPermissions[selectedUser] || {});
        setExpandedModules(new Set());
    } else {
        setUserPermissions(null);
    }
  }, [selectedUser, allPermissions]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
        } else {
            delete newUserPermissions[moduleId];
            setExpandedModules(prevExpanded => {
                const newSet = new Set(prevExpanded);
                newSet.delete(moduleId);
                return newSet;
            });
        }
        return newUserPermissions;
    });
  };
  
  const handleToggleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
        const newSet = new Set(prev);
        if (newSet.has(moduleId)) {
            newSet.delete(moduleId);
        } else {
            newSet.add(moduleId);
        }
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
          [pageId]: {
            ...currentPage,
            [permissionType]: value,
          },
        },
      };
    });
  };

  const handleSavePermissions = () => {
    if (!selectedUser || userPermissions === null) return;
    onUserPermissionsChange(selectedUser, userPermissions);
    setMessage({ type: 'success', text: `Permissions for ${selectedUser} have been updated.` });
    setSelectedUser(null);
  }
  
  const handleCancel = () => {
    setSelectedUser(null);
    setUserPermissions(null);
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">User Access Management</h1>
      
      <div className="mb-6">
        <label htmlFor="select-user" className="block text-sm font-medium text-blue-900">Select a user to manage their module access</label>
        <CustomSelect
          options={userOptions}
          value={selectedUser}
          onChange={setSelectedUser}
          placeholder="-- Select a user --"
        />
      </div>

      {message && (
        <div className={`my-4 p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message.text}
        </div>
      )}

      {selectedUser && userPermissions !== null && (
        <div>
            <div className="space-y-4">
                {modules.map(module => {
                    const hasAccess = !!userPermissions[module.id];
                    const isExpanded = expandedModules.has(module.id);
                    const pagesForModule = modulePages[module.id] || [];

                    return (
                        <div key={module.id} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300">
                            <div className="flex items-center p-4 bg-slate-50">
                                <input
                                    type="checkbox"
                                    id={`module-access-${module.id}`}
                                    className="h-5 w-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                    checked={hasAccess}
                                    onChange={e => handleModuleAccessToggle(module.id, e.target.checked)}
                                />
                                <label htmlFor={`module-access-${module.id}`} className="ml-3 flex-1 text-lg font-semibold text-blue-900 cursor-pointer">{module.name}</label>
                                <button
                                    onClick={() => handleToggleExpand(module.id)}
                                    disabled={!hasAccess}
                                    className="p-1 text-blue-900 rounded-full hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    aria-expanded={isExpanded}
                                >
                                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            
                            {hasAccess && isExpanded && (
                                <div className="bg-white p-4 border-t border-slate-200">
                                    <h3 className="text-md font-semibold text-blue-900 mb-3">Page Permissions</h3>
                                    {pagesForModule.length > 0 ? (
                                        <table className="min-w-full divide-y divide-slate-200 border">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Feature</th>
                                                    {permissionTypes.map(type => (
                                                        <th key={type} scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-900 uppercase tracking-wider">{type}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {pagesForModule.map(link => (
                                                    <tr key={link.id} className="hover:bg-purple-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{link.label}</td>
                                                        {permissionTypes.map(type => (
                                                            <td key={type} className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                                                    checked={userPermissions[module.id]?.[link.id]?.[type] || false}
                                                                    onChange={(e) => handlePagePermissionChange(module.id, link.id, type, e.target.checked)}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-blue-900">No configurable pages for this module.</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-6 gap-3">
                 <button onClick={handleCancel} className="py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-blue-900 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
                    Cancel
                </button>
                <button onClick={handleSavePermissions} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    Save Permissions
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessManagementPage;
