
import React, { useState, useEffect, useCallback } from 'react';
import type { InventoryItem, Employee } from '../../types';

type AssetFormData = Omit<InventoryItem, 'id'>;

interface AssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assets: AssetFormData[], id?: string) => void;
    employees: Employee[];
    editingAsset?: InventoryItem | null;
    initialStatus?: InventoryItem['status'];
    initialType?: string;
    isMultiAddMode?: boolean;
}

const initialFormData: AssetFormData = {
    type: 'Kitchen', model: '', brand: '', status: 'In Stock', assignedTo: '',
    serialNumber: '', department: '', designation: '', issueDate: '',
    vendor: '', maintenanceDate: '', others: '',
    specs: { cpu: '', ram: '', storage: '', gpu: '', lcd: '' },
    telephoneExt: '',
    quantity: 1,
    unit: '',
    itemCode: '', itemName: '', subCategory: '', purchaseDate: '', cost: '', assetLife: '', location: '', condition: '', remarks: ''
};

const SpecFields: React.FC<{ 
    type: string, 
    specs: InventoryItem['specs'], 
    brand?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}> = ({ type, specs, brand, onChange }) => {
    if (type !== 'Laptop' && type !== 'Desktop' && type !== 'Monitor' && type !== 'Electronics') {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-3 pt-3 border-t border-blue-200 dark:border-gray-600">
             <input type="text" name="brand" value={brand || ''} onChange={onChange} placeholder="Brand (e.g., Dell, HP)" className="input-style mb-3" />
            
            {(type === 'Laptop' || type === 'Desktop') && (
                <>
                    <input type="text" name="cpu" value={specs?.cpu || ''} onChange={onChange} placeholder="CPU (e.g., Core i7)" className="input-style mb-3" />
                    <input type="text" name="ram" value={specs?.ram || ''} onChange={onChange} placeholder="RAM (e.g., 16GB DDR4)" className="input-style mb-3" />
                    <input type="text" name="storage" value={specs?.storage || ''} onChange={onChange} placeholder="Storage (e.g., 512GB SSD)" className="input-style mb-3" />
                </>
            )}
             {type === 'Desktop' && (
                <input type="text" name="gpu" value={specs?.gpu || ''} onChange={onChange} placeholder="GPU (e.g., NVIDIA RTX 3060)" className="input-style mb-3" />
             )}
              {(type === 'Laptop' || type === 'Desktop' || type === 'Monitor') && (
                 <input type="text" name="lcd" value={specs?.lcd || ''} onChange={onChange} placeholder="LCD / Display" className="input-style mb-3" />
              )}
        </div>
    );
};


const AssetModal: React.FC<AssetModalProps> = (props) => {
    const { isOpen, onClose, onSave, editingAsset, initialStatus, initialType, isMultiAddMode, employees } = props;

    const getInitialItem = (status: InventoryItem['status'] = 'In Stock'): AssetFormData => ({
        ...initialFormData,
        specs: { ...initialFormData.specs },
        status
    });

    const [formData, setFormData] = useState<AssetFormData>(getInitialItem());
    
    const [employeeDetails, setEmployeeDetails] = useState({ assignedTo: '', department: '', designation: '', issueDate: '' });
    const [assetItems, setAssetItems] = useState<AssetFormData[]>([getInitialItem('In Use')]);
    
    const resetStates = useCallback(() => {
        setFormData(getInitialItem());
        setEmployeeDetails({ assignedTo: '', department: '', designation: '', issueDate: '' });
        setAssetItems([getInitialItem('In Use')]);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (editingAsset) {
                setFormData({ 
                    ...initialFormData, 
                    ...editingAsset,
                    specs: { ...initialFormData.specs, ...(editingAsset.specs || {}) }
                });
            } else if (isMultiAddMode) {
                setAssetItems([getInitialItem('In Use')]);
                setEmployeeDetails({ assignedTo: '', department: '', designation: '', issueDate: '' });
            } else {
                const newInitialData = getInitialItem(initialStatus);
                if (initialType) newInitialData.type = initialType;
                setFormData(newInitialData);
            }
        } else {
            setTimeout(resetStates, 300);
        }
    }, [isOpen, editingAsset, isMultiAddMode, initialStatus, initialType, resetStates]);


    const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (['cpu', 'ram', 'storage', 'gpu', 'lcd'].includes(name)) {
            setFormData(prev => ({ ...prev, specs: { ...(prev.specs || {}), [name]: value } }));
        } else if (name === 'assignedTo') {
            const selectedEmployee = employees.find(emp => `${emp.firstName} ${emp.lastName}` === value);
            if (selectedEmployee) {
                setFormData(prev => ({
                    ...prev,
                    assignedTo: value,
                    department: selectedEmployee.department,
                    designation: selectedEmployee.designation,
                }));
            } else {
                setFormData(prev => ({ ...prev, assignedTo: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEmployeeDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'assignedTo') {
            const selectedEmployee = employees.find(emp => `${emp.firstName} ${emp.lastName}` === value);
            if (selectedEmployee) {
                setEmployeeDetails(prev => ({
                    ...prev,
                    assignedTo: value,
                    department: selectedEmployee.department,
                    designation: selectedEmployee.designation,
                }));
            } else {
                setEmployeeDetails(prev => ({...prev, [name]: value, department: '', designation: ''}));
            }
        } else {
             setEmployeeDetails(prev => ({...prev, [name]: value}));
        }
    };
    
    const handleAssetItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setAssetItems(prevItems => {
            const newItems = [...prevItems];
            const itemToUpdate = { ...newItems[index] };
            
            if (itemToUpdate.specs) {
                itemToUpdate.specs = { ...itemToUpdate.specs };
            }

            if (['cpu', 'ram', 'storage', 'gpu', 'lcd'].includes(name)) {
                itemToUpdate.specs = { ...(itemToUpdate.specs || {}), [name]: value };
            } else if (name === 'brand') {
                itemToUpdate.brand = value;
            } else {
                (itemToUpdate as any)[name] = value;
            }
            
            newItems[index] = itemToUpdate;
            return newItems;
        });
    };

    const addAssetItem = () => {
        setAssetItems(prev => [...prev, getInitialItem('In Use')]);
    };
    
    const removeAssetItem = (index: number) => {
        setAssetItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isMultiAddMode && !editingAsset) {
            const assetsToSave = assetItems.map(item => ({
                ...item,
                ...employeeDetails,
                status: 'In Use' as const,
            }));
            onSave(assetsToSave);
        } else {
            onSave([formData], editingAsset?.id);
        }
    };

    if (!isOpen) return null;
    
    const employeeDatalist = (
        <datalist id="employee-list">
            {employees.map(emp => (
                <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`} />
            ))}
        </datalist>
    );

    if (isMultiAddMode && !editingAsset) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex justify-center items-start" onClick={onClose}>
                {employeeDatalist}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                     <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-blue-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-blue-900 dark:text-white">Assign New Assets</h2>
                            <p className="text-sm text-blue-600 dark:text-gray-400">Bulk assign assets to an employee.</p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-900 dark:text-white mb-3">Employee Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input list="employee-list" name="assignedTo" value={employeeDetails.assignedTo} onChange={handleEmployeeDetailChange} placeholder="Search Employee" className="input-style" required />
                                    <input type="text" name="department" value={employeeDetails.department} onChange={e => {}} placeholder="Department" className="input-style bg-gray-100" readOnly />
                                    <input type="text" name="designation" value={employeeDetails.designation} onChange={e => {}} placeholder="Designation" className="input-style bg-gray-100" readOnly />
                                    <input type="date" name="issueDate" value={employeeDetails.issueDate} onChange={handleEmployeeDetailChange} className="input-style" required />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {assetItems.map((item, index) => (
                                    <div key={index} className="border border-blue-200 dark:border-gray-600 p-4 rounded-lg relative">
                                        <button type="button" onClick={() => removeAssetItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Remove Asset">&times;</button>
                                        <h4 className="text-sm font-medium text-blue-800 dark:text-gray-300 mb-2">Asset #{index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <select name="type" value={item.type} onChange={(e) => handleAssetItemChange(index, e)} className="input-style">
                                                <option value="Laptop">Laptop</option>
                                                <option value="Desktop">Desktop</option>
                                                <option value="Monitor">Monitor</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Furniture">Furniture</option>
                                                <option value="Accessory">Accessory</option>
                                            </select>
                                            <input type="text" name="model" value={item.model} onChange={(e) => handleAssetItemChange(index, e)} placeholder="Model" className="input-style" required />
                                            <input type="text" name="serialNumber" value={item.serialNumber} onChange={(e) => handleAssetItemChange(index, e)} placeholder="Serial Number" className="input-style" />
                                        </div>
                                        <SpecFields type={item.type} specs={item.specs} brand={item.brand} onChange={(e) => handleAssetItemChange(index, e)} />
                                    </div>
                                ))}
                                <button type="button" onClick={addAssetItem} className="w-full py-2 border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-lg text-blue-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700">+ Add Another Asset</button>
                            </div>
                        </div>

                        <div className="p-6 border-t border-blue-200 dark:border-gray-700 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-blue-800 bg-white border border-blue-300 rounded-lg hover:bg-blue-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800">Assign Assets</button>
                        </div>
                     </form>
                     <style>{`
                        .input-style { background-color: #F9FAFB; border: 1px solid #BFDBFE; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: #1e3a8a; }
                        .input-style::placeholder { color: #93C5FD; }
                        .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
                     `}</style>
                </div>
             </div>
        );
    }

    // Single Asset View (Add/Edit)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex justify-center items-start" onClick={onClose}>
            {employeeDatalist}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-blue-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-blue-900 dark:text-white">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
                        <p className="text-sm text-blue-600 dark:text-gray-400">Enter details for the item.</p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-style">Category</label>
                                <select name="type" value={formData.type} onChange={handleSingleChange} className="input-style">
                                    <option value="Kitchen">Kitchen</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Desktop">Desktop</option>
                                    <option value="Printer">Printer</option>
                                    <option value="Monitor">Monitor</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Accessory">Accessory</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-style">Model / Name</label>
                                <input type="text" name="model" value={formData.model} onChange={handleSingleChange} className="input-style" required />
                            </div>
                            <div>
                                <label className="label-style">Status</label>
                                <select name="status" value={formData.status} onChange={handleSingleChange} className="input-style">
                                    <option value="In Stock">In Stock</option>
                                    <option value="In Use">In Use</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>
                            {formData.type === 'Kitchen' ? (
                                <>
                                    <div>
                                        <label className="label-style">Quantity</label>
                                        <input type="number" name="quantity" value={formData.quantity} onChange={handleSingleChange} className="input-style" required min="0" step="any" />
                                    </div>
                                    <div>
                                        <label className="label-style">Unit (e.g. kg, liters)</label>
                                        <input type="text" name="unit" value={formData.unit} onChange={handleSingleChange} className="input-style" />
                                    </div>
                                    <div>
                                        <label className="label-style">Item Code</label>
                                        <input type="text" name="itemCode" value={formData.itemCode} onChange={handleSingleChange} className="input-style" />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="label-style">Serial Number</label>
                                    <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleSingleChange} className="input-style" />
                                </div>
                            )}
                        </div>

                        {formData.status === 'In Use' && (
                            <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                                <h4 className="text-sm font-medium text-blue-900 dark:text-white">Assignment Details</h4>
                                <input list="employee-list" name="assignedTo" value={formData.assignedTo} onChange={handleSingleChange} placeholder="Assigned To (Employee)" className="input-style" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="department" value={formData.department} onChange={handleSingleChange} placeholder="Department" className="input-style" />
                                    <input type="text" name="location" value={formData.location} onChange={handleSingleChange} placeholder="Location" className="input-style" />
                                </div>
                                <input type="date" name="issueDate" value={formData.issueDate} onChange={handleSingleChange} className="input-style" />
                            </div>
                        )}

                        <SpecFields type={formData.type} specs={formData.specs} brand={formData.brand} onChange={handleSingleChange} />
                        
                        <textarea name="others" value={formData.others} onChange={handleSingleChange} placeholder="Other Details / Remarks" className="input-style" rows={2}></textarea>
                    </div>

                    <div className="p-6 border-t border-blue-200 dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-blue-800 bg-white border border-blue-300 rounded-lg hover:bg-blue-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800">Save Asset</button>
                    </div>
                </form>
                <style>{`
                    .input-style { background-color: #F9FAFB; border: 1px solid #BFDBFE; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: #1e3a8a; }
                    .input-style::placeholder { color: #93C5FD; }
                    .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
                    .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #1e3a8a; margin-bottom: 0.25rem; }
                    .dark .label-style { color: #D1D5DB; }
                `}</style>
            </div>
        </div>
    );
};

export default AssetModal;
