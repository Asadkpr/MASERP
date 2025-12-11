import React, { useState, useEffect } from 'react';
import type { GroupedToner } from '../../types';

interface TonerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        model: string;
        compatiblePrinters: string[];
        filledQuantity: number;
        emptyQuantity: number;
        originalModelName?: string;
    }) => void;
    editingGroupedToner?: GroupedToner | null;
}

const TonerModal: React.FC<TonerModalProps> = ({ isOpen, onClose, onSave, editingGroupedToner }) => {
    const [model, setModel] = useState('');
    const [compatiblePrintersInput, setCompatiblePrintersInput] = useState('');
    const [filledQuantity, setFilledQuantity] = useState(0);
    const [emptyQuantity, setEmptyQuantity] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (editingGroupedToner) {
                // Edit mode
                setModel(editingGroupedToner.model);
                setCompatiblePrintersInput(editingGroupedToner.compatiblePrinters.join(', '));
                setFilledQuantity(editingGroupedToner.filled.quantity);
                setEmptyQuantity(editingGroupedToner.empty.quantity);
            } else {
                // Add mode
                setModel('');
                setCompatiblePrintersInput('');
                setFilledQuantity(1); // Default to 1 filled
                setEmptyQuantity(0);
            }
        }
    }, [isOpen, editingGroupedToner]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const compatiblePrinters = compatiblePrintersInput.split(',').map(p => p.trim()).filter(Boolean);
        onSave({
            model,
            compatiblePrinters,
            filledQuantity: Number(filledQuantity) || 0,
            emptyQuantity: Number(emptyQuantity) || 0,
            originalModelName: editingGroupedToner?.model,
        });
    };

    if (!isOpen) return null;
    
    const modalTitle = editingGroupedToner ? 'Edit Toner Model' : 'Add New Toner Model';
    const modalDescription = editingGroupedToner ? 'Update the details for this toner model.' : 'Enter the details for the new toner model.';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex justify-center items-start" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalTitle}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{modalDescription}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Toner Model</label>
                            <input type="text" id="model" name="model" value={model} onChange={(e) => setModel(e.target.value)} required className="mt-1 block w-full input-style" placeholder="e.g., HP 58A" />
                        </div>
                        <div>
                            <label htmlFor="compatiblePrinters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compatible Printer Models</label>
                            <input type="text" id="compatiblePrinters" name="compatiblePrinters" value={compatiblePrintersInput} onChange={(e) => setCompatiblePrintersInput(e.target.value)} className="mt-1 block w-full input-style" placeholder="e.g., HP LaserJet Pro M404dn, Other Model"/>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple models with a comma.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="filledQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filled Quantity</label>
                                <input type="number" id="filledQuantity" name="filledQuantity" value={filledQuantity} onChange={(e) => setFilledQuantity(parseInt(e.target.value, 10))} min="0" required className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label htmlFor="emptyQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Empty Quantity</label>
                                <input type="number" id="emptyQuantity" name="emptyQuantity" value={emptyQuantity} onChange={(e) => setEmptyQuantity(parseInt(e.target.value, 10))} min="0" required className="mt-1 block w-full input-style" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
                            Save Toner Model
                        </button>
                    </div>
                </form>
                <style>{`.input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.75rem 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 0.2s ease-in-out; } .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; } .input-style:focus { outline: none; --tw-ring-color: #3B82F6; box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
            </div>
        </div>
    );
};

export default TonerModal;
