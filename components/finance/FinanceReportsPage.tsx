
import React, { useState, useMemo } from 'react';
import type { FinanceAccount, Voucher } from '../../types';
// Added missing import for FinanceIcon
import { FinanceIcon } from '../icons/FinanceIcon';

interface FinanceReportsPageProps {
    accounts: FinanceAccount[];
    vouchers: Voucher[];
}

const FinanceReportsPage: React.FC<FinanceReportsPageProps> = ({ accounts }) => {
    const [reportType, setReportType] = useState<'trial' | 'pnl' | 'balanceSheet'>('trial');

    const totalAssets = useMemo(() => accounts.filter(a => a.type === 'Asset').reduce((s, a) => s + a.balance, 0), [accounts]);
    const totalLiabilities = useMemo(() => accounts.filter(a => a.type === 'Liability').reduce((s, a) => s + a.balance, 0), [accounts]);
    const totalEquity = useMemo(() => accounts.filter(a => a.type === 'Equity').reduce((s, a) => s + a.balance, 0), [accounts]);
    const totalIncome = useMemo(() => accounts.filter(a => a.type === 'Income').reduce((s, a) => s + a.balance, 0), [accounts]);
    const totalExpense = useMemo(() => accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0), [accounts]);

    const netProfit = totalIncome - totalExpense;

    const renderTrialBalance = () => {
        const tb = accounts.filter(a => a.balance !== 0).sort((a, b) => a.code.localeCompare(b.code));
        const totalDebit = accounts.filter(a => ['Asset', 'Expense'].includes(a.type)).reduce((sum, a) => sum + a.balance, 0);
        const totalCredit = accounts.filter(a => ['Liability', 'Equity', 'Income'].includes(a.type)).reduce((sum, a) => sum + a.balance, 0);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black uppercase text-slate-400 border-b">
                        <tr>
                            <th className="py-2">Code</th>
                            <th className="py-2">Account Name</th>
                            <th className="py-2 text-right">Debit (PKR)</th>
                            <th className="py-2 text-right">Credit (PKR)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tb.map(acc => {
                            const isDebit = ['Asset', 'Expense'].includes(acc.type);
                            return (
                                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 font-mono text-slate-500">{acc.code}</td>
                                    <td className="py-3 font-bold text-blue-900">{acc.name}</td>
                                    <td className="py-3 text-right font-mono">{isDebit ? acc.balance.toLocaleString() : '-'}</td>
                                    <td className="py-3 text-right font-mono">{!isDebit ? acc.balance.toLocaleString() : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200 font-black">
                        <tr>
                            <td colSpan={2} className="py-4">TOTAL</td>
                            <td className="py-4 text-right">PKR {totalDebit.toLocaleString()}</td>
                            <td className="py-4 text-right">PKR {totalCredit.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    };

    const renderPNL = () => {
        const incomeAccs = accounts.filter(a => a.type === 'Income');
        const expenseAccs = accounts.filter(a => a.type === 'Expense');

        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-8">
                    <h3 className="text-xl font-black text-blue-900 mb-6 border-b pb-2">Profit & Loss Statement</h3>
                    
                    <div className="space-y-2">
                        <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-3">Revenues</p>
                        {incomeAccs.map(a => (
                            <div key={a.id} className="flex justify-between text-sm py-1 border-b border-dotted">
                                <span>{a.name}</span>
                                <span className="font-bold">{a.balance.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-lg font-black text-blue-900 pt-2 mb-6">
                            <span>Total Revenue</span>
                            <span>PKR {totalIncome.toLocaleString()}</span>
                        </div>

                        <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-3 mt-8">Operating Expenses</p>
                        {expenseAccs.map(a => (
                            <div key={a.id} className="flex justify-between text-sm py-1 border-b border-dotted">
                                <span>{a.name}</span>
                                <span className="font-bold">{a.balance.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-lg font-black text-blue-900 pt-2">
                            <span>Total Expenses</span>
                            <span>PKR {totalExpense.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className={`mt-8 p-6 rounded-2xl flex justify-between items-center ${netProfit >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        <div>
                            <p className="text-xs font-black uppercase opacity-80">{netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                            <p className="text-3xl font-black">PKR {Math.abs(netProfit).toLocaleString()}</p>
                        </div>
                        <div className="text-right opacity-50">
                            <FinanceIcon className="w-12 h-12" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderBalanceSheet = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Left: Assets */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-fit">
                    <h3 className="text-lg font-black text-blue-900 border-b pb-2 mb-4 uppercase tracking-widest">Assets</h3>
                    <div className="space-y-2">
                        {accounts.filter(a => a.type === 'Asset').map(a => (
                            <div key={a.id} className="flex justify-between text-sm py-1 border-b border-dotted">
                                <span>{a.name}</span>
                                <span className="font-bold">{a.balance.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-between items-center text-xl font-black text-blue-900 pt-4 border-t-2">
                        <span>Total Assets</span>
                        <span>PKR {totalAssets.toLocaleString()}</span>
                    </div>
                </div>

                {/* Right: Liabilities & Equity */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-black text-purple-900 border-b pb-2 mb-4 uppercase tracking-widest">Liabilities</h3>
                        <div className="space-y-2">
                            {accounts.filter(a => a.type === 'Liability').map(a => (
                                <div key={a.id} className="flex justify-between text-sm py-1 border-b border-dotted">
                                    <span>{a.name}</span>
                                    <span className="font-bold">{a.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-between items-center text-lg font-bold text-purple-900 pt-2">
                            <span>Total Liabilities</span>
                            <span>PKR {totalLiabilities.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-black text-teal-900 border-b pb-2 mb-4 uppercase tracking-widest">Equity</h3>
                        <div className="space-y-2">
                            {accounts.filter(a => a.type === 'Equity').map(a => (
                                <div key={a.id} className="flex justify-between text-sm py-1 border-b border-dotted">
                                    <span>{a.name}</span>
                                    <span className="font-bold">{a.balance.toLocaleString()}</span>
                                </div>
                            ))}
                            {/* Current Period Profit/Loss */}
                            <div className="flex justify-between text-sm py-1 border-b border-dotted text-blue-600 font-bold italic">
                                <span>Current Period Profit/Loss</span>
                                <span>{netProfit.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center text-lg font-bold text-teal-900 pt-2">
                            <span>Total Equity</span>
                            <span>PKR {(totalEquity + netProfit).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center font-black">
                        <span className="uppercase text-[10px] tracking-widest">L + E Total</span>
                        <span>PKR {(totalLiabilities + totalEquity + netProfit).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Financial Reports & Analytics</h2>
                    <p className="text-sm text-blue-600 uppercase tracking-widest font-black">Fiscal Year 2025-26</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => setReportType('trial')} className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${reportType === 'trial' ? 'bg-purple-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Trial Balance</button>
                    <button onClick={() => setReportType('pnl')} className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${reportType === 'pnl' ? 'bg-purple-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Profit & Loss</button>
                    <button onClick={() => setReportType('balanceSheet')} className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${reportType === 'balanceSheet' ? 'bg-purple-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>Balance Sheet</button>
                </div>
            </div>

            {reportType === 'trial' && renderTrialBalance()}
            {reportType === 'pnl' && renderPNL()}
            {reportType === 'balanceSheet' && renderBalanceSheet()}
        </div>
    );
};

export default FinanceReportsPage;
