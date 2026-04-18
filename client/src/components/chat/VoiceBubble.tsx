import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  audioUrl?: string;
  duration: number;
  waveform: number[];
  variant: "sent" | "received";
};

export function VoiceBubble({ audioUrl, duration, waveform, variant }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    if (!audioUrl) return;
    const a = new Audio(audioUrl);
    audioRef.current = a;
    const onTime = () => setProgress(a.currentTime / (a.duration || duration));
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [audioUrl, duration]);

  const toggle = () => {
    if (!audioUrl) {
      // simulate playback for mock voice messages
      if (playing) {
        setPlaying(false);
        return;
      }
      setPlaying(true);
      const start = Date.now();
      const tick = () => {
        const elapsed = (Date.now() - start) / 1000;
        const p = Math.min(1, elapsed / duration);
        setProgress(p);
        if (p < 1 && audioRef.current === null) {
          requestAnimationFrame(tick);
        } else if (p >= 1) {
          setPlaying(false);
          setProgress(0);
        }
      };
      requestAnimationFrame(tick);
      return;
    }
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const fmt = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const filled = Math.floor(waveform.length * progress);

  return (
    <div className="flex items-center gap-3 min-w-[220px]">
      <button
        onClick={toggle}
        className={cn(
          "h-10 w-10 rounded-full grid place-items-center shrink-0 transition-transform active:scale-90",
          variant === "sent"
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-gradient-primary text-primary-foreground shadow-bubble"
        )}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
      </button>
      <div className="flex items-end gap-[2px] h-8 flex-1">
        {waveform.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-full transition-colors",
              variant === "sent"
                ? i < filled ? "bg-white" : "bg-white/40"
                : i < filled ? "bg-primary" : "bg-muted-foreground/40"
            )}
            style={{ height: `${Math.max(15, h * 100)}%` }}
          />
        ))}
      </div>
      <span className={cn("text-[11px] tabular-nums shrink-0", variant === "sent" ? "text-white/90" : "text-muted-foreground")}>
        {fmt(duration * (1 - progress))}
      </span>
    </div>
  );
}
