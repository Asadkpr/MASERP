
import React, { useState, useMemo } from 'react';
import type { FinanceAccount, Voucher, VoucherType, VoucherEntry } from '../../types';

interface VouchersPageProps {
    accounts: FinanceAccount[];
    vouchers: Voucher[];
    onPost: (v: Omit<Voucher, 'id'>) => Promise<void>;
    currentUserEmail: string;
}

const VouchersPage: React.FC<VouchersPageProps> = ({ accounts, vouchers, onPost, currentUserEmail }) => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [voucherType, setVoucherType] = useState<VoucherType>('Journal');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [entries, setEntries] = useState<Omit<VoucherEntry, 'accountName'>[]>([
        { accountId: '', type: 'Debit', amount: 0, description: '' },
        { accountId: '', type: 'Credit', amount: 0, description: '' }
    ]);

    const totalDebit = entries.filter(e => e.type === 'Debit').reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = entries.filter(e => e.type === 'Credit').reduce((sum, e) => sum + e.amount, 0);
    const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

    const handleAddEntry = () => {
        setEntries([...entries, { accountId: '', type: 'Debit', amount: 0, description: '' }]);
    };

    const handleRemoveEntry = (idx: number) => {
        setEntries(entries.filter((_, i) => i !== idx));
    };

    const updateEntry = (idx: number, field: string, value: any) => {
        const newEntries = [...entries];
        (newEntries[idx] as any)[field] = value;
        setEntries(newEntries);
    };

    const handlePost = async () => {
        if (!isBalanced) {
            alert("Voucher is not balanced! Debits must equal Credits.");
            return;
        }
        if (!description.trim()) {
            alert("Please enter a description for the voucher.");
            return;
        }
        if (entries.some(e => !e.accountId)) {
            alert("Please select an account for all entries.");
            return;
        }

        const formattedEntries: VoucherEntry[] = entries.map(e => ({
            ...e,
            accountName: accounts.find(a => a.id === e.accountId)?.name || 'Unknown'
        }));

        const newVoucher: Omit<Voucher, 'id'> = {
            voucherNumber: `${voucherType[0]}V-${Date.now().toString().slice(-6)}`,
            date,
            type: voucherType,
            totalAmount: totalDebit,
            description,
            status: 'Posted',
            entries: formattedEntries,
            createdBy: currentUserEmail
        };

        await onPost(newVoucher);
        alert("Voucher posted and account balances updated.");
        setView('list');
        resetForm();
    };

    const resetForm = () => {
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setEntries([{ accountId: '', type: 'Debit', amount: 0, description: '' }, { accountId: '', type: 'Credit', amount: 0, description: '' }]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">Voucher Posting</h2>
                <button 
                    onClick={() => setView(view === 'list' ? 'create' : 'list')}
                    className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${view === 'list' ? 'bg-purple-900 text-white hover:bg-purple-800' : 'bg-white text-blue-900 border'}`}
                >
                    {view === 'list' ? '+ Post New Voucher' : 'View Posting History'}
                </button>
            </div>

            {view === 'create' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Voucher Type</label>
                            <select value={voucherType} onChange={e => setVoucherType(e.target.value as VoucherType)} className="w-full border rounded-lg p-2 text-sm font-bold text-blue-900">
                                <option value="Journal">Journal Voucher (JV)</option>
                                <option value="Payment">Payment Voucher (PV)</option>
                                <option value="Receipt">Receipt Voucher (RV)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Posting Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded-lg p-2 text-sm text-blue-900" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reference/Narration</label>
                            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Monthly Rent Payment" className="w-full border rounded-lg p-2 text-sm text-blue-900" />
                        </div>
                    </div>

                    <table className="w-full mb-6">
                        <thead>
                            <tr className="text-xs font-bold text-slate-400 uppercase border-b">
                                <th className="text-left py-2">Account</th>
                                <th className="text-left py-2 w-32">Type</th>
                                <th className="text-right py-2 w-40">Amount (PKR)</th>
                                <th className="text-left py-2 px-4">Line Description</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {entries.map((entry, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-3">
                                        <select 
                                            value={entry.accountId} 
                                            onChange={e => updateEntry(idx, 'accountId', e.target.value)}
                                            className="w-full bg-slate-50 border-transparent hover:border-slate-300 rounded p-1.5 text-sm text-blue-900 font-medium"
                                        >
                                            <option value="">-- Select Account --</option>
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-3">
                                        <select 
                                            value={entry.type} 
                                            onChange={e => updateEntry(idx, 'type', e.target.value)}
                                            className={`w-full rounded p-1.5 text-xs font-bold uppercase tracking-wider border-0 ${entry.type === 'Debit' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}
                                        >
                                            <option value="Debit">Debit</option>
                                            <option value="Credit">Credit</option>
                                        </select>
                                    </td>
                                    <td className="py-3">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={entry.amount || ''} 
                                            onChange={e => updateEntry(idx, 'amount', parseFloat(e.target.value) || 0)}
                                            className="w-full border border-slate-200 rounded p-1.5 text-sm text-right text-blue-900 font-mono"
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <input 
                                            value={entry.description} 
                                            onChange={e => updateEntry(idx, 'description', e.target.value)}
                                            placeholder="Line details..." 
                                            className="w-full bg-slate-50 border-transparent hover:border-slate-200 rounded p-1.5 text-xs text-slate-600" 
                                        />
                                    </td>
                                    <td className="py-3 text-center">
                                        <button onClick={() => handleRemoveEntry(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between items-start pt-4 border-t border-slate-200">
                        <button onClick={handleAddEntry} className="text-purple-900 font-bold text-sm hover:underline">+ Add Entry Row</button>
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Debit:</span>
                                <span className="font-mono text-blue-900 font-bold">{totalDebit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Credit:</span>
                                <span className="font-mono text-blue-900 font-bold">{totalCredit.toLocaleString()}</span>
                            </div>
                            <div className={`flex justify-between pt-2 border-t font-black ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                <span>Difference:</span>
                                <span>{(totalDebit - totalCredit).toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={handlePost}
                                disabled={!isBalanced}
                                className={`w-full mt-4 py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 ${isBalanced ? 'bg-purple-900 text-white hover:bg-purple-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isBalanced ? 'POST VOUCHER' : 'VOUCHER NOT BALANCED'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-purple-50 text-blue-900 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Voucher No</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Amount (PKR)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vouchers.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No vouchers found. Post your first transaction.</td></tr>
                            ) : (
                                vouchers.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600">{v.date}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-blue-900">{v.voucherNumber}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">{v.type}</span></td>
                                        <td className="px-6 py-4 text-blue-800 truncate max-w-xs">{v.description}</td>
                                        <td className="px-6 py-4 text-right font-black text-blue-900">{v.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center"><span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Posted</span></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VouchersPage;
