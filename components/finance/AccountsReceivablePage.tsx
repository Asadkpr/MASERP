
import React, { useMemo } from 'react';
import type { FeeChallan } from '../../types';

interface AccountsReceivablePageProps {
    feeChallans: FeeChallan[];
}

const AccountsReceivablePage: React.FC<AccountsReceivablePageProps> = ({ feeChallans }) => {
    
    const stats = useMemo(() => {
        const unpaid = feeChallans.filter(c => c.status !== 'Paid' && c.status !== 'Refunded');
        const total = unpaid.reduce((sum, c) => sum + (c.totalAmount - c.paidAmount), 0);
        
        // Aging
        const now = new Date();
        const aging = {
            current: 0,
            thirty: 0,
            sixty: 0,
            ninetyPlus: 0
        };

        unpaid.forEach(c => {
            const due = new Date(c.dueDate);
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const amount = c.totalAmount - c.paidAmount;

            if (due > now) aging.current += amount;
            else if (diffDays <= 30) aging.thirty += amount;
            else if (diffDays <= 60) aging.sixty += amount;
            else aging.ninetyPlus += amount;
        });

        return { total, aging, count: unpaid.length };
    }, [feeChallans]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-blue-900">Accounts Receivable</h2>
                <p className="text-sm text-blue-600">Track outstanding student fees and receivable aging.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Outstanding</p>
                    <p className="text-2xl font-black text-blue-900">PKR {stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Pending Challans</p>
                    <p className="text-2xl font-black text-purple-900">{stats.count}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100 md:col-span-2">
                    <p className="text-[10px] font-black uppercase text-red-400 mb-1">Critical Overdue (60+ Days)</p>
                    <p className="text-2xl font-black text-red-600">PKR {stats.aging.ninetyPlus.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b bg-slate-50">
                    <h3 className="font-bold text-blue-900">Receivable Aging Report</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                            <p className="text-[10px] font-black uppercase text-green-600">Current / Not Due</p>
                            <p className="text-lg font-bold text-blue-900">PKR {stats.aging.current.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                            <p className="text-[10px] font-black uppercase text-yellow-600">1 - 30 Days</p>
                            <p className="text-lg font-bold text-blue-900">PKR {stats.aging.thirty.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                            <p className="text-[10px] font-black uppercase text-orange-600">31 - 60 Days</p>
                            <p className="text-lg font-bold text-blue-900">PKR {stats.aging.sixty.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                            <p className="text-[10px] font-black uppercase text-red-600">60+ Days</p>
                            <p className="text-lg font-bold text-blue-900">PKR {stats.aging.ninetyPlus.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Challan #</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4 text-right">Paid</th>
                            <th className="px-6 py-4 text-right font-black">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {feeChallans.filter(c => c.status !== 'Paid').map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-blue-900">{c.studentName}</td>
                                <td className="px-6 py-4 font-mono text-xs">{c.challanNumber}</td>
                                <td className="px-6 py-4 text-slate-500">{c.dueDate}</td>
                                <td className="px-6 py-4 text-right">{c.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">{c.paidAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-black text-red-600">{(c.totalAmount - c.paidAmount).toLocaleString()}</td>
                            </tr>
                        ))}
                        {feeChallans.length === 0 && <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No receivables found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountsReceivablePage;
