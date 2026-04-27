import { Search, Settings, Zap } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";
import assets from "@/assets/assets";

import { ProfileModal } from "./ProfileModal";

export function Sidebar({ collapsed, activeId, onSelect }) {
  const { users, unseenMessages, onlineUsers, getUsers } = useContext(ChatContext);
  const { authUser, logout } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const filtered = users ? users.filter((r) => r.fullName.toLowerCase().includes(q.toLowerCase())) : [];

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const me = {
    name: authUser?.fullName || "Me",
    initials: authUser?.fullName?.charAt(0) || "M",
    avatarColor: "bg-purple-600",
    profilePic: authUser?.profilePic,
  };

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong h-full w-full md:w-[320px] lg:w-[360px] flex flex-col rounded-none md:rounded-r-3xl overflow-hidden"
        >
          {/* Brand */}
          <div className="px-5 pt-6 pb-4 flex justify-between items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <img src={assets.logo_icon} alt="logo" className='h-9 w-9 object-contain' />
              <h1 className="text-[26px] font-extrabold tracking-tight flex items-baseline">
                <span className="text-foreground">Quick</span>
                <span className="text-gradient">Chat</span>
              </h1>
            </div>
            
            <div className="relative group cursor-pointer p-1" onClick={() => setShowProfileModal(true)}>
              <Settings className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-500" />
            </div>
          </div>

          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

          {/* Me */}
          <div className="px-5 pb-4 flex items-center gap-3">
            <Avatar 
              image={me.profilePic} 
              initials={me.initials} 
              color={me.avatarColor} 
              online 
              size="md" 
            />
            
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{me.name}</p>
              <p className="text-xs text-online flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-online drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]" /> Online
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search chats…"
                className="w-full pl-9 pr-3 h-10 rounded-full bg-secondary/70 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <ul className="space-y-1">
              {filtered.map((r) => {
                const active = r._id === activeId;
                const isOnline = onlineUsers?.includes(r._id);
                const unread = unseenMessages[r._id] || 0;
                
                return (
                  <li key={r._id}>
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelect(r)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 relative overflow-hidden group will-change-transform",
                        active
                          ? "bg-foreground/10 text-foreground"
                          : "hover:bg-foreground/5 text-muted-foreground"
                      )}
                    >
                      <Avatar
                        image={r.profilePic}
                        initials={r.fullName?.charAt(0) || "?"}
                        color="bg-purple-600"
                        online={isOnline}
                        size="md"
                        className="transition-transform group-hover:scale-105"
                      />
                      
                      <div className="min-w-0 flex-1 relative z-10">
                        <p className={cn("text-[14px] font-bold tracking-tight truncate", active ? "text-foreground" : "text-foreground/90")}>
                          {r.fullName}
                        </p>
                        <p className={cn(
                          "text-xs truncate transition-colors mt-0.5",
                          active ? "text-foreground/60" : "text-muted-foreground/80"
                        )}>
                           Tap to start chatting
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0 py-0.5">
                        {isOnline && (
                          <div className="flex items-center gap-1.5 text-online transition-colors">
                            <span className="h-1.5 w-1.5 rounded-full bg-online shadow-[0_0_4px_rgba(34,197,94,0.6)] animate-pulse-dot" />
                            <span className="text-[10px] font-medium leading-none">online</span>
                          </div>
                        )}
                        {unread > 0 && (
                          <span className={cn(
                            "min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-primary text-[9px] font-black text-primary-foreground flex items-center justify-center shadow-glow animate-pulse mt-auto"
                          )}>
                            {unread}
                          </span>
                        )}
                      </div>
                      

                    </motion.button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-8 text-center text-xs text-muted-foreground">No chats found</li>
              )}
            </ul>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
