import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Mic, Image, Send, Smile, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  isDark: boolean;
  onSendText: (text: string) => void;
  onSendVoice: (data: { audioUrl: string; duration: number; waveform: number[] }) => void;
  onSendImage?: (base64: string | ArrayBuffer | null) => void;
  onTyping: () => void;
};

export function MessageInput(props: Props) {
  const { isDark, onSendText, onSendVoice, onTyping } = props;
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [liveWave, setLiveWave] = useState<number[]>(Array(32).fill(0.3));

  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number>(0);
  const waveSamplesRef = useRef<number[]>([]);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Close emoji on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const onDoc = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showEmoji]);

  const handleSend = () => {
    const v = text.trim();
    if (!v) return;
    onSendText(v);
    setText("");
    inputRef.current?.focus();
  };

  const onEmoji = (e: EmojiClickData) => {
    setText((t) => t + e.emoji);
    inputRef.current?.focus();
  };

  // ----- Voice recording -----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      waveSamplesRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const duration = (Date.now() - startTsRef.current) / 1000;
        
        // Downsample collected samples to ~32 bars
        const samples = waveSamplesRef.current;
        const targetBars = 32;
        const step = Math.max(1, Math.floor(samples.length / targetBars));
        const wf: number[] = [];
        for (let i = 0; i < samples.length && wf.length < targetBars; i += step) {
          const slice = samples.slice(i, i + step);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          wf.push(Math.max(0.15, Math.min(1, avg)));
        }
        while (wf.length < targetBars) wf.push(0.2);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
             const base64data = reader.result as string;
             onSendVoice({ audioUrl: base64data, duration: Math.max(1, duration), waveform: wf });
        };
        reader.readAsDataURL(blob);

        // cleanup
        stream.getTracks().forEach((t) => t.stop());
        if (audioCtxRef.current) audioCtxRef.current.close();
        audioCtxRef.current = null;
        analyserRef.current = null;
        streamRef.current = null;
      };
      mr.start();

      // Web Audio analyser for live waveform
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        // average + map to 0..1
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        waveSamplesRef.current.push(avg);
        // create a sliding live waveform of 32 bars
        setLiveWave((prev) => {
          const next = prev.slice(1);
          next.push(Math.max(0.15, Math.min(1, avg * 1.4)));
          return next;
        });
        setRecDuration((Date.now() - startTsRef.current) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      };
      startTsRef.current = Date.now();
      setRecording(true);
      setRecDuration(0);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error("Mic permission denied or unavailable", err);
      alert("Microphone access denied. Please allow mic to record voice messages.");
    }
  };

  const stopRecording = (cancel = false) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setRecording(false);
    setLiveWave(Array(32).fill(0.3));
    if (cancel) {
      // discard
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
      return;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const fmt = (s: number) => {
    const mm = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="relative">
      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            ref={emojiRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-2 mb-3 z-30"
          >
            <div className="rounded-2xl overflow-hidden shadow-glass">
              <EmojiPicker
                onEmojiClick={onEmoji}
                theme={isDark ? Theme.DARK : Theme.LIGHT}
                searchPlaceHolder="Search emoji…"
                width={320}
                height={380}
                lazyLoadEmojis
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass border-t border-border/40 px-3 py-3 md:px-4 md:py-4 rounded-none md:rounded-b-3xl">
        <AnimatePresence mode="wait">
          {recording ? (
            <motion.div
              key="rec"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => stopRecording(true)}
                className="h-10 w-10 rounded-full grid place-items-center bg-secondary hover:bg-destructive hover:text-destructive-foreground transition"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex-1 flex items-center gap-3 px-4 h-12 rounded-full bg-secondary/70 border border-border/50">
                <span className="relative grid place-items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse-dot" />
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-destructive/60 animate-pulse-ring" />
                </span>
                <div className="flex items-end gap-[2px] h-8 flex-1">
                  {liveWave.map((h, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full bg-gradient-to-t from-brand-purple to-brand-cyan transition-all"
                      style={{ height: `${Math.max(15, h * 100)}%` }}
                    />
                  ))}
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">{fmt(recDuration)}</span>
              </div>
              <button
                onMouseUp={() => stopRecording(false)}
                onTouchEnd={() => stopRecording(false)}
                onClick={() => stopRecording(false)}
                className="h-12 w-12 rounded-full grid place-items-center bg-gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition active:scale-95"
                aria-label="Send voice message"
              >
                <Send className="h-5 w-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className={cn(
                  "h-10 w-10 grid place-items-center rounded-full transition",
                  showEmoji ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                )}
                aria-label="Emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              <input
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (props.onSendImage) props.onSendImage(reader.result);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
                type="file"
                id="image-upload"
                accept="image/png, image/jpeg"
                hidden
              />
              <label
                htmlFor="image-upload"
                className="h-10 w-10 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition cursor-pointer"
                aria-label="Attach Image"
              >
                <Image className="h-5 w-5" />
              </label>

              <input
                ref={inputRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  onTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 h-12 px-5 rounded-full bg-secondary/70 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />

              {text.trim() ? (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleSend}
                  className="h-12 w-12 rounded-full grid place-items-center bg-gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition active:animate-spring"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5 -translate-x-px" />
                </motion.button>
              ) : (
                <button
                  onMouseDown={startRecording}
                  onTouchStart={startRecording}
                  className="relative h-12 w-12 rounded-full grid place-items-center bg-gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition"
                  aria-label="Hold to record"
                  title="Hold to record voice message"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
