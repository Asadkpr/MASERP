
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Employee, AttendanceRecord } from '../../types';

declare const XLSX: any;

interface AttendancePageProps {
    employees: Employee[];
    attendanceRecords: AttendanceRecord[];
    onUploadAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<{ success: boolean; message: string }>;
    currentUserEmail: string;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ employees, attendanceRecords, onUploadAttendance, currentUserEmail }) => {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Date Range State (Default to today)
    const todayStr = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState(todayStr);
    const [toDate, setToDate] = useState(todayStr);
    const [selectedDepartment, setSelectedDepartment] = useState('All');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentEmployee = employees.find(e => e.email === currentUserEmail);
    const isAdmin = currentUserEmail === 'admin';
    const isHR = currentEmployee?.role === 'HR';
    const canManageAttendance = isAdmin || isHR;

     useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Extract unique departments from employees
    const departments = useMemo(() => {
        const depts = employees.map(e => e.department).filter(Boolean);
        return ['All', ...Array.from(new Set(depts))];
    }, [employees]);

    // Helper to convert Excel time to HH:MM string
    const excelTimeToHHMM = (timeValue: any) => {
        if (typeof timeValue === 'number') {
             // Excel stores time as a fraction of a day (e.g. 0.5 = 12:00 PM)
             const totalSeconds = Math.round(timeValue * 86400);
             const hours = Math.floor(totalSeconds / 3600);
             const minutes = Math.floor((totalSeconds % 3600) / 60);
             return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
        // If it's already a string time, try to clean it up
        if (typeof timeValue === 'string') {
            // Handle "9:00:00 AM" or just "09:00"
            const parts = timeValue.split(':');
            if (parts.length >= 2) {
                 let h = parseInt(parts[0]);
                 const m = parts[1];
                 // Simple AM/PM check if needed, though usually raw CSV is 24h or includes AM/PM
                 if (timeValue.toLowerCase().includes('pm') && h < 12) h += 12;
                 if (timeValue.toLowerCase().includes('am') && h === 12) h = 0;
                 return `${String(h).padStart(2, '0')}:${m.substring(0, 2)}`;
            }
        }
        return String(timeValue || '');
    };
    
    const excelDateToJSDate = (serial: any) => {
        if (typeof serial === 'number') {
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            return date_info.toISOString().split('T')[0];
        }
        try {
            const d = new Date(serial);
            if (!isNaN(d.getTime())) {
                 return d.toISOString().split('T')[0];
            }
            return String(serial);
        } catch {
            return String(serial);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            // Create a map of existing records to handle merging (First In, Last Out)
            // Key: "EmployeeID_Date" -> Value: Record Object
            const recordMap = new Map<string, { 
                employeeId: string, 
                date: string, 
                times: number[], // Store minutes from midnight for easy sorting
                status: 'Present' | 'Late' | 'Absent'
            }>();

            json.forEach((row) => {
                // Normalize row keys
                const normalizedRow: any = {};
                Object.keys(row).forEach(key => {
                    // Remove special chars and spaces, lowercase
                    const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    normalizedRow[cleanKey] = row[key];
                });

                // Look for possible column names
                // ID Columns: 'employeeid', 'empid', 'id', 'userid', 'acno'
                const rawId = normalizedRow['employeeid'] || normalizedRow['empid'] || normalizedRow['id'] || normalizedRow['userid'] || normalizedRow['acno'];
                
                // Name Columns (Fallback)
                const rawName = normalizedRow['name'] || normalizedRow['employeename'] || normalizedRow['empname'] || normalizedRow['employee'];
                
                // Date/Time
                const dateVal = normalizedRow['date'] || normalizedRow['attendancedate'] || normalizedRow['time']; // Sometimes date is in time column if split
                const timeVal = normalizedRow['time'] || normalizedRow['timein'] || normalizedRow['checkin'] || normalizedRow['datetime'];

                // Need at least Date and Time (or DateTime)
                if (!dateVal) return;

                let matchedEmployee: Employee | undefined;

                // Priority 1: Match by ID
                if (rawId) {
                    const searchId = String(rawId).trim();
                    matchedEmployee = employees.find(emp => 
                        (emp.employeeId && String(emp.employeeId).trim() === searchId) || 
                        (emp.id && String(emp.id).trim() === searchId)
                    );
                }

                // Priority 2: Match by Name (if ID failed or didn't exist)
                if (!matchedEmployee && rawName) {
                    const searchName = String(rawName).trim().toLowerCase();
                    matchedEmployee = employees.find(emp => {
                        const systemFullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                        return systemFullName === searchName;
                    });
                }

                if (matchedEmployee) {
                    // Parse Date
                    let recordDateStr = excelDateToJSDate(dateVal);
                    
                    // Parse Time
                    let timeStr = excelTimeToHHMM(timeVal);
                    
                    // Handle case where 'dateVal' contains both Date and Time (common in some exports)
                    if (dateVal.toString().includes('T') || (typeof dateVal === 'string' && dateVal.length > 15)) {
                         const dObj = new Date(dateVal);
                         if(!isNaN(dObj.getTime())) {
                             recordDateStr = dObj.toISOString().split('T')[0];
                             // Extract HH:MM
                             const h = String(dObj.getHours()).padStart(2, '0');
                             const m = String(dObj.getMinutes()).padStart(2, '0');
                             timeStr = `${h}:${m}`;
                         }
                    }

                    if (recordDateStr && timeStr && timeStr.includes(':')) {
                        const key = `${matchedEmployee.id}_${recordDateStr}`;
                        const [h, m] = timeStr.split(':').map(Number);
                        const minutesFromMidnight = h * 60 + m;

                        if (!recordMap.has(key)) {
                            recordMap.set(key, {
                                employeeId: matchedEmployee.id,
                                date: recordDateStr,
                                times: [],
                                status: 'Present'
                            });
                        }
                        
                        const entry = recordMap.get(key)!;
                        if (!entry.times.includes(minutesFromMidnight)) {
                            entry.times.push(minutesFromMidnight);
                        }
                    }
                }
            });

            // Convert Map to Records array
            const newRecords: Omit<AttendanceRecord, 'id'>[] = [];
            let processedCount = 0;

            recordMap.forEach((data) => {
                // Sort times ascending
                data.times.sort((a, b) => a - b);
                
                if (data.times.length > 0) {
                    const firstTimeMins = data.times[0];
                    const lastTimeMins = data.times[data.times.length - 1];

                    const timeInStr = `${String(Math.floor(firstTimeMins / 60)).padStart(2, '0')}:${String(firstTimeMins % 60).padStart(2, '0')}`;
                    
                    let timeOutStr = '';
                    if (data.times.length > 1) {
                         timeOutStr = `${String(Math.floor(lastTimeMins / 60)).padStart(2, '0')}:${String(lastTimeMins % 60).padStart(2, '0')}`;
                    }

                    // Determine Status
                    let status: AttendanceRecord['status'] = 'Present';
                    const [inH, inM] = timeInStr.split(':').map(Number);
                    if (inH > 9 || (inH === 9 && inM > 15)) {
                        status = 'Late';
                    }

                    newRecords.push({
                        employeeId: data.employeeId,
                        date: data.date,
                        timeIn: timeInStr,
                        timeOut: timeOutStr,
                        status: status
                    });
                    processedCount++;
                }
            });
            
            if (newRecords.length > 0) {
                const result = await onUploadAttendance(newRecords);
                 setMessage({ type: result.success ? 'success' : 'error', text: `${result.message} (${processedCount} daily records processed)` });
            } else {
                setMessage({ type: 'error', text: 'No valid records matched. Ensure ID or Name columns match your employee data.' });
            }

        } catch (error) {
            console.error("Error processing file:", error);
            setMessage({ type: 'error', text: 'Failed to process the uploaded file. Please ensure it is a valid Excel/CSV file.' });
        } finally {
            setIsLoading(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getEmployeeName = (employeeId: string) => {
        const emp = employees.find(e => e.employeeId === employeeId || e.id === employeeId);
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
    };
    
    const filteredRecords = useMemo(() => {
        return attendanceRecords.filter(record => {
            // 1. Permissions Check
            if (!canManageAttendance && currentEmployee) {
                // Standard users can only see their own records
                const isMyRecord = record.employeeId === currentEmployee.id || 
                                   record.employeeId === currentEmployee.employeeId;
                if (!isMyRecord) return false;
            }

            // 2. Date Range Check
            const isDateInRange = record.date >= fromDate && record.date <= toDate;
            if (!isDateInRange) return false;

            // 3. Department Check (Only for Admins/HR who can see the filter)
            if (canManageAttendance && selectedDepartment !== 'All') {
                const emp = employees.find(e => e.employeeId === record.employeeId || e.id === record.employeeId);
                if (emp?.department !== selectedDepartment) return false;
            }
            
            return true;
        }).sort((a, b) => {
            // Sort by Date Descending, then Name Ascending
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            const nameA = getEmployeeName(a.employeeId);
            const nameB = getEmployeeName(b.employeeId);
            return nameA.localeCompare(nameB);
        });
    }, [attendanceRecords, fromDate, toDate, selectedDepartment, employees, canManageAttendance, currentEmployee]);

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900">Attendance Management</h1>
                    <p className="text-blue-900 mt-1">
                        {canManageAttendance ? 'Upload biometric logs or view daily records.' : 'View your attendance history.'}
                    </p>
                </div>
                
                {canManageAttendance && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {isLoading ? 'Processing...' : 'Upload Machine Data'}
                        </button>
                    </>
                )}
            </div>
            
            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Filters</h3>
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                    <div>
                        <label htmlFor="from-date" className="block text-xs font-medium text-blue-900 mb-1">From Date</label>
                        <input 
                            type="date" 
                            id="from-date"
                            value={fromDate} 
                            onChange={(e) => setFromDate(e.target.value)}
                            className="block w-full sm:w-40 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="to-date" className="block text-xs font-medium text-blue-900 mb-1">To Date</label>
                        <input 
                            type="date" 
                            id="to-date"
                            value={toDate} 
                            onChange={(e) => setToDate(e.target.value)}
                            className="block w-full sm:w-40 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                    </div>
                    {canManageAttendance && (
                        <div>
                            <label htmlFor="dept-select" className="block text-xs font-medium text-blue-900 mb-1">Department</label>
                            <select
                                id="dept-select"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="block w-full sm:w-48 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Employee ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Employee Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Time In</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Time Out</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map(record => {
                                const statusColor = record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 
                                                    record.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                                                    'bg-green-100 text-green-800';
                                return (
                                    <tr key={record.id} className="hover:bg-purple-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.employeeId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">{getEmployeeName(record.employeeId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.timeIn}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{record.timeOut || '--'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10">
                                    <p className="text-blue-900">No attendance records found for the selected criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendancePage;
