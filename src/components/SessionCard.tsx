"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Bookmark, BookmarkCheck, CalendarPlus, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { TrackTag, type TrackType } from "./TrackTag";
import { LevelTag, type LevelType } from "./LevelTag";
import { useState, useTransition } from "react";
import { useAuth } from "@/providers/auth-provider";
import { toggleBookmarkAction } from "@/app/actions";
import { toast } from "sonner";
import { telemetry } from "@/lib/telemetry";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface Session {
  id: string;
  title: string;
  track: TrackType;
  level: LevelType;
  time: string;
  duration: string;
  stage: string;
  speaker: string;
  speakerRole?: string;
  speakerCompany?: string;
  speakerBio?: string;
  speakerAvatar?: string;
  format: string;
  day?: number;
  description?: string;
}

interface SessionCardProps {
  session: Session;
  compact?: boolean;
  className?: string;
  isBookmarkedInitial?: boolean;
  onBookmarkChange?: (id: string, active: boolean) => void;
}

export function SessionCard({ session, compact = false, className, isBookmarkedInitial = false, onBookmarkChange }: SessionCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(isBookmarkedInitial);
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.warning("Authentication required to bookmark sessions.", {
        description: "Access the Developer Switcher to activate a sandbox role.",
      });
      return;
    }

    const nextState = !saved;
    setSaved(nextState);

    startTransition(async () => {
      try {
        telemetry.track("action", nextState ? "Bookmarked Session" : "Unbookmarked Session", {
          sessionId: session.id,
          title: session.title,
        });

        await toggleBookmarkAction(user.id, user.role, session.id, nextState);
        if (onBookmarkChange) {
          onBookmarkChange(session.id, nextState);
        }
        
        toast.success(nextState ? "Session added to agenda" : "Session removed from agenda", {
          description: session.title,
        });
      } catch (err: any) {
        setSaved(!nextState);
        toast.error("Failed to update bookmark preference.");
      }
    });
  };

  // Google Calendar link generator helper copy
  const getGoogleCalendarLink = () => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const dateStr = session.day === 2 ? "20260616" : "20260615";
    
    let timeStr = "090000";
    const timeVal = session.time || "9:00 AM";
    const [hourMin, ampm] = timeVal.split(" ");
    const [hour, min] = hourMin.split(":");
    let hr = parseInt(hour);
    if (ampm === "PM" && hr < 12) hr += 12;
    if (ampm === "AM" && hr === 12) hr = 0;
    
    const formattedHr = hr.toString().padStart(2, "0");
    const formattedMin = min.padStart(2, "0");
    timeStr = `${formattedHr}${formattedMin}00`;
    
    const durMinutes = parseInt(session.duration) || 45;
    const endMinTotal = (hr * 60) + parseInt(formattedMin) + durMinutes;
    const endHr = Math.floor(endMinTotal / 60) % 24;
    const endMin = endMinTotal % 60;
    const formattedEndHr = endHr.toString().padStart(2, "0");
    const formattedEndMin = endMin.toString().padStart(2, "0");
    const endTimeStr = `${formattedEndHr}${formattedEndMin}00`;
    
    const details = encodeURIComponent(
      `${session.description || ""}\n\nTrack: ${session.track.toUpperCase()}\nSpeaker: ${session.speaker}`
    );
    const location = encodeURIComponent(session.stage || "Main Hallway");
    const text = encodeURIComponent(`Designare OS: ${session.title}`);
    const dates = `${dateStr}T${timeStr}/${dateStr}T${endTimeStr}`;
    
    return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "group relative border border-border bg-card p-6 transition-all duration-200 ease-in-out hover:bg-white hover:shadow-md hover:border-gold/25 cursor-pointer rounded-none",
            className
          )}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <TrackTag track={session.track} />
                <LevelTag level={session.level} />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60">{session.format}</span>
              </div>

              <div>
                <h3 className="text-lg font-medium leading-tight text-foreground transition-colors group-hover:text-gold">
                  {session.title}
                </h3>
              </div>

              {!compact && (
                <p className="text-sm text-muted-foreground">
                  {session.speaker}
                  {session.speakerRole && <span className="opacity-70"> · {session.speakerRole} at {session.speakerCompany || "Figma"}</span>}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground/80">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 opacity-60" />
                  {session.time} · {session.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 opacity-60" />
                  {session.stage}
                </span>
              </div>
            </div>

            <button
              onClick={handleBookmarkClick}
              disabled={isPending}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center border transition-all",
                saved
                  ? "border-gold bg-gold text-black"
                  : "border-border bg-transparent text-muted-foreground hover:border-gold hover:text-gold"
              )}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>
      </SheetTrigger>
      
      <SheetContent className="bg-card text-foreground border-l border-border p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <SheetHeader className="p-0">
            <div className="flex items-center gap-3">
              <TrackTag track={session.track} size="md" />
              <LevelTag level={session.level} size="md" />
            </div>
            <SheetTitle className="text-2xl font-serif font-normal text-foreground mt-4 text-left">
              {session.title}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1 text-left uppercase tracking-wider font-mono">
              Day {session.day || 1} · {session.time} · {session.duration} · {session.stage}
            </SheetDescription>
          </SheetHeader>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">About Session</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {session.description || "In-depth review of layout primitives, structural design tokens, and frontend operational systems. Attend to inspect system capabilities."}
              </p>
            </div>

            {/* Speaker block inside Drawer */}
            <div className="bg-muted/30 p-4 border border-border">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Speaker Profiles</h4>
              <div className="flex gap-4 items-start">
                <div className="relative h-12 w-12 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-border">
                  {session.speakerAvatar ? (
                    <Image src={session.speakerAvatar} alt={session.speaker} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-stone-300 dark:bg-zinc-800 text-muted-foreground">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-foreground">{session.speaker}</h5>
                  <p className="text-xs text-muted-foreground">{session.speakerRole || "Design Lead"} at {session.speakerCompany || "Figma"}</p>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed italic">
                    {session.speakerBio || "Leading visual design interfaces, components and scalability programs at global organizations."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 mt-6 flex flex-col gap-3 bg-card shrink-0">
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-gold text-black font-bold text-xs uppercase tracking-wider rounded-none h-11"
              onClick={() => {
                telemetry.track("action", "Export Calendar Clicked from Sheet", { sessionId: session.id });
                window.open(getGoogleCalendarLink(), "_blank");
              }}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Calendar Export
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-none border-stone-400 text-xs font-bold uppercase tracking-wider h-11"
              onClick={handleBookmarkClick}
            >
              {saved ? "Remove Bookmark" : "Reserve Slot"}
            </Button>
          </div>
          <Button
            variant="secondary"
            className="w-full rounded-none border border-border text-xs font-bold uppercase tracking-wider h-11"
            asChild
            onClick={() => setSheetOpen(false)}
          >
            <Link href={`/session/${session.id}`}>
              View Ratings & Feedback
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
