
import React, { useState, useMemo } from 'react';
import InventoryTable from '../InventoryTable';
import AssetModal from '../modals/AssetModal';
import type { InventoryItem, Employee, Lab, Toner, MRF, ModulePermissions, Recipe, SupplyChainRequest } from '../../types';
import InventoryCard from '../InventoryCard';
import { DesktopIcon } from '../icons/DesktopIcon';
import { PrinterIcon } from '../icons/PrinterIcon';
import { LabIcon } from '../icons/LabIcon';
import { KitchenIcon } from '../icons/KitchenIcon';
import { SupplyChainIcon } from '../icons/SupplyChainIcon';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import PrintersPage from './PrintersPage';
import LabsPage from './LabsPage';
import KitchenPage from './KitchenPage';

declare const XLSX: any;

// --- PROPS & TYPE DEFINITIONS ---
interface AssetsPageProps {
    inventory: InventoryItem[];
    employees: Employee[];
    labs: Lab[];
    toners: Toner[];
    onAddNewAsset: (assets: Omit<InventoryItem, 'id'>[]) => void;
    onUpdateAsset: (asset: InventoryItem) => void;
    onDeleteAsset: (assetId: string) => void;
    onResignEmployee: (employeeName: string) => void;
    onAddSystem: (labId: string, newSystemData: Omit<Lab['systems'][0], 'id'>) => void;
    onUpdateSystem: (labId: string, updatedSystem: Lab['systems'][0]) => void;
    onDeleteSystem: (labId: string, systemId: string) => void;
    onSaveTonerModel: (data: { model: string; compatiblePrinters: string[]; filledQuantity: number; emptyQuantity: number; originalModelName?: string; }) => void;
    onDeleteTonerModel: (modelName: string) => Promise<void>;
    onMarkTonerEmpty: (tonerId: string) => void;
    onMarkTonerFilled: (tonerId: string) => void;
    onUpdateKitchenStock: (itemsToUpdate: { id: string; newQuantity: number }[]) => Promise<void>;
    permissions?: ModulePermissions;
    currentUserEmail: string;
    recipes?: Recipe[];
    onCreateSCRequest?: (req: Omit<SupplyChainRequest, 'id'>) => Promise<void>;
}
type StatusFilter = 'All' | 'In Use' | 'In Stock' | 'Maintenance';

// --- SUB-COMPONENTS ---

// MASTER INVENTORY VIEW (Modified from old AssetsPage)
const MasterInventoryView: React.FC<Pick<AssetsPageProps, 'inventory' | 'employees' | 'onAddNewAsset' | 'onUpdateAsset' | 'onDeleteAsset' | 'onResignEmployee'>> = ({ inventory, employees, onAddNewAsset, onUpdateAsset, onDeleteAsset, onResignEmployee }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InventoryItem | null>(null);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalInitialStatus, setModalInitialStatus] = useState<InventoryItem['status'] | undefined>();

    // Strict Filter: Exclude Kitchen items from Master Inventory
    const itInventory = useMemo(() => {
        return inventory.filter(item => item.type !== 'Kitchen');
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        const statusFiltered = activeFilter === 'All'
            ? itInventory
            : itInventory.filter(item => item.status === activeFilter);

        const lowercasedQuery = searchQuery.trim().toLowerCase();
        if (!lowercasedQuery) return statusFiltered;

        return statusFiltered.filter(item =>
            Object.values(item).some(val => String(val).toLowerCase().includes(lowercasedQuery)) ||
            Object.values(item.specs || {}).some(val => String(val).toLowerCase().includes(lowercasedQuery))
        );
    }, [activeFilter, itInventory, searchQuery]);

    const filters: StatusFilter[] = ['All', 'In Use', 'In Stock', 'Maintenance'];
    
    const handleOpenAddModal = () => {
        setEditingAsset(null);
        setModalInitialStatus(activeFilter === 'All' ? 'In Use' : activeFilter);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (asset: InventoryItem) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleSave = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
        if (id && assetsData.length === 1) onUpdateAsset({ ...assetsData[0], id });
        else onAddNewAsset(assetsData);
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Master Inventory</h2>
                    <p className="text-sm text-blue-900 dark:text-gray-400">A complete list of all company hardware (IT & General).</p>
                </div>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors shadow-md text-sm font-medium flex items-center space-x-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                     <span>Assign New Asset</span>
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex bg-purple-50 dark:bg-gray-700 rounded-lg">
                        {filters.map(filter => (
                            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === filter ? 'bg-purple-900 text-white shadow' : 'text-blue-900 dark:text-gray-300 hover:bg-purple-200 dark:hover:bg-gray-600'}`}>
                                {filter} ({filter === 'All' ? itInventory.length : itInventory.filter(item => item.status === filter).length})
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-auto">
                        <input type="text" placeholder="Search anything..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:w-80 pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 placeholder-slate-400 text-blue-900"/>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                    </div>
                </div>

                <InventoryTable inventory={filteredInventory} onEdit={handleOpenEditModal} onResign={onResignEmployee} onDelete={onDeleteAsset} view={activeFilter}/>
            </div>

            <AssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingAsset={editingAsset} initialStatus={modalInitialStatus} employees={employees} isMultiAddMode={!editingAsset && activeFilter !== 'In Stock' && activeFilter !== 'Maintenance'} />
        </>
    );
};

// GENERIC ASSET DETAIL VIEW (For Laptops, Desktops, Kitchen)
const AssetDetailView: React.FC<Pick<AssetsPageProps, 'inventory' | 'employees' | 'onAddNewAsset' | 'onUpdateAsset' | 'onDeleteAsset' | 'onResignEmployee'> & { assetType: string }> = ({ assetType, inventory, employees, onAddNewAsset, onUpdateAsset, onDeleteAsset, onResignEmployee }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const items = useMemo(() => inventory.filter(i => i.type === assetType), [inventory, assetType]);

    const filteredItems = useMemo(() => {
        const lowercasedQuery = searchQuery.trim().toLowerCase();
        if (!lowercasedQuery) return items;

        return items.filter(item =>
            Object.values(item).some(val => String(val).toLowerCase().includes(lowercasedQuery)) ||
            Object.values(item.specs || {}).some(val => String(val).toLowerCase().includes(lowercasedQuery))
        );
    }, [items, searchQuery]);

    const stats = useMemo(() => ({
        total: items.length,
        inUse: items.filter(item => item.status === 'In Use').length,
        inStock: items.filter(item => item.status === 'In Stock').length,
        maintenance: items.filter(item => item.status === 'Maintenance').length,
    }), [items]);

    const handleOpenAddModal = () => {
        setEditingAsset(null);
        setIsModalOpen(true);
    };
    const handleOpenEditModal = (asset: InventoryItem) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };
    const handleSave = (assetsData: Omit<InventoryItem, 'id'>[], id?: string) => {
        const dataWithType = assetsData.map(asset => ({ ...asset, type: assetType }));
        if (id && dataWithType.length === 1) onUpdateAsset({ ...dataWithType[0], id });
        else onAddNewAsset(dataWithType);
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    // Stats card components
    type StatCardProps = { title: string; count: number; icon: React.ReactElement<{ className?: string }>; colorClasses: { bg: string; text: string; }; };
    const StatCard: React.FC<StatCardProps> = ({ title, count, icon, colorClasses }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-4"><div className={`rounded-full p-3 ${colorClasses.bg}`}>{React.cloneElement(icon, { className: `h-6 w-6 ${colorClasses.text}` })}</div><div><p className="text-sm font-medium text-blue-900 dark:text-gray-400">{title}</p><p className="text-2xl font-bold text-blue-900 dark:text-white">{count}</p></div></div>
    );
    const TotalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    const InUseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const InStockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    const MaintenanceIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

    return (
        <>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-blue-900 dark:text-white">{assetType} Inventory</h2><button onClick={handleOpenAddModal} className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 text-sm font-medium flex items-center space-x-2"><span>Add New {assetType}</span></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title={`Total ${assetType}s`} count={stats.total} icon={<TotalIcon />} colorClasses={{ bg: 'bg-purple-50 dark:bg-gray-700', text: 'text-purple-800 dark:text-gray-300' }} />
                <StatCard title="In Use" count={stats.inUse} icon={<InUseIcon />} colorClasses={{ bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' }} />
                <StatCard title="In Stock" count={stats.inStock} icon={<InStockIcon />} colorClasses={{ bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-900 dark:text-blue-300' }} />
                <StatCard title="Maintenance" count={stats.maintenance} icon={<MaintenanceIcon />} colorClasses={{ bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300' }} />
            </div>
             <div className="mb-4">
                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder={`Search ${assetType}s... (e.g., model, serial, user)`}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full md:w-96 pl-10 pr-4 py-2 border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 placeholder-slate-400 text-blue-900"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </div>
            <InventoryTable inventory={filteredItems} onEdit={handleOpenEditModal} onResign={onResignEmployee} onDelete={onDeleteAsset} view="All" />
            <AssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingAsset={editingAsset} employees={employees} initialType={assetType} />
        </>
    );
};


// --- MAIN PAGE COMPONENT (ROUTER) ---
const AssetsPage: React.FC<AssetsPageProps> = (props) => {
    const [view, setView] = useState<'overview' | 'master' | 'laptops' | 'desktops' | 'printers' | 'labs' | 'kitchen'>('overview');
    const isAdmin = props.currentUserEmail === 'admin';

    const counts = useMemo(() => ({
        master: props.inventory.filter(i => i.type !== 'Kitchen').length,
        laptops: props.inventory.filter(i => i.type === 'Laptop').length,
        desktops: props.inventory.filter(i => i.type === 'Desktop').length,
        printers: props.inventory.filter(i => i.type === 'Printer').length,
        labs: props.labs.length,
        kitchen: props.inventory.filter(i => i.type === 'Kitchen').length,
    }), [props.inventory, props.labs]);

    const renderView = () => {
        switch (view) {
            case 'master':
                return <MasterInventoryView 
                    inventory={props.inventory}
                    employees={props.employees}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onResignEmployee={props.onResignEmployee}
                />;
            case 'laptops':
                return <AssetDetailView 
                    assetType="Laptop"
                    inventory={props.inventory}
                    employees={props.employees}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onResignEmployee={props.onResignEmployee}
                />;
            case 'desktops':
                return <AssetDetailView
                    assetType="Desktop"
                    inventory={props.inventory}
                    employees={props.employees}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onResignEmployee={props.onResignEmployee}
                />;
            case 'printers':
                return <PrintersPage
                    printers={props.inventory.filter(i => i.type === 'Printer')}
                    toners={props.toners}
                    employees={props.employees}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onResignEmployee={props.onResignEmployee}
                    onSaveTonerModel={props.onSaveTonerModel}
                    onDeleteTonerModel={props.onDeleteTonerModel}
                    onMarkTonerEmpty={props.onMarkTonerEmpty}
                    onMarkTonerFilled={props.onMarkTonerFilled}
                />;
            case 'labs':
                return <LabsPage
                    labs={props.labs}
                    onAddSystem={props.onAddSystem}
                    onUpdateSystem={props.onUpdateSystem}
                    onDeleteSystem={props.onDeleteSystem}
                />;
            case 'kitchen':
                return <KitchenPage
                    inventory={props.inventory}
                    employees={props.employees}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onUpdateKitchenStock={props.onUpdateKitchenStock}
                    recipes={props.recipes}
                    onCreateSCRequest={props.onCreateSCRequest}
                    currentUserEmail={props.currentUserEmail}
                />;
            case 'overview':
            default:
                 const allCards = [
                    { id: 'master', title: "Master Inventory", count: counts.master, icon: <SupplyChainIcon />, onClick: () => setView('master'), color: "bg-purple-900" },
                    { id: 'laptops', title: "Laptops", count: counts.laptops, icon: <DesktopIcon />, onClick: () => setView('laptops'), color: "bg-purple-800" },
                    { id: 'desktops', title: "Desktops", count: counts.desktops, icon: <DesktopIcon />, onClick: () => setView('desktops'), color: "bg-purple-700" },
                    { id: 'printers', title: "Printers & Toners", count: counts.printers, icon: <PrinterIcon />, onClick: () => setView('printers'), color: "bg-purple-900" },
                    { id: 'labs', title: "Computer Labs", count: counts.labs, icon: <LabIcon />, onClick: () => setView('labs'), color: "bg-purple-800" },
                    { id: 'kitchen', title: "The Chef's Academy", count: counts.kitchen, icon: <KitchenIcon />, onClick: () => setView('kitchen'), color: "bg-purple-900" }
                ];

                const visibleCards = isAdmin 
                    ? allCards 
                    : allCards.filter(card => props.permissions?.[card.id]?.view);

                return (
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-6">Inventory Overview</h2>
                        {visibleCards.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleCards.map(card => <InventoryCard key={card.id} {...card} />)}
                            </div>
                        ) : (
                             <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-blue-900 dark:text-white">No Inventory Access</h3>
                                <p className="mt-1 text-sm text-blue-900 dark:text-gray-400">You do not have permission to view any inventory categories.</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="p-6">
            {view !== 'overview' && (
                <button onClick={() => setView('overview')} className="mb-6 flex items-center text-sm font-medium text-purple-800 dark:text-blue-400 hover:underline">
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Back to Inventory Overview
                </button>
            )}
            {renderView()}
        </div>
    );
};

export default AssetsPage;
