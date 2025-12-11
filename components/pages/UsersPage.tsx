
import React, { useState } from 'react';
import type { InventoryUser } from '../../types';

interface UsersPageProps {
    users: InventoryUser[];
    onResignEmployee: (employeeName: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, onResignEmployee }) => {
    // FIX: Changed state type from number to string to match user ID type.
    const [openUserId, setOpenUserId] = useState<string | null>(null);

    // FIX: Changed userId parameter from number to string.
    const toggleUser = (userId: string) => {
        setOpenUserId(openUserId === userId ? null : userId);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-6">Employees & Assigned Assets</h2>
            <div className="space-y-4">
                {users.map(user => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow transition-shadow duration-200">
                        <div className="w-full flex justify-between items-center p-4 text-left">
                            <div onClick={() => toggleUser(user.id)} className="cursor-pointer flex-grow">
                                <p className="font-semibold text-blue-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-blue-600 dark:text-gray-400">{user.email}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                               <span className="text-sm px-2 py-1 bg-purple-100 text-purple-900 dark:bg-gray-700 rounded-full">{user.assets.length} Assets</span>
                               {user.assets.length > 0 && (
                                   <button 
                                     onClick={() => onResignEmployee(user.name)}
                                     className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline text-sm px-2 py-1 rounded-md hover:bg-yellow-100 dark:hover:bg-gray-700"
                                     aria-label={`Resign all assets from ${user.name}`}
                                   >
                                     Resign
                                   </button>
                               )}
                                <button onClick={() => toggleUser(user.id)} aria-label="Toggle asset details" className="p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-600 dark:text-gray-400 transition-transform ${openUserId === user.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {openUserId === user.id && (
                            <div className="border-t border-slate-200 dark:border-gray-700 p-4">
                                {user.assets.length > 0 ? (
                                    <ul className="space-y-2">
                                        {user.assets.map(asset => (
                                            <li key={asset.id} className="flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="font-medium text-blue-900 dark:text-gray-200">{asset.type}:</span>
                                                    <span className="text-blue-600 dark:text-gray-400 ml-2">{asset.model}</span>
                                                </div>
                                                <span className="text-xs font-mono bg-purple-50 text-purple-900 dark:bg-gray-700 px-2 py-1 rounded">{asset.id}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-blue-600 dark:text-gray-400 text-center">No assets assigned to this user.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersPage;
