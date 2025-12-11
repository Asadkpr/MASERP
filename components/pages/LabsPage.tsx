
import React, { useState } from 'react';
import SystemModal from '../modals/SystemModal';
import type { Lab, LabSystem } from '../../types';

interface LabsPageProps {
    labs: Lab[];
    // FIX: Changed labId from number to string to match Firestore document ID type.
    onAddSystem: (labId: string, newSystemData: Omit<LabSystem, 'id'>) => void;
    onUpdateSystem: (labId: string, updatedSystem: LabSystem) => void;
    onDeleteSystem: (labId: string, systemId: string) => void;
}


const LabsPage: React.FC<LabsPageProps> = ({ labs, onAddSystem, onUpdateSystem, onDeleteSystem }) => {
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSystem, setEditingSystem] = useState<LabSystem | null>(null);

    const handleOpenAddModal = () => {
        setEditingSystem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (system: LabSystem) => {
        setEditingSystem(system);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSystem(null);
    };

    const handleSaveSystem = (systemData: Omit<LabSystem, 'id'>, id?: string) => {
        if (!selectedLab) return;
        if (id) {
            onUpdateSystem(selectedLab.id, { ...systemData, id });
        } else {
            onAddSystem(selectedLab.id, systemData);
        }
        handleCloseModal();
    };
    
    const handleDeleteSystem = (systemId: string) => {
        if (!selectedLab) return;
        if (window.confirm(`Are you sure you want to delete system ${systemId}?`)) {
            onDeleteSystem(selectedLab.id, systemId);
        }
    };

    const handleDownloadCsv = () => {
        if (!selectedLab) return;

        const headers = [
            'ID', 'Serial Number', 'System Model', 'LCD Model', 'LCD Inches', 'CPU', 
            'RAM', 'Storage', 'GPU', 'Keyboard', 'Mouse', 'Network Device'
        ];
        const rows = selectedLab.systems.map(sys => 
            [
                `"${sys.id}"`, `"${sys.serialNumber}"`, `"${sys.systemModel}"`, `"${sys.lcdModel}"`,
                `"${sys.lcdInches}"`, `"${sys.cpu}"`, `"${sys.ram}"`, `"${sys.storage}"`,
                `"${sys.gpu}"`, `"${sys.keyboard}"`, `"${sys.mouse}"`, `"${sys.networkDevice}"`
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedLab.name.replace(/\s+/g, '_')}_Inventory.csv`);
        document.body.appendChild(link); 
        link.click();
        document.body.removeChild(link);
    };


    if (selectedLab) {
        return (
            <>
                <div className="p-6">
                    <button onClick={() => setSelectedLab(null)} className="mb-6 flex items-center text-sm font-medium text-blue-900 dark:text-blue-400 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to All Labs
                    </button>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-900 dark:text-white">{selectedLab.name} - Systems Inventory</h2>
                             <p className="text-sm text-blue-600 dark:text-gray-400">Total Systems: {selectedLab.systems.length}</p>
                        </div>
                        <div className="flex space-x-2">
                             <button 
                                onClick={handleDownloadCsv}
                                disabled={selectedLab.systems.length === 0}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm font-medium flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span>Download Inventory</span>
                            </button>
                            <button 
                                onClick={handleOpenAddModal}
                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm font-medium flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                <span>Add New System</span>
                            </button>
                        </div>
                    </div>
                    
                    {selectedLab.systems.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm text-left text-blue-600 dark:text-gray-400">
                                <thead className="text-xs text-blue-900 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID</th>
                                        <th scope="col" className="px-6 py-3">Serial No.</th>
                                        <th scope="col" className="px-6 py-3">System Model</th>
                                        <th scope="col" className="px-6 py-3">CPU</th>
                                        <th scope="col" className="px-6 py-3">RAM</th>
                                        <th scope="col" className="px-6 py-3">Storage</th>
                                        <th scope="col" className="px-6 py-3">GPU</th>
                                        <th scope="col" className="px-6 py-3">Keyboard</th>
                                        <th scope="col" className="px-6 py-3">Mouse</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedLab.systems.map(system => (
                                        <tr key={system.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600">
                                            <th scope="row" className="px-6 py-4 font-medium text-blue-900 dark:text-white whitespace-nowrap">{system.id}</th>
                                            <td className="px-6 py-4">{system.serialNumber}</td>
                                            <td className="px-6 py-4">{system.systemModel}</td>
                                            <td className="px-6 py-4">{system.cpu}</td>
                                            <td className="px-6 py-4">{system.ram}</td>
                                            <td className="px-6 py-4">{system.storage}</td>
                                            <td className="px-6 py-4">{system.gpu}</td>
                                            <td className="px-6 py-4">{system.keyboard}</td>
                                            <td className="px-6 py-4">{system.mouse}</td>
                                            <td className="px-6 py-4 text-right flex items-center space-x-3">
                                                <button onClick={() => handleOpenEditModal(system)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteSystem(system.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-blue-900 dark:text-white">No Systems Found</h3>
                            <p className="mt-1 text-sm text-blue-600 dark:text-gray-400">There are no systems currently registered in {selectedLab.name}.</p>
                            <button onClick={handleOpenAddModal} className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm font-medium">Add the First System</button>
                        </div>
                    )}
                </div>
                <SystemModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveSystem}
                    editingSystem={editingSystem}
                />
            </>
        )
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-6">Computer Labs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.map(lab => (
                    <div key={lab.id} onClick={() => setSelectedLab(lab)} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-200">
                        <h3 className="font-bold text-lg text-blue-900 dark:text-white">{lab.name}</h3>
                        <p className="text-blue-600 dark:text-gray-400 mt-2">{lab.systems.length} Systems</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LabsPage;
