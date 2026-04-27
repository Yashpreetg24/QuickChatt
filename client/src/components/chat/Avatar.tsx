import { cn } from "@/lib/utils";
import assets from "@/assets/assets";

type Props = {
  initials?: string;
  color?: string;
  online?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  image?: string;
};

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-[120px] w-[120px] text-4xl",
};

const dotSize = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-6 w-6",
};


export function Avatar({ size = "md", className, image, initials, color, online }: Props) {
  return (
    <div className={cn("relative shrink-0 rounded-full", sizes[size], className)}>
      {image ? (
        <img
          src={image}
          alt="Profile"
          className="rounded-full h-full w-full object-cover ring-1 ring-white/10 shadow-bubble"
        />
      ) : (
        <div
          className={cn(
            "rounded-full h-full w-full flex items-center justify-center font-bold text-white shadow-bubble ring-1 ring-white/10",
            color || "bg-gradient-primary"
          )}
        >
          {initials || "?"}
        </div>
      )}
      

    </div>
  );
}

