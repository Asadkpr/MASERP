
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import HrDashboardPage from './components/hr/HrDashboardPage';
import InventoryDashboardPage from './components/InventoryDashboardPage';
import SupplyChainDashboardPage from './components/SupplyChainDashboardPage';
import TaskManagerPage from './components/task_manager/TaskManagerPage';
import FinanceDashboardPage from './components/finance/FinanceDashboardPage';
import StudentDashboardPage from './components/student/StudentDashboardPage';
import StudentPortalPage from './components/student/StudentPortalPage';
import PasswordChangePage from './components/PasswordChangePage';
import type { Employee, User, AllPermissions, ModulePermissions, LeaveRequest, PayrollRecord, InventoryItem, Lab, Toner, MRF, LabSystem, AttendanceRecord, SupplyChainRequest, PurchaseRequest, Recipe, Vendor, PurchaseOrder, LeaveBalance, Task, ChatMessage, Note, TaskStatus, FinanceAccount, Voucher, FeeStructure, FeeChallan, FinanceExpense, VendorBill, FinanceFixedAsset, BankReconciliation, AuditLog, AcademicSession, DegreeProgram, CourseCatalog, AcademicPolicy, Applicant, Student, OfferedCourse, CourseRegistration, Classroom, TimetableEntry, StudentAttendance, CourseActivity, ExamSchedule, StudentMark, SemesterResult, StudentRequest, AcademicNotification } from './types';
import { db, auth } from './components/firebase-config';
import firebase from 'firebase/compat/app';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- State Initialization ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<AllPermissions>({});
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [toners, setToners] = useState<Toner[]>([]);
  const [mrfs, setMrfs] = useState<MRF[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [supplyChainRequests, setSupplyChainRequests] = useState<SupplyChainRequest[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Finance State
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [feeChallans, setFeeChallans] = useState<FeeChallan[]>([]);
  const [financeExpenses, setFinanceExpenses] = useState<FinanceExpense[]>([]);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [financeAssets, setFinanceAssets] = useState<FinanceFixedAsset[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Student State
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [degreePrograms, setDegreePrograms] = useState<DegreeProgram[]>([]);
  const [courseCatalog, setCourseCatalog] = useState<CourseCatalog[]>([]);
  const [academicPolicies, setAcademicPolicies] = useState<AcademicPolicy[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [offeredCourses, setOfferedCourses] = useState<OfferedCourse[]>([]);
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [courseActivities, setCourseActivities] = useState<CourseActivity[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [academicNotifications, setAcademicNotifications] = useState<AcademicNotification[]>([]);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email === 'admin@masbot.erp') setCurrentUser('admin');
        else setCurrentUser(user.email);
      } else {
        if (!isLoggedIn) {
          setCurrentUser(null);
          setSelectedModule(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isLoggedIn]);

  // --- Firebase Data Listeners ---
  useEffect(() => {
    if (!currentUser) { setEmployees([]); setUsers([]); return; }
    let unsubscribers: (() => void)[] = [];
    const initializeSystem = async () => {
        try {
            unsubscribers.push(db.collection("employees").onSnapshot((s) => setEmployees(s.docs.map(d => ({ ...d.data(), id: d.id } as Employee)))));
            unsubscribers.push(db.collection("users").onSnapshot((s) => setUsers(s.docs.map(d => ({ ...d.data(), id: d.id } as User)))));
            unsubscribers.push(db.collection("app_data").doc("permissions").onSnapshot((s) => {
                if (s.exists) setPermissions(s.data() as AllPermissions);
                else db.collection("app_data").doc("permissions").set({});
            }));
            unsubscribers.push(db.collection("leaveRequests").onSnapshot((s) => setLeaveRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as LeaveRequest)))));
            unsubscribers.push(db.collection("payrollHistory").onSnapshot((s) => {
                const history = s.docs.map(d => ({ ...d.data(), id: d.id } as PayrollRecord));
                history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setPayrollHistory(history);
            }));
            unsubscribers.push(db.collection("inventory").onSnapshot((s) => setInventory(s.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem)))));
            unsubscribers.push(db.collection("labs").onSnapshot((s) => setLabs(s.docs.map(d => ({ ...d.data(), id: d.id } as Lab)))));
            unsubscribers.push(db.collection("toners").onSnapshot((s) => setToners(s.docs.map(d => ({ ...d.data(), id: d.id } as Toner)))));
            unsubscribers.push(db.collection("mrfs").onSnapshot((s) => setMrfs(s.docs.map(d => ({ ...d.data(), id: d.id } as MRF)))));
            unsubscribers.push(db.collection("attendanceRecords").onSnapshot((s) => setAttendanceRecords(s.docs.map(d => ({ ...d.data(), id: d.id } as AttendanceRecord)))));
            unsubscribers.push(db.collection("supplyChainRequests").onSnapshot((s) => setSupplyChainRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as SupplyChainRequest)))));
            unsubscribers.push(db.collection("purchaseRequests").onSnapshot((s) => setPurchaseRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as PurchaseRequest)))));
            unsubscribers.push(db.collection("recipes").onSnapshot((s) => setRecipes(s.docs.map(d => ({ ...d.data(), id: d.id } as Recipe)))));
            unsubscribers.push(db.collection("vendors").onSnapshot((s) => setVendors(s.docs.map(d => ({ ...d.data(), id: d.id } as Vendor)))));
            unsubscribers.push(db.collection("purchaseOrders").onSnapshot((s) => setPurchaseOrders(s.docs.map(d => ({ ...d.data(), id: d.id } as PurchaseOrder)))));
            unsubscribers.push(db.collection("tasks").onSnapshot((s) => setTasks(s.docs.map(d => ({ ...d.data(), id: d.id } as Task)))));
            unsubscribers.push(db.collection("messages").onSnapshot((s) => setMessages(s.docs.map(d => ({ ...d.data(), id: d.id } as ChatMessage)))));
            unsubscribers.push(db.collection("notes").onSnapshot((s) => setNotes(s.docs.map(d => ({ ...d.data(), id: d.id } as Note)))));
            
            // Finance Listeners
            unsubscribers.push(db.collection("accounts").onSnapshot((s) => setAccounts(s.docs.map(d => ({ ...d.data(), id: d.id } as FinanceAccount)))));
            unsubscribers.push(db.collection("vouchers").onSnapshot((s) => setVouchers(s.docs.map(d => ({ ...d.data(), id: d.id } as Voucher)))));
            unsubscribers.push(db.collection("feeStructures").onSnapshot((s) => setFeeStructures(s.docs.map(d => ({ ...d.data(), id: d.id } as FeeStructure)))));
            unsubscribers.push(db.collection("feeChallans").onSnapshot((s) => setFeeChallans(s.docs.map(d => ({ ...d.data(), id: d.id } as FeeChallan)))));
            unsubscribers.push(db.collection("financeExpenses").onSnapshot((s) => setFinanceExpenses(s.docs.map(d => ({ ...d.data(), id: d.id } as FinanceExpense)))));
            unsubscribers.push(db.collection("vendorBills").onSnapshot((s) => setVendorBills(s.docs.map(d => ({ ...d.data(), id: d.id } as VendorBill)))));
            unsubscribers.push(db.collection("financeAssets").onSnapshot((s) => setFinanceAssets(s.docs.map(d => ({ ...d.data(), id: d.id } as FinanceFixedAsset)))));
            unsubscribers.push(db.collection("reconciliations").onSnapshot((s) => setReconciliations(s.docs.map(d => ({ ...d.data(), id: d.id } as BankReconciliation)))));
            unsubscribers.push(db.collection("auditLogs").orderBy("timestamp", "desc").limit(100).onSnapshot((s) => setAuditLogs(s.docs.map(d => ({ ...d.data(), id: d.id } as AuditLog)))));

            // Student Listeners
            unsubscribers.push(db.collection("academicSessions").onSnapshot((s) => setAcademicSessions(s.docs.map(d => ({ ...d.data(), id: d.id } as AcademicSession)))));
            unsubscribers.push(db.collection("degreePrograms").onSnapshot((s) => setDegreePrograms(s.docs.map(d => ({ ...d.data(), id: d.id } as DegreeProgram)))));
            unsubscribers.push(db.collection("courseCatalog").onSnapshot((s) => setCourseCatalog(s.docs.map(d => ({ ...d.data(), id: d.id } as CourseCatalog)))));
            unsubscribers.push(db.collection("academicPolicies").onSnapshot((s) => setAcademicPolicies(s.docs.map(d => ({ ...d.data(), id: d.id } as AcademicPolicy)))));
            unsubscribers.push(db.collection("applicants").onSnapshot((s) => setApplicants(s.docs.map(d => ({ ...d.data(), id: d.id } as Applicant)))));
            unsubscribers.push(db.collection("students").onSnapshot((s) => setStudents(s.docs.map(d => ({ ...d.data(), id: d.id } as Student)))));
            unsubscribers.push(db.collection("offeredCourses").onSnapshot((s) => setOfferedCourses(s.docs.map(d => ({ ...d.data(), id: d.id } as OfferedCourse)))));
            unsubscribers.push(db.collection("courseRegistrations").onSnapshot((s) => setRegistrations(s.docs.map(d => ({ ...d.data(), id: d.id } as CourseRegistration)))));
            unsubscribers.push(db.collection("classrooms").onSnapshot((s) => setClassrooms(s.docs.map(d => ({ ...d.data(), id: d.id } as Classroom)))));
            unsubscribers.push(db.collection("timetable").onSnapshot((s) => setTimetable(s.docs.map(d => ({ ...d.data(), id: d.id } as TimetableEntry)))));
            unsubscribers.push(db.collection("studentAttendance").onSnapshot((s) => setStudentAttendance(s.docs.map(d => ({ ...d.data(), id: d.id } as StudentAttendance)))));
            unsubscribers.push(db.collection("courseActivities").onSnapshot((s) => setCourseActivities(s.docs.map(d => ({ ...d.data(), id: d.id } as CourseActivity)))));
            unsubscribers.push(db.collection("examSchedules").onSnapshot((s) => setExamSchedules(s.docs.map(d => ({ ...d.data(), id: d.id } as ExamSchedule)))));
            unsubscribers.push(db.collection("studentMarks").onSnapshot((s) => setStudentMarks(s.docs.map(d => ({ ...d.data(), id: d.id } as StudentMark)))));
            unsubscribers.push(db.collection("semesterResults").onSnapshot((s) => setSemesterResults(s.docs.map(d => ({ ...d.data(), id: d.id } as SemesterResult)))));
            unsubscribers.push(db.collection("studentRequests").onSnapshot((s) => setStudentRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as StudentRequest)))));
            unsubscribers.push(db.collection("academicNotifications").orderBy("timestamp", "desc").onSnapshot((s) => setAcademicNotifications(s.docs.map(d => ({ ...d.data(), id: d.id } as AcademicNotification)))));

        } catch (error) { console.error("Firebase init failed", error); }
    };
    initializeSystem();
    return () => { unsubscribers.forEach(unsub => unsub()); };
  }, [currentUser]); 

  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    if (!password) return false;
    if (email === 'admin' && password === '123') { 
        setIsLoggedIn(true); 
        setCurrentUser('admin'); 
        return true; 
    }
    try {
        const snapshot = await db.collection("users").where("email", "==", email).get();
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            if (userData.password === password) {
                setIsLoggedIn(true);
                setCurrentUser(email);
                setShowPasswordChange(!!userData.passwordChangeRequired);
                
                // Logic to auto-select module if user only has 1 module access (Inventory)
                const userPermissions = permissions[email] || {};
                const modulesWithAccess = Object.keys(userPermissions).filter(modId => 
                    Object.values(userPermissions[modId]).some((p: any) => p.view)
                );
                
                if (modulesWithAccess.length === 1) {
                    setSelectedModule(modulesWithAccess[0]);
                } else if (modulesWithAccess.includes('inventory_management') && modulesWithAccess.length < 3) {
                    // Bias towards inventory if it's an IT person
                    setSelectedModule('inventory_management');
                }
                
                return true;
            }
        }
        return false;
    } catch (error: any) {
        console.error("Login error:", error);
        throw error;
    }
  };

  const handleLogout = async () => { try { await auth.signOut(); } catch (e) {} setIsLoggedIn(false); setCurrentUser(null); setSelectedModule(null); };

  const calculateProRataLeaveBalance = (joiningDate: string): LeaveBalance => {
    const join = new Date(joiningDate);
    const currentYear = new Date().getFullYear();
    const joinYear = join.getFullYear();
    const fullQuotas = { annual: { total: 14, used: 0 }, sick: { total: 7, used: 0 }, casual: { total: 6, used: 0 }, maternity: { total: 90, used: 0 }, paternity: { total: 7, used: 0 }, alternateDayOff: { total: 50, used: 0 }, others: { total: 0, used: 0 } };
    if (joinYear < currentYear) return fullQuotas;
    const joinMonth = join.getMonth();
    const ratio = (12 - joinMonth) / 12;
    return { annual: { total: Math.round(14 * ratio), used: 0 }, sick: { total: Math.round(7 * ratio), used: 0 }, casual: { total: Math.round(6 * ratio), used: 0 }, maternity: { total: 90, used: 0 }, paternity: { total: 7, used: 0 }, alternateDayOff: { total: Math.round(50 * ratio), used: 0 }, others: { total: 0, used: 0 } };
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>, password: string) => {
    const leaveBalance = employeeData.employmentType === 'Permanent' ? calculateProRataLeaveBalance(employeeData.joiningDate) : { annual: { total: 0, used: 0 }, sick: { total: 0, used: 0 }, casual: { total: 0, used: 0 }, maternity: { total: 0, used: 0 }, paternity: { total: 0, used: 0 }, alternateDayOff: { total: 0, used: 0 }, others: { total: 0, used: 0 } };
    const empDoc = await db.collection("employees").add({ ...employeeData, leaveBalance });
    await db.collection("users").doc(employeeData.email).set({ email: employeeData.email, password: password, passwordChangeRequired: false, employeeId: empDoc.id });
  };

  const handleUpdateEmployee = async (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => { 
      const empRef = db.collection('employees').doc(employeeId);
      if (updatedData.employmentType === 'Permanent') await empRef.update({ ...updatedData, leaveBalance: calculateProRataLeaveBalance(new Date().toISOString().split('T')[0]) });
      else await empRef.update(updatedData);
      return { success: true, message: "Employee updated successfully" }; 
  };
  const handleResignEmployee = async (id: string) => { await db.collection('employees').doc(id).update({ status: 'Resigned' }); return { success: true, message: "Employee marked as resigned." }; };
  
  // Hard delete handler for cleanup
  const handleDeleteEmployee = async (id: string) => { 
      await db.collection('employees').doc(id).delete();
      return { success: true, message: "Record deleted permanently." };
  };

  const handleUserPermissionsChange = async (userEmail: string, newUserPermissions: { [moduleId: string]: ModulePermissions }) => {
    await db.collection("app_data").doc("permissions").set({ ...permissions, [userEmail]: newUserPermissions });
  };
  const handleAddLeaveRequest = async (r: any) => { await db.collection("leaveRequests").add(r); };
  const handleLeaveRequestAction = async (requestId: string, action: 'Approve' | 'Reject') => {
    const reqRef = db.collection('leaveRequests').doc(requestId);
    const request = leaveRequests.find(r => r.id === requestId);
    if (action === 'Approve' && request) {
        if (request.status === 'Pending HOD') await reqRef.update({ status: 'Pending HR' });
        else {
            await reqRef.update({ status: 'Approved' });
            const days = Math.ceil(Math.abs(new Date(request.toDate).getTime() - new Date(request.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const typeKey = { 'Casual Leave': 'casual', 'Sick Leave': 'sick', 'Annual Leave': 'annual', 'Maternity Leave': 'maternity', 'Paternity Leave': 'paternity', 'Alternate Day Off': 'alternateDayOff', 'Others': 'others' }[request.leaveType] as keyof LeaveBalance;
            await db.collection('employees').doc(request.employeeId).update({ [`leaveBalance.${typeKey}.used`]: firebase.firestore.FieldValue.increment(days) });
        }
    } else await reqRef.update({ status: 'Rejected' });
  };
  const handleRunPayroll = async () => {
      const record: PayrollRecord = { id: '', date: new Date().toISOString(), monthYear: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), totalPayroll: 0, totalDeductions: 0, totalNetPay: 0, employeeRecords: employees.map(emp => ({ employeeId: emp.id, employeeName: `${emp.firstName} ${emp.lastName}`, department: emp.department, baseSalary: parseFloat(emp.salary), deductions: 0, netPay: parseFloat(emp.salary) })) };
      record.totalPayroll = record.employeeRecords.reduce((acc, curr) => acc + curr.baseSalary, 0);
      record.totalNetPay = record.employeeRecords.reduce((acc, curr) => acc + curr.netPay, 0);
      await db.collection("payrollHistory").add(record);
      return { success: true, message: "Payroll run successfully." };
  };
  const handleUploadAttendance = async (records: Omit<AttendanceRecord, 'id'>[]) => {
      const batch = db.batch();
      records.forEach(rec => batch.set(db.collection('attendanceRecords').doc(`${rec.employeeId}_${rec.date}`), rec));
      await batch.commit();
      return { success: true, message: "Attendance records uploaded." };
  };
  const handleAddNewAsset = async (a: any) => { const batch = db.batch(); a.forEach((asset: any) => batch.set(db.collection('inventory').doc(), asset)); await batch.commit(); };
  const handleUpdateAsset = async (asset: InventoryItem) => { const { id, ...data } = asset; await db.collection('inventory').doc(id).update(data); };
  const handleDeleteAsset = async (id: string) => { await db.collection('inventory').doc(id).delete(); };
  const handleAddSystem = async (labId: string, newSystemData: Omit<LabSystem, 'id'>) => { const lab = labs.find(l => l.id === labId); if (lab) await db.collection('labs').doc(labId).update({ systems: [...lab.systems, { ...newSystemData, id: `SYS-${Date.now()}` }] }); };
  const handleUpdateSystem = async (labId: string, updatedSystem: LabSystem) => { const lab = labs.find(l => l.id === labId); if (lab) await db.collection('labs').doc(labId).update({ systems: lab.systems.map(s => s.id === updatedSystem.id ? updatedSystem : s) }); };
  const handleDeleteSystem = async (labId: string, systemId: string) => { const lab = labs.find(l => l.id === labId); if (lab) await db.collection('labs').doc(labId).update({ systems: lab.systems.filter(s => s.id !== systemId) }); };
  const handleSaveTonerModel = async (data: any) => {
      const existing = toners.find(t => t.model === data.model);
      if (existing) await db.collection('toners').doc(existing.id).update({ quantity: data.filledQuantity + data.emptyQuantity, compatiblePrinters: data.compatiblePrinters }); 
      else {
          if (data.filledQuantity > 0) await db.collection('toners').add({ model: data.model, compatiblePrinters: data.compatiblePrinters, quantity: data.filledQuantity, status: 'Filled' });
          if (data.emptyQuantity > 0) await db.collection('toners').add({ model: data.model, compatiblePrinters: data.compatiblePrinters, quantity: data.emptyQuantity, status: 'Empty' });
      }
  };
  const onDeleteTonerModel = async (modelName: string) => { const batch = db.batch(); toners.filter(t => t.model === modelName).forEach(t => batch.delete(db.collection('toners').doc(t.id))); await batch.commit(); };
  const handleAddNewMRF = async (m: any) => { await db.collection('mrfs').add(m); };
  const handleUpdateMRF = async (mrf: MRF) => { const { id, ...data } = mrf; await db.collection('mrfs').doc(id).update(data); };
  const handleDeleteMRF = async (id: string) => { await db.collection('mrfs').doc(id).delete(); };
  const handleUpdateKitchenStock = async (items: { id: string, newQuantity: number }[]) => { const batch = db.batch(); items.forEach(item => batch.update(db.collection('inventory').doc(item.id), { quantity: item.newQuantity })); await batch.commit(); };
  const handleCreateSCRequest = async (req: Omit<SupplyChainRequest, 'id'>) => { await db.collection('supplyChainRequests').add({ ...req, status: 'Pending Account Manager' }); };
  const handleActionRequest = async (id: string, action: 'Approve' | 'Reject', reason?: string) => {
      const request = supplyChainRequests.find(r => r.id === id);
      const updates: any = { status: action === 'Approve' ? (request?.department === 'Store' ? 'Forwarded to Purchase' : 'Pending Store') : 'Rejected', approvalDate: new Date().toISOString() };
      if (reason) updates.rejectionReason = reason;
      await db.collection('supplyChainRequests').doc(id).update(updates);
  };
  const handleIssueRequest = async (id: string) => {
      const request = supplyChainRequests.find(r => r.id === id); if (!request) throw new Error("Request not found");
      const batch = db.batch();
      batch.update(db.collection('supplyChainRequests').doc(id), { status: 'Issued', issuedDate: new Date().toISOString() });
      request.items.forEach(item => { if (item.inventoryId && item.inventoryId.trim() !== '') batch.update(db.collection('inventory').doc(item.inventoryId), { quantity: firebase.firestore.FieldValue.increment(-item.quantityRequested) }); });
      await batch.commit();
  };
  const handleForwardToPurchase = async (id: string) => { await db.collection('supplyChainRequests').doc(id).update({ status: 'Forwarded to Purchase' }); };
  const handleCreatePurchaseRequest = async (r: any) => { await db.collection('purchaseRequests').add(r); };
  const handleCreatePO = async (po: Omit<PurchaseOrder, 'id'>) => { await db.collection('purchaseOrders').add({ ...po, status: 'Pending Account Manager' }); };
  const handleUpdatePO = async (id: string, u: any) => { await db.collection('purchaseOrders').doc(id).update(u); };
  const handleDeletePO = async (id: string) => { await db.collection('purchaseOrders').doc(id).delete(); };
  const handlePOAction = async (id: string, a: any) => { await db.collection('purchaseOrders').doc(id).update({ status: a === 'Approve' ? 'Approved' : 'Rejected' }); };
  const handleGRN = async (id: string, d: { grnNumber: string, remarks: string }) => {
      const po = purchaseOrders.find(p => p.id === id); if (!po) return;
      const batch = db.batch();
      batch.update(db.collection('purchaseOrders').doc(id), { status: 'Received', grnNumber: d.grnNumber, grnRemarks: d.remarks, grnDate: new Date().toISOString() });
      po.items.forEach(item => { if (item.inventoryId) batch.update(db.collection('inventory').doc(item.inventoryId), { quantity: firebase.firestore.FieldValue.increment(item.quantity) }); });
      if (po.originalRequestId) batch.update(db.collection('supplyChainRequests').doc(po.originalRequestId), { status: 'Pending Store' });
      await batch.commit();
  };
  const handleIssueAsset = async (assetId: string, employeeName: string) => {
      const employee = employees.find(e => `${e.firstName} ${e.lastName}` === employeeName);
      if (!employee) throw new Error("Employee not found");
      await db.collection('inventory').doc(assetId).update({ status: 'In Use', assignedTo: employeeName, department: employee.department, designation: employee.designation, issueDate: new Date().toISOString().split('T')[0] });
  };
  const handleReturnAsset = async (assetId: string) => {
      await db.collection('inventory').doc(assetId).update({ status: 'In Stock', assignedTo: '', department: '', designation: '', issueDate: '' });
  };
  const handleAddRecipe = async (r: any) => { await db.collection('recipes').add(r); };
  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => { await db.collection('tasks').add({ ...taskData, history: [{ action: 'Created', by: currentUser || 'Unknown', timestamp: new Date().toISOString(), details: `Task created with status ${taskData.status}` }] }); };
  const handleTaskWorkflowAction = async (taskId: string, newStatus: TaskStatus, action: string, remarks?: string) => {
      const timestamp = new Date().toISOString();
      const updateData: any = { status: newStatus, history: firebase.firestore.FieldValue.arrayUnion({ action, by: currentUser || 'Unknown', timestamp, details: remarks ? `${action}: ${remarks}` : `Status changed to ${newStatus}` }) };
      if (remarks) { if (newStatus === 'Completed - Pending Review') { updateData.completionRemarks = remarks; updateData.completedDate = timestamp; } else if (newStatus === 'Reopened') updateData.rejectionRemarks = remarks; }
      if (newStatus === 'Closed') updateData.completedDate = timestamp;
      await db.collection('tasks').doc(taskId).update(updateData);
  };
  const handleDeleteTask = async (taskId: string) => { await db.collection('tasks').doc(taskId).delete(); };
  const handleSendMessage = async (msg: Omit<ChatMessage, 'id'>) => { const cleanMsg = JSON.parse(JSON.stringify(msg)); await db.collection('messages').add(cleanMsg); };
  const handleAddNote = async (note: Omit<Note, 'id'>) => { await db.collection('notes').add(note); };
  const handleDeleteNote = async (id: string) => { await db.collection('notes').doc(id).delete(); };
  
  // Finance Handlers
  const handleAddAccount = async (a: Omit<FinanceAccount, 'id'>) => { await db.collection("accounts").add(a); };
  const handleUpdateAccount = async (id: string, a: Partial<FinanceAccount>) => { await db.collection("accounts").doc(id).update(a); };
  const handleDeleteAccount = async (id: string) => { await db.collection("accounts").doc(id).delete(); };
  const handlePostVoucher = async (v: Omit<Voucher, 'id'>) => {
      const batch = db.batch();
      const vDoc = db.collection("vouchers").doc();
      batch.set(vDoc, { ...v, status: 'Posted' });
      
      // Audit Log
      const logDoc = db.collection("auditLogs").doc();
      batch.set(logDoc, {
          timestamp: new Date().toISOString(),
          userEmail: currentUser || 'system',
          action: 'POST_VOUCHER',
          module: 'finance',
          details: `Voucher ${v.voucherNumber} posted for amount ${v.totalAmount}`
      });

      // Update Account Balances
      v.entries.forEach(entry => {
          const accRef = db.collection("accounts").doc(entry.accountId);
          const account = accounts.find(a => a.id === entry.accountId);
          if (account) {
              const amount = entry.amount;
              const isIncreaseType = ['Asset', 'Expense'].includes(account.type);
              const change = entry.type === 'Debit' ? (isIncreaseType ? amount : -amount) : (isIncreaseType ? -amount : amount);
              batch.update(accRef, { balance: firebase.FieldValue.increment(change) });
          }
      });
      await batch.commit();
  };

  // Fees, Expenses, Payables Handlers
  const handleAddFeeStructure = async (f: Omit<FeeStructure, 'id'>) => { await db.collection("feeStructures").add(f); };
  const handleUpdateFeeStructure = async (id: string, f: Partial<FeeStructure>) => { await db.collection("feeStructures").doc(id).update(f); };
  const handleDeleteFeeStructure = async (id: string) => { await db.collection("feeStructures").doc(id).delete(); };
  const handleIssueChallan = async (c: Omit<FeeChallan, 'id'>) => { await db.collection("feeChallans").add(c); };
  const handleCollectFee = async (challanId: string, amount: number) => {
      const challan = feeChallans.find(c => c.id === challanId);
      if (challan) {
          const newPaid = challan.paidAmount + amount;
          const status = newPaid >= challan.totalAmount ? 'Paid' : 'Partial';
          await db.collection("feeChallans").doc(challanId).update({ paidAmount: newPaid, status, paymentDate: new Date().toISOString() });
          
          // Generate Receipt Voucher automatically
          const incomeAccount = accounts.find(a => a.name.toLowerCase().includes('fee') && a.type === 'Income');
          const cashAccount = accounts.find(a => a.name.toLowerCase().includes('cash') && a.type === 'Asset');
          if (incomeAccount && cashAccount) {
              await handlePostVoucher({
                  voucherNumber: `RV-${Date.now().toString().slice(-6)}`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'Receipt',
                  totalAmount: amount,
                  description: `Fee collection for ${challan.studentName} - ${challan.challanNumber}`,
                  status: 'Posted',
                  createdBy: currentUser || 'system',
                  entries: [
                      { accountId: cashAccount.id, accountName: cashAccount.name, type: 'Debit', amount },
                      { accountId: incomeAccount.id, accountName: incomeAccount.name, type: 'Credit', amount }
                  ]
              });
          }
      }
  };

  const handleAddFinanceExpense = async (e: Omit<FinanceExpense, 'id'>) => { await db.collection("financeExpenses").add(e); };
  const handleActionExpense = async (id: string, action: 'Approve' | 'Paid') => {
      const expense = financeExpenses.find(e => e.id === id);
      if (!expense) return;
      if (action === 'Approve') {
          await db.collection("financeExpenses").doc(id).update({ status: 'Approved', approvedBy: currentUser || 'system' });
      } else if (action === 'Paid') {
          // Finalize Payment
          await db.collection("financeExpenses").doc(id).update({ status: 'Paid' });
          // Post Voucher
          const expenseAcc = accounts.find(a => a.type === 'Expense' && a.name.toLowerCase().includes(expense.category.toLowerCase()));
          const cashAcc = accounts.find(a => a.type === 'Asset' && a.name.toLowerCase().includes('cash'));
          if (expenseAcc && cashAcc) {
              await handlePostVoucher({
                  voucherNumber: `PV-${Date.now().toString().slice(-6)}`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'Payment',
                  totalAmount: expense.amount,
                  description: `Expense Payment: ${expense.description}`,
                  status: 'Posted',
                  createdBy: currentUser || 'system',
                  entries: [
                      { accountId: expenseAcc.id, accountName: expenseAcc.name, type: 'Debit', amount: expense.amount },
                      { accountId: cashAcc.id, accountName: cashAcc.name, type: 'Credit', amount: expense.amount }
                  ]
              });
          }
      }
  };

  const handleAddVendorBill = async (b: Omit<VendorBill, 'id'>) => { await db.collection("vendorBills").add(b); };
  const handlePayVendorBill = async (billId: string, amount: number) => {
      const bill = vendorBills.find(b => b.id === billId);
      if (bill) {
          const newPaid = bill.paidAmount + amount;
          const status = newPaid >= bill.totalAmount ? 'Paid' : 'Partial';
          await db.collection("vendorBills").doc(billId).update({ paidAmount: newPaid, status });
          
          // Generate Payment Voucher
          const payableAcc = accounts.find(a => a.type === 'Liability' && a.name.toLowerCase().includes('payable'));
          const cashAcc = accounts.find(a => a.type === 'Asset' && a.name.toLowerCase().includes('cash'));
          if (payableAcc && cashAcc) {
              await handlePostVoucher({
                  voucherNumber: `PV-${Date.now().toString().slice(-6)}`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'Payment',
                  totalAmount: amount,
                  description: `Vendor payment to ${bill.vendorName} for Bill #${bill.billNumber}`,
                  status: 'Posted',
                  createdBy: currentUser || 'system',
                  entries: [
                      { accountId: payableAcc.id, accountName: payableAcc.name, type: 'Debit', amount },
                      { accountId: cashAcc.id, accountName: cashAcc.name, type: 'Credit', amount }
                  ]
              });
          }
      }
  };

  // Fixed Asset Handlers
  const handleAddFinanceAsset = async (a: Omit<FinanceFixedAsset, 'id'>) => { await db.collection("financeAssets").add(a); };
  const handleDisposeAsset = async (id: string, value: number) => {
      await db.collection("financeAssets").doc(id).update({ status: 'Disposed', disposalDate: new Date().toISOString(), disposalValue: value });
  };
  const handleReconcile = async (r: Omit<BankReconciliation, 'id'>) => { await db.collection("reconciliations").add(r); };
  
  // Payroll Posting
  const handlePostPayrollToFinance = async (payrollId: string) => {
      const record = payrollHistory.find(r => r.id === payrollId);
      if (!record) return;
      
      const salaryExpAcc = accounts.find(a => a.type === 'Expense' && a.name.toLowerCase().includes('salary'));
      const cashAcc = accounts.find(a => a.type === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')));
      
      if (salaryExpAcc && cashAcc) {
          await handlePostVoucher({
              voucherNumber: `JV-PAY-${Date.now().toString().slice(-4)}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Journal',
              totalAmount: record.totalNetPay,
              description: `Monthly Payroll for ${record.monthYear}`,
              status: 'Posted',
              createdBy: currentUser || 'system',
              entries: [
                  { accountId: salaryExpAcc.id, accountName: salaryExpAcc.name, type: 'Debit', amount: record.totalNetPay },
                  { accountId: cashAcc.id, accountName: cashAcc.name, type: 'Credit', amount: record.totalNetPay }
              ]
          });
          await db.collection("payrollHistory").doc(payrollId).update({ isPostedToFinance: true });
      }
  };

  // Student Module Handlers
  const handleAddAcademicSession = async (s: Omit<AcademicSession, 'id'>) => { await db.collection("academicSessions").add(s); };
  const handleAddDegreeProgram = async (p: Omit<DegreeProgram, 'id'>) => { await db.collection("degreePrograms").add(p); };
  const handleAddCourse = async (c: Omit<CourseCatalog, 'id'>) => { await db.collection("courseCatalog").add(c); };
  const handleAddPolicy = async (p: Omit<AcademicPolicy, 'id'>) => { await db.collection("academicPolicies").add(p); };
  const handleAddApplicant = async (a: Omit<Applicant, 'id'>) => { await db.collection("applicants").add(a); };
  const handleAdmitStudent = async (applicantId: string, s: Omit<Student, 'id'>, password: string) => {
      const batch = db.batch();
      const sRef = db.collection("students").doc();
      batch.set(sRef, s);
      batch.update(db.collection("applicants").doc(applicantId), { status: 'Admitted' });
      batch.set(db.collection("users").doc(s.userId), { email: s.userId, password, passwordChangeRequired: true });
      await batch.commit();
  };
  const handleOfferCourse = async (c: Omit<OfferedCourse, 'id' | 'currentEnrollment'>) => { await db.collection("offeredCourses").add({ ...c, currentEnrollment: 0 }); };
  const handleRegisterStudent = async (reg: Omit<CourseRegistration, 'id' | 'registrationDate' | 'status'>) => {
      const batch = db.batch();
      const regRef = db.collection("courseRegistrations").doc();
      batch.set(regRef, { ...reg, registrationDate: new Date().toISOString(), status: 'Pending' });
      batch.update(db.collection("offeredCourses").doc(reg.offeredCourseId), { currentEnrollment: firebase.firestore.FieldValue.increment(1) });
      await batch.commit();
  };
  const handleAddClassroom = async (c: Omit<Classroom, 'id'>) => { await db.collection("classrooms").add(c); };
  const handleAddTimetableEntry = async (e: Omit<TimetableEntry, 'id'>) => { await db.collection("timetable").add(e); };
  const handleMarkStudentAttendance = async (records: Omit<StudentAttendance, 'id'>[]) => {
      const batch = db.batch();
      records.forEach(r => batch.set(db.collection("studentAttendance").doc(), r));
      await batch.commit();
  };
  const handleAddCourseActivity = async (a: Omit<CourseActivity, 'id'>) => { await db.collection("courseActivities").add(a); };
  const handleAddExamSchedule = async (e: Omit<ExamSchedule, 'id'>) => { await db.collection("examSchedules").add(e); };
  
  const handleSaveStudentMarks = async (marks: Omit<StudentMark, 'id' | 'status' | 'entryDate'>[]) => {
      const batch = db.batch();
      marks.forEach(m => {
          const mRef = db.collection("studentMarks").doc(`${m.studentId}_${m.offeredCourseId}`);
          batch.set(mRef, { ...m, status: 'Saved', entryDate: new Date().toISOString() });
      });
      await batch.commit();
  };
  const handlePublishResults = async (sessionId: string) => {
      const q = await db.collection("studentMarks").get();
      const batch = db.batch();
      q.docs.forEach(doc => {
          const data = doc.data() as StudentMark;
          const offer = offeredCourses.find(o => o.id === data.offeredCourseId);
          if (offer && offer.sessionId === sessionId) {
              batch.update(doc.ref, { status: 'Published' });
          }
      });
      await batch.commit();
  };

  const handleActionStudentRequest = async (id: string, action: 'In Review' | 'Approved' | 'Rejected', remarks?: string) => {
      await db.collection("studentRequests").doc(id).update({
          status: action,
          remarks: remarks || '',
          approvalDate: action === 'Approved' ? new Date().toISOString() : null
      });
  };
  const handlePostNotification = async (n: Omit<AcademicNotification, 'id'>) => { await db.collection("academicNotifications").add(n); };

  const handleUpdatePassword = async (newPassword: string) => {
      const q = await db.collection("users").where("email", "==", currentUser === 'admin' ? 'admin' : currentUser).get();
      if (!q.empty) { await db.collection("users").doc(q.docs[0].id).update({ password: newPassword, passwordChangeRequired: false }); setShowPasswordChange(false); return { success: true, message: "Password updated" }; }
      return { success: false, message: "User record not found" };
  };

  const accessibleModules = React.useMemo(() => {
      if (currentUser === 'admin') return ['hr', 'inventory_management', 'supply_chain', 'finance', 'student', 'website', 'task_manager'];
      if (!currentUser || !permissions[currentUser]) return [];
      return Object.keys(permissions[currentUser]).filter(moduleId => Object.values(permissions[currentUser][moduleId]).some((page: any) => page.view));
  }, [currentUser, permissions]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">System loading ho raha hai...</div>;
  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
  if (showPasswordChange) return <PasswordChangePage onUpdatePassword={handleUpdatePassword} onSkip={() => setShowPasswordChange(false)} />;

  // --- STUDENT PORTAL LOGIC ---
  const currentStudent = students.find(s => s.userId === currentUser);
  if (currentStudent && currentUser !== 'admin') {
      return <StudentPortalPage 
        student={currentStudent} 
        onLogout={handleLogout} 
        courses={courseCatalog} 
        offeredCourses={offeredCourses} 
        registrations={registrations} 
        attendance={studentAttendance} 
        marks={studentMarks} 
        timetable={timetable} 
        exams={examSchedules} 
        notifications={academicNotifications}
        feeChallans={feeChallans}
        programs={degreePrograms}
        classrooms={classrooms}
      />;
  }

  if (selectedModule) {
    switch (selectedModule) {
      case 'hr': return <HrDashboardPage onBack={() => setSelectedModule(null)} employees={employees} users={users} onAddEmployee={handleAddEmployee} onLogout={handleLogout} allPermissions={permissions} onUserPermissionsChange={handleUserPermissionsChange} currentUserEmail={currentUser || ''} leaveRequests={leaveRequests} onAddLeaveRequest={handleAddLeaveRequest} onLeaveRequestAction={handleLeaveRequestAction} onResignEmployee={handleResignEmployee} onDeleteEmployee={handleDeleteEmployee} payrollHistory={payrollHistory} onRunPayroll={handleRunPayroll} onUpdateEmployee={handleUpdateEmployee} attendanceRecords={attendanceRecords} onUploadAttendance={handleUploadAttendance} />;
      case 'inventory_management': return <InventoryDashboardPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} permissions={permissions[currentUser || '']?.['inventory_management']} inventory={inventory} employees={employees} labs={labs} toners={toners} mrfs={mrfs} recipes={recipes} onAddNewAsset={handleAddNewAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset} onResignEmployee={() => {}} onAddSystem={handleAddSystem} onUpdateSystem={handleUpdateSystem} onDeleteSystem={handleDeleteSystem} onSaveTonerModel={handleSaveTonerModel} onDeleteTonerModel={onDeleteTonerModel} onMarkTonerEmpty={()=>{}} onMarkTonerFilled={()=>{}} onAddNewMRF={handleAddNewMRF} onUpdateMRF={handleUpdateMRF} onDeleteMRF={handleDeleteMRF} onUpdateKitchenStock={handleUpdateKitchenStock} onCreateSCRequest={handleCreateSCRequest} />;
      case 'supply_chain': return <SupplyChainDashboardPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} inventory={inventory} employees={employees} requests={supplyChainRequests} purchaseRequests={purchaseRequests} purchaseOrders={purchaseOrders} recipes={recipes} vendors={vendors} onCreateRequest={handleCreateSCRequest} onActionRequest={handleActionRequest} onIssueRequest={handleIssueRequest} onForwardToPurchase={handleForwardToPurchase} onCreatePurchaseRequest={handleCreatePurchaseRequest} onCreatePO={handleCreatePO} onUpdatePO={handleUpdatePO} onDeletePO={handleDeletePO} onPOAction={handlePOAction} onGRN={handleGRN} onAddNewAsset={handleAddNewAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset} onIssueAsset={handleIssueAsset} onReturnAsset={handleReturnAsset} />;
      case 'task_manager': return <TaskManagerPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} tasks={tasks} employees={employees} onCreateTask={handleCreateTask} onTaskWorkflowAction={handleTaskWorkflowAction} onDeleteTask={handleDeleteTask} messages={messages} onSendMessage={handleSendMessage} notes={notes} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />;
      case 'finance': return <FinanceDashboardPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} accounts={accounts} vouchers={vouchers} onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onDeleteAccount={handleDeleteAccount} onPostVoucher={handlePostVoucher} permissions={permissions[currentUser || '']?.['finance']} feeStructures={feeStructures} onAddFeeStructure={handleAddFeeStructure} onUpdateFeeStructure={handleUpdateFeeStructure} onDeleteFeeStructure={handleDeleteFeeStructure} feeChallans={feeChallans} onIssueChallan={handleIssueChallan} onCollectFee={handleCollectFee} financeExpenses={financeExpenses} onAddExpense={handleAddFinanceExpense} onActionExpense={handleActionExpense} vendorBills={vendorBills} onAddVendorBill={handleAddVendorBill} onPayVendorBill={handlePayVendorBill} vendors={vendors} financeAssets={financeAssets} onAddFinanceAsset={handleAddFinanceAsset} onDisposeAsset={handleDisposeAsset} reconciliations={reconciliations} onReconcile={handleReconcile} payrollHistory={payrollHistory} onPostPayroll={handlePostPayrollToFinance} auditLogs={auditLogs} />;
      case 'student': return <StudentDashboardPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} permissions={permissions[currentUser || '']?.['student']} sessions={academicSessions} programs={degreePrograms} courses={courseCatalog} policies={academicPolicies} applicants={applicants} students={students} offeredCourses={offeredCourses} registrations={registrations} employees={employees} classrooms={classrooms} timetable={timetable} studentAttendance={studentAttendance} courseActivities={courseActivities} examSchedules={examSchedules} studentMarks={studentMarks} studentRequests={studentRequests} academicNotifications={academicNotifications} onAddSession={handleAddAcademicSession} onAddProgram={handleAddDegreeProgram} onAddCourse={handleAddCourse} onAddPolicy={handleAddPolicy} onAddApplicant={handleAddApplicant} onAdmitStudent={handleAdmitStudent} onOfferCourse={handleOfferCourse} onRegisterStudent={handleRegisterStudent} onAddClassroom={handleAddClassroom} onAddTimetableEntry={handleAddTimetableEntry} onMarkAttendance={handleMarkStudentAttendance} onAddActivity={handleAddCourseActivity} onAddExamSchedule={handleAddExamSchedule} onSaveMarks={handleSaveStudentMarks} onPublishResults={handlePublishResults} onActionRequest={handleActionStudentRequest} onPostNotification={handlePostNotification} />;
      default: return <div className="flex h-screen items-center justify-center flex-col gap-4"><p>Module tayyar ho raha hai</p><button onClick={() => setSelectedModule(null)} className="text-blue-900 underline">Go Back</button></div>;
    }
  }

  const currentEmployee = employees.find(e => e.email === currentUser);
  if (currentEmployee && currentEmployee.role === 'Employee' && currentUser !== 'admin') return <EmployeeDashboard employee={currentEmployee} onModuleSelect={setSelectedModule} onLogout={handleLogout} accessibleModules={accessibleModules} />;
  return <DashboardPage onModuleSelect={setSelectedModule} onLogout={handleLogout} accessibleModules={currentUser === 'admin' ? undefined : accessibleModules} />;
};

export default App;
