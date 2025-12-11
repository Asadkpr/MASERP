
import React, { useState, useMemo, useEffect } from 'react';
import type { Employee, LeaveRequest, LeaveBalance } from '../../types';

interface LeaveApplicationFormProps {
  employee: Employee;
  onApply: (request: Omit<LeaveRequest, 'id'>) => void;
  onCancel: () => void;
}

const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ employee, onApply, onCancel }) => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    leaveType: 'Casual Leave' as LeaveRequest['leaveType'],
    reason: '',
  });
  
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => setError(''), 5000);
        return () => clearTimeout(timer);
    }
  }, [error]);

  const totalLeaveDays = useMemo(() => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      if (to < from) {
        return 0;
      }
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  }, [formData.fromDate, formData.toDate]);

  // Helper to get current balance for selected type
  const currentBalanceInfo = useMemo(() => {
      const map: { [key: string]: keyof LeaveBalance } = {
          'Casual Leave': 'casual',
          'Sick Leave': 'sick',
          'Annual Leave': 'annual',
          'Maternity Leave': 'maternity',
          'Paternity Leave': 'paternity',
          'Alternate Day Off': 'alternateDayOff',
          'Others': 'others'
      };
      const key = map[formData.leaveType];
      // Default fallback if data is missing
      const balance = employee.leaveBalance?.[key] || { total: 0, used: 0 };
      return {
          total: balance.total,
          used: balance.used,
          remaining: Math.max(0, balance.total - balance.used)
      };
  }, [formData.leaveType, employee.leaveBalance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Field Validation
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
        setError('Please fill in all required fields.');
        return;
    }
     if (new Date(formData.toDate) < new Date(formData.fromDate)) {
        setError('"To Date" cannot be earlier than "From Date".');
        return;
    }

    // Balance Validation
    if (formData.leaveType !== 'Others') { // Typically 'Others' (unpaid) doesn't have a hard limit, or handle differently
        if (currentBalanceInfo.remaining <= 0) {
            setError(`Your ${formData.leaveType} quota is exhausted. Please select a different leave type.`);
            return;
        }
        if (totalLeaveDays > currentBalanceInfo.remaining) {
            setError(`Insufficient balance for ${formData.leaveType}. You have ${currentBalanceInfo.remaining} days remaining, but requested ${totalLeaveDays}.`);
            return;
        }
    }

    setError('');

    const newRequest: Omit<LeaveRequest, 'id'> = {
      employeeId: employee.id,
      ...formData,
      status: 'Pending HOD',
    };

    onApply(newRequest);
    onCancel(); // Return to the list view
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Apply for Leave</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 border rounded-md bg-slate-50">
            <div><span className="text-sm font-medium text-blue-900">Name:</span> <span className="text-sm text-blue-900">{employee.firstName} {employee.lastName}</span></div>
            <div><span className="text-sm font-medium text-blue-900">Department:</span> <span className="text-sm text-blue-900">{employee.department}</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-blue-900">From Date</label>
            <input type="date" id="fromDate" value={formData.fromDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-blue-900">To Date</label>
            <input type="date" id="toDate" value={formData.toDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
        </div>

         <div className="p-3 text-center bg-teal-50 border border-teal-200 rounded-md">
            <span className="text-sm font-medium text-blue-900">Total Leave Days Requested:</span>
            <span className="ml-2 text-md font-bold text-teal-600">{totalLeaveDays > 0 ? totalLeaveDays : '--'}</span>
        </div>

        <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-blue-900">Leave Type</label>
            <select id="leaveType" value={formData.leaveType} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md">
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Annual Leave</option>
                <option>Maternity Leave</option>
                <option>Paternity Leave</option>
                <option>Alternate Day Off</option>
                <option>Others</option>
            </select>
            {formData.leaveType !== 'Others' && (
                <p className={`mt-1 text-xs ${currentBalanceInfo.remaining === 0 ? 'text-red-600 font-bold' : 'text-blue-900'}`}>
                    Remaining Balance: {currentBalanceInfo.remaining} days (Used: {currentBalanceInfo.used}/{currentBalanceInfo.total})
                </p>
            )}
        </div>

        <div>
            <label htmlFor="reason" className="block text-sm font-medium text-blue-900">Reason for Leave</label>
            <textarea id="reason" value={formData.reason} onChange={handleChange} rows={4} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"></textarea>
        </div>
        
        {error && (
            <div className="p-3 rounded-md text-sm bg-red-100 text-red-800 border border-red-200">
                {error}
            </div>
        )}

        <div className="flex justify-end pt-4 gap-3">
          <button type="button" onClick={onCancel} className="py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-blue-900 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={formData.leaveType !== 'Others' && currentBalanceInfo.remaining <= 0}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Apply for Leave
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveApplicationForm;
