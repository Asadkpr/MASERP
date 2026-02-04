
import React, { useState, useMemo } from 'react';
import type { Student, OfferedCourse, CourseCatalog, CourseRegistration, TimetableEntry, StudentAttendance } from '../../types';

interface AttendanceTrackingPageProps {
    currentUserEmail: string;
    offeredCourses: OfferedCourse[];
    courseCatalog: CourseCatalog[];
    registrations: CourseRegistration[];
    students: Student[];
    timetable: TimetableEntry[];
    attendance: StudentAttendance[];
    onMarkAttendance: (records: Omit<StudentAttendance, 'id'>[]) => Promise<void>;
}

const AttendanceTrackingPage: React.FC<AttendanceTrackingPageProps> = (props) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceDraft, setAttendanceDraft] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Filter courses assigned to the current instructor
    const myOfferedCourses = useMemo(() => {
        if (props.currentUserEmail === 'admin') return props.offeredCourses;
        return props.offeredCourses.filter(oc => oc.instructorId === props.currentUserEmail || oc.instructorId.includes(props.currentUserEmail));
    }, [props.offeredCourses, props.currentUserEmail]);

    const enrolledStudents = useMemo(() => {
        if (!selectedCourseId) return [];
        const studentIds = props.registrations
            .filter(r => r.offeredCourseId === selectedCourseId && r.status === 'Approved')
            .map(r => r.studentId);
        return props.students.filter(s => studentIds.includes(s.id));
    }, [selectedCourseId, props.registrations, props.students]);

    const handleMarkAll = (status: 'Present' | 'Absent') => {
        const newDraft = { ...attendanceDraft };
        enrolledStudents.forEach(s => newDraft[s.id] = status);
        setAttendanceDraft(newDraft);
    };

    const handleSubmit = async () => {
        if (!selectedCourseId || enrolledStudents.length === 0) return;
        
        setIsSaving(true);
        const records: Omit<StudentAttendance, 'id'>[] = enrolledStudents.map(s => ({
            studentId: s.id,
            offeredCourseId: selectedCourseId,
            timetableEntryId: props.timetable.find(t => t.offeredCourseId === selectedCourseId)?.id || 'unknown',
            date: attendanceDate,
            status: attendanceDraft[s.id] || 'Absent',
            markedBy: props.currentUserEmail
        }));

        await props.onMarkAttendance(records);
        setIsSaving(false);
        alert("Attendance successfully synced to database.");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-blue-900 mb-6 uppercase tracking-tight">Faculty Attendance Register</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-end">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Select Course Module</label>
                        <select 
                            value={selectedCourseId}
                            onChange={e => { setSelectedCourseId(e.target.value); setAttendanceDraft({}); }}
                            className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900 outline-none focus:border-blue-900"
                        >
                            <option value="">-- Choose Assigned Course --</option>
                            {myOfferedCourses.map(oc => {
                                const catalog = props.courseCatalog.find(c => c.id === oc.courseId);
                                return <option key={oc.id} value={oc.id}>{catalog?.code} - {catalog?.name} (Sec {oc.section})</option>
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Attendance Date</label>
                        <input 
                            type="date" 
                            value={attendanceDate} 
                            onChange={e => setAttendanceDate(e.target.value)}
                            className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900" 
                        />
                    </div>
                </div>

                {selectedCourseId ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-blue-900 text-lg">Class Register ({enrolledStudents.length} Students)</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleMarkAll('Present')} className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase hover:bg-green-100 transition-colors">Mark All Present</button>
                                <button onClick={() => handleMarkAll('Absent')} className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase hover:bg-red-100 transition-colors">Mark All Absent</button>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-8">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b">
                                    <tr>
                                        <th className="px-6 py-4">Student Info</th>
                                        <th className="px-6 py-4 text-center">Current %</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {enrolledStudents.map(student => {
                                        const currentStatus = attendanceDraft[student.id] || 'Absent';
                                        
                                        // Calculate current percentage for this course
                                        const studentCourseAttendance = props.attendance.filter(a => a.studentId === student.id && a.offeredCourseId === selectedCourseId);
                                        const presentCount = studentCourseAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
                                        const attendancePct = studentCourseAttendance.length > 0 ? Math.round((presentCount / studentCourseAttendance.length) * 100) : 100;

                                        return (
                                            <tr key={student.id} className="hover:bg-white transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-blue-900">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[10px] font-mono text-slate-500 uppercase">{student.rollNumber}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-xs font-black ${attendancePct < 75 ? 'text-red-600' : 'text-green-600'}`}>{attendancePct}%</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-1">
                                                        {['Present', 'Late', 'Absent'].map((stat: any) => (
                                                            <button
                                                                key={stat}
                                                                onClick={() => setAttendanceDraft({...attendanceDraft, [student.id]: stat})}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                                                                    currentStatus === stat 
                                                                    ? (stat === 'Present' ? 'bg-green-600 text-white shadow-md' : stat === 'Late' ? 'bg-orange-500 text-white shadow-md' : 'bg-red-600 text-white shadow-md')
                                                                    : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-900'
                                                                }`}
                                                            >
                                                                {stat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="bg-blue-900 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all active:scale-95 disabled:bg-slate-400"
                            >
                                {isSaving ? 'Syncing...' : 'Publish Register'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-3xl p-20 text-center border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">Select a course to start marking attendance.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceTrackingPage;
