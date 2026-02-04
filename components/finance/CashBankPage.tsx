
import React, { useState, useMemo } from 'react';
import type { FinanceAccount, BankReconciliation, Voucher } from '../../types';

interface CashBankPageProps {
    accounts: FinanceAccount[];
    reconciliations: BankReconciliation[];
    onReconcile: (r: Omit<BankReconciliation, 'id'>) => Promise<void>;
    vouchers: Voucher[];
}

const CashBankPage: React.FC<CashBankPageProps> = ({ accounts, reconciliations, onReconcile, vouchers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [statementBalance, setStatementBalance] = useState(0);

    const cashAndBankAccounts = useMemo(() => {
        return accounts.filter(a => a.type === 'Asset' && (a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')));
    }, [accounts]);

    const handleReconcile = async () => {
        if (!selectedAccountId) return;
        const account = accounts.find(a => a.id === selectedAccountId);
        if (!account) return;

        await onReconcile({
            accountId: selectedAccountId,
            statementDate: new Date().toISOString().split('T')[0],
            statementBalance,
            bookBalance: account.balance,
            isMatched: Math.abs(statementBalance - account.balance) < 0.01,
            reconciledBy: 'Current User'
        });
        setIsModalOpen(false);
        alert("Reconciliation recorded.");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Cash & Bank Management</h2>
                    <p className="text-sm text-blue-600">Manage liquidity, bank accounts, and reconcile statements.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:bg-purple-800 transition-all"
                >
                    Reconcile Account
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cashAndBankAccounts.map(acc => (
                    <div key={acc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-blue-900">{acc.name}</h3>
                                <p className="text-[10px] font-mono text-slate-400">{acc.code}</p>
                            </div>
                            <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                {acc.name.toLowerCase().includes('bank') ? 'Bank' : 'Cash'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 uppercase font-bold">Book Balance</p>
                        <p className="text-2xl font-black text-blue-900">PKR {acc.balance.toLocaleString()}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400">Last Reconciled: 12 Aug 2024</span>
                            <button className="text-[10px] font-black text-purple-900 uppercase hover:underline">View Book</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b bg-slate-50">
                    <h3 className="font-bold text-blue-900">Recent Reconciliations</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Account</th>
                            <th className="px-6 py-4 text-right">Statement Bal</th>
                            <th className="px-6 py-4 text-right">Book Bal</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reconciliations.map(r => (
                            <tr key={r.id}>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{r.statementDate}</td>
                                <td className="px-6 py-4 font-bold text-blue-900">{accounts.find(a => a.id === r.accountId)?.name}</td>
                                <td className="px-6 py-4 text-right">{r.statementBalance.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">{r.bookBalance.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${r.isMatched ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {r.isMatched ? 'Matched' : 'Discrepancy'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {reconciliations.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-400 italic">No reconciliation history found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Reconciliation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-6">Bank Reconciliation</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Select Account</label>
                                <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm font-bold text-blue-900">
                                    <option value="">-- Choose Account --</option>
                                    {cashAndBankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Bank Statement Balance</label>
                                <input type="number" value={statementBalance} onChange={e => setStatementBalance(parseFloat(e.target.value) || 0)} className="w-full border rounded-xl p-2.5 text-sm font-black" />
                            </div>
                            <div className="pt-4 flex gap-2">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                <button onClick={handleReconcile} className="flex-1 bg-purple-900 text-white py-2 rounded-xl font-black shadow-lg">Confirm Match</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashBankPage;
