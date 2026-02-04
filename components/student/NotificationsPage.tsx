
import React, { useState } from 'react';
import type { AcademicNotification, DegreeProgram } from '../../types';

interface NotificationsPageProps {
    notifications: AcademicNotification[];
    currentUserEmail: string;
    programs: DegreeProgram[];
    onPost: (n: Omit<AcademicNotification, 'id'>) => Promise<void>;
}

const NotificationsPage: React.FC<NotificationsPageProps> = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<Omit<AcademicNotification, 'id' | 'timestamp' | 'postedBy'>>({
        title: '', content: '', category: 'General Notice', audience: 'All'
    });

    const handlePost = async () => {
        await props.onPost({
            ...form,
            postedBy: props.currentUserEmail,
            timestamp: new Date().toISOString()
        });
        setIsModalOpen(false);
        setForm({ title: '', content: '', category: 'General Notice', audience: 'All' });
    };

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'Exam Alert': return '🔴';
            case 'Class Notification': return '📘';
            case 'Academic': return '🎓';
            default: return '📢';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Notification Center</h2>
                    <p className="text-blue-600 font-medium">Broadcast alerts and institutional updates.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-blue-800 transition-all uppercase tracking-[0.1em]"
                >
                    + Compose Announcement
                </button>
            </div>

            <div className="space-y-4">
                {props.notifications.map(note => {
                    const prog = props.programs.find(p => p.id === note.audience);
                    return (
                        <div key={note.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 group hover:border-blue-900 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-inner">
                                        {getIcon(note.category)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-blue-900 group-hover:text-indigo-700 transition-colors">{note.title}</h3>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                                            Posted by {note.postedBy.split('@')[0]} • {new Date(note.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                    note.category === 'Exam Alert' ? 'bg-red-100 text-red-700' :
                                    note.category === 'Class Notification' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {note.category}
                                </span>
                            </div>

                            <p className="text-slate-600 leading-relaxed text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                {note.content}
                            </p>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility:</span>
                                    <span className="text-[10px] font-black text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded">
                                        {note.audience === 'All' ? 'CAMPUS WIDE' : prog?.name}
                                    </span>
                                </div>
                                <button className="text-[10px] font-black text-red-400 uppercase opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all">Archieve</button>
                            </div>
                        </div>
                    );
                })}
                {props.notifications.length === 0 && (
                    <div className="bg-slate-50 p-20 rounded-[3rem] text-center border-4 border-dashed border-white">
                        <p className="text-slate-400 font-bold italic">Campus announcement feed is empty.</p>
                    </div>
                )}
            </div>

            {/* Notification Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">Compose Announcement</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Notice Headline</label>
                                <input 
                                    value={form.title} 
                                    onChange={e => setForm({...form, title: e.target.value})} 
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900" 
                                    placeholder="e.g. Midterm Examination Schedule Released"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Category</label>
                                    <select 
                                        value={form.category} 
                                        onChange={e => setForm({...form, category: e.target.value as any})} 
                                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold"
                                    >
                                        <option>Academic</option>
                                        <option>Exam Alert</option>
                                        <option>Class Notification</option>
                                        <option>General Notice</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Target Audience</label>
                                    <select 
                                        value={form.audience} 
                                        onChange={e => setForm({...form, audience: e.target.value})} 
                                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold"
                                    >
                                        <option value="All">Everyone (Campus)</option>
                                        {props.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Announcement Content</label>
                                <textarea 
                                    value={form.content} 
                                    onChange={e => setForm({...form, content: e.target.value})} 
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" 
                                    rows={4} 
                                    placeholder="Provide detailed information here..."
                                />
                            </div>
                            <button onClick={handlePost} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-blue-800 transition-all">Broadcast Now</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
