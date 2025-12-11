
import React, { useState, useMemo } from 'react';
import type { Employee, AttendanceRecord, LeaveRequest } from '../../types';

declare const jspdf: any;
declare const XLSX: any;

interface ReportsPageProps { 
    employees: Employee[];
    attendanceRecords?: AttendanceRecord[];
    leaveRequests?: LeaveRequest[];
}

type ViewMode = 'monthly' | 'attendance' | 'absent';

const ReportsPage: React.FC<ReportsPageProps> = ({ employees, attendanceRecords = [], leaveRequests = [] }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');
    
    // Filters
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [searchName, setSearchName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM format
    const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

    const departments = useMemo(() => {
        const allDepts = employees.map(emp => emp.department);
        return ['All', ...Array.from(new Set(allDepts))];
    }, [employees]);

    // --- 1. Monthly Performance Logic ---
    const filteredEmployeesMonthly = useMemo(() => {
        return employees.filter(emp => {
            const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
            const matchesName = fullName.includes(searchName.toLowerCase());
            return matchesDept && matchesName;
        });
    }, [employees, selectedDepartment, searchName]);

    const getEmployeeMonthlyStats = (emp: Employee) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const targetMonth = month - 1; 

        const empRecords = attendanceRecords.filter(r => {
            const d = new Date(r.date);
            const isSameEmp = (r.employeeId && String(r.employeeId).trim() === String(emp.employeeId || emp.id).trim()) || r.employeeId === emp.id;
            return isSameEmp && d.getMonth() === targetMonth && d.getFullYear() === year;
        });
        
        let attendancePct = 0;
        if (empRecords.length > 0) {
            attendancePct = Math.round((empRecords.length / 30) * 100);
            if (attendancePct > 100) attendancePct = 100;
        }

        const approvedLeaves = leaveRequests.filter(req => {
            const isSameEmp = req.employeeId === emp.id;
            const reqDate = new Date(req.fromDate);
            const isSameMonth = reqDate.getMonth() === targetMonth && reqDate.getFullYear() === year;
            return isSameEmp && req.status === 'Approved' && isSameMonth;
        }).length;

        return { attendancePct, approvedLeaves, daysPresent: empRecords.length };
    };

    // --- 2. Attendance Report Logic (Present Logs) ---
    const attendanceReportData = useMemo(() => {
        return attendanceRecords.filter(record => {
            // Date Range Check
            if (record.date < fromDate || record.date > toDate) return false;
            
            // Find Employee
            const emp = employees.find(e => 
                String(e.employeeId).trim() === String(record.employeeId).trim() || 
                e.id === record.employeeId
            );
            
            if (!emp) return false; // Filter out records for deleted employees or mismatches

            // Department Check
            if (selectedDepartment !== 'All' && emp.department !== selectedDepartment) return false;

            // Name Check
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
            if (searchName && !fullName.includes(searchName.toLowerCase())) return false;

            return true;
        }).map(record => {
            const emp = employees.find(e => 
                String(e.employeeId).trim() === String(record.employeeId).trim() || 
                e.id === record.employeeId
            );
            return {
                ...record,
                empName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
                department: emp?.department || '-',
                designation: emp?.designation || '-'
            };
        }).sort((a, b) => a.date.localeCompare(b.date) || a.empName.localeCompare(b.empName));
    }, [attendanceRecords, fromDate, toDate, selectedDepartment, employees, searchName]);

    // --- 3. Absent Report Logic ---
    const absentReportData = useMemo(() => {
        const report = [];
        const start = new Date(fromDate);
        const end = new Date(toDate);
        
        // Filter employees by department AND Name
        const targetEmployees = employees.filter(e => {
            const matchesDept = selectedDepartment === 'All' || e.department === selectedDepartment;
            const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
            const matchesName = fullName.includes(searchName.toLowerCase());
            return matchesDept && matchesName;
        });

        // Build quick lookup for attendance
        // Set key: "empId_date"
        const attendanceMap = new Set<string>();
        attendanceRecords.forEach(r => {
            if (r.date >= fromDate && r.date <= toDate) {
                attendanceMap.add(`${String(r.employeeId).trim()}_${r.date}`);
            }
        });

        // Iterate through every day in range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            
            targetEmployees.forEach(emp => {
                // Check if present
                const empId = String(emp.employeeId || '').trim();
                const dbId = emp.id;
                const isPresent = attendanceMap.has(`${empId}_${dateStr}`) || attendanceMap.has(`${dbId}_${dateStr}`);

                if (!isPresent) {
                    // Check if on Approved Leave
                    const leave = leaveRequests.find(req => 
                        req.employeeId === emp.id && 
                        req.status === 'Approved' && 
                        dateStr >= req.fromDate && 
                        dateStr <= req.toDate
                    );

                    report.push({
                        date: dateStr,
                        empId: emp.employeeId || emp.id,
                        name: `${emp.firstName} ${emp.lastName}`,
                        department: emp.department,
                        designation: emp.designation,
                        status: leave ? 'On Leave' : 'Absent',
                        remarks: leave ? leave.leaveType : '-'
                    });
                }
            });
        }
        return report.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    }, [fromDate, toDate, selectedDepartment, employees, attendanceRecords, leaveRequests, searchName]);


    // --- Exports ---
    const handleExportExcel = () => {
        if (viewMode === 'monthly') {
            const data = filteredEmployeesMonthly.map((emp, index) => {
                const { attendancePct, approvedLeaves, daysPresent } = getEmployeeMonthlyStats(emp);
                const salary = new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(parseFloat(emp.salary || '0'));

                return {
                    '#': index + 1,
                    'Name': `${emp.firstName} ${emp.lastName}`,
                    'Department': emp.department,
                    'Designation': emp.designation,
                    'Month': selectedMonth,
                    'Days Present': daysPresent,
                    'Attendance (%)': `${attendancePct}%`,
                    'Leaves Taken': approvedLeaves,
                };
            });
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
            XLSX.writeFile(wb, `HR_Monthly_Report_${selectedMonth}.xlsx`);
        } 
        else if (viewMode === 'attendance') {
            const data = attendanceReportData.map(r => ({
                'Date': r.date,
                'Employee ID': r.employeeId,
                'Name': r.empName,
                'Department': r.department,
                'Time In': r.timeIn,
                'Time Out': r.timeOut || '-',
                'Status': r.status
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
            XLSX.writeFile(wb, `Attendance_Report_${fromDate}_to_${toDate}.xlsx`);
        }
        else if (viewMode === 'absent') {
            const data = absentReportData.map(r => ({
                'Date': r.date,
                'Employee ID': r.empId,
                'Name': r.name,
                'Department': r.department,
                'Status': r.status,
                'Remarks': r.remarks
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Absent');
            XLSX.writeFile(wb, `Absent_Report_${fromDate}_to_${toDate}.xlsx`);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm min-h-screen">
            {/* Header & Toggle */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                <div>
                     <h1 className="text-2xl font-bold text-blue-900">HR Reports</h1>
                     <p className="text-sm text-blue-900">Generate comprehensive reports for attendance and performance.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'monthly' ? 'bg-white text-teal-700 shadow-sm' : 'text-blue-900 hover:text-blue-950'}`}
                    >
                        Monthly Performance
                    </button>
                    <button 
                        onClick={() => setViewMode('attendance')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'attendance' ? 'bg-white text-teal-700 shadow-sm' : 'text-blue-900 hover:text-blue-950'}`}
                    >
                        Attendance Report
                    </button>
                    <button 
                        onClick={() => setViewMode('absent')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'absent' ? 'bg-white text-teal-700 shadow-sm' : 'text-blue-900 hover:text-blue-950'}`}
                    >
                        Absent Report
                    </button>
                </div>

                <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors shadow-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    Export Excel
                </button>
            </div>
            
            {/* --- FILTERS --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 items-end">
                <div className="w-full md:w-auto">
                    <label htmlFor="department-filter" className="block text-xs font-medium text-blue-900 mb-1">Department</label>
                    <select 
                        id="department-filter"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-slate-300 bg-white text-blue-900 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md border"
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-auto">
                    <label htmlFor="name-search" className="block text-xs font-medium text-blue-900 mb-1">Employee Name</label>
                    <input 
                        type="text" 
                        id="name-search"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="block w-full md:w-48 px-3 py-2 text-base border-slate-300 bg-white text-blue-900 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md border"
                    />
                </div>

                {viewMode === 'monthly' ? (
                    <div className="w-full md:w-auto">
                        <label htmlFor="month-filter" className="block text-xs font-medium text-blue-900 mb-1">Select Month</label>
                        <input 
                            type="month" 
                            id="month-filter"
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="block w-full md:w-48 px-3 py-2 text-base border-slate-300 bg-white text-blue-900 focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md border"
                        />
                    </div>
                ) : (
                    <>
                        <div className="w-full md:w-auto">
                            <label htmlFor="from-date" className="block text-xs font-medium text-blue-900 mb-1">From Date</label>
                            <input 
                                type="date" 
                                id="from-date"
                                value={fromDate} 
                                onChange={(e) => setFromDate(e.target.value)}
                                className="block w-full md:w-40 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label htmlFor="to-date" className="block text-xs font-medium text-blue-900 mb-1">To Date</label>
                            <input 
                                type="date" 
                                id="to-date"
                                value={toDate} 
                                onChange={(e) => setToDate(e.target.value)}
                                className="block w-full md:w-40 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* --- TAB 1: MONTHLY VIEW --- */}
            {viewMode === 'monthly' && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">#</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Attendance</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Leaves</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Salary</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredEmployeesMonthly.map((emp, index) => {
                                const { attendancePct, approvedLeaves } = getEmployeeMonthlyStats(emp);
                                const salary = new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(parseFloat(emp.salary || '0'));

                                return (
                                    <tr key={emp.id} className="hover:bg-purple-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 font-medium">{emp.firstName} {emp.lastName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{emp.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{emp.designation}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`text-xs font-semibold inline-block py-1 px-2 rounded-full ${
                                                attendancePct >= 90 ? 'text-green-600 bg-green-100' :
                                                attendancePct >= 75 ? 'text-yellow-600 bg-yellow-100' :
                                                'text-red-600 bg-red-100'
                                            }`}>
                                                {attendancePct}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{approvedLeaves}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{salary.replace('PKR', 'PKR ')}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredEmployeesMonthly.length === 0 && <p className="text-center py-8 text-blue-900">No data found matching criteria.</p>}
                </div>
            )}

            {/* --- TAB 2: ATTENDANCE REPORT --- */}
            {viewMode === 'attendance' && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <div className="p-3 bg-green-50 border-b border-green-100 text-sm text-green-800 font-medium">
                        Showing {attendanceReportData.length} records from {fromDate} to {toDate}
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Time In</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Time Out</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {attendanceReportData.map((record, index) => (
                                <tr key={index} className="hover:bg-purple-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{record.empName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-900">{record.timeIn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-900">{record.timeOut || '--'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {attendanceReportData.length === 0 && <p className="text-center py-8 text-blue-900">No attendance records found for this period.</p>}
                </div>
            )}

            {/* --- TAB 3: ABSENT REPORT --- */}
            {viewMode === 'absent' && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <div className="p-3 bg-red-50 border-b border-red-100 text-sm text-red-800 font-medium">
                        Showing {absentReportData.length} absentee records from {fromDate} to {toDate}
                    </div>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {absentReportData.map((record, index) => (
                                <tr key={index} className="hover:bg-purple-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{record.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            record.status === 'On Leave' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {absentReportData.length === 0 && <p className="text-center py-8 text-blue-900">No absences found! Everyone was present.</p>}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
