
import React from 'react';
import type { Employee } from '../types';
import { modules } from './DashboardPage';
import ModuleCard from './ModuleCard';
import { LogoutIcon } from './icons/LogoutIcon';
import { MasbotLogo } from './icons/MasbotLogo';

interface EmployeeDashboardProps {
    employee: Employee;
    onModuleSelect: (moduleId: string) => void;
    onLogout: () => void;
    accessibleModules: string[];
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ employee, onModuleSelect, onLogout, accessibleModules }) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Filter modules based on permissions
    const myModules = modules.filter(m => accessibleModules.includes(m.id));

    // Calculate Leave Balance for Display (Annual)
    // If Probation, force 0 balance for display
    const isProbation = employee.employmentType === 'Probation';
    const annualLeave = isProbation 
        ? { total: 0, used: 0 }
        : (employee.leaveBalance?.annual || { total: 14, used: 0 });
        
    const remainingLeaves = Math.max(0, annualLeave.total - annualLeave.used);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-purple-900 shadow-sm border-b border-purple-800 px-6 py-4 flex justify-between items-center">
                <MasbotLogo className="h-8 w-auto brightness-0 invert" />
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 text-purple-100 hover:text-white transition-colors text-sm font-medium"
                >
                    <LogoutIcon className="w-5 h-5" />
                    Logout
                </button>
            </header>

            <main className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8">
                
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold text-blue-900">Welcome back, {employee.firstName}</h1>
                    <p className="text-blue-900 mt-1">{today}</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-900 font-bold text-2xl">
                            {employee.firstName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-bold text-blue-900">{employee.firstName} {employee.lastName}</h2>
                            <p className="text-sm text-blue-900">{employee.designation}</p>
                            <p className="text-xs text-blue-800">{employee.department}</p>
                        </div>
                    </div>

                    {/* Shift Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-blue-900 mb-1">My Shift</h3>
                        <p className="text-lg font-semibold text-blue-900">{employee.shift || 'Standard (9-6)'}</p>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                    </div>

                    {/* Leave Balance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-medium text-blue-900 mb-1">Annual Leave Balance</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-blue-900">{remainingLeaves}</span>
                            <span className="text-sm text-blue-800">/ {annualLeave.total} days</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                            <div 
                                className="bg-purple-900 h-1.5 rounded-full" 
                                style={{ width: annualLeave.total > 0 ? `${(remainingLeaves / annualLeave.total) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* My Apps Section */}
                <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-6">My Applications</h2>
                    {myModules.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myModules.map((module) => (
                                <ModuleCard key={module.id} module={module} onSelect={() => onModuleSelect(module.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300">
                            <p className="text-blue-900">You do not have access to any modules yet.</p>
                            <p className="text-sm text-blue-800 mt-1">Contact HR or IT administrator for access.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default EmployeeDashboard;
