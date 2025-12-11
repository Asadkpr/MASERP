





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

// These are the sub-pages within the main "Inventory" section, for access control
export const inventorySubPagesForAccess: SidebarLink[] = [
    { id: 'master', label: 'Master Inventory', icon: SupplyChainIcon },
    { id: 'laptops', label: 'Laptops', icon: DesktopIcon },
    { id: 'desktops', label: 'Desktops', icon: DesktopIcon },
    { id: 'printers', label: 'Printers & Toners', icon: PrinterIcon },
    { id: 'labs', label: 'Computer Labs', icon: LabIcon },
    { id: 'kitchen', label: "The Chef's Academy", icon: KitchenIcon },
];

// These are the top-level pages for the Inventory module sidebar
export const inventoryPages: SidebarLink[] = [
    { id: 'assets', label: 'Inventory', icon: DesktopIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'mrf', label: 'MRF', icon: MRFIcon },
    { id: 'reports', label: 'Reports', icon: ReportsIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

// This is the combined list for the User Access Management page
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
    { id: 'budgeting', label: 'Budgeting', icon: FinanceIcon },
    { id: 'payments', label: 'Payments', icon: PayrollIcon },
    { id: 'receipts', label: 'Receipts', icon: PerformanceIcon },
    { id: 'fin_reports', label: 'Reports', icon: ReportsIcon },
];

// Student Module Links
export const studentPages: SidebarLink[] = [
    { id: 'std_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'applicants', label: 'Applicants', icon: RecruitmentIcon },
    { id: 'student_portal', label: 'Student Portal', icon: StudentIcon },
    { id: 'std_attendance', label: 'Attendance', icon: AttendanceIcon },
    { id: 'course_delivery', label: 'Course Delivery', icon: TrainingIcon },
];

// Website & Portals Module Links
export const websitePages: SidebarLink[] = [
    { id: 'web_dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'applicant_portal', label: 'Applicant Portal', icon: RecruitmentIcon },
    { id: 'student_portal_mgmt', label: 'Student Portal', icon: StudentIcon },
    { id: 'teacher_dash', label: 'Teacher Dashboard', icon: WebsiteIcon },
    { id: 'admin_dash', label: 'Admin Dashboard', icon: SettingsIcon },
];


export const modulePages: { [key: string]: SidebarLink[] } = {
  hr: hrPages,
  inventory_management: inventoryModuleForAccessConfig,
  supply_chain: supplyChainPages,
  finance: financePages,
  student: studentPages,
  website: websitePages,
};