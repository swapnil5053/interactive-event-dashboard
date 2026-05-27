"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useLive } from "@/providers/live-provider";
import { eventTransport } from "@/lib/event-transport";
import { telemetry, TelemetryEvent } from "@/lib/telemetry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Users, Radio, Terminal, Send, Play, RefreshCw, BarChart } from "lucide-react";
import { toast } from "sonner";
import { publishAnnouncementAction } from "@/app/actions";
import { PageTransition } from "@/animations/PageTransition";
import { cn } from "@/lib/utils";

export default function OpsPage() {
  const { user, can, loading: authLoading } = useAuth();
  const { isLiveMode, setIsLiveMode, announcements, publishAnnouncement, occupancy, virtualTime } = useLive();
  const [isPending, startTransition] = useTransition();

  const [ancTitle, setAncTitle] = useState("");
  const [ancMessage, setAncMessage] = useState("");
  const [ancCategory, setAncCategory] = useState<"info" | "emergency" | "schedule">("info");
  
  // Real-time telemetry feed logs
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryEvent[]>([]);
  const [simulatedCheckins, setSimulatedCheckins] = useState(1485);
  
  // Crowd flow simulator grid nodes
  const [gridNodes, setGridNodes] = useState<number[]>([]);

  // Enforce access control guard (after all hooks)
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user || !can("ops:read")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive animate-pulse" />
          <h2 className="mt-4 text-2xl font-serif text-foreground">Access Denied</h2>
          <p className="mt-2 text-muted-foreground max-w-sm text-sm">
            The Command Center requires Organizer credentials. Use the authorization switcher in the navigation bar to swap roles.
          </p>
        </div>
      </div>
    );
  }

  // Load telemetry logs on mount
  useEffect(() => {
    setTelemetryLogs(telemetry.getLogs());

    const handleTelemetryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<TelemetryEvent>;
      if (customEvent.detail) {
        setTelemetryLogs((prev) => [customEvent.detail, ...prev].slice(0, 50));
      }
    };

    window.addEventListener("designare_telemetry_event", handleTelemetryEvent);
    return () => window.removeEventListener("designare_telemetry_event", handleTelemetryEvent);
  }, []);

  // Initialize crowd flow nodes
  useEffect(() => {
    const nodes = Array.from({ length: 64 }, () => Math.floor(Math.random() * 100));
    setGridNodes(nodes);

    const interval = setInterval(() => {
      setGridNodes((prev) =>
        prev.map((val) => {
          const shift = Math.floor((Math.random() - 0.5) * 15);
          const next = val + shift;
          return Math.max(10, Math.min(100, next));
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle || !ancMessage) {
      toast.warning("Title and announcement message are required.");
      return;
    }

    startTransition(async () => {
      try {
        // Save to SQLite database via server action
        await publishAnnouncementAction(user.role, ancTitle, ancMessage, ancCategory, true);

        // Publish to provider (saving to client schema + triggering eventTransport channels)
        publishAnnouncement(ancTitle, ancMessage, ancCategory, true);
        
        // Broadcast via event transport layer
        eventTransport.publish("announcements", {
          title: ancTitle,
          message: ancMessage,
          category: ancCategory,
          timestamp: Date.now(),
        });

        setAncTitle("");
        setAncMessage("");
        toast.success("Operational alert broadcast successfully!");
      } catch (err: any) {
        toast.error("Failed to publish announcement database record.");
      }
    });
  };

  const handleSimulateCheckin = () => {
    setSimulatedCheckins((prev) => prev + 1);
    
    // Fire real-time transport event
    eventTransport.publish("checkins", {
      timestamp: Date.now(),
      attendeesCount: simulatedCheckins + 1,
    });

    telemetry.track("action", "Simulated NFC Checkin", {
      location: "Main Gate",
      totalCount: simulatedCheckins + 1,
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0C] text-[#F4F4F0] pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-850 pb-8 mb-10">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                  Ops System Active
                </span>
              </div>
              <h1 className="font-serif text-5xl font-normal mt-2">Command Center</h1>
              <p className="text-sm text-zinc-400 mt-1">
                Mission-critical event infrastructure operations and telemetry tracking logs.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-none text-right">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">
                  Simulated Clock
                </span>
                <span className="font-mono text-xs font-bold text-zinc-300">
                  {isLiveMode ? virtualTime : "PAUSED"}
                </span>
              </div>
              <Button
                className={cn(
                  "h-12 px-6 rounded-none font-bold uppercase tracking-wider text-xs",
                  isLiveMode 
                    ? "bg-rose-900/40 text-rose-300 border border-rose-800 hover:bg-rose-900/60" 
                    : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                )}
                onClick={() => setIsLiveMode(!isLiveMode)}
              >
                <Play className="h-4 w-4 mr-2" />
                {isLiveMode ? "Halt Simulation" : "Start Time Ticker"}
              </Button>
            </div>
          </div>

          {/* Top summary cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Check-Ins</CardTitle>
                <Users className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold">{simulatedCheckins}</div>
                <p className="text-[10px] text-zinc-500 mt-1">NFC Reader: Gate 1-4 active</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Time Dial Speed</CardTitle>
                <Activity className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold">1 min / tick</div>
                <p className="text-[10px] text-zinc-500 mt-1">Status: Normal scheduling</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Average Capacity</CardTitle>
                <BarChart className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold">57%</div>
                <p className="text-[10px] text-zinc-500 mt-1">Stages load index optimal</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Simulation Controls</CardTitle>
                <RefreshCw className="h-4 w-4 text-gold" />
              </CardHeader>
              <CardContent className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-none text-xs font-bold uppercase tracking-wider bg-zinc-950"
                  onClick={handleSimulateCheckin}
                >
                  Scan Ticket Pass
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Core Layout */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Column 1: Live Broadcast Center */}
            <div className="space-y-6">
              <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-rose-500 animate-pulse" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Broadcast Center</CardTitle>
                  </div>
                  <CardDescription className="text-zinc-500 text-xs">
                    Issue live schedule warnings instantly to SQLite tables and attendee views.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBroadcast} className="space-y-4 text-zinc-850">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Alert Heading</label>
                      <Input
                        placeholder="e.g. Schedule Update"
                        value={ancTitle}
                        onChange={(e) => setAncTitle(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 text-zinc-100 rounded-none focus:border-zinc-500 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
                      <Select
                        value={ancCategory}
                        onValueChange={(val: any) => setAncCategory(val)}
                      >
                        <SelectTrigger className="bg-zinc-950 border-zinc-850 text-zinc-100 rounded-none focus:border-zinc-500 text-xs">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <SelectItem value="info">Information Broadcast</SelectItem>
                          <SelectItem value="schedule">Schedule Shifting</SelectItem>
                          <SelectItem value="emergency">EMERGENCY WARNING</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Message Description</label>
                      <Textarea
                        placeholder="Enter announcement description..."
                        value={ancMessage}
                        onChange={(e) => setAncMessage(e.target.value)}
                        className="bg-zinc-950 border-zinc-850 text-zinc-100 rounded-none focus:border-zinc-500 min-h-[80px] text-xs"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="w-full bg-gradient-gold text-black font-bold uppercase tracking-wider text-xs rounded-none h-11"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Transmit Broadcast
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Stages occupancy capacity */}
              <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Stage Occupancy Loads</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">Simulating active load verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.keys(occupancy).map((key) => {
                    const stage = occupancy[key];
                    const percentage = Math.round((stage.current / stage.capacity) * 100);
                    const color = key === "stg_air" ? "bg-[var(--air)]" : key === "stg_water" ? "bg-[var(--water)]" : key === "stg_fire" ? "bg-[var(--fire)]" : "bg-[var(--earth)]";
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-300">
                            {key === "stg_air" ? "Air Stage" : key === "stg_water" ? "Water Stage" : key === "stg_fire" ? "Fire Stage" : "Earth Studio"}
                          </span>
                          <span className="font-mono text-zinc-400">
                            {stage.current} / {stage.capacity} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-950 overflow-hidden">
                          <div
                            className={`h-full ${color} transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Crowd concentration heatmaps */}
            <div className="space-y-6">
              <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Crowd Flow Heatmap Grid</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Virtual sensors mapping attendee concentrations inside main facility areas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 bg-zinc-950 p-3 border border-zinc-800">
                    {gridNodes.map((val, idx) => {
                      let bg = "bg-zinc-905";
                      if (val > 80) bg = "bg-rose-950/80 text-rose-300";
                      else if (val > 60) bg = "bg-amber-950/70 text-amber-300";
                      else if (val > 30) bg = "bg-emerald-950/60 text-emerald-300";
                      else bg = "bg-zinc-900/50 text-zinc-500";
                      
                      return (
                        <div
                          key={idx}
                          className={`aspect-square flex items-center justify-center text-[8px] font-mono font-bold ${bg} transition-colors duration-1000`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-zinc-900 border border-zinc-800" />
                      <span>Lobby</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-emerald-950" />
                      <span>Optimal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-amber-950" />
                      <span>Busy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 bg-rose-950" />
                      <span>Overload</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 rounded-none">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Recent Announcements</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">Operational channel broadcast history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                  {announcements.map((anc) => (
                    <div
                      key={anc.id}
                      className="bg-zinc-950 border border-zinc-850 p-3 space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5",
                          anc.category === "emergency" ? "bg-rose-950 text-rose-300" : anc.category === "schedule" ? "bg-amber-950 text-amber-300" : "bg-blue-950 text-blue-300"
                        )}>
                          {anc.category}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {new Date(anc.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200">{anc.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-snug">{anc.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Realtime Telemetry logs terminal */}
            <div>
              <Card className="bg-zinc-900/40 border-zinc-850 text-zinc-100 h-full flex flex-col rounded-none">
                <CardHeader className="shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-gold" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">Telemetry Stream Logs</CardTitle>
                  </div>
                  <CardDescription className="text-zinc-500 text-xs">
                    Real-time click events and navigation traces triggered in client browser views.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4 pt-0">
                  <div className="flex-1 bg-black border border-zinc-800 p-3 rounded-none font-mono text-[9px] text-emerald-400 overflow-y-auto space-y-2 max-h-[500px]">
                    {telemetryLogs.map((log) => (
                      <div key={log.id} className="leading-relaxed border-b border-zinc-900/40 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-zinc-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                        <span className="text-gold">[{log.type.toUpperCase()}]</span>{" "}
                        <span className="text-zinc-200 font-semibold">{log.name}</span>
                        {log.properties && (
                          <div className="text-zinc-400 pl-4 mt-0.5 text-[9px]">
                            {JSON.stringify(log.properties)}
                          </div>
                        )}
                        {log.durationMs && (
                          <span className="text-amber-500 text-[8px] ml-2">({log.durationMs}ms)</span>
                        )}
                      </div>
                    ))}
                    {telemetryLogs.length === 0 && (
                      <p className="text-zinc-650 text-center py-10 italic">Awaiting telemetry logs...</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 text-xs font-bold uppercase tracking-wider rounded-none shrink-0 bg-zinc-950"
                    onClick={() => {
                      telemetry.clearLogs();
                      setTelemetryLogs([]);
                    }}
                  >
                    Clear Logs console
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
