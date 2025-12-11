
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import AssetsPage from './pages/AssetsPage';
import UsersPage from './pages/UsersPage';
import LabsPage from './pages/LabsPage';
import PrintersPage from './pages/PrintersPage';
import MRFPage from './pages/MRFPage';
import InventoryReportsPage from './pages/InventoryReportsPage';
import { HomeIcon } from './icons/HomeIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { inventoryPages, inventorySubPagesForAccess } from './moduleNavigation';

import type { Employee, InventoryItem, Lab, Toner, MRF, InventoryUser, InventoryPage, ModulePermissions, SupplyChainRequest, Recipe } from '../types';

interface InventoryDashboardPageProps {
    onBack: () => void;
    onLogout: () => void;
    currentUserEmail: string;
    permissions?: ModulePermissions;
    inventory: InventoryItem[];
    employees: Employee[];
    labs: Lab[];
    toners: Toner[];
    mrfs: MRF[];
    recipes: Recipe[];
    onCreateSCRequest: (req: Omit<SupplyChainRequest, 'id'>) => Promise<void>;
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
    onAddNewMRF: (mrf: Omit<MRF, 'id'>) => Promise<void>;
    onUpdateMRF: (mrf: MRF) => Promise<void>;
    onDeleteMRF: (mrfId: string) => Promise<void>;
    onUpdateKitchenStock: (itemsToUpdate: { id: string; newQuantity: number }[]) => Promise<void>;
}

const InventoryDashboardPage: React.FC<InventoryDashboardPageProps> = (props) => {
    const isAdmin = props.currentUserEmail === 'admin';

    const firstAccessiblePage = useMemo(() => {
        if (isAdmin) return 'assets';
        // If permissions are not loaded yet or user has none
        if (!props.permissions) return null;

        // Check if user has access to any sub-page of 'assets'
        // The permissions key for 'assets' is broken down into sub-pages (laptops, labs, etc.)
        const hasAssetAccess = inventorySubPagesForAccess.some(p => props.permissions?.[p.id]?.view);
        if (hasAssetAccess) return 'assets';

        // Check other main pages (users, mrf, settings)
        const accessiblePage = inventoryPages.find(p => p.id !== 'assets' && props.permissions?.[p.id]?.view);
        return accessiblePage?.id as InventoryPage || null;
    }, [isAdmin, props.permissions]);
      
    const [activePage, setActivePage] = useState<InventoryPage | null>(firstAccessiblePage);

    // Update activePage when firstAccessiblePage is determined (e.g. after permissions load)
    useEffect(() => {
        if (!activePage && firstAccessiblePage) {
            setActivePage(firstAccessiblePage);
        }
    }, [firstAccessiblePage, activePage]);

    const inventoryUsers = useMemo(() => {
        const userMap = new Map<string, InventoryUser>();
        props.employees.forEach(emp => {
            userMap.set(emp.email, {
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                email: emp.email,
                assets: []
            });
        });

        props.inventory.forEach(item => {
            if (item.assignedTo) {
                const user = Array.from(userMap.values()).find(u => u.name === item.assignedTo);
                if (user) {
                    user.assets.push({ id: item.id, type: item.type, model: item.model });
                }
            }
        });
        return Array.from(userMap.values());
    }, [props.employees, props.inventory]);

    const printers = useMemo(() => props.inventory.filter(item => item.type === 'Printer'), [props.inventory]);

    const renderContent = () => {
        if (!activePage) {
           return (
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">You do not have permission to view any pages in this module. Please contact an administrator.</p>
                </div>
            );
        }

        switch (activePage) {
            case 'assets':
                return <AssetsPage 
                    inventory={props.inventory}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                    onResignEmployee={props.onResignEmployee}
                    employees={props.employees}
                    labs={props.labs}
                    toners={props.toners}
                    onAddSystem={props.onAddSystem}
                    onUpdateSystem={props.onUpdateSystem}
                    onDeleteSystem={props.onDeleteSystem}
                    onSaveTonerModel={props.onSaveTonerModel}
                    onDeleteTonerModel={props.onDeleteTonerModel}
                    onMarkTonerEmpty={props.onMarkTonerEmpty}
                    onMarkTonerFilled={props.onMarkTonerFilled}
                    onUpdateKitchenStock={props.onUpdateKitchenStock}
                    currentUserEmail={props.currentUserEmail}
                    permissions={props.permissions}
                    // Pass down to KitchenPage via AssetsPage
                    recipes={props.recipes}
                    onCreateSCRequest={props.onCreateSCRequest}
                />;
            case 'users':
                return <UsersPage users={inventoryUsers} onResignEmployee={props.onResignEmployee} />;
            case 'mrf':
                return <MRFPage 
                    mrfs={props.mrfs}
                    onAddNewMRF={props.onAddNewMRF}
                    onUpdateMRF={props.onUpdateMRF}
                    onDeleteMRF={props.onDeleteMRF}
                />;
            case 'reports':
                return <InventoryReportsPage inventory={props.inventory} employees={props.employees} />;
            case 'settings':
                return <div className="p-6"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2><p className="mt-2 text-gray-600 dark:text-gray-400">Settings page is under construction.</p></div>;
            default:
                return null;
        }
    };
    
    const pageTitles: Record<string, string> = {
        assets: 'Inventory',
        users: 'Employees & Assigned Assets',
        labs: 'Computer Labs',
        printers: 'Printers & Toners',
        mrf: 'MRF Management',
        reports: 'Inventory Reports',
        settings: 'Settings',
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar 
                currentPage={activePage} 
                onNavigate={setActivePage}
                permissions={props.permissions}
                currentUserEmail={props.currentUserEmail}
                employees={props.employees}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-purple-900 dark:bg-purple-950 border-b border-purple-800 dark:border-purple-900 h-16 flex-shrink-0 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button onClick={props.onBack} className="flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-white">
                            <HomeIcon className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                    </div>
                     <h1 className="text-lg font-bold text-white">{activePage ? pageTitles[activePage] : 'Inventory Management'}</h1>
                    <button 
                        onClick={props.onLogout} 
                        className="flex items-center gap-2 bg-purple-800 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
                        aria-label="Logout"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </header>
                <div className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default InventoryDashboardPage;
