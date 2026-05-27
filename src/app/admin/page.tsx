"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getSessionsData, getSpeakers, getStages, upsertSessionAction, deleteSessionAction } from "@/app/actions";
import { RelationalSession } from "@/features/agenda/agenda-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ShieldCheck, PlusCircle, Save, Database, Loader2, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { telemetry } from "@/lib/telemetry";
import { PageTransition } from "@/animations/PageTransition";
import { MetricsChart } from "@/components/charts/MetricsChart";
import { SentimentTracker } from "@/components/feedback/SentimentTracker";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user, can, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<RelationalSession[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  // Editor panel states
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDuration, setEditDuration] = useState("45 min");
  const [editTrack, setEditTrack] = useState<"air" | "water" | "fire" | "earth">("air");
  const [editLevel, setEditLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [editFormat, setEditFormat] = useState("Talk");
  const [editDay, setEditDay] = useState<number>(1);
  const [editSpeakerId, setEditSpeakerId] = useState("");
  const [editStageId, setEditStageId] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Load database sessions, speakers, stages
  const loadCMSData = async () => {
    try {
      const sess = await getSessionsData();
      setSessions(sess as RelationalSession[]);

      const spks = await getSpeakers();
      setSpeakers(spks);

      const stgs = await getStages();
      setStages(stgs);
    } catch (err) {
      toast.error("Failed to sync database schemas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMSData();
  }, []);

  // All hooks declared above — now safe to conditionally render
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // Enforce access control guard (after all hooks)
  if (!user || !can("cms:write")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <Settings className="mx-auto h-12 w-12 text-zinc-400 animate-spin" />
          <h2 className="mt-4 text-2xl font-serif text-foreground">Access Denied</h2>
          <p className="mt-2 text-muted-foreground max-w-sm text-sm">
            Organizer privileges are required. Switch roles using the switcher in the header to view administrative consoles.
          </p>
        </div>
      </div>
    );
  }

  const handleSelectSession = (session: RelationalSession) => {
    setIsCreatingNew(false);
    setSelectedSession(session);
    setEditTitle(session.title);
    setEditDescription(session.description || "");
    setEditTime(session.time);
    setEditDuration(session.duration);
    setEditTrack(session.track);
    setEditLevel(session.level);
    setEditFormat(session.format);
    setEditDay(session.day);
    setEditSpeakerId(session.speakerId || "");
    setEditStageId(session.stageId || "");
  };

  const handleCreateTrigger = () => {
    setIsCreatingNew(true);
    setSelectedSession(null);
    setEditTitle("");
    setEditDescription("");
    setEditTime("10:30 AM");
    setEditDuration("45 min");
    setEditTrack("air");
    setEditLevel("beginner");
    setEditFormat("Talk");
    setEditDay(1);
    setEditSpeakerId(speakers[0]?.id || "");
    setEditStageId(stages[0]?.id || "");
  };

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editTime) {
      toast.warning("Title and timeslot are required.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          id: isCreatingNew ? undefined : selectedSession?.id,
          title: editTitle,
          description: editDescription,
          track: editTrack,
          level: editLevel,
          time: editTime,
          duration: editDuration,
          stageId: editStageId,
          speakerId: editSpeakerId,
          format: editFormat,
          day: editDay,
        };

        telemetry.track("action", isCreatingNew ? "Created Session Schema" : "Updated Session Schema", {
          title: editTitle,
        });

        await upsertSessionAction(user.role, payload);
        toast.success(isCreatingNew ? "Curriculum session created!" : "Session changes committed!", {
          description: "Database synced successfully on disk local.db.",
        });

        // Reset and reload
        setSelectedSession(null);
        setIsCreatingNew(false);
        setLoading(true);
        await loadCMSData();
      } catch (err: any) {
        toast.error(err.message || "Failed to commit session modifications.");
      }
    });
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    startTransition(async () => {
      try {
        telemetry.track("action", "Deleted Session Schema", { sessionId: id });
        await deleteSessionAction(user.role, id);
        toast.success("Session deleted successfully.");
        setSelectedSession(null);
        setLoading(true);
        await loadCMSData();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete session.");
      }
    });
  };

  // Compile sentiment analysis comments from feedback
  const feedbackList = sessions.flatMap((s: any) => 
    (s.feedback || []).map((fb: any) => ({
      text: fb.comment || "",
      sentiment: fb.sentiment || "neutral",
      rating: fb.rating
    }))
  );

  const posCount = feedbackList.filter(f => f.sentiment === "positive").length;
  const neuCount = feedbackList.filter(f => f.sentiment === "neutral").length;
  const negCount = feedbackList.filter(f => f.sentiment === "negative").length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-28 pb-20 text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">SaaS Command Panel</span>
              </div>
              <h1 className="font-serif text-5xl font-normal mt-2">Designare OS CMS</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-tenant configuration cockpit, live database records, and attendee metrics.
              </p>
            </div>
            <div>
              <Button 
                onClick={handleCreateTrigger}
                className="bg-gradient-gold text-black font-bold text-xs uppercase tracking-wider rounded-none h-11 px-5"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Analytics Graphs row */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card p-6 md:col-span-2">
                  <MetricsChart
                    title="Real-Time Ticket Sales Index"
                    dataPoints={[28, 45, 62, 58, 88, 110, 145]}
                    labels={["10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "NOW"]}
                  />
                </Card>

                <Card className="border-border bg-card p-6 flex flex-col justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    System Vital Indices
                  </h3>
                  <ul className="space-y-3 text-xs">
                    <li className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Active Conferences</span>
                      <span className="font-mono font-bold text-foreground">1 (OS Conf)</span>
                    </li>
                    <li className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Total Sessions Configured</span>
                      <span className="font-mono font-bold text-foreground">{sessions.length}</span>
                    </li>
                    <li className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Active Stages</span>
                      <span className="font-mono font-bold text-foreground">{stages.length}</span>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span className="text-muted-foreground">Connected Speakers</span>
                      <span className="font-mono font-bold text-foreground">{speakers.length}</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Layout Content row */}
              <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Column 1 & 2: Curriculum Listing */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Curriculum Sessions database</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Click any record to load in editor panel, edit fields, or delete rows.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => handleSelectSession(session)}
                          className={cn(
                            "flex items-center justify-between p-4 border bg-muted/10 hover:bg-muted/30 cursor-pointer transition-colors",
                            selectedSession?.id === session.id ? "border-gold bg-muted/30" : "border-border"
                          )}
                        >
                          <div>
                            <span className="text-[9px] font-bold uppercase text-gold tracking-wider block">
                              Day {session.day} · {session.time} · {session.duration} · Stage: {session.stage?.name || "Venue"}
                            </span>
                            <h4 className="text-sm font-bold text-foreground mt-1">{session.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-lg truncate">
                              {session.description || "No description provided."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSession(session);
                              }}
                            >
                              <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border">
                          No sessions in database. Click "Create Session" to add one.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Column 3: Edit overrides forms & feedback streams */}
                <div className="space-y-6">
                  
                  {/* Override Form */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Database className="h-4 w-4 text-gold" />
                        {isCreatingNew ? "Create Database Record" : "Database Field Overrides"}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {isCreatingNew ? "Configure details for a new session ledger row." : "Modify properties of the active database model."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedSession || isCreatingNew ? (
                        <form onSubmit={handleSaveCMS} className="space-y-4 text-foreground">
                          {!isCreatingNew && (
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Session ID</label>
                              <Input
                                value={selectedSession.id}
                                disabled
                                className="bg-muted text-muted-foreground cursor-not-allowed rounded-none text-xs"
                              />
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Session Title</label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="rounded-none focus:border-foreground text-xs"
                              placeholder="e.g. Scaling Systems"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Timeslot</label>
                              <Input
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="rounded-none focus:border-foreground text-xs"
                                placeholder="9:00 AM"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Duration</label>
                              <Input
                                value={editDuration}
                                onChange={(e) => setEditDuration(e.target.value)}
                                className="rounded-none focus:border-foreground text-xs"
                                placeholder="45 min"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Track</label>
                              <Select value={editTrack} onValueChange={(val: any) => setEditTrack(val)}>
                                <SelectTrigger className="rounded-none text-xs bg-card border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground">
                                  <SelectItem value="air">Air</SelectItem>
                                  <SelectItem value="water">Water</SelectItem>
                                  <SelectItem value="fire">Fire</SelectItem>
                                  <SelectItem value="earth">Earth</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Level</label>
                              <Select value={editLevel} onValueChange={(val: any) => setEditLevel(val)}>
                                <SelectTrigger className="rounded-none text-xs bg-card border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground">
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Day Cycle</label>
                              <Select value={String(editDay)} onValueChange={(val) => setEditDay(Number(val))}>
                                <SelectTrigger className="rounded-none text-xs bg-card border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-foreground">
                                  <SelectItem value="1">Day 1 (June 15)</SelectItem>
                                  <SelectItem value="2">Day 2 (June 16)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Format</label>
                              <Input
                                value={editFormat}
                                onChange={(e) => setEditFormat(e.target.value)}
                                className="rounded-none focus:border-foreground text-xs"
                                placeholder="Talk, Keynote..."
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Assign Speaker</label>
                            <Select value={editSpeakerId} onValueChange={(val) => setEditSpeakerId(val)}>
                              <SelectTrigger className="rounded-none text-xs bg-card border-border">
                                <SelectValue placeholder="Select speaker..." />
                              </SelectTrigger>
                              <SelectContent className="bg-card text-foreground">
                                {speakers.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.company})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Assign Stage</label>
                            <Select value={editStageId} onValueChange={(val) => setEditStageId(val)}>
                              <SelectTrigger className="rounded-none text-xs bg-card border-border">
                                <SelectValue placeholder="Select stage..." />
                              </SelectTrigger>
                              <SelectContent className="bg-card text-foreground">
                                {stages.map((st) => (
                                  <SelectItem key={st.id} value={st.id}>{st.name} (Cap: {st.capacity})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                            <Textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="rounded-none focus:border-foreground min-h-[80px] text-xs"
                              placeholder="Describe the session objectives..."
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              type="submit" 
                              disabled={isPending}
                              className="flex-1 bg-gradient-gold text-black font-bold hover:opacity-90 rounded-none text-xs uppercase tracking-wider h-11"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-none border-stone-400 text-xs font-bold uppercase tracking-wider h-11"
                              onClick={() => {
                                setSelectedSession(null);
                                setIsCreatingNew(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-20 text-muted-foreground text-xs leading-relaxed border border-dashed border-border p-4">
                          Select a session card or click "Create Session" in the header to modify database records without redeploying code.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sentiment Tracker Card */}
                  <Card className="border-border bg-card p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">
                      Attendee Sentiment Analysis
                    </h3>
                    <SentimentTracker
                      positiveCount={posCount}
                      neutralCount={neuCount}
                      negativeCount={negCount}
                      comments={feedbackList.slice(0, 5)}
                    />
                  </Card>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
