import { Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/data/mock";
import { VoiceBubble } from "./VoiceBubble";

type Props = {
  msg: Message;
  mine: boolean;
  onReact: (msgId: string, emoji: string) => void;
};

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

export function MessageBubble({ msg, mine, onReact }: Props) {
  const [showReact, setShowReact] = useState(false);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex w-full relative", mine ? "justify-end" : "justify-start")}
      onMouseEnter={() => setShowReact(true)}
      onMouseLeave={() => setShowReact(false)}
    >
      <div className={cn("relative max-w-[85%] sm:max-w-[70%] flex flex-col", mine ? "items-end" : "items-start")}>
        {/* Reaction picker */}
        <AnimatePresence>
          {showReact && !mine && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute -top-11 left-0 z-20 glass-strong rounded-2xl px-2 py-1.5 flex items-center gap-1 shadow-glow"
            >
              {REACTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => onReact(msg.id, e)}
                  className="h-8 w-8 grid place-items-center rounded-xl hover:bg-primary/20 hover:scale-125 transition-all"
                >
                  <span className="text-lg">{e}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            "px-4 py-3 text-[14.5px] leading-relaxed relative overflow-hidden",
            mine
              ? "bg-gradient-primary text-white rounded-[22px] rounded-br-lg shadow-glow"
              : "glass-tile text-foreground rounded-[22px] rounded-bl-lg shadow-sm border-white/5",
            msg.type === "image" && "p-1.5 bg-transparent border-0"
          )}
        >
          {/* Subtle overlay for glass effect on sent messages */}
          {mine && <div className="absolute inset-0 bg-white/5 pointer-events-none" />}

          {msg.type === "text" ? (
            <p className="whitespace-pre-wrap relative z-10">{msg.text}</p>
          ) : msg.type === "image" ? (
            <div className="relative group/img overflow-hidden rounded-[18px]">
              <img src={msg.imageUrl} alt="attached" className="max-w-[240px] md:max-w-[320px] transition-transform duration-500 group-hover/img:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
            </div>
          ) : (
            <VoiceBubble
              audioUrl={msg.audioUrl}
              duration={msg.duration ?? 0}
              waveform={msg.waveform ?? []}
              variant={mine ? "sent" : "received"}
            />
          )}
        </div>

        {/* Reactions */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className={cn("mt-1.5 flex gap-1", mine ? "justify-end" : "justify-start")}>
            {msg.reactions.map((r, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[12px] glass-tile border border-white/10 flex items-center gap-1.5 shadow-sm",
                  r.mine && "ring-1 ring-primary/40 bg-primary/10"
                )}
              >
                <span className="text-sm leading-none">{r.emoji}</span>
                {r.count > 1 && <span className="font-bold opacity-60 text-[10px]">{r.count}</span>}
              </motion.span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className={cn("flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-1", mine ? "flex-row-reverse" : "")}>
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground/80">{time}</span>
          {mine && (
            <span className="text-primary/60">
              {msg.status === "seen" ? <CheckCheck className="h-3 w-3 text-brand-cyan" /> : <Check className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
