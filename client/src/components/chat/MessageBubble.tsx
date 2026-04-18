import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 10, x: mine ? 12 : -12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex w-full", mine ? "justify-end" : "justify-start")}
      onMouseEnter={() => setShowReact(true)}
      onMouseLeave={() => setShowReact(false)}
    >
      <div className={cn("relative max-w-[78%] sm:max-w-[65%] flex flex-col", mine ? "items-end" : "items-start")}>
        {/* Reaction picker */}
        {showReact && !mine && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute -top-9 z-10 glass-strong rounded-full px-1.5 py-1 flex items-center gap-0.5 shadow-bubble left-0"
            )}
          >
            {REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => onReact(msg.id, e)}
                className="h-7 w-7 grid place-items-center rounded-full hover:bg-secondary/80 transition-transform hover:scale-125"
              >
                <span className="text-base leading-none">{e}</span>
              </button>
            ))}
          </motion.div>
        )}

        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed break-words",
            mine
              ? "bubble-sent rounded-2xl rounded-br-md text-white"
              : "bubble-received rounded-2xl rounded-bl-md text-foreground",
            msg.type === "image" && "p-2 bg-transparent border-0 text-foreground"
          )}
        >
          {msg.type === "text" ? (
            <p className="whitespace-pre-wrap">{msg.text}</p>
          ) : msg.type === "image" ? (
            <img src={msg.imageUrl} alt="attached" className="max-w-[200px] md:max-w-[250px] rounded-xl border border-border/50 shadow-glass" />
          ) : (
            <VoiceBubble
              audioUrl={msg.audioUrl}
              duration={msg.duration ?? 0}
              waveform={msg.waveform ?? []}
              variant={mine ? "sent" : "received"}
            />
          )}
        </div>

        {/* Reactions row */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className={cn("mt-1 flex gap-1 flex-wrap", mine ? "justify-end" : "justify-start")}>
            {msg.reactions.map((r, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] glass border border-border/40 flex items-center gap-1",
                  r.mine && "ring-1 ring-primary/50"
                )}
              >
                <span className="text-sm leading-none whitespace-pre">{r.emoji} </span>
              </motion.span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className={cn("flex items-center gap-1 mt-1 px-1", mine ? "flex-row-reverse" : "")}>
          <span className="text-[10px] text-muted-foreground tabular-nums">{time}</span>
          {mine && (
            <span className="text-muted-foreground">
              {msg.status === "sent" && <Check className="h-3 w-3" />}
              {msg.status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {msg.status === "seen" && <CheckCheck className="h-3 w-3 text-accent" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
