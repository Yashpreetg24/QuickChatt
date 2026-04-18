import { cn } from "@/lib/utils";
import assets from "@/assets/assets";

type Props = {
  initials?: string;
  color?: string;
  online?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  image?: string;
};

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

const dotSize = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

export function Avatar({ size = "md", className, image }: Props) {
  return (
    <div className={cn("relative shrink-0", className)}>
        <img
          src={image || assets.avatar_icon}
          alt="Profile"
          className={cn("rounded-full object-cover ring-1 ring-white/10 shadow-bubble", sizes[size])}
        />
    </div>
  );
}
