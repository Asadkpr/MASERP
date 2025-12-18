
import React, { useState, useMemo } from 'react';
import { HomeIcon } from '../icons/HomeIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import type { Task, Employee, ChatMessage, Note, TaskStatus, TaskPriority, TaskCategory } from '../../types';
import TaskManagerSidebar from './TaskManagerSidebar';
import ChatPage from './ChatPage';
import CalendarPage from './CalendarPage';
import AnalyticsPage from './AnalyticsPage';
import NotesPage from './NotesPage';

interface TaskManagerPageProps {
    onBack: () => void;
    onLogout: () => void;
    tasks: Task[];
    employees: Employee[];
    currentUserEmail: string;
    onCreateTask: (task: Omit<Task, 'id'>) => Promise<void>;
    onTaskWorkflowAction: (taskId: string, newStatus: TaskStatus, action: string, remarks?: string) => Promise<void>;
    onDeleteTask: (taskId: string) => Promise<void>;
    messages: ChatMessage[];
    onSendMessage: (msg: Omit<ChatMessage, 'id'>) => Promise<void>;
    notes: Note[];
    onAddNote: (note: Omit<Note, 'id'>) => Promise<void>;
    onDeleteNote: (id: string) => Promise<void>;
}

const TaskBoardView: React.FC<{
    tasks: Task[], 
    employees: Employee[], 
    currentUserEmail: string, 
    onCreateTask: (task: Omit<Task, 'id'>) => Promise<void>,
    onTaskWorkflowAction: (taskId: string, newStatus: TaskStatus, action: string, remarks?: string) => Promise<void>,
    onDeleteTask: (taskId: string) => Promise<void>
}> = ({ tasks, employees, currentUserEmail, onCreateTask, onTaskWorkflowAction, onDeleteTask }) => {
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [actionRemarks, setActionRemarks] = useState('');
    
    // Form State for Creation
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
    const [taskCategory, setTaskCategory] = useState<TaskCategory>('Operations');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [taskAssignedTo, setTaskAssignedTo] = useState('');

    const currentEmployee = employees.find(e => e.email === currentUserEmail);
    const isAdmin = currentUserEmail === 'admin';
    const isManager = isAdmin || currentEmployee?.role === 'HOD' || currentEmployee?.role === 'HR';

    // Filters
    const [filterMode, setFilterMode] = useState<'my' | 'team'>('my');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let assignedToId = taskAssignedTo;
        let assignedToName = '';
        let assignedToDept = '';

        if (isManager) {
            if (!assignedToId) {
                alert("Please select an employee to assign the task to.");
                return;
            }
            const emp = employees.find(e => e.id === assignedToId);
            assignedToName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
            assignedToDept = emp?.department || '';
        } else {
            // Auto assign to self if basic user
            assignedToId = currentEmployee?.id || currentUserEmail;
            assignedToName = currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName}` : currentUserEmail;
            assignedToDept = currentEmployee?.department || '';
        }

        const newTask: Omit<Task, 'id'> = {
            title: taskTitle,
            description: taskDescription,
            category: taskCategory,
            priority: taskPriority,
            startDate: taskStartDate,
            dueDate: taskDueDate,
            assignedTo: assignedToId,
            assignedToName: assignedToName,
            assignedToDepartment: assignedToDept,
            createdBy: currentUserEmail,
            status: isManager && assignedToId !== (currentEmployee?.id) ? 'Assigned' : 'New', // Auto assign if manager creates for others
            createdAt: new Date().toISOString(),
            history: [] // Initial history handled in App.tsx
        };

        await onCreateTask(newTask);
        setIsCreateModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('Medium');
        setTaskCategory('Operations');
        setTaskDueDate('');
        setTaskAssignedTo('');
    };

    const filteredTasks = useMemo(() => {
        let list = tasks;
        const myId = currentEmployee?.id || currentUserEmail;

        if (filterMode === 'my') {
            list = tasks.filter(t => t.assignedTo === myId);
        } else if (!isAdmin) {
            // Team view for Manager: See tasks they created or tasks in their dept
            list = tasks.filter(t => t.createdBy === currentUserEmail || t.assignedToDepartment === currentEmployee?.department);
        }
        return list;
    }, [tasks, filterMode, currentEmployee, currentUserEmail, isAdmin]);

    // Grouping for Kanban
    const columns = {
        todo: filteredTasks.filter(t => ['New', 'Assigned', 'Reopened'].includes(t.status)),
        inProgress: filteredTasks.filter(t => t.status === 'In Progress'),
        review: filteredTasks.filter(t => t.status === 'Completed - Pending Review'),
        closed: filteredTasks.filter(t => t.status === 'Closed'),
    };

    const PriorityBadge = ({ priority }: { priority: string }) => {
        const colors = {
            'Low': 'bg-gray-100 text-gray-800',
            'Medium': 'bg-blue-100 text-blue-800',
            'High': 'bg-orange-100 text-orange-800',
            'Critical': 'bg-red-100 text-red-800'
        };
        return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${(colors as any)[priority]}`}>{priority}</span>;
    };

    const TaskCard = ({ task }: { task: Task }) => {
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Closed';
        return (
            <div 
                onClick={() => setSelectedTask(task)}
                className={`bg-white p-3 rounded-lg shadow-sm border mb-3 cursor-pointer hover:shadow-md transition-all ${isOverdue ? 'border-red-300 border-l-4' : 'border-slate-200'}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-[10px] text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-blue-900 text-sm mb-1 leading-tight">{task.title}</h4>
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                
                <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                            {task.assignedToName.charAt(0)}
                        </div>
                        <span className="text-[10px] text-slate-600 truncate max-w-[80px]">{task.assignedToName}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${task.status === 'Reopened' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {task.status}
                    </span>
                </div>
            </div>
        );
    };

    // Modal Action Handler
    const handleWorkflowAction = async (action: string) => {
        if (!selectedTask) return;
        
        let newStatus: TaskStatus = selectedTask.status;
        let reqRemarks = false;

        switch (action) {
            case 'Accept':
                newStatus = 'In Progress';
                break;
            case 'Complete':
                newStatus = 'Completed - Pending Review';
                reqRemarks = true;
                break;
            case 'Approve':
                newStatus = 'Closed';
                break;
            case 'Reject':
                newStatus = 'Reopened';
                reqRemarks = true;
                break;
        }

        if (reqRemarks && !actionRemarks.trim()) {
            alert(`Please enter remarks to ${action} this task.`);
            return;
        }

        await onTaskWorkflowAction(selectedTask.id, newStatus, action, actionRemarks);
        setSelectedTask(null);
        setActionRemarks('');
    };

    const TaskDetailModal = () => {
        if (!selectedTask) return null;
        
        const isMyTask = selectedTask.assignedTo === (currentEmployee?.id || currentUserEmail);
        const isCreator = selectedTask.createdBy === currentUserEmail;
        const canManage = isAdmin || isManager || isCreator;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setSelectedTask(null)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded uppercase font-bold">{selectedTask.category}</span>
                                <PriorityBadge priority={selectedTask.priority} />
                            </div>
                            <h2 className="text-xl font-bold text-blue-900">{selectedTask.title}</h2>
                        </div>
                        <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs">Assigned To</p>
                                <p className="font-medium text-blue-900">{selectedTask.assignedToName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Assigned By</p>
                                <p className="font-medium text-blue-900">{selectedTask.createdBy}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Due Date</p>
                                <p className={`font-medium ${new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'Closed' ? 'text-red-600' : 'text-blue-900'}`}>
                                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Status</p>
                                <p className="font-medium text-blue-900">{selectedTask.status}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-blue-900 mb-2">Description</h3>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded">{selectedTask.description}</p>
                        </div>

                        {/* Workflow Actions */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                            <h3 className="text-sm font-bold text-blue-900 mb-3">Actions</h3>
                            
                            <div className="flex flex-col gap-3">
                                {['New', 'Assigned', 'Reopened'].includes(selectedTask.status) && isMyTask && (
                                    <button onClick={() => handleWorkflowAction('Accept')} className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">Accept Task & Start</button>
                                )}

                                {selectedTask.status === 'In Progress' && isMyTask && (
                                    <>
                                        <textarea 
                                            className="w-full text-sm border rounded p-2 mb-2" 
                                            placeholder="Completion remarks / output summary..."
                                            value={actionRemarks}
                                            onChange={e => setActionRemarks(e.target.value)}
                                        />
                                        <button onClick={() => handleWorkflowAction('Complete')} className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">Mark as Completed</button>
                                    </>
                                )}

                                {selectedTask.status === 'Completed - Pending Review' && canManage && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-blue-900"><strong>User Remarks:</strong> {selectedTask.completionRemarks}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleWorkflowAction('Approve')} className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">Approve & Close</button>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <button onClick={() => handleWorkflowAction('Reject')} className="bg-red-500 text-white py-2 rounded font-medium hover:bg-red-600">Reject</button>
                                            </div>
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full text-sm border rounded p-2" 
                                            placeholder="Rejection reason (Required for Reject)..."
                                            value={actionRemarks}
                                            onChange={e => setActionRemarks(e.target.value)}
                                        />
                                    </div>
                                )}

                                {selectedTask.status === 'Closed' && (
                                    <p className="text-center text-sm text-green-600 font-medium py-2">Task Closed Successfully</p>
                                )}
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div>
                            <h3 className="text-sm font-bold text-blue-900 mb-3">Activity History</h3>
                            <div className="space-y-4 border-l-2 border-slate-200 ml-2 pl-4">
                                {selectedTask.history?.slice().reverse().map((log, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-white"></div>
                                        <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                                        <p className="text-sm font-medium text-blue-900">{log.action} <span className="font-normal text-slate-600">by {log.by}</span></p>
                                        {log.details && <p className="text-xs text-slate-600 mt-1 italic">{log.details}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    {canManage && (
                        <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                            <span className="text-xs text-slate-400">ID: {selectedTask.id}</span>
                            <button 
                                onClick={() => { 
                                    if(window.confirm("Permanently delete this task?")) { 
                                        onDeleteTask(selectedTask.id); 
                                        setSelectedTask(null); 
                                    } 
                                }} 
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                            >
                                Delete Task
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex bg-white rounded-lg p-1 shadow-sm">
                    <button onClick={() => setFilterMode('my')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterMode === 'my' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:bg-slate-50'}`}>My Tasks</button>
                    {isManager && <button onClick={() => setFilterMode('team')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filterMode === 'team' ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:bg-slate-50'}`}>Team Tasks</button>}
                </div>
                
                {isManager && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2">
                        <span>+ New Task</span>
                    </button>
                )}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-hidden">
                {/* To Do Column */}
                <div className="bg-slate-100 rounded-lg p-3 flex flex-col h-full max-h-full">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">To Do</h3>
                        <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{columns.todo.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {columns.todo.map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-blue-50 rounded-lg p-3 flex flex-col h-full max-h-full border border-blue-100">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wide">In Progress</h3>
                        <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">{columns.inProgress.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {columns.inProgress.map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                </div>

                {/* Review Column */}
                <div className="bg-orange-50 rounded-lg p-3 flex flex-col h-full max-h-full border border-orange-100">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wide">Review</h3>
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{columns.review.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {columns.review.map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                </div>

                {/* Closed Column */}
                <div className="bg-green-50 rounded-lg p-3 flex flex-col h-full max-h-full border border-green-100">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-green-800 text-sm uppercase tracking-wide">Closed</h3>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">{columns.closed.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                        {columns.closed.map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Create New Task</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title</label>
                                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required className="w-full border rounded p-2 text-sm" placeholder="e.g. Server Maintenance" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={3} className="w-full border rounded p-2 text-sm"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Category</label>
                                    <select value={taskCategory} onChange={e => setTaskCategory(e.target.value as any)} className="w-full border rounded p-2 text-sm">
                                        <option>Operations</option><option>IT Support</option><option>ERP</option><option>Finance</option><option>HR</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Priority</label>
                                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)} className="w-full border rounded p-2 text-sm">
                                        <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Start Date</label>
                                    <input type="date" value={taskStartDate} onChange={e => setTaskStartDate(e.target.value)} className="w-full border rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Due Date</label>
                                    <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full border rounded p-2 text-sm" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Assign To</label>
                                <select value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)} className="w-full border rounded p-2 text-sm" required>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-900 text-white rounded hover:bg-purple-800">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            <TaskDetailModal />
        </div>
    );
};

const TaskManagerPage: React.FC<TaskManagerPageProps> = (props) => {
    const [activePage, setActivePage] = useState('task_dashboard');

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <TaskManagerSidebar 
                activePage={activePage} 
                setActivePage={setActivePage} 
                currentUserEmail={props.currentUserEmail}
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-purple-900 border-b border-purple-800 h-16 flex-shrink-0 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={props.onBack} className="flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-white">
                            <HomeIcon className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                        <div className="h-6 w-px bg-purple-700 mx-2"></div>
                        <h1 className="text-lg font-bold text-white">Task Manager</h1>
                    </div>
                    <button onClick={props.onLogout} className="flex items-center gap-2 bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        <LogoutIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6">
                    {activePage === 'task_dashboard' && (
                        <TaskBoardView 
                            tasks={props.tasks}
                            employees={props.employees}
                            currentUserEmail={props.currentUserEmail}
                            onCreateTask={props.onCreateTask}
                            onTaskWorkflowAction={props.onTaskWorkflowAction}
                            onDeleteTask={props.onDeleteTask}
                        />
                    )}
                    {activePage === 'task_calendar' && (
                        <CalendarPage 
                            tasks={props.tasks}
                            currentUserEmail={props.currentUserEmail}
                        />
                    )}
                    {activePage === 'task_chat' && (
                        <div className="h-full">
                            <ChatPage 
                                messages={props.messages} 
                                employees={props.employees}
                                currentUserEmail={props.currentUserEmail}
                                onSendMessage={props.onSendMessage}
                            />
                        </div>
                    )}
                    {activePage === 'task_analytics' && (
                        <AnalyticsPage 
                            tasks={props.tasks}
                            employees={props.employees}
                        />
                    )}
                    {activePage === 'task_notes' && (
                        <NotesPage 
                            notes={props.notes}
                            currentUserEmail={props.currentUserEmail}
                            onAddNote={props.onAddNote}
                            onDeleteNote={props.onDeleteNote}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default TaskManagerPage;
