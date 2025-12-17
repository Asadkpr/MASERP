
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import HrDashboardPage from './components/hr/HrDashboardPage';
import InventoryDashboardPage from './components/InventoryDashboardPage';
import SupplyChainDashboardPage from './components/SupplyChainDashboardPage';
import PasswordChangePage from './components/PasswordChangePage';
import type { Employee, User, AllPermissions, ModulePermissions, LeaveRequest, PayrollRecord, InventoryItem, Lab, Toner, MRF, LabSystem, AttendanceRecord, SupplyChainRequest, PurchaseRequest, Recipe, Vendor, PurchaseOrder, LeaveBalance } from './types';
import { db, auth } from './components/firebase-config';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs, setDoc, writeBatch, increment } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';

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

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Map the internal firebase email back to 'admin' username for app logic consistency
        if (user.email === 'admin@masbot.erp') {
            setCurrentUser('admin');
        } else {
            setCurrentUser(user.email);
        }
      } else {
        // Only reset if we are not already logged in via bypass (currentUser is set)
        if (!currentUser) {
            setIsLoggedIn(false);
            setCurrentUser(null);
            setSelectedModule(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // --- Firebase Data Listeners (Only when Authenticated) ---
  useEffect(() => {
    if (!currentUser) {
        // Clear data on logout
        setEmployees([]);
        setUsers([]);
        return;
    }

    let unsubscribers: (() => void)[] = [];
    let isMounted = true;

    const initializeSystem = async () => {
        // --- 1. DEFINE SEED DATA ---
        const initialEmployees: Omit<Employee, 'id'>[] = [
            { 
                employeeId: 'EMP-001',
                firstName: 'Ali', lastName: 'Raza', fatherName: 'Raza Khan', 
                email: 'ali.raza@example.com', phone: '0300-1234567', cnic: '35202-1234567-1',
                department: 'IT', designation: 'Developer', joiningDate: '2023-01-15', 
                salary: '120000', role: 'Employee', status: 'Active', employmentType: 'Permanent',
                leaveBalance: { annual: { total: 14, used: 0 }, sick: { total: 7, used: 0 }, casual: { total: 6, used: 0 }, maternity: { total: 90, used: 0 }, paternity: { total: 7, used: 0 }, alternateDayOff: { total: 50, used: 0 }, others: { total: 0, used: 0 } }
            },
            { 
                employeeId: 'EMP-002',
                firstName: 'Sara', lastName: 'Khan', fatherName: 'Ahmed Khan', 
                email: 'sara.khan@example.com', phone: '0301-7654321', cnic: '35202-2345678-2',
                department: 'HR', designation: 'HR Manager', joiningDate: '2022-05-20', 
                salary: '150000', role: 'HR', status: 'Active', employmentType: 'Permanent',
                leaveBalance: { annual: { total: 14, used: 0 }, sick: { total: 7, used: 0 }, casual: { total: 6, used: 0 }, maternity: { total: 90, used: 0 }, paternity: { total: 7, used: 0 }, alternateDayOff: { total: 50, used: 0 }, others: { total: 0, used: 0 } }
            },
            { 
                employeeId: 'EMP-003',
                firstName: 'Ahmed', lastName: 'Ali', fatherName: 'Bashir Ali', 
                email: 'ahmed.ali@example.com', phone: '0302-1122334', cnic: '35202-3456789-3',
                department: 'Finance', designation: 'Accountant', joiningDate: '2023-03-10', 
                salary: '100000', role: 'HOD', status: 'Active', employmentType: 'Permanent',
                leaveBalance: { annual: { total: 14, used: 0 }, sick: { total: 7, used: 0 }, casual: { total: 6, used: 0 }, maternity: { total: 90, used: 0 }, paternity: { total: 7, used: 0 }, alternateDayOff: { total: 50, used: 0 }, others: { total: 0, used: 0 } }
            }
        ];

        const initialIngredients: Omit<InventoryItem, 'id'>[] = [
            { type: 'Kitchen', model: 'Flour', quantity: 25, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-001' },
            { type: 'Kitchen', model: 'Sugar', quantity: 25, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-002' },
            { type: 'Kitchen', model: 'Salt', quantity: 10, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-003' },
            { type: 'Kitchen', model: 'Butter', quantity: 10, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-004' },
            { type: 'Kitchen', model: 'Milk', quantity: 20, unit: 'liters', status: 'In Stock', assignedTo: '', itemCode: 'KIT-005' },
            { type: 'Kitchen', model: 'Eggs', quantity: 100, unit: 'pieces', status: 'In Stock', assignedTo: '', itemCode: 'KIT-006' },
            { type: 'Kitchen', model: 'Coffee Beans', quantity: 5, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-007' },
            { type: 'Kitchen', model: 'Yeast', quantity: 2, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-008' },
            { type: 'Kitchen', model: 'Olive Oil', quantity: 5, unit: 'liters', status: 'In Stock', assignedTo: '', itemCode: 'KIT-009' },
            { type: 'Kitchen', model: 'Vinegar', quantity: 5, unit: 'liters', status: 'In Stock', assignedTo: '', itemCode: 'KIT-010' },
            { type: 'Kitchen', model: 'Onion', quantity: 50, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-011' },
            { type: 'Kitchen', model: 'Chicken (with bone)', quantity: 20, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-020' },
            { type: 'Kitchen', model: 'Chicken (boneless)', quantity: 20, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-021' },
            { type: 'Kitchen', model: 'Tomatoes', quantity: 30, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-022' },
            { type: 'Kitchen', model: 'Garlic paste', quantity: 5, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-023' },
            { type: 'Kitchen', model: 'Ginger paste', quantity: 5, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-024' },
            { type: 'Kitchen', model: 'Green chilies', quantity: 5, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-025' },
            { type: 'Kitchen', model: 'Yogurt', quantity: 15, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-026' },
            { type: 'Kitchen', model: 'Cooking oil', quantity: 50, unit: 'liters', status: 'In Stock', assignedTo: '', itemCode: 'KIT-027' },
            { type: 'Kitchen', model: 'Red chili powder', quantity: 5, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-028' },
            { type: 'Kitchen', model: 'Garam masala', quantity: 5, unit: 'kg', status: 'In Stock', assignedTo: '', itemCode: 'KIT-029' },
        ];

        const initialRecipes: Omit<Recipe, 'id'>[] = [
            {
                name: "Chicken Karahi",
                ingredients: [
                    { name: "Chicken (with bone)", quantity: 1, unit: "kg" },
                    { name: "Tomatoes", quantity: 0.5, unit: "kg" },
                    { name: "Onion", quantity: 0.2, unit: "kg" },
                    { name: "Garlic paste", quantity: 0.02, unit: "kg" },
                    { name: "Ginger paste", quantity: 0.015, unit: "kg" },
                    { name: "Green chilies", quantity: 0.01, unit: "kg" },
                    { name: "Yogurt", quantity: 0.1, unit: "kg" },
                    { name: "Cooking oil", quantity: 0.05, unit: "liters" },
                    { name: "Salt", quantity: 0.01, unit: "kg" },
                    { name: "Red chili powder", quantity: 0.005, unit: "kg" },
                    { name: "Garam masala", quantity: 0.003, unit: "kg" }
                ]
            },
            {
                name: "Boneless Karahi",
                ingredients: [
                    { name: "Chicken (boneless)", quantity: 1, unit: "kg" },
                    { name: "Tomatoes", quantity: 0.5, unit: "kg" },
                    { name: "Onion", quantity: 0.2, unit: "kg" },
                    { name: "Garlic paste", quantity: 0.02, unit: "kg" },
                    { name: "Ginger paste", quantity: 0.015, unit: "kg" },
                    { name: "Green chilies", quantity: 0.01, unit: "kg" },
                    { name: "Yogurt", quantity: 0.1, unit: "kg" },
                    { name: "Cooking oil", quantity: 0.05, unit: "liters" },
                    { name: "Salt", quantity: 0.01, unit: "kg" },
                    { name: "Red chili powder", quantity: 0.005, unit: "kg" },
                    { name: "Garam masala", quantity: 0.003, unit: "kg" }
                ]
            }
        ];

        const initialVendors: Omit<Vendor, 'id'>[] = [
            { name: "Metro Cash & Carry", contactPerson: "Asif Khan", phone: "042-111-222-333", address: "Thokar Niaz Baig, Lahore" },
            { name: "Al-Fatah Electronics", contactPerson: "Bilal Ahmed", phone: "042-35756666", address: "Gulberg III, Lahore" },
            { name: "Hafeez Center Suppliers", contactPerson: "Chaudhry Sabir", phone: "0300-9876543", address: "Gulberg, Lahore" },
            { name: "Grain Market Wholesalers", contactPerson: "Mian Tariq", phone: "0321-5554443", address: "Akbari Mandi, Lahore" }
        ];

        // --- 2. OFFLINE MODE HANDLER ---
        const enableOfflineMode = () => {
            if (!isMounted) return;
            console.warn("Using Offline Demo Data (Firebase Access Denied or Config Missing)");
            
            // Populate state with seed data (adding fake IDs)
            setEmployees(initialEmployees.map((e, i) => ({ ...e, id: `local-emp-${i}` } as Employee)));
            setInventory(initialIngredients.map((e, i) => ({ ...e, id: `local-inv-${i}` } as InventoryItem)));
            setRecipes(initialRecipes.map((e, i) => ({ ...e, id: `local-rec-${i}` } as Recipe)));
            setVendors(initialVendors.map((e, i) => ({ ...e, id: `local-ven-${i}` } as Vendor)));
            setLabs([{ id: 'local-lab-1', name: "SIR Lab", systems: [] }, { id: 'local-lab-2', name: "SADU Lab", systems: [] }]);
            
            // Users for login metadata (Admin is handled via bypass)
            setUsers([
                { id: 'u1', email: 'admin', password: '123', passwordChangeRequired: true },
                { id: 'u2', email: 'ali.raza@example.com', password: 'password', passwordChangeRequired: true }
            ]);

            // Initialize empty arrays for other collections
            setLeaveRequests([]);
            setAttendanceRecords([]);
            setSupplyChainRequests([]);
            setPurchaseRequests([]);
            setPurchaseOrders([]);
            setPayrollHistory([]);
            setToners([]);
            setMrfs([]);
        };

        try {
            // --- 3. TEST FIREBASE CONNECTION ---
            const empColl = collection(db, 'employees');
            // Try to fetch one collection. If this fails (permission-denied), we go to catch.
            const empSnap = await getDocs(empColl);

            if (!isMounted) return;

            // --- 4. SUCCESSFUL CONNECTION: PROCEED WITH DB LOGIC ---
            
            // Seed Employees if empty
            if (empSnap.empty) {
                for (const emp of initialEmployees) await addDoc(empColl, emp);
            }

            // Check/Seed Inventory
            const invColl = collection(db, 'inventory');
            const kitchenQ = query(invColl, where('type', '==', 'Kitchen'));
            const kitchenSnap = await getDocs(kitchenQ);
            if (kitchenSnap.empty) {
                for (const ing of initialIngredients) await addDoc(invColl, ing);
            }

            // Check/Seed Recipes
            const recColl = collection(db, 'recipes');
            const recSnap = await getDocs(recColl);
            if (recSnap.empty) {
                for (const r of initialRecipes) await addDoc(recColl, r);
            }

            // Check/Seed Vendors
            const venColl = collection(db, 'vendors');
            const venSnap = await getDocs(venColl);
            if (venSnap.empty) {
                for (const v of initialVendors) await addDoc(venColl, v);
            }

            // --- 5. SETUP LISTENERS (ONLY IF CONNECTED) ---
            unsubscribers.push(onSnapshot(collection(db, "employees"), (s) => setEmployees(s.docs.map(d => ({ ...d.data(), id: d.id } as Employee)))));
            unsubscribers.push(onSnapshot(collection(db, "users"), (s) => setUsers(s.docs.map(d => ({ ...d.data(), id: d.id } as User)))));
            unsubscribers.push(onSnapshot(doc(db, "app_data", "permissions"), (s) => {
                if (s.exists()) setPermissions(s.data() as AllPermissions);
                else setDoc(doc(db, "app_data", "permissions"), {});
            }));
            unsubscribers.push(onSnapshot(collection(db, "leaveRequests"), (s) => setLeaveRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as LeaveRequest)))));
            unsubscribers.push(onSnapshot(query(collection(db, "payrollHistory"), where("date", "!=", null)), (s) => {
                const history = s.docs.map(d => ({ ...d.data(), id: d.id } as PayrollRecord));
                history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setPayrollHistory(history);
            }));
            unsubscribers.push(onSnapshot(collection(db, "inventory"), (s) => setInventory(s.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem)))));
            unsubscribers.push(onSnapshot(collection(db, "labs"), (s) => setLabs(s.docs.map(d => ({ ...d.data(), id: d.id } as Lab)))));
            unsubscribers.push(onSnapshot(collection(db, "toners"), (s) => setToners(s.docs.map(d => ({ ...d.data(), id: d.id } as Toner)))));
            unsubscribers.push(onSnapshot(collection(db, "mrfs"), (s) => setMrfs(s.docs.map(d => ({ ...d.data(), id: d.id } as MRF)))));
            unsubscribers.push(onSnapshot(collection(db, "attendanceRecords"), (s) => setAttendanceRecords(s.docs.map(d => ({ ...d.data(), id: d.id } as AttendanceRecord)))));
            unsubscribers.push(onSnapshot(collection(db, "supplyChainRequests"), (s) => setSupplyChainRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as SupplyChainRequest)))));
            unsubscribers.push(onSnapshot(collection(db, "purchaseRequests"), (s) => setPurchaseRequests(s.docs.map(d => ({ ...d.data(), id: d.id } as PurchaseRequest)))));
            unsubscribers.push(onSnapshot(collection(db, "recipes"), (s) => setRecipes(s.docs.map(d => ({ ...d.data(), id: d.id } as Recipe)))));
            unsubscribers.push(onSnapshot(collection(db, "vendors"), (s) => setVendors(s.docs.map(d => ({ ...d.data(), id: d.id } as Vendor)))));
            unsubscribers.push(onSnapshot(collection(db, "purchaseOrders"), (s) => setPurchaseOrders(s.docs.map(d => ({ ...d.data(), id: d.id } as PurchaseOrder)))));

        } catch (error) {
            // --- 6. FALLBACK ON ERROR ---
            console.warn("Firebase Connection Failed (Switching to Offline Mode):", error);
            enableOfflineMode();
        }
    };

    initializeSystem();

    return () => {
        isMounted = false;
        unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser]); 


  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    if (!password) return false;
    
    // HARDCODED BYPASS: Allow admin access even if Firebase Auth is not configured
    if (email === 'admin' && password === '123') {
        setIsLoggedIn(true);
        setCurrentUser('admin');
        return true;
    }

    // Map 'admin' username to a valid email for Firebase Auth
    const authEmail = email === 'admin' ? 'admin@masbot.erp' : email;
    // For admin '123' demo password, map to Firebase compliant length if needed
    const authPassword = (email === 'admin' && password.length < 6) ? '123456' : password;

    try {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        
        // Handle Password Change Requirement
        const q = query(collection(db, "users"), where("email", "==", email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const userMeta = snapshot.docs[0].data() as User;
            setShowPasswordChange(!!userMeta.passwordChangeRequired);
        }
        
        return true;
    } catch (error: any) {
        // Fallback for Demo: If Admin doesn't exist in Auth, create it
        if (error.code === 'auth/user-not-found' && email === 'admin') {
            try {
                // Auto-create the admin account in Firebase Auth
                await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                
                // Also ensure it exists in 'users' metadata collection
                const q = query(collection(db, "users"), where("email", "==", email));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    await addDoc(collection(db, "users"), { email: email, password: authPassword, passwordChangeRequired: true });
                }
                return true;
            } catch (createErr) {
                console.error("Failed to auto-create admin:", createErr);
                // Last resort bypass if creation fails (e.g. weak password policy)
                if (email === 'admin' && password === '123') {
                     setIsLoggedIn(true);
                     setCurrentUser('admin');
                     return true;
                }
                return false;
            }
        }
        console.error("Login error", error);
        throw error;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedModule(null);
  };

  // --- Helpers ---
  const calculateProRataLeaveBalance = (joiningDate: string): LeaveBalance => {
      const join = new Date(joiningDate);
      const currentYear = new Date().getFullYear();
      const joinYear = join.getFullYear();
      
      const fullQuotas = {
          annual: { total: 14, used: 0 },
          sick: { total: 7, used: 0 },
          casual: { total: 6, used: 0 },
          maternity: { total: 90, used: 0 },
          paternity: { total: 7, used: 0 },
          alternateDayOff: { total: 50, used: 0 },
          others: { total: 0, used: 0 }
      };

      // If joined in previous years, give full quota
      if (joinYear < currentYear) return fullQuotas;

      // Calculate remaining months in the year (including joining month)
      const joinMonth = join.getMonth(); // 0-11
      const monthsRemaining = 12 - joinMonth;
      const ratio = monthsRemaining / 12;

      return {
          annual: { total: Math.round(14 * ratio), used: 0 },
          sick: { total: Math.round(7 * ratio), used: 0 },
          casual: { total: Math.round(6 * ratio), used: 0 },
          maternity: { total: 90, used: 0 }, // Usually not pro-rated
          paternity: { total: 7, used: 0 },
          alternateDayOff: { total: Math.round(50 * ratio), used: 0 },
          others: { total: 0, used: 0 }
      };
  };

  // --- HR Handlers ---
  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>, password: string) => {
    let leaveBalance: LeaveBalance = {
        annual: { total: 0, used: 0 },
        sick: { total: 0, used: 0 },
        casual: { total: 0, used: 0 },
        maternity: { total: 0, used: 0 },
        paternity: { total: 0, used: 0 },
        alternateDayOff: { total: 0, used: 0 },
        others: { total: 0, used: 0 }
    };

    if (employeeData.employmentType === 'Permanent') {
        leaveBalance = calculateProRataLeaveBalance(employeeData.joiningDate);
    }

    const newEmployee = { ...employeeData, leaveBalance };
    const empRef = await addDoc(collection(db, "employees"), newEmployee);
    
    // Create User Metadata (Auth creation handled separately or lazily)
    await addDoc(collection(db, "users"), { 
        email: employeeData.email, 
        password: password, 
        passwordChangeRequired: true 
    });
  };

  const handleUpdateEmployee = async (employeeId: string, updatedData: Partial<Omit<Employee, 'id'>>) => {
    const empRef = doc(db, 'employees', employeeId);
    
    // Check if status changed to Permanent
    if (updatedData.employmentType === 'Permanent') {
        // Calculate pro-rata leaves from TODAY if they weren't permanent before
        // Ideally we check previous state, but calculating based on current date is a safe default for upgrades
        const today = new Date().toISOString().split('T')[0];
        const newBalance = calculateProRataLeaveBalance(today);
        await updateDoc(empRef, { ...updatedData, leaveBalance: newBalance });
    } else {
        await updateDoc(empRef, updatedData);
    }
    return { success: true, message: "Employee updated successfully" };
  };

  const handleResignEmployee = async (employeeId: string) => {
    await updateDoc(doc(db, 'employees', employeeId), { status: 'Resigned' });
    return { success: true, message: "Employee marked as resigned." };
  };

  const handleUserPermissionsChange = async (userEmail: string, newUserPermissions: { [moduleId: string]: ModulePermissions }) => {
    // Deep copy to ensure clean object for Firestore
    const cleanPermissions: any = {};
    Object.keys(newUserPermissions).forEach(modKey => {
        cleanPermissions[modKey] = {};
        Object.keys(newUserPermissions[modKey]).forEach(pageKey => {
            cleanPermissions[modKey][pageKey] = { ...newUserPermissions[modKey][pageKey] };
        });
    });

    const newAllPermissions = { ...permissions, [userEmail]: cleanPermissions };
    await setDoc(doc(db, "app_data", "permissions"), newAllPermissions);
  };

  const handleAddLeaveRequest = async (request: Omit<LeaveRequest, 'id'>) => {
    await addDoc(collection(db, "leaveRequests"), request);
  };

  const handleLeaveRequestAction = async (requestId: string, action: 'Approve' | 'Reject') => {
    const reqRef = doc(db, 'leaveRequests', requestId);
    const request = leaveRequests.find(r => r.id === requestId);
    
    if (action === 'Approve' && request) {
        if (request.status === 'Pending HOD') {
            await updateDoc(reqRef, { status: 'Pending HR' });
        } else {
            await updateDoc(reqRef, { status: 'Approved' });
            
            // Deduct from balance
            const from = new Date(request.fromDate);
            const to = new Date(request.toDate);
            const diffTime = Math.abs(to.getTime() - from.getTime());
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            const map: { [key: string]: keyof LeaveBalance } = {
                'Casual Leave': 'casual',
                'Sick Leave': 'sick',
                'Annual Leave': 'annual',
                'Maternity Leave': 'maternity',
                'Paternity Leave': 'paternity',
                'Alternate Day Off': 'alternateDayOff',
                'Others': 'others'
            };
            const typeKey = map[request.leaveType];
            const empRef = doc(db, 'employees', request.employeeId);
            
            await updateDoc(empRef, {
                [`leaveBalance.${typeKey}.used`]: increment(days)
            });
        }
    } else {
        await updateDoc(reqRef, { status: 'Rejected' });
    }
  };

  const handleRunPayroll = async () => {
      // Calculate payroll for all employees and save to history
      const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const record: PayrollRecord = {
          id: '', // Firestore generates
          date: new Date().toISOString(),
          monthYear: monthYear,
          totalPayroll: 0,
          totalDeductions: 0,
          totalNetPay: 0,
          employeeRecords: employees.map(emp => ({
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              department: emp.department,
              baseSalary: parseFloat(emp.salary),
              deductions: 0, // Simplified for demo
              netPay: parseFloat(emp.salary)
          }))
      };
      
      // Calc totals
      record.totalPayroll = record.employeeRecords.reduce((acc, curr) => acc + curr.baseSalary, 0);
      record.totalNetPay = record.employeeRecords.reduce((acc, curr) => acc + curr.netPay, 0);

      await addDoc(collection(db, "payrollHistory"), record);
      return { success: true, message: "Payroll run successfully." };
  };

  const handleUploadAttendance = async (records: Omit<AttendanceRecord, 'id'>[]) => {
      const batch = writeBatch(db);
      records.forEach(rec => {
          // Use a composite key to avoid duplicates: EmpID_Date
          const docId = `${rec.employeeId}_${rec.date}`;
          const ref = doc(db, 'attendanceRecords', docId);
          batch.set(ref, rec);
      });
      await batch.commit();
      return { success: true, message: "Attendance records uploaded." };
  };

  // --- Inventory Handlers ---
  const handleAddNewAsset = async (assetsData: Omit<InventoryItem, 'id'>[]) => {
      const batch = writeBatch(db);
      assetsData.forEach(asset => {
          const ref = doc(collection(db, 'inventory'));
          batch.set(ref, asset);
      });
      await batch.commit();
  };

  const handleUpdateAsset = async (asset: InventoryItem) => {
      const { id, ...data } = asset;
      await updateDoc(doc(db, 'inventory', id), data);
  };

  const handleDeleteAsset = async (assetId: string) => {
      await deleteDoc(doc(db, 'inventory', assetId));
  };

  const handleAddSystem = async (labId: string, newSystemData: Omit<LabSystem, 'id'>) => {
      const labRef = doc(db, 'labs', labId);
      const lab = labs.find(l => l.id === labId);
      if (!lab) return;
      
      const newSystem = { ...newSystemData, id: `SYS-${Date.now()}` };
      const updatedSystems = [...lab.systems, newSystem];
      await updateDoc(labRef, { systems: updatedSystems });
  };

  const handleUpdateSystem = async (labId: string, updatedSystem: LabSystem) => {
      const labRef = doc(db, 'labs', labId);
      const lab = labs.find(l => l.id === labId);
      if (!lab) return;

      const updatedSystems = lab.systems.map(s => s.id === updatedSystem.id ? updatedSystem : s);
      await updateDoc(labRef, { systems: updatedSystems });
  };

  const handleDeleteSystem = async (labId: string, systemId: string) => {
      const labRef = doc(db, 'labs', labId);
      const lab = labs.find(l => l.id === labId);
      if (!lab) return;

      const updatedSystems = lab.systems.filter(s => s.id !== systemId);
      await updateDoc(labRef, { systems: updatedSystems });
  };

  const handleSaveTonerModel = async (data: any) => {
      // Check if model exists
      const existing = toners.find(t => t.model === data.model);
      if (existing) {
          // Update quantities logic would be more complex in real app, simplified here
          await updateDoc(doc(db, 'toners', existing.id), { 
              quantity: data.filledQuantity + data.emptyQuantity,
              compatiblePrinters: data.compatiblePrinters 
          });
      } else {
          // Create separate docs for Filled and Empty to track status
          if (data.filledQuantity > 0) {
             await addDoc(collection(db, 'toners'), { model: data.model, compatiblePrinters: data.compatiblePrinters, quantity: data.filledQuantity, status: 'Filled' });
          }
          if (data.emptyQuantity > 0) {
             await addDoc(collection(db, 'toners'), { model: data.model, compatiblePrinters: data.compatiblePrinters, quantity: data.emptyQuantity, status: 'Empty' });
          }
      }
  };

  const onDeleteTonerModel = async (modelName: string) => {
      const batch = writeBatch(db);
      const targets = toners.filter(t => t.model === modelName);
      targets.forEach(t => batch.delete(doc(db, 'toners', t.id)));
      await batch.commit();
  };

  const onMarkTonerEmpty = async (id: string) => {
      // Simplified: Decrement filled, increment empty (would require finding the empty doc counterpart)
      alert("Toner status update logic");
  };
  const onMarkTonerFilled = async (id: string) => { alert("Toner status update logic"); };

  const handleAddNewMRF = async (mrf: Omit<MRF, 'id'>) => {
      await addDoc(collection(db, 'mrfs'), mrf);
  };
  const handleUpdateMRF = async (mrf: MRF) => {
      const { id, ...data } = mrf;
      await updateDoc(doc(db, 'mrfs', id), data);
  };
  const handleDeleteMRF = async (id: string) => {
      await deleteDoc(doc(db, 'mrfs', id));
  };

  const handleUpdateKitchenStock = async (items: { id: string, newQuantity: number }[]) => {
      const batch = writeBatch(db);
      items.forEach(item => {
          const ref = doc(db, 'inventory', item.id);
          batch.update(ref, { quantity: item.newQuantity });
      });
      await batch.commit();
  };

  // --- Supply Chain Handlers ---
  const handleCreateSCRequest = async (req: Omit<SupplyChainRequest, 'id'>) => {
      // Default to Account Manager Approval first instead of CEO
      const newReq = { ...req, status: 'Pending Account Manager' as const };
      await addDoc(collection(db, 'supplyChainRequests'), newReq);
  };

  const handleActionRequest = async (id: string, action: 'Approve' | 'Reject', reason?: string) => {
      const request = supplyChainRequests.find(r => r.id === id);
      let newStatus = 'Pending Store';

      if (action === 'Approve') {
          // Logic: If request originated from 'Store' (restocking), it skips "Pending Store" (issue) and goes to "Forwarded to Purchase" (buy).
          if (request?.department === 'Store') {
              newStatus = 'Forwarded to Purchase';
          } else {
              newStatus = 'Pending Store';
          }
      } else {
          newStatus = 'Rejected';
      }

      const updates: any = { 
          status: newStatus,
          approvalDate: new Date().toISOString()
      };
      if (reason) updates.rejectionReason = reason;
      await updateDoc(doc(db, 'supplyChainRequests', id), updates);
  };

  const handleIssueRequest = async (id: string) => {
      const request = supplyChainRequests.find(r => r.id === id);
      if (!request) return;

      const batch = writeBatch(db);
      
      // Update Request Status
      const reqRef = doc(db, 'supplyChainRequests', id);
      batch.update(reqRef, { status: 'Issued', issuedDate: new Date().toISOString() });

      // Deduct Stock
      request.items.forEach(item => {
          // Only deduct stock if inventoryId is present and valid
          if (item.inventoryId && item.inventoryId.trim() !== '') {
              const invRef = doc(db, 'inventory', item.inventoryId);
              batch.update(invRef, { quantity: increment(-item.quantityRequested) });
          }
      });

      await batch.commit();
  };

  const handleForwardToPurchase = async (id: string) => {
      await updateDoc(doc(db, 'supplyChainRequests', id), { status: 'Forwarded to Purchase' });
  };

  const handleCreatePurchaseRequest = async (req: Omit<PurchaseRequest, 'id'>) => {
      await addDoc(collection(db, 'purchaseRequests'), req);
  };

  const handleCreatePO = async (po: Omit<PurchaseOrder, 'id'>) => {
      // Default new POs to pending account manager
      const newPO = { ...po, status: 'Pending Account Manager' as const };
      await addDoc(collection(db, 'purchaseOrders'), newPO);
  };

  const handleUpdatePO = async (poId: string, updatedData: Partial<Omit<PurchaseOrder, 'id'>>) => {
      await updateDoc(doc(db, 'purchaseOrders', poId), updatedData);
  };

  const handleDeletePO = async (poId: string) => {
      await deleteDoc(doc(db, 'purchaseOrders', poId));
  };

  const handlePOAction = async (poId: string, action: 'Approve' | 'Reject') => {
      await updateDoc(doc(db, 'purchaseOrders', poId), { status: action === 'Approve' ? 'Approved' : 'Rejected' });
  };

  const handleGRN = async (poId: string, receivedData: { grnNumber: string, remarks: string }) => {
      const po = purchaseOrders.find(p => p.id === poId);
      if (!po) return;

      const batch = writeBatch(db);
      
      // Update PO
      const poRef = doc(db, 'purchaseOrders', poId);
      batch.update(poRef, { 
          status: 'Received', 
          grnNumber: receivedData.grnNumber,
          grnRemarks: receivedData.remarks,
          grnDate: new Date().toISOString()
      });

      // Add Stock
      po.items.forEach(item => {
          if (item.inventoryId) {
              const invRef = doc(db, 'inventory', item.inventoryId);
              batch.update(invRef, { quantity: increment(item.quantity) });
          }
      });

      // Reset original request if linked
      if (po.originalRequestId) {
          const reqRef = doc(db, 'supplyChainRequests', po.originalRequestId);
          batch.update(reqRef, { status: 'Pending Store' }); // Back to Store for issuance
      }

      await batch.commit();
  };

  const handleAddRecipe = async (recipe: Omit<Recipe, 'id'>) => {
      await addDoc(collection(db, 'recipes'), recipe);
  };

  // --- Password Update ---
  const handleUpdatePassword = async (newPassword: string) => {
      // In a real app with Firebase Auth, you would use updatePassword(auth.currentUser, newPassword)
      // For this demo structure where passwords are also stored in Firestore 'users' collection:
      if (!currentUser) return { success: false, message: "No user" };
      
      const q = query(collection(db, "users"), where("email", "==", currentUser === 'admin' ? 'admin' : currentUser));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await updateDoc(doc(db, "users", userDoc.id), { password: newPassword, passwordChangeRequired: false });
          setShowPasswordChange(false);
          return { success: true, message: "Password updated" };
      }
      return { success: false, message: "User record not found" };
  };

  // --- Calculate Permissions ---
  const accessibleModules = React.useMemo(() => {
      if (currentUser === 'admin') return ['hr', 'inventory_management', 'supply_chain', 'finance', 'student', 'website'];
      if (!currentUser || !permissions[currentUser]) return [];
      
      return Object.keys(permissions[currentUser]).filter(moduleId => {
          const modPerms = permissions[currentUser][moduleId];
          return Object.values(modPerms).some((page: any) => page.view);
      });
  }, [currentUser, permissions]);

  // --- Render ---
  if (loading) {
      return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading ERP System...</div>;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (showPasswordChange) {
      return <PasswordChangePage onUpdatePassword={handleUpdatePassword} onSkip={() => setShowPasswordChange(false)} />;
  }

  if (selectedModule) {
    switch (selectedModule) {
      case 'hr':
        return (
          <HrDashboardPage 
            onBack={() => setSelectedModule(null)}
            employees={employees}
            users={users}
            onAddEmployee={handleAddEmployee}
            onLogout={handleLogout}
            allPermissions={permissions}
            onUserPermissionsChange={handleUserPermissionsChange}
            currentUserEmail={currentUser || ''}
            leaveRequests={leaveRequests}
            onAddLeaveRequest={handleAddLeaveRequest}
            onLeaveRequestAction={handleLeaveRequestAction}
            onResignEmployee={handleResignEmployee}
            payrollHistory={payrollHistory}
            onRunPayroll={handleRunPayroll}
            onUpdateEmployee={handleUpdateEmployee}
            attendanceRecords={attendanceRecords}
            onUploadAttendance={handleUploadAttendance}
          />
        );
      case 'inventory_management':
        return (
          <InventoryDashboardPage 
            onBack={() => setSelectedModule(null)} 
            onLogout={handleLogout}
            currentUserEmail={currentUser || ''}
            permissions={permissions[currentUser || '']?.['inventory_management']}
            inventory={inventory}
            employees={employees}
            labs={labs}
            toners={toners}
            mrfs={mrfs}
            recipes={recipes}
            onAddNewAsset={handleAddNewAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            onResignEmployee={() => {}} // Implemented elsewhere
            onAddSystem={handleAddSystem}
            onUpdateSystem={handleUpdateSystem}
            onDeleteSystem={handleDeleteSystem}
            onSaveTonerModel={handleSaveTonerModel}
            onDeleteTonerModel={onDeleteTonerModel}
            onMarkTonerEmpty={onMarkTonerEmpty}
            onMarkTonerFilled={onMarkTonerFilled}
            onAddNewMRF={handleAddNewMRF}
            onUpdateMRF={handleUpdateMRF}
            onDeleteMRF={handleDeleteMRF}
            onUpdateKitchenStock={handleUpdateKitchenStock}
            onCreateSCRequest={handleCreateSCRequest}
          />
        );
      case 'supply_chain':
        return (
            <SupplyChainDashboardPage 
                onBack={() => setSelectedModule(null)}
                onLogout={handleLogout}
                currentUserEmail={currentUser || ''}
                inventory={inventory}
                employees={employees}
                requests={supplyChainRequests}
                purchaseRequests={purchaseRequests}
                purchaseOrders={purchaseOrders}
                recipes={recipes}
                vendors={vendors}
                onCreateRequest={handleCreateSCRequest}
                onActionRequest={handleActionRequest}
                onIssueRequest={handleIssueRequest}
                onForwardToPurchase={handleForwardToPurchase}
                onCreatePurchaseRequest={handleCreatePurchaseRequest}
                onCreatePO={handleCreatePO}
                onUpdatePO={handleUpdatePO}
                onDeletePO={handleDeletePO}
                onPOAction={handlePOAction}
                onGRN={handleGRN}
                onAddNewAsset={handleAddNewAsset}
                onUpdateAsset={handleUpdateAsset}
                onDeleteAsset={handleDeleteAsset}
            />
        );
      default:
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <p>Module under construction</p>
                <button onClick={() => setSelectedModule(null)} className="text-blue-500 underline">Go Back</button>
            </div>
        );
    }
  }

  // Determine Dashboard View based on Role
  const currentEmployee = employees.find(e => e.email === currentUser);
  const isRegularEmployee = currentEmployee && currentEmployee.role === 'Employee' && currentUser !== 'admin';

  if (isRegularEmployee) {
      return (
          <EmployeeDashboard 
            employee={currentEmployee}
            onModuleSelect={setSelectedModule}
            onLogout={handleLogout}
            accessibleModules={accessibleModules}
          />
      );
  }

  return (
    <DashboardPage 
        onModuleSelect={setSelectedModule} 
        onLogout={handleLogout} 
        accessibleModules={currentUser === 'admin' ? undefined : accessibleModules}
    />
  );
};

export default App;

