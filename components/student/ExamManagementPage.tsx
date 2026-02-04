
import React, { useState, useMemo } from 'react';
import type { AcademicSession, OfferedCourse, CourseCatalog, Employee, Classroom, ExamSchedule } from '../../types';

interface ExamManagementPageProps {
    sessions: AcademicSession[];
    offeredCourses: OfferedCourse[];
    courseCatalog: CourseCatalog[];
    employees: Employee[];
    classrooms: Classroom[];
    examSchedules: ExamSchedule[];
    onAddExamSchedule: (e: Omit<ExamSchedule, 'id'>) => Promise<void>;
}

const ExamManagementPage: React.FC<ExamManagementPageProps> = (props) => {
    const [selectedSessionId, setSelectedSessionId] = useState(props.sessions.find(s => s.isActive)?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [form, setForm] = useState<Omit<ExamSchedule, 'id' | 'sessionId' | 'status'>>({
        offeredCourseId: '', date: '', startTime: '09:00', endTime: '12:00', classroomId: '', invigilatorId: ''
    });

    const activeExams = useMemo(() => {
        return props.examSchedules.filter(ex => ex.sessionId === selectedSessionId).sort((a, b) => a.date.localeCompare(b.date));
    }, [selectedSessionId, props.examSchedules]);

    const handleCreate = async () => {
        if (!selectedSessionId) return;
        await props.onAddExamSchedule({
            ...form,
            sessionId: selectedSessionId,
            status: 'Published'
        });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Examination Control Center</h2>
                    <p className="text-blue-600 font-medium">Design institutional date sheets and allocate invigilation staff.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-red-700 transition-all uppercase tracking-widest"
                >
                    + Schedule Exam Slot
                </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="max-w-md mb-8">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Examination Cycle</label>
                    <select 
                        value={selectedSessionId} 
                        onChange={e => setSelectedSessionId(e.target.value)}
                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900"
                    >
                        {props.sessions.map(s => <option key={s.id} value={s.id}>{s.name} - Mid/Finals</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Time Slot</th>
                                <th className="px-6 py-5">Module / Course</th>
                                <th className="px-6 py-5">Venue</th>
                                <th className="px-6 py-5">Invigilator</th>
                                <th className="px-6 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activeExams.map(ex => {
                                const offer = props.offeredCourses.find(o => o.id === ex.offeredCourseId);
                                const cat = props.courseCatalog.find(c => c.id === offer?.courseId);
                                const room = props.classrooms.find(r => r.id === ex.classroomId);
                                const staff = props.employees.find(e => e.id === ex.invigilatorId);

                                return (
                                    <tr key={ex.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5 font-black text-blue-900">{ex.date}</td>
                                        <td className="px-6 py-5 text-slate-500 font-bold">{ex.startTime} - {ex.endTime}</td>
                                        <td className="px-6 py-5">
                                            <p className="font-black text-purple-700 text-xs font-mono">{cat?.code}</p>
                                            <p className="font-bold text-blue-900">{cat?.name}</p>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-slate-500">{room?.roomNumber} ({room?.building})</td>
                                        <td className="px-6 py-5 font-bold text-blue-900">{staff ? `${staff.firstName} ${staff.lastName}` : 'TBA'}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Published</span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {activeExams.length === 0 && <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic">No examination slots defined for this cycle.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Exam Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">Schedule Examination</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Subject / Section</label>
                                <select value={form.offeredCourseId} onChange={e => setForm({...form, offeredCourseId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                    <option value="">-- Choose Module --</option>
                                    {props.offeredCourses.map(oc => {
                                        const cat = props.courseCatalog.find(c => c.id === oc.courseId);
                                        return <option key={oc.id} value={oc.id}>{cat?.code} - {cat?.name} (Sec {oc.section})</option>
                                    })}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Exam Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Start</label>
                                        <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">End</label>
                                        <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Exam Venue</label>
                                    <select value={form.classroomId} onChange={e => setForm({...form, classroomId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option value="">-- Choose Venue --</option>
                                        {props.classrooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} ({r.building})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Lead Invigilator</label>
                                    <select value={form.invigilatorId} onChange={e => setForm({...form, invigilatorId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option value="">-- Assign Staff --</option>
                                        {props.employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button onClick={handleCreate} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-red-700 uppercase tracking-widest text-xs">Publish to Date Sheet</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManagementPage;
