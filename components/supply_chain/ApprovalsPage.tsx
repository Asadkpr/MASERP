
import React, { useState } from 'react';
import type { SupplyChainRequest, PurchaseOrder } from '../../types';

interface ApprovalsPageProps {
    requests: SupplyChainRequest[];
    purchaseOrders: PurchaseOrder[];
    onAction: (id: string, action: 'Approve' | 'Reject', reason?: string) => Promise<void>;
    onPOAction: (poId: string, action: 'Approve' | 'Reject') => Promise<void>;
}

const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ requests, purchaseOrders, onAction, onPOAction }) => {
    const [activeTab, setActiveTab] = useState<'requisitions' | 'pos'>('requisitions');

    const pendingRequests = requests.filter(r => r.status === 'Pending Account Manager');
    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending Account Manager');

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Account Manager Approvals</h2>
            </div>

            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('requisitions')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'requisitions'
                                ? 'border-purple-900 text-purple-900'
                                : 'border-transparent text-blue-900 hover:text-blue-800 hover:border-slate-300'
                        }`}
                    >
                        Requisitions ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pos')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'pos'
                                ? 'border-purple-900 text-purple-900'
                                : 'border-transparent text-blue-900 hover:text-blue-800 hover:border-slate-300'
                        }`}
                    >
                        Purchase Orders ({pendingPOs.length})
                    </button>
                </nav>
            </div>
            
            {activeTab === 'requisitions' && (
                <>
                    {pendingRequests.length === 0 ? (
                        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                            <p className="text-blue-900 text-lg">No pending requisitions awaiting approval.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-400">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-blue-900">{req.requesterName}</h3>
                                            <p className="text-sm text-blue-900">{req.department} • {new Date(req.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                            {req.status}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Purpose:</p>
                                        <p className="text-sm text-blue-900 bg-purple-50 p-2 rounded italic">"{req.purpose}"</p>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">Items Requested:</p>
                                        <ul className="text-sm space-y-1">
                                            {req.items.map((item, idx) => (
                                                <li key={idx} className="flex justify-between border-b border-slate-100 pb-1 last:border-0 hover:bg-purple-50 transition-colors text-blue-900">
                                                    <span>{item.name}</span>
                                                    <span className="font-mono text-blue-900">{item.quantityRequested} {item.unit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                                        <button 
                                            onClick={() => onAction(req.id, 'Approve')}
                                            className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const reason = prompt('Enter rejection reason:');
                                                if (reason) onAction(req.id, 'Reject', reason);
                                            }}
                                            className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'pos' && (
                <>
                    {pendingPOs.length === 0 ? (
                        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                            <p className="text-blue-900 text-lg">No pending Purchase Orders awaiting approval.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingPOs.map(po => (
                                <div key={po.id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-blue-900">PO #{po.poNumber}</h3>
                                            <p className="text-sm text-blue-900">Vendor: {po.vendorName} • {new Date(po.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-900">PKR {po.totalAmount.toLocaleString()}</p>
                                            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                                {po.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-purple-50 text-blue-900">
                                                <tr>
                                                    <th className="px-4 py-2">Item</th>
                                                    <th className="px-4 py-2 text-center">Qty</th>
                                                    <th className="px-4 py-2 text-right">Unit Price</th>
                                                    <th className="px-4 py-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y border-t border-b">
                                                {po.items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-purple-50 transition-colors">
                                                        <td className="px-4 py-2 text-blue-900">{item.itemName}</td>
                                                        <td className="px-4 py-2 text-center text-blue-900">{item.quantity} {item.unit}</td>
                                                        <td className="px-4 py-2 text-right text-blue-900">{item.unitPrice}</td>
                                                        <td className="px-4 py-2 text-right text-blue-900">{item.totalPrice}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                                        <button 
                                            onClick={() => onPOAction(po.id, 'Reject')}
                                            className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Reject PO
                                        </button>
                                        <button 
                                            onClick={() => onPOAction(po.id, 'Approve')}
                                            className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
                                        >
                                            Approve PO
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ApprovalsPage;
