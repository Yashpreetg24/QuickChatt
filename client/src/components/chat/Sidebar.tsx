import { Search, Settings } from "lucide-react";
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
    avatarColor: "bg-blue-500",
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
          <div className="px-5 pt-5 pb-3 flex justify-between">
            <div className="flex items-center gap-2">
              <img src={assets.logo_icon} alt="logo" className='max-h-8 max-w-8' />
              <h1 className="text-xl font-bold tracking-tight">
                Quick<span className="text-gradient">Chat</span>
              </h1>
            </div>
            
            <div className="relative py-2 group cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground transition-all duration-200" />
            </div>
          </div>

          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

          {/* Me */}
          <div className="px-5 pb-4 flex items-center gap-3">
            {me.profilePic ? (
               <img src={me.profilePic} className="h-10 w-10 rounded-full object-cover shadow-glass" alt="Profile" />
            ) : (
               <Avatar initials={me.initials} color={me.avatarColor} online size="md" />
            )}
            
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{me.name}</p>
              <p className="text-xs text-online flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-online drop-shadow-[0_0_4px_rgba(34,197,94,0.8)]" /> Online
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
                    <button
                      onClick={() => onSelect(r)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group",
                        active
                          ? "bg-gradient-to-r from-primary/15 to-accent/10 ring-1 ring-primary/30 text-foreground"
                          : "hover:bg-secondary/60 text-muted-foreground"
                      )}
                    >
                      {r.profilePic ? (
                        <div className="relative">
                           <img src={r.profilePic} className="h-10 w-10 rounded-full object-cover" />
                        </div>
                      ) : (
                        <Avatar
                          initials={r.fullName?.charAt(0) || "?"}
                          color={"bg-purple-600"}
                          online={isOnline}
                          size="md"
                        />
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-semibold truncate", active ? "text-foreground" : "text-foreground/80")}>
                            {r.fullName}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {isOnline ? "now" : "offline"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={cn(
                            "text-xs truncate text-muted-foreground"
                          )}>
                             Tap to chat
                          </p>
                          {unread > 0 && (
                            <span className={cn(
                              "shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground grid place-items-center shadow-bubble animate-shake"
                            )}>
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
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
