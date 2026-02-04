
import React, { useState, useMemo } from 'react';
import type { Student, OfferedCourse, CourseCatalog, CourseRegistration, StudentMark } from '../../types';

interface MarksEntryPageProps {
    currentUserEmail: string;
    offeredCourses: OfferedCourse[];
    courseCatalog: CourseCatalog[];
    registrations: CourseRegistration[];
    students: Student[];
    marks: StudentMark[];
    onSaveMarks: (marks: Omit<StudentMark, 'id' | 'status' | 'entryDate'>[]) => Promise<void>;
    canEdit: boolean;
}

const MarksEntryPage: React.FC<MarksEntryPageProps> = (props) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Internal state for scores while editing
    const [scores, setScores] = useState<Record<string, { sessional: number; final: number }>>({});

    const myOfferedCourses = useMemo(() => {
        if (props.currentUserEmail === 'admin') return props.offeredCourses;
        return props.offeredCourses.filter(oc => oc.instructorId === props.currentUserEmail);
    }, [props.offeredCourses, props.currentUserEmail]);

    const enrolledStudents = useMemo(() => {
        if (!selectedCourseId) return [];
        const studentIds = props.registrations
            .filter(r => r.offeredCourseId === selectedCourseId && r.status === 'Approved')
            .map(r => r.studentId);
        
        // Initialize scores state from database or defaults
        const initialScores: Record<string, { sessional: number; final: number }> = {};
        studentIds.forEach(id => {
            const existingMark = props.marks.find(m => m.studentId === id && m.offeredCourseId === selectedCourseId);
            initialScores[id] = {
                sessional: existingMark?.sessionalMarks || 0,
                final: existingMark?.finalExamMarks || 0
            };
        });
        setScores(initialScores);

        return props.students.filter(s => studentIds.includes(s.id));
    }, [selectedCourseId, props.registrations, props.students, props.marks]);

    const calculateGrade = (total: number) => {
        if (total >= 90) return { grade: 'A+', gp: 4.0 };
        if (total >= 80) return { grade: 'A', gp: 4.0 };
        if (total >= 75) return { grade: 'B+', gp: 3.5 };
        if (total >= 70) return { grade: 'B', gp: 3.0 };
        if (total >= 65) return { grade: 'C+', gp: 2.5 };
        if (total >= 60) return { grade: 'C', gp: 2.0 };
        if (total >= 50) return { grade: 'D', gp: 1.0 };
        return { grade: 'F', gp: 0.0 };
    };

    const handleSave = async () => {
        if (!selectedCourseId || !props.canEdit) return;
        setIsSaving(true);
        
        const marksToSave: Omit<StudentMark, 'id' | 'status' | 'entryDate'>[] = enrolledStudents.map(s => {
            const data = scores[s.id];
            const total = (data.sessional || 0) + (data.final || 0);
            const res = calculateGrade(total);
            return {
                studentId: s.id,
                offeredCourseId: selectedCourseId,
                sessionalMarks: data.sessional,
                finalExamMarks: data.final,
                totalMarks: total,
                grade: res.grade,
                gradePoint: res.gp
            };
        });

        await props.onSaveMarks(marksToSave);
        setIsSaving(false);
        alert("Grades successfully computed and saved.");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-black text-blue-900 mb-6 uppercase tracking-tight">Faculty Marks Ledger</h2>
                
                <div className="max-w-md mb-8">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Select Course Module</label>
                    <select 
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900 outline-none focus:border-blue-900"
                    >
                        <option value="">-- Choose Assigned Course --</option>
                        {myOfferedCourses.map(oc => {
                            const catalog = props.courseCatalog.find(c => c.id === oc.courseId);
                            return <option key={oc.id} value={oc.id}>{catalog?.code} - {catalog?.name} (Sec {oc.section})</option>
                        })}
                    </select>
                </div>

                {selectedCourseId ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex justify-between items-center border border-blue-100">
                            <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">Weightage Rule: Sessional (50) + Finals (50) = Total (100)</p>
                            <span className="text-[10px] font-black text-blue-400 uppercase">HEC Standard Grading</span>
                        </div>

                        <div className="overflow-hidden border border-slate-100 rounded-2xl mb-8">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Student Roll & Name</th>
                                        <th className="px-6 py-4 text-center">Sessional (Max 50)</th>
                                        <th className="px-6 py-4 text-center">Finals (Max 50)</th>
                                        <th className="px-6 py-4 text-center">Total Score</th>
                                        <th className="px-6 py-4 text-center">Calculated Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {enrolledStudents.map(student => {
                                        const current = scores[student.id] || { sessional: 0, final: 0 };
                                        const total = (current.sessional || 0) + (current.final || 0);
                                        const res = calculateGrade(total);

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-blue-900">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{student.rollNumber}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <input 
                                                        type="number" 
                                                        max="50"
                                                        disabled={!props.canEdit}
                                                        value={current.sessional}
                                                        onChange={e => setScores({...scores, [student.id]: { ...current, sessional: parseFloat(e.target.value) || 0 }})}
                                                        className="w-20 border-2 border-slate-100 rounded-lg p-2 text-center font-bold text-blue-900 disabled:bg-slate-50" 
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <input 
                                                        type="number" 
                                                        max="50"
                                                        disabled={!props.canEdit}
                                                        value={current.final}
                                                        onChange={e => setScores({...scores, [student.id]: { ...current, final: parseFloat(e.target.value) || 0 }})}
                                                        className="w-20 border-2 border-slate-100 rounded-lg p-2 text-center font-bold text-blue-900 disabled:bg-slate-50" 
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-lg font-black text-blue-900">{total}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${total < 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                        {res.grade} ({res.gp.toFixed(1)})
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {props.canEdit && (
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-blue-900 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all disabled:bg-slate-300"
                                >
                                    {isSaving ? 'Calculating...' : 'Lock & Save Sheet'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-3xl p-20 text-center border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">Select a course module to begin marks entry.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarksEntryPage;
