"use client";

import { cn } from "../lib/utils";

export type TrackType = "air" | "water" | "fire" | "earth";

interface TrackTagProps {
  track: TrackType;
  size?: "sm" | "md";
  className?: string;
}

const trackConfig: Record<
  TrackType,
  { label: string; textClass: string; dotClass: string }
> = {
  air: {
    label: "Air",
    textClass: "text-[#6B8EAD]",
    dotClass: "bg-[#6B8EAD]",
  },
  water: {
    label: "Water",
    textClass: "text-[#5B8C85]",
    dotClass: "bg-[#5B8C85]",
  },
  fire: {
    label: "Fire",
    textClass: "text-[#BC6C4D]",
    dotClass: "bg-[#BC6C4D]",
  },
  earth: {
    label: "Earth",
    textClass: "text-[#6B8A6B]",
    dotClass: "bg-[#6B8A6B]",
  },
};

export function TrackTag({ track, size = "sm", className }: TrackTagProps) {
  const config = trackConfig[track];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        config.textClass,
        size === "sm" && "text-[10px] uppercase tracking-wider",
        size === "md" && "text-xs uppercase tracking-wider",
        className
      )}
    >
      <span className={cn("h-1 w-1 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
