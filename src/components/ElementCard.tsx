"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Wind, Droplets, Flame, Mountain } from "lucide-react";
import type { TrackType } from "./TrackTag";

interface ElementCardProps {
  element: TrackType;
  title: string;
  description: string;
  href: string;
  className?: string;
}

const elementConfig: Record<
  TrackType,
  { icon: React.ComponentType<{ className?: string }>; gradient: string; borderColor: string; iconBg: string }
> = {
  air: {
    icon: Wind,
    gradient: "from-[var(--air)]/20 to-transparent",
    borderColor: "border-[var(--air)]/30 hover:border-[var(--air)]",
    iconBg: "bg-[var(--air)]/20 text-[var(--air)]",
  },
  water: {
    icon: Droplets,
    gradient: "from-[var(--water)]/20 to-transparent",
    borderColor: "border-[var(--water)]/30 hover:border-[var(--water)]",
    iconBg: "bg-[var(--water)]/20 text-[var(--water)]",
  },
  fire: {
    icon: Flame,
    gradient: "from-[var(--fire)]/20 to-transparent",
    borderColor: "border-[var(--fire)]/30 hover:border-[var(--fire)]",
    iconBg: "bg-[var(--fire)]/20 text-[var(--fire)]",
  },
  earth: {
    icon: Mountain,
    gradient: "from-[var(--earth)]/20 to-transparent",
    borderColor: "border-[var(--earth)]/30 hover:border-[var(--earth)]",
    iconBg: "bg-[var(--earth)]/20 text-[var(--earth)]",
  },
};

export function ElementCard({ element, title, description, href, className }: ElementCardProps) {
  const config = elementConfig[element];
  const Icon = config.icon;

  return (
    <Link href={href} className={cn("block", className)}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all",
          config.borderColor
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", config.gradient)} />

        <div className="relative">
          <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", config.iconBg)}>
            <Icon className="h-6 w-6" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-foreground">
            Explore sessions
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
