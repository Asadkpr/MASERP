
import React, { useState, useMemo } from 'react';
import type { FeeStructure, FeeChallan, FeeItem } from '../../types';

interface StudentFeesPageProps {
    feeStructures: FeeStructure[];
    feeChallans: FeeChallan[];
    onAddStructure: (f: Omit<FeeStructure, 'id'>) => Promise<void>;
    onUpdateStructure: (id: string, f: Partial<FeeStructure>) => Promise<void>;
    onDeleteStructure: (id: string) => Promise<void>;
    onIssueChallan: (c: Omit<FeeChallan, 'id'>) => Promise<void>;
    onCollectFee: (challanId: string, amount: number) => Promise<void>;
}

const StudentFeesPage: React.FC<StudentFeesPageProps> = ({ 
    feeStructures, feeChallans, onAddStructure, onUpdateStructure, onDeleteStructure, onIssueChallan, onCollectFee 
}) => {
    const [view, setView] = useState<'challans' | 'structures' | 'collect'>('challans');
    const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
    const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
    const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

    // Form States
    const [structureForm, setStructureForm] = useState<Omit<FeeStructure, 'id'>>({
        name: '', category: '', items: [{ name: 'Admission Fee', amount: 5000 }], totalAmount: 5000
    });
    
    const [challanForm, setChallanForm] = useState<Omit<FeeChallan, 'id'>>({
        challanNumber: '', studentId: '', studentName: '', studentEmail: '',
        month: 'August', year: '2026', dueDate: '', items: [], discount: 0,
        totalAmount: 0, paidAmount: 0, status: 'Unpaid'
    });

    const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);
    const [collectAmount, setCollectAmount] = useState(0);

    // --- Structures Logic ---
    const handleAddStructureItem = () => {
        const items = [...structureForm.items, { name: '', amount: 0 }];
        setStructureForm({ ...structureForm, items, totalAmount: items.reduce((s, i) => s + i.amount, 0) });
    };

    const handleUpdateStructureItem = (idx: number, field: keyof FeeItem, val: any) => {
        const items = [...structureForm.items];
        (items[idx] as any)[field] = field === 'amount' ? parseFloat(val) || 0 : val;
        setStructureForm({ ...structureForm, items, totalAmount: items.reduce((s, i) => s + i.amount, 0) });
    };

    const handleSaveStructure = async () => {
        await onAddStructure(structureForm);
        setIsStructureModalOpen(false);
        setStructureForm({ name: '', category: '', items: [{ name: '', amount: 0 }], totalAmount: 0 });
    };

    // --- Challan Logic ---
    const handleSelectStructureForChallan = (structId: string) => {
        const struct = feeStructures.find(s => s.id === structId);
        if (struct) {
            setChallanForm({
                ...challanForm,
                items: [...struct.items],
                totalAmount: struct.totalAmount
            });
        }
    };

    const handleIssue = async () => {
        const finalAmount = challanForm.totalAmount - challanForm.discount;
        await onIssueChallan({ 
            ...challanForm, 
            challanNumber: `CHL-${Date.now().toString().slice(-6)}`,
            totalAmount: finalAmount 
        });
        setIsChallanModalOpen(false);
    };

    // --- Collection Logic ---
    const handleConfirmCollection = async () => {
        if (selectedChallan && collectAmount > 0) {
            await onCollectFee(selectedChallan.id, collectAmount);
            setIsCollectModalOpen(false);
            setSelectedChallan(null);
            setCollectAmount(0);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Student Fee Management</h2>
                    <p className="text-sm text-blue-600">Handle fee structures, issue monthly challans, and record collections.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setView('structures')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'structures' ? 'bg-purple-900 text-white' : 'bg-white border'}`}>Structures</button>
                    <button onClick={() => setView('challans')} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'challans' ? 'bg-purple-900 text-white' : 'bg-white border'}`}>Active Challans</button>
                </div>
            </div>

            {view === 'structures' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        onClick={() => setIsStructureModalOpen(true)}
                        className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-all"
                    >
                        <span className="text-4xl text-purple-400 mb-2">+</span>
                        <p className="font-bold text-purple-900">Create New Fee Structure</p>
                        <p className="text-xs text-purple-600">Define degree/year wise templates</p>
                    </div>
                    {feeStructures.map(struct => (
                        <div key={struct.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-blue-900 text-lg leading-tight">{struct.name}</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded uppercase">{struct.category}</span>
                                </div>
                                <ul className="space-y-1 mb-6">
                                    {struct.items.map((item, i) => (
                                        <li key={i} className="text-xs flex justify-between text-slate-500">
                                            <span>{item.name}</span>
                                            <span className="font-bold">PKR {item.amount.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <p className="text-sm font-black text-blue-900">Total: PKR {struct.totalAmount.toLocaleString()}</p>
                                <button onClick={() => onDeleteStructure(struct.id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'challans' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setIsChallanModalOpen(true)} className="px-6 py-2.5 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:bg-purple-800 transition-all">+ Issue New Challan</button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    <th className="px-6 py-4">Challan #</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Month/Year</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Total Amount</th>
                                    <th className="px-6 py-4 text-right">Paid</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {feeChallans.map(chl => (
                                    <tr key={chl.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-purple-900">{chl.challanNumber}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-blue-900">{chl.studentName}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{chl.studentId}</p>
                                        </td>
                                        <td className="px-6 py-4">{chl.month} {chl.year}</td>
                                        <td className="px-6 py-4 font-medium text-red-600">{chl.dueDate}</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-900">{chl.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">{chl.paidAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                                chl.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                chl.status === 'Partial' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {chl.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {chl.status !== 'Paid' && (
                                                <button 
                                                    onClick={() => { setSelectedChallan(chl); setCollectAmount(chl.totalAmount - chl.paidAmount); setIsCollectModalOpen(true); }}
                                                    className="text-purple-900 font-bold hover:underline"
                                                >
                                                    Collect
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {feeChallans.length === 0 && <tr><td colSpan={8} className="text-center py-20 text-slate-400 italic">No challans issued. Start by issuing a fee challan.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Structure Modal */}
            {isStructureModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in duration-200">
                        <h3 className="text-xl font-black text-blue-900 mb-6">New Fee Structure</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Structure Name</label>
                                    <input value={structureForm.name} onChange={e => setStructureForm({...structureForm, name: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" placeholder="e.g. BSCS Fall 2024" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Category</label>
                                    <input value={structureForm.category} onChange={e => setStructureForm({...structureForm, category: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" placeholder="Degree Type" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Fee Components</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {structureForm.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input value={item.name} onChange={e => handleUpdateStructureItem(idx, 'name', e.target.value)} className="flex-1 border rounded-lg p-2 text-xs" placeholder="Head" />
                                            <input type="number" value={item.amount} onChange={e => handleUpdateStructureItem(idx, 'amount', e.target.value)} className="w-24 border rounded-lg p-2 text-xs text-right" placeholder="Amount" />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleAddStructureItem} className="text-[10px] font-bold text-purple-900 mt-2">+ Add Line Item</button>
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <p className="font-bold text-blue-900">Total: PKR {structureForm.totalAmount.toLocaleString()}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsStructureModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                    <button onClick={handleSaveStructure} className="px-6 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-purple-800">Save Structure</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Issuance Modal */}
            {isChallanModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-6">Issue Fee Challan</h3>
                        <div className="space-y-4">
                            <select 
                                onChange={e => handleSelectStructureForChallan(e.target.value)} 
                                className="w-full border rounded-xl p-2.5 text-sm font-bold text-blue-900"
                            >
                                <option value="">-- Choose Fee Template --</option>
                                {feeStructures.map(s => <option key={s.id} value={s.id}>{s.name} (PKR {s.totalAmount})</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input value={challanForm.studentId} onChange={e => setChallanForm({...challanForm, studentId: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" placeholder="Student ID" />
                                <input value={challanForm.studentName} onChange={e => setChallanForm({...challanForm, studentName: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" placeholder="Full Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={challanForm.dueDate} onChange={e => setChallanForm({...challanForm, dueDate: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" />
                                <input type="number" placeholder="Discount" value={challanForm.discount || ''} onChange={e => setChallanForm({...challanForm, discount: parseFloat(e.target.value) || 0})} className="w-full border rounded-xl p-2.5 text-sm" />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Final Payable</p>
                                <p className="text-2xl font-black text-blue-900">PKR {(challanForm.totalAmount - challanForm.discount).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsChallanModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                <button onClick={handleIssue} className="px-6 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold shadow-lg">Issue Challan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collection Modal */}
            {isCollectModalOpen && selectedChallan && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-sm p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-2">Record Payment</h3>
                        <p className="text-sm text-slate-500 mb-6">Challan #{selectedChallan.challanNumber} - {selectedChallan.studentName}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Amount Received</label>
                                <input 
                                    type="number" 
                                    value={collectAmount} 
                                    onChange={e => setCollectAmount(parseFloat(e.target.value) || 0)} 
                                    className="w-full border-2 border-purple-100 rounded-xl p-4 text-2xl font-black text-blue-900 focus:border-purple-500 outline-none" 
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-center">Remaining Balance: {(selectedChallan.totalAmount - selectedChallan.paidAmount - collectAmount).toLocaleString()}</p>
                            <button onClick={handleConfirmCollection} className="w-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg hover:bg-green-700 transition-all uppercase tracking-widest text-xs">Confirm Collection</button>
                            <button onClick={() => setIsCollectModalOpen(false)} className="w-full text-xs font-bold text-slate-400 py-2">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFeesPage;
