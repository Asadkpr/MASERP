
import React, { useState, useMemo } from 'react';
import type { AcademicSession, OfferedCourse, CourseCatalog, Student, StudentMark } from '../../types';

interface ResultProcessingPageProps {
    sessions: AcademicSession[];
    offeredCourses: OfferedCourse[];
    courseCatalog: CourseCatalog[];
    students: Student[];
    marks: StudentMark[];
    onPublishResults: (sessionId: string) => Promise<void>;
    canEdit: boolean;
}

const ResultProcessingPage: React.FC<ResultProcessingPageProps> = (props) => {
    const [selectedSessionId, setSelectedSessionId] = useState(props.sessions.find(s => s.isActive)?.id || '');
    const [isPublishing, setIsPublishing] = useState(false);

    const sessionStats = useMemo(() => {
        const sessionOffered = props.offeredCourses.filter(o => o.sessionId === selectedSessionId);
        const sessionMarks = props.marks.filter(m => sessionOffered.some(o => o.id === m.offeredCourseId));
        
        const passCount = sessionMarks.filter(m => m.grade !== 'F').length;
        const failCount = sessionMarks.filter(m => m.grade === 'F').length;
        const pendingCount = sessionOffered.length * 50 - sessionMarks.length; // Placeholder math

        return { total: sessionMarks.length, pass: passCount, fail: failCount, pending: pendingCount };
    }, [selectedSessionId, props.offeredCourses, props.marks]);

    const handlePublish = async () => {
        if (!window.confirm("WARNING: This will lock all marks for this session and publish results to Student Portals. Proceed?")) return;
        setIsPublishing(true);
        await props.onPublishResults(selectedSessionId);
        setIsPublishing(false);
        alert("Results have been officially published.");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">GPA & Result Processing</h2>
                    <p className="text-blue-600 font-medium">Verify institutional performance and finalize semester records.</p>
                </div>
                {props.canEdit && (
                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-green-700 transition-all uppercase tracking-widest disabled:bg-slate-300"
                    >
                        {isPublishing ? 'Processing...' : 'Publish Official Results'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Graded</p>
                    <p className="text-3xl font-black text-blue-900">{sessionStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Passed</p>
                    <p className="text-3xl font-black text-green-600">{sessionStats.pass}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Failed</p>
                    <p className="text-3xl font-black text-red-600">{sessionStats.fail}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Avg GPA</p>
                    <p className="text-3xl font-black text-purple-600">3.12</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                <div className="max-w-md mb-8">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Examination Cycle</label>
                    <select 
                        value={selectedSessionId} 
                        onChange={e => setSelectedSessionId(e.target.value)}
                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-blue-900"
                    >
                        {props.sessions.map(s => <option key={s.id} value={s.id}>{s.name} - Mid/Final Cycle</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="px-6 py-5">Module Name</th>
                                <th className="px-6 py-5 text-center">Faculty</th>
                                <th className="px-6 py-5 text-center">Graded Students</th>
                                <th className="px-6 py-5 text-center">Highest Score</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {props.offeredCourses.filter(o => o.sessionId === selectedSessionId).map(offer => {
                                const catalog = props.courseCatalog.find(c => c.id === offer.courseId);
                                const marksForCourse = props.marks.filter(m => m.offeredCourseId === offer.id);
                                const isReady = marksForCourse.length > 0;

                                return (
                                    <tr key={offer.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="font-black text-blue-900">{catalog?.name}</p>
                                            <p className="text-[10px] font-mono text-purple-600">{catalog?.code} - Sec {offer.section}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-slate-500">
                                            {offer.instructorId.split('@')[0]}
                                        </td>
                                        <td className="px-6 py-5 text-center font-black text-blue-900">
                                            {marksForCourse.length} / {offer.currentEnrollment}
                                        </td>
                                        <td className="px-6 py-5 text-center font-black text-teal-600">
                                            {marksForCourse.length > 0 ? Math.max(...marksForCourse.map(m => m.totalMarks)) : '-'}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                isReady ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {isReady ? 'Ready for Audit' : 'Entry Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="text-[10px] font-black text-purple-900 uppercase hover:underline">Auditing Details</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ResultProcessingPage;
