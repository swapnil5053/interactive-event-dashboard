"use client";

import { cn } from "../lib/utils";

export type LevelType = "beginner" | "intermediate" | "advanced";

interface LevelTagProps {
  level: LevelType;
  size?: "sm" | "md";
  className?: string;
}

const levelConfig: Record<LevelType, { label: string }> = {
  beginner: { label: "Beginner" },
  intermediate: { label: "Intermediate" },
  advanced: { label: "Advanced" },
};

export function LevelTag({ level, size = "sm", className }: LevelTagProps) {
  const config = levelConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium text-muted-foreground",
        size === "sm" && "text-[10px] uppercase tracking-wider",
        size === "md" && "text-xs uppercase tracking-wider",
        className
      )}
    >
      {config.label}
    </span>
  );
}
