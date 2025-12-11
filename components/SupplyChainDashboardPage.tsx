
import React, { useState } from 'react';
import SCSidebar from './supply_chain/SCSidebar';
import { HomeIcon } from './icons/HomeIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import RequestPage from './supply_chain/RequestPage';
import ApprovalsPage from './supply_chain/ApprovalsPage';
import StorePage from './supply_chain/StorePage';
import MyRequestsPage from './supply_chain/MyRequestsPage';
import PurchasePage from './supply_chain/PurchasePage';
import type { Employee, InventoryItem, SupplyChainRequest, PurchaseRequest, Recipe, Vendor, PurchaseOrder } from '../types';

interface SupplyChainDashboardPageProps {
    onBack: () => void;
    onLogout: () => void;
    currentUserEmail: string;
    inventory: InventoryItem[];
    employees: Employee[];
    requests: SupplyChainRequest[];
    purchaseRequests: PurchaseRequest[];
    recipes: Recipe[];
    vendors: Vendor[];
    purchaseOrders: PurchaseOrder[];
    onCreateRequest: (req: Omit<SupplyChainRequest, 'id'>) => Promise<void>;
    onActionRequest: (id: string, action: 'Approve' | 'Reject', reason?: string) => Promise<void>;
    onIssueRequest: (id: string) => Promise<void>;
    onForwardToPurchase: (id: string) => Promise<void>;
    onCreatePurchaseRequest: (req: Omit<PurchaseRequest, 'id'>) => Promise<void>;
    onCreatePO: (po: Omit<PurchaseOrder, 'id'>) => Promise<void>;
    onUpdatePO: (poId: string, updatedData: Partial<Omit<PurchaseOrder, 'id'>>) => Promise<void>;
    onDeletePO: (poId: string) => Promise<void>;
    onPOAction: (poId: string, action: 'Approve' | 'Reject') => Promise<void>;
    onGRN: (poId: string, receivedData: { grnNumber: string, remarks: string }) => Promise<void>;
    onAddNewAsset: (assets: Omit<InventoryItem, 'id'>[]) => void;
    onUpdateAsset: (asset: InventoryItem) => void;
    onDeleteAsset: (assetId: string) => void;
}

const SupplyChainDashboardPage: React.FC<SupplyChainDashboardPageProps> = (props) => {
    const [activePage, setActivePage] = useState('sc_my_requests');
    
    const currentEmployee = props.employees.find(e => e.email === props.currentUserEmail);
    const isAdmin = props.currentUserEmail === 'admin'; 
    // Updated Logic: Account Manager or Finance Department handles approvals
    const isAccountManager = isAdmin || currentEmployee?.role === 'HOD' && currentEmployee?.department === 'Finance' || currentEmployee?.designation === 'Account Manager'; 
    const isStoreManager = isAdmin || currentEmployee?.role === 'HOD' || currentEmployee?.department === 'Store'; 
    const isPurchaseDept = isAdmin || currentEmployee?.department === 'Finance' || currentEmployee?.department === 'Purchase';

    const renderContent = () => {
        switch (activePage) {
            case 'sc_requests':
                return <RequestPage 
                    inventory={props.inventory} 
                    currentUserEmail={props.currentUserEmail}
                    employees={props.employees}
                    onCreateRequest={props.onCreateRequest}
                    recipes={props.recipes}
                />;
            case 'sc_approvals':
                if (!isAccountManager) return <div className="p-6 text-center text-blue-900">Access Denied. Account Managers Only.</div>;
                return <ApprovalsPage 
                    requests={props.requests}
                    purchaseOrders={props.purchaseOrders}
                    onAction={props.onActionRequest}
                    onPOAction={props.onPOAction}
                />;
            case 'sc_store':
                if (!isStoreManager) return <div className="p-6 text-center text-blue-900">Access Denied. Store Managers Only.</div>;
                return <StorePage 
                    requests={props.requests}
                    purchaseRequests={props.purchaseRequests}
                    purchaseOrders={props.purchaseOrders}
                    inventory={props.inventory}
                    employees={props.employees}
                    recipes={props.recipes}
                    onIssue={props.onIssueRequest}
                    onForwardToPurchase={props.onForwardToPurchase}
                    onCreatePurchaseRequest={props.onCreatePurchaseRequest}
                    onCreateSCRequest={props.onCreateRequest} 
                    onGRN={props.onGRN}
                    currentUserEmail={props.currentUserEmail}
                    onAddNewAsset={props.onAddNewAsset}
                    onUpdateAsset={props.onUpdateAsset}
                    onDeleteAsset={props.onDeleteAsset}
                />;
            case 'sc_purchase':
                if (!isPurchaseDept) return <div className="p-6 text-center text-blue-900">Access Denied. Purchase Department Only.</div>;
                return <PurchasePage 
                    requests={props.requests}
                    purchaseRequests={props.purchaseRequests}
                    vendors={props.vendors}
                    purchaseOrders={props.purchaseOrders}
                    onCreatePO={props.onCreatePO}
                    onUpdatePO={props.onUpdatePO}
                    onDeletePO={props.onDeletePO}
                    currentUserEmail={props.currentUserEmail}
                />;
            case 'sc_my_requests':
            default:
                return <MyRequestsPage 
                    requests={props.requests}
                    currentUserEmail={props.currentUserEmail}
                />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100">
            <SCSidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                currentUserEmail={props.currentUserEmail}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-purple-900 border-b border-purple-800 h-16 flex-shrink-0 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={props.onBack} className="flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-white">
                            <HomeIcon className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                        <div className="h-6 w-px bg-purple-700 mx-2"></div>
                        <h1 className="text-lg font-bold text-white">The Chef's Academy Supply Chain</h1>
                    </div>
                    <button 
                        onClick={props.onLogout} 
                        className="flex items-center gap-2 bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </header>
                <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default SupplyChainDashboardPage;
