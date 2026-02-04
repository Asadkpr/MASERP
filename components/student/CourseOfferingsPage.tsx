
import React, { useState } from 'react';
import type { AcademicSession, CourseCatalog, OfferedCourse, Employee } from '../../types';

interface CourseOfferingsPageProps {
    sessions: AcademicSession[];
    courses: CourseCatalog[];
    employees: Employee[];
    offeredCourses: OfferedCourse[];
    onOfferCourse: (c: Omit<OfferedCourse, 'id' | 'currentEnrollment'>) => Promise<void>;
    canEdit: boolean;
}

const CourseOfferingsPage: React.FC<CourseOfferingsPageProps> = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({
        courseId: '', sessionId: '', instructorId: '', section: 'A', capacity: 50, semesterNumber: 1, prerequisites: '', timetableSlot: 'Mon 09:00 - 12:00'
    });

    const activeSession = props.sessions.find(s => s.isActive);

    const handleOffer = async () => {
        await props.onOfferCourse(form);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Course Offerings</h2>
                    <p className="text-blue-600 font-medium">Assign faculty and define class sections for the session.</p>
                </div>
                {props.canEdit && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest"
                    >
                        + Offer New Course
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {props.offeredCourses.map(offered => {
                    const catalogInfo = props.courses.find(c => c.id === offered.courseId);
                    const teacher = props.employees.find(e => e.id === offered.instructorId);
                    const fillPercentage = (offered.currentEnrollment / offered.capacity) * 100;

                    return (
                        <div key={offered.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{catalogInfo?.code}</span>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Section</p>
                                    <p className="text-sm font-black text-blue-900">{offered.section}</p>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-black text-blue-900 mb-6 leading-tight group-hover:text-purple-600 min-h-[3rem] line-clamp-2">
                                {catalogInfo?.name}
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-900 font-bold text-xs">
                                        {teacher?.firstName[0] || 'F'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Instructor</p>
                                        <p className="text-xs font-bold text-blue-900 truncate">
                                            {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'TBA'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="text-center flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Credits</p>
                                        <p className="text-xs font-black text-blue-900">{catalogInfo?.creditHours}</p>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                                    <div className="text-center flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase">Enrollment</p>
                                        <p className="text-xs font-black text-purple-900">{offered.currentEnrollment} / {offered.capacity}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${fillPercentage > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${fillPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
                {props.offeredCourses.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic font-bold">No courses have been offered for this session yet.</div>}
            </div>

            {/* Offer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">Offer Academic Course</h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Select Course Catalog</label>
                                    <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900 focus:border-blue-900 outline-none">
                                        <option value="">-- Search Catalog --</option>
                                        {props.courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Assigned Session</label>
                                    <select value={form.sessionId} onChange={e => setForm({...form, sessionId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option value="">-- Choose Session --</option>
                                        {props.sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Current)' : ''}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Instructor / Faculty</label>
                                    <select value={form.instructorId} onChange={e => setForm({...form, instructorId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option value="">-- Assign Teacher --</option>
                                        {props.employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Section Code</label>
                                    <input value={form.section} onChange={e => setForm({...form, section: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" placeholder="A, B, or Evening" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Class Cap</label>
                                    <input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Semester #</label>
                                    <input type="number" value={form.semesterNumber} onChange={e => setForm({...form, semesterNumber: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Prereq? (Optional)</label>
                                    <input value={form.prerequisites} onChange={e => setForm({...form, prerequisites: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" placeholder="e.g. CS101" />
                                </div>
                            </div>

                            <button onClick={handleOffer} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-800 uppercase tracking-widest text-xs">Authorize Course Offering</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseOfferingsPage;
