
import React, { useState, useMemo } from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { MasbotLogo } from '../icons/MasbotLogo';
import { CalendarIcon } from '../icons/CalendarIcon';
import { AttendanceIcon } from '../icons/AttendanceIcon';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';
import { DollarIcon } from '../icons/DollarIcon';
import { StudentIcon } from '../icons/StudentIcon';
import type { Student, CourseCatalog, OfferedCourse, CourseRegistration, StudentAttendance, StudentMark, TimetableEntry, ExamSchedule, AcademicNotification, FeeChallan, DegreeProgram, Classroom } from '../../types';

interface StudentPortalPageProps {
    student: Student;
    onLogout: () => void;
    courses: CourseCatalog[];
    offeredCourses: OfferedCourse[];
    registrations: CourseRegistration[];
    attendance: StudentAttendance[];
    marks: StudentMark[];
    timetable: TimetableEntry[];
    exams: ExamSchedule[];
    notifications: AcademicNotification[];
    feeChallans: FeeChallan[];
    programs: DegreeProgram[];
    classrooms: Classroom[];
}

const StudentPortalPage: React.FC<StudentPortalPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'home' | 'academics' | 'exams' | 'finance'>('home');

    const myRegistrations = props.registrations.filter(r => r.studentId === props.student.id);
    const myOfferedCourses = props.offeredCourses.filter(oc => myRegistrations.some(r => r.offeredCourseId === oc.id));
    const myChallans = props.feeChallans.filter(c => c.studentId === props.student.id);

    // Dynamic Stats
    const stats = useMemo(() => {
        const studentAttendance = props.attendance.filter(a => a.studentId === props.student.id);
        const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
        const totalAttendance = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 100;

        const studentMarks = props.marks.filter(m => m.studentId === props.student.id && m.status === 'Published');
        const avgGPA = studentMarks.length > 0 ? (studentMarks.reduce((acc, m) => acc + m.gradePoint, 0) / studentMarks.length).toFixed(2) : '0.00';

        const pendingFees = myChallans.filter(c => c.status !== 'Paid').length > 0;

        return { attendance: totalAttendance, gpa: avgGPA, pendingFees };
    }, [props.student, props.attendance, props.marks, myChallans]);

    const renderHome = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Attendance Rate</p>
                    <p className="text-3xl font-black text-blue-900">{stats.attendance}%</p>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-3"><div className="bg-green-500 h-full rounded-full" style={{width: `${stats.attendance}%`}}></div></div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Current GPA</p>
                    <p className="text-3xl font-black text-purple-900">{stats.gpa}</p>
                    <p className="text-[10px] text-purple-400 font-bold uppercase mt-2">Semester 1 Milestone</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Account Balance</p>
                    <p className={`text-3xl font-black ${stats.pendingFees ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.pendingFees ? 'Dues Pending' : 'Cleared'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Financial Status</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notice Board */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                    <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs mb-6">Campus Notice Board</h3>
                    <div className="space-y-4">
                        {props.notifications.slice(0, 4).map(note => (
                            <div key={note.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-blue-900 text-sm">{note.title}</h4>
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(note.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2">{note.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-6">Today's Class Schedule</h3>
                    <div className="space-y-6">
                        {props.timetable.filter(t => myRegistrations.some(r => r.offeredCourseId === t.offeredCourseId)).map(slot => {
                            const offer = props.offeredCourses.find(o => o.id === slot.offeredCourseId);
                            const cat = props.courses.find(c => c.id === offer?.courseId);
                            const room = props.classrooms.find(r => r.id === slot.classroomId);
                            return (
                                <div key={slot.id} className="flex gap-4 group">
                                    <div className="w-16 text-right">
                                        <p className="font-black text-sm">{slot.startTime}</p>
                                        <p className="text-[9px] text-slate-500 font-bold">{slot.day}</p>
                                    </div>
                                    <div className="flex-1 pb-6 border-l border-slate-700 pl-6 relative">
                                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-slate-900"></div>
                                        <h4 className="font-black text-sm">{cat?.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Room {room?.roomNumber} • Instructor: {offer?.instructorId.split('@')[0]}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAcademics = () => (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-blue-900 mb-6 uppercase tracking-tight">Registered Coursework</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myRegistrations.map(reg => {
                        const offer = props.offeredCourses.find(o => o.id === reg.offeredCourseId);
                        const cat = props.courses.find(c => c.id === offer?.courseId);
                        const mark = props.marks.find(m => m.studentId === props.student.id && m.offeredCourseId === offer?.id && m.status === 'Published');
                        
                        return (
                            <div key={reg.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 group hover:border-blue-900 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black bg-blue-900 text-white px-2 py-0.5 rounded">{cat?.code}</span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${mark ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {mark ? `Grade: ${mark.grade}` : 'Ongoing'}
                                    </span>
                                </div>
                                <h4 className="font-black text-blue-900 text-lg leading-tight mb-4">{cat?.name}</h4>
                                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                                    <span>Credits: {cat?.creditHours}</span>
                                    <span>Section {offer?.section}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderFinance = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm overflow-hidden">
                <h3 className="text-xl font-black text-blue-900 mb-6 uppercase tracking-tight">Fee Ledgers</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-6 py-5">Month/Year</th>
                            <th className="px-6 py-5">Challan #</th>
                            <th className="px-6 py-5 text-right">Total Amount</th>
                            <th className="px-6 py-5 text-right">Status</th>
                            <th className="px-6 py-5 text-right">Dues Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {myChallans.map(chl => (
                            <tr key={chl.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5 font-bold text-blue-900">{chl.month} {chl.year}</td>
                                <td className="px-6 py-5 font-mono text-xs text-slate-400">{chl.challanNumber}</td>
                                <td className="px-6 py-5 text-right font-black text-blue-900">PKR {chl.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-5 text-right">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${chl.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {chl.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right font-bold text-slate-400">{chl.dueDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200 h-20 flex-shrink-0 flex items-center justify-between px-10 shadow-sm z-30">
                <div className="flex items-center gap-6">
                    <MasbotLogo className="h-10 w-auto" />
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {props.student.firstName[0]}
                        </div>
                        <div>
                            <p className="text-sm font-black text-blue-900 leading-none">{props.student.firstName} {props.student.lastName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{props.student.rollNumber} • {props.student.department}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex bg-slate-50 p-1.5 rounded-2xl gap-2 mr-6 border border-slate-100">
                        {[
                            { id: 'home', label: 'Dashboard', icon: HomeIcon },
                            { id: 'academics', label: 'Academic Record', icon: StudentIcon },
                            { id: 'finance', label: 'Fee Portal', icon: DollarIcon }
                        ].map(link => (
                            <button
                                key={link.id}
                                onClick={() => setActiveTab(link.id as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === link.id ? 'bg-blue-900 text-white shadow-xl' : 'text-slate-400 hover:text-blue-900'}`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>
                    <button onClick={props.onLogout} className="text-slate-400 hover:text-red-600 transition-colors">
                        <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-10 overflow-y-auto">
                {activeTab === 'home' && renderHome()}
                {activeTab === 'academics' && renderAcademics()}
                {activeTab === 'finance' && renderFinance()}
            </main>

            <footer className="h-14 bg-white border-t border-slate-100 flex items-center justify-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Institutional Management System • 2025</p>
            </footer>
        </div>
    );
};

export default StudentPortalPage;
