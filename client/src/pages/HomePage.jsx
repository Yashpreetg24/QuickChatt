import React, { useContext, useEffect, useState } from 'react'
import { Sidebar } from '../components/chat/Sidebar'
import { ChatWindow } from '../components/chat/ChatWindow'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const HomePage = () => {
    const { selectedUser, messages, sendMessage, setSelectedUser, getMessages, reactToMessage } = useContext(ChatContext)
    const { authUser, onlineUsers } = useContext(AuthContext)

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

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
        avatarColor: "bg-purple-600",
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
                <section className="flex flex-col items-center justify-center flex-1 h-full glass rounded-none md:rounded-3xl">
                    <div className="h-24 w-24 rounded-full bg-gradient-primary grid place-items-center shadow-glow mb-6">
                       <span className="text-4xl text-white">⚡</span>
                    </div>
                    <p className='text-2xl font-light text-foreground text-center px-4'>Select a user to start <span className="text-gradient font-semibold">chatt-ing</span>!</p>
                </section>
            )}
        </main>
    )
}

export default HomePage
