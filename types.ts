
// FIX: Import React types to resolve errors with JSX.Element and React.FC not being found in a .ts file.
import type React from 'react';

export interface Module {
  id: string;
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
  title: string;
  description: string;
}

export interface LeaveBalance {
    annual: { total: number; used: number };
    sick: { total: number; used: number };
    casual: { total: number; used: number };
    maternity: { total: number; used: number };
    paternity: { total: number; used: number };
    alternateDayOff: { total: number; used: number };
    others: { total: number; used: number };
}

export interface Employee {
  id: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  cnic?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: 'Single' | 'Married';
  currentAddress?: string;
  permanentAddress?: string;
  email: string; // Official Email for login
  personalEmail?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType?: 'Permanent' | 'Contract' | 'Intern' | 'Probation';
  status?: 'Active' | 'Resigned' | 'Terminated';
  salary: string;
  shift?: string; // Added Shift Timing
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  role: 'Employee' | 'HOD' | 'HR';
  leaveBalance?: LeaveBalance;
}


export interface User {
  // FIX: Added 'id' to the User interface to align the type with Firestore documents, which include an ID. This resolves a type error in App.tsx.
  id: string;
  email: string;
  password?: string;
  passwordChangeRequired?: boolean;
}

export interface PagePermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
  update: boolean;
}

export interface ModulePermissions {
  [pageId: string]: PagePermissions;
}

export interface AllPermissions {
  [userEmail: string]: {
    [moduleId: string]: ModulePermissions;
  };
}

export interface SidebarLink {
    id: string;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface LeaveRequest {
  id: string;
  employeeId: string; // Corresponds to Employee's id
  fromDate: string;
  toDate: string;
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Annual Leave' | 'Maternity Leave' | 'Paternity Leave' | 'Alternate Day Off' | 'Others';
  reason: string;
  status: 'Pending HOD' | 'Pending HR' | 'Approved' | 'Rejected';
}

export interface EmployeePayrollRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  deductions: number;
  netPay: number;
}

export interface PayrollRecord {
  id: string;
  date: string; // ISO string
  monthYear: string; // e.g., "July 2024"
  totalPayroll: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeRecords: EmployeePayrollRecord[];
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    timeIn: string; // HH:MM
    timeOut: string; // HH:MM
    status: 'Present' | 'Absent' | 'Late' | 'Half Day';
}


// --- Inventory Module Types ---

export type InventoryPage = 'assets' | 'users' | 'mrf' | 'reports' | 'settings';

export interface InventoryItem {
  id: string;
  // Core Identifiers
  itemCode?: string;
  itemName?: string;
  
  // Categorization
  type: string; // Acts as Category
  subCategory?: string;
  brand?: string;
  model: string;
  
  // Tracking
  serialNumber?: string;
  status: 'In Use' | 'In Stock' | 'Maintenance';
  assignedTo: string;
  location?: string;
  condition?: string;
  
  // Quantities
  quantity?: number;
  unit?: string; // Unit of Measure
  
  // Financial & Lifecycle
  purchaseDate?: string;
  cost?: string;
  assetLife?: string;
  vendor?: string;
  maintenanceDate?: string;
  issueDate?: string; // Date assigned to user
  
  // Organization
  department?: string;
  designation?: string;
  
  // Technical Specs
  specs?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    gpu?: string;
    lcd?: string;
  };
  
  // Misc
  others?: string;
  remarks?: string; // Explicit remarks field
  telephoneExt?: string;
}

export interface InventoryUser {
    id: string;
    name: string;
    email: string;
    assets: {
        id: string;
        type: string;
        model: string;
    }[];
}

export interface LabSystem {
    id: string;
    serialNumber: string;
    systemModel: string;
    lcdModel: string;
    lcdInches: string;
    cpu: string;
    ram: string;
    storage: string;
    gpu: string;
    keyboard: string;
    mouse: string;
    networkDevice: string;
}

export interface Lab {
    id: string;
    name: string;
    systems: LabSystem[];
}

export interface Toner {
  id: string;
  model: string;
  compatiblePrinters: string[];
  quantity: number;
  status: 'Filled' | 'Empty';
}

export interface GroupedToner {
    model: string;
    compatiblePrinters: string[];
    filled: { id: string | null; quantity: number };
    empty: { id: string | null; quantity: number };
}

export interface MRF {
  id: string;
  mrfNumber: string;
  demandNumber: string;
  description: string;
  date: string; // ISO string
  status: 'Pending' | 'Proceed';
}

// --- Supply Chain Types ---

export interface Recipe {
    id: string;
    name: string;
    ingredients: {
        name: string;
        quantity: number; // Amount per single serving
        unit: string;
    }[];
}

export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email?: string;
    address: string;
}

export interface SupplyChainRequest {
    id: string;
    requesterName: string;
    requesterEmail: string;
    department: string;
    date: string; // ISO Date
    items: {
        inventoryId: string;
        name: string;
        quantityRequested: number;
        unit: string;
    }[];
    purpose: string;
    status: 'Pending Account Manager' | 'Pending Store' | 'Forwarded to Purchase' | 'Issued' | 'Rejected';
    approvalDate?: string;
    issuedDate?: string;
    rejectionReason?: string;
}

export interface PurchaseRequest {
    id: string;
    inventoryId: string; // Optional if new item
    itemName: string;
    currentStock: number;
    quantityRequested: number;
    unit: string;
    priority: 'Low' | 'Medium' | 'High';
    notes?: string;
    status: 'Pending' | 'Approved' | 'Ordered' | 'Received';
    date: string;
    requesterEmail: string;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    originalRequestId?: string; // Link to SupplyChainRequest if applicable
    vendorId: string;
    vendorName: string;
    date: string;
    items: {
        itemName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        totalPrice: number;
        inventoryId?: string; // To link back to stock update
    }[];
    totalAmount: number;
    status: 'Pending Account Manager' | 'Approved' | 'Rejected' | 'Received';
    generatedBy: string; // Purchase Dept User
    approvedDate?: string;
    grnDate?: string;
    grnNumber?: string;
    grnRemarks?: string;
}

// --- Task Manager Types ---

export type TaskStatus = 'New' | 'Assigned' | 'In Progress' | 'Completed - Pending Review' | 'Closed' | 'Reopened';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskCategory = 'ERP' | 'IT Support' | 'Finance' | 'HR' | 'Operations' | 'Other';

export interface TaskHistory {
    action: string; // e.g., "Created", "Accepted", "Status Change"
    by: string; // Email or Name of user
    timestamp: string;
    details?: string; // e.g., "Status changed from New to Assigned", "Rejection remarks: ..."
}

export interface Task {
    id: string;
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
    
    // Assignment
    assignedTo: string; // Employee ID or Email
    assignedToName: string;
    assignedToDepartment?: string;
    
    createdBy: string; // Email
    
    // Dates
    startDate: string;
    dueDate: string;
    completedDate?: string;
    createdAt: string;

    // Workflow
    status: TaskStatus;
    completionRemarks?: string;
    rejectionRemarks?: string;
    
    // Audit
    history: TaskHistory[];
}

export interface ChatMessage {
    id: string;
    senderEmail: string;
    senderName: string;
    receiverEmail?: string; // If empty/null, it is a public/group message
    message: string;
    timestamp: string;
    isPublic: boolean;
}

export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    color: 'yellow' | 'green' | 'blue' | 'purple' | 'red';
    date: string;
}
