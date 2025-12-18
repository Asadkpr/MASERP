
import React, { useMemo } from 'react';
import type { Task, Employee } from '../../types';

interface AnalyticsPageProps {
    tasks: Task[];
    employees: Employee[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ tasks, employees }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed - Pending Review' || t.status === 'Closed').length;
    
    // Status counts
    const pendingReview = tasks.filter(t => t.status === 'Completed - Pending Review').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    
    // Overdue Logic
    const overdueTasks = tasks.filter(t => {
        if (t.status === 'Closed') return false;
        return new Date(t.dueDate) < new Date();
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Aging Report (Pending Tasks)
    const agingData = useMemo(() => {
        const now = new Date();
        let less3 = 0, less7 = 0, more7 = 0;
        
        tasks.filter(t => t.status !== 'Closed').forEach(t => {
            const created = new Date(t.createdAt);
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 3) less3++;
            else if (diffDays <= 7) less7++;
            else more7++;
        });
        return { less3, less7, more7 };
    }, [tasks]);

    // Department Stats
    const deptStats = useMemo(() => {
        const map = new Map<string, number>();
        tasks.forEach(t => {
            const dept = t.assignedToDepartment || 'Unassigned';
            map.set(dept, (map.get(dept) || 0) + 1);
        });
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    }, [tasks]);

    const StatCard = ({ title, value, subtext, color }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <p className="text-xs text-slate-400 mt-2">{subtext}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900">Task Analytics & Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Pending Review" value={pendingReview} subtext="Awaiting Manager Approval" color="text-orange-600" />
                <StatCard title="Overdue Tasks" value={overdueTasks.length} subtext="Past due date" color="text-red-600" />
                <StatCard title="In Progress" value={inProgress} subtext="Currently active" color="text-blue-600" />
                <StatCard title="Completion Rate" value={`${completionRate}%`} subtext="Overall efficiency" color="text-green-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Aging Report */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Task Aging Report (Unfinished)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Less than 3 days</span>
                            <span className="font-bold text-green-600">{agingData.less3}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{width: `${(agingData.less3 / totalTasks) * 100}%`}}></div></div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">3 - 7 days</span>
                            <span className="font-bold text-yellow-600">{agingData.less7}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(agingData.less7 / totalTasks) * 100}%`}}></div></div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">More than 7 days</span>
                            <span className="font-bold text-red-600">{agingData.more7}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-red-500 h-2 rounded-full" style={{width: `${(agingData.more7 / totalTasks) * 100}%`}}></div></div>
                    </div>
                </div>

                {/* Overdue List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Critical Overdue Tasks</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-2">Task</th>
                                    <th className="px-4 py-2">Assigned To</th>
                                    <th className="px-4 py-2">Due Date</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {overdueTasks.slice(0, 5).map(t => (
                                    <tr key={t.id} className="hover:bg-red-50">
                                        <td className="px-4 py-2 font-medium text-blue-900">{t.title}</td>
                                        <td className="px-4 py-2 text-slate-600">{t.assignedToName}</td>
                                        <td className="px-4 py-2 text-red-600 font-bold">{new Date(t.dueDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-2"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{t.status}</span></td>
                                    </tr>
                                ))}
                                {overdueTasks.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-slate-400">No overdue tasks. Great job!</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Tasks by Department</h3>
                <div className="flex flex-wrap gap-4">
                    {deptStats.map(([dept, count]) => (
                        <div key={dept} className="flex-1 min-w-[150px] bg-slate-50 p-4 rounded-lg border text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase">{dept}</p>
                            <p className="text-2xl font-bold text-blue-900">{count}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
