
import React, { useState } from 'react';
import type { Applicant, DegreeProgram, AcademicSession, Student } from '../../types';

interface ApplicantsPageProps {
    applicants: Applicant[];
    programs: DegreeProgram[];
    sessions: AcademicSession[];
    onAddApplicant: (a: Omit<Applicant, 'id'>) => Promise<void>;
    onAdmitStudent: (applicantId: string, s: Omit<Student, 'id'>, password: string) => Promise<void>;
    canEdit: boolean;
}

const ApplicantsPage: React.FC<ApplicantsPageProps> = (props) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

    // Form States
    const [appForm, setAppForm] = useState({ firstName: '', lastName: '', fatherName: '', email: '', phone: '', programId: '', sessionId: '' });
    const [admitForm, setAdmitForm] = useState({ rollNumber: '', section: 'A', batch: '2026', officialEmail: '', password: '123' });

    const handleAddApplicant = async () => {
        await props.onAddApplicant({ ...appForm, status: 'Applied', applyDate: new Date().toISOString() });
        setIsAddModalOpen(false);
        setAppForm({ firstName: '', lastName: '', fatherName: '', email: '', phone: '', programId: '', sessionId: '' });
    };

    const handleOpenAdmit = (app: Applicant) => {
        setSelectedApplicant(app);
        const prog = props.programs.find(p => p.id === app.programId);
        const code = prog?.code || 'REG';
        setAdmitForm({ 
            ...admitForm, 
            rollNumber: `${code}-${Date.now().toString().slice(-4)}`,
            officialEmail: `${app.firstName.toLowerCase()}.${app.lastName.toLowerCase()}@masbot.erp`
        });
        setIsAdmitModalOpen(true);
    };

    const handleConfirmAdmission = async () => {
        if (!selectedApplicant) return;
        
        const program = props.programs.find(p => p.id === selectedApplicant.programId);

        const newStudent: Omit<Student, 'id'> = {
            rollNumber: admitForm.rollNumber,
            userId: admitForm.officialEmail,
            firstName: selectedApplicant.firstName,
            lastName: selectedApplicant.lastName,
            fatherName: selectedApplicant.fatherName,
            email: admitForm.officialEmail,
            personalEmail: selectedApplicant.email,
            phone: selectedApplicant.phone,
            gender: 'Male', // Default
            dob: '2000-01-01',
            cnic: '00000-0000000-0',
            address: 'University Hostel',
            guardianName: selectedApplicant.fatherName,
            guardianPhone: selectedApplicant.phone,
            programId: selectedApplicant.programId,
            department: program?.department || 'Unassigned',
            sessionId: selectedApplicant.sessionId,
            batch: admitForm.batch,
            section: admitForm.section,
            status: 'Active',
            admissionDate: new Date().toISOString()
        };

        await props.onAdmitStudent(selectedApplicant.id, newStudent, admitForm.password);
        setIsAdmitModalOpen(false);
        setSelectedApplicant(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Admissions Registry</h2>
                    <p className="text-blue-600 font-medium">Screen and process new student applications.</p>
                </div>
                {props.canEdit && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest"
                    >
                        + New Application
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-blue-900 font-black uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="px-8 py-5">Applicant Name</th>
                            <th className="px-8 py-5">Program Choice</th>
                            <th className="px-8 py-5">Session</th>
                            <th className="px-8 py-5">Applied On</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {props.applicants.filter(a => a.status !== 'Admitted').map(app => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-8 py-5">
                                    <p className="font-black text-blue-900">{app.firstName} {app.lastName}</p>
                                    <p className="text-xs text-slate-400 font-bold">{app.email}</p>
                                </td>
                                <td className="px-8 py-5 text-blue-900 font-bold">
                                    {props.programs.find(p => p.id === app.programId)?.name || 'Unknown'}
                                </td>
                                <td className="px-8 py-5 text-slate-500 font-bold">
                                    {props.sessions.find(s => s.id === app.sessionId)?.name || '-'}
                                </td>
                                <td className="px-8 py-5 text-slate-400 font-mono text-xs">
                                    {new Date(app.applyDate).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                        app.status === 'Applied' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {props.canEdit ? (
                                        <button 
                                            onClick={() => handleOpenAdmit(app)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow hover:bg-green-700"
                                        >
                                            Admit Student
                                        </button>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                        {props.applicants.filter(a => a.status !== 'Admitted').length === 0 && <tr><td colSpan={6} className="p-20 text-center text-slate-400 italic">No pending applications found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Add Applicant Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase">Admission Application</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">First Name</label>
                                    <input value={appForm.firstName} onChange={e => setAppForm({...appForm, firstName: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Last Name</label>
                                    <input value={appForm.lastName} onChange={e => setAppForm({...appForm, lastName: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Official Email</label>
                                <input type="email" value={appForm.email} onChange={e => setAppForm({...appForm, email: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Degree Program</label>
                                    <select value={appForm.programId} onChange={e => setAppForm({...appForm, programId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option value="">Select Program</option>
                                        {props.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Academic Session</label>
                                    <select value={appForm.sessionId} onChange={e => setAppForm({...appForm, sessionId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option value="">Select Session</option>
                                        {props.sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleAddApplicant} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Submit Application</button>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admit Student Modal */}
            {isAdmitModalOpen && selectedApplicant && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10">
                        <h3 className="text-2xl font-black text-blue-900 mb-2 uppercase">Confirm Admission</h3>
                        <p className="text-sm text-slate-500 mb-8 font-medium">Assigning Roll Number to {selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                        
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <label className="text-[10px] font-black uppercase text-blue-900 block mb-2 tracking-widest">Roll Number / Student ID</label>
                                <input value={admitForm.rollNumber} onChange={e => setAdmitForm({...admitForm, rollNumber: e.target.value})} className="w-full bg-white border-2 border-blue-200 rounded-xl p-4 text-xl font-black text-blue-900 tracking-tight" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Assigned Section</label>
                                    <select value={admitForm.section} onChange={e => setAdmitForm({...admitForm, section: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        <option>A</option><option>B</option><option>C</option><option>Evening</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Batch</label>
                                    <input value={admitForm.batch} onChange={e => setAdmitForm({...admitForm, batch: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">University Login (Auto-generated)</label>
                                <input value={admitForm.officialEmail} onChange={e => setAdmitForm({...admitForm, officialEmail: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-mono text-purple-700" />
                            </div>

                            <div className="bg-slate-900 p-6 rounded-2xl text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Portal Credentials</p>
                                </div>
                                <p className="text-xs text-slate-400 mb-2">The student will use the email above and the following temporary password for first-time access.</p>
                                <input value={admitForm.password} onChange={e => setAdmitForm({...admitForm, password: e.target.value})} className="w-full bg-slate-800 border-0 rounded-xl p-3 text-sm font-mono text-green-400" />
                            </div>

                            <button onClick={handleConfirmAdmission} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-900/20">Finalize Admission</button>
                            <button onClick={() => setIsAdmitModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantsPage;
