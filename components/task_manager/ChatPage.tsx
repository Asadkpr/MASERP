
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, Employee } from '../../types';

interface ChatPageProps {
    messages: ChatMessage[];
    employees: Employee[];
    currentUserEmail: string;
    onSendMessage: (msg: Omit<ChatMessage, 'id'>) => Promise<void>;
}

const ChatPage: React.FC<ChatPageProps> = ({ messages, employees, currentUserEmail, onSendMessage }) => {
    // Selected conversation ID: 'public' or employee email
    const [selectedChatId, setSelectedChatId] = useState<string>('public');
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedChatId]);

    // Filter messages based on selection
    const filteredMessages = messages.filter(msg => {
        if (selectedChatId === 'public') {
            return msg.isPublic;
        } else {
            // Private chat: either I sent it to them, or they sent it to me
            // AND it's not public
            return !msg.isPublic && (
                (msg.senderEmail === currentUserEmail && msg.receiverEmail === selectedChatId) ||
                (msg.senderEmail === selectedChatId && msg.receiverEmail === currentUserEmail)
            );
        }
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const currentEmp = employees.find(e => e.email === currentUserEmail);
        const senderName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : currentUserEmail;

        const msgData: Omit<ChatMessage, 'id'> = {
            senderEmail: currentUserEmail,
            senderName: senderName,
            message: newMessage,
            timestamp: new Date().toISOString(),
            isPublic: selectedChatId === 'public',
            receiverEmail: selectedChatId === 'public' ? undefined : selectedChatId
        };

        await onSendMessage(msgData);
        setNewMessage('');
    };

    // Get Other Employees for Sidebar list (exclude self)
    const chatUsers = employees.filter(e => e.email !== currentUserEmail);

    return (
        <div className="flex h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 font-bold text-blue-900 border-b border-slate-200">
                    Conversations
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Public Channel */}
                    <button
                        onClick={() => setSelectedChatId('public')}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 transition-colors ${selectedChatId === 'public' ? 'bg-purple-100 border-r-4 border-purple-900' : ''}`}
                    >
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            #
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">General Public Chat</p>
                            <p className="text-xs text-slate-500">Everyone</p>
                        </div>
                    </button>

                    <div className="mt-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Direct Messages
                    </div>
                    
                    {chatUsers.map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => setSelectedChatId(emp.email)}
                            className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-slate-100 transition-colors ${selectedChatId === emp.email ? 'bg-purple-100 border-r-4 border-purple-900' : ''}`}
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                {emp.firstName.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-blue-900 truncate">{emp.firstName} {emp.lastName}</p>
                                <p className="text-xs text-slate-500 truncate">{emp.designation}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center px-6 bg-white">
                    <h3 className="font-bold text-blue-900">
                        {selectedChatId === 'public' ? 'General Public Chat' : (() => {
                            const u = employees.find(e => e.email === selectedChatId);
                            return u ? `${u.firstName} ${u.lastName}` : selectedChatId;
                        })()}
                    </h3>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {filteredMessages.length === 0 ? (
                        <div className="text-center text-slate-400 mt-10">No messages yet. Start the conversation!</div>
                    ) : (
                        filteredMessages.map(msg => {
                            const isMe = msg.senderEmail === currentUserEmail;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>
                                        {!isMe && <p className="text-xs font-bold mb-1 text-purple-900">{msg.senderName}</p>}
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-blue-900"
                        />
                        <button 
                            type="submit"
                            className="bg-purple-900 text-white rounded-full p-2 hover:bg-purple-800 transition-colors flex items-center justify-center w-10 h-10 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
