
import React, { useState, useMemo } from 'react';
import type { FinanceExpense, FinanceAccount } from '../../types';

interface ExpenseManagementPageProps {
    expenses: FinanceExpense[];
    accounts: FinanceAccount[];
    onAdd: (e: Omit<FinanceExpense, 'id'>) => Promise<void>;
    onAction: (id: string, action: 'Approve' | 'Paid') => Promise<void>;
}

const ExpenseManagementPage: React.FC<ExpenseManagementPageProps> = ({ expenses, accounts, onAdd, onAction }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<Omit<FinanceExpense, 'id' | 'status'>>({
        category: 'Utilities',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        vendorName: ''
    });

    const expenseCategories = ['Utilities', 'Rent', 'Salaries', 'Repairs', 'Marketing', 'Office Supplies', 'Others'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd({ ...form, status: 'Pending' });
        setIsModalOpen(false);
        setForm({ category: 'Utilities', date: new Date().toISOString().split('T')[0], amount: 0, description: '', vendorName: '' });
    };

    const statusStats = useMemo(() => ({
        pending: expenses.filter(e => e.status === 'Pending').length,
        approved: expenses.filter(e => e.status === 'Approved').length,
        totalPaid: expenses.filter(e => e.status === 'Paid').reduce((s, e) => s + e.amount, 0)
    }), [expenses]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Expense Management</h2>
                    <p className="text-sm text-blue-600">Track company operational spending and manage approvals.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:bg-purple-800 transition-all"
                >
                    + Record Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Awaiting Approval</p>
                    <p className="text-3xl font-black text-orange-600">{statusStats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Approved for Payment</p>
                    <p className="text-3xl font-black text-blue-900">{statusStats.approved}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Paid (Month)</p>
                    <p className="text-3xl font-black text-green-600">PKR {statusStats.totalPaid.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Description / Vendor</th>
                            <th className="px-6 py-4 text-right">Amount (PKR)</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {expenses.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No expense records found.</td></tr>
                        ) : (
                            expenses.map(exp => (
                                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600">{exp.date}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">{exp.category}</span></td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-blue-900">{exp.description}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">{exp.vendorName || 'Generic'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-blue-900">{exp.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                            exp.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            exp.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        {exp.status === 'Pending' && (
                                            <button onClick={() => onAction(exp.id, 'Approve')} className="text-blue-900 font-bold hover:underline">Approve</button>
                                        )}
                                        {exp.status === 'Approved' && (
                                            <button onClick={() => onAction(exp.id, 'Paid')} className="text-green-600 font-bold hover:underline">Pay Now</button>
                                        )}
                                        {exp.status === 'Paid' && (
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{exp.paymentVoucherId || 'Paid'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-6">New Expense Entry</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm">
                                        {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Amount (PKR)</label>
                                <input type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} className="w-full border rounded-xl p-4 text-2xl font-black text-blue-900" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Description / Narration</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" rows={2} placeholder="Purpose of expense..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Paid to (Vendor/Person)</label>
                                <input value={form.vendorName} onChange={e => setForm({...form, vendorName: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" placeholder="Optional" />
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                <button type="submit" className="px-8 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold shadow-lg">Submit for Approval</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseManagementPage;
