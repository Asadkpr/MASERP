
import React, { useState } from 'react';
import type { Classroom, TimetableEntry, OfferedCourse, CourseCatalog, Employee } from '../../types';

interface TimetableManagementPageProps {
    classrooms: Classroom[];
    timetable: TimetableEntry[];
    offeredCourses: OfferedCourse[];
    courses: CourseCatalog[];
    employees: Employee[];
    onAddClassroom: (c: Omit<Classroom, 'id'>) => Promise<void>;
    onAddTimetableEntry: (e: Omit<TimetableEntry, 'id'>) => Promise<void>;
}

const TimetableManagementPage: React.FC<TimetableManagementPageProps> = (props) => {
    const [view, setView] = useState<'timetable' | 'classrooms'>('timetable');
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

    // Form States
    const [slotForm, setSlotForm] = useState<Omit<TimetableEntry, 'id'>>({
        offeredCourseId: '', classroomId: '', day: 'Monday', startTime: '09:00', endTime: '12:00'
    });
    const [roomForm, setRoomForm] = useState<Omit<Classroom, 'id'>>({
        roomNumber: '', building: 'Main Campus', capacity: 50
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleAddSlot = async () => {
        await props.onAddTimetableEntry(slotForm);
        setIsSlotModalOpen(false);
    };

    const handleAddRoom = async () => {
        await props.onAddClassroom(roomForm);
        setIsRoomModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-blue-900 tracking-tight">Timetable Control</h2>
                    <p className="text-blue-600 font-medium">Manage weekly schedules and room allocations.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('classrooms')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            view === 'classrooms' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 border border-slate-200'
                        }`}
                    >
                        Rooms
                    </button>
                    <button 
                        onClick={() => setView('timetable')}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            view === 'timetable' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900 border border-slate-200'
                        }`}
                    >
                        Weekly View
                    </button>
                </div>
            </div>

            {view === 'timetable' ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setIsSlotModalOpen(true)}
                            className="bg-purple-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-purple-800"
                        >
                            + Schedule Class
                        </button>
                    </div>
                    
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1200px]">
                                <div className="grid grid-cols-7 bg-slate-50 border-b">
                                    <div className="px-6 py-4 border-r font-black text-blue-900 text-xs uppercase bg-white sticky left-0 z-10">Time / Day</div>
                                    {days.map(d => (
                                        <div key={d} className="px-6 py-4 font-black text-blue-900 text-xs uppercase text-center border-r">{d}</div>
                                    ))}
                                </div>

                                <div className="divide-y">
                                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => (
                                        <div key={hour} className="grid grid-cols-7 h-32">
                                            <div className="px-6 py-4 border-r font-bold text-slate-400 text-xs bg-white sticky left-0 z-10 flex items-start justify-center">
                                                {hour}
                                            </div>
                                            {days.map(day => {
                                                const slots = props.timetable.filter(t => t.day === day && t.startTime <= hour && t.endTime > hour);
                                                return (
                                                    <div key={`${day}-${hour}`} className="border-r p-1 bg-slate-50/20 relative group">
                                                        {slots.map(slot => {
                                                            const offer = props.offeredCourses.find(o => o.id === slot.offeredCourseId);
                                                            const catalog = props.courses.find(c => c.id === offer?.courseId);
                                                            const room = props.classrooms.find(r => r.id === slot.classroomId);
                                                            return (
                                                                <div key={slot.id} className="absolute inset-1 bg-white border border-purple-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-purple-600 transition-all z-10">
                                                                    <p className="text-[9px] font-black text-purple-600 uppercase mb-1">{catalog?.code}</p>
                                                                    <p className="text-[10px] font-bold text-blue-900 leading-tight mb-2 truncate">{catalog?.name}</p>
                                                                    <div className="flex justify-between items-end mt-auto">
                                                                        <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded uppercase">Room {room?.roomNumber}</span>
                                                                        <span className="text-[9px] font-black text-blue-900">Sec {offer?.section}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div 
                        onClick={() => setIsRoomModalOpen(true)}
                        className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all text-center"
                    >
                        <span className="text-4xl mb-2 text-blue-300">+</span>
                        <p className="font-black text-blue-900 uppercase tracking-widest text-[10px]">Add New Classroom</p>
                    </div>
                    {props.classrooms.map(room => (
                        <div key={room.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-purple-600 transition-all">
                            <div>
                                <h3 className="text-2xl font-black text-blue-900 mb-1">{room.roomNumber}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.building}</p>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-black uppercase">Capacity: {room.capacity}</span>
                                <button className="text-[9px] font-black text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Room Modal */}
            {isRoomModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">New Classroom</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Room Number / ID</label>
                                <input value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" placeholder="e.g. CR-101" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Building</label>
                                <input value={roomForm.building} onChange={e => setRoomForm({...roomForm, building: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Max Capacity</label>
                                <input type="number" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                            </div>
                            <button onClick={handleAddRoom} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Register Room</button>
                            <button onClick={() => setIsRoomModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timetable Slot Modal */}
            {isSlotModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-blue-900 mb-8 uppercase tracking-tight">Schedule Class Slot</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Select Course Section</label>
                                <select value={slotForm.offeredCourseId} onChange={e => setSlotForm({...slotForm, offeredCourseId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                    <option value="">-- Choose Course --</option>
                                    {props.offeredCourses.map(o => {
                                        const cat = props.courses.find(c => c.id === o.courseId);
                                        return <option key={o.id} value={o.id}>{cat?.code} - Sec {o.section} ({o.instructorId})</option>
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Assigned Room</label>
                                <select value={slotForm.classroomId} onChange={e => setSlotForm({...slotForm, classroomId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                    <option value="">-- Choose Room --</option>
                                    {props.classrooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} ({r.building})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Day</label>
                                    <select value={slotForm.day} onChange={e => setSlotForm({...slotForm, day: e.target.value as any})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold">
                                        {days.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Start</label>
                                    <input type="time" value={slotForm.startTime} onChange={e => setSlotForm({...slotForm, startTime: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">End</label>
                                    <input type="time" value={slotForm.endTime} onChange={e => setSlotForm({...slotForm, endTime: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold" />
                                </div>
                            </div>
                            <button onClick={handleAddSlot} className="w-full bg-purple-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Update Timetable</button>
                            <button onClick={() => setIsSlotModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableManagementPage;
