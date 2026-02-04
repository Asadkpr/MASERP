
import React, { useState, useMemo } from 'react';
import type { Student, DegreeProgram, AcademicSession } from '../../types';
import StudentProfilePage from './StudentProfilePage';

interface StudentDirectoryPageProps {
    students: Student[];
    programs: DegreeProgram[];
    sessions: AcademicSession[];
}

const StudentDirectoryPage: React.FC<StudentDirectoryPageProps> = (props) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [programFilter, setProgramFilter] = useState('All');

    const filteredStudents = useMemo(() => {
        return props.students.filter(s => {
            const matchesSearch = `${s.firstName} ${s.lastName} ${s.rollNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProg = programFilter === 'All' || s.programId === programFilter;
            return matchesSearch && matchesProg;
        });
    }, [props.students, searchQuery, programFilter]);

    if (selectedStudent) {
        return (
            <StudentProfilePage 
                student={selectedStudent} 
                program={props.programs.find(p => p.id === selectedStudent.programId)}
                session={props.sessions.find(s => s.id === selectedStudent.sessionId)}
                onBack={() => setSelectedStudent(null)} 
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Student Directory</h2>
                    <p className="text-blue-600 font-medium">Manage active enrollments and academic profiles.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select 
                        value={programFilter}
                        onChange={e => setProgramFilter(e.target.value)}
                        className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-900 outline-none"
                    >
                        <option value="All">All Programs</option>
                        {props.programs.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                    </select>
                    <div className="relative flex-1 md:w-80">
                        <input 
                            type="text" 
                            placeholder="Search by Name or Roll #..." 
                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-900 outline-none focus:border-blue-900 transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => (
                    <div 
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center text-white font-black text-xl shadow-lg rotate-2 group-hover:rotate-0 transition-transform">
                                {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-black text-blue-900 text-lg leading-tight truncate">{student.firstName} {student.lastName}</h3>
                                <p className="text-xs font-mono font-bold text-purple-600">{student.rollNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <span>Program</span>
                                <span className="text-blue-900">{props.programs.find(p => p.id === student.programId)?.code}</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <span>Section</span>
                                <span className="text-blue-900">{student.section}</span>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <span>Status</span>
                                <span className="text-green-600">{student.status}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[10px] text-slate-400 font-bold italic">Enrolled: {new Date(student.admissionDate).toLocaleDateString()}</p>
                            <span className="text-blue-900 font-black text-[10px] uppercase tracking-tighter">View Full Profile &rarr;</span>
                        </div>
                    </div>
                ))}
                {filteredStudents.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic font-bold">No students found matching your criteria.</div>}
            </div>
        </div>
    );
};

export default StudentDirectoryPage;
