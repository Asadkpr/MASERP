
import React, { useState, useMemo } from 'react';
import InventoryTable from '../InventoryTable';
import AssetModal from '../modals/AssetModal';
import TonerModal from '../modals/TonerModal';
import type { InventoryItem, Toner, GroupedToner, Employee } from '../../types';

interface PrintersPageProps {
    printers: InventoryItem[];
    toners: Toner[];
    employees: Employee[];
    onAddNewAsset: (assets: Omit<InventoryItem, 'id'>[]) => void;
    onUpdateAsset: (asset: InventoryItem) => void;
    onDeleteAsset: (assetId: string) => void;
    onResignEmployee: (employeeName: string) => void;
    onSaveTonerModel: (data: { model: string; compatiblePrinters: string[]; filledQuantity: number; emptyQuantity: number; originalModelName?: string; }) => void;
    onDeleteTonerModel: (modelName: string) => Promise<void>;
    onMarkTonerEmpty: (tonerId: string) => void;
    onMarkTonerFilled: (tonerId: string) => void;
}

// FIX: Update icon type to indicate it accepts a className prop, resolving the React.cloneElement error.
type StatCardProps = { title: string; count: number; icon: React.ReactElement<{ className?: string }>; colorClasses: { bg: string; text: string; }; };

const StatCard: React.FC<StatCardProps> = ({ title, count, icon, colorClasses }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-4">
        <div className={`rounded-full p-3 ${colorClasses.bg}`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${colorClasses.text}` })}
        </div>
        <div>
            <p className="text-sm font-medium text-blue-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-white">{count}</p>
        </div>
    </div>
);

const FilledIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 014.5 2h5.25a1.5 1.5 0 011.06.44l3.5 3.5a1.5 1.5 0 01.44 1.06V16.5A1.5 1.5 0 0113.5 18H4.5A1.5 1.5 0 013 16.5v-13zM9 12.25a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5z" clipRule="evenodd" /></svg>;
const EmptyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M5.5 2A2.5 2.5 0 003 4.5v11A2.5 2.5 0 005.5 18h9a2.5 2.5 0 002.5-2.5V8.31l-5.5-5.5H5.5zM9 4.75a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 019 4.75z" /><path d="M10.121 2.227a.75.75 0 00-1.06 0l-5.5 5.5A.75.75 0 004 8.25v7.25a.75.75 0 00.75.75h8.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.22-.53l-5.5-5.5zM10 8a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
const TotalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M2 3.5A1.5 1.5 0 013.5 2h13A1.5 1.5 0 0118 3.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 16.5v-13z" /><path d="M5 6a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" /></svg>;

const PrintersPage: React.FC<PrintersPageProps> = (props) => {
    const { printers, toners, onAddNewAsset, onUpdateAsset, onDeleteAsset, onResignEmployee, onSaveTonerModel, onDeleteTonerModel, onMarkTonerEmpty, onMarkTonerFilled, employees } = props;
    const [activeTab, setActiveTab] = useState<'printers' | 'toners'>('printers');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InventoryItem | null>(null);
    const [modalInitialType, setModalInitialType] = useState<string | undefined>();

    const [isTonerModalOpen, setIsTonerModalOpen] = useState(false);
    const [editingGroupedToner, setEditingGroupedToner] = useState<GroupedToner | null>(null);
    const [tonerModelFilter, setTonerModelFilter] = useState<string>('All');

    const filteredPrinters = useMemo(() => {
        const lowercasedQuery = searchQuery.trim().toLowerCase();
        if (!lowercasedQuery) return printers;

        return printers.filter(item =>
            Object.values(item).some(val => String(val).toLowerCase().includes(lowercasedQuery)) ||
            Object.values(item.specs || {}).some(val => String(val).toLowerCase().includes(lowercasedQuery))
        );
    }, [printers, searchQuery]);

    const tonerModels = useMemo(() => ['All', ...Array.from(new Set(toners.map(t => t.model)))], [toners]);
    
    const groupedToners = useMemo((): GroupedToner[] => {
        const tonerMap = new Map<string, GroupedToner>();
        toners.forEach(toner => {
            if (!tonerMap.has(toner.model)) {
                tonerMap.set(toner.model, {
                    model: toner.model,
                    compatiblePrinters: toner.compatiblePrinters,
                    filled: { id: null, quantity: 0 },
                    empty: { id: null, quantity: 0 },
                });
            }
            const group = tonerMap.get(toner.model)!;
            if (toner.status === 'Filled') {
                group.filled.id = toner.id;
                group.filled.quantity = toner.quantity;
                group.compatiblePrinters = [...new Set([...group.compatiblePrinters, ...toner.compatiblePrinters])];
            } else if (toner.status === 'Empty') {
                group.empty.id = toner.id;
                group.empty.quantity = toner.quantity;
                group.compatiblePrinters = [...new Set([...group.compatiblePrinters, ...toner.compatiblePrinters])];
            }
        });
        return Array.from(tonerMap.values()).sort((a, b) => a.model.localeCompare(b.model));
    }, [toners]);

    const filteredToners = useMemo(() => {
        if (tonerModelFilter === 'All') return groupedToners;
        return groupedToners.filter(t => t.model === tonerModelFilter);
    }, [groupedToners, tonerModelFilter]);

    const tonerStats = useMemo(() => ({
        total: toners.reduce((sum, t) => sum + t.quantity, 0),
        filled: toners.filter(t => t.status === 'Filled').reduce((sum, t) => sum + t.quantity, 0),
        empty: toners.filter(t => t.status === 'Empty').reduce((sum, t) => sum + t.quantity, 0),
    }), [toners]);

    const handleOpenAddAssetModal = () => { 
        setEditingAsset(null);
        setModalInitialType('Printer');
        setIsAssetModalOpen(true); 
    };
    const handleOpenEditAssetModal = (asset: InventoryItem) => { 
        setEditingAsset(asset);
        setModalInitialType(undefined);
        setIsAssetModalOpen(true); 
    };
    const handleCloseAssetModal = () => {
        setIsAssetModalOpen(false);
        setEditingAsset(null);
        setModalInitialType(undefined);
    };
    
    const handleOpenAddTonerModal = () => { setEditingGroupedToner(null); setIsTonerModalOpen(true); };
    const handleOpenEditTonerModal = (tonerGroup: GroupedToner) => { setEditingGroupedToner(tonerGroup); setIsTonerModalOpen(true); };
    const handleCloseTonerModal = () => { setIsTonerModalOpen(false); };
    
    const handleSaveAsset = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
        const dataWithType = { ...assetsData[0], type: 'Printer' as const };
        if (id) { 
            onUpdateAsset({ ...dataWithType, id }); 
        } else { 
            onAddNewAsset([dataWithType]); 
        }
        handleCloseAssetModal();
    };

    const handleSaveToner = (data: { model: string; compatiblePrinters: string[]; filledQuantity: number; emptyQuantity: number; originalModelName?: string; }) => {
        onSaveTonerModel(data);
        handleCloseTonerModal();
    };

    const handleDeleteModel = (modelName: string) => {
        if (window.confirm(`Are you sure you want to delete all toner records for model "${modelName}"? This will remove both filled and empty stock. This action cannot be undone.`)) {
            onDeleteTonerModel(modelName);
        }
    };


    return (
        <>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Printers & Toners</h2>
                        <p className="text-sm text-blue-600 dark:text-gray-400">Manage all printing devices and their consumables.</p>
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('printers')} className={`${activeTab === 'printers' ? 'border-purple-900 text-purple-900 dark:text-blue-400' : 'border-transparent text-blue-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Printers ({printers.length})</button>
                        <button onClick={() => setActiveTab('toners')} className={`${activeTab === 'toners' ? 'border-purple-900 text-purple-900 dark:text-blue-400' : 'border-transparent text-blue-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Toners ({tonerModels.length - 1} Models)</button>
                    </nav>
                </div>
                
                {activeTab === 'printers' && (
                    <div className="mt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                             <div className="relative w-full sm:w-auto flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search printers... (e.g., model, serial, user)"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-96 pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 text-blue-900 placeholder-slate-400"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                            <button onClick={handleOpenAddAssetModal} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm font-medium flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                <span>Add New Printer</span>
                            </button>
                        </div>
                        <InventoryTable 
                            inventory={filteredPrinters} 
                            onEdit={handleOpenEditAssetModal} 
                            onResign={onResignEmployee} 
                            view="All" 
                            onDelete={onDeleteAsset}
                        />
                    </div>
                )}
                
                {activeTab === 'toners' && (
                    <div className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                           <StatCard title="Total Toner Stock" count={tonerStats.total} icon={<TotalIcon />} colorClasses={{bg: 'bg-purple-100 dark:bg-gray-700', text: 'text-purple-900 dark:text-gray-300'}} />
                           <StatCard title="Total Filled Toners" count={tonerStats.filled} icon={<FilledIcon />} colorClasses={{bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300'}} />
                           <StatCard title="Total Empty Toners" count={tonerStats.empty} icon={<EmptyIcon />} colorClasses={{bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300'}} />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow gap-4">
                           <div className="flex items-center space-x-2">
                                <label htmlFor="tonerModelFilter" className="text-sm font-medium text-blue-900 dark:text-gray-300">Filter by Model:</label>
                                <select id="tonerModelFilter" value={tonerModelFilter} onChange={e => setTonerModelFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 text-blue-900">
                                    {tonerModels.map(model => <option key={model} value={model}>{model}</option>)}
                                </select>
                           </div>
                           <button onClick={handleOpenAddTonerModal} className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md text-sm font-medium flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                <span>Add New Toner Model</span>
                           </button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm text-left text-blue-600 dark:text-gray-400">
                                <thead className="text-xs text-blue-900 uppercase bg-purple-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Toner Model</th>
                                        <th scope="col" className="px-6 py-3">Compatible Printers</th>
                                        <th scope="col" className="px-6 py-3 text-center">Filled Qty</th>
                                        <th scope="col" className="px-6 py-3 text-center">Empty Qty</th>
                                        <th scope="col" className="px-6 py-3 text-center">Total Qty</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredToners.map((toner) => (
                                        <tr key={toner.model} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600">
                                            <th scope="row" className="px-6 py-4 font-medium text-blue-900 dark:text-white whitespace-nowrap">{toner.model}</th>
                                            <td className="px-6 py-4 text-xs text-blue-800">{toner.compatiblePrinters.join(', ')}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{toner.filled.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">{toner.empty.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-blue-900 dark:text-gray-300">
                                                {toner.filled.quantity + toner.empty.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <button 
                                                        onClick={() => onMarkTonerEmpty(toner.filled.id!)} 
                                                        disabled={!toner.filled.id || toner.filled.quantity === 0}
                                                        className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:no-underline"
                                                        aria-label={`Mark one ${toner.model} toner as empty`}
                                                        title="Mark 1 Empty"
                                                    >
                                                        Mark Empty
                                                    </button>
                                                    <button 
                                                        onClick={() => onMarkTonerFilled(toner.empty.id!)}
                                                        disabled={!toner.empty.id || toner.empty.quantity === 0}
                                                        className="font-medium text-green-600 dark:text-green-500 hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:no-underline"
                                                        aria-label={`Mark one ${toner.model} toner as filled`}
                                                        title="Mark 1 Filled"
                                                    >
                                                        Mark Filled
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditTonerModal(toner)}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                        aria-label={`Edit ${toner.model} toner model`}
                                                        title="Edit Model"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteModel(toner.model)} 
                                                        className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                                        aria-label={`Delete all ${toner.model} toner records`}
                                                        title="Delete Model"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <AssetModal 
                isOpen={isAssetModalOpen} 
                onClose={handleCloseAssetModal} 
                onSave={handleSaveAsset} 
                editingAsset={editingAsset} 
                initialType={modalInitialType}
                employees={employees}
            />
            <TonerModal isOpen={isTonerModalOpen} onClose={handleCloseTonerModal} onSave={handleSaveToner} editingGroupedToner={editingGroupedToner} />
        </>
    );
};

export default PrintersPage;
