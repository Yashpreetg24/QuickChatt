import React, { useContext, useEffect, useState } from 'react'
import { Sidebar } from '../components/chat/Sidebar'
import { ChatWindow } from '../components/chat/ChatWindow'
import { motion as Motion } from 'framer-motion'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const HomePage = () => {
    const { selectedUser, messages, sendMessage, setSelectedUser, getMessages, reactToMessage } = useContext(ChatContext)
    const { authUser, onlineUsers } = useContext(AuthContext)

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser, getMessages]);

    // Theme state
    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    // Sidebar collapse state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const update = () => {
            setIsMobile(mq.matches);
            setSidebarCollapsed(mq.matches);
        };
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    // Layout fullscreen
    const [isFullscreen, setIsFullscreen] = useState(false);
    useEffect(() => {
        const onChange = () => {
            const fs = !!document.fullscreenElement;
            setIsFullscreen(fs);
            if (fs) setSidebarCollapsed(true);
            else if (!isMobile) setSidebarCollapsed(false);
        };
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, [isMobile]);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    // Chat Nebula expects 'Room' and 'Message' structures
    // Mapping selectedUser to Room format
    const activeRoom = selectedUser ? {
        id: selectedUser._id,
        name: selectedUser.fullName,
        initials: selectedUser.fullName.charAt(0),
        avatarColor: "bg-slate-500",
        online: onlineUsers?.includes(selectedUser._id) || false,
        lastSeen: "Offline",
        preview: "...",
        unread: 0,
        typing: false,
        profilePic: selectedUser.profilePic
    } : null;

    // Mapping messages from QuickChatt DB to ChatNebula format
    const mappedMessages = messages.map(msg => ({
        id: msg._id || msg.createdAt, 
        roomId: selectedUser?._id,
        authorId: msg.senderId === authUser._id ? "me" : msg.senderId,
        type: msg.voice ? "voice" : (msg.image ? "image" : "text"),
        text: msg.text || "",
        imageUrl: msg.image,
        audioUrl: msg.voice,
        duration: msg.duration,
        waveform: msg.waveform,
        reactions: msg.reactions?.map(r => ({
            emoji: r.emoji,
            count: r.users.length,
            mine: r.users.includes(authUser._id)
        })),
        createdAt: new Date(msg.createdAt).getTime(),
        status: "seen" // simplification
    }));

    // Handlers
    const handleSelect = (user) => {
        setSelectedUser(user);
        if (isMobile) setSidebarCollapsed(true);
    };

    const handleSendText = (text) => {
        if (text.trim() === "") return;
        sendMessage({ text: text.trim() });
    };

    const handleSendImage = (base64) => {
        if (!base64) return;
        sendMessage({ image: base64 });
    };

    const handleSendVoice = (data) => {
        if (!data.audioUrl) return;
        sendMessage({ 
            voice: data.audioUrl,
            duration: data.duration,
            waveform: data.waveform
        });
    };

    return (
        <main className="h-screen w-full flex p-0 md:p-3 lg:p-5 gap-0 md:gap-4 overflow-hidden relative">
            {isMobile && !sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            <div
                className={
                    isMobile
                        ? `fixed inset-y-0 left-0 z-50 transition-transform ${sidebarCollapsed ? "-translate-x-full" : "translate-x-0"}`
                        : "relative z-10"
                }
            >
                <Sidebar
                    activeId={selectedUser?._id}
                    onSelect={handleSelect}
                    collapsed={!isMobile && sidebarCollapsed}
                />
            </div>

            <div className="flex-1 h-full relative overflow-hidden bg-black rounded-none md:rounded-3xl border border-white/5">
                {activeRoom ? (
                    <ChatWindow
                        room={activeRoom}
                        messages={mappedMessages}
                        typing={false}
                        isFullscreen={isFullscreen}
                        isDark={isDark}
                        onToggleFullscreen={toggleFullscreen}
                        onToggleTheme={() => setIsDark((v) => !v)}
                        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
                        onSendText={handleSendText}
                        onSendImage={handleSendImage}
                        onSendVoice={handleSendVoice}
                        onReact={(msgId, emoji) => reactToMessage(msgId, emoji)}
                        onTyping={() => {}}
                    />
                ) : (
                    <section className="flex flex-col items-center justify-center h-full relative overflow-hidden">
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-center text-center gap-6 will-change-transform"
                        >
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/40 blur-[80px] rounded-full scale-150 animate-pulse" />
                                <img src={assets.logo_icon} alt="QuickChat" className="w-24 h-24 relative z-10 drop-shadow-[0_0_20px_rgba(150,69,255,0.4)] transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-[32px] font-bold text-white tracking-tight">
                                    QuickChat Web
                                </h2>
                                <p className='text-base font-medium text-white/30 max-w-sm'>
                                    Send and receive messages without keeping your phone online.
                                </p>
                            </div>
                        </Motion.div>

                        {/* Security Footer */}
                        <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-2 text-white/30 text-[13px] font-light">
                            <div className="flex items-center gap-1.5">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" height="14" 
                                    viewBox="0 0 24 24" fill="none" 
                                    stroke="currentColor" strokeWidth="2.5" 
                                    strokeLinecap="round" strokeLinejoin="round" 
                                    className="mb-0.5"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Your personal messages are <span className="text-online/80 font-medium">end-to-end encrypted</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}

export default HomePage
