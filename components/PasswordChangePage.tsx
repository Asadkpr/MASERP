import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface PasswordChangePageProps {
  onUpdatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  onSkip: () => void;
}

const PasswordChangePage: React.FC<PasswordChangePageProps> = ({ onUpdatePassword, onSkip }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    const result = await onUpdatePassword(newPassword);
    setLoading(false);
    
    if (!result.success) {
        setMessage({ type: 'error', text: result.message });
    }
    // Success is handled in App.tsx by setting showPasswordChange to false, which moves to the next screen.
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300">
            <div className="flex flex-col items-center mb-8">
                <LogoIcon className="w-20 h-20 text-orange-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Change Your Password</h1>
                <p className="text-slate-500 text-center mt-2">For enhanced security, you can update your password now or skip for later.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-slate-600"
                    >
                        New Password
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        placeholder="••••••••"
                    />
                </div>
                 <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-slate-600"
                    >
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        placeholder="••••••••"
                    />
                </div>
                {message && <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message.text}</p>}

                <div className="space-y-4 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200 disabled:bg-teal-400"
                    >
                        {loading ? 'Saving...' : 'Save and Continue'}
                    </button>
                    <button
                        type="button"
                        onClick={onSkip}
                        className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-200"
                    >
                        Skip for now
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default PasswordChangePage;
