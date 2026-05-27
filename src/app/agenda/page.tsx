"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getSessionsData, getUserBookmarks, toggleBookmarkAction } from "@/app/actions";
import { RelationalSession, detectConflicts, generateRecommendations, generateGoogleCalendarLink } from "@/features/agenda/agenda-engine";
import { Calendar, AlertTriangle, ArrowRight, Trash2, CalendarPlus, Sparkles, Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { telemetry } from "@/lib/telemetry";
import { PageTransition } from "@/animations/PageTransition";

export default function AgendaPage() {
  const { user, can } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  
  // Database states
  const [allSessions, setAllSessions] = useState<RelationalSession[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load schedule and bookmarks
  useEffect(() => {
    async function loadData() {
      try {
        const sessions = await getSessionsData();
        setAllSessions(sessions as RelationalSession[]);

        if (user) {
          const marks = await getUserBookmarks(user.id);
          setBookmarkedIds(marks.map((m) => m.sessionId as string));
        }
      } catch (err) {
        toast.error("Failed to load agenda data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Filter bookmarked sessions
  const savedSessions = allSessions.filter((s) => bookmarkedIds.includes(s.id));
  const currentDaySessions = savedSessions.filter((s) => s.day === selectedDay);

  // 1. Conflict detection calculation
  const conflicts = detectConflicts(savedSessions);
  const hasConflicts = Object.keys(conflicts).length > 0;

  // 2. Personalized recommendations calculation
  const interestsList = user?.interests?.split(",") || ["air", "water"];
  const recommendations = generateRecommendations(allSessions, bookmarkedIds, interestsList);

  // 3. Optimistic UI Bookmark deletion
  const handleRemoveBookmark = async (sessionId: string) => {
    if (!user) {
      toast.error("Authentication required.");
      return;
    }

    // Optimistic state updates
    const previous = [...bookmarkedIds];
    setBookmarkedIds((prev) => prev.filter((id) => id !== sessionId));

    try {
      telemetry.track("action", "Removed Session Bookmark", { sessionId });
      await toggleBookmarkAction(user.id, user.role, sessionId, false);
      toast.success("Session removed from your agenda");
    } catch (err: any) {
      // Revert state
      setBookmarkedIds(previous);
      toast.error(err.message || "Failed to modify bookmark");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-muted-foreground text-sm font-mono">Loading your custom agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-28 pb-20">
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3">
                Event Intelligence Layer
              </p>
              <h1 className="font-serif text-5xl font-normal text-foreground">My Agenda</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Verify overlapping timeslots, sync calendar links, and explore recommendation scoring.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Timeline controls */}
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border pb-6">
            <div className="flex gap-1 bg-secondary p-1 rounded-sm">
              <button
                onClick={() => setSelectedDay(1)}
                className={cn(
                  "px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm",
                  selectedDay === 1
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Day 1 · June 15
              </button>
              <button
                onClick={() => setSelectedDay(2)}
                className={cn(
                  "px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm",
                  selectedDay === 2
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Day 2 · June 16
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {savedSessions.length} total bookmarked sessions
              </p>
            </div>
          </div>

        {/* Conflict Warning Alerts */}
        {hasConflicts && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-start gap-4 border border-destructive/20 bg-destructive/5 p-6 rounded-md"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-bold text-destructive uppercase tracking-wider text-xs">
                Schedule Conflict Indicator
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-medium">
                You have multiple overlapping sessions scheduled on the same timeslot. We suggest choosing one session to balance occupancy loads.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main timeline listing */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Active Schedule Timeline
            </h2>

            <AnimatePresence mode="wait">
              {currentDaySessions.length > 0 ? (
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {currentDaySessions.map((session, index) => {
                    const isConflicting = !!conflicts[session.id];
                    return (
                      <motion.div
                        key={session.id}
                        layoutId={`session-${session.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "relative flex items-center justify-between border bg-card p-5 transition-all",
                          isConflicting ? "border-destructive/30 border-l-4 border-l-destructive" : "border-border hover:border-foreground"
                        )}
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {session.time} ({session.duration})
                            </span>
                            {isConflicting && (
                              <span className="bg-destructive/10 text-destructive text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-wider rounded-full">
                                Overlap
                              </span>
                            )}
                          </div>
                          <Link href={`/session/${session.id}`} className="block mt-2">
                            <h3 className="font-serif text-xl font-normal text-foreground hover:text-gold transition-colors">
                              {session.title}
                            </h3>
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {session.speaker?.name} · <span className="italic">{session.stage?.name}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Google Calendar export option */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Export to Google Calendar"
                            onClick={() => {
                              telemetry.track("action", "Export Calendar Clicked", { sessionId: session.id });
                              window.open(generateGoogleCalendarLink(session), "_blank");
                            }}
                          >
                            <CalendarPlus className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>

                          {/* Delete Bookmark */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBookmark(session.id)}
                            title="Remove session"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-border bg-card py-24 text-center rounded-sm">
                  <Calendar className="mb-4 h-10 w-10 text-muted-foreground/30" />
                  <h3 className="text-lg font-serif">No Sessions Reserved</h3>
                  <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                    Build your curriculum by adding tracks and speakers on the master schedule.
                  </p>
                  <Button variant="outline" size="sm" className="mt-6 border-foreground rounded-none" asChild>
                    <Link href="/schedule">Browse Schedule</Link>
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Recommendation column */}
          <div className="space-y-6">
            <div className="border border-border bg-card p-6 rounded-md">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-gold" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Personalized Curriculum Engine
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Suggested sessions aligning with your onboarding interests:{" "}
                <span className="font-mono text-foreground">{interestsList.join(", ")}</span>
              </p>

              <div className="space-y-4">
                {recommendations.map((session) => (
                  <div
                    key={session.id}
                    className="border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <h4 className="text-xs font-medium text-foreground leading-snug">
                      {session.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="text-[9px] font-bold uppercase px-2 py-0.5 text-white"
                        style={{ backgroundColor: `var(--${session.track})` }}
                      >
                        {session.track}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-[10px] font-bold text-gold hover:opacity-90"
                        asChild
                      >
                        <Link href={`/session/${session.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    You have reserved all matched interest sessions.
                  </p>
                )}
              </div>
            </div>

            {/* Quick action profile cards */}
            <div className="border border-border bg-card p-6 rounded-md">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Ticket Information
              </h3>
              <p className="text-sm font-semibold text-foreground">
                {user?.ticketType || "General Admission"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Valid for Main Entrance Check-in & all Stages.
              </p>
              <Button size="sm" variant="outline" className="w-full mt-4 rounded-none border-stone-400 hover:border-foreground" asChild>
                <Link href="/pass">View QR Pass</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
