
import React, { useState, useMemo } from 'react';
import type { FinanceAccount, Voucher } from '../../types';

interface LedgerPageProps {
    accounts: FinanceAccount[];
    vouchers: Voucher[];
}

const LedgerPage: React.FC<LedgerPageProps> = ({ accounts, vouchers }) => {
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

    const ledgerEntries = useMemo(() => {
        if (!selectedAccountId) return [];

        const acc = accounts.find(a => a.id === selectedAccountId);
        if (!acc) return [];

        // Flatten voucher entries for this account
        const entries: any[] = [];
        vouchers.forEach(v => {
            v.entries.forEach(e => {
                if (e.accountId === selectedAccountId && v.date >= fromDate && v.date <= toDate) {
                    entries.push({
                        date: v.date,
                        voucherNumber: v.voucherNumber,
                        description: e.description || v.description,
                        debit: e.type === 'Debit' ? e.amount : 0,
                        credit: e.type === 'Credit' ? e.amount : 0
                    });
                }
            });
        });

        // Sort by date
        entries.sort((a, b) => a.date.localeCompare(b.date));

        // Calculate running balance
        // This is complex because we don't store historical "opening balance". 
        // For a true ledger, we'd need a starting balance at fromDate.
        // For this demo, we'll just show movements.
        let running = 0;
        const isStandardIncrease = ['Asset', 'Expense'].includes(acc.type);

        return entries.map(e => {
            const movement = isStandardIncrease ? (e.debit - e.credit) : (e.credit - e.debit);
            running += movement;
            return { ...e, runningBalance: running };
        });
    }, [selectedAccountId, vouchers, fromDate, toDate, accounts]);

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900">General Ledger</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Account</label>
                    <select 
                        value={selectedAccountId} 
                        onChange={e => setSelectedAccountId(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm font-bold text-blue-900"
                    >
                        <option value="">-- Choose an Account --</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full border rounded-lg p-2 text-sm text-blue-900" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full border rounded-lg p-2 text-sm text-blue-900" />
                </div>
            </div>

            {selectedAccountId ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-black text-blue-900">{selectedAccount?.name}</h3>
                            <p className="text-xs text-slate-500 font-mono">Code: {selectedAccount?.code} | Type: {selectedAccount?.type}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold">Current Total Balance</p>
                            <p className="text-2xl font-black text-purple-900">PKR {selectedAccount?.balance.toLocaleString()}</p>
                        </div>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-purple-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Reference</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">Debit</th>
                                <th className="px-6 py-3 text-right">Credit</th>
                                <th className="px-6 py-3 text-right">Running</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ledgerEntries.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No transactions found for this period.</td></tr>
                            ) : (
                                ledgerEntries.map((e, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{e.date}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-900">{e.voucherNumber}</td>
                                        <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{e.description}</td>
                                        <td className="px-6 py-4 text-right text-blue-700 font-bold">{e.debit > 0 ? e.debit.toLocaleString() : '-'}</td>
                                        <td className="px-6 py-4 text-right text-green-700 font-bold">{e.credit > 0 ? e.credit.toLocaleString() : '-'}</td>
                                        <td className="px-6 py-4 text-right font-black text-blue-900">{e.runningBalance.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white p-20 rounded-xl shadow-sm border border-slate-200 text-center">
                    <p className="text-slate-400 italic">Select an account and date range to view movement history.</p>
                </div>
            )}
        </div>
    );
};

export default LedgerPage;
