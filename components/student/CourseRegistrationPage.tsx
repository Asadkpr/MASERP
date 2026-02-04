
import React, { useState, useMemo } from 'react';
import type { Student, DegreeProgram, OfferedCourse, CourseCatalog, AcademicSession, CourseRegistration } from '../../types';

interface CourseRegistrationPageProps {
    students: Student[];
    programs: DegreeProgram[];
    offeredCourses: OfferedCourse[];
    courseCatalog: CourseCatalog[];
    sessions: AcademicSession[];
    registrations: CourseRegistration[];
    onRegister: (reg: Omit<CourseRegistration, 'id' | 'registrationDate' | 'status'>) => Promise<void>;
}

const CourseRegistrationPage: React.FC<CourseRegistrationPageProps> = (props) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState(props.sessions.find(s => s.isActive)?.id || '');

    const selectedStudent = props.students.find(s => s.id === selectedStudentId);

    // Get courses already registered by this student
    const studentRegistrations = props.registrations.filter(r => r.studentId === selectedStudentId);
    
    // Calculate current credit hours for validation
    const currentCreditHours = useMemo(() => {
        return studentRegistrations.reduce((acc, reg) => {
            const offer = props.offeredCourses.find(o => o.id === reg.offeredCourseId);
            const catalog = props.courseCatalog.find(c => c.id === offer?.courseId);
            return acc + (catalog?.creditHours || 0);
        }, 0);
    }, [studentRegistrations, props.offeredCourses, props.courseCatalog]);

    const handleEnroll = async (offeredCourseId: string, semesterNumber: number) => {
        if (!selectedStudentId) return;
        
        // Basic Overload Validation
        const courseToEnroll = props.offeredCourses.find(o => o.id === offeredCourseId);
        const catalogInfo = props.courseCatalog.find(c => c.id === courseToEnroll?.courseId);
        const newTotal = currentCreditHours + (catalogInfo?.creditHours || 0);

        if (newTotal > 21) {
            alert("Credit Hour Limit Exceeded (Max 21 CH per semester allowed).");
            return;
        }

        await props.onRegister({
            studentId: selectedStudentId,
            offeredCourseId,
            semesterNumber
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-blue-900 mb-6 uppercase tracking-tight">Registration Registry</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Student Identity</label>
                        <select 
                            value={selectedStudentId} 
                            onChange={e => setSelectedStudentId(e.target.value)}
                            className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900 focus:border-blue-900 outline-none"
                        >
                            <option value="">-- Choose Student --</option>
                            {props.students.map(s => <option key={s.id} value={s.id}>{s.rollNumber} - {s.firstName} {s.lastName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Academic Cycle</label>
                        <select 
                            value={selectedSessionId} 
                            onChange={e => setSelectedSessionId(e.target.value)}
                            className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold"
                        >
                            {props.sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {selectedStudent && (
                    <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl">
                                    {selectedStudent.firstName[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-blue-900">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                                    <p className="text-sm font-bold text-purple-600">{props.programs.find(p => p.id === selectedStudent.programId)?.name}</p>
                                </div>
                            </div>
                            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-right">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Enrolled Load</p>
                                <p className="text-xl font-black text-blue-900">{currentCreditHours} / 21 <span className="text-xs font-bold">CH</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Current Registered Courses */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                                    Registered Courses
                                </h4>
                                {studentRegistrations.length === 0 ? (
                                    <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400 italic font-bold">No courses registered for this session.</div>
                                ) : (
                                    studentRegistrations.map(reg => {
                                        const offer = props.offeredCourses.find(o => o.id === reg.offeredCourseId);
                                        const catalog = props.courseCatalog.find(c => c.id === offer?.courseId);
                                        return (
                                            <div key={reg.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-black text-purple-700 font-mono">{catalog?.code}</p>
                                                    <p className="text-sm font-bold text-blue-900">{catalog?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Confirmed</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Available for Enrollment */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                    Available for Enrollment
                                </h4>
                                {props.offeredCourses
                                    .filter(offer => !studentRegistrations.some(r => r.offeredCourseId === offer.id))
                                    .map(offer => {
                                        const catalog = props.courseCatalog.find(c => c.id === offer.courseId);
                                        const isFull = offer.currentEnrollment >= offer.capacity;
                                        return (
                                            <div key={offer.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-blue-900 transition-all">
                                                <div>
                                                    <p className="text-xs font-black text-blue-500 font-mono">{catalog?.code} &mdash; Sec {offer.section}</p>
                                                    <p className="text-sm font-bold text-blue-900">{catalog?.name}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Credits: {catalog?.creditHours} | Seats: {offer.capacity - offer.currentEnrollment} left</p>
                                                </div>
                                                <button 
                                                    disabled={isFull}
                                                    onClick={() => handleEnroll(offer.id, offer.semesterNumber)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                                        isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-900 text-white shadow hover:scale-105'
                                                    }`}
                                                >
                                                    {isFull ? 'Full' : 'Enroll'}
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseRegistrationPage;
