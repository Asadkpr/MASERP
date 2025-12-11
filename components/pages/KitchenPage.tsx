
import React, { useState, useMemo, useEffect } from 'react';
import type { InventoryItem, Employee, Recipe, SupplyChainRequest } from '../../types';
import AssetModal from '../modals/AssetModal';

// Course recipes for The Chef's Academy
const COURSES: { [category: string]: { name: string; ingredients: { name: string; quantity: number; unit: string }[] }[] } = {
  "Barista": [
    { name: "Espresso Shot", ingredients: [{ name: "Coffee Beans", quantity: 0.018, unit: "kg" }] },
    { name: "Cappuccino", ingredients: [{ name: "Coffee Beans", quantity: 0.018, unit: "kg" }, { name: "Milk", quantity: 0.15, unit: "liters" }] }
  ],
  "Cooking": [
    { name: "Basic Omelette", ingredients: [{ name: "Eggs", quantity: 2, unit: "pieces" }, { name: "Butter", quantity: 0.01, unit: "kg" }, { name: "Salt", quantity: 0.001, unit: "kg" }] },
    { name: "Mirepoix Prep", ingredients: [{ name: "Onion", quantity: 2, unit: "pieces" }, { name: "Carrot", quantity: 1, unit: "pieces" }, { name: "Celery", quantity: 1, unit: "pieces" }] }
  ],
  "Culinary Chef": [
      { name: "Vinaigrette", ingredients: [{ name: "Olive Oil", quantity: 0.06, unit: "liters" }, { name: "Vinegar", quantity: 0.02, unit: "liters" }, { name: "Salt", quantity: 0.001, unit: "kg" }] }
  ],
  "Bakery": [
    { name: "Simple Bread Dough", ingredients: [{ name: "Flour", quantity: 0.5, unit: "kg" }, { name: "Water", quantity: 0.3, unit: "liters" }, { name: "Yeast", quantity: 0.007, unit: "kg" }, { name: "Salt", quantity: 0.01, unit: "kg" }] },
    { name: "Basic Cookie Dough", ingredients: [{ name: "Flour", quantity: 0.25, unit: "kg" }, { name: "Butter", quantity: 0.15, unit: "kg" }, { name: "Sugar", quantity: 0.2, unit: "kg" }, { name: "Eggs", quantity: 1, unit: "pieces" }] }
  ],
};

// Props interface
interface KitchenPageProps {
  inventory: InventoryItem[];
  employees: Employee[];
  recipes?: Recipe[];
  onAddNewAsset: (assets: Omit<InventoryItem, 'id'>[]) => void;
  onUpdateAsset: (asset: InventoryItem) => void;
  onDeleteAsset: (assetId: string) => void;
  onUpdateKitchenStock: (itemsToUpdate: { id: string; newQuantity: number }[]) => Promise<void>;
  onCreateSCRequest?: (req: Omit<SupplyChainRequest, 'id'>) => Promise<void>;
  currentUserEmail?: string;
}

const KitchenPage: React.FC<KitchenPageProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InventoryItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [selectedCourse, setSelectedCourse] = useState(Object.keys(COURSES)[0]);
  const [selectedClassRecipe, setSelectedClassRecipe] = useState(COURSES[selectedCourse][0].name);
  const [students, setStudents] = useState(1);

  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMode, setRequestMode] = useState<'item' | 'dish'>('item');
  const [requestCart, setRequestCart] = useState<{ item: InventoryItem; qty: number }[]>([]);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestDishId, setRequestDishId] = useState('');
  const [requestPortions, setRequestPortions] = useState(1);
  const [requestSearchQuery, setRequestSearchQuery] = useState('');

  useEffect(() => {
    setSelectedClassRecipe(COURSES[selectedCourse][0].name);
  }, [selectedCourse]);
  
  useEffect(() => {
    if (message) {
        const timer = setTimeout(() => setMessage(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [message]);

  const kitchenInventory = useMemo(() => props.inventory.filter(i => i.type === 'Kitchen'), [props.inventory]);

  const classDetails = useMemo(() => COURSES[selectedCourse].find(r => r.name === selectedClassRecipe), [selectedCourse, selectedClassRecipe]);
  
  const stockCheck = useMemo(() => {
    if (!classDetails) return { canMake: false, needed: [] };
    
    let canMake = true;
    const needed = classDetails.ingredients.map(ing => {
      const stockItem = kitchenInventory.find(item => item.model.toLowerCase() === ing.name.toLowerCase());
      const required = ing.quantity * students;
      const available = stockItem?.quantity || 0;
      const sufficient = available >= required;
      if (!sufficient) canMake = false;
      return { name: ing.name, required: required.toFixed(3), available, sufficient, unit: ing.unit };
    });
    return { canMake, needed };
  }, [classDetails, kitchenInventory, students]);

  // Handlers for modal
  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (asset: InventoryItem) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };
  const handleSaveAsset = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
    const dataWithType = assetsData.map(asset => ({ ...asset, type: 'Kitchen' as const, status: 'In Stock' as const, assignedTo: '' }));
    if (id && dataWithType.length === 1) {
        props.onUpdateAsset({ ...dataWithType[0], id });
    } else {
        props.onAddNewAsset(dataWithType);
    }
    setIsModalOpen(false);
    setMessage({type: 'success', text: `Material ${id ? 'updated' : 'added'} successfully.`})
  };
  
  const handleUseMaterials = async () => {
    if (!classDetails || !stockCheck.canMake) return;
    
    const updates = classDetails.ingredients.map(ing => {
      const stockItem = kitchenInventory.find(item => item.model.toLowerCase() === ing.name.toLowerCase())!;
      const newQuantity = stockItem.quantity! - (ing.quantity * students);
      return { id: stockItem.id, newQuantity };
    });
    
    await props.onUpdateKitchenStock(updates);
    setMessage({type: 'success', text: `${students} student(s) worth of materials for ${selectedClassRecipe} used. Stock updated.`})
  };

  // --- REQUISITION HANDLERS ---
  const handleOpenRequestModal = (initialItem?: InventoryItem) => {
      setRequestCart([]);
      setRequestPurpose('');
      setRequestDishId('');
      setRequestPortions(1);
      setRequestSearchQuery('');
      if (initialItem) {
          setRequestMode('item');
          addToRequestCart(initialItem, 1);
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

  const updateQty = (id: string, qty: number) => {
      setRequestCart(requestCart.map(c => c.item.id === id ? { ...c, qty: Math.max(0.001, qty) } : c));
  };

  const removeFromCart = (id: string) => {
      setRequestCart(requestCart.filter(c => c.item.id !== id));
  };

  const handleAddDishToRequest = () => {
      if (!props.recipes || !requestDishId) return;
      const recipe = props.recipes.find(r => r.id === requestDishId);
      if (!recipe) return;

      recipe.ingredients.forEach(ing => {
          // Normalize matching
          const ingName = ing.name.toLowerCase().trim();
          const invItem = kitchenInventory.find(i => i.model.toLowerCase().trim() === ingName);
          
          if (invItem) {
              addToRequestCart(invItem, ing.quantity * requestPortions);
          }
      });
      // Just visually confirm
  };

  const submitRequisition = async () => {
      if (!props.onCreateSCRequest) return;
      if (requestCart.length === 0) {
          alert("Cart is empty");
          return;
      }
      
      const employee = props.employees.find(e => e.email === props.currentUserEmail);
      const requesterName = employee ? `${employee.firstName} ${employee.lastName}` : (props.currentUserEmail || 'Chef');

      const req: Omit<SupplyChainRequest, 'id'> = {
          requesterName,
          requesterEmail: props.currentUserEmail || '',
          department: 'Kitchen',
          date: new Date().toISOString(),
          purpose: requestPurpose || 'Kitchen Restock',
          status: 'Pending Account Manager',
          items: requestCart.map(c => ({
              inventoryId: c.item.id,
              name: c.item.model,
              quantityRequested: c.qty,
              unit: c.item.unit || 'units'
          }))
      };

      await props.onCreateSCRequest(req);
      setIsRequestModalOpen(false);
      setMessage({ type: 'success', text: 'Requisition submitted to Store Manager.' });
  };

  // Filter for request modal
  const requestItems = useMemo(() => {
      if (!requestSearchQuery) return kitchenInventory;
      const q = requestSearchQuery.toLowerCase();
      return kitchenInventory.filter(i => i.model.toLowerCase().includes(q));
  }, [kitchenInventory, requestSearchQuery]);


  return (
    <div className="p-6 space-y-6">
       <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Chef's Academy</h2>
           <div className="flex gap-2">
                {props.onCreateSCRequest && (
                    <button 
                        onClick={() => handleOpenRequestModal()}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium flex items-center gap-2 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        New Store Requisition
                    </button>
                )}
           </div>
       </div>

       {message && (
            <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
            </div>
       )}

       {/* RECIPE EXECUTION */}
       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Class Recipe Execution</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Course</label>
                   <select 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                       {Object.keys(COURSES).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Recipe</label>
                   <select 
                        value={selectedClassRecipe} 
                        onChange={(e) => setSelectedClassRecipe(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                       {COURSES[selectedCourse].map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                   </select>
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Students / Servings</label>
                   <input 
                        type="number" 
                        min="1" 
                        value={students} 
                        onChange={(e) => setStudents(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    />
               </div>
           </div>

           {/* Validation List */}
           <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Materials Required:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stockCheck.needed.map((item, idx) => (
                        <div key={idx} className={`p-3 rounded border flex justify-between items-center ${item.sufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">Need: {item.required} {item.unit}</p>
                            </div>
                            <div className={`text-xs font-bold ${item.sufficient ? 'text-green-700' : 'text-red-700'}`}>
                                {item.sufficient ? 'Available' : 'Low Stock'}
                                <br />
                                <span className="font-normal text-gray-500">Stock: {item.available}</span>
                            </div>
                        </div>
                    ))}
                </div>
           </div>

           <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleUseMaterials}
                    disabled={!stockCheck.canMake}
                    className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm transition-colors"
                >
                    Use Materials for Class
                </button>
           </div>
       </div>

       {/* INVENTORY LIST */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kitchen Inventory</h3>
                <button onClick={handleOpenAddModal} className="text-sm text-blue-900 hover:underline font-medium">
                    + Add New Ingredient
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Ingredient Name</th>
                            <th className="px-6 py-3 text-center">Current Stock</th>
                            <th className="px-6 py-3 text-center">Unit</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kitchenInventory.map(item => (
                            <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.model}</td>
                                <td className="px-6 py-4 text-center font-semibold">{item.quantity}</td>
                                <td className="px-6 py-4 text-center">{item.unit}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleOpenRequestModal(item)} className="font-medium text-blue-900 hover:underline">Request</button>
                                    <button onClick={() => handleOpenEditModal(item)} className="font-medium text-teal-600 hover:underline">Edit</button>
                                    <button onClick={() => props.onDeleteAsset(item.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
       </div>

       <AssetModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveAsset}
            editingAsset={editingAsset}
            employees={props.employees}
            initialType="Kitchen"
       />

       {/* REQUISITION MODAL */}
       {isRequestModalOpen && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex justify-center items-start" onClick={() => setIsRequestModalOpen(false)}>
               <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                   <div className="p-6 border-b flex justify-between items-center">
                       <h2 className="text-xl font-bold text-slate-800">New Store Requisition</h2>
                       <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                   </div>
                   
                   <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT: SELECTION */}
                        <div>
                            <div className="flex space-x-4 mb-4 border-b">
                                <button 
                                    onClick={() => setRequestMode('item')} 
                                    className={`pb-2 text-sm font-medium ${requestMode === 'item' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-slate-500'}`}
                                >
                                    Select Items
                                </button>
                                <button 
                                    onClick={() => setRequestMode('dish')} 
                                    className={`pb-2 text-sm font-medium ${requestMode === 'dish' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-slate-500'}`}
                                >
                                    Select by Dish
                                </button>
                            </div>

                            {requestMode === 'item' ? (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="Search ingredients..." 
                                        className="w-full border rounded px-3 py-2 text-sm mb-2"
                                        value={requestSearchQuery}
                                        onChange={(e) => setRequestSearchQuery(e.target.value)}
                                    />
                                    <div className="h-64 overflow-y-auto border rounded">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50">
                                                <tr><th className="px-3 py-2">Item</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2"></th></tr>
                                            </thead>
                                            <tbody>
                                                {requestItems.map(item => (
                                                    <tr key={item.id} className="hover:bg-purple-50 border-b transition-colors">
                                                        <td className="px-3 py-2">{item.model}</td>
                                                        <td className="px-3 py-2">{item.quantity} {item.unit}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <button 
                                                                onClick={() => addToRequestCart(item, 1)} 
                                                                className="text-xs bg-blue-50 text-blue-900 px-2 py-1 rounded hover:bg-blue-100"
                                                            >
                                                                Add
                                                            </button>
                                                            {(item.quantity || 0) === 0 && <span className="block text-[10px] text-red-500">Out of Stock</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Select Dish</label>
                                        <select 
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            value={requestDishId}
                                            onChange={(e) => setRequestDishId(e.target.value)}
                                        >
                                            <option value="">-- Choose --</option>
                                            {props.recipes?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Portions</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={requestPortions} 
                                            onChange={(e) => setRequestPortions(parseInt(e.target.value))}
                                            className="w-full border rounded px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAddDishToRequest}
                                        className="w-full bg-blue-900 text-white py-2 rounded text-sm hover:bg-blue-800"
                                    >
                                        Add Ingredients to Cart
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: CART */}
                        <div className="flex flex-col h-full bg-slate-50 rounded border p-4">
                            <h3 className="font-bold text-slate-800 mb-2">Request Cart</h3>
                            <div className="flex-1 overflow-y-auto mb-4 bg-white rounded border p-2">
                                {requestCart.length === 0 ? <p className="text-slate-400 text-center text-sm py-4">Empty</p> : (
                                    <ul className="space-y-2">
                                        {requestCart.map((c, i) => (
                                            <li key={i} className="flex justify-between items-center text-sm border-b pb-1">
                                                <div>
                                                    <span className="font-medium">{c.item.model}</span>
                                                    <span className="text-xs text-slate-500 ml-1">({c.item.unit})</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="number" 
                                                        min="0.1" 
                                                        step="0.1" 
                                                        value={c.qty} 
                                                        onChange={(e) => updateQty(c.item.id, parseFloat(e.target.value))}
                                                        className="w-16 border rounded px-1 py-0.5 text-center" 
                                                    />
                                                    <button onClick={() => removeFromCart(c.item.id)} className="text-red-500 hover:text-red-700">&times;</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose / Note</label>
                                <textarea 
                                    className="w-full border rounded px-3 py-2 text-sm" 
                                    rows={2}
                                    placeholder="e.g. Class preparation"
                                    value={requestPurpose}
                                    onChange={(e) => setRequestPurpose(e.target.value)}
                                ></textarea>
                                <button 
                                    onClick={submitRequisition}
                                    className="w-full mt-3 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default KitchenPage;
