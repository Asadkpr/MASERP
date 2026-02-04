
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
          setError('Invalid email or password. Please try again.');
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
      if (!window.confirm("WARNING: This will wipe all system data (Employees, Inventory, etc.).\n\nAre you sure you want to proceed?")) {
          return;
      }
      const confirmText = prompt("Type 'DELETE' to confirm:");
      if (confirmText !== 'DELETE') return;

      setIsResetting(true);
      try {
          const collections = ['employees', 'users', 'inventory', 'leaveRequests', 'payrollHistory', 'labs', 'toners', 'mrfs', 'attendanceRecords', 'supplyChainRequests', 'purchaseRequests', 'purchaseOrders', 'recipes', 'vendors', 'tasks', 'messages', 'notes'];
          for (const colName of collections) {
              const colRef = db.collection(colName);
              const snapshot = await colRef.get();
              if (snapshot.empty) continue;
              const batch = db.batch();
              snapshot.docs.forEach(doc => batch.delete(doc.ref));
              await batch.commit();
          }
          alert("System Reset Successful! You can now start fresh with 'admin' / '123'.");
          window.location.reload();
      } catch (err: any) {
          alert("Error: " + err.message);
      } finally {
          setIsResetting(false);
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <MasbotLogo className="h-16 w-auto mb-6" />
            <h1 className="text-2xl font-bold text-blue-900">MASERP System</h1>
            <p className="text-blue-800 text-sm mt-1">Authorized Personnel Login Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-1">
                Email Address / Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-blue-900"
                placeholder="Enter your email or 'admin'"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-blue-900">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-purple-700 hover:underline">Forgot?</a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-blue-900"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-900 hover:bg-purple-800 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:bg-slate-300 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : 'LOGIN'}
            </button>
          </form>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-medium">© 2024 MASBOT. All Rights Reserved.</p>
        </div>
      </div>

      {/* Admin Wipe Utility */}
      <div className="mt-8 opacity-20 hover:opacity-100 transition-opacity">
        <button 
          onClick={handleResetDatabase}
          disabled={isResetting}
          className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-tighter"
        >
          {isResetting ? 'Wiping Data...' : 'Wipe System Data'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
