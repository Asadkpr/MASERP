
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import HrDashboard from './HrDashboard';
import AddEmployeePage from './AddEmployeePage';
import UsersPage from './UsersPage';
import UserAccessManagementPage from './UserAccessManagementPage';
import LeavesPage from './LeavesPage';
import DepartmentsPage from './DepartmentsPage';
import PayrollPage from './PayrollPage';
import ReportsPage from './ReportsPage';
import AttendancePage from './AttendancePage';
import type { Employee, User, AllPermissions, ModulePermissions, LeaveRequest, PayrollRecord, AttendanceRecord } from '../../types';
import { hrMainLinks, hrModuleLinks } from '../moduleNavigation';

interface HrDashboardPageProps {
  onBack: () => void;
  employees: Employee[];
  users: User[];
  onAddEmployee: (employee: Omit<Employee, 'id'>, password: string) => void;
  onLogout: () => void;
  allPermissions: AllPermissions;
  onUserPermissionsChange: (userEmail: string, newUserPermissions: { [moduleId: string]: ModulePermissions }) => void;
  currentUserEmail: string;
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (request: Omit<LeaveRequest, 'id'>) => void;
  onLeaveRequestAction: (requestId: string, action: 'Approve' | 'Reject') => void;
  onResignEmployee: (employeeId: string) => Promise<{ success: boolean; message: string }>;
  payrollHistory: PayrollRecord[];
  onRunPayroll: () => Promise<{ success: boolean; message: string }>;
  onUpdateEmployee: (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => Promise<{ success: boolean; message: string }>;
  attendanceRecords: AttendanceRecord[];
  onUploadAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<{ success: boolean; message: string }>;
}

const HrDashboardPage: React.FC<HrDashboardPageProps> = ({ 
    onBack, 
    employees, 
    users, 
    onAddEmployee, 
    onLogout, 
    allPermissions, 
    onUserPermissionsChange, 
    currentUserEmail,
    leaveRequests,
    onAddLeaveRequest,
    onLeaveRequestAction,
    onResignEmployee,
    payrollHistory,
    onRunPayroll,
    onUpdateEmployee,
    attendanceRecords,
    onUploadAttendance,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAdmin = currentUserEmail === 'admin';
  const currentUserHrPermissions = allPermissions[currentUserEmail]?.hr || {};
  const currentEmployee = employees.find(emp => emp.email === currentUserEmail);

  // Determine the first accessible page based on permissions
  const firstAccessiblePage = useMemo(() => {
      // Admin sees everything
      if (isAdmin) return 'dashboard';

      // Check all possible HR links
      const allLinks = [...hrMainLinks, ...hrModuleLinks];
      
      // Filter accessible links
      const accessibleLinks = allLinks.filter(link => {
          // Special rule: Standard employees cannot see the main stats dashboard
          if (currentEmployee?.role === 'Employee' && link.id === 'dashboard') return false;
          // Check permissions
          return currentUserHrPermissions[link.id]?.view;
      });

      // Return the ID of the first accessible page, or null if none
      return accessibleLinks.length > 0 ? accessibleLinks[0].id : null;
  }, [isAdmin, currentUserHrPermissions, currentEmployee]);

  const [activePage, setActivePage] = useState<string | null>(firstAccessiblePage);
  const [searchQuery, setSearchQuery] = useState('');

  // Update active page if permissions load/change and user is on a now-inaccessible page (or null)
  useEffect(() => {
      if (!activePage && firstAccessiblePage) {
          setActivePage(firstAccessiblePage);
      }
  }, [firstAccessiblePage, activePage]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const lowercasedQuery = searchQuery.toLowerCase();
    return employees.filter(emp =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lowercasedQuery) ||
      emp.email.toLowerCase().includes(lowercasedQuery) ||
      emp.department.toLowerCase().includes(lowercasedQuery) ||
      emp.designation.toLowerCase().includes(lowercasedQuery) ||
      (emp.employeeId || '').toLowerCase().includes(lowercasedQuery)
    );
  }, [employees, searchQuery]);

  const filteredUsers = useMemo(() => {
      if (!searchQuery) return users;
      const lowercasedQuery = searchQuery.toLowerCase();
      return users.filter(user => {
          if (user.email.toLowerCase().includes(lowercasedQuery)) {
              return true;
          }
          const employee = employees.find(emp => emp.email === user.email);
          if (employee && `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(lowercasedQuery)) {
              return true;
          }
          return false;
      });
  }, [users, employees, searchQuery]);

  const renderContent = () => {
    if (!activePage) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You do not have permission to view any pages in this module. Please contact an administrator.</p>
                <button onClick={onBack} className="mt-4 text-teal-600 hover:underline">Go Back</button>
            </div>
        );
    }

    switch (activePage) {
      case 'dashboard':
        return <HrDashboard 
            employees={employees} 
            leaveRequests={leaveRequests}
            onLeaveRequestAction={onLeaveRequestAction}
            onNavigate={setActivePage}
        />;
      case 'employees':
        return <AddEmployeePage onAddEmployee={onAddEmployee} employees={filteredEmployees} onResignEmployee={onResignEmployee} onUpdateEmployee={onUpdateEmployee} />;
      case 'attendance':
        return <AttendancePage 
            employees={employees} 
            attendanceRecords={attendanceRecords}
            onUploadAttendance={onUploadAttendance}
            currentUserEmail={currentUserEmail}
        />;
      case 'reports':
        return <ReportsPage 
            employees={employees} 
            attendanceRecords={attendanceRecords}
            leaveRequests={leaveRequests}
        />;
      case 'users':
        return <UsersPage users={filteredUsers} employees={employees} />;
      case 'user-access':
        return <UserAccessManagementPage 
            users={users} 
            employees={employees}
            allPermissions={allPermissions}
            onUserPermissionsChange={onUserPermissionsChange}
        />;
      case 'leaves':
        return <LeavesPage 
            currentUserEmail={currentUserEmail}
            employees={employees}
            leaveRequests={leaveRequests}
            onAddLeaveRequest={onAddLeaveRequest}
            onLeaveRequestAction={onLeaveRequestAction}
        />;
      case 'departments':
        return <DepartmentsPage />;
      case 'payroll':
        return <PayrollPage 
            employees={employees}
            payrollHistory={payrollHistory}
            attendanceRecords={attendanceRecords}
            leaveRequests={leaveRequests}
            onRunPayroll={onRunPayroll}
        />;
      default:
        return <div className="p-6 bg-white rounded-lg shadow-sm">Content for {activePage}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar 
        activePage={activePage || ''} 
        setActivePage={setActivePage} 
        isCollapsed={isSidebarCollapsed} 
        onLogout={onLogout}
        permissions={currentUserHrPermissions}
        currentUserEmail={currentUserEmail}
        employees={employees}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed} 
          onLogout={onLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBack={onBack}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HrDashboardPage;
