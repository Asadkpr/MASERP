
import React, { useState } from 'react';
import { MasbotLogo } from './icons/MasbotLogo';
import { db } from './firebase-config';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      try {
        const success = await onLogin(email, password);
        if (!success) {
          setError('Invalid email or password.');
        }
      } catch (err: any) {
        console.error("Login error", err);
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please enter both email and password.');
    }
  };

  const handleResetDatabase = async () => {
      if (!window.confirm("WARNING: This will PERMANENTLY DELETE ALL DATA (Employees, Inventory, Orders, etc.).\n\nAre you sure you want to completely wipe the system to start fresh?")) {
          return;
      }
      
      const confirmText = prompt("Type 'DELETE' to confirm wiping the database:");
      if (confirmText !== 'DELETE') return;

      setIsResetting(true);
      try {
          const collections = [
              'employees', 
              'users', 
              'inventory', 
              'leaveRequests', 
              'payrollHistory', 
              'labs', 
              'toners', 
              'mrfs', 
              'attendanceRecords', 
              'supplyChainRequests', 
              'purchaseRequests', 
              'purchaseOrders', 
              'recipes', 
              'vendors'
          ];

          for (const colName of collections) {
              const colRef = db.collection(colName);
              const snapshot = await colRef.get();
              if (snapshot.empty) continue;

              // Delete in batches of 500 (Firestore limit)
              const batch = db.batch();
              let count = 0;
              
              for (const document of snapshot.docs) {
                  batch.delete(db.collection(colName).doc(document.id));
                  count++;
              }
              await batch.commit();
              console.log(`Deleted collection: ${colName}`);
          }

          alert("System Reset Successful. All data has been deleted.\nYou can now login as 'admin' / '123' to start fresh.");
          window.location.reload();

      } catch (err: any) {
          console.error(err);
          alert("Error resetting database: " + err.message);
      } finally {
          setIsResetting(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 border-t-4 border-purple-900">
        <div className="flex flex-col items-center mb-8">
          <MasbotLogo className="h-20 w-auto mb-4" />
          <p className="text-blue-900 font-medium">Admin Login</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-blue-900"
            >
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm text-blue-900"
              placeholder="admin or user@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-blue-900"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-purple-900 focus:border-purple-900 sm:text-sm text-blue-900"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-900 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-900 transition-colors duration-200 disabled:bg-purple-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Developer Utility to Clear Database */}
      <div className="absolute bottom-4 right-4">
          <button 
            onClick={handleResetDatabase}
            disabled={isResetting}
            className="text-xs text-red-300 hover:text-red-600 underline transition-colors"
          >
            {isResetting ? 'Wiping Data...' : 'Reset System Data (Danger)'}
          </button>
      </div>
    </div>
  );
};

export default LoginPage;
