
import React from 'react';
import type { User, Employee } from '../../types';

interface UsersPageProps {
  users: User[];
  employees: Employee[];
}

const UsersPage: React.FC<UsersPageProps> = ({ users, employees }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Users Management</h1>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                Email / Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                Password
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.length > 0 ? (
                users.map((user, index) => {
                  const employee = employees.find(emp => emp.email === user.email);
                  const displayName = user.email === 'admin' 
                    ? 'Administrator' 
                    : employee 
                      ? `${employee.firstName} ${employee.lastName}` 
                      : 'N/A';

                  return (
                    <tr key={index} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                        {displayName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900 font-mono">
                        {user.password}
                      </td>
                    </tr>
                  );
                })
            ) : (
                <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-blue-900">
                        No users found matching your search.
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
