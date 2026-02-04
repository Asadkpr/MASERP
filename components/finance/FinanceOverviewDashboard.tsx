
import React, { useMemo } from 'react';
import type { FinanceAccount, Voucher, FeeChallan, VendorBill, FinanceExpense, FinanceFixedAsset } from '../../types';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';
import { FinanceIcon } from '../icons/FinanceIcon';
import { DollarIcon } from '../icons/DollarIcon';
import { DesktopIcon } from '../icons/DesktopIcon';

interface FinanceOverviewDashboardProps {
    accounts: FinanceAccount[];
    vouchers: Voucher[];
    feeChallans: FeeChallan[];
    vendorBills: VendorBill[];
    expenses: FinanceExpense[];
    assets: FinanceFixedAsset[];
    onNavigate: (page: string) => void;
}

const FinanceOverviewDashboard: React.FC<FinanceOverviewDashboardProps> = ({ 
    accounts, vouchers, feeChallans, vendorBills, expenses, assets, onNavigate 
}) => {

    const stats = useMemo(() => {
        // Aggregate Balances
        const cashBank = accounts.filter(a => a.type === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))).reduce((s, a) => s + a.balance, 0);
        const ar = feeChallans.reduce((s, c) => s + (c.totalAmount - c.paidAmount), 0);
        const ap = vendorBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
        
        // Income vs Expense (Current System Total)
        const income = accounts.filter(a => a.type === 'Income').reduce((s, a) => s + a.balance, 0);
        const expense = accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
        const netProfit = income - expense;

        // Progress Calculations
        const totalFeeExpected = feeChallans.reduce((s, c) => s + c.totalAmount, 0);
        const totalFeeCollected = feeChallans.reduce((s, c) => s + c.paidAmount, 0);
        const feeProgress = totalFeeExpected > 0 ? (totalFeeCollected / totalFeeExpected) * 100 : 0;

        // Alerts
        const pendingApprovals = expenses.filter(e => e.status === 'Pending').length;
        const overdueBills = vendorBills.filter(b => b.status !== 'Paid' && new Date(b.dueDate) < new Date()).length;

        return { cashBank, ar, ap, income, expense, netProfit, feeProgress, pendingApprovals, overdueBills, totalFeeExpected, totalFeeCollected };
    }, [accounts, feeChallans, vendorBills, expenses]);

    const latestTransactions = useMemo(() => {
        return [...vouchers].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    }, [vouchers]);

    const KPIBadge = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {subtext && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtext}</span>}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">{title}</p>
                <p className="text-2xl font-black text-blue-900">PKR {value.toLocaleString()}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 tracking-tight">Executive Control Panel</h1>
                    <p className="text-blue-600 font-medium">Treasurer's Overview • Fiscal Performance 2025-26</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => onNavigate('fin_reports')} className="px-5 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-800 transition-all">Generate P&L</button>
                    <button onClick={() => onNavigate('audit_trail')} className="px-5 py-2 bg-white border border-slate-200 text-blue-900 rounded-xl text-sm font-bold hover:bg-slate-50">Audit Logs</button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIBadge title="Net Liquidity" value={stats.cashBank} icon={FinanceIcon} colorClass="bg-purple-600" subtext="Cash & Bank" />
                <KPIBadge title="Account Receivables" value={stats.ar} icon={AnalyticsIcon} colorClass="bg-blue-600" subtext="Student Fees" />
                <KPIBadge title="Account Payables" value={stats.ap} icon={DollarIcon} colorClass="bg-orange-600" subtext="Vendor Bills" />
                <KPIBadge title="Net Operating Position" value={stats.netProfit} icon={FinanceIcon} colorClass={stats.netProfit >= 0 ? "bg-green-600" : "bg-red-600"} subtext="Profit / Loss" />
            </div>

            {/* Middle Section: Trends & Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Revenue vs Expense Comparison */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs">Revenue vs. Operating Expenses</h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-[10px] font-bold text-slate-400">Income</span></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400"></span><span className="text-[10px] font-bold text-slate-400">Expenses</span></div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">Total Income</span></div>
                                <div className="text-right font-black text-blue-900">PKR {stats.income.toLocaleString()}</div>
                            </div>
                            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-100">
                                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                        </div>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-100">Total Expenses</span></div>
                                <div className="text-right font-black text-blue-900">PKR {stats.expense.toLocaleString()}</div>
                            </div>
                            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-100">
                                <div style={{ width: `${(stats.expense / (stats.income || 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-400 transition-all duration-1000"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-8 border-t pt-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Fee Collection Progress</p>
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="text-green-500" strokeDasharray={`${stats.feeProgress}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-900">{Math.round(stats.feeProgress)}%</div>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-blue-900">PKR {stats.totalFeeCollected.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Target: {stats.totalFeeExpected.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Pending Clearances</p>
                            <div className="flex gap-3">
                                <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex-1 text-center">
                                    <p className="text-xl font-black text-orange-600">{stats.pendingApprovals}</p>
                                    <p className="text-[9px] font-bold text-orange-400 uppercase">Claims</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex-1 text-center">
                                    <p className="text-xl font-black text-red-600">{stats.overdueBills}</p>
                                    <p className="text-[9px] font-bold text-red-400 uppercase">Overdue</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Latest Ledger Activity */}
                <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
                    <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 mb-6 flex justify-between items-center">
                        Recent Ledger Activity
                        <button onClick={() => onNavigate('general_ledger')} className="text-purple-400 hover:text-purple-300">Full View &rarr;</button>
                    </h3>
                    <div className="space-y-6">
                        {latestTransactions.map(v => (
                            <div key={v.id} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-purple-400 group-hover:bg-purple-900 transition-colors">
                                    {v.type[0]}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm truncate">{v.description}</p>
                                        <p className="text-xs font-black text-slate-300">PKR {v.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{v.voucherNumber} • {v.date}</p>
                                </div>
                            </div>
                        ))}
                        {latestTransactions.length === 0 && <p className="text-center py-10 text-slate-500 italic text-sm">No recent transactions.</p>}
                    </div>

                    <div className="mt-12 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <DesktopIcon className="w-5 h-5 text-purple-500" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Asset Valuation</p>
                                <p className="text-lg font-black">PKR {assets.reduce((s, a) => s + (a.purchaseCost - a.accumulatedDepreciation), 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Action Center */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-black text-blue-900 uppercase tracking-widest text-[10px] mb-4">Treasurer's Quick Access</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Issue Challans', page: 'student_fees', bg: 'bg-blue-50 text-blue-700' },
                        { label: 'Post Vouchers', page: 'vouchers', bg: 'bg-purple-50 text-purple-700' },
                        { label: 'Asset Register', page: 'fixed_assets', bg: 'bg-slate-50 text-slate-700' },
                        { label: 'Reconcile Bank', page: 'cash_bank', bg: 'bg-teal-50 text-teal-700' },
                        { label: 'Vendor Bills', page: 'payables', bg: 'bg-orange-50 text-orange-700' },
                        { label: 'Tax Entries', page: 'vouchers', bg: 'bg-red-50 text-red-700' },
                    ].map(btn => (
                        <button 
                            key={btn.label} 
                            onClick={() => onNavigate(btn.page)}
                            className={`p-3 rounded-xl text-center font-bold text-xs shadow-sm border border-transparent hover:border-slate-200 transition-all active:scale-95 ${btn.bg}`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinanceOverviewDashboard;
