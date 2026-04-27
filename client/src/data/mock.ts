// Mock data for QuickChatt UI demo
export type Reaction = { emoji: string; count: number; mine?: boolean };

export type Message = {
  id: string;
  roomId: string;
  authorId: string; // "me" for current user
  type: "text" | "voice" | "image";
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  duration?: number; // seconds
  waveform?: number[]; // 0..1 bars for voice
  createdAt: number;
  status: "sent" | "delivered" | "seen";
  reactions?: Reaction[];
};

export type Room = {
  id: string;
  name: string;
  avatarColor: string; // gradient css
  initials: string;
  online: boolean;
  lastSeen?: string;
  unread: number;
  preview: string;
  typing?: boolean;
  profilePic?: string;
};

export const me = {
  id: "me",
  name: "Yashpreet",
  initials: "YS",
  avatarColor: "linear-gradient(135deg,hsl(262 83% 58%),hsl(189 94% 43%))",
};

export const rooms: Room[] = [
  {
    id: "r1",
    name: "Aarav Mehta",
    initials: "AM",
    avatarColor: "linear-gradient(135deg,#7C3AED,#06B6D4)",
    online: true,
    unread: 2,
    preview: "Sounds good — ship it 🚀",
    typing: true,
  },
  {
    id: "r2",
    name: "Design Crew",
    initials: "DC",
    avatarColor: "linear-gradient(135deg,#EC4899,#8B5CF6)",
    online: true,
    unread: 5,
    preview: "Maya: new mocks in Figma",
  },
  {
    id: "r3",
    name: "Priya Singh",
    initials: "PS",
    avatarColor: "linear-gradient(135deg,#06B6D4,#3B82F6)",
    online: false,
    lastSeen: "12m ago",
    unread: 0,
    preview: "Voice message 🎤 0:14",
  },
  {
    id: "r4",
    name: "Engineering",
    initials: "EN",
    avatarColor: "linear-gradient(135deg,#10B981,#06B6D4)",
    online: true,
    unread: 0,
    preview: "Deploy passed ✓",
  },
  {
    id: "r5",
    name: "Rohan Kapoor",
    initials: "RK",
    avatarColor: "linear-gradient(135deg,#F59E0B,#EF4444)",
    online: false,
    lastSeen: "2h ago",
    unread: 0,
    preview: "see you tomorrow!",
  },
  {
    id: "r6",
    name: "Mom ❤️",
    initials: "MO",
    avatarColor: "linear-gradient(135deg,#F472B6,#A78BFA)",
    online: true,
    unread: 1,
    preview: "Don't forget dinner",
  },
];

const now = Date.now();
const m = (mins: number) => now - mins * 60_000;
const h = (hrs: number) => now - hrs * 3_600_000;
const d = (days: number) => now - days * 86_400_000;

const wf = (n: number) =>
  Array.from({ length: n }, (_, i) => 0.3 + Math.abs(Math.sin(i * 0.7)) * 0.7);

export const initialMessages: Record<string, Message[]> = {
  r1: [
    { id: "m1", roomId: "r1", authorId: "r1", type: "text", text: "Hey! Did you see the new QuickChatt design?", createdAt: d(1) + h(-2), status: "seen" },
    { id: "m2", roomId: "r1", authorId: "me", type: "text", text: "Yes! It looks insane 🔥", createdAt: d(1) + h(-1.9), status: "seen", reactions: [{ emoji: "❤️", count: 1 }] },
    { id: "m3", roomId: "r1", authorId: "r1", type: "voice", duration: 7, waveform: wf(28), createdAt: h(3), status: "seen" },
    { id: "m4", roomId: "r1", authorId: "me", type: "text", text: "Loved the voice note. Adding reactions next.", createdAt: h(2.5), status: "seen" },
    { id: "m5", roomId: "r1", authorId: "r1", type: "text", text: "Glassmorphism + neon accents = chef's kiss 👨‍🍳", createdAt: m(35), status: "seen", reactions: [{ emoji: "😂", count: 2, mine: true }] },
    { id: "m6", roomId: "r1", authorId: "me", type: "text", text: "Pushing the prototype now ✨", createdAt: m(20), status: "delivered" },
    { id: "m7", roomId: "r1", authorId: "r1", type: "text", text: "Sounds good — ship it 🚀", createdAt: m(2), status: "sent" },
  ],
  r2: [
    { id: "d1", roomId: "r2", authorId: "r2", type: "text", text: "Maya: new mocks are in Figma 🎨", createdAt: m(15), status: "delivered" },
  ],
  r3: [
    { id: "p1", roomId: "r3", authorId: "r3", type: "voice", duration: 14, waveform: wf(36), createdAt: h(5), status: "seen" },
  ],
  r4: [
    { id: "e1", roomId: "r4", authorId: "r4", type: "text", text: "Deploy passed ✓", createdAt: h(8), status: "seen" },
  ],
  r5: [
    { id: "k1", roomId: "r5", authorId: "r5", type: "text", text: "see you tomorrow!", createdAt: h(12), status: "seen" },
  ],
  r6: [
    { id: "mm1", roomId: "r6", authorId: "r6", type: "text", text: "Don't forget dinner ❤️", createdAt: m(45), status: "delivered" },
  ],
};
