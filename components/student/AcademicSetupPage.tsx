
import React, { useState } from 'react';
import type { AcademicSession, DegreeProgram, CourseCatalog, AcademicPolicy } from '../../types';

interface AcademicSetupPageProps {
    sessions: AcademicSession[];
    programs: DegreeProgram[];
    courses: CourseCatalog[];
    policies: AcademicPolicy[];
    onAddSession: (s: Omit<AcademicSession, 'id'>) => Promise<void>;
    onAddProgram: (p: Omit<DegreeProgram, 'id'>) => Promise<void>;
    onAddCourse: (c: Omit<CourseCatalog, 'id'>) => Promise<void>;
    onAddPolicy: (p: Omit<AcademicPolicy, 'id'>) => Promise<void>;
    canEdit: boolean;
}

const AcademicSetupPage: React.FC<AcademicSetupPageProps> = (props) => {
    const [tab, setTab] = useState<'sessions' | 'programs' | 'courses' | 'policies'>('sessions');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States
    const [sessionForm, setSessionForm] = useState({ name: '', startDate: '', endDate: '', isActive: true });
    const [programForm, setProgramForm] = useState({ name: '', code: '', department: 'SIR', durationYears: 4, totalSemesters: 8 });
    const [courseForm, setCourseForm] = useState({ code: '', name: '', creditHours: 3, description: '' });

    const handleAddSession = async () => {
        await props.onAddSession(sessionForm);
        setIsModalOpen(false);
    };

    const handleAddProgram = async () => {
        await props.onAddProgram(programForm);
        setIsModalOpen(false);
    };

    const handleAddCourse = async () => {
        await props.onAddCourse(courseForm);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Academic Framework Setup</h2>
                    <p className="text-blue-600 font-medium mt-1">Configure institutional structure for the upcoming cycle.</p>
                </div>
                {props.canEdit && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest"
                    >
                        + New {tab.slice(0, -1)}
                    </button>
                )}
            </div>

            {/* Modern Navigation Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit">
                {['sessions', 'programs', 'courses', 'policies'].map((t: any) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            tab === t ? 'bg-blue-900 text-white shadow-md' : 'text-slate-400 hover:text-blue-900'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {tab === 'sessions' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Session Name</th>
                                <th className="px-8 py-5">Timeline</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {props.sessions.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5 font-black text-blue-900 text-lg">{s.name}</td>
                                    <td className="px-8 py-5 text-slate-500 font-bold">{s.startDate} &mdash; {s.endDate}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {s.isActive ? 'Active' : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {props.canEdit ? <button className="text-blue-900 font-bold hover:underline">Edit</button> : '-'}
                                    </td>
                                </tr>
                            ))}
                            {props.sessions.length === 0 && <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic font-bold">No academic sessions defined.</td></tr>}
                        </tbody>
                    </table>
                )}

                {tab === 'programs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                        {props.programs.map(p => (
                            <div key={p.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-900 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[10px] font-black">{p.code}</span>
                                    <p className="text-[10px] text-slate-400 font-black uppercase">{p.department}</p>
                                </div>
                                <h3 className="text-xl font-black text-blue-900 mb-6 leading-tight group-hover:text-purple-900">{p.name}</h3>
                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Duration</p>
                                        <p className="text-sm font-bold text-blue-900">{p.durationYears} Years</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Semesters</p>
                                        <p className="text-sm font-bold text-blue-900">{p.totalSemesters}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {props.programs.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic">No degree programs registered.</div>}
                    </div>
                )}

                {tab === 'courses' && (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="px-8 py-5">Course Code</th>
                                <th className="px-8 py-5">Course Title</th>
                                <th className="px-8 py-5 text-center">Credit Hours</th>
                                <th className="px-8 py-5 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {props.courses.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5 font-mono font-black text-purple-700">{c.code}</td>
                                    <td className="px-8 py-5 font-bold text-blue-900">{c.name}</td>
                                    <td className="px-8 py-5 text-center font-black">{c.creditHours}</td>
                                    <td className="px-8 py-5 text-right">
                                        {props.canEdit ? <button className="text-blue-900 font-bold hover:underline">Manage Rules</button> : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Combined Setup Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">Add New {tab.slice(0, -1)}</h3>
                        
                        <div className="space-y-6">
                            {tab === 'sessions' && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Session Title</label>
                                        <input value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-900 outline-none transition-all font-bold" placeholder="e.g. Fall 2026" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Starts</label>
                                            <input type="date" value={sessionForm.startDate} onChange={e => setSessionForm({...sessionForm, startDate: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Ends</label>
                                            <input type="date" value={sessionForm.endDate} onChange={e => setSessionForm({...sessionForm, endDate: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddSession} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-800 uppercase tracking-widest text-xs">Authorize Session</button>
                                </>
                            )}

                            {tab === 'programs' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Program Code</label>
                                            <input value={programForm.code} onChange={e => setProgramForm({...programForm, code: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold uppercase" placeholder="e.g. BSCS" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Department</label>
                                            <select value={programForm.department} onChange={e => setProgramForm({...programForm, department: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                                <option>SIR</option><option>SADU</option><option>Arts</option><option>SDCA</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Full Degree Title</label>
                                        <input value={programForm.name} onChange={e => setProgramForm({...programForm, name: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" placeholder="e.g. BS Computer Science" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Duration (Years)</label>
                                            <input type="number" value={programForm.durationYears} onChange={e => setProgramForm({...programForm, durationYears: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Total Semesters</label>
                                            <input type="number" value={programForm.totalSemesters} onChange={e => setProgramForm({...programForm, totalSemesters: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                        </div>
                                    </div>
                                    <button onClick={handleAddProgram} className="w-full bg-purple-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-purple-800 uppercase tracking-widest text-xs">Create Program</button>
                                </>
                            )}

                            {tab === 'courses' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Course Code</label>
                                            <input value={courseForm.code} onChange={e => setCourseForm({...courseForm, code: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold uppercase" placeholder="e.g. CS101" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Credit Hours</label>
                                            <input type="number" value={courseForm.creditHours} onChange={e => setCourseForm({...courseForm, creditHours: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Course Name</label>
                                        <input value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" placeholder="e.g. Artificial Intelligence" />
                                    </div>
                                    <button onClick={handleAddCourse} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-teal-700 uppercase tracking-widest text-xs">Add to Catalog</button>
                                </>
                            )}

                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-xs uppercase py-2">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicSetupPage;
