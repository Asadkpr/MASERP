
import React, { useState } from 'react';
import type { MRF } from '../../types';
import MRFModal from '../modals/MRFModal';

interface MRFPageProps {
  mrfs: MRF[];
  onAddNewMRF: (mrf: Omit<MRF, 'id'>) => Promise<void>;
  onUpdateMRF: (mrf: MRF) => Promise<void>;
  onDeleteMRF: (mrfId: string) => Promise<void>;
}

const MRFPage: React.FC<MRFPageProps> = ({ mrfs, onAddNewMRF, onUpdateMRF, onDeleteMRF }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMRF, setEditingMRF] = useState<MRF | null>(null);

    const handleOpenAddModal = () => {
        setEditingMRF(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (mrf: MRF) => {
        setEditingMRF(mrf);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMRF(null);
    };

    const handleSave = (mrfData: Omit<MRF, 'id' | 'date' | 'status'> & {date?: string, status?: 'Pending' | 'Proceed'}, id?: string) => {
        if (id) {
            const originalMRF = mrfs.find(m => m.id === id);
            if (!originalMRF) return;

            const updatedMRF: MRF = {
                ...originalMRF,
                ...mrfData
            };
            onUpdateMRF(updatedMRF);
        } else {
             const newMRF: Omit<MRF, 'id'> = {
                mrfNumber: mrfData.mrfNumber,
                demandNumber: mrfData.demandNumber,
                description: mrfData.description,
                date: new Date().toISOString(),
                status: 'Pending',
            };
            onAddNewMRF(newMRF);
        }
        handleCloseModal();
    };

    const handleStatusChange = (mrf: MRF, newStatus: 'Pending' | 'Proceed') => {
        onUpdateMRF({ ...mrf, status: newStatus });
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this MRF? This action cannot be undone.")) {
            onDeleteMRF(id);
        }
    }
    
    const getStatusChip = (status: MRF['status']) => {
        switch (status) {
          case 'Pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Proceed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-white">MRF Management</h2>
                        <p className="text-sm text-blue-600 dark:text-gray-400">Track and manage all Material Requisition Forms.</p>
                    </div>
                    <button 
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm font-medium flex items-center space-x-2"
                        aria-label="Generate New MRF"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Generate MRF</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-sm text-left text-blue-600 dark:text-gray-400">
                        <thead className="text-xs text-blue-900 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">MRF No.</th>
                                <th scope="col" className="px-6 py-3">Demand No.</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                             {mrfs.length > 0 ? mrfs.map((mrf) => (
                                <tr key={mrf.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-blue-900 dark:text-white whitespace-nowrap">{mrf.mrfNumber}</th>
                                    <td className="px-6 py-4 text-blue-800">{mrf.demandNumber}</td>
                                    <td className="px-6 py-4 text-blue-800">{new Date(mrf.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-blue-800">
                                        <div className="max-w-xs overflow-hidden whitespace-nowrap text-ellipsis" title={mrf.description}>
                                            {mrf.description || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={mrf.status} 
                                            onChange={(e) => handleStatusChange(mrf, e.target.value as 'Pending' | 'Proceed')}
                                            className={`border-none rounded-md text-xs font-semibold p-1 ${getStatusChip(mrf.status)} focus:ring-2 focus:ring-blue-900`}
                                            aria-label={`Status for MRF ${mrf.mrfNumber}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Proceed">Proceed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => handleOpenEditModal(mrf)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(mrf.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 px-6">
                                        <h3 className="text-lg font-medium text-blue-900 dark:text-white">No MRFs Found</h3>
                                        <p className="mt-1 text-sm text-blue-600 dark:text-gray-400">There are no Material Requisition Forms yet.</p>
                                        <button onClick={handleOpenAddModal} className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm font-medium">
                                            Generate the First MRF
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <MRFModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSave}
                editingMRF={editingMRF}
            />
        </>
    );
};

export default MRFPage;
