
import React from 'react';
import type { User, Employee } from '../../types';

interface UsersPageProps {
  users: User[];
  employees: Employee[];
}

const UsersPage: React.FC<UsersPageProps> = ({ users, employees }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-blue-900">User Accounts</h1>
            <p className="text-sm text-blue-800">List of all system logins. Users are automatically created when an employee is added.</p>
        </div>
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
                    <tr key={user.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap border-r">
                        <div className="text-sm font-bold text-blue-900">{displayName}</div>
                        {employee && <div className="text-xs text-blue-800 italic">{employee.designation}</div>}
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
  );
};

export default UsersPage;
