import { Maximize2, Minimize2, Moon, Sun, Menu } from "lucide-react";
import { Avatar } from "./Avatar";
import type { Room } from "@/data/mock";

type Props = {
  room: Room;
  isFullscreen: boolean;
  isDark: boolean;
  onToggleFullscreen: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
};

export function ChatHeader({ room, isFullscreen, isDark, onToggleFullscreen, onToggleTheme, onToggleSidebar }: Props) {
  return (
    <header className="glass border-b border-border/40 px-4 py-3 flex items-center gap-3 rounded-none md:rounded-t-3xl">
      <button
        onClick={onToggleSidebar}
        className="md:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-secondary/70 transition"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Avatar initials={room.initials} color={room.avatarColor} online={room.online} size="md" image={room.profilePic} />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold truncate">{room.name}</h2>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          {room.online ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-online animate-pulse-dot" />
              <span className="text-online font-medium">Online</span>
            </>
          ) : (
            <>Offline</>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <IconBtn label={isDark ? "Light mode" : "Dark mode"} onClick={onToggleTheme}>
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </IconBtn>
        <IconBtn label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={onToggleFullscreen} highlight>
          {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
        </IconBtn>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  highlight,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "h-9 w-9 grid place-items-center rounded-full transition-all duration-200 " +
        (highlight
          ? "text-primary hover:text-primary-foreground hover:bg-gradient-primary hover:shadow-glow"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70")
      }
    >
      {children}
    </button>
  );
}
