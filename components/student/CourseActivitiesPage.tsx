
import React, { useState, useMemo } from 'react';
import type { OfferedCourse, CourseCatalog, CourseActivity } from '../../types';

interface CourseActivitiesPageProps {
    currentUserEmail: string;
    offeredCourses: OfferedCourse[];
    courseCatalog: CourseCatalog[];
    activities: CourseActivity[];
    onAddActivity: (a: Omit<CourseActivity, 'id'>) => Promise<void>;
}

const CourseActivitiesPage: React.FC<CourseActivitiesPageProps> = (props) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [form, setForm] = useState<Omit<CourseActivity, 'id' | 'offeredCourseId' | 'postedDate' | 'isPublished'>>({
        type: 'Lecture', title: '', content: '', dueDate: ''
    });

    const myCourses = useMemo(() => {
        if (props.currentUserEmail === 'admin') return props.offeredCourses;
        return props.offeredCourses.filter(oc => oc.instructorId === props.currentUserEmail);
    }, [props.offeredCourses, props.currentUserEmail]);

    const activeActivities = useMemo(() => {
        if (!selectedCourseId) return [];
        return props.activities.filter(a => a.offeredCourseId === selectedCourseId);
    }, [selectedCourseId, props.activities]);

    const handlePost = async () => {
        if (!selectedCourseId) return;
        await props.onAddActivity({
            ...form,
            offeredCourseId: selectedCourseId,
            postedDate: new Date().toISOString(),
            isPublished: true
        });
        setIsModalOpen(false);
        setForm({ type: 'Lecture', title: '', content: '', dueDate: '' });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Academic Resource Center</h2>
                        <p className="text-sm text-blue-600 font-medium">Manage lecture materials, assignments, and class bulletins.</p>
                    </div>
                    {selectedCourseId && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-purple-800 transition-all uppercase tracking-widest"
                        >
                            + Post New Activity
                        </button>
                    )}
                </div>

                <div className="max-w-md mb-10">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Select Active Course Module</label>
                    <select 
                        value={selectedCourseId} 
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900 outline-none focus:border-blue-900"
                    >
                        <option value="">-- Choose Assigned Module --</option>
                        {myCourses.map(oc => {
                            const catalog = props.courseCatalog.find(c => c.id === oc.courseId);
                            return <option key={oc.id} value={oc.id}>{catalog?.code} - {catalog?.name} (Sec {oc.section})</option>
                        })}
                    </select>
                </div>

                {selectedCourseId ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 gap-4">
                            {activeActivities.length === 0 ? (
                                <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                    <p className="text-slate-400 italic font-bold">No academic activities posted for this module yet.</p>
                                </div>
                            ) : (
                                activeActivities.map(act => (
                                    <div key={act.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex justify-between items-center group hover:bg-white hover:border-purple-600 transition-all">
                                        <div className="flex gap-5 items-center">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-[10px] uppercase text-white shadow-md ${
                                                act.type === 'Lecture' ? 'bg-blue-600' : 
                                                act.type === 'Assignment' ? 'bg-purple-600' : 
                                                act.type === 'Quiz' ? 'bg-orange-600' : 'bg-slate-600'
                                            }`}>
                                                {act.type[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-blue-900 leading-tight">{act.title}</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                    Posted: {new Date(act.postedDate).toLocaleDateString()}
                                                    {act.dueDate && <span className="text-red-500 ml-3">Deadline: {act.dueDate}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-[10px] font-black text-purple-900 uppercase bg-white border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50">View Details</button>
                                            <button className="text-[10px] font-black text-red-400 uppercase px-2 hover:text-red-600">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">Select a module from the dropdown to manage learning activities.</p>
                    </div>
                )}
            </div>

            {/* Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">Post New Activity</h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Category</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option>Lecture</option><option>Assignment</option><option>Quiz</option><option>Announcement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Deadline (Optional)</label>
                                    <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Title / Heading</label>
                                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" placeholder="e.g. Week 4 - Calculus Slides" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Content / Resource Link</label>
                                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" rows={4} placeholder="Enter description or paste Drive/Teams link..." />
                            </div>

                            <button onClick={handlePost} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-800 uppercase tracking-widest text-xs">Publish Activity</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseActivitiesPage;
