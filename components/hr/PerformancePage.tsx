
import React, { useMemo } from 'react';
import type { Employee, AttendanceRecord } from '../../types';

interface PerformancePageProps {
    employees: Employee[];
    attendanceRecords: AttendanceRecord[];
}

const PerformancePage: React.FC<PerformancePageProps> = ({ employees, attendanceRecords }) => {
    // 1. Gender Distribution Logic
    const genderStats = useMemo(() => {
        const male = employees.filter(e => e.gender === 'Male').length;
        const female = employees.filter(e => e.gender === 'Female').length;
        const total = employees.length || 1;
        return {
            male,
            female,
            malePct: Math.round((male / total) * 100),
            femalePct: Math.round((female / total) * 100)
        };
    }, [employees]);

    // 2. Departmental Performance (Mock Data for demo purposes)
    const deptPerformance = useMemo(() => {
        const depts = Array.from(new Set(employees.map(e => e.department)));
        return depts.map(dept => ({
            name: dept,
            score: Math.floor(Math.random() * (95 - 75 + 1)) + 75, // Random 75-95
            employees: employees.filter(e => e.department === dept).length
        })).sort((a, b) => b.score - a.score);
    }, [employees]);

    // 3. Overall Employee Rating Distribution (Mock)
    const ratingDistribution = [
        { label: 'A (Exceptional)', count: Math.round(employees.length * 0.15), color: 'bg-green-500' },
        { label: 'B (Strong)', count: Math.round(employees.length * 0.45), color: 'bg-blue-500' },
        { label: 'C (Average)', count: Math.round(employees.length * 0.30), color: 'bg-yellow-500' },
        { label: 'D (Improvement)', count: Math.round(employees.length * 0.10), color: 'bg-red-500' },
    ];

    const StatCard = ({ title, value, subtext, trend, trendColor }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-900">{value}</span>
                {trend && <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>}
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1">{subtext}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-blue-900 tracking-tight">Organization Performance</h1>
                    <p className="text-blue-600 font-medium">Analytics & Strategic Talent Insights Overview</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-blue-900 rounded-xl text-sm font-bold hover:bg-slate-50">Annual Review</button>
                    <button className="px-4 py-2 bg-purple-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-purple-800">Export Insights</button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Attrition Rate" value="4.2%" subtext="Last 12 Months" trend="-1.5%" trendColor="text-green-500" />
                <StatCard title="Hiring Velocity" value="18" subtext="Avg. Days to Hire" trend="+2 days" trendColor="text-red-500" />
                <StatCard title="Growth Rate" value="+12%" subtext="Employee Count Increase" trend="+3%" trendColor="text-green-500" />
                <StatCard title="Org. Health Index" value="88/100" subtext="Based on 5 Metrics" trend="Stable" trendColor="text-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Organizational Performance bell curve style distribution */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs">Performance Rating Distribution</h3>
                        <div className="flex gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase">FY 2025-26 Cycle</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-64 gap-4 px-4">
                        {ratingDistribution.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full flex flex-col items-center">
                                    <div 
                                        className={`w-full max-w-[80px] ${item.color} rounded-t-2xl transition-all duration-1000 ease-out group-hover:brightness-110`}
                                        style={{ height: `${(item.count / employees.length) * 200}px` }}
                                    >
                                        <div className="absolute -top-8 w-full text-center font-black text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.count}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-[10px] font-black text-blue-900 leading-tight">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{Math.round((item.count / employees.length) * 100)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Diversity Matrix */}
                <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white">
                    <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 mb-8">Gender Diversity Matrix</h3>
                    
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative h-48 w-48 mb-8">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <circle className="text-pink-500" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <circle 
                                    className="text-blue-500" 
                                    strokeDasharray={`${genderStats.malePct}, 100`} 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    stroke="currentColor" 
                                    fill="none" 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-3xl font-black">{employees.length}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Employees</p>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-sm font-bold">Male</span>
                                </div>
                                <span className="text-sm font-black text-blue-400">{genderStats.malePct}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                                    <span className="text-sm font-bold">Female</span>
                                </div>
                                <span className="text-sm font-black text-pink-400">{genderStats.femalePct}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-blue-900 uppercase tracking-widest text-xs">Departmental Performance Scores</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deptPerformance.map((dept, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-purple-200 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-blue-900 group-hover:bg-purple-900 group-hover:text-white transition-colors">
                                    {dept.name.charAt(0)}
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-900">{dept.score}%</span>
                                </div>
                            </div>
                            <h4 className="font-black text-sm text-blue-900 mb-1">{dept.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{dept.employees} Talent Units</p>
                            
                            <div className="mt-4 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${dept.score}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Insight Area */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="max-w-xl">
                    <h3 className="text-xl font-black mb-2">Strategic HR Insight</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                        Overall organizational performance is up by <span className="font-black text-white">7.4%</span> compared to last quarter. The Engineering department leads with the highest efficiency scores, while Marketing shows the highest internal mobility. Training completion rates across the organization have reached an all-time high of <span className="font-black text-white">92%</span>.
                    </p>
                </div>
                <button className="whitespace-nowrap px-8 py-3 bg-white text-blue-900 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform active:scale-95">
                    Generate CEO Report
                </button>
            </div>
        </div>
    );
};

export default PerformancePage;
