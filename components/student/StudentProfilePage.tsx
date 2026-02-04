
import React, { useState } from 'react';
import type { Student, DegreeProgram, AcademicSession } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
// Added missing import for StudentIcon
import { StudentIcon } from '../icons/StudentIcon';

interface StudentProfilePageProps {
    student: Student;
    program?: DegreeProgram;
    session?: AcademicSession;
    onBack: () => void;
}

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ student, program, session, onBack }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'guardian' | 'documents' | 'history'>('overview');

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
        <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-sm font-bold text-blue-900">{value || 'N/A'}</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-4">
                <button 
                    onClick={onBack}
                    className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-blue-900 hover:text-purple-600 transition-all"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-black text-blue-900 tracking-tight">Academic Profile</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center">
                        <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-700 flex items-center justify-center text-white font-black text-4xl shadow-xl mb-6 transform -rotate-3">
                            {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <h3 className="text-xl font-black text-blue-900 mb-1">{student.firstName} {student.lastName}</h3>
                        <p className="text-xs font-mono font-black text-purple-600 mb-6 bg-purple-50 px-3 py-1 rounded-full">{student.rollNumber}</p>
                        
                        <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Program</p>
                            <p className="text-sm font-bold text-blue-900">{program?.name || 'N/A'}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl">Active Student</span>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl">Section {student.section}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-4 border-b pb-2">Quick Stats</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Attendance</span>
                                <span className="text-xs font-black text-blue-900">-- %</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Current CGPA</span>
                                <span className="text-xs font-black text-purple-900">0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Fee Status</span>
                                <span className="text-xs font-black text-red-600">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="lg:col-span-3 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    {/* Sub-navigation */}
                    <div className="flex border-b border-slate-100 bg-slate-50 p-2 gap-2">
                        {['overview', 'guardian', 'documents', 'history'].map((t: any) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                    activeTab === t ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-blue-900'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="p-10 flex-1">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                        <InfoRow label="Father's Name" value={student.fatherName} />
                                        <InfoRow label="Gender" value={student.gender} />
                                        <InfoRow label="Date of Birth" value={student.dob} />
                                        <InfoRow label="CNIC / ID" value={student.cnic} />
                                        <InfoRow label="Official Email" value={student.email} />
                                        <InfoRow label="Contact No." value={student.phone} />
                                        <div className="col-span-full">
                                            <InfoRow label="Residential Address" value={student.address} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t">
                                    <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                        Academic Enrollment
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                        <InfoRow label="Assigned Department" value={student.department} />
                                        <InfoRow label="Academic Session" value={session?.name || 'N/A'} />
                                        <InfoRow label="Batch" value={student.batch} />
                                        <InfoRow label="Enrollment Date" value={new Date(student.admissionDate).toLocaleDateString()} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'guardian' && (
                            <div className="max-w-xl mx-auto py-10">
                                <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100">
                                    <h3 className="font-black text-purple-900 mb-6 uppercase tracking-widest text-xs">Primary Guardian Details</h3>
                                    <InfoRow label="Full Name" value={student.guardianName} />
                                    <InfoRow label="Relationship" value="Father" />
                                    <InfoRow label="Emergency Contact" value={student.guardianPhone} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {['SSC Certificate', 'HSSC Certificate', 'CNIC Copy', 'Photograph'].map(doc => (
                                    <div key={doc} className="aspect-square bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group hover:border-blue-900 transition-all">
                                        <StudentIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-900 mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase text-center px-4 group-hover:text-blue-900">{doc}</p>
                                        <button className="mt-4 text-[9px] font-black text-purple-600 uppercase">View File</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-green-700">✓</div>
                                    <div>
                                        <p className="text-sm font-black text-green-900">Student Admitted</p>
                                        <p className="text-xs text-green-600">{new Date(student.admissionDate).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">?</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">First Semester Enrollment Pending</p>
                                        <p className="text-xs text-slate-400">Awaiting course registration phase</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;
