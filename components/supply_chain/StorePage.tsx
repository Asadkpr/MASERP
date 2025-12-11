
import React, { useState, useMemo } from 'react';
import type { SupplyChainRequest, InventoryItem, PurchaseRequest, Employee, Recipe, PurchaseOrder } from '../../types';
import AssetModal from '../modals/AssetModal';

interface StorePageProps {
    requests: SupplyChainRequest[];
    purchaseRequests: PurchaseRequest[];
    purchaseOrders: PurchaseOrder[];
    inventory: InventoryItem[];
    employees: Employee[];
    onIssue: (id: string) => Promise<void>;
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
    // Strict Filter: Only show Kitchen/Culinary items in the Supply Chain Store
    const storeInventory = useMemo(() => {
        return inventory.filter(item => item.type === 'Kitchen');
    }, [inventory]);
    
    // Status Logic: Low Stock if <= 5
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

    // Filter for the request modal
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
    
    // Open MRF Modal
    const handleOpenRequisition = (initialItem?: InventoryItem) => {
        setRequestCart([]);
        setRequestPurpose('');
        setRequestSearchQuery('');
        setIsCustomItemMode(false);
        setNewItemData({ name: '', brand: '', quantity: 1, unit: 'units', description: '' });
        
        if (initialItem) {
            addToRequestCart(initialItem, 10); // Default to 10 for quick restock
        }
        setIsRequestModalOpen(true);
    };

    const addToRequestCart = (item: InventoryItem, qty: number) => {
        setRequestCart(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) {
                return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + qty } : c);
            }
            return [...prev, { item, qty }];
        });
    };

    const addCustomItemToCart = () => {
        if (!newItemData.name) {
            alert("Item Name is required");
            return;
        }

        // Create a temporary InventoryItem structure for the cart
        // We use a special ID prefix 'NEW-' to identify it later
        const tempId = `NEW-${Date.now()}`;
        const displayName = newItemData.brand 
            ? `${newItemData.name} (${newItemData.brand})` 
            : newItemData.name;

        const customItem: InventoryItem = {
            id: tempId,
            model: displayName,
            type: 'Kitchen',
            status: 'In Stock',
            assignedTo: '',
            quantity: 0, // It's new, so we theoretically have 0
            unit: newItemData.unit,
            others: newItemData.description
        };

        addToRequestCart(customItem, newItemData.quantity);
        setNewItemData({ name: '', brand: '', quantity: 1, unit: 'units', description: '' });
        // Optional: switch back to list or stay to add more
        alert("Custom item added to cart.");
    };

    const removeFromCart = (id: string) => {
        setRequestCart(requestCart.filter(c => c.item.id !== id));
    };

    const handleSubmitRequisition = async () => {
        if (!onCreateSCRequest) return;
        if (requestCart.length === 0) {
            alert("Cart is empty");
            return;
        }

        const employee = employees.find(e => e.email === currentUserEmail);
        const requesterName = employee ? `${employee.firstName} ${employee.lastName}` : (currentUserEmail || 'Store Manager');

        const req: Omit<SupplyChainRequest, 'id'> = {
            requesterName,
            requesterEmail: currentUserEmail || '',
            department: 'Store',
            date: new Date().toISOString(),
            purpose: requestPurpose || 'Store Stock Replenishment',
            status: 'Pending Account Manager', // Flow: Store -> Account Manager -> Purchase
            items: requestCart.map(c => ({
                // If it's a new custom item (ID starts with NEW-), send empty inventoryId so Purchase Dept knows it's new
                inventoryId: c.item.id.startsWith('NEW-') ? '' : c.item.id,
                name: c.item.model,
                quantityRequested: c.qty,
                unit: c.item.unit || 'units'
            }))
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

    const handleOpenAddAsset = () => {
        setEditingAsset(null);
        setIsAssetModalOpen(true);
    };

    const handleOpenEditAsset = (asset: InventoryItem) => {
        setEditingAsset(asset);
        setIsAssetModalOpen(true);
    };

    const handleSaveAsset = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
        if (id) {
            onUpdateAsset({ ...assetsData[0], id });
        } else {
            onAddNewAsset(assetsData);
        }
        setIsAssetModalOpen(false);
    };

    // --- Render Components ---

    const StatsCard = ({ title, count, colorClass, icon }: any) => (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center border border-slate-200">
            <div className={`p-3 rounded-full ${colorClass} mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-blue-900 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-blue-900">{count}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-full mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">Store Manager Dashboard</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleOpenRequisition()}
                        className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 font-medium flex items-center gap-2 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        New Store Requisition (MRF)
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Total Inventory Items" 
                    count={storeInventory.length} 
                    colorClass="bg-purple-100 text-purple-900"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                />
                <StatsCard 
                    title="Low Stock Alerts" 
                    count={lowStockItems.length} 
                    colorClass="bg-red-100 text-red-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <StatsCard 
                    title="Pending Requisitions" 
                    count={approvedRequests.length} 
                    colorClass="bg-yellow-100 text-yellow-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[500px]">
                <div className="border-b border-slate-200 flex flex-wrap">
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}
                    >
                        Inventory & Stock
                    </button>
                    <button 
                        onClick={() => setActiveTab('dishAvailability')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dishAvailability' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}
                    >
                        Dish Availability
                    </button>
                    <button 
                        onClick={() => setActiveTab('fulfillment')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fulfillment' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}
                    >
                        Fulfillment (Chef Requests)
                    </button>
                    <button 
                        onClick={() => setActiveTab('receiving')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'receiving' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}
                    >
                        Receiving (GRN)
                    </button>
                    <button 
                        onClick={() => setActiveTab('purchaseHistory')}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchaseHistory' ? 'border-purple-900 text-purple-900 bg-purple-50' : 'border-transparent text-blue-900 hover:text-blue-800'}`}
                    >
                        Purchase History
                    </button>
                </div>

                <div className="p-6">
                    {/* TAB 1: INVENTORY */}
                    {activeTab === 'inventory' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Search inventory (Code, Name, Category)..." 
                                    className="w-full md:w-96 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button onClick={handleOpenAddAsset} className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 text-sm font-medium flex items-center gap-2">
                                    <span>+ Add Item</span>
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                                    <thead className="bg-purple-50 text-blue-900 font-semibold whitespace-nowrap">
                                        <tr>
                                            <th className="px-4 py-3 border-r border-slate-200">Item Code</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Item Name</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Category</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Sub-Category</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Brand</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Model</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Serial Number</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Quantity</th>
                                            <th className="px-4 py-3 border-r border-slate-200">UOM</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Purchase Date</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Cost</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Asset Life</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Location</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Condition</th>
                                            <th className="px-4 py-3 border-r border-slate-200">Remarks</th>
                                            <th className="px-4 py-3 text-center sticky right-0 bg-purple-50 shadow-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                                        {filteredInventory.map(item => (
                                            <tr key={item.id} className="hover:bg-purple-50 transition-colors">
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.itemCode || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 font-medium text-blue-900">{item.itemName || item.model}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.type}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.subCategory || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.brand || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.model}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.serialNumber || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-center font-bold text-blue-900">{item.quantity || 0}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.unit || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.purchaseDate || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.cost || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.assetLife || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.location || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900">{item.condition || '-'}</td>
                                                <td className="px-4 py-2 border-r border-slate-100 text-blue-900 italic truncate max-w-xs">{item.remarks || item.others || '-'}</td>
                                                <td className="px-4 py-2 text-center sticky right-0 bg-white shadow-sm flex gap-2 justify-center">
                                                    <button onClick={() => handleOpenEditAsset(item)} className="text-purple-900 hover:text-purple-950 font-medium">Edit</button>
                                                    <button onClick={() => onDeleteAsset(item.id)} className="text-red-600 hover:text-red-800 font-medium">Del</button>
                                                    <button 
                                                        onClick={() => handleOpenRequisition(item)}
                                                        className="text-purple-900 hover:text-purple-950 font-medium"
                                                        title="Request Stock (MRF)"
                                                    >
                                                        +Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DISH AVAILABILITY */}
                    {activeTab === 'dishAvailability' && (
                        <div>
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left divide-y divide-slate-200">
                                    <thead className="bg-purple-50 text-blue-900 font-semibold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Dish Name</th>
                                            <th className="px-6 py-4 text-center">Max Portions Available</th>
                                            <th className="px-6 py-4">Limiting Ingredient (Bottleneck)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {dishAvailability.map(dish => (
                                            <tr key={dish.id} className="hover:bg-purple-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-blue-900">{dish.name}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full font-bold ${dish.maxPortions > 10 ? 'bg-green-100 text-green-800' : dish.maxPortions > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        {dish.maxPortions}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-red-600 font-medium">
                                                    {dish.limitingIngredient}
                                                </td>
                                            </tr>
                                        ))}
                                        {dishAvailability.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-8 text-blue-900">No recipes defined.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: FULFILLMENT */}
                    {activeTab === 'fulfillment' && (
                        <div>
                            {approvedRequests.length === 0 ? (
                                <p className="text-center text-blue-900 py-10">No pending requests from chefs.</p>
                            ) : (
                                <div className="space-y-6">
                                    {approvedRequests.map(req => (
                                        <div key={req.id} className="bg-purple-50 p-6 rounded-lg border border-l-4 border-l-purple-900 flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-lg text-blue-900">{req.requesterName}</h3>
                                                    <span className="text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold uppercase">Ready to Issue</span>
                                                </div>
                                                <p className="text-sm text-blue-900 mb-4">{req.department} • Requested: {new Date(req.date).toLocaleString()}</p>
                                                
                                                <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                                                    <p className="text-sm text-blue-900">
                                                        <span className="font-bold text-blue-900 block mb-1">Purpose / Reason:</span>
                                                        {req.purpose}
                                                    </p>
                                                </div>

                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="text-left text-blue-900">
                                                                <th className="pb-2">Item</th>
                                                                <th className="pb-2 text-right">Qty to Issue</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y border-t border-slate-100">
                                                            {req.items.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="py-2 font-medium text-blue-900">{item.name}</td>
                                                                    <td className="py-2 text-right font-mono text-blue-900">{item.quantityRequested} {item.unit}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="md:w-48 flex flex-col justify-center gap-3">
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm("Confirm issue? This will deduct items from the main inventory.")) {
                                                            onIssue(req.id);
                                                        }
                                                    }}
                                                    className="w-full bg-purple-900 text-white py-2 rounded-lg font-bold hover:bg-purple-800 transition-colors shadow-sm text-sm"
                                                >
                                                    Issue Items
                                                </button>
                                                <button 
                                                    onClick={() => onForwardToPurchase(req.id)}
                                                    className="w-full bg-orange-100 text-orange-700 border border-orange-200 py-2 rounded-lg font-bold hover:bg-orange-200 transition-colors shadow-sm text-sm"
                                                >
                                                    Forward to Purchase
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: RECEIVING (GRN) */}
                    {activeTab === 'receiving' && (
                        <div>
                            {approvedPOs.length === 0 ? (
                                <p className="text-center text-blue-900 py-10">No pending purchase orders to receive.</p>
                            ) : (
                                <div className="space-y-6">
                                    {approvedPOs.map(po => (
                                        <div key={po.id} className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-blue-900">PO #{po.poNumber}</h3>
                                                    <p className="text-sm text-blue-900">Vendor: {po.vendorName}</p>
                                                </div>
                                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">Approved - Awaiting Delivery</span>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-purple-50 text-blue-900">
                                                        <tr>
                                                            <th className="px-4 py-2">Item</th>
                                                            <th className="px-4 py-2 text-center">Qty to Receive</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y border-t border-b border-slate-100">
                                                        {po.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="px-4 py-2 text-blue-900">{item.itemName}</td>
                                                                <td className="px-4 py-2 text-center font-bold text-blue-900">{item.quantity} {item.unit}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex justify-end">
                                                <button 
                                                    onClick={() => handleOpenGRN(po)}
                                                    className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    Generate GRN & Add Stock
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: PURCHASE HISTORY */}
                    {activeTab === 'purchaseHistory' && (
                        <div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-purple-50 text-blue-900 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3">Qty Requested</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {purchaseRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-4 py-3 text-blue-900">{new Date(req.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-medium text-blue-900">{req.itemName}</td>
                                            <td className="px-4 py-3 text-blue-900">{req.quantityRequested} {req.unit}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${req.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {req.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold uppercase">{req.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-blue-900 italic max-w-xs truncate">{req.notes || '-'}</td>
                                        </tr>
                                    ))}
                                    {purchaseRequests.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-8 text-blue-900">No purchase requests yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MRF REQUISITION MODAL */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsRequestModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center border-slate-200">
                            <h2 className="text-xl font-bold text-blue-900">Create Store Requisition (MRF)</h2>
                            <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                            {/* Left: Item Selection */}
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="flex mb-4 border-b border-slate-200">
                                    <button 
                                        className={`flex-1 pb-2 text-sm font-medium ${!isCustomItemMode ? 'border-b-2 border-purple-900 text-purple-900' : 'text-blue-900 hover:text-purple-800'}`}
                                        onClick={() => setIsCustomItemMode(false)}
                                    >
                                        Select from Inventory
                                    </button>
                                    <button 
                                        className={`flex-1 pb-2 text-sm font-medium ${isCustomItemMode ? 'border-b-2 border-purple-900 text-purple-900' : 'text-blue-900 hover:text-purple-800'}`}
                                        onClick={() => setIsCustomItemMode(true)}
                                    >
                                        Add Custom Item
                                    </button>
                                </div>

                                {!isCustomItemMode ? (
                                    <>
                                        <h3 className="font-bold text-blue-900 mb-2">Inventory Items</h3>
                                        <input 
                                            type="text" 
                                            placeholder="Search items..." 
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                            value={requestSearchQuery}
                                            onChange={(e) => setRequestSearchQuery(e.target.value)}
                                        />
                                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-purple-50 text-blue-900 sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2">Item</th>
                                                        <th className="px-3 py-2">Current Stock</th>
                                                        <th className="px-3 py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {requestItems.map(item => (
                                                        <tr key={item.id} className="hover:bg-purple-50 transition-colors">
                                                            <td className="px-3 py-2 font-medium text-blue-900">{item.model}</td>
                                                            <td className={`px-3 py-2 ${item.quantity! <= LOW_STOCK_THRESHOLD ? 'text-red-600 font-bold' : 'text-blue-900'}`}>
                                                                {item.quantity} {item.unit}
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button 
                                                                    onClick={() => addToRequestCart(item, 10)}
                                                                    className="text-xs bg-purple-900 text-white px-2 py-1 rounded hover:bg-purple-800"
                                                                >
                                                                    Add
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        <h3 className="font-bold text-blue-900 mb-4">New / Custom Item Details</h3>
                                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                            <div>
                                                <label className="block text-sm font-medium text-blue-900 mb-1">Item Name</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                                    placeholder="e.g. Special Coffee Beans"
                                                    value={newItemData.name}
                                                    onChange={e => setNewItemData({...newItemData, name: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-blue-900 mb-1">Brand (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                                    placeholder="e.g. Nestlé"
                                                    value={newItemData.brand}
                                                    onChange={e => setNewItemData({...newItemData, brand: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-900 mb-1">Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                                        value={newItemData.quantity}
                                                        onChange={e => setNewItemData({...newItemData, quantity: parseFloat(e.target.value) || 0})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-blue-900 mb-1">Unit</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                                        placeholder="kg, pcs, boxes"
                                                        value={newItemData.unit}
                                                        onChange={e => setNewItemData({...newItemData, unit: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-blue-900 mb-1">Description / Notes</label>
                                                <textarea 
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-900 focus:outline-none placeholder-slate-400 text-blue-900"
                                                    rows={3}
                                                    placeholder="Specific details about the item..."
                                                    value={newItemData.description}
                                                    onChange={e => setNewItemData({...newItemData, description: e.target.value})}
                                                ></textarea>
                                            </div>
                                            <button 
                                                onClick={addCustomItemToCart}
                                                className="w-full bg-purple-900 text-white py-2 rounded-lg font-medium hover:bg-purple-800 transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Cart & Submit */}
                            <div className="flex flex-col h-full bg-purple-50 rounded border border-purple-200 p-4 overflow-hidden">
                                <h3 className="font-bold text-blue-900 mb-2">Requisition Cart</h3>
                                <div className="flex-1 overflow-y-auto mb-4 bg-white rounded border border-slate-200 p-2">
                                    {requestCart.length === 0 ? (
                                        <p className="text-slate-400 text-center text-sm py-10">Cart is empty</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {requestCart.map((c, idx) => (
                                                <li key={idx} className="bg-white p-2 rounded border border-slate-100 shadow-sm flex justify-between items-center text-sm">
                                                    <div>
                                                        <p className="font-medium text-blue-900">{c.item.model}</p>
                                                        <p className="text-xs text-blue-900">Unit: {c.item.unit}</p>
                                                        {c.item.id.startsWith('NEW-') && <span className="text-[10px] bg-purple-100 text-purple-800 px-1 rounded">New Item</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            value={c.qty}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setRequestCart(prev => prev.map((item, i) => i === idx ? { ...item, qty: val } : item));
                                                            }}
                                                            className="w-16 px-1 py-1 border border-slate-200 rounded text-center text-blue-900"
                                                        />
                                                        <button onClick={() => removeFromCart(c.item.id)} className="text-red-500 hover:text-red-700">&times;</button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Purpose / Note</label>
                                    <textarea 
                                        value={requestPurpose}
                                        onChange={(e) => setRequestPurpose(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-900 focus:outline-none mb-4 placeholder-slate-400 text-blue-900"
                                        rows={2}
                                        placeholder="e.g. Monthly Restock, Low Inventory..."
                                    ></textarea>
                                    <button 
                                        onClick={handleSubmitRequisition}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        Submit Requisition
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GRN MODAL */}
            {isGRNModalOpen && selectedPO && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsGRNModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Generate Goods Received Note (GRN)</h3>
                        <p className="text-blue-900 text-sm mb-4">Receive items for PO #{selectedPO.poNumber}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">GRN Number</label>
                                <input 
                                    type="text" 
                                    value={grnData.grnNumber}
                                    onChange={e => setGrnData({...grnData, grnNumber: e.target.value})}
                                    className="w-full border rounded p-2 input-style"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Receipt Remarks / Quality Check</label>
                                <textarea 
                                    value={grnData.remarks}
                                    onChange={e => setGrnData({...grnData, remarks: e.target.value})}
                                    className="w-full border rounded p-2 input-style"
                                    rows={3}
                                    required
                                ></textarea>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
                                <strong>Warning:</strong> Clicking "Confirm Receipt" will automatically add the PO quantities to your inventory stock levels.
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsGRNModalOpen(false)} className="px-4 py-2 border rounded text-blue-900 hover:bg-slate-50 border-slate-300">Cancel</button>
                                <button onClick={handleSubmitGRN} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Confirm Receipt & Add Stock</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <AssetModal 
                isOpen={isAssetModalOpen}
                onClose={() => setIsAssetModalOpen(false)}
                onSave={handleSaveAsset}
                editingAsset={editingAsset}
                employees={employees}
                initialType="Kitchen"
            />
        </div>
    );
};

export default StorePage;
