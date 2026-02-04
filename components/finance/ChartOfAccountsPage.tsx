
import React, { useState, useMemo } from 'react';
import type { FinanceAccount, AccountType } from '../../types';

interface ChartOfAccountsPageProps {
    accounts: FinanceAccount[];
    onAdd: (a: Omit<FinanceAccount, 'id'>) => Promise<void>;
    onUpdate: (id: string, a: Partial<FinanceAccount>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ChartOfAccountsPage: React.FC<ChartOfAccountsPageProps> = ({ accounts, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
    
    // Form State
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('Asset');
    const [parentId, setParentId] = useState<string>('');
    const [description, setDescription] = useState('');

    const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

    const handleOpenAdd = () => {
        setEditingAccount(null);
        setCode(''); setName(''); setType('Asset'); setParentId(''); setDescription('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (acc: FinanceAccount) => {
        setEditingAccount(acc);
        setCode(acc.code);
        setName(acc.name);
        setType(acc.type);
        setParentId(acc.parentId || '');
        setDescription(acc.description || '');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { code, name, type, parentId, description, balance: editingAccount?.balance || 0 };
        if (editingAccount) {
            await onUpdate(editingAccount.id, data);
        } else {
            await onAdd(data);
        }
        setIsModalOpen(false);
    };

    const groupedAccounts = useMemo(() => {
        return accountTypes.reduce((acc, t) => {
            acc[t] = accounts.filter(a => a.type === t);
            return acc;
        }, {} as Record<AccountType, FinanceAccount[]>);
    }, [accounts]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">Chart of Accounts</h2>
                    <p className="text-sm text-blue-600">Categorize and manage your financial accounts.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                    <span className="text-lg font-bold">+</span>
                    <span>Create Account</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accountTypes.map(t => (
                    <div key={t} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-purple-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-blue-900 uppercase tracking-wider text-xs">{t}s</h3>
                            <span className="bg-white px-2 py-0.5 rounded text-[10px] font-black text-purple-900 border border-purple-100">{groupedAccounts[t].length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
                            {groupedAccounts[t].length === 0 ? (
                                <p className="text-center py-8 text-xs text-slate-400 italic">No {t.toLowerCase()} accounts.</p>
                            ) : (
                                groupedAccounts[t].map(acc => (
                                    <div 
                                        key={acc.id} 
                                        className="group p-3 rounded-lg border border-transparent hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer flex justify-between items-start transition-all"
                                        onClick={() => handleOpenEdit(acc)}
                                    >
                                        <div>
                                            <p className="text-xs font-mono text-slate-500">{acc.code}</p>
                                            <p className="text-sm font-bold text-blue-900">{acc.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-blue-900">PKR {acc.balance.toLocaleString()}</p>
                                            <span className="text-[9px] text-slate-400 group-hover:text-purple-600 font-bold uppercase">Edit</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-blue-900">{editingAccount ? 'Edit Account' : 'New Account'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Account Code</label>
                                    <input value={code} onChange={e => setCode(e.target.value)} required className="w-full border rounded-lg p-2 text-sm text-blue-900 focus:ring-2 focus:ring-purple-900" placeholder="e.g. 1010-001" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Type</label>
                                    <select value={type} onChange={e => setType(e.target.value as AccountType)} className="w-full border rounded-lg p-2 text-sm text-blue-900 focus:ring-2 focus:ring-purple-900">
                                        {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Account Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-lg p-2 text-sm text-blue-900 focus:ring-2 focus:ring-purple-900" placeholder="e.g. Petty Cash" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Parent Account (Optional)</label>
                                <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full border rounded-lg p-2 text-sm text-blue-900 focus:ring-2 focus:ring-purple-900">
                                    <option value="">No Parent (Root Level)</option>
                                    {accounts.filter(a => a.id !== editingAccount?.id).map(a => (
                                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-900 uppercase mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border rounded-lg p-2 text-sm text-blue-900 focus:ring-2 focus:ring-purple-900" />
                            </div>

                            <div className="flex gap-2 pt-4">
                                {editingAccount && (
                                    <button 
                                        type="button" 
                                        onClick={() => { if(window.confirm("Delete account?")) { onDelete(editingAccount.id); setIsModalOpen(false); } }}
                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button type="submit" className="flex-1 bg-purple-900 text-white rounded-lg py-2 font-bold hover:bg-purple-800">
                                    {editingAccount ? 'Save Changes' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartOfAccountsPage;
