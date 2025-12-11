
import React, { useState, useMemo } from 'react';
import type { InventoryItem, Employee, SupplyChainRequest, Recipe } from '../../types';

interface RequestPageProps {
    inventory: InventoryItem[];
    currentUserEmail: string;
    employees: Employee[];
    onCreateRequest: (req: Omit<SupplyChainRequest, 'id'>) => Promise<void>;
    recipes?: Recipe[];
}

const RequestPage: React.FC<RequestPageProps> = ({ inventory, currentUserEmail, employees, onCreateRequest, recipes = [] }) => {
    const [mode, setMode] = useState<'item' | 'dish'>('item');
    const [cart, setCart] = useState<{ item: InventoryItem; qty: number }[]>([]);
    const [purpose, setPurpose] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Dish Mode State
    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    const [portions, setPortions] = useState(1);

    const kitchenItems = useMemo(() => {
        return inventory.filter(i => 
            i.type === 'Kitchen' && 
            i.model.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventory, searchQuery]);

    const addToCart = (item: InventoryItem, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) {
                return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + qty } : c);
            }
            return [...prev, { item, qty }];
        });
    };

    const updateQty = (id: string, qty: number) => {
        setCart(cart.map(c => c.item.id === id ? { ...c, qty: Math.max(0.001, qty) } : c));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(c => c.item.id !== id));
    };

    const handleAddDish = () => {
        if (!selectedRecipeId) return;
        const recipe = recipes.find(r => r.id === selectedRecipeId);
        if (!recipe) return;

        let addedCount = 0;
        let missingItems = [];

        recipe.ingredients.forEach(ing => {
            // Find inventory item by name (case-insensitive)
            const invItem = inventory.find(i => i.model.toLowerCase() === ing.name.toLowerCase() && i.type === 'Kitchen');
            
            if (invItem) {
                const totalQty = ing.quantity * portions;
                addToCart(invItem, totalQty);
                addedCount++;
            } else {
                missingItems.push(ing.name);
            }
        });

        if (missingItems.length > 0) {
            setMessage({ type: 'error', text: `Added available ingredients, but could not find: ${missingItems.join(', ')}` });
        } else if (addedCount > 0) {
            setMessage({ type: 'success', text: `Ingredients for ${portions} portions of ${recipe.name} added to cart.` });
        }
    };

    const handleSubmit = async () => {
        if (cart.length === 0) {
            setMessage({ type: 'error', text: 'Please add items to your request.' });
            return;
        }
        if (!purpose.trim()) {
            setMessage({ type: 'error', text: 'Please specify a purpose or recipe for this request.' });
            return;
        }

        const employee = employees.find(e => e.email === currentUserEmail);
        
        const newRequest: Omit<SupplyChainRequest, 'id'> = {
            requesterName: employee ? `${employee.firstName} ${employee.lastName}` : currentUserEmail,
            requesterEmail: currentUserEmail,
            department: employee?.department || 'Kitchen',
            date: new Date().toISOString(),
            purpose,
            status: 'Pending Account Manager',
            items: cart.map(c => ({
                inventoryId: c.item.id,
                name: c.item.model,
                quantityRequested: c.qty,
                unit: c.item.unit || 'units'
            }))
        };

        await onCreateRequest(newRequest);
        setMessage({ type: 'success', text: 'Request submitted successfully to Account Manager for approval.' });
        setCart([]);
        setPurpose('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-blue-900 mb-4">New Stock Requisition</h2>
                
                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-slate-200">
                    <button 
                        onClick={() => setMode('item')}
                        className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${mode === 'item' ? 'border-blue-900 text-blue-900' : 'border-transparent text-blue-800 hover:text-blue-900'}`}
                    >
                        Item Selection
                    </button>
                    <button 
                        onClick={() => setMode('dish')}
                        className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${mode === 'dish' ? 'border-blue-900 text-blue-900' : 'border-transparent text-blue-800 hover:text-blue-900'}`}
                    >
                        Dish Selection
                    </button>
                </div>

                {message && (
                    <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel */}
                    <div>
                        {mode === 'item' ? (
                            <>
                                <input 
                                    type="text" 
                                    placeholder="Search ingredients..." 
                                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-900 focus:outline-none placeholder-blue-300 text-blue-900"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="h-96 overflow-y-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-purple-50 text-blue-900 font-medium sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Item</th>
                                                <th className="px-4 py-2">Available</th>
                                                <th className="px-4 py-2">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {kitchenItems.map(item => {
                                                const inCart = cart.some(c => c.item.id === item.id);
                                                return (
                                                    <tr key={item.id} className="hover:bg-purple-50 transition-colors">
                                                        <td className="px-4 py-2 font-medium text-blue-900">{item.model}</td>
                                                        <td className="px-4 py-2 text-blue-900">{item.quantity} {item.unit}</td>
                                                        <td className="px-4 py-2">
                                                            <button 
                                                                onClick={() => addToCart(item)}
                                                                disabled={item.quantity === 0}
                                                                className="text-xs bg-purple-900 text-white px-2 py-1 rounded hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Add
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 h-full">
                                <h3 className="font-bold text-blue-900 mb-4">Select a Dish</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Recipe / Dish</label>
                                        <select 
                                            value={selectedRecipeId}
                                            onChange={(e) => setSelectedRecipeId(e.target.value)}
                                            className="w-full border-blue-200 rounded-md focus:ring-blue-900 text-blue-900"
                                        >
                                            <option value="">-- Select Dish --</option>
                                            {recipes.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Number of Portions</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            value={portions}
                                            onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full border-blue-200 rounded-md focus:ring-blue-900 text-blue-900"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAddDish}
                                        disabled={!selectedRecipeId}
                                        className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 disabled:bg-blue-300 transition-colors"
                                    >
                                        Add Ingredients to Cart
                                    </button>
                                    
                                    {selectedRecipeId && (
                                        <div className="mt-4 p-4 bg-white rounded border border-blue-100">
                                            <h4 className="text-xs font-bold text-blue-900 uppercase mb-2">Ingredients per portion:</h4>
                                            <ul className="text-xs text-blue-900 space-y-1">
                                                {recipes.find(r => r.id === selectedRecipeId)?.ingredients.map((ing, i) => (
                                                    <li key={i} className="flex justify-between">
                                                        <span>{ing.name}</span>
                                                        <span>{ing.quantity} {ing.unit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Cart & Form */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 flex flex-col">
                        <h3 className="font-bold text-blue-900 mb-4">Request Cart</h3>
                        
                        <div className="flex-1 overflow-y-auto mb-4">
                            {cart.length === 0 ? (
                                <p className="text-blue-900 text-center py-10 italic">No items selected.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {cart.map((c, idx) => (
                                        <li key={idx} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-blue-900">{c.item.model}</p>
                                                <p className="text-xs text-blue-900">Unit: {c.item.unit}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    min="0.001"
                                                    step="0.001"
                                                    value={c.qty}
                                                    onChange={(e) => updateQty(c.item.id, parseFloat(e.target.value))}
                                                    className="w-20 px-2 py-1 border rounded text-sm text-center text-blue-900"
                                                />
                                                <button onClick={() => removeFromCart(c.item.id)} className="text-red-500 hover:text-red-700">
                                                    &times;
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-auto">
                            <label className="block text-sm font-medium text-blue-900 mb-1">Purpose / Note</label>
                            <textarea 
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none mb-4 text-blue-900 placeholder-blue-300"
                                rows={2}
                                placeholder="e.g. For Advanced Baking Class - Croissants"
                            ></textarea>
                            
                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-sm"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestPage;
