"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrackTag, type TrackType } from "./TrackTag";

export interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  image: string;
  track: TrackType;
}

interface SpeakerCardProps {
  speaker: Speaker;
  className?: string;
}

export function SpeakerCard({ speaker, className }: SpeakerCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-xl",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={speaker.image}
          alt={speaker.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <TrackTag track={speaker.track} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{speaker.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {speaker.role} at {speaker.company}
        </p>
      </div>
    </motion.div>
  );
}
