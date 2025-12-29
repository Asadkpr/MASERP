
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, Employee } from '../../types';

interface ChatPageProps {
    messages: ChatMessage[];
    employees: Employee[];
    currentUserEmail: string;
    onSendMessage: (msg: Omit<ChatMessage, 'id'>) => Promise<void>;
}

const ChatPage: React.FC<ChatPageProps> = ({ messages, employees, currentUserEmail, onSendMessage }) => {
    const [selectedChatId, setSelectedChatId] = useState<string>('public');
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
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
            // Ensure we check for true explicitly or truthy value
            return msg.isPublic === true;
        } else {
            // Private chat logic
            return !msg.isPublic && (
                (msg.senderEmail === currentUserEmail && msg.receiverEmail === selectedChatId) ||
                (msg.senderEmail === selectedChatId && msg.receiverEmail === currentUserEmail)
            );
        }
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMsg = newMessage.trim();
        if (!trimmedMsg || isSending) return;

        setIsSending(true);
        try {
            const currentEmp = employees.find(e => e.email === currentUserEmail);
            const senderName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : (currentUserEmail === 'admin' ? 'Administrator' : currentUserEmail);

            const msgData: any = {
                senderEmail: currentUserEmail,
                senderName: senderName,
                message: trimmedMsg,
                timestamp: new Date().toISOString(),
                isPublic: selectedChatId === 'public'
            };

            // Firestore does not allow 'undefined' values. Use null or omit.
            if (selectedChatId !== 'public') {
                msgData.receiverEmail = selectedChatId;
            }

            await onSendMessage(msgData);
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const chatUsers = employees.filter(e => e.email !== currentUserEmail);

    return (
        <div className="flex h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-4 font-bold text-blue-900 border-b border-slate-200 bg-white">
                    Conversations
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Public Channel */}
                    <button
                        onClick={() => setSelectedChatId('public')}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-100 transition-colors ${selectedChatId === 'public' ? 'bg-purple-100 border-r-4 border-purple-900' : ''}`}
                    >
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold shadow-sm">
                            #
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900">Public Chat</p>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Broadcast to all</p>
                        </div>
                    </button>

                    <div className="mt-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Direct Messages
                    </div>
                    
                    {chatUsers.map(emp => (
                        <button
                            key={emp.id}
                            onClick={() => setSelectedChatId(emp.email)}
                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-slate-100 transition-colors ${selectedChatId === emp.email ? 'bg-purple-100 border-r-4 border-purple-900' : ''}`}
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm">
                                {emp.firstName.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-blue-900 truncate">{emp.firstName} {emp.lastName}</p>
                                <p className="text-[10px] text-slate-500 truncate">{emp.department}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center px-6 bg-white shadow-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedChatId === 'public' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                        <h3 className="font-bold text-blue-900">
                            {selectedChatId === 'public' ? 'General Public Chat' : (() => {
                                const u = employees.find(e => e.email === selectedChatId);
                                return u ? `${u.firstName} ${u.lastName}` : selectedChatId;
                            })()}
                        </h3>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    {filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <p className="text-sm font-medium">No messages yet in this circle.</p>
                        </div>
                    ) : (
                        filteredMessages.map(msg => {
                            const isMe = msg.senderEmail === currentUserEmail;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] group`}>
                                        {!isMe && <p className="text-[10px] font-bold mb-1 ml-1 text-purple-900 uppercase">{msg.senderName}</p>}
                                        <div className={`rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-purple-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                            <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-slate-400'} font-medium`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSend} className="flex gap-2 items-center bg-slate-100 rounded-full px-4 py-1 focus-within:ring-2 focus-within:ring-purple-900 transition-all">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isSending}
                            placeholder={selectedChatId === 'public' ? "Message everyone..." : "Send a direct message..."}
                            className="flex-1 bg-transparent border-none py-2 focus:ring-0 text-sm text-blue-900 placeholder-slate-400"
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="bg-purple-900 text-white rounded-full p-2 hover:bg-purple-800 transition-all flex items-center justify-center w-8 h-8 shadow-sm disabled:opacity-50 disabled:bg-slate-400"
                        >
                            {isSending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
