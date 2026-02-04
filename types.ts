
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
  isPostedToFinance?: boolean;
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
  material?: string; // New field for kitchen assets
  
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

// --- Finance Module Types ---

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface FinanceAccount {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    parentId?: string; // For hierarchy
    balance: number;
    description?: string;
}

export type VoucherType = 'Journal' | 'Payment' | 'Receipt' | 'Contra';

export interface VoucherEntry {
    accountId: string;
    accountName: string;
    type: 'Debit' | 'Credit';
    amount: number;
    description?: string;
}

export interface Voucher {
    id: string;
    voucherNumber: string;
    date: string;
    type: VoucherType;
    totalAmount: number;
    description: string;
    status: 'Draft' | 'Posted';
    entries: VoucherEntry[];
    createdBy: string;
}

export interface LedgerEntry {
    id: string;
    date: string;
    voucherId: string;
    voucherNumber: string;
    accountId: string;
    description: string;
    debit: number;
    credit: number;
    balanceAfter: number;
}

// Student Fees
export interface FeeItem {
    name: string;
    amount: number;
}

export interface FeeStructure {
    id: string;
    name: string;
    category: string; // e.g., "Intermediate", "Undergrad"
    items: FeeItem[];
    totalAmount: number;
}

export interface FeeChallan {
    id: string;
    challanNumber: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    month: string; // e.g., "August"
    year: string;
    dueDate: string;
    items: FeeItem[];
    discount: number;
    totalAmount: number;
    paidAmount: number;
    status: 'Unpaid' | 'Paid' | 'Partial' | 'Refunded';
    paymentDate?: string;
}

// Expenses
export interface FinanceExpense {
    id: string;
    category: string;
    date: string;
    amount: number;
    description: string;
    vendorId?: string;
    vendorName?: string;
    status: 'Pending' | 'Approved' | 'Paid';
    approvedBy?: string;
    paymentVoucherId?: string;
}

// Accounts Payable (Vendor Bills)
export interface VendorBill {
    id: string;
    billNumber: string;
    vendorId: string;
    vendorName: string;
    date: string;
    dueDate: string;
    poId?: string; // Link to supply chain PO
    totalAmount: number;
    paidAmount: number;
    status: 'Unpaid' | 'Partial' | 'Paid';
    description?: string;
}

// Cash & Bank
export interface BankReconciliation {
    id: string;
    accountId: string;
    statementDate: string;
    statementBalance: number;
    bookBalance: number;
    isMatched: boolean;
    reconciledBy: string;
}

// Fixed Assets (Finance Perspective)
export interface FinanceFixedAsset {
    id: string;
    assetName: string;
    assetCode: string;
    category: string;
    purchaseDate: string;
    purchaseCost: number;
    usefulLifeYears: number;
    salvageValue: number;
    accumulatedDepreciation: number;
    depreciationMethod: 'Straight Line' | 'Declining Balance';
    status: 'Active' | 'Disposed';
    location?: string;
    disposalDate?: string;
    disposalValue?: number;
}

// Audit Trail
export interface AuditLog {
    id: string;
    timestamp: string;
    userEmail: string;
    action: string; // e.g., "POST_VOUCHER", "UPDATE_ACCOUNT"
    module: string;
    details: string;
    metadata?: any;
}

// --- STUDENT MODULE TYPES ---

export interface AcademicSession {
    id: string;
    name: string; // e.g. "Fall 2026"
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface DegreeProgram {
    id: string;
    name: string; // e.g. "BS Computer Science"
    code: string; // e.g. "BSCS"
    department: string;
    durationYears: number;
    totalSemesters: number;
}

export interface CourseCatalog {
    id: string;
    code: string; // e.g. "CS101"
    name: string; // e.g. "Programming Fundamentals"
    creditHours: number;
    description?: string;
}

export interface ProgramCurriculum {
    id: string;
    programId: string;
    semesterNumber: number;
    courses: {
        courseId: string;
        isElective: boolean;
    }[];
}

export interface AcademicPolicy {
    id: string;
    type: 'Attendance' | 'Grading' | 'Admission';
    title: string;
    content: string;
    rules: any;
}

export interface Applicant {
    id: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    email: string;
    phone: string;
    programId: string; // Link to DegreeProgram
    sessionId: string; // Link to AcademicSession
    status: 'Applied' | 'Interviewed' | 'Rejected' | 'Admitted';
    applyDate: string;
}

export interface Student {
    id: string;
    rollNumber: string;
    userId: string; // Official Email for login
    firstName: string;
    lastName: string;
    fatherName: string;
    email: string; // Official Email
    personalEmail?: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    dob: string;
    cnic: string;
    address: string;
    guardianName: string;
    guardianPhone: string;
    
    // Academic Assignment
    programId: string;
    department: string;
    sessionId: string;
    batch: string;
    section: string;
    
    // Lifecycle
    status: 'Active' | 'Graduated' | 'Suspended' | 'Withdrawn';
    admissionDate: string;
    
    // Documents (URLs)
    documents?: {
        photo?: string;
        matric?: string;
        inter?: string;
        cnic?: string;
    }
}

export interface OfferedCourse {
    id: string;
    courseId: string; // Ref to CourseCatalog
    sessionId: string; // Ref to AcademicSession
    instructorId: string; // Ref to Employee
    section: string; // e.g., 'A', 'B'
    capacity: number;
    currentEnrollment: number;
    semesterNumber: number; // 1 to 8
    prerequisites?: string;
    timetableSlot?: string;
}

export interface CourseRegistration {
    id: string;
    studentId: string; // Ref to Student
    offeredCourseId: string; // Ref to OfferedCourse
    registrationDate: string;
    status: 'Pending' | 'Approved' | 'Dropped' | 'Withdrawn';
    semesterNumber: number;
}

export interface Classroom {
    id: string;
    roomNumber: string;
    building: string;
    capacity: number;
}

export interface TimetableEntry {
    id: string;
    offeredCourseId: string;
    classroomId: string;
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string; // HH:MM
    endTime: string; // HH:MM
}

export interface StudentAttendance {
    id: string;
    studentId: string;
    offeredCourseId: string;
    timetableEntryId: string;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent' | 'Late';
    markedBy: string; // Faculty Email
}

export interface CourseActivity {
    id: string;
    offeredCourseId: string;
    type: 'Lecture' | 'Assignment' | 'Quiz' | 'Announcement';
    title: string;
    content: string; // URL or text
    dueDate?: string;
    postedDate: string;
    isPublished: boolean;
}

export interface ExamSchedule {
    id: string;
    sessionId: string;
    offeredCourseId: string;
    date: string;
    startTime: string;
    endTime: string;
    classroomId: string; // Venue
    invigilatorId: string; // Ref to Employee
    status: 'Draft' | 'Published';
}

export interface StudentMark {
    id: string;
    studentId: string;
    offeredCourseId: string;
    sessionalMarks: number; // Quizzes, Assignments, Mids
    finalExamMarks: number;
    totalMarks: number;
    grade: string;
    gradePoint: number;
    status: 'Saved' | 'Verified' | 'Published';
    entryDate: string;
}

export interface SemesterResult {
    id: string;
    studentId: string;
    sessionId: string;
    semesterNumber: number;
    gpa: number;
    totalCredits: number;
    earnedCredits: number;
    status: 'Draft' | 'Finalized';
}

export interface StudentRequest {
    id: string;
    studentId: string;
    type: 'Leave Application' | 'Course Withdrawal' | 'Freeze Semester' | 'Transcript Request' | 'Degree Issuance' | 'Migration Request' | 'Section Change';
    description: string;
    date: string;
    status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
    remarks?: string;
    approvalDate?: string;
}

export interface AcademicNotification {
    id: string;
    title: string;
    content: string;
    category: 'Academic' | 'Exam Alert' | 'Class Notification' | 'General Notice';
    postedBy: string; // Email
    timestamp: string;
    audience: 'All' | string; // Program ID or 'All'
}
