
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import HrDashboardPage from './components/hr/HrDashboardPage';
import InventoryDashboardPage from './components/InventoryDashboardPage';
import SupplyChainDashboardPage from './components/SupplyChainDashboardPage';
import TaskManagerPage from './components/task_manager/TaskManagerPage';
import PasswordChangePage from './components/PasswordChangePage';
import type { Employee, User, AllPermissions, ModulePermissions, LeaveRequest, PayrollRecord, InventoryItem, Lab, Toner, MRF, LabSystem, AttendanceRecord, SupplyChainRequest, PurchaseRequest, Recipe, Vendor, PurchaseOrder, LeaveBalance, Task, ChatMessage, Note, TaskStatus } from './types';
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

  // --- One-Time Seeding Logic ---
  useEffect(() => {
    if (isLoggedIn && currentUser === 'admin' && inventory.length === 0) {
        const seedKitchenInventory = async () => {
            const items = [
                // Consumables (Ingredients)
                {itemCode: "CON-101", model: "Tomatoes", itemName: "Tomatoes", type: "Kitchen", subCategory: "Vegetables", brand: "Local Vendor", quantity: 30, unit: "Kg", condition: "Fresh", status: "In Stock", assignedTo: "", location: "Kitchen Store", purchaseDate: "2024-03-01", cost: "150", remarks: "Fresh stock"},
                {itemCode: "CON-102", model: "Onions", itemName: "Onions", type: "Kitchen", subCategory: "Vegetables", brand: "Local Vendor", quantity: 40, unit: "Kg", condition: "Good", status: "In Stock", assignedTo: "", location: "Kitchen Store", purchaseDate: "2024-03-01", cost: "80", remarks: ""},
                {itemCode: "CON-103", model: "Fine Flour", itemName: "Fine Flour", type: "Kitchen", subCategory: "Bakery", brand: "Local Vendor", quantity: 100, unit: "kg", condition: "Good", status: "In Stock", assignedTo: "", location: "Store Room", purchaseDate: "2024-02-25", cost: "1200", remarks: "Dry storage"},
                
                // FIXED ASSETS (KITCHEN EQUIPMENT)
                {itemCode: "KFA-001", model: "Industrial Pizza Oven", itemName: "Pizza Oven XL", type: "Kitchen", subCategory: "Cooking Equipment", brand: "Rational", material: "Stainless Steel", quantity: 1, unit: "Pcs", condition: "Excellent", status: "In Stock", assignedTo: "", location: "Main Kitchen", purchaseDate: "2023-05-12", cost: "450,000", remarks: "Serviced monthly"},
                {itemCode: "KFA-002", model: "20L Dough Mixer", itemName: "Planetary Mixer", type: "Kitchen", subCategory: "Bakery Tools", brand: "Hobart", material: "Cast Iron/Steel", quantity: 2, unit: "Pcs", condition: "Good", status: "In Use", assignedTo: "Chef Ahmed", location: "Bakery Lab", purchaseDate: "2023-01-20", cost: "185,000", remarks: "Heavy duty"},
                {itemCode: "KFA-003", model: "Commercial Deep Fridge", itemName: "Vertical Chiller", type: "Kitchen", subCategory: "Refrigeration", brand: "Haier", material: "Aluminum/Fiber", quantity: 1, unit: "Pcs", condition: "New", status: "In Stock", assignedTo: "", location: "Storage Area", purchaseDate: "2024-02-15", cost: "120,000", remarks: "Warranty active"},
                {itemCode: "KFA-004", model: "4-Burner Range", itemName: "Cooking Range", type: "Kitchen", subCategory: "Cooking Equipment", brand: "Super Asia", material: "Metal/Brass", quantity: 3, unit: "Pcs", condition: "Good", status: "In Use", assignedTo: "Chef Maria", location: "Main Kitchen", purchaseDate: "2022-11-05", cost: "85,000", remarks: "Needs igniter check"},
                {itemCode: "KFA-005", model: "Stainless Prep Table", itemName: "Work Station", type: "Kitchen", subCategory: "Furniture", brand: "Custom Fabrication", material: "Stainless Steel 304", quantity: 4, unit: "Pcs", condition: "Good", status: "In Stock", assignedTo: "", location: "Prep Lab", purchaseDate: "2023-06-30", cost: "45,000", remarks: "Sanitary grade"}
            ];
            const batch = db.batch();
            items.forEach(item => { const ref = db.collection('inventory').doc(); batch.set(ref, item); });
            await batch.commit();
        };
        seedKitchenInventory();
    }
  }, [isLoggedIn, currentUser, inventory.length]);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email === 'admin@masbot.erp') setCurrentUser('admin');
        else setCurrentUser(user.email);
      } else {
<<<<<<< HEAD
        // Only reset if we are definitely not logged in via custom firestore flow
=======
>>>>>>> 5e85b2f (Move build files to root folder)
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
            unsubscribers.push(db.collection("payrollHistory").where("date", "!=", null).onSnapshot((s) => {
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
        } catch (error) { console.error("Firebase init failed", error); }
    };
    initializeSystem();
    return () => { unsubscribers.forEach(unsub => unsub()); };
  }, [currentUser]); 

  // --- Helpers ---
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

  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    if (!password) return false;
<<<<<<< HEAD
    
    // 1. Hardcoded admin check
    if (email === 'admin' && password === '123') {
        setIsLoggedIn(true);
        setCurrentUser('admin');
        return true;
    }

    try {
        // 2.Source of Truth: Verify against Firestore "users" collection first
        // This bypasses Firebase Auth service configuration issues
        const snapshot = await db.collection("users").where("email", "==", email).get();
        
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            if (userData.password === password) {
                // Successful database verification
                setIsLoggedIn(true);
                setCurrentUser(email);
                setShowPasswordChange(!!userData.passwordChangeRequired);
                
                // Optional: Attempt Firebase Auth sync in background if available
                const authEmail = email.includes('@') ? email : `${email}@masbot.erp`;
                try {
                    await auth.signInWithEmailAndPassword(authEmail, password.length >= 6 ? password : `${password}fallback`);
                } catch (e) {
                    console.warn("Background Firebase Auth sync skipped or unavailable.");
                }
                
                return true;
            }
        }

        // 3. Optional fallback to official Auth service if Firestore user not found
        // But wrapped to handle configuration-not-found gracefully
=======
    if (email === 'admin' && password === '123') { setIsLoggedIn(true); setCurrentUser('admin'); return true; }
    try {
        const snapshot = await db.collection("users").where("email", "==", email).get();
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            if (userData.password === password) {
                setIsLoggedIn(true);
                setCurrentUser(email);
                setShowPasswordChange(!!userData.passwordChangeRequired);
                const authEmail = email.includes('@') ? email : `${email}@masbot.erp`;
                try { await auth.signInWithEmailAndPassword(authEmail, password.length >= 6 ? password : `${password}fallback`); } catch (e) { console.warn("Firebase Auth sync skipped."); }
                return true;
            }
        }
>>>>>>> 5e85b2f (Move build files to root folder)
        try {
            await auth.signInWithEmailAndPassword(email, password);
            setIsLoggedIn(true);
            setCurrentUser(email);
            return true;
        } catch (authError: any) {
<<<<<<< HEAD
            if (authError.code === 'auth/configuration-not-found') {
                console.error("Firebase Auth is not enabled in console. Please use 'admin' / '123' or ensure user exists in Firestore.");
            }
            throw authError;
        }

=======
            if (authError.code === 'auth/configuration-not-found') console.error("Firebase Auth not enabled.");
            throw authError;
        }
>>>>>>> 5e85b2f (Move build files to root folder)
    } catch (error: any) {
        console.error("Login process error:", error);
        throw error;
    }
  };

<<<<<<< HEAD
  const handleLogout = async () => { 
      try { await auth.signOut(); } catch (e) {}
      setIsLoggedIn(false); 
      setCurrentUser(null); 
      setSelectedModule(null); 
  };
=======
  const handleLogout = async () => { try { await auth.signOut(); } catch (e) {} setIsLoggedIn(false); setCurrentUser(null); setSelectedModule(null); };
>>>>>>> 5e85b2f (Move build files to root folder)

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>, password: string) => {
    const leaveBalance = employeeData.employmentType === 'Permanent' ? calculateProRataLeaveBalance(employeeData.joiningDate) : { annual: { total: 0, used: 0 }, sick: { total: 0, used: 0 }, casual: { total: 0, used: 0 }, maternity: { total: 0, used: 0 }, paternity: { total: 0, used: 0 }, alternateDayOff: { total: 0, used: 0 }, others: { total: 0, used: 0 } };
    const empDoc = await db.collection("employees").add({ ...employeeData, leaveBalance });
    await db.collection("users").doc(employeeData.email).set({ email: employeeData.email, password: password, passwordChangeRequired: true, employeeId: empDoc.id });
  };

  const handleUpdateEmployee = async (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => { 
      const empRef = db.collection('employees').doc(employeeId);
      if (updatedData.employmentType === 'Permanent') await empRef.update({ ...updatedData, leaveBalance: calculateProRataLeaveBalance(new Date().toISOString().split('T')[0]) });
      else await empRef.update(updatedData);
      return { success: true, message: "Employee updated successfully" }; 
  };
  const handleResignEmployee = async (id: string) => { await db.collection('employees').doc(id).update({ status: 'Resigned' }); return { success: true, message: "Employee marked as resigned." }; };
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
<<<<<<< HEAD
      const reqRef = db.collection('supplyChainRequests').doc(id);
      
      batch.update(reqRef, { status: 'Issued', issuedDate: new Date().toISOString() });
      
      request.items.forEach(item => { 
          if (item.inventoryId && item.inventoryId.trim() !== '') { 
              const invRef = db.collection('inventory').doc(item.inventoryId); 
              batch.update(invRef, { quantity: firebase.firestore.FieldValue.increment(-item.quantityRequested) }); 
          } 
      });
      
      await batch.commit();
      return;
=======
      batch.update(db.collection('supplyChainRequests').doc(id), { status: 'Issued', issuedDate: new Date().toISOString() });
      request.items.forEach(item => { if (item.inventoryId && item.inventoryId.trim() !== '') batch.update(db.collection('inventory').doc(item.inventoryId), { quantity: firebase.firestore.FieldValue.increment(-item.quantityRequested) }); });
      await batch.commit();
>>>>>>> 5e85b2f (Move build files to root folder)
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

  // --- FIXED ASSET HANDLERS FOR SUPPLY CHAIN ---
  const handleIssueAsset = async (assetId: string, employeeName: string) => {
      const employee = employees.find(e => `${e.firstName} ${e.lastName}` === employeeName);
      if (!employee) throw new Error("Employee not found");
      await db.collection('inventory').doc(assetId).update({
          status: 'In Use',
          assignedTo: employeeName,
          department: employee.department,
          designation: employee.designation,
          issueDate: new Date().toISOString().split('T')[0]
      });
  };

  const handleReturnAsset = async (assetId: string) => {
      await db.collection('inventory').doc(assetId).update({
          status: 'In Stock',
          assignedTo: '',
          department: '',
          designation: '',
          issueDate: ''
      });
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
  
  const handleSendMessage = async (msg: Omit<ChatMessage, 'id'>) => { 
      const cleanMsg = JSON.parse(JSON.stringify(msg));
      await db.collection('messages').add(cleanMsg); 
  };
  
  const handleAddNote = async (note: Omit<Note, 'id'>) => { await db.collection('notes').add(note); };
  const handleDeleteNote = async (id: string) => { await db.collection('notes').doc(id).delete(); };

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

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading ERP System...</div>;
  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
  if (showPasswordChange) return <PasswordChangePage onUpdatePassword={handleUpdatePassword} onSkip={() => setShowPasswordChange(false)} />;

  if (selectedModule) {
    switch (selectedModule) {
      case 'hr': return <HrDashboardPage onBack={() => setSelectedModule(null)} employees={employees} users={users} onAddEmployee={handleAddEmployee} onLogout={handleLogout} allPermissions={permissions} onUserPermissionsChange={handleUserPermissionsChange} currentUserEmail={currentUser || ''} leaveRequests={leaveRequests} onAddLeaveRequest={handleAddLeaveRequest} onLeaveRequestAction={handleLeaveRequestAction} onResignEmployee={handleResignEmployee} payrollHistory={payrollHistory} onRunPayroll={handleRunPayroll} onUpdateEmployee={handleUpdateEmployee} attendanceRecords={attendanceRecords} onUploadAttendance={handleUploadAttendance} />;
      case 'inventory_management': return <InventoryDashboardPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} permissions={permissions[currentUser || '']?.['inventory_management']} inventory={inventory} employees={employees} labs={labs} toners={toners} mrfs={mrfs} recipes={recipes} onAddNewAsset={handleAddNewAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset} onResignEmployee={() => {}} onAddSystem={handleAddSystem} onUpdateSystem={handleUpdateSystem} onDeleteSystem={handleDeleteSystem} onSaveTonerModel={handleSaveTonerModel} onDeleteTonerModel={onDeleteTonerModel} onMarkTonerEmpty={()=>{}} onMarkTonerFilled={()=>{}} onAddNewMRF={handleAddNewMRF} onUpdateMRF={handleUpdateMRF} onDeleteMRF={handleDeleteMRF} onUpdateKitchenStock={handleUpdateKitchenStock} onCreateSCRequest={handleCreateSCRequest} />;
      case 'supply_chain': return <SupplyChainDashboardPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} inventory={inventory} employees={employees} requests={supplyChainRequests} purchaseRequests={purchaseRequests} purchaseOrders={purchaseOrders} recipes={recipes} vendors={vendors} onCreateRequest={handleCreateSCRequest} onActionRequest={handleActionRequest} onIssueRequest={handleIssueRequest} onForwardToPurchase={handleForwardToPurchase} onCreatePurchaseRequest={handleCreatePurchaseRequest} onCreatePO={handleCreatePO} onUpdatePO={handleUpdatePO} onDeletePO={handleDeletePO} onPOAction={handlePOAction} onGRN={handleGRN} onAddNewAsset={handleAddNewAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset} onIssueAsset={handleIssueAsset} onReturnAsset={handleReturnAsset} />;
      case 'task_manager': return <TaskManagerPage onBack={() => setSelectedModule(null)} onLogout={handleLogout} currentUserEmail={currentUser || ''} tasks={tasks} employees={employees} onCreateTask={handleCreateTask} onTaskWorkflowAction={handleTaskWorkflowAction} onDeleteTask={handleDeleteTask} messages={messages} onSendMessage={handleSendMessage} notes={notes} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />;
      default: return <div className="flex h-screen items-center justify-center flex-col gap-4"><p>Module under construction</p><button onClick={() => setSelectedModule(null)} className="text-blue-900 underline">Go Back</button></div>;
    }
  }

  const currentEmployee = employees.find(e => e.email === currentUser);
  if (currentEmployee && currentEmployee.role === 'Employee' && currentUser !== 'admin') return <EmployeeDashboard employee={currentEmployee} onModuleSelect={setSelectedModule} onLogout={handleLogout} accessibleModules={accessibleModules} />;
  return <DashboardPage onModuleSelect={setSelectedModule} onLogout={handleLogout} accessibleModules={currentUser === 'admin' ? undefined : accessibleModules} />;
};

export default App;
