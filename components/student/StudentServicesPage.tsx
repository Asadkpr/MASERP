
import React, { useState, useMemo } from 'react';
import type { StudentRequest, Student } from '../../types';

interface StudentServicesPageProps {
    requests: StudentRequest[];
    students: Student[];
    onAction: (id: string, action: 'In Review' | 'Approved' | 'Rejected', remarks?: string) => Promise<void>;
}

const StudentServicesPage: React.FC<StudentServicesPageProps> = (props) => {
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedRequest = useMemo(() => {
        return props.requests.find(r => r.id === selectedRequestId);
    }, [selectedRequestId, props.requests]);

    const studentForSelected = useMemo(() => {
        return props.students.find(s => s.id === selectedRequest?.studentId);
    }, [selectedRequest, props.students]);

    const handleAction = async (action: 'In Review' | 'Approved' | 'Rejected') => {
        if (!selectedRequestId) return;
        setIsProcessing(true);
        await props.onAction(selectedRequestId, action, remarks);
        setIsProcessing(false);
        setRemarks('');
        setSelectedRequestId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Student Service Desk</h2>
                    <p className="text-blue-600 font-medium">Process academic requests and administrative services.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em]">
                        <tr>
                            <th className="px-6 py-5">Date</th>
                            <th className="px-6 py-5">Student</th>
                            <th className="px-6 py-5">Request Type</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right">Verification</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {props.requests.map(req => {
                            const student = props.students.find(s => s.id === req.studentId);
                            return (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-5 text-slate-400 font-mono text-xs">{new Date(req.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-blue-900">{student?.firstName} {student?.lastName}</p>
                                        <p className="text-[10px] text-purple-600 font-bold">{student?.rollNumber}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-bold text-slate-600">{req.type}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button 
                                            onClick={() => setSelectedRequestId(req.id)}
                                            className="text-[10px] font-black text-blue-900 uppercase bg-slate-100 px-4 py-2 rounded-lg hover:bg-blue-900 hover:text-white transition-all"
                                        >
                                            Audit Request
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {props.requests.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic">No formal student requests currently logged.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Request Processing Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-10 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Process Request</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ref ID: {selectedRequest.id.slice(-6)}</p>
                            </div>
                            <button onClick={() => setSelectedRequestId(null)} className="text-slate-400 hover:text-red-500">&times;</button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black">
                                        {studentForSelected?.firstName[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-blue-900 leading-none">{studentForSelected?.firstName} {studentForSelected?.lastName}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{studentForSelected?.department} • {studentForSelected?.rollNumber}</p>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 pt-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Subject</p>
                                    <p className="text-sm font-black text-blue-900 mb-3">{selectedRequest.type}</p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Description</p>
                                    <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 italic">"{selectedRequest.description}"</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Final Remarks</label>
                                <textarea 
                                    value={remarks} 
                                    onChange={e => setRemarks(e.target.value)}
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold"
                                    rows={3}
                                    placeholder="Enter internal notes or feedback for student..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    disabled={isProcessing}
                                    onClick={() => handleAction('Approved')}
                                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-green-700 disabled:opacity-50"
                                >
                                    Approve Request
                                </button>
                                <button 
                                    disabled={isProcessing}
                                    onClick={() => handleAction('Rejected')}
                                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-red-700 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                            <button 
                                onClick={() => handleAction('In Review')}
                                className="w-full text-blue-900 font-black text-[10px] uppercase py-2 tracking-widest"
                            >
                                Mark as In Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentServicesPage;
