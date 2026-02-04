
import React, { useState } from 'react';
import type { AuditLog, Voucher } from '../../types';

interface AuditCompliancePageProps {
    logs: AuditLog[];
    vouchers: Voucher[];
}

const AuditCompliancePage: React.FC<AuditCompliancePageProps> = ({ logs, vouchers }) => {
    const [view, setView] = useState<'audit' | 'integrity'>('audit');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Audit & Compliance</h2>
                    <p className="text-sm text-blue-600">Track all system modifications, voucher postings, and ledger changes.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 border rounded-lg shadow-sm">
                     <button onClick={() => setView('audit')} className={`px-4 py-2 text-xs font-bold rounded-md ${view === 'audit' ? 'bg-purple-900 text-white' : 'text-slate-400'}`}>Activity Log</button>
                     <button onClick={() => setView('integrity')} className={`px-4 py-2 text-xs font-bold rounded-md ${view === 'integrity' ? 'bg-purple-900 text-white' : 'text-slate-400'}`}>Voucher Integrity</button>
                </div>
            </div>

            {view === 'audit' ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-blue-900">{log.userEmail}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-black border border-blue-100">{log.action}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{log.details}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && <tr><td colSpan={4} className="text-center py-20 text-slate-400 italic">No audit logs found. System is compliant.</td></tr>}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-blue-900 p-6 rounded-2xl text-white">
                        <h3 className="text-lg font-bold mb-2">Ledger Integrity Check</h3>
                        <p className="text-blue-300 text-sm">Validating matching Debits and Credits for all {vouchers.length} posted vouchers.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {vouchers.map(v => {
                            const debits = v.entries.filter(e => e.type === 'Debit').reduce((s, e) => s + e.amount, 0);
                            const credits = v.entries.filter(e => e.type === 'Credit').reduce((s, e) => s + e.amount, 0);
                            const isIntegrityOk = Math.abs(debits - credits) < 0.01;

                            return (
                                <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-blue-900">{v.voucherNumber}</p>
                                        <p className="text-xs text-slate-500">{v.description}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Total Lines: {v.entries.length}</p>
                                            <p className="font-bold text-blue-900">PKR {v.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isIntegrityOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {isIntegrityOk ? 'Verified' : 'Mismatch'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditCompliancePage;
