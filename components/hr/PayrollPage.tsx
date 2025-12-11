
import React, { useState, useEffect } from 'react';
import type { Employee, PayrollRecord, AttendanceRecord, LeaveRequest } from '../../types';
import { DollarIcon } from '../icons/DollarIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { AttendanceIcon } from '../icons/AttendanceIcon';
import { ReportsIcon } from '../icons/ReportsIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

declare const XLSX: any;

interface PayrollStatCardProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: string;
    bgColor: string;
}

const PayrollStatCard: React.FC<PayrollStatCardProps> = ({ icon: Icon, title, value, bgColor }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-full ${bgColor}`}>
                <Icon className='w-6 h-6 text-white' />
            </div>
            <div>
                <p className="text-sm text-blue-900">{title}</p>
                <p className="text-xl font-bold text-blue-900">{value}</p>
            </div>
        </div>
    );
};

interface PayrollPageProps {
  employees: Employee[];
  payrollHistory: PayrollRecord[];
  attendanceRecords?: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
  onRunPayroll: () => Promise<{ success: boolean; message: string }>;
}

const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    return formatted.replace('PKR', 'PKR ');
};

const PayrollPage: React.FC<PayrollPageProps> = ({ employees, payrollHistory, attendanceRecords = [], leaveRequests = [], onRunPayroll }) => {
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Calculate estimated payroll based on current month's attendance so far
    const totalPayroll = employees.reduce((acc, emp) => acc + parseFloat(emp.salary || '0'), 0);
    const averageSalary = employees.length > 0 ? totalPayroll / employees.length : 0;
    
    const nextPayrollDate = new Date();
    nextPayrollDate.setMonth(nextPayrollDate.getMonth() + 1, 0);

    const handleRunPayroll = async () => {
        if (window.confirm(`Are you sure you want to run payroll for ${selectedMonth}? This calculates deductions based on attendance.`)) {
            const result = await onRunPayroll();
            setMessage({ type: result.success ? 'success' : 'error', text: result.message });
        }
    };

    // Helper: Calculate Paid Days (Present + Approved Leave)
    const calculatePaidDays = (empId: string, empEmployeeId: string | undefined, year: number, month: number) => {
        // 1. Count Days Present
        const daysPresent = attendanceRecords.filter(r => {
            const d = new Date(r.date);
            const isSameEmp = r.employeeId === empEmployeeId || r.employeeId === empId;
            return isSameEmp && d.getMonth() === month && d.getFullYear() === year;
        }).length;

        // 2. Count Approved Leave Days in this month
        let approvedLeaveDays = 0;
        const empLeaves = leaveRequests.filter(req => {
            return req.employeeId === empId && req.status === 'Approved';
        });

        empLeaves.forEach(req => {
            const start = new Date(req.fromDate);
            const end = new Date(req.toDate);
            
            // Iterate through days of leave
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getMonth() === month && d.getFullYear() === year) {
                    // Check if this day is not already counted in attendance (avoid double counting if they punched in on a leave day)
                    const dateStr = d.toISOString().split('T')[0];
                    const isPresent = attendanceRecords.some(r => 
                        (r.employeeId === empEmployeeId || r.employeeId === empId) && 
                        r.date === dateStr
                    );
                    if (!isPresent) {
                        approvedLeaveDays++;
                    }
                }
            }
        });

        return { daysPresent, approvedLeaveDays, totalPaidDays: daysPresent + approvedLeaveDays };
    };

    const handleGeneratePayslip = (emp: Employee) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const targetMonth = month - 1; 
        
        const { daysPresent, approvedLeaveDays, totalPaidDays } = calculatePaidDays(emp.id, emp.employeeId, year, targetMonth);

        const baseSalary = parseFloat(emp.salary || '0');
        let pay = baseSalary;
        let deduction = 0;
        
        const anyRecordsForMonth = attendanceRecords.some(r => {
            const d = new Date(r.date);
            return d.getMonth() === targetMonth && d.getFullYear() === year;
        });

        if (anyRecordsForMonth) {
             // If > 30 days, cap at base salary (don't pay extra)
             // If < 30 days, deduct pro-rata
             const effectivePaidDays = Math.min(30, totalPaidDays);
             const perDay = baseSalary / 30;
             pay = perDay * effectivePaidDays;
             deduction = baseSalary - pay;
             if (deduction < 0) deduction = 0;
        } else {
             deduction = 0; 
        }
        
        const netPay = pay;
        const payrollMonthName = new Date(year, targetMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

        const excelData = [
            ["MASBOT ERP Payslip"],
            [`Report for: ${payrollMonthName}`],
            [],
            ["Employee Details"],
            ["Employee ID", emp.employeeId || emp.id],
            ["Name", `${emp.firstName} ${emp.lastName}`],
            ["Department", emp.department],
            ["Designation", emp.designation],
            [],
            ["Attendance Summary"],
            ["Days Present", daysPresent],
            ["Approved Leave Days", approvedLeaveDays],
            ["Total Paid Days", totalPaidDays],
            [],
            ["Earnings", "Amount (PKR)"],
            ["Base Salary", baseSalary],
            [],
            ["Deductions", "Amount (PKR)"],
            ["Absenteeism / Unpaid", deduction],
            [],
            ["", ""],
            ["Net Salary", netPay]
        ];

        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [{ wch: 25 }, { wch: 20 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payslip");
        XLSX.writeFile(wb, `Payslip-${emp.firstName}_${emp.lastName}-${selectedMonth}.xlsx`);
    };

    // Helper to render the live payroll table
    const renderLivePayrollTable = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const targetMonth = month - 1;

        return (
             <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Days Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Paid Leave</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Total Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Base Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {employees.map((emp) => {
                    const baseSalary = parseFloat(emp.salary || '0');
                    
                    const { daysPresent, approvedLeaveDays, totalPaidDays } = calculatePaidDays(emp.id, emp.employeeId, year, targetMonth);
                    
                    let netPay = baseSalary;
                    let deduction = 0;

                    // Check if system has ANY data for this month to avoid punishing during empty demo state
                    const anyRecordsForMonth = attendanceRecords.some(r => {
                        const d = new Date(r.date);
                        return d.getMonth() === targetMonth && d.getFullYear() === year;
                    });

                    if (anyRecordsForMonth) {
                        // 30-day fixed basis calculation
                        const effectivePaidDays = Math.min(30, totalPaidDays); // Cap at 30 so we don't pay more than salary
                        const perDay = baseSalary / 30;
                        netPay = perDay * effectivePaidDays;
                        deduction = baseSalary - netPay;
                        if(deduction < 0) deduction = 0;
                    }

                    return (
                        <tr key={emp.id} className="hover:bg-purple-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-900">{emp.firstName} {emp.lastName}</div>
                                <div className="text-xs text-blue-900">{emp.employeeId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 font-bold">
                                {anyRecordsForMonth ? daysPresent : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                {anyRecordsForMonth ? approvedLeaveDays : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                {anyRecordsForMonth ? totalPaidDays : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{formatCurrency(baseSalary)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                {deduction > 0 ? `-${formatCurrency(deduction)}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(netPay)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => handleGeneratePayslip(emp)} className="text-teal-600 hover:text-teal-900">Payslip</button>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
        );
    };

    if (isViewingHistory) {
        if (selectedRecord) {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedRecord(null)} className="flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-teal-600">
                            <ChevronLeftIcon className="w-5 h-5" />
                            <span>Back to History</span>
                        </button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-blue-900">Payroll Details: {selectedRecord.monthYear}</h1>
                        <p className="text-blue-900 mt-1">Processed on {new Date(selectedRecord.date).toLocaleDateString()}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PayrollStatCard icon={DollarIcon} title="Total Payout" value={formatCurrency(selectedRecord.totalNetPay)} bgColor="bg-green-500" />
                        <PayrollStatCard icon={UsersIcon} title="Employees Paid" value={selectedRecord.employeeRecords.length.toString()} bgColor="bg-blue-500" />
                        <PayrollStatCard icon={ReportsIcon} title="Total Deductions" value={formatCurrency(selectedRecord.totalDeductions)} bgColor="bg-red-500" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                         <h2 className="text-xl font-bold text-blue-900 mb-4">Breakdown</h2>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Base Salary</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Deductions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Net Pay</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {selectedRecord.employeeRecords.map(rec => (
                                        <tr key={rec.employeeId} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{rec.employeeName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{rec.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{formatCurrency(rec.baseSalary)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">-{formatCurrency(rec.deductions)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(rec.netPay)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsViewingHistory(false)} className="flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-teal-600">
                        <ChevronLeftIcon className="w-5 h-5" />
                        <span>Back to Payroll</span>
                    </button>
                </div>
                <h1 className="text-2xl font-bold text-blue-900">Payroll History</h1>
                {payrollHistory.length > 0 ? (
                    <div className="space-y-4">
                        {payrollHistory.map(record => (
                            <div key={record.id} onClick={() => setSelectedRecord(record)} className="bg-white p-4 rounded-lg shadow-sm border border-transparent hover:border-teal-500 cursor-pointer transition-all flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-blue-900 text-lg">{record.monthYear}</p>
                                    <p className="text-xs text-blue-900">Processed: {new Date(record.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-blue-900">Paid Out</p>
                                    <p className="font-bold text-green-600">{formatCurrency(record.totalNetPay)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg">
                        <p className="text-blue-900">No payroll history found.</p>
                    </div>
                )}
            </div>
        );
    }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Payroll Management</h1>
        <p className="text-blue-900 mt-1">Salaries are automatically calculated based on attendance records and approved leaves.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PayrollStatCard icon={DollarIcon} title="Est. Monthly Payroll" value={formatCurrency(totalPayroll)} bgColor="bg-teal-500" />
        <PayrollStatCard icon={UsersIcon} title="Total Employees" value={employees.length.toString()} bgColor="bg-blue-500" />
        <PayrollStatCard icon={ReportsIcon} title="Avg. Salary" value={formatCurrency(averageSalary)} bgColor="bg-orange-500" />
        <PayrollStatCard icon={AttendanceIcon} title="Next Payroll" value={nextPayrollDate.toLocaleDateString()} bgColor="bg-indigo-500" />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-blue-900">Salaries</h2>
             <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-blue-900"
             />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setIsViewingHistory(true)} className="btn-secondary py-2 px-4 border rounded-md text-sm font-medium hover:bg-gray-50 text-blue-900">
              View History
            </button>
            <button onClick={handleRunPayroll} className="bg-teal-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-teal-700 shadow-sm">
              Finalize & Run Payroll
            </button>
          </div>
        </div>

        {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
        )}
        
        <div className="overflow-x-auto">
          {employees.length > 0 ? renderLivePayrollTable() : (
            <p className="text-center text-blue-900 py-4">No employees found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
