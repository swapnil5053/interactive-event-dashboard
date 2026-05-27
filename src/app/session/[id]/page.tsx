"use client";

import { use, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Calendar, ArrowLeft, Share2, Bookmark, BookmarkCheck, CheckCircle, Star, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { getSessionById, toggleBookmarkAction, submitFeedbackAction, getUserBookmarks } from "@/app/actions";
import { TrackTag } from "@/components/TrackTag";
import { LevelTag } from "@/components/LevelTag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/animations/PageTransition";
import { telemetry } from "@/lib/telemetry";

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Database loaded states
  const [session, setSession] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feedback Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load Session and user bookmarks
  useEffect(() => {
    async function loadData() {
      try {
        const sess = await getSessionById(id);
        setSession(sess);

        if (user) {
          const marks = await getUserBookmarks(user.id);
          const isSaved = marks.some((m) => m.sessionId === id);
          setSaved(isSaved);
        }
      } catch (err) {
        toast.error("Failed to load session details from database.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  const handleSave = () => {
    if (!user) {
      toast.warning("Authentication required.", {
        description: "Switch to attendee/organizer role inside sandbox dropdown to bookmark.",
      });
      return;
    }

    const nextState = !saved;
    setSaved(nextState);

    startTransition(async () => {
      try {
        telemetry.track("action", nextState ? "Bookmarked Session Details" : "Unbookmarked Session Details", { sessionId: id });
        await toggleBookmarkAction(user.id, user.role, id, nextState);
        toast.success(nextState ? "Saved to My Agenda" : "Removed from My Agenda");
      } catch (err) {
        setSaved(!nextState);
        toast.error("Failed to update bookmark.");
      }
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    telemetry.track("action", "Shared Session Link", { sessionId: id });
    toast.success("Link copied to clipboard");
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Authentication required.", {
        description: "Switch roles using the Sandbox switcher to leave feedback.",
      });
      return;
    }

    if (!comment.trim()) {
      toast.warning("Please write a short comment.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      telemetry.track("action", "Submitted Session Feedback", { sessionId: id, rating });
      const result = await submitFeedbackAction(user.id, user.role, id, rating, comment);
      
      toast.success("Feedback submitted successfully!", {
        description: `Sentiment analyzed: ${result.sentiment.toUpperCase()}`,
      });

      // Reload session details to show the updated feedback logs
      const updatedSess = await getSessionById(id);
      setSession(updatedSess);
      setComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center font-mono text-sm text-muted-foreground">
          <Loader2 className="animate-spin h-6 w-6 mx-auto text-gold mb-4" />
          Querying session metadata...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-serif">Session Not Found</h2>
          <p className="text-muted-foreground mt-2">Could not locate session with ID: {id}</p>
          <Button variant="outline" className="mt-6 rounded-none" asChild>
            <Link href="/schedule">Back to Schedule</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const feedbackList = session.feedback || [];
  const averageRating = feedbackList.length > 0 
    ? (feedbackList.reduce((acc: number, f: any) => acc + f.rating, 0) / feedbackList.length).toFixed(1)
    : "No ratings yet";

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-28 sm:px-6 lg:px-8 bg-background text-foreground">
        
        <Link
          href="/schedule"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to schedule
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <TrackTag track={session.track} size="md" />
          <LevelTag level={session.level} size="md" />
          <span className="rounded-none border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {session.format}
          </span>
        </div>

        <h1 className="font-serif text-3xl font-normal text-foreground sm:text-5xl leading-tight">
          {session.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Day {session.day} · June {session.day === 2 ? "16" : "15"}, 2026
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {session.time} ({session.duration})
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {session.stage?.name || "Main Venue"}
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={handleSave}
            className={saved ? "bg-stone-800 text-stone-100 hover:bg-stone-700 rounded-none h-12 px-6" : "bg-gradient-gold text-black font-bold hover:opacity-90 rounded-none h-12 px-6"}
          >
            {saved ? (
              <>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                Saved to Agenda
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-4 w-4" />
                Save to My Agenda
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" className="rounded-none border-stone-400 hover:border-foreground h-12 px-6" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>

        <div className="mt-12 space-y-12">
          {/* About section */}
          <section>
            <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">About this session</h2>
            <p className="leading-relaxed text-muted-foreground text-sm">
              {session.description || "Explore advanced tokenized styling paradigms, clean component-driven interfaces, and transactional database logic syncing across server modules. Attendees will run local.db checks directly inside development consoles."}
            </p>
          </section>

          {/* Speaker details block */}
          {session.speaker && (
            <section className="rounded-none border border-border bg-card p-6">
              <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Speaker Biography</h2>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-200 border border-border">
                  {session.speaker.avatar ? (
                    <Image
                      src={session.speaker.avatar}
                      alt={session.speaker.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{session.speaker.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {session.speaker.role} at {session.speaker.company}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground italic">
                    {session.speaker.bio || "Leading scalable technology designs and interface development strategies at global software teams."}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Live Review Feed & Interactive Submission Form */}
          <section className="border-t border-border pt-10 grid gap-10 md:grid-cols-2">
            
            {/* Column 1: Ratings & Review Feed */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Attendee Reviews & Ratings</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-mono font-bold text-foreground">{averageRating}</span>
                  <span className="text-xs text-muted-foreground">average from {feedbackList.length} reviews</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {feedbackList.map((f: any) => (
                  <div key={f.id} className="p-4 border border-border bg-card/45 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < f.rating ? "fill-gold text-gold" : "text-stone-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 tracking-wider ${
                        f.sentiment === "positive" 
                          ? "bg-emerald-950 text-emerald-300" 
                          : f.sentiment === "negative" 
                          ? "bg-rose-950 text-rose-300" 
                          : "bg-blue-950 text-blue-300"
                      }`}>
                        {f.sentiment}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">"{f.comment}"</p>
                    <span className="text-[9px] text-zinc-500 font-mono block">By: {f.user?.name || "Anonymous"}</span>
                  </div>
                ))}
                {feedbackList.length === 0 && (
                  <div className="text-center py-10 border border-border border-dashed text-xs text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 opacity-25 mb-2" />
                    No reviews published. Be the first to rate!
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Interactive review creation */}
            <div className="bg-card p-6 border border-border flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Rate this Curriculum</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-6">Your scores determine SaaS occupancy recommendations.</p>
                
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Rating Score</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              s <= rating ? "fill-gold text-gold" : "text-stone-300 hover:text-gold"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Comments</label>
                    <Textarea
                      placeholder="Write your session review here (e.g. Clean design tools, excellent talk...)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="rounded-none focus:border-foreground min-h-[90px] text-foreground text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full bg-foreground text-background hover:bg-foreground/95 rounded-none font-bold uppercase tracking-wider text-xs h-11"
                  >
                    Submit Review
                  </Button>
                </form>
              </div>
            </div>

          </section>

        </div>
      </div>
    </PageTransition>
  );
}

function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
