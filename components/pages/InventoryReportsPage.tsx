
import React, { useState, useMemo } from 'react';
import type { InventoryItem, Employee } from '../../types';
import { DesktopIcon } from '../icons/DesktopIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { DepartmentsIcon } from '../icons/DepartmentsIcon';

declare const XLSX: any;

interface InventoryReportsPageProps {
    inventory: InventoryItem[];
    employees: Employee[];
}

type ReportType = 'user' | 'equipment' | 'department';

const InventoryReportsPage: React.FC<InventoryReportsPageProps> = ({ inventory, employees }) => {
    const [reportType, setReportType] = useState<ReportType>('user');

    // --- Helper: Export Logic ---
    const handleExportExcel = () => {
        let data: any[] = [];
        const timestamp = new Date().toISOString().slice(0, 10);

        if (reportType === 'user') {
            data = inventory.filter(i => i.assignedTo).map(item => {
                const emp = employees.find(e => `${e.firstName} ${e.lastName}` === item.assignedTo);
                return {
                    'Employee Name': item.assignedTo,
                    'Department': emp?.department || item.department || '-',
                    'Designation': emp?.designation || item.designation || '-',
                    'Asset Type': item.type,
                    'Brand': item.brand || '-',
                    'Model': item.model,
                    'Serial Number': item.serialNumber || '-',
                    'Issue Date': item.issueDate || '-',
                    'Status': item.status
                };
            }).sort((a, b) => a['Employee Name'].localeCompare(b['Employee Name']));
        } else if (reportType === 'equipment') {
            data = inventory.map(item => ({
                'Type': item.type,
                'Brand': item.brand || '-',
                'Model': item.model,
                'Serial Number': item.serialNumber || '-',
                'Status': item.status,
                'Assigned To': item.assignedTo || 'Unassigned',
                'Department': item.department || '-'
            })).sort((a, b) => a.Type.localeCompare(b.Type));
        } else if (reportType === 'department') {
            data = inventory.filter(i => i.department).map(item => ({
                'Department': item.department,
                'Assigned Employee': item.assignedTo || 'Unassigned',
                'Asset Type': item.type,
                'Model': item.model,
                'Serial Number': item.serialNumber || '-',
                'Status': item.status
            })).sort((a, b) => (a.Department || '').localeCompare(b.Department || ''));
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `Inventory_${reportType}_report_${timestamp}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Render Logic ---

    const renderUserReport = () => {
        // Group assets by User
        const userMap = new Map<string, { emp: Employee | undefined, assets: InventoryItem[] }>();
        
        inventory.filter(i => i.assignedTo).forEach(item => {
            if (!userMap.has(item.assignedTo)) {
                const emp = employees.find(e => `${e.firstName} ${e.lastName}` === item.assignedTo);
                userMap.set(item.assignedTo, { emp, assets: [] });
            }
            userMap.get(item.assignedTo)!.assets.push(item);
        });
        
        const sortedUsers = Array.from(userMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        return (
            <div className="space-y-8">
                {sortedUsers.map(([userName, { emp, assets }]) => (
                    <div key={userName} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden break-inside-avoid">
                        <div className="bg-slate-50 dark:bg-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 dark:text-white">{userName}</h3>
                                <p className="text-sm text-blue-600 dark:text-gray-300">
                                    {emp?.designation || assets[0].designation || 'N/A'} - <span className="font-medium text-teal-600 dark:text-teal-400">{emp?.department || assets[0].department || 'N/A'}</span>
                                </p>
                            </div>
                            <div className="text-sm font-medium bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                                {assets.length} Assets
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                            <thead className="bg-white dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Serial</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Issue Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                {assets.map(asset => (
                                    <tr key={asset.id}>
                                        <td className="px-6 py-3 text-sm text-blue-900 dark:text-white font-medium">{asset.type}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300">{asset.brand} {asset.model}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300 font-mono">{asset.serialNumber || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300">{asset.issueDate || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
                {sortedUsers.length === 0 && <p className="text-center text-blue-600">No assigned assets found.</p>}
            </div>
        );
    };

    const renderEquipmentReport = () => {
        // Group by Type
        const typeMap = new Map<string, InventoryItem[]>();
        inventory.forEach(item => {
            if (!typeMap.has(item.type)) typeMap.set(item.type, []);
            typeMap.get(item.type)!.push(item);
        });
        const sortedTypes = Array.from(typeMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

        return (
            <div className="space-y-8">
                 {sortedTypes.map(([type, items]) => (
                    <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden break-inside-avoid">
                        <div className="bg-slate-50 dark:bg-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600 flex justify-between items-center">
                             <h3 className="text-lg font-bold text-blue-900 dark:text-white">{type}</h3>
                             <div className="text-sm font-medium bg-purple-100 text-purple-900 px-3 py-1 rounded-full">
                                {items.length} Total
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                            <thead className="bg-white dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Serial</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-3 text-sm text-blue-900 dark:text-white">{item.brand} {item.model}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300 font-mono">{item.serialNumber || '-'}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === 'In Use' ? 'bg-green-100 text-green-800' : 
                                                item.status === 'In Stock' ? 'bg-blue-100 text-blue-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300">{item.assignedTo || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 ))}
            </div>
        );
    };

    const renderDepartmentReport = () => {
         // Group by Department
        const deptMap = new Map<string, InventoryItem[]>();
        inventory.forEach(item => {
            const dept = item.department || 'Unassigned';
            if (!deptMap.has(dept)) deptMap.set(dept, []);
            deptMap.get(dept)!.push(item);
        });
        // Sort keys, putting 'Unassigned' last
        const sortedDepts = Array.from(deptMap.entries()).sort((a, b) => {
            if (a[0] === 'Unassigned') return 1;
            if (b[0] === 'Unassigned') return -1;
            return a[0].localeCompare(b[0]);
        });

        return (
            <div className="space-y-8">
                {sortedDepts.map(([dept, items]) => (
                    <div key={dept} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden break-inside-avoid">
                         <div className="bg-slate-50 dark:bg-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600 flex justify-between items-center">
                             <h3 className="text-lg font-bold text-blue-900 dark:text-white">{dept}</h3>
                             <div className="text-sm font-medium bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                                {items.length} Assets
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                            <thead className="bg-white dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Assigned To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 dark:text-gray-400 uppercase">Serial</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-3 text-sm text-blue-900 dark:text-white font-medium">{item.assignedTo || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300">{item.type}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300">{item.brand} {item.model}</td>
                                        <td className="px-6 py-3 text-sm text-blue-600 dark:text-gray-300 font-mono">{item.serialNumber || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Inventory Reports</h2>
                    <p className="text-sm text-blue-600 dark:text-gray-400">Generate and export detailed inventory reports.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select 
                            value={reportType} 
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-blue-900 dark:text-white"
                        >
                            <option value="user">User-wise Report</option>
                            <option value="equipment">Equipment-wise Report</option>
                            <option value="department">Department-wise Report</option>
                        </select>
                    </div>
                    <button onClick={handlePrint} className="px-4 py-2 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg text-blue-900 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-600 text-sm font-medium transition-colors shadow-sm">
                        Print
                    </button>
                    <button onClick={handleExportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-md flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="report-content">
                 {/* Header for Print View */}
                 <div className="hidden print-block mb-6">
                    <h1 className="text-3xl font-bold text-center text-blue-900">MASBOT ERP Inventory Report</h1>
                    <p className="text-center text-lg mt-2 capitalize text-blue-800">{reportType}-wise Breakdown</p>
                    <p className="text-center text-sm text-blue-600">{new Date().toLocaleDateString()}</p>
                 </div>

                {reportType === 'user' && renderUserReport()}
                {reportType === 'equipment' && renderEquipmentReport()}
                {reportType === 'department' && renderDepartmentReport()}
            </div>
            
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-block { display: block !important; }
                    body { background-color: white; }
                    .report-content { width: 100%; }
                    /* Ensure colors print */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                .print-block { display: none; }
            `}</style>
        </div>
    );
};

export default InventoryReportsPage;
