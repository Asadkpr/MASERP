
import React, { useState, useMemo } from 'react';
import type { Employee, LeaveRequest } from '../../types';
import LeaveApplicationForm from './LeaveApplicationForm';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface LeavesPageProps {
  currentUserEmail: string;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (request: Omit<LeaveRequest, 'id'>) => void;
  onLeaveRequestAction: (requestId: string, action: 'Approve' | 'Reject') => void;
}

const LeaveBalanceCard: React.FC<{ employee: Employee }> = ({ employee }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isProbation = employee.employmentType === 'Probation';
    
    const balance = isProbation ? {
        annual: { total: 0, used: 0 },
        sick: { total: 0, used: 0 },
        casual: { total: 0, used: 0 },
        maternity: { total: 0, used: 0 },
        paternity: { total: 0, used: 0 },
        alternateDayOff: { total: 0, used: 0 },
        others: { total: 0, used: 0 }
    } : {
        annual: employee.leaveBalance?.annual || { total: 14, used: 0 },
        sick: employee.leaveBalance?.sick || { total: 7, used: 0 },
        casual: employee.leaveBalance?.casual || { total: 6, used: 0 },
        maternity: employee.leaveBalance?.maternity || { total: 90, used: 0 },
        paternity: employee.leaveBalance?.paternity || { total: 7, used: 0 },
        alternateDayOff: employee.leaveBalance?.alternateDayOff || { total: 50, used: 0 },
        others: employee.leaveBalance?.others || { total: 0, used: 0 }
    };

    const calculatePercentage = (used: number, total: number) => {
        if (!total || total === 0) return 0;
        return Math.min(100, (used / total) * 100);
    };

    const StatRow = ({ label, data, colorClass }: { label: string, data: { total: number, used: number } | undefined, colorClass: string }) => {
        const safeData = data || { total: 0, used: 0 };
        const used = safeData.used || 0;
        const total = safeData.total || 0;

        return (
            <div className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1 font-medium text-blue-900">
                    <span>{label}</span>
                    <span>{used} / {total} Days Used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full ${colorClass}`} 
                        style={{ width: `${calculatePercentage(used, total)}%` }}
                    ></div>
                </div>
                <div className="text-xs text-right text-blue-900 mt-1">{Math.max(0, total - used)} Remaining</div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <span className="font-bold text-blue-900">My Leave Balance {isProbation && "(Probation - No Leaves Allocated)"}</span>
                <div className="flex items-center text-sm text-blue-900 font-medium">
                    {isOpen ? 'Hide Details' : 'Show Details'}
                    <ChevronDownIcon className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            
            {isOpen && (
                <div className="p-6 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <StatRow label="Annual Leave" data={balance.annual} colorClass="bg-blue-900" />
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <StatRow label="Sick Leave" data={balance.sick} colorClass="bg-purple-600" />
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <StatRow label="Casual Leave" data={balance.casual} colorClass="bg-indigo-600" />
                        </div>
                        <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                            <StatRow label="Maternity Leave" data={balance.maternity} colorClass="bg-pink-500" />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <StatRow label="Paternity Leave" data={balance.paternity} colorClass="bg-slate-600" />
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <StatRow label="Alternate Day Off" data={balance.alternateDayOff} colorClass="bg-purple-800" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LeavesPage: React.FC<LeavesPageProps> = ({ currentUserEmail, employees, leaveRequests, onAddLeaveRequest, onLeaveRequestAction }) => {
  const [isApplying, setIsApplying] = useState(false);
  
  const isAdmin = currentUserEmail === 'admin';
  const currentUserEmployee = employees.find(emp => emp.email === currentUserEmail);

  const actionableRequests = useMemo(() => {
    if (!currentUserEmployee && !isAdmin) return [];

    const userRole = isAdmin ? 'admin' : currentUserEmployee?.role;
    const userDepartment = currentUserEmployee?.department;

    return leaveRequests.filter(req => {
        const requestEmployee = employees.find(e => e.id === req.employeeId);
        if (!requestEmployee) return false;

        if (req.status === 'Pending HOD') {
            if (userRole === 'admin') return true;
            if (userRole === 'HOD' && requestEmployee.department === userDepartment) return true;
        }
        if (req.status === 'Pending HR') {
            if (userRole === 'admin' || userRole === 'HR') return true;
        }
        return false;
    });
  }, [leaveRequests, currentUserEmail, employees, isAdmin, currentUserEmployee]);

  const myRequests = currentUserEmployee 
    ? leaveRequests.filter(req => req.employeeId === currentUserEmployee.id).sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime())
    : [];

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';
  };

  const StatusBadge: React.FC<{ status: LeaveRequest['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    const statusClasses = {
      'Pending HOD': "bg-yellow-100 text-yellow-800",
      'Pending HR': "bg-orange-100 text-orange-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
  };
  
  if (isApplying && currentUserEmployee) {
    return (
      <LeaveApplicationForm 
        employee={currentUserEmployee}
        onApply={onAddLeaveRequest}
        onCancel={() => setIsApplying(false)}
      />
    );
  }

  const showApplyButton = currentUserEmployee?.role === 'Employee' && currentUserEmployee?.employmentType !== 'Probation';

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Leave Management</h1>
        {showApplyButton && (
            <button 
                onClick={() => setIsApplying(true)}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
                Apply for Leave
            </button>
        )}
      </div>

      {currentUserEmployee && <LeaveBalanceCard employee={currentUserEmployee} />}

      {actionableRequests.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Awaiting Your Approval</h2>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Dates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {actionableRequests.map(req => (
                    <tr key={req.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-900">{getEmployeeName(req.employeeId)}</td>
                      <td className="px-6 py-4 text-sm text-blue-900">{req.fromDate} to {req.toDate}</td>
                      <td className="px-6 py-4 text-sm text-blue-900">{req.leaveType}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                      <td className="px-6 py-4 text-sm"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button onClick={() => onLeaveRequestAction(req.id, 'Approve')} className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                        <button onClick={() => onLeaveRequestAction(req.id, 'Reject')} className="text-red-600 hover:text-red-900 font-medium">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}

      {myRequests.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">My Leave History</h2>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Reason</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {myRequests.map(req => (
                    <tr key={req.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-blue-900">{req.fromDate}</td>
                      <td className="px-6 py-4 text-sm text-blue-900">{req.toDate}</td>
                      <td className="px-6 py-4 text-sm text-blue-900">{req.leaveType}</td>
                      <td className="px-6 py-4 text-sm text-blue-900 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                      <td className="px-6 py-4 text-sm"><StatusBadge status={req.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesPage;
