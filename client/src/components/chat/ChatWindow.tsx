import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { Message, Room } from "@/data/mock";

type Props = {
  room: Room;
  messages: Message[];
  isFullscreen: boolean;
  isDark: boolean;
  typing: boolean;
  onToggleFullscreen: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onSendText: (text: string) => void;
  onSendVoice: (data: { audioUrl: string; duration: number; waveform: number[] }) => void;
  onSendImage?: (base64: string | ArrayBuffer | null) => void;
  onReact: (msgId: string, emoji: string) => void;
  onTyping: () => void;
};

const dayLabel = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

export function ChatWindow(props: Props) {
  const { room, messages, typing } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);

  // Group messages by day
  const grouped = useMemo(() => {
    const out: { label: string; items: Message[] }[] = [];
    for (const m of messages) {
      const lbl = dayLabel(m.createdAt);
      const last = out[out.length - 1];
      if (!last || last.label !== lbl) out.push({ label: lbl, items: [m] });
      else last.items.push(m);
    }
    return out;
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages.length, typing, room.id]);

  // Snap to bottom on room switch
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [room.id]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJump(dist > 200);
  };

  const jumpToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <section className="relative flex-1 flex flex-col h-full glass rounded-none md:rounded-3xl overflow-hidden">
      <ChatHeader
        room={room}
        isFullscreen={props.isFullscreen}
        isDark={props.isDark}
        onToggleFullscreen={props.onToggleFullscreen}
        onToggleTheme={props.onToggleTheme}
        onToggleSidebar={props.onToggleSidebar}
      />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4"
      >
        {grouped.map((g) => (
          <div key={g.label} className="space-y-3">
            <div className="flex items-center justify-center my-2">
              <span className="text-[11px] font-medium text-muted-foreground glass px-3 py-1 rounded-full">
                {g.label}
              </span>
            </div>
            {g.items.map((m) => (
              <MessageBubble key={m.id} msg={m} mine={m.authorId === "me"} onReact={props.onReact} />
            ))}
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Scroll-to-bottom */}
      <AnimatePresence>
        {showJump && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={jumpToBottom}
            className="absolute right-4 bottom-24 h-10 w-10 rounded-full grid place-items-center glass-strong hover:bg-primary hover:text-primary-foreground shadow-bubble transition"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <MessageInput
        isDark={props.isDark}
        onSendText={props.onSendText}
        onSendVoice={props.onSendVoice}
        onSendImage={props.onSendImage}
        onTyping={props.onTyping}
      />
    </section>
  );
}
