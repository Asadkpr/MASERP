
import React, { useState, useMemo } from 'react';
import type { FinanceFixedAsset } from '../../types';

interface FixedAssetsFinancePageProps {
    assets: FinanceFixedAsset[];
    onAdd: (a: Omit<FinanceFixedAsset, 'id'>) => Promise<void>;
    onDispose: (id: string, value: number) => Promise<void>;
}

const FixedAssetsFinancePage: React.FC<FixedAssetsFinancePageProps> = ({ assets, onAdd, onDispose }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<Omit<FinanceFixedAsset, 'id' | 'accumulatedDepreciation' | 'status'>>({
        assetName: '', assetCode: '', category: 'Equipment', purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: 0, usefulLifeYears: 5, salvageValue: 0, depreciationMethod: 'Straight Line'
    });

    const categories = ['Buildings', 'Machinery', 'Vehicles', 'IT Equipment', 'Furniture', 'Kitchen Assets'];

    const totals = useMemo(() => {
        const active = assets.filter(a => a.status === 'Active');
        const cost = active.reduce((s, a) => s + a.purchaseCost, 0);
        const dep = active.reduce((s, a) => s + a.accumulatedDepreciation, 0);
        return { cost, dep, nbv: cost - dep };
    }, [assets]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd({ ...form, accumulatedDepreciation: 0, status: 'Active' });
        setIsModalOpen(false);
        setForm({ assetName: '', assetCode: '', category: 'Equipment', purchaseDate: new Date().toISOString().split('T')[0], purchaseCost: 0, usefulLifeYears: 5, salvageValue: 0, depreciationMethod: 'Straight Line' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Fixed Asset Register</h2>
                    <p className="text-sm text-blue-600">Track asset valuation, lifecycle, and depreciation schedules.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-purple-900 text-white rounded-xl font-bold shadow-lg hover:bg-purple-800 transition-all"
                >
                    + Purchase New Asset
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Asset Cost</p>
                    <p className="text-2xl font-black text-blue-900">PKR {totals.cost.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Accumulated Dep.</p>
                    <p className="text-2xl font-black text-orange-600">PKR {totals.dep.toLocaleString()}</p>
                </div>
                <div className="bg-blue-900 p-6 rounded-xl shadow-lg border border-blue-800">
                    <p className="text-[10px] font-black uppercase text-blue-300 mb-1">Net Book Value (NBV)</p>
                    <p className="text-2xl font-black text-white">PKR {totals.nbv.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-blue-900 font-bold uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Asset Name</th>
                            <th className="px-6 py-4">Purchase Date</th>
                            <th className="px-6 py-4 text-right">Cost</th>
                            <th className="px-6 py-4 text-right">Accum. Dep</th>
                            <th className="px-6 py-4 text-right">NBV</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {assets.map(asset => (
                            <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">{asset.assetCode}</td>
                                <td className="px-6 py-4 font-bold text-blue-900">{asset.assetName}</td>
                                <td className="px-6 py-4 text-slate-500">{asset.purchaseDate}</td>
                                <td className="px-6 py-4 text-right">{asset.purchaseCost.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-orange-600">{asset.accumulatedDepreciation.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-black text-blue-900">{(asset.purchaseCost - asset.accumulatedDepreciation).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    {asset.status === 'Active' ? (
                                        <button 
                                            onClick={() => { const val = prompt("Enter disposal sale value:"); if(val) onDispose(asset.id, parseFloat(val)); }}
                                            className="text-red-600 font-bold hover:underline"
                                        >
                                            Dispose
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase text-slate-400">Disposed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {assets.length === 0 && <tr><td colSpan={7} className="text-center py-20 text-slate-400 italic">Register is empty. Buy your first asset.</td></tr>}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
                        <h3 className="text-xl font-black text-blue-900 mb-6">Asset Purchase Entry</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input value={form.assetCode} onChange={e => setForm({...form, assetCode: e.target.value})} placeholder="Asset Code" className="w-full border rounded-xl p-2.5 text-sm" required />
                                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <input value={form.assetName} onChange={e => setForm({...form, assetName: e.target.value})} placeholder="Asset Name" className="w-full border rounded-xl p-2.5 text-sm" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm" />
                                <input type="number" placeholder="Cost" value={form.purchaseCost || ''} onChange={e => setForm({...form, purchaseCost: parseFloat(e.target.value) || 0})} className="w-full border rounded-xl p-2.5 text-sm font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Useful Life (Years)" value={form.usefulLifeYears || ''} onChange={e => setForm({...form, usefulLifeYears: parseInt(e.target.value) || 0})} className="w-full border rounded-xl p-2.5 text-sm" />
                                <input type="number" placeholder="Salvage Value" value={form.salvageValue || ''} onChange={e => setForm({...form, salvageValue: parseFloat(e.target.value) || 0})} className="w-full border rounded-xl p-2.5 text-sm" />
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                <button type="submit" className="px-8 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold shadow-lg">Capitalize Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FixedAssetsFinancePage;
