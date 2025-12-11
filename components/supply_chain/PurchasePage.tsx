
import React, { useState, useMemo } from 'react';
import type { SupplyChainRequest, PurchaseRequest, Vendor, PurchaseOrder } from '../../types';

interface PurchasePageProps {
    requests: SupplyChainRequest[];
    purchaseRequests: PurchaseRequest[];
    vendors: Vendor[];
    purchaseOrders: PurchaseOrder[];
    onCreatePO: (po: Omit<PurchaseOrder, 'id'>) => Promise<void>;
    onUpdatePO?: (poId: string, updatedData: Partial<Omit<PurchaseOrder, 'id'>>) => Promise<void>;
    onDeletePO?: (poId: string) => Promise<void>;
    currentUserEmail: string;
}

const PurchasePage: React.FC<PurchasePageProps> = ({ requests, purchaseRequests, vendors, purchaseOrders, onCreatePO, onUpdatePO, onDeletePO, currentUserEmail }) => {
    // Combine forwarded SC requests and internal purchase requests into a "To Buy" list
    // Ideally, normalize them, but for this demo we'll focus on SC Requests
    
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<SupplyChainRequest | null>(null);
    const [poForm, setPoForm] = useState({
        vendorId: '',
        price: 0,
    });

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
    const [editForm, setEditForm] = useState({
        vendorId: '',
        totalAmount: 0,
        status: 'Pending Account Manager' as PurchaseOrder['status']
    });

    const requestsToProcess = requests.filter(r => r.status === 'Forwarded to Purchase');

    const handleCreatePO = async () => {
        if (!selectedRequest || !poForm.vendorId) return;
        
        const vendor = vendors.find(v => v.id === poForm.vendorId);
        if (!vendor) return;

        // Calculate total (assuming simple price per total unit for now or just raw input)
        // In real app, price per item line is needed. Here we assume the input is total PO cost for simplicity
        const totalCost = poForm.price; 

        const newPO: Omit<PurchaseOrder, 'id'> = {
            poNumber: `PO-${Date.now().toString().slice(-6)}`,
            originalRequestId: selectedRequest.id,
            vendorId: vendor.id,
            vendorName: vendor.name,
            date: new Date().toISOString(),
            status: 'Pending Account Manager',
            generatedBy: currentUserEmail,
            totalAmount: totalCost,
            items: selectedRequest.items.map(item => ({
                itemName: item.name,
                quantity: item.quantityRequested,
                unit: item.unit,
                unitPrice: totalCost / selectedRequest.items.length, // Placeholder logic
                totalPrice: totalCost / selectedRequest.items.length,
                inventoryId: item.inventoryId
            }))
        };

        await onCreatePO(newPO);
        setSelectedRequest(null);
        setPoForm({ vendorId: '', price: 0 });
        alert("Purchase Order created and sent to Account Manager for approval.");
    };

    const handleEditClick = (po: PurchaseOrder) => {
        setEditingPO(po);
        setEditForm({
            vendorId: po.vendorId,
            totalAmount: po.totalAmount,
            status: po.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPO || !onUpdatePO) return;

        const vendor = vendors.find(v => v.id === editForm.vendorId);
        
        await onUpdatePO(editingPO.id, {
            vendorId: editForm.vendorId,
            vendorName: vendor?.name || editingPO.vendorName,
            totalAmount: editForm.totalAmount,
            status: editForm.status
        });

        setIsEditModalOpen(false);
        setEditingPO(null);
    };

    const getStatusColor = (status: PurchaseOrder['status']) => {
        switch (status) {
            case 'Pending Account Manager': return 'bg-yellow-100 text-yellow-800';
            case 'Approved': return 'bg-blue-100 text-blue-800';
            case 'Received': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">Purchase Department</h2>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'pending'
                                ? 'border-blue-900 text-blue-900'
                                : 'border-transparent text-blue-900 hover:text-blue-800 hover:border-slate-300'
                        }`}
                    >
                        Process Requests ({requestsToProcess.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'history'
                                ? 'border-blue-900 text-blue-900'
                                : 'border-transparent text-blue-900 hover:text-blue-800 hover:border-slate-300'
                        }`}
                    >
                        Purchase History
                    </button>
                </nav>
            </div>

            {/* PENDING REQUESTS VIEW */}
            {activeTab === 'pending' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LIST OF REQUESTS */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Requests to Process</h3>
                        {requestsToProcess.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-blue-900">
                                No requests forwarded from Store.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requestsToProcess.map(req => (
                                    <div 
                                        key={req.id} 
                                        className={`bg-white p-4 rounded-lg shadow-sm border-2 cursor-pointer transition-all ${selectedRequest?.id === req.id ? 'border-blue-900 ring-2 ring-blue-100' : 'border-transparent hover:border-slate-300'}`}
                                        onClick={() => setSelectedRequest(req)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-blue-900">{req.purpose}</h4>
                                            <span className="text-xs font-mono text-blue-900">{new Date(req.date).toLocaleDateString()}</span >
                                        </div>
                                        <p className="text-sm text-blue-900 mb-2">From: {req.requesterName} ({req.department})</p>
                                        <div className="bg-purple-50 p-2 rounded text-xs text-blue-900">
                                            <strong>Items:</strong> {req.items.map(i => `${i.name} (${i.quantityRequested} ${i.unit})`).join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PO GENERATION FORM */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-fit sticky top-6">
                        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">Create Purchase Order</h3>
                        
                        {selectedRequest ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Selected Request</label>
                                    <div className="p-3 bg-purple-50 border border-purple-100 rounded text-sm text-blue-900">
                                        {selectedRequest.purpose} ({selectedRequest.items.length} items)
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Date</label>
                                    <input type="text" value={new Date().toLocaleDateString()} disabled className="w-full bg-slate-100 border rounded p-2 text-blue-900 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Select Vendor</label>
                                    <select 
                                        value={poForm.vendorId} 
                                        onChange={e => setPoForm({...poForm, vendorId: e.target.value})}
                                        className="w-full border rounded p-2 focus:ring-blue-900 text-blue-900"
                                    >
                                        <option value="">-- Choose Vendor --</option>
                                        {vendors.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Total Estimated Cost (PKR)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={poForm.price} 
                                        onChange={e => setPoForm({...poForm, price: parseFloat(e.target.value)})}
                                        className="w-full border rounded p-2 focus:ring-blue-900 text-blue-900"
                                    />
                                </div>

                                <button 
                                    onClick={handleCreatePO}
                                    disabled={!poForm.vendorId || poForm.price <= 0}
                                    className="w-full bg-blue-900 text-white py-2 rounded font-medium hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Generate PO for Approval
                                </button>
                            </div>
                        ) : (
                            <p className="text-blue-900 text-sm text-center py-10">Select a request from the list to generate a Purchase Order.</p>
                        )}
                    </div>
                </div>
            )}

            {/* HISTORY VIEW */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-purple-50 text-blue-900 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">GRN Info</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {purchaseOrders.length > 0 ? purchaseOrders.map(po => (
                                <tr key={po.id} className="hover:bg-purple-50 transition-colors">
                                    <td className="px-6 py-4 text-blue-900">{new Date(po.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-mono font-medium text-blue-900">{po.poNumber}</td>
                                    <td className="px-6 py-4 text-blue-900">{po.vendorName}</td>
                                    <td className="px-6 py-4 text-blue-900">
                                        <div className="max-w-xs truncate" title={po.items.map(i => i.itemName).join(', ')}>
                                            {po.items.length} items ({po.items[0]?.itemName}...)
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-blue-900">PKR {po.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(po.status)}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-blue-900">
                                        {po.grnNumber ? (
                                            <div>
                                                <p className="font-semibold text-green-700">{po.grnNumber}</p>
                                                <p>{new Date(po.grnDate!).toLocaleDateString()}</p>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleEditClick(po)}
                                                className="text-blue-900 hover:text-blue-950 text-xs font-medium"
                                                title="Edit PO"
                                                disabled={po.status === 'Received'} // Disable edit if already received
                                            >
                                                Edit
                                            </button>
                                            <span className="text-blue-300">|</span>
                                            <button 
                                                onClick={() => onDeletePO && onDeletePO(po.id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                title="Delete PO"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-blue-900">
                                        No purchase history available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* EDIT PO MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-blue-900 mb-4 border-b pb-2">Edit Purchase Order</h3>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Vendor</label>
                                <select 
                                    value={editForm.vendorId} 
                                    onChange={e => setEditForm({...editForm, vendorId: e.target.value})}
                                    className="w-full border rounded p-2 focus:ring-blue-900 text-blue-900"
                                >
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Total Amount (PKR)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={editForm.totalAmount} 
                                    onChange={e => setEditForm({...editForm, totalAmount: parseFloat(e.target.value)})}
                                    className="w-full border rounded p-2 focus:ring-blue-900 text-blue-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Status</label>
                                <select 
                                    value={editForm.status} 
                                    onChange={e => setEditForm({...editForm, status: e.target.value as PurchaseOrder['status']})}
                                    className="w-full border rounded p-2 focus:ring-blue-900 text-blue-900"
                                >
                                    <option value="Pending Account Manager">Pending Account Manager</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    {/* Received status usually set by GRN, but allowing manual override if needed */}
                                    <option value="Received">Received</option> 
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border rounded text-blue-900 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchasePage;
