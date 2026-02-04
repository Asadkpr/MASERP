
import React, { useState, useMemo } from 'react';
import type { VendorBill, Vendor } from '../../types';

interface AccountsPayablePageProps {
    bills: VendorBill[];
    vendors: Vendor[];
    onAddBill: (b: Omit<VendorBill, 'id'>) => Promise<void>;
    onPay: (billId: string, amount: number) => Promise<void>;
}

const AccountsPayablePage: React.FC<AccountsPayablePageProps> = ({ bills, vendors, onAddBill, onPay }) => {
    const [view, setView] = useState<'bills' | 'vendors'>('bills');
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    
    const [billForm, setBillForm] = useState<Omit<VendorBill, 'id' | 'paidAmount' | 'status'>>({
        billNumber: '', vendorId: '', vendorName: '', 
        date: new Date().toISOString().split('T')[0], 
        dueDate: '', totalAmount: 0, description: ''
    });

    const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
    const [payAmount, setPayAmount] = useState(0);

    const totalPayable = useMemo(() => bills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0), [bills]);
    const overdueCount = useMemo(() => bills.filter(b => b.status !== 'Paid' && new Date(b.dueDate) < new Date()).length, [bills]);

    const handleSaveBill = async () => {
        const vendor = vendors.find(v => v.id === billForm.vendorId);
        await onAddBill({ 
            ...billForm, 
            vendorName: vendor?.name || 'Unknown', 
            paidAmount: 0, 
            status: 'Unpaid' 
        });
        setIsBillModalOpen(false);
        setBillForm({ billNumber: '', vendorId: '', vendorName: '', date: new Date().toISOString().split('T')[0], dueDate: '', totalAmount: 0, description: '' });
    };

    const handleConfirmPayment = async () => {
        if (selectedBill && payAmount > 0) {
            await onPay(selectedBill.id, payAmount);
            setIsPayModalOpen(false);
            setSelectedBill(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Accounts Payable</h2>
                    <p className="text-sm text-blue-600">Manage vendor invoices, tracking of payables and historical payments.</p>
                </div>
                <button 
                    onClick={() => setIsBillModalOpen(true)}
                    className="px-6 py-2.5 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:bg-purple-800 transition-all"
                >
                    + Add Vendor Bill
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Outstanding</p>
                    <p className="text-2xl font-black text-blue-900">PKR {totalPayable.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Overdue Invoices</p>
                    <p className="text-2xl font-black text-red-600">{overdueCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 flex items-center justify-center gap-8">
                     <button onClick={() => setView('bills')} className={`text-sm font-bold uppercase tracking-widest ${view === 'bills' ? 'text-purple-900 border-b-2 border-purple-900' : 'text-slate-400'}`}>Bill List</button>
                     <button onClick={() => setView('vendors')} className={`text-sm font-bold uppercase tracking-widest ${view === 'vendors' ? 'text-purple-900 border-b-2 border-purple-900' : 'text-slate-400'}`}>Vendor Balances</button>
                </div>
            </div>

            {view === 'bills' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="px-6 py-4">Bill Date</th>
                                <th className="px-6 py-4">Bill #</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Balance</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bills.map(bill => {
                                const isOverdue = new Date(bill.dueDate) < new Date() && bill.status !== 'Paid';
                                return (
                                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{bill.date}</td>
                                        <td className="px-6 py-4 font-bold text-blue-900">{bill.billNumber}</td>
                                        <td className="px-6 py-4 font-bold text-blue-900">{bill.vendorName}</td>
                                        <td className={`px-6 py-4 ${isOverdue ? 'text-red-600 font-black' : 'text-slate-600'}`}>{bill.dueDate}</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-500">{bill.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-black text-blue-900">{(bill.totalAmount - bill.paidAmount).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                                bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                bill.status === 'Partial' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {bill.status !== 'Paid' && (
                                                <button 
                                                    onClick={() => { setSelectedBill(bill); setPayAmount(bill.totalAmount - bill.paidAmount); setIsPayModalOpen(true); }}
                                                    className="text-purple-900 font-bold hover:underline"
                                                >
                                                    Pay
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {bills.length === 0 && <tr><td colSpan={8} className="text-center py-20 text-slate-400 italic">No vendor bills recorded.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'vendors' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map(v => {
                        const vendorBills = bills.filter(b => b.vendorId === v.id);
                        const balance = vendorBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
                        return (
                            <div key={v.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-purple-200 transition-all">
                                <div>
                                    <h3 className="font-black text-blue-900 text-lg leading-tight mb-1">{v.name}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase font-black">{v.contactPerson}</p>
                                    <div className="mt-4 flex justify-between text-sm">
                                        <span className="text-slate-500">Invoices</span>
                                        <span className="font-bold text-blue-900">{vendorBills.length}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Outstanding Balance</p>
                                    <p className="text-xl font-black text-purple-900">PKR {balance.toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Bill Modal */}
            {isBillModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-6">New Vendor Bill</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Select Vendor</label>
                                <select value={billForm.vendorId} onChange={e => setBillForm({...billForm, vendorId: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm font-bold text-blue-900">
                                    <option value="">-- Choose Vendor --</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Bill Number</label>
                                    <input value={billForm.billNumber} onChange={e => setBillForm({...billForm, billNumber: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" placeholder="INV-001" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Total Amount (PKR)</label>
                                    <input type="number" value={billForm.totalAmount || ''} onChange={e => setBillForm({...billForm, totalAmount: parseFloat(e.target.value) || 0})} className="w-full border rounded-xl p-2.5 text-sm font-black" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Bill Date</label>
                                    <input type="date" value={billForm.date} onChange={e => setBillForm({...billForm, date: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Due Date</label>
                                    <input type="date" value={billForm.dueDate} onChange={e => setBillForm({...billForm, dueDate: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                                <button onClick={() => setIsBillModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                <button onClick={handleSaveBill} className="px-8 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold shadow-lg">Record Bill</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPayModalOpen && selectedBill && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-2">Record Vendor Payment</h3>
                        <p className="text-sm text-slate-500 mb-6">Bill #{selectedBill.billNumber} to {selectedBill.vendorName}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Payment Amount</label>
                                <input 
                                    type="number" 
                                    value={payAmount} 
                                    onChange={e => setPayAmount(parseFloat(e.target.value) || 0)} 
                                    className="w-full border-2 border-purple-100 rounded-xl p-4 text-2xl font-black text-blue-900 focus:border-purple-500 outline-none" 
                                />
                            </div>
                            <button onClick={handleConfirmPayment} className="w-full bg-purple-900 text-white py-4 rounded-xl font-black shadow-lg hover:bg-purple-800 transition-all uppercase tracking-widest text-xs">Record Payment</button>
                            <button onClick={() => setIsPayModalOpen(false)} className="w-full text-xs font-bold text-slate-400 py-2">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPayablePage;
