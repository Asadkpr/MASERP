
import React, { useState, useMemo } from 'react';
import type { SupplyChainRequest, InventoryItem, PurchaseRequest, Employee, Recipe, PurchaseOrder } from '../../types';
import AssetModal from '../modals/AssetModal';

interface StorePageProps {
    requests: SupplyChainRequest[];
    purchaseRequests: PurchaseRequest[];
    purchaseOrders: PurchaseOrder[];
    inventory: InventoryItem[];
    employees: Employee[];
    onIssue: (id: string) => Promise<boolean | void>;
    onForwardToPurchase: (id: string) => Promise<void>;
    onCreatePurchaseRequest: (req: Omit<PurchaseRequest, 'id'>) => Promise<void>;
    onCreateSCRequest?: (req: Omit<SupplyChainRequest, 'id'>) => Promise<void>;
    onGRN: (poId: string, receivedData: { grnNumber: string, remarks: string }) => Promise<void>;
    currentUserEmail: string;
    onAddNewAsset: (assets: Omit<InventoryItem, 'id'>[]) => void;
    onUpdateAsset: (asset: InventoryItem) => void;
    onDeleteAsset: (assetId: string) => void;
    onIssueAsset: (assetId: string, employeeName: string) => Promise<void>;
    onReturnAsset: (assetId: string) => Promise<void>;
    recipes?: Recipe[];
}

const StorePage: React.FC<StorePageProps> = ({ requests, purchaseRequests, purchaseOrders, inventory, employees, onIssue, onForwardToPurchase, onCreatePurchaseRequest, onCreateSCRequest, onGRN, currentUserEmail, onAddNewAsset, onUpdateAsset, onDeleteAsset, onIssueAsset, onReturnAsset, recipes = [] }) => {
    const [activeTab, setActiveTab] = useState<'consumables' | 'fixedAssets' | 'fulfillment' | 'receiving'>('consumables');
    const [searchQuery, setSearchQuery] = useState('');
    
    // UI Modals
    const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [grnData, setGrnData] = useState({ grnNumber: '', remarks: '' });
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InventoryItem | null>(null);

    // --- Data Processing (UNIQUE & CATEGORIZED) ---
    const uniqueInventory = useMemo(() => {
        const map = new Map<string, InventoryItem>();
        inventory.forEach(item => {
            if (item.id) map.set(item.id, item);
        });
        return Array.from(map.values());
    }, [inventory]);

    // Split unique items into Consumables (Ingredients/Ration) and Fixed Assets (Machinery/Equipment)
    const kitchenConsumables = useMemo(() => {
        return uniqueInventory.filter(item => 
            item.type === 'Kitchen' && 
            !['Oven', 'Mixer', 'Fridge', 'Chiller', 'Blender', 'Stove', 'Microwave', 'Equipment', 'Table', 'Station', 'Range', 'Grinder', 'Dishwasher'].some(kw => 
                item.model.includes(kw) || 
                (item.itemName && item.itemName.includes(kw)) ||
                (item.subCategory && (item.subCategory.includes('Equipment') || item.subCategory.includes('Furniture') || item.subCategory.includes('Tools')))
            )
        );
    }, [uniqueInventory]);

    const kitchenFixedAssets = useMemo(() => {
        return uniqueInventory.filter(item => 
            item.type === 'Kitchen' && 
            ['Oven', 'Mixer', 'Fridge', 'Chiller', 'Blender', 'Stove', 'Microwave', 'Equipment', 'Tool', 'Table', 'Station', 'Range', 'Grinder', 'Dishwasher'].some(kw => 
                item.model.includes(kw) || 
                (item.itemName && item.itemName.includes(kw)) ||
                (item.subCategory && (item.subCategory.includes('Equipment') || item.subCategory.includes('Furniture') || item.subCategory.includes('Tools')))
            )
        );
    }, [uniqueInventory]);

    // --- Stats for Counters ---
    const stats = useMemo(() => {
        const totalItems = uniqueInventory.length;
        const lowStockCount = uniqueInventory.filter(i => (i.quantity || 0) <= 5).length;
        const pendingReqsCount = requests.filter(r => r.status === 'Pending Store').length;
        return { totalItems, lowStockCount, pendingReqsCount };
    }, [uniqueInventory, requests]);

    const filteredConsumables = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return kitchenConsumables.filter(item => 
            item.model.toLowerCase().includes(q) || 
            (item.itemCode && item.itemCode.toLowerCase().includes(q))
        );
    }, [kitchenConsumables, searchQuery]);

    const filteredFixedAssets = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return kitchenFixedAssets.filter(item => 
            item.model.toLowerCase().includes(q) || 
            (item.itemName && item.itemName.toLowerCase().includes(q)) ||
            (item.itemCode && item.itemCode.toLowerCase().includes(q)) ||
            (item.assignedTo && item.assignedTo.toLowerCase().includes(q)) ||
            (item.location && item.location.toLowerCase().includes(q)) ||
            (item.material && item.material.toLowerCase().includes(q))
        );
    }, [kitchenFixedAssets, searchQuery]);

    const approvedRequests = requests.filter(r => r.status === 'Pending Store');
    const approvedPOs = purchaseOrders.filter(po => po.status === 'Approved');

    // --- Handlers ---
    const handleIssueAssetClick = async (assetId: string) => {
        const employeeName = prompt("Enter Chef/Employee name to issue this equipment:");
        if (!employeeName) return;
        const exists = employees.some(e => `${e.firstName} ${e.lastName}`.toLowerCase() === employeeName.toLowerCase());
        if (!exists) { alert("Employee not found in records."); return; }
        
        try {
            await onIssueAsset(assetId, employeeName);
            alert("Equipment issued to " + employeeName);
        } catch (e: any) { alert(e.message); }
    };

    const handleReturnAssetClick = async (assetId: string) => {
        if (window.confirm("Confirm return of this equipment to main store stock?")) {
            await onReturnAsset(assetId);
            alert("Equipment returned to stock.");
        }
    };

    const handleOpenAddAsset = () => {
        setEditingAsset(null);
        setIsAssetModalOpen(true);
    };

    const handleConfirmIssue = async (reqId: string) => {
        if (window.confirm("Issue these consumables now? Stock will be updated automatically.")) {
            await onIssue(reqId);
            alert("Materials issued to Kitchen.");
        }
    };

    const handleSaveAsset = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
        if (id && assetsData.length === 1) {
            onUpdateAsset({ ...assetsData[0], id } as InventoryItem);
        } else {
            onAddNewAsset(assetsData);
        }
        setIsAssetModalOpen(false);
        setEditingAsset(null);
    };

    return (
        <div className="max-w-full mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Store Management & Fulfillment</h2>
                    <p className="text-sm text-blue-600 font-medium">Managing Kitchen Inventory (Ration) and Fixed Assets (Professional Equipment).</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-purple-100 text-purple-900 border border-purple-200 rounded-lg hover:bg-purple-200 font-bold text-sm flex items-center gap-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Generate MRF
                    </button>
                    <button onClick={handleOpenAddAsset} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium text-sm flex items-center gap-2 shadow-sm">
                        <span>+ Add Kitchen Asset</span>
                    </button>
                </div>
            </div>

            {/* --- STATS COUNTERS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inventory Items</p>
                        <p className="text-2xl font-black text-blue-900">{stats.totalItems}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
                        <p className="text-2xl font-black text-red-600">{stats.lowStockCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requisitions</p>
                        <p className="text-2xl font-black text-purple-900">{stats.pendingReqsCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                {/* Modern Tab Header */}
                <div className="flex border-b border-slate-200 bg-slate-50 p-1 gap-1">
                    {[
                        { id: 'consumables', label: 'Consumables (Ration)', count: kitchenConsumables.length },
                        { id: 'fixedAssets', label: 'Fixed Assets (Machinery)', count: kitchenFixedAssets.length },
                        { id: 'fulfillment', label: 'Pending Fulfillments', count: approvedRequests.length },
                        { id: 'receiving', label: 'PO Receiving (GRN)', count: approvedPOs.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
                            className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-purple-900 text-white shadow-md scale-[1.02]' : 'text-blue-900 hover:bg-white hover:shadow-sm'}`}
                        >
                            {tab.label} <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-purple-700' : 'bg-slate-200'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <div className="mb-6 relative max-w-md">
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab === 'fixedAssets' ? 'Assets, Codes, Materials...' : activeTab}...`} 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 outline-none shadow-sm" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                        <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    {/* 1. CONSUMABLES TABLE */}
                    {activeTab === 'consumables' && (
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="min-w-full text-sm text-left divide-y divide-slate-200">
                                <thead className="bg-purple-50 text-blue-900 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 border-r">Item Code</th>
                                        <th className="px-6 py-4 border-r">Ingredient Name</th>
                                        <th className="px-6 py-4 border-r text-center">Available Stock</th>
                                        <th className="px-6 py-4 border-r">Unit</th>
                                        <th className="px-6 py-4 border-r">Storage Location</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredConsumables.map(item => (
                                        <tr key={item.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-blue-800 border-r">{item.itemCode || '-'}</td>
                                            <td className="px-6 py-4 font-bold text-blue-900 border-r">{item.model}</td>
                                            <td className="px-6 py-4 text-center border-r">
                                                <span className={`px-3 py-1 rounded-full font-bold ${item.quantity! <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {item.quantity || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-blue-800 border-r">{item.unit || '-'}</td>
                                            <td className="px-6 py-4 text-blue-800 border-r">{item.location || '-'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => { setEditingAsset(item); setIsAssetModalOpen(true); }} className="text-purple-900 hover:underline font-bold">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 2. FIXED ASSETS TABLE */}
                    {activeTab === 'fixedAssets' && (
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                            <table className="min-w-full text-[11px] text-left divide-y divide-slate-200 whitespace-nowrap">
                                <thead className="bg-blue-50 text-blue-900 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3 py-3 border-r">Sr No</th>
                                        <th className="px-3 py-3 border-r">Asset Code</th>
                                        <th className="px-3 py-3 border-r">Item Name</th>
                                        <th className="px-3 py-3 border-r">Category</th>
                                        <th className="px-3 py-3 border-r">Material</th>
                                        <th className="px-3 py-3 border-r text-center">Quantity</th>
                                        <th className="px-3 py-3 border-r">Unit (pcs/..)</th>
                                        <th className="px-3 py-3 border-r">Condition</th>
                                        <th className="px-3 py-3 border-r">Purchase Date</th>
                                        <th className="px-3 py-3 border-r">Purchase Price</th>
                                        <th className="px-3 py-3 border-r">Assigned L</th>
                                        <th className="px-3 py-3 border-r">Responsible Person</th>
                                        <th className="px-3 py-3 border-r">Remarks</th>
                                        <th className="px-3 py-3 text-right">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredFixedAssets.map((asset, index) => (
                                        <tr key={asset.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-3 py-3 border-r text-slate-500 font-medium text-center">{index + 1}</td>
                                            <td className="px-3 py-3 border-r font-mono text-blue-900 font-bold">{asset.itemCode || '-'}</td>
                                            <td className="px-3 py-3 border-r font-bold text-blue-900">{asset.itemName || asset.model}</td>
                                            <td className="px-3 py-3 border-r text-blue-800">{asset.subCategory || asset.type}</td>
                                            <td className="px-3 py-3 border-r text-blue-800 font-medium">{asset.material || '-'}</td>
                                            <td className="px-3 py-3 border-r text-center font-bold text-blue-900">{asset.quantity || 0}</td>
                                            <td className="px-3 py-3 border-r text-blue-800">{asset.unit || 'Pcs'}</td>
                                            <td className="px-3 py-3 border-r">
                                                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${asset.condition === 'Excellent' || asset.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {asset.condition || 'Good'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 border-r text-blue-800">{asset.purchaseDate || '-'}</td>
                                            <td className="px-3 py-3 border-r text-blue-900 font-mono">PKR {asset.cost || '0'}</td>
                                            <td className="px-3 py-3 border-r text-blue-800 font-medium">{asset.location || 'Store'}</td>
                                            <td className="px-3 py-3 border-r text-blue-900 font-bold underline decoration-blue-200">{asset.assignedTo || 'In Store'}</td>
                                            <td className="px-3 py-3 border-r text-blue-600 italic max-w-xs truncate" title={asset.remarks}>{asset.remarks || '-'}</td>
                                            <td className="px-3 py-3 text-right space-x-2">
                                                {asset.status === 'In Stock' ? (
                                                    <button onClick={() => handleIssueAssetClick(asset.id)} className="text-green-600 font-bold hover:underline">Issue</button>
                                                ) : (
                                                    <button onClick={() => handleReturnAssetClick(asset.id)} className="text-orange-600 font-bold hover:underline">Return</button>
                                                )}
                                                <button onClick={() => { setEditingAsset(asset); setIsAssetModalOpen(true); }} className="text-blue-900 font-bold hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 3. FULFILLMENT */}
                    {activeTab === 'fulfillment' && (
                        <div className="space-y-4">
                            {approvedRequests.length === 0 ? (
                                <p className="text-center py-20 text-slate-400 italic">No approved requisitions to fulfill at this moment.</p>
                            ) : (
                                approvedRequests.map(req => (
                                    <div key={req.id} className="p-5 bg-purple-50 border border-purple-200 rounded-xl flex justify-between items-center group hover:bg-purple-100 transition-all shadow-sm">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-blue-900">{req.requesterName}</h3>
                                                <span className="text-[10px] font-bold bg-white border border-purple-300 text-purple-900 px-2 py-0.5 rounded uppercase">{req.department}</span>
                                            </div>
                                            <p className="text-sm text-blue-800 mb-3 font-medium italic">Purpose: {req.purpose}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {req.items.map((item, idx) => (
                                                    <span key={idx} className="bg-white px-2 py-1 rounded border border-purple-200 text-xs font-mono text-blue-900 shadow-xs">
                                                        {item.name}: {item.quantityRequested} {item.unit}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleConfirmIssue(req.id)} className="bg-purple-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-800 shadow-sm transition-transform active:scale-95">Issue Materials</button>
                                            <button onClick={() => onForwardToPurchase(req.id)} className="bg-white text-purple-900 border border-purple-900 px-4 py-3 rounded-lg font-bold hover:bg-purple-50">Market Buy</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* 4. RECEIVING (GRN) */}
                    {activeTab === 'receiving' && (
                        <div className="space-y-4">
                            {approvedPOs.length === 0 ? (
                                <p className="text-center py-20 text-slate-400 italic">No approved Purchase Orders to receive.</p>
                            ) : (
                                approvedPOs.map(po => (
                                    <div key={po.id} className="p-5 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center group shadow-sm">
                                        <div>
                                            <h3 className="font-bold text-lg text-blue-900">PO #{po.poNumber}</h3>
                                            <p className="text-sm text-blue-800 font-medium">Vendor: {po.vendorName} • Value: PKR {po.totalAmount.toLocaleString()}</p>
                                            <p className="text-xs text-blue-700 mt-2 font-mono">Items: {po.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')}</p>
                                        </div>
                                        <button onClick={() => { setSelectedPO(po); setGrnData({ grnNumber: `GRN-${Date.now().toString().slice(-4)}`, remarks: 'Received in good condition.' }); setIsGRNModalOpen(true); }} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 shadow-sm transition-transform active:scale-95">Accept Delivery (GRN)</button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* GRN Completion Modal */}
            {isGRNModalOpen && selectedPO && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setIsGRNModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-blue-900 mb-2">Generate GRN</h3>
                        <p className="text-sm text-blue-600 mb-6 font-medium">Accepting items for PO #{selectedPO.poNumber}</p>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-blue-900 uppercase block mb-1">GRN Ref Number</label>
                                <input type="text" value={grnData.grnNumber} onChange={e => setGrnData({...grnData, grnNumber: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-blue-900 focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-blue-900 uppercase block mb-1">Remarks</label>
                                <textarea value={grnData.remarks} onChange={e => setGrnData({...grnData, remarks: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-blue-900 focus:ring-2 focus:ring-green-500 outline-none" rows={3}></textarea>
                            </div>
                            <button onClick={async () => { await onGRN(selectedPO.id, grnData); setIsGRNModalOpen(false); alert("Inventory successfully updated."); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg mt-2 transition-all">Confirm Receipt</button>
                        </div>
                    </div>
                </div>
            )}
            
            <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onSave={handleSaveAsset} editingAsset={editingAsset} employees={employees} initialType="Kitchen" />
        </div>
    );
};

export default StorePage;
