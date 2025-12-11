
import React from 'react';
import type { SupplyChainRequest } from '../../types';

interface MyRequestsPageProps {
    requests: SupplyChainRequest[];
    currentUserEmail: string;
}

const MyRequestsPage: React.FC<MyRequestsPageProps> = ({ requests, currentUserEmail }) => {
    // In a real app with proper auth, check requesterEmail. For now, filter if needed or show all for demo
    const myRequests = requests.filter(r => r.requesterEmail === currentUserEmail || currentUserEmail === 'admin');

    const getStatusColor = (status: SupplyChainRequest['status']) => {
        switch (status) {
            case 'Pending Account Manager': return 'bg-yellow-100 text-yellow-800';
            case 'Pending Store': return 'bg-blue-100 text-blue-800';
            case 'Issued': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">My Requests</h2>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-purple-50 text-blue-900 font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Purpose</th>
                            <th className="px-6 py-4">Items Count</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {myRequests.length > 0 ? myRequests.map(req => (
                            <tr key={req.id} className="hover:bg-purple-50 transition-colors">
                                <td className="px-6 py-4 text-blue-900">{new Date(req.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-blue-900">{req.purpose}</td>
                                <td className="px-6 py-4 text-blue-900">{req.items.length}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-blue-900 italic">
                                    {req.status === 'Rejected' ? req.rejectionReason : 
                                     req.status === 'Issued' ? `Issued on ${new Date(req.issuedDate!).toLocaleDateString()}` : '-'}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-blue-900">
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyRequestsPage;
