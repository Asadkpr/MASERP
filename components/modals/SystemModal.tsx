import React, { useState, useEffect } from 'react';
import type { LabSystem } from '../../types';

type SystemFormData = Omit<LabSystem, 'id'>;

interface SystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (system: SystemFormData, id?: string) => void;
    editingSystem?: LabSystem | null;
}

const initialFormData: SystemFormData = {
    serialNumber: '',
    systemModel: '',
    lcdModel: '',
    lcdInches: '',
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    keyboard: '',
    mouse: '',
    networkDevice: 'Ethernet'
};

const SystemModal: React.FC<SystemModalProps> = ({ isOpen, onClose, onSave, editingSystem }) => {
    const [formData, setFormData] = useState<SystemFormData>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (editingSystem) {
                setFormData(editingSystem);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [isOpen, editingSystem]);
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(formData, editingSystem?.id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex justify-center items-start" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingSystem ? 'Edit System' : 'Add New System'}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enter the details of the computer system.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* System & LCD */}
                         <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">System & Display</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="systemModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">System Model</label>
                                    <input type="text" id="systemModel" name="systemModel" value={formData.systemModel} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serial Number</label>
                                    <input type="text" id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="lcdModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LCD Model</label>
                                    <input type="text" id="lcdModel" name="lcdModel" value={formData.lcdModel} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="lcdInches" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LCD Size (Inches)</label>
                                    <input type="text" id="lcdInches" name="lcdInches" value={formData.lcdInches} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                            </div>
                         </div>
                        
                        {/* Core Components */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Core Components</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label htmlFor="cpu" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPU</label>
                                    <input type="text" id="cpu" name="cpu" value={formData.cpu} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="ram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">RAM</label>
                                    <input type="text" id="ram" name="ram" value={formData.ram} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="storage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Storage</label>
                                    <input type="text" id="storage" name="storage" value={formData.storage} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="gpu" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Graphics Card (GPU)</label>
                                    <input type="text" id="gpu" name="gpu" value={formData.gpu} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                            </div>
                        </div>

                        {/* Peripherals */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Peripherals & Network</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                <div>
                                    <label htmlFor="keyboard" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard</label>
                                    <input type="text" id="keyboard" name="keyboard" value={formData.keyboard} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="mouse" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mouse</label>
                                    <input type="text" id="mouse" name="mouse" value={formData.mouse} onChange={handleChange} required className="mt-1 block w-full input-style" />
                                </div>
                                <div>
                                    <label htmlFor="networkDevice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Network Device</label>
                                    <input type="text" id="networkDevice" name="networkDevice" value={formData.networkDevice} onChange={handleChange} required className="mt-1 block w-full input-style" placeholder="e.g., Ethernet or WiFi Tenda"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                            Save System
                        </button>
                    </div>
                </form>
                 <style>{`
                    .input-style {
                        background-color: #F9FAFB; /* bg-gray-50 */
                        border: 1px solid #D1D5DB; /* border-gray-300 */
                        border-radius: 0.375rem; /* rounded-md */
                        padding: 0.5rem 0.75rem; /* px-3 py-2 */
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
                        transition: all 0.2s ease-in-out;
                    }
                    .dark .input-style {
                        background-color: #374151; /* dark:bg-gray-700 */
                        border-color: #4B5563; /* dark:border-gray-600 */
                        color: #F9FAFB; /* dark:text-white */
                    }
                    .input-style:focus {
                        outline: none;
                        --tw-ring-color: #3B82F6; /* focus:ring-blue-500 */
                        box-shadow: 0 0 0 2px var(--tw-ring-color);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default SystemModal;
