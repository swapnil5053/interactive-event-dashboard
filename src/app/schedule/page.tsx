"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SessionCard, type Session } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { TrackTag, type TrackType } from "@/components/TrackTag";
import { LevelTag, type LevelType } from "@/components/LevelTag";
import { Clock, AlertTriangle, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSessionsData, getUserBookmarks } from "@/app/actions";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { PageTransition } from "@/animations/PageTransition";

const trackOptions: TrackType[] = ["air", "water", "fire", "earth"];
const levelOptions: LevelType[] = ["beginner", "intermediate", "advanced"];
const formatOptions = ["Keynote", "Talk", "Workshop", "Panel", "Case Study"];

export default function SchedulePage() {
  const { user } = useAuth();
  
  // States
  const [dbSessions, setDbSessions] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<TrackType | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<LevelType | "all">("all");
  const [selectedFormat, setSelectedFormat] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch db items
  useEffect(() => {
    async function loadData() {
      try {
        const sessions = await getSessionsData();
        setDbSessions(sessions);
        
        if (user) {
          const marks = await getUserBookmarks(user.id);
          setBookmarkedIds(marks.map((m) => m.sessionId as string));
        }
      } catch (err) {
        toast.error("Failed to sync curriculum schedule.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Map db sessions to SessionCard models
  const mappedSessions = useMemo(() => {
    return dbSessions.map((s) => ({
      id: s.id,
      title: s.title,
      track: s.track,
      level: s.level,
      time: s.time,
      duration: s.duration,
      stage: s.stage?.name || "Main Venue",
      speaker: s.speaker?.name || "Speaker Panel",
      speakerRole: s.speaker?.role || "",
      speakerCompany: s.speaker?.company || "",
      speakerBio: s.speaker?.bio || "",
      speakerAvatar: s.speaker?.avatar || "",
      format: s.format,
      day: s.day,
      description: s.description || "",
    }));
  }, [dbSessions]);

  const currentDaySessions = useMemo(() => {
    return mappedSessions.filter((s) => s.day === selectedDay);
  }, [mappedSessions, selectedDay]);

  const filteredSessions = useMemo(() => {
    return currentDaySessions.filter((session) => {
      if (selectedTrack !== "all" && session.track !== selectedTrack) return false;
      if (selectedLevel !== "all" && session.level !== selectedLevel) return false;
      if (selectedFormat !== "all" && session.format !== selectedFormat) return false;
      if (
        searchQuery &&
        !session.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.speaker.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [currentDaySessions, selectedTrack, selectedLevel, selectedFormat, searchQuery]);

  const happeningNow = useMemo(() => {
    return mappedSessions.find(s => s.day === selectedDay && s.format === "Keynote") || mappedSessions[0];
  }, [mappedSessions, selectedDay]);

  const handleBookmarkStateChange = (id: string, active: boolean) => {
    setBookmarkedIds((prev) =>
      active ? [...prev, id] : prev.filter((bookmarkId) => bookmarkId !== id)
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-muted-foreground text-sm font-mono">Syncing curriculum ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20 pt-24">
        <section className="border-b border-border mb-12">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-4">Curriculum Ledger</p>
              <h1 className="font-serif text-5xl font-normal text-foreground">The Schedule</h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
                Explore two days of intensive design learning. Filter by track, level, or format to build your custom curriculum.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-16 lg:flex-row">
            <aside className="lg:w-72 lg:shrink-0">
              <div className="sticky top-28 space-y-10">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Day</p>
                  <div className="flex p-1 bg-secondary rounded-sm">
                    <button
                      onClick={() => setSelectedDay(1)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm",
                        selectedDay === 1
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Day 1
                    </button>
                    <button
                      onClick={() => setSelectedDay(2)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm",
                        selectedDay === 2
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Day 2
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="text"
                      placeholder="Keywords, speakers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-border bg-card py-3 pl-10 pr-4 text-sm transition-all focus:border-foreground focus:outline-none rounded-none text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Track</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTrack("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none",
                        selectedTrack === "all"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      All
                    </button>
                    {trackOptions.map((track) => (
                      <button
                        key={track}
                        onClick={() => setSelectedTrack(track)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none",
                          selectedTrack === track
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        )}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Level</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedLevel("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none",
                        selectedLevel === "all"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      All
                    </button>
                    {levelOptions.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none",
                          selectedLevel === level
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Format</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedFormat("all")}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none",
                        selectedFormat === "all"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      )}
                    >
                      All
                    </button>
                    {formatOptions.map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all rounded-none",
                          selectedFormat === format
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        )}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedDay}-${selectedTrack}-${selectedLevel}-${selectedFormat}-${searchQuery}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {happeningNow && (
                    <div className="mb-12 space-y-4">
                      <div className="flex items-center gap-6 border-l-2 border-foreground bg-card p-6 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-foreground rounded-sm">
                          <Clock className="h-5 w-5 text-background" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Keynote discovered</span>
                          <p className="mt-1 text-lg font-medium text-foreground">
                            {happeningNow.title} <span className="mx-3 text-border">|</span> <span className="text-muted-foreground">{happeningNow.stage}</span>
                          </p>
                        </div>
                        <div
                          className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-none bg-gold"
                        >
                          {happeningNow.track}
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4 border border-border bg-stone-200/50 dark:bg-stone-900/35 p-4 text-sm"
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
                        <p className="text-muted-foreground font-medium">
                          <strong className="text-foreground">Schedule Notice:</strong> Sessions room loads are monitored in real time. Reserving slots balances occupancy metrics.
                        </p>
                      </motion.div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          isBookmarkedInitial={bookmarkedIds.includes(session.id)}
                          onBookmarkChange={handleBookmarkStateChange}
                          className="border-border bg-card hover:border-gold/25 transition-all rounded-none"
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-card border border-border py-32 text-center">
                        <Search className="mb-6 h-12 w-12 text-muted-foreground/20" />
                        <h3 className="text-xl font-serif text-foreground">No matches found</h3>
                        <p className="mt-2 text-muted-foreground max-w-xs">Try adjusting your filters or search terms to find sessions.</p>
                        <button
                          onClick={() => {
                            setSelectedTrack("all");
                            setSelectedLevel("all");
                            setSelectedFormat("all");
                            setSearchQuery("");
                          }}
                          className="mt-8 text-sm font-bold uppercase tracking-widest text-foreground underline underline-offset-8 decoration-border hover:decoration-foreground transition-all"
                        >
                          Reset all filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
