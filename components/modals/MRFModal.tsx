import React, { useState, useEffect } from 'react';
import type { MRF } from '../../types';

type MRFFormData = Omit<MRF, 'id' | 'date' | 'status'>;

interface MRFModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mrfData: MRFFormData, id?: string) => void;
    editingMRF: MRF | null;
}

const initialFormData: MRFFormData = {
    mrfNumber: '',
    demandNumber: '',
    description: '',
};

const MRFModal: React.FC<MRFModalProps> = ({ isOpen, onClose, onSave, editingMRF }) => {
    const [formData, setFormData] = useState<MRFFormData>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (editingMRF) {
                setFormData({
                    mrfNumber: editingMRF.mrfNumber,
                    demandNumber: editingMRF.demandNumber,
                    description: editingMRF.description,
                });
            } else {
                setFormData(initialFormData);
            }
        }
    }, [editingMRF, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave(formData, editingMRF?.id);
    };

    if (!isOpen) return null;

    const modalTitle = editingMRF ? 'Edit MRF' : 'Generate New MRF';
    const modalDescription = editingMRF ? 'Update the details for this MRF.' : 'Enter the details for the new Material Requisition Form.';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto flex justify-center items-start" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalTitle}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{modalDescription}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="mrfNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">MRF Number</label>
                            <input type="text" id="mrfNumber" name="mrfNumber" value={formData.mrfNumber} onChange={handleChange} required className="mt-1 block w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="demandNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Demand Number</label>
                            <input type="text" id="demandNumber" name="demandNumber" value={formData.demandNumber} onChange={handleChange} required className="mt-1 block w-full input-style" />
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1 block w-full input-style" />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-4 py-2 btn-secondary">Cancel</button>
                        <button type="submit" className="px-4 py-2 btn-primary">Save MRF</button>
                    </div>
                </form>
                 <style>{`
                    .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.75rem 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 0.2s ease-in-out; width: 100%; }
                    .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                    .input-style:focus { outline: none; --tw-ring-color: #3B82F6; box-shadow: 0 0 0 2px var(--tw-ring-color); }
                    .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #2563EB; border: 1px solid transparent; border-radius: 0.5rem; }
                    .btn-primary:hover { background-color: #1D4ED8; }
                    .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                    .dark .btn-secondary { color: #D1D5DB; background-color: #374151; border-color: #4B5563; }
                    .btn-secondary:hover { background-color: #F9FAFB; }
                    .dark .btn-secondary:hover { background-color: #4B5563; }
                `}</style>
            </div>
        </div>
    );
};

export default MRFModal;
