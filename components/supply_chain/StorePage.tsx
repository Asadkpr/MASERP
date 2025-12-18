
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
    recipes?: Recipe[];
}

const StorePage: React.FC<StorePageProps> = ({ requests, purchaseRequests, purchaseOrders, inventory, employees, onIssue, onForwardToPurchase, onCreatePurchaseRequest, onCreateSCRequest, onGRN, currentUserEmail, onAddNewAsset, onUpdateAsset, onDeleteAsset, recipes = [] }) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'fulfillment' | 'receiving' | 'purchaseHistory' | 'dishAvailability'>('inventory');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Request (MRF) Modal State
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestCart, setRequestCart] = useState<{ item: InventoryItem; qty: number }[]>([]);
    const [requestPurpose, setRequestPurpose] = useState('');
    const [requestSearchQuery, setRequestSearchQuery] = useState('');
    
    // New Item / Custom Item State for MRF
    const [isCustomItemMode, setIsCustomItemMode] = useState(false);
    const [newItemData, setNewItemData] = useState({ name: '', brand: '', quantity: 1, unit: 'units', description: '' });
    
    // GRN Modal State
    const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [grnData, setGrnData] = useState({ grnNumber: '', remarks: '' });

    // Asset Modal State for Editing Inventory Items
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InventoryItem | null>(null);

    // --- Data Processing ---
    const storeInventory = useMemo(() => {
        return inventory.filter(item => item.type === 'Kitchen');
    }, [inventory]);
    
    const LOW_STOCK_THRESHOLD = 5;
    
    const filteredInventory = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return storeInventory.filter(item => 
            item.model.toLowerCase().includes(query) ||
            (item.itemName && item.itemName.toLowerCase().includes(query)) ||
            (item.itemCode && item.itemCode.toLowerCase().includes(query)) ||
            item.type.toLowerCase().includes(query)
        );
    }, [storeInventory, searchQuery]);

    const requestItems = useMemo(() => {
        if (!requestSearchQuery) return storeInventory;
        const q = requestSearchQuery.toLowerCase();
        return storeInventory.filter(i => i.model.toLowerCase().includes(q));
    }, [storeInventory, requestSearchQuery]);

    const lowStockItems = storeInventory.filter(i => (i.quantity || 0) <= LOW_STOCK_THRESHOLD);
    const approvedRequests = requests.filter(r => r.status === 'Pending Store');
    const approvedPOs = purchaseOrders.filter(po => po.status === 'Approved');

    // --- Dish Availability Logic ---
    const dishAvailability = useMemo(() => {
        return recipes.map(recipe => {
            let maxPortions = Infinity;
            let limitingIngredient = 'None';

            recipe.ingredients.forEach(ing => {
                const stockItem = inventory.find(i => i.model.toLowerCase() === ing.name.toLowerCase() && i.type === 'Kitchen');
                const available = stockItem?.quantity || 0;
                
                if (ing.quantity > 0) {
                    const possible = Math.floor(available / ing.quantity);
                    if (possible < maxPortions) {
                        maxPortions = possible;
                        limitingIngredient = ing.name;
                    }
                }
            });

            return {
                ...recipe,
                maxPortions: maxPortions === Infinity ? 0 : maxPortions,
                limitingIngredient
            };
        });
    }, [recipes, inventory]);


    // --- Handlers ---
    
    const handleOpenRequisition = (initialItem?: InventoryItem) => {
        setRequestCart([]); setRequestPurpose(''); setRequestSearchQuery(''); setIsCustomItemMode(false);
        setNewItemData({ name: '', brand: '', quantity: 1, unit: 'units', description: '' });
        if (initialItem) addToRequestCart(initialItem, 10);
        setIsRequestModalOpen(true);
    };

    const addToRequestCart = (item: InventoryItem, qty: number) => {
        setRequestCart(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + qty } : c);
            return [...prev, { item, qty }];
        });
    };

    const removeFromCart = (id: string) => { setRequestCart(requestCart.filter(c => c.item.id !== id)); };

    const handleSubmitRequisition = async () => {
        if (!onCreateSCRequest) return;
        if (requestCart.length === 0) { alert("Cart is empty"); return; }
        const employee = employees.find(e => e.email === currentUserEmail);
        const requesterName = employee ? `${employee.firstName} ${employee.lastName}` : (currentUserEmail || 'Store Manager');
        const req: Omit<SupplyChainRequest, 'id'> = {
            requesterName, requesterEmail: currentUserEmail || '', department: 'Store', date: new Date().toISOString(), purpose: requestPurpose || 'Store Stock Replenishment', status: 'Pending Account Manager',
            items: requestCart.map(c => ({ inventoryId: c.item.id.startsWith('NEW-') ? '' : c.item.id, name: c.item.model, quantityRequested: c.qty, unit: c.item.unit || 'units' }))
        };
        await onCreateSCRequest(req);
        setIsRequestModalOpen(false);
        alert("Store Requisition (MRF) submitted to Account Manager.");
    };
    
    const handleOpenGRN = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setGrnData({ grnNumber: `GRN-${Date.now()}`, remarks: 'All items received in good condition.' });
        setIsGRNModalOpen(true);
    };

    const handleSubmitGRN = async () => {
        if (!selectedPO) return;
        await onGRN(selectedPO.id, grnData);
        setIsGRNModalOpen(false);
        setSelectedPO(null);
    };

    const handleOpenAddAsset = () => { setEditingAsset(null); setIsAssetModalOpen(true); };
    const handleOpenEditAsset = (asset: InventoryItem) => { setEditingAsset(asset); setIsAssetModalOpen(true); };
    const handleSaveAsset = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
        if (id) onUpdateAsset({ ...assetsData[0], id });
        else onAddNewAsset(assetsData);
        setIsAssetModalOpen(false);
    };

    // --- REFINED ISSUE LOGIC ---
    const handleConfirmIssue = async (reqId: string) => {
        if (window.confirm("Confirm issue? This will deduct items from the main inventory.")) {
            try {
                await onIssue(reqId);
                alert("Materials issued successfully and stock has been updated.");
            } catch (e: any) {
                console.error("Issue Error:", e);
                alert("Error issuing items: " + e.message);
            }
        }
    };

    // --- Render Components ---
    const StatsCard = ({ title, count, colorClass, icon }: any) => (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center border border-slate-200">
            <div className={`p-3 rounded-full ${colorClass} mr-4`}>{icon}</div>
            <div><p className="text-blue-900 text-sm font-medium">{title}</p><p className="text-2xl font-bold text-blue-900">{count}</p></div>
        </div>
    );

    return (
        <div className="max-w-full mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">Store Manager Dashboard</h2>
                <button onClick={() => handleOpenRequisition()} className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 font-medium flex items-center gap-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                    New Store Requisition (MRF)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard title="Total Inventory Items" count={storeInventory.length} colorClass="bg-purple-100 text-purple-900" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
                <StatsCard title="Low Stock Alerts" count={lowStockItems.length} colorClass="bg-red-100 text-red-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                <StatsCard title="Pending Requisitions" count={approvedRequests.length} colorClass="bg-yellow-100 text-yellow-600" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[500px]">
                <div className="border-b border-slate-200 flex flex-wrap">
                    <button onClick={() => setActiveTab('inventory')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}>Inventory & Stock</button>
                    <button onClick={() => setActiveTab('dishAvailability')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dishAvailability' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}>Dish Availability</button>
                    <button onClick={() => setActiveTab('fulfillment')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fulfillment' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}>Fulfillment (Chef Requests)</button>
                    <button onClick={() => setActiveTab('receiving')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'receiving' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}>Receiving (GRN)</button>
                    <button onClick={() => setActiveTab('purchaseHistory')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchaseHistory' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}>Purchase History</button>
                </div>

                <div className="p-6">
                    {activeTab === 'inventory' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <input type="text" placeholder="Search inventory..." className="w-full md:w-96 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none text-blue-900" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <button onClick={handleOpenAddAsset} className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 text-sm font-medium flex items-center gap-2"><span>+ Add Item</span></button>
                            </div>
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="min-w-full text-xs text-left divide-y divide-slate-200 whitespace-nowrap">
                                    <thead className="bg-purple-50 text-blue-900 font-semibold">
                                        <tr><th className="px-4 py-3">Item Code</th><th className="px-4 py-3">Item Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-center">Quantity</th><th className="px-4 py-3">UOM</th><th className="px-4 py-3">Location</th><th className="px-4 py-3 text-center sticky right-0 bg-purple-50 shadow-sm">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredInventory.map(item => (
                                            <tr key={item.id} className="hover:bg-purple-50 transition-colors">
                                                <td className="px-4 py-2 text-blue-900">{item.itemCode || '-'}</td><td className="px-4 py-2 font-medium text-blue-900">{item.itemName || item.model}</td><td className="px-4 py-2 text-blue-900">{item.type}</td><td className="px-4 py-2 text-center font-bold text-blue-900">{item.quantity || 0}</td><td className="px-4 py-2 text-blue-900">{item.unit || '-'}</td><td className="px-4 py-2 text-blue-900">{item.location || '-'}</td>
                                                <td className="px-4 py-2 text-center sticky right-0 bg-white shadow-sm flex gap-2 justify-center">
                                                    <button onClick={() => handleOpenEditAsset(item)} className="text-purple-900 hover:text-purple-950 font-medium">Edit</button>
                                                    <button onClick={() => handleOpenRequisition(item)} className="text-purple-900 hover:text-purple-950 font-medium">+Stock</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'dishAvailability' && (
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left divide-y divide-slate-200">
                                <thead className="bg-purple-50 text-blue-900 font-semibold uppercase">
                                    <tr><th className="px-6 py-4">Dish Name</th><th className="px-6 py-4 text-center">Max Portions Available</th><th className="px-6 py-4">Limiting Ingredient</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dishAvailability.map(dish => (
                                        <tr key={dish.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-blue-900">{dish.name}</td>
                                            <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full font-bold ${dish.maxPortions > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{dish.maxPortions}</span></td>
                                            <td className="px-6 py-4 text-red-600 font-medium">{dish.limitingIngredient}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'fulfillment' && (
                        <div>
                            {approvedRequests.length === 0 ? (
                                <p className="text-center text-blue-900 py-10">No pending requests from chefs.</p>
                            ) : (
                                <div className="space-y-6">
                                    {approvedRequests.map(req => (
                                        <div key={req.id} className="bg-purple-50 p-6 rounded-lg border border-l-4 border-l-purple-900 flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2"><h3 className="font-bold text-lg text-blue-900">{req.requesterName}</h3><span className="text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold uppercase">Ready to Issue</span></div>
                                                <p className="text-sm text-blue-900 mb-4">{req.department} • Requested: {new Date(req.date).toLocaleString()}</p>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4"><p className="text-sm text-blue-900"><span className="font-bold block mb-1">Purpose:</span>{req.purpose}</p></div>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <table className="w-full text-sm">
                                                        <thead><tr className="text-left text-blue-900"><th className="pb-2">Item</th><th className="pb-2 text-right">Qty to Issue</th></tr></thead>
                                                        <tbody className="divide-y border-t border-slate-100">
                                                            {req.items.map((item, idx) => (
                                                                <tr key={idx}><td className="py-2 font-medium text-blue-900">{item.name}</td><td className="py-2 text-right font-mono text-blue-900">{item.quantityRequested} {item.unit}</td></tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="md:w-48 flex flex-col justify-center gap-3">
                                                <button onClick={() => handleConfirmIssue(req.id)} className="w-full bg-purple-900 text-white py-2 rounded-lg font-bold hover:bg-purple-800 transition-all shadow-md text-sm">Issue Items</button>
                                                <button onClick={() => onForwardToPurchase(req.id)} className="w-full bg-orange-100 text-orange-700 border border-orange-200 py-2 rounded-lg font-bold hover:bg-orange-200 text-sm">Forward to Purchase</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'receiving' && (
                        <div>
                            {approvedPOs.length === 0 ? <p className="text-center text-blue-900 py-10">No pending purchase orders to receive.</p> : (
                                <div className="space-y-6">
                                    {approvedPOs.map(po => (
                                        <div key={po.id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                                            <div className="flex justify-between items-center mb-4"><div><h3 className="font-bold text-lg text-blue-900">PO #{po.poNumber}</h3><p className="text-sm text-blue-900">Vendor: {po.vendorName}</p></div><span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">Awaiting Delivery</span></div>
                                            <div className="mb-4"><table className="w-full text-sm text-left"><thead className="bg-purple-50 text-blue-900"><tr><th className="px-4 py-2">Item</th><th className="px-4 py-2 text-center">Qty to Receive</th></tr></thead><tbody className="divide-y border-t border-slate-100">{po.items.map((item, idx) => (<tr key={idx}><td className="px-4 py-2 text-blue-900">{item.itemName}</td><td className="px-4 py-2 text-center font-bold text-blue-900">{item.quantity} {item.unit}</td></tr>))}</tbody></table></div>
                                            <div className="flex justify-end"><button onClick={() => handleOpenGRN(po)} className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700">Generate GRN & Add Stock</button></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsRequestModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center border-slate-200"><h2 className="text-xl font-bold text-blue-900">Create Store Requisition (MRF)</h2><button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button></div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex mb-4 border-b border-slate-200 shrink-0"><button className={`flex-1 pb-2 text-sm font-medium ${!isCustomItemMode ? 'border-b-2 border-purple-900 text-purple-900' : 'text-blue-900'}`} onClick={() => setIsCustomItemMode(false)}>Inventory</button><button className={`flex-1 pb-2 text-sm font-medium ${isCustomItemMode ? 'border-b-2 border-purple-900 text-purple-900' : 'text-blue-900'}`} onClick={() => setIsCustomItemMode(true)}>Custom Item</button></div>
                                {!isCustomItemMode ? (
                                    <>
                                        <input type="text" placeholder="Search items..." className="w-full px-3 py-2 border border-slate-200 rounded-lg mb-3 text-sm focus:ring-purple-900 text-blue-900" value={requestSearchQuery} onChange={(e) => setRequestSearchQuery(e.target.value)} />
                                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg"><table className="w-full text-sm text-left"><thead className="bg-purple-50 text-blue-900 sticky top-0"><tr><th className="px-3 py-2">Item</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2"></th></tr></thead><tbody className="divide-y divide-slate-100">{requestItems.map(item => (<tr key={item.id} className="hover:bg-purple-50"><td className="px-3 py-2 font-medium text-blue-900">{item.model}</td><td className={`px-3 py-2 ${item.quantity! <= LOW_STOCK_THRESHOLD ? 'text-red-600 font-bold' : 'text-blue-900'}`}>{item.quantity} {item.unit}</td><td className="px-3 py-2 text-right"><button onClick={() => addToRequestCart(item, 10)} className="text-xs bg-purple-900 text-white px-2 py-1 rounded hover:bg-purple-800">Add</button></td></tr>))}</tbody></table></div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-blue-900" placeholder="Item Name" value={newItemData.name} onChange={e => setNewItemData({...newItemData, name: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" className="w-full px-3 py-2 border rounded-lg text-blue-900" value={newItemData.quantity} onChange={e => setNewItemData({...newItemData, quantity: parseFloat(e.target.value) || 0})} />
                                            <input type="text" className="w-full px-3 py-2 border rounded-lg text-blue-900" placeholder="Unit" value={newItemData.unit} onChange={e => setNewItemData({...newItemData, unit: e.target.value})} />
                                        </div>
                                        <button onClick={() => { if(!newItemData.name) return; const tempId = `NEW-${Date.now()}`; addToRequestCart({ id: tempId, model: newItemData.name, type: 'Kitchen', status: 'In Stock', assignedTo: '', quantity: 0, unit: newItemData.unit }, newItemData.quantity); setNewItemData({ name: '', brand: '', quantity: 1, unit: 'units', description: '' }); }} className="w-full bg-purple-900 text-white py-2 rounded-lg">Add to Cart</button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col h-full bg-purple-50 rounded border border-purple-200 p-4 overflow-hidden">
                                <h3 className="font-bold text-blue-900 mb-2 shrink-0">Cart</h3>
                                <div className="flex-1 overflow-y-auto mb-4 bg-white rounded border border-slate-200 p-2">{requestCart.length === 0 ? <p className="text-slate-400 text-center text-sm py-10">Empty</p> : (<ul className="space-y-2">{requestCart.map((c, idx) => (<li key={idx} className="bg-white p-2 rounded border shadow-sm flex justify-between items-center text-sm"><div><p className="font-medium text-blue-900">{c.item.model}</p></div><div className="flex items-center gap-2"><input type="number" min="1" value={c.qty} onChange={(e) => setRequestCart(prev => prev.map((item, i) => i === idx ? { ...item, qty: parseInt(e.target.value) || 0 } : item))} className="w-16 px-1 py-1 border rounded text-center text-blue-900" /><button onClick={() => removeFromCart(c.item.id)} className="text-red-500 hover:text-red-700">&times;</button></div></li>))}</ul>)}</div>
                                <textarea value={requestPurpose} onChange={(e) => setRequestPurpose(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-4 text-blue-900" rows={2} placeholder="Purpose..."></textarea>
                                <button onClick={handleSubmitRequisition} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">Submit Requisition</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isGRNModalOpen && selectedPO && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsGRNModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Generate GRN for PO #{selectedPO.poNumber}</h3>
                        <div className="space-y-4">
                            <input type="text" value={grnData.grnNumber} onChange={e => setGrnData({...grnData, grnNumber: e.target.value})} className="w-full border rounded p-2 text-blue-900" placeholder="GRN Number" />
                            <textarea value={grnData.remarks} onChange={e => setGrnData({...grnData, remarks: e.target.value})} className="w-full border rounded p-2 text-blue-900" rows={3} placeholder="Remarks"></textarea>
                            <button onClick={handleSubmitGRN} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold">Confirm Receipt & Add Stock</button>
                        </div>
                    </div>
                </div>
            )}
            
            <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} onSave={handleSaveAsset} editingAsset={editingAsset} employees={employees} initialType="Kitchen" />
        </div>
    );
};

export default StorePage;
