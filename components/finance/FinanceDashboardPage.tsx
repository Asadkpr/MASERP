
import React, { useState, useMemo, useEffect } from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { MasbotLogo } from '../icons/MasbotLogo';
import { financePages } from '../moduleNavigation';
import ChartOfAccountsPage from './ChartOfAccountsPage';
import VouchersPage from './VouchersPage';
import LedgerPage from './LedgerPage';
import FinanceReportsPage from './FinanceReportsPage';
import StudentFeesPage from './StudentFeesPage';
import ExpenseManagementPage from './ExpenseManagementPage';
import AccountsPayablePage from './AccountsPayablePage';
import AccountsReceivablePage from './AccountsReceivablePage';
import CashBankPage from './CashBankPage';
import FixedAssetsFinancePage from './FixedAssetsFinancePage';
import PayrollPostingPage from './PayrollPostingPage';
import AuditCompliancePage from './AuditCompliancePage';
import FinanceOverviewDashboard from './FinanceOverviewDashboard';
import type { FinanceAccount, Voucher, ModulePermissions, FeeStructure, FeeChallan, FinanceExpense, VendorBill, Vendor, FinanceFixedAsset, BankReconciliation, PayrollRecord, AuditLog } from '../../types';

interface FinanceDashboardPageProps {
    onBack: () => void;
    onLogout: () => void;
    currentUserEmail: string;
    accounts: FinanceAccount[];
    vouchers: Voucher[];
    onAddAccount: (a: Omit<FinanceAccount, 'id'>) => Promise<void>;
    onUpdateAccount: (id: string, a: Partial<FinanceAccount>) => Promise<void>;
    onDeleteAccount: (id: string) => Promise<void>;
    onPostVoucher: (v: Omit<Voucher, 'id'>) => Promise<void>;
    permissions?: ModulePermissions;
    // Fee Props
    feeStructures: FeeStructure[];
    onAddFeeStructure: (f: Omit<FeeStructure, 'id'>) => Promise<void>;
    onUpdateFeeStructure: (id: string, f: Partial<FeeStructure>) => Promise<void>;
    onDeleteFeeStructure: (id: string) => Promise<void>;
    feeChallans: FeeChallan[];
    onIssueChallan: (c: Omit<FeeChallan, 'id'>) => Promise<void>;
    onCollectFee: (challanId: string, amount: number) => Promise<void>;
    // Expense Props
    financeExpenses: FinanceExpense[];
    onAddExpense: (e: Omit<FinanceExpense, 'id'>) => Promise<void>;
    onActionExpense: (id: string, action: 'Approve' | 'Paid') => Promise<void>;
    // Payable Props
    vendorBills: VendorBill[];
    onAddVendorBill: (b: Omit<VendorBill, 'id'>) => Promise<void>;
    onPayVendorBill: (billId: string, amount: number) => Promise<void>;
    vendors: Vendor[];
    // Fixed Asset Props
    financeAssets: FinanceFixedAsset[];
    onAddFinanceAsset: (a: Omit<FinanceFixedAsset, 'id'>) => Promise<void>;
    onDisposeAsset: (id: string, value: number) => Promise<void>;
    // Cash & Bank
    reconciliations: BankReconciliation[];
    onReconcile: (r: Omit<BankReconciliation, 'id'>) => Promise<void>;
    // Payroll & Audit
    payrollHistory: PayrollRecord[];
    onPostPayroll: (payrollId: string) => Promise<void>;
    auditLogs: AuditLog[];
}

const FinanceDashboardPage: React.FC<FinanceDashboardPageProps> = (props) => {
    const isAdmin = props.currentUserEmail === 'admin';
    
    const firstAccessiblePage = useMemo(() => {
        if (isAdmin) return 'fin_dashboard';
        if (!props.permissions) return null;
        const accessible = financePages.find(p => props.permissions?.[p.id]?.view);
        return accessible ? accessible.id : null;
    }, [isAdmin, props.permissions]);

    const [activePage, setActivePage] = useState<string | null>(firstAccessiblePage);

    useEffect(() => {
        if (!activePage && firstAccessiblePage) {
            setActivePage(firstAccessiblePage);
        }
    }, [firstAccessiblePage, activePage]);

    const renderContent = () => {
        if (!activePage) {
            return <div className="p-12 text-center text-blue-900">Access Denied.</div>;
        }

        switch (activePage) {
            case 'fin_dashboard':
                return <FinanceOverviewDashboard 
                    accounts={props.accounts}
                    vouchers={props.vouchers}
                    feeChallans={props.feeChallans}
                    vendorBills={props.vendorBills}
                    expenses={props.financeExpenses}
                    assets={props.financeAssets}
                    onNavigate={setActivePage}
                />;
            case 'chart_of_accounts':
                return <ChartOfAccountsPage 
                    accounts={props.accounts} 
                    onAdd={props.onAddAccount} 
                    onUpdate={props.onUpdateAccount} 
                    onDelete={props.onDeleteAccount} 
                />;
            case 'vouchers':
                return <VouchersPage 
                    accounts={props.accounts} 
                    vouchers={props.vouchers} 
                    onPost={props.onPostVoucher} 
                    currentUserEmail={props.currentUserEmail}
                />;
            case 'general_ledger':
                return <LedgerPage accounts={props.accounts} vouchers={props.vouchers} />;
            case 'payroll_posting':
                return <PayrollPostingPage 
                    payrollHistory={props.payrollHistory} 
                    onPost={props.onPostPayroll} 
                />;
            case 'student_fees':
                return <StudentFeesPage 
                    feeStructures={props.feeStructures}
                    feeChallans={props.feeChallans}
                    onAddStructure={props.onAddFeeStructure}
                    onUpdateStructure={props.onUpdateFeeStructure}
                    onDeleteStructure={props.onDeleteFeeStructure}
                    onIssueChallan={props.onIssueChallan}
                    onCollectFee={props.onCollectFee}
                />;
            case 'receivables':
                return <AccountsReceivablePage feeChallans={props.feeChallans} />;
            case 'cash_bank':
                return <CashBankPage 
                    accounts={props.accounts} 
                    reconciliations={props.reconciliations} 
                    onReconcile={props.onReconcile}
                    vouchers={props.vouchers}
                />;
            case 'fixed_assets':
                return <FixedAssetsFinancePage 
                    assets={props.financeAssets} 
                    onAdd={props.onAddFinanceAsset} 
                    onDispose={props.onDisposeAsset} 
                />;
            case 'expenses':
                return <ExpenseManagementPage 
                    expenses={props.financeExpenses}
                    accounts={props.accounts}
                    onAdd={props.onAddExpense}
                    onAction={props.onActionExpense}
                />;
            case 'payables':
                return <AccountsPayablePage 
                    bills={props.vendorBills}
                    vendors={props.vendors}
                    onAddBill={props.onAddVendorBill}
                    onPay={props.onPayVendorBill}
                />;
            case 'fin_reports':
                return <FinanceReportsPage accounts={props.accounts} vouchers={props.vouchers} />;
            case 'audit_trail':
                return <AuditCompliancePage logs={props.auditLogs} vouchers={props.vouchers} />;
            default:
                return <div className="p-12 text-center text-blue-900">Component coming soon.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
                    <MasbotLogo className="h-8 w-auto" />
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Finance Hub</div>
                    {financePages.map(page => {
                        const Icon = page.icon;
                        const isActive = activePage === page.id;
                        const hasView = isAdmin || props.permissions?.[page.id]?.view;
                        if (!hasView) return null;

                        return (
                            <button
                                key={page.id}
                                onClick={() => setActivePage(page.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                                    isActive ? 'bg-purple-900 text-white shadow-lg' : 'text-blue-900 hover:bg-purple-50'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                                <span className="text-sm font-bold">{page.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-900 font-bold text-xs">
                            {props.currentUserEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-blue-900 truncate">{props.currentUserEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-purple-900 border-b border-purple-800 h-16 flex-shrink-0 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={props.onBack} className="flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-white">
                            <HomeIcon className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                    </div>
                    <button 
                        onClick={props.onLogout} 
                        className="flex items-center gap-2 bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </header>
                <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default FinanceDashboardPage;
