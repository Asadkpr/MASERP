
import React, { useState, useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import type { Employee, LeaveRequest } from '../../types';
import { hrMainLinks, hrModuleLinks } from '../moduleNavigation';

interface HrDashboardProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onLeaveRequestAction: (requestId: string, action: 'Approve' | 'Reject') => void;
  onNavigate: (page: string) => void;
}

const HrDashboard: React.FC<HrDashboardProps> = ({ employees, leaveRequests, onLeaveRequestAction, onNavigate }) => {
  const [quickLinks, setQuickLinks] = useState<string[]>([]);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Initialize quick links from local storage or default
  useEffect(() => {
    const savedLinks = localStorage.getItem('hrQuickAccess');
    if (savedLinks) {
        setQuickLinks(JSON.parse(savedLinks));
    } else {
        // Default shortcuts
        setQuickLinks(['employees', 'attendance', 'leaves', 'payroll']);
    }
  }, []);

  const totalEmployees = employees.length;
  const presentToday = totalEmployees > 0 ? Math.floor(totalEmployees * (0.85 + Math.random() * 0.1)) : 0;

  const stats = [
    { 
      title: 'Present Employees', 
      value: presentToday.toString(), 
      percentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0, 
      color: 'text-green-500' 
    },
    { 
      title: 'Total Employees', 
      value: totalEmployees.toString(), 
      percentage: 100, 
      color: 'text-blue-900' 
    },
  ];

  // Filter for Pending Approvals (Pending HR)
  const pendingApprovals = useMemo(() => {
      return leaveRequests.filter(req => req.status === 'Pending HR');
  }, [leaveRequests]);

  const getEmployeeName = (id: string) => {
      const emp = employees.find(e => e.id === id);
      return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';
  };

  const allAvailableLinks = [...hrMainLinks, ...hrModuleLinks].filter(l => l.id !== 'dashboard');

  const toggleQuickLink = (id: string) => {
      setQuickLinks(prev => {
          let newLinks;
          if (prev.includes(id)) {
              newLinks = prev.filter(linkId => linkId !== id);
          } else {
              newLinks = [...prev, id];
          }
          localStorage.setItem('hrQuickAccess', JSON.stringify(newLinks));
          return newLinks;
      });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-900">HR Dashboard</h1>
        <p className="text-blue-900 mt-1">Overview of personnel, attendance, and pending actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* RECENT ACTIVITY / PENDING APPROVALS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-blue-900 text-lg">Pending Approvals</h2>
            <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {pendingApprovals.length} Pending
            </span>
          </div>
          
          {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                  {pendingApprovals.slice(0, 5).map(req => (
                      <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="mb-3 sm:mb-0">
                              <p className="font-semibold text-blue-900">{getEmployeeName(req.employeeId)}</p>
                              <p className="text-sm text-blue-900">
                                  <span className="font-medium text-blue-900">{req.leaveType}</span> • {req.fromDate} to {req.toDate}
                              </p>
                              <p className="text-xs text-blue-900 mt-1 italic">"{req.reason}"</p>
                          </div>
                          <div className="flex space-x-2">
                              <button 
                                onClick={() => onLeaveRequestAction(req.id, 'Approve')}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                              >
                                  Approve
                              </button>
                              <button 
                                onClick={() => onLeaveRequestAction(req.id, 'Reject')}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors border border-red-200"
                              >
                                  Reject
                              </button>
                          </div>
                      </div>
                  ))}
                  {pendingApprovals.length > 5 && (
                      <button onClick={() => onNavigate('leaves')} className="w-full text-center text-sm text-blue-900 hover:underline py-2">
                          View all {pendingApprovals.length} requests
                      </button>
                  )}
              </div>
          ) : (
              <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                  </div>
                  <p className="text-blue-900 font-medium">All caught up!</p>
                  <p className="text-blue-900 text-sm">No pending leave requests.</p>
              </div>
          )}
        </div>

        {/* CREATE SHORTCUTS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-blue-900 text-lg">Create Shortcuts</h2>
                <button 
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="text-blue-900 hover:text-blue-800 text-xs font-medium hover:underline"
                >
                    Customize
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {quickLinks.map(linkId => {
                    const linkDef = allAvailableLinks.find(l => l.id === linkId);
                    if (!linkDef) return null;
                    const Icon = linkDef.icon;
                    return (
                        <button
                            key={linkId}
                            onClick={() => onNavigate(linkId)}
                            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                        >
                            <Icon className="w-6 h-6 text-blue-900 group-hover:text-blue-900 mb-2" />
                            <span className="text-xs font-medium text-blue-900 group-hover:text-blue-900 text-center line-clamp-1">{linkDef.label}</span>
                        </button>
                    );
                })}
                <button 
                    onClick={() => setIsCustomizeModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-blue-900 hover:text-blue-900"
                >
                    <span className="text-2xl leading-none mb-1">+</span>
                    <span className="text-xs font-medium">Add</span>
                </button>
            </div>
        </div>
      </div>

      {/* CUSTOMIZE SHORTCUTS MODAL */}
      {isCustomizeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsCustomizeModalOpen(false)}>
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-blue-100">
                      <h3 className="font-bold text-lg text-blue-900">Create Shortcuts</h3>
                      <p className="text-sm text-blue-900">Select shortcuts to pin to your dashboard.</p>
                  </div>
                  <div className="p-5 max-h-[60vh] overflow-y-auto grid grid-cols-1 gap-2">
                      {allAvailableLinks.map(link => {
                          const isSelected = quickLinks.includes(link.id);
                          const Icon = link.icon;
                          return (
                              <label key={link.id} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-blue-200 hover:bg-blue-50'}`}>
                                  <input 
                                    type="checkbox" 
                                    className="form-checkbox h-5 w-5 text-blue-900 rounded focus:ring-blue-900 border-blue-300"
                                    checked={isSelected}
                                    onChange={() => toggleQuickLink(link.id)}
                                  />
                                  <div className="ml-3 flex items-center">
                                      <Icon className={`w-5 h-5 text-blue-900`} />
                                      <span className={`ml-3 text-sm font-medium text-blue-900`}>{link.label}</span>
                                  </div>
                              </label>
                          );
                      })}
                  </div>
                  <div className="p-5 border-t border-blue-100 flex justify-end">
                      <button 
                        onClick={() => setIsCustomizeModalOpen(false)}
                        className="px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-medium hover:bg-blue-800"
                      >
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HrDashboard;
