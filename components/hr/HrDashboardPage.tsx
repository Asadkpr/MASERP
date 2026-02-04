
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
import PerformancePage from './PerformancePage';
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
  onDeleteEmployee: (employeeId: string) => Promise<{ success: boolean; message: string }>;
  payrollHistory: PayrollRecord[];
  onRunPayroll: () => Promise<{ success: boolean; message: string }>;
  onUpdateEmployee: (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => Promise<{ success: boolean; message: string }>;
  attendanceRecords: AttendanceRecord[];
  onUploadAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<{ success: boolean; message: string }>;
}

const HrDashboardPage: React.FC<HrDashboardPageProps> = (props) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAdmin = props.currentUserEmail === 'admin';
  const currentUserHrPermissions = props.allPermissions[props.currentUserEmail]?.hr || {};
  const currentEmployee = props.employees.find(emp => emp.email === props.currentUserEmail);

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
    if (!searchQuery) return props.employees;
    const lowercasedQuery = searchQuery.toLowerCase();
    return props.employees.filter(emp =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(lowercasedQuery) ||
      emp.email.toLowerCase().includes(lowercasedQuery) ||
      emp.department.toLowerCase().includes(lowercasedQuery) ||
      emp.designation.toLowerCase().includes(lowercasedQuery) ||
      (emp.employeeId || '').toLowerCase().includes(lowercasedQuery)
    );
  }, [props.employees, searchQuery]);

  const filteredUsers = useMemo(() => {
      if (!searchQuery) return props.users;
      const lowercasedQuery = searchQuery.toLowerCase();
      return props.users.filter(user => {
          if (user.email.toLowerCase().includes(lowercasedQuery)) {
              return true;
          }
          const employee = props.employees.find(emp => emp.email === user.email);
          if (employee && `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(lowercasedQuery)) {
              return true;
          }
          return false;
      });
  }, [props.users, props.employees, searchQuery]);

  const renderContent = () => {
    if (!activePage) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You do not have permission to view any pages in this module. Please contact an administrator.</p>
                <button onClick={props.onBack} className="mt-4 text-teal-600 hover:underline">Go Back</button>
            </div>
        );
    }

    switch (activePage) {
      case 'dashboard':
        return <HrDashboard 
            employees={props.employees} 
            leaveRequests={props.leaveRequests}
            onLeaveRequestAction={props.onLeaveRequestAction}
            onNavigate={setActivePage}
        />;
      case 'employees':
        return <AddEmployeePage onAddEmployee={props.onAddEmployee} employees={filteredEmployees} onResignEmployee={props.onResignEmployee} onUpdateEmployee={props.onUpdateEmployee} />;
      case 'attendance':
        return <AttendancePage 
            employees={props.employees} 
            attendanceRecords={props.attendanceRecords}
            onUploadAttendance={props.onUploadAttendance}
            currentUserEmail={props.currentUserEmail}
        />;
      case 'reports':
        return <ReportsPage 
            employees={props.employees} 
            attendanceRecords={props.attendanceRecords}
            leaveRequests={props.leaveRequests}
        />;
      case 'users':
        return <UsersPage 
            users={filteredUsers} 
            employees={props.employees} 
            onDeleteEmployee={props.onDeleteEmployee}
            currentUserEmail={props.currentUserEmail}
        />;
      case 'user-access':
        return <UserAccessManagementPage 
            users={props.users} 
            employees={props.employees}
            allPermissions={props.allPermissions}
            onUserPermissionsChange={props.onUserPermissionsChange}
        />;
      case 'leaves':
        return <LeavesPage 
            currentUserEmail={props.currentUserEmail}
            employees={props.employees}
            leaveRequests={props.leaveRequests}
            onAddLeaveRequest={props.onAddLeaveRequest}
            onLeaveRequestAction={props.onLeaveRequestAction}
        />;
      case 'departments':
        return <DepartmentsPage />;
      case 'payroll':
        return <PayrollPage 
            employees={props.employees}
            payrollHistory={props.payrollHistory}
            attendanceRecords={props.attendanceRecords}
            leaveRequests={props.leaveRequests}
            onRunPayroll={props.onRunPayroll}
        />;
      case 'performance':
        return <PerformancePage employees={props.employees} attendanceRecords={props.attendanceRecords} />;
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
        onLogout={props.onLogout}
        permissions={currentUserHrPermissions}
        currentUserEmail={props.currentUserEmail}
        employees={props.employees}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed} 
          onLogout={props.onLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBack={props.onBack}
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
