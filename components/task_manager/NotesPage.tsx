
import React, { useState } from 'react';
import type { Note } from '../../types';

interface NotesPageProps {
    notes: Note[];
    currentUserEmail: string;
    onAddNote: (note: Omit<Note, 'id'>) => Promise<void>;
    onDeleteNote: (id: string) => Promise<void>;
}

const NotesPage: React.FC<NotesPageProps> = ({ notes, currentUserEmail, onAddNote, onDeleteNote }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState<Note['color']>('yellow');

    const myNotes = notes.filter(n => n.userId === currentUserEmail).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() && !content.trim()) return;

        const newNote: Omit<Note, 'id'> = {
            userId: currentUserEmail,
            title: title || 'Untitled Note',
            content,
            color: selectedColor,
            date: new Date().toISOString()
        };

        await onAddNote(newNote);
        setTitle('');
        setContent('');
    };

    const colors: { id: Note['color'], class: string }[] = [
        { id: 'yellow', class: 'bg-yellow-100 border-yellow-200' },
        { id: 'green', class: 'bg-green-100 border-green-200' },
        { id: 'blue', class: 'bg-blue-100 border-blue-200' },
        { id: 'purple', class: 'bg-purple-100 border-purple-200' },
        { id: 'red', class: 'bg-red-100 border-red-200' },
    ];

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">My Notes & Scratchpad</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
                {/* Create Note Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-lg text-slate-700 mb-4">Add New Note</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Title..." 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full border-b border-slate-200 pb-2 focus:border-purple-500 focus:outline-none text-slate-800 font-medium"
                        />
                        <textarea 
                            placeholder="Write something..." 
                            rows={6}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full resize-none focus:outline-none text-sm text-slate-600"
                        ></textarea>
                        
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setSelectedColor(c.id)}
                                        className={`w-6 h-6 rounded-full border transition-transform ${c.class.split(' ')[0]} ${selectedColor === c.id ? 'scale-125 ring-2 ring-slate-300' : ''}`}
                                    />
                                ))}
                            </div>
                            <button type="submit" className="bg-purple-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors">
                                Save Note
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notes Grid */}
                <div className="lg:col-span-2 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {myNotes.length === 0 ? (
                            <div className="col-span-2 text-center py-10 text-slate-400">
                                No notes yet. Create one to get started!
                            </div>
                        ) : (
                            myNotes.map(note => {
                                const colorClass = colors.find(c => c.id === note.color)?.class || 'bg-white border-slate-200';
                                return (
                                    <div key={note.id} className={`p-5 rounded-xl border shadow-sm relative group transition-transform hover:-translate-y-1 ${colorClass}`}>
                                        <button 
                                            onClick={() => onDeleteNote(note.id)}
                                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <h4 className="font-bold text-slate-800 mb-2">{note.title}</h4>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-slate-500 mt-4 text-right">{new Date(note.date).toLocaleDateString()}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
