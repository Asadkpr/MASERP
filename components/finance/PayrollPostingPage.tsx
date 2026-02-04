
import React from 'react';
import type { PayrollRecord } from '../../types';

interface PayrollPostingPageProps {
    payrollHistory: PayrollRecord[];
    onPost: (id: string) => Promise<void>;
}

const PayrollPostingPage: React.FC<PayrollPostingPageProps> = ({ payrollHistory, onPost }) => {
    const unposted = payrollHistory.filter(p => !p.isPostedToFinance);
    const posted = payrollHistory.filter(p => p.isPostedToFinance);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-blue-900">Payroll Posting Integration</h2>
                <p className="text-sm text-blue-600">Post approved payroll from HR into the General Ledger as Journal Vouchers.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b bg-orange-50/30">
                    <h3 className="font-bold text-orange-900">Pending Financial Posting</h3>
                </div>
                <div className="p-6">
                    {unposted.length === 0 ? (
                        <p className="text-center py-10 text-slate-400 italic">All payroll records are already posted to finance.</p>
                    ) : (
                        <div className="space-y-4">
                            {unposted.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
                                    <div>
                                        <h4 className="font-black text-blue-900">{p.monthYear}</h4>
                                        <p className="text-xs text-slate-500">Employees: {p.employeeRecords.length} | Date: {new Date(p.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold">Total Net Pay</p>
                                            <p className="font-black text-blue-900">PKR {p.totalNetPay.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => { if(window.confirm("Convert this payroll into a Journal Voucher and update account balances?")) onPost(p.id); }}
                                            className="px-4 py-2 bg-purple-900 text-white rounded-lg font-bold text-sm hover:bg-purple-800"
                                        >
                                            Post to Ledger
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b bg-slate-50">
                    <h3 className="font-bold text-blue-900">Posting History</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-4">Month</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Net Payout</th>
                            <th className="px-6 py-4 text-right">Deductions</th>
                            <th className="px-6 py-4 text-center">Ref</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posted.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-blue-900">{p.monthYear}</td>
                                <td className="px-6 py-4"><span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Posted</span></td>
                                <td className="px-6 py-4 text-right font-black">PKR {p.totalNetPay.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-red-600">{p.totalDeductions.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center font-mono text-xs text-slate-400">FIN-PAY-{p.id.slice(-4).toUpperCase()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollPostingPage;
