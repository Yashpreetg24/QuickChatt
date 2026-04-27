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

      <div className="px-4 pb-6 pt-2">
        <div className="glass-strong rounded-[28px] p-2 md:p-3 flex items-center gap-2 shadow-2xl ring-1 ring-white/10">
          <AnimatePresence mode="wait">
            {recording ? (
              <motion.div
                key="rec"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 w-full"
              >
                <button
                  onClick={() => stopRecording(true)}
                  className="h-11 w-11 rounded-2xl grid place-items-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex-1 flex items-center gap-4 px-5 h-12 rounded-2xl bg-foreground/5 border border-white/5">
                  <div className="relative">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                    <span className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-destructive/50 animate-ping" />
                  </div>
                  <div className="flex items-end gap-[3px] h-8 flex-1">
                    {liveWave.map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ height: `${Math.max(15, h * 100)}%` }}
                        className="w-[3px] rounded-full bg-gradient-to-t from-brand-purple to-brand-cyan opacity-80"
                      />
                    ))}
                  </div>
                  <span className="text-[13px] font-bold tabular-nums text-muted-foreground">{fmt(recDuration)}</span>
                </div>
                <button
                  onMouseUp={() => stopRecording(false)}
                  onTouchEnd={() => stopRecording(false)}
                  onClick={() => stopRecording(false)}
                  className="h-12 w-12 rounded-2xl grid place-items-center bg-gradient-primary text-white shadow-glow hover:scale-105 transition active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 w-full"
              >
                <div className="flex items-center gap-1 bg-foreground/5 p-1 rounded-2xl border border-white/5">
                  <button
                    onClick={() => setShowEmoji((v) => !v)}
                    className={cn(
                      "h-10 w-10 grid place-items-center rounded-xl transition-all duration-300",
                      showEmoji ? "bg-primary text-white shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <Smile className="h-5.5 w-5.5" />
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
                    className="h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 cursor-pointer"
                  >
                    <Image className="h-5.5 w-5.5" />
                  </label>
                </div>

                <div className="flex-1 relative group">
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
                    placeholder="Message..."
                    className="w-full h-12 pl-5 pr-12 rounded-2xl bg-foreground/5 border border-white/5 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-foreground/10 transition-all"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {text.trim() ? (
                    <motion.button
                      key="send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      className="h-12 w-12 rounded-2xl grid place-items-center bg-gradient-primary text-white shadow-glow"
                    >
                      <Send className="h-5.5 w-5.5 -translate-x-px" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="mic"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      onMouseDown={startRecording}
                      onTouchStart={startRecording}
                      className="h-12 w-12 rounded-2xl grid place-items-center bg-gradient-primary text-white shadow-glow"
                    >
                      <Mic className="h-5.5 w-5.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
