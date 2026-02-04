import type { SidebarLink } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { EmployeesIcon } from './icons/EmployeesIcon';
import { AttendanceIcon } from './icons/AttendanceIcon';
import { ReportsIcon } from './icons/ReportsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { UserAccessIcon } from './icons/UserAccessIcon';
import { DepartmentsIcon } from './icons/DepartmentsIcon';
import { LeavesIcon } from './icons/LeavesIcon';
import { PayrollIcon } from './icons/PayrollIcon';
import { PerformanceIcon } from './icons/PerformanceIcon';
import { TrainingIcon } from './icons/TrainingIcon';
import { RecruitmentIcon } from './icons/RecruitmentIcon';
import { FinanceIcon } from './icons/FinanceIcon';
import { StudentIcon } from './icons/StudentIcon';
import { WebsiteIcon } from './icons/WebsiteIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SupplyChainIcon } from './icons/SupplyChainIcon';
import { DesktopIcon } from './icons/DesktopIcon';
import { LabIcon } from './icons/LabIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { MRFIcon } from './icons/MRFIcon';
import { KitchenIcon } from './icons/KitchenIcon';
import { TaskIcon } from './icons/TaskIcon';
import { ChatIcon } from './icons/ChatIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { NoteIcon } from './icons/NoteIcon';
import { DollarIcon } from './icons/DollarIcon';
// Add missing HomeIcon import
import { HomeIcon } from './icons/HomeIcon';

// HR Module Links
export const hrMainLinks: SidebarLink[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'employees', label: 'Employees', icon: EmployeesIcon },
    { id: 'attendance', label: 'Attendance', icon: AttendanceIcon },
    { id: 'reports', label: 'Reports', icon: ReportsIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'user-access', label: 'User Access Management', icon: UserAccessIcon },
];

export const hrModuleLinks: SidebarLink[] = [
    { id: 'departments', label: 'Departments', icon: DepartmentsIcon },
    { id: 'leaves', label: 'Leaves', icon: LeavesIcon },
    { id: 'payroll', label: 'Payroll', icon: PayrollIcon },
    { id: 'performance', label: 'Performance', icon: PerformanceIcon },
    { id: 'training', label: 'Training', icon: TrainingIcon },
    { id: 'recruitment', label: 'Recruitment', icon: RecruitmentIcon },
];

export const hrPages: SidebarLink[] = [...hrMainLinks, ...hrModuleLinks];

// Inventory Management Module Links
export const inventorySubPagesForAccess: SidebarLink[] = [
    { id: 'master', label: 'Master Inventory', icon: SupplyChainIcon },
    { id: 'laptops', label: 'Laptops', icon: DesktopIcon },
    { id: 'desktops', label: 'Desktops', icon: DesktopIcon },
    { id: 'printers', label: 'Printers & Toners', icon: PrinterIcon },
    { id: 'labs', label: 'Computer Labs', icon: LabIcon },
    { id: 'kitchen', label: "The Chef's Academy", icon: KitchenIcon },
];

export const inventoryPages: SidebarLink[] = [
    { id: 'assets', label: 'Inventory', icon: DesktopIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'mrf', label: 'MRF', icon: MRFIcon },
    { id: 'reports', label: 'Reports', icon: ReportsIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const inventoryModuleForAccessConfig = [
    ...inventorySubPagesForAccess,
    ...inventoryPages.filter(p => ['users', 'mrf', 'reports', 'settings'].includes(p.id))
];

// Supply Chain Module Links
export const supplyChainPages: SidebarLink[] = [
    { id: 'sc_requests', label: 'New Request', icon: SupplyChainIcon },
    { id: 'sc_my_requests', label: 'My Requests', icon: ReportsIcon },
    { id: 'sc_approvals', label: 'Account Manager', icon: RecruitmentIcon },
    { id: 'sc_store', label: 'Store Fulfillment', icon: KitchenIcon },
    { id: 'sc_purchase', label: 'Purchase Department', icon: FinanceIcon },
];

// Finance Module Links
export const financePages: SidebarLink[] = [
    { id: 'fin_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'chart_of_accounts', label: 'Chart of Accounts', icon: DepartmentsIcon },
    { id: 'vouchers', label: 'Voucher Posting', icon: PayrollIcon },
    { id: 'general_ledger', label: 'General Ledger', icon: PerformanceIcon },
    { id: 'payroll_posting', label: 'Payroll Posting', icon: DollarIcon },
    { id: 'student_fees', label: 'Student Fees', icon: StudentIcon },
    { id: 'receivables', label: 'Accounts Receivable', icon: AnalyticsIcon },
    { id: 'cash_bank', label: 'Cash & Bank', icon: FinanceIcon },
    { id: 'fixed_assets', label: 'Fixed Assets', icon: DesktopIcon },
    { id: 'expenses', label: 'Expense Management', icon: DollarIcon },
    { id: 'payables', label: 'Accounts Payable', icon: RecruitmentIcon },
    { id: 'fin_reports', label: 'Financial Reports', icon: ReportsIcon },
    { id: 'audit_trail', label: 'Audit Trail', icon: UserAccessIcon },
];

// Student Module Links - FULLY EXPANDED for RBAC
export const studentPages: SidebarLink[] = [
    { id: 'std_dashboard', label: 'Portal Dashboard', icon: HomeIcon },
    { id: 'applicants', label: 'Admissions & Applicants', icon: RecruitmentIcon },
    { id: 'student_directory', label: 'Student Directory', icon: StudentIcon },
    { id: 'course_offerings', label: 'Course Offerings', icon: TrainingIcon },
    { id: 'course_registrations', label: 'Student Enrollments', icon: PayrollIcon },
    { id: 'std_timetable', label: 'Class Timetable', icon: CalendarIcon },
    { id: 'std_attendance', label: 'Attendance Ledger', icon: AttendanceIcon },
    { id: 'course_delivery', label: 'Learning Management (LMS)', icon: TrainingIcon },
    { id: 'exam_mgmt', label: 'Exam Scheduling', icon: AnalyticsIcon },
    { id: 'std_marks', label: 'Faculty Marks Entry', icon: DollarIcon },
    { id: 'std_results', label: 'GPA Result Audits', icon: AnalyticsIcon },
    { id: 'std_services', label: 'Student Helpdesk', icon: ChatIcon },
    { id: 'std_notifications', label: 'Campus Notifications', icon: RecruitmentIcon },
    { id: 'academic_setup', label: 'Institutional Setup', icon: HomeIcon },
];

// Website & Portals Module Links
export const websitePages: SidebarLink[] = [
    { id: 'web_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'applicant_portal', label: 'Applicant Portal', icon: RecruitmentIcon },
    { id: 'student_portal_mgmt', label: 'Student Portal', icon: StudentIcon },
    { id: 'teacher_dash', label: 'Teacher Dashboard', icon: WebsiteIcon },
    { id: 'admin_dash', label: 'Admin Dashboard', icon: SettingsIcon },
];

// Task Manager Module Links
export const taskManagerPages: SidebarLink[] = [
    { id: 'task_dashboard', label: 'Task Board', icon: TaskIcon },
    { id: 'task_calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'task_chat', label: 'Chat & Discussions', icon: ChatIcon },
    { id: 'task_analytics', label: 'Team Analytics', icon: AnalyticsIcon },
    { id: 'task_notes', label: 'My Notes', icon: NoteIcon },
];

export const modulePages: { [key: string]: SidebarLink[] } = {
  hr: hrPages,
  inventory_management: inventoryModuleForAccessConfig,
  supply_chain: supplyChainPages,
  finance: financePages,
  student: studentPages,
  website: websitePages,
  task_manager: taskManagerPages,
};