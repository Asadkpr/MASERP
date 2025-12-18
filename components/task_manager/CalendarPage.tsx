
import React, { useState, useMemo } from 'react';
import type { Task } from '../../types';

interface CalendarPageProps {
    tasks: Task[];
    currentUserEmail: string;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ tasks, currentUserEmail }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const monthTasks = useMemo(() => {
        return tasks.filter(t => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    }, [tasks, month, year]);

    const renderCells = () => {
        const rows = [];
        let daysArray = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < startDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 border border-slate-100"></div>);
        }

        // Days
        for (let d = 1; d <= days; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const daysTasks = monthTasks.filter(t => t.dueDate === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            daysArray.push(
                <div key={d} className={`h-32 bg-white border border-slate-200 p-2 overflow-y-auto ${isToday ? 'bg-purple-50' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-semibold ${isToday ? 'text-purple-700' : 'text-slate-700'}`}>{d}</span>
                        {daysTasks.length > 0 && <span className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded-full">{daysTasks.length}</span>}
                    </div>
                    <div className="space-y-1">
                        {daysTasks.map(task => (
                            <div key={task.id} className={`text-[10px] p-1 rounded truncate border-l-2 ${
                                (task.status === 'Closed' || task.status === 'Completed - Pending Review') ? 'bg-green-50 border-green-500 text-green-700' :
                                task.status === 'In Progress' ? 'bg-blue-50 border-blue-500 text-blue-700' :
                                'bg-yellow-50 border-yellow-500 text-yellow-700'
                            }`} title={task.title}>
                                {task.title}
                            </div>
                        ))}
                    </div>
                </div>
            );

            if ((d + startDay) % 7 === 0 || d === days) {
                // Fill remaining cells if last row
                if (d === days && (d + startDay) % 7 !== 0) {
                    const remaining = 7 - ((d + startDay) % 7);
                    for (let x = 0; x < remaining; x++) {
                        daysArray.push(<div key={`empty-end-${x}`} className="h-32 bg-slate-50 border border-slate-100"></div>);
                    }
                }
                rows.push(<div key={`row-${d}`} className="grid grid-cols-7">{daysArray}</div>);
                daysArray = [];
            }
        }
        return rows;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Task Calendar</h2>
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded text-blue-900">&lt;</button>
                    <span className="font-bold text-lg text-blue-900 w-32 text-center">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded text-blue-900">&gt;</button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="grid grid-cols-7 bg-purple-900 text-white text-center py-2 text-sm font-semibold">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {renderCells()}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
