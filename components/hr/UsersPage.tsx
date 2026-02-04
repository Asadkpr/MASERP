
import React, { useState, useMemo } from 'react';
import type { User, Employee } from '../../types';

interface UsersPageProps {
  users: User[];
  employees: Employee[];
  onDeleteEmployee: (id: string) => Promise<{ success: boolean; message: string }>;
  currentUserEmail: string;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, employees, onDeleteEmployee, currentUserEmail }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const isAdmin = currentUserEmail === 'admin';

  // Analysis of Database Health
  const syncAnalysis = useMemo(() => {
      const userEmails = new Set(users.map(u => u.email.toLowerCase()));
      const orphanEmployees: Employee[] = [];
      const duplicateEmails: string[] = [];
      const seenEmails = new Map<string, string>(); // email -> first ID seen

      employees.forEach(emp => {
          const email = emp.email.toLowerCase();
          
          // Check if orphan
          if (!userEmails.has(email)) {
              orphanEmployees.push(emp);
          }

          // Check if duplicate
          if (seenEmails.has(email)) {
              if (!duplicateEmails.includes(email)) duplicateEmails.push(email);
          } else {
              seenEmails.set(email, emp.id);
          }
      });

      // To delete: all orphans + all duplicates except one (the most recent one or linked one)
      const toDeleteIds: string[] = orphanEmployees.map(e => e.id);
      
      duplicateEmails.forEach(email => {
          const matchingEmployees = employees.filter(e => e.email.toLowerCase() === email);
          // Keep only the last one (most recently added usually)
          const duplicates = matchingEmployees.slice(0, matchingEmployees.length - 1);
          duplicates.forEach(d => {
              if (!toDeleteIds.includes(d.id)) toDeleteIds.push(d.id);
          });
      });

      return {
          totalOrphans: orphanEmployees.length,
          totalDuplicates: duplicateEmails.length,
          toDeleteCount: toDeleteIds.length,
          toDeleteIds
      };
  }, [users, employees]);

  const handleSyncCleanup = async () => {
      if (syncAnalysis.toDeleteCount === 0) {
          alert("Your database is already perfectly synchronized! No duplicates or unlinked records found.");
          return;
      }

      const confirmed = window.confirm(
          `DATABASE MAINTENANCE:\n\n` +
          `Found ${syncAnalysis.totalOrphans} employee(s) without user accounts.\n` +
          `Found ${syncAnalysis.totalDuplicates} email(s) with duplicate records.\n\n` +
          `This action will permanently REMOVE ${syncAnalysis.toDeleteCount} redundant record(s) to restore a 1-to-1 sync.\n\n` +
          `Do you want to proceed?`
      );

      if (!confirmed) return;

      setIsSyncing(true);
      let successCount = 0;
      
      try {
          for (const id of syncAnalysis.toDeleteIds) {
              const res = await onDeleteEmployee(id);
              if (res.success) successCount++;
          }
          alert(`Success! Removed ${successCount} redundant records. Your database is now clean.`);
      } catch (err: any) {
          alert("Cleanup failed: " + err.message);
      } finally {
          setIsSyncing(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-blue-100">
        <div className="flex justify-between items-start mb-6">
          <div>
              <h1 className="text-2xl font-bold text-blue-900">User Accounts</h1>
              <p className="text-sm text-blue-800">List of all system logins. Users are automatically created when an employee is added.</p>
          </div>
          {isAdmin && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-end gap-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database Health</p>
                  <div className="flex gap-4 mb-2">
                      <div className="text-right">
                          <p className="text-xs font-bold text-blue-900">Unlinked: {syncAnalysis.totalOrphans}</p>
                          <p className="text-xs font-bold text-blue-900">Duplicates: {syncAnalysis.totalDuplicates}</p>
                      </div>
                  </div>
                  <button 
                    onClick={handleSyncCleanup}
                    disabled={isSyncing || syncAnalysis.toDeleteCount === 0}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 ${
                        syncAnalysis.toDeleteCount > 0 
                        ? 'bg-purple-900 text-white shadow-lg hover:bg-purple-800' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSyncing ? (
                        <>
                            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Cleaning...</span>
                        </>
                    ) : 'Sync & Clean Duplicates'}
                  </button>
              </div>
          )}
        </div>
        
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-r">
                  Name / Employee Link
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider border-r">
                  Email (Login ID)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Current Password
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.length > 0 ? (
                  users.map((user) => {
                    const employee = employees.find(emp => emp.email === user.email);
                    const displayName = user.email === 'admin' 
                      ? 'Administrator' 
                      : employee 
                        ? `${employee.firstName} ${employee.lastName}` 
                        : 'Unlinked User';

                    return (
                      <tr key={user.email} className="hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap border-r">
                          <div className="text-sm font-bold text-blue-900">{displayName}</div>
                          {employee && <div className="text-xs text-blue-800 italic">{employee.designation}</div>}
                          {!employee && user.email !== 'admin' && <div className="text-xs text-red-500 font-bold italic">No matching employee record!</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-r">
                          <span className="text-sm text-blue-900 font-medium">{user.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm px-2 py-1 bg-slate-100 rounded border border-slate-200 text-purple-900 font-mono">
                              {user.password || '********'}
                          </code>
                          {user.passwordChangeRequired && (
                              <span className="ml-2 text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase">Must Change</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                  <tr>
                      <td colSpan={3} className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                              <p className="text-blue-900 font-medium">No system users found.</p>
                              <p className="text-sm text-blue-800">Add an employee in the HR section to see their login here.</p>
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
