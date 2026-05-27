"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { registerAttendeeAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { telemetry } from "@/lib/telemetry";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/animations/PageTransition";

const tracks = [
  { id: "air", name: "Air Track", desc: "Systems thinking, design strategy, operations." },
  { id: "water", name: "Water Track", desc: "User experience, branding, motion stories." },
  { id: "fire", name: "Fire Track", desc: "AI tools, generative UI, innovation limits." },
  { id: "earth", name: "Earth Track", desc: "Craft excellence, execution, detailed assets." },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAs } = useAuth();

  const [step, setStep] = useState(1);
  
  // Registration data from search parameters or fallback inputs
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  
  // Selections
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [ticketTier, setTicketTier] = useState("Full Conference Pass");
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id") || `usr_${Math.random().toString(36).substring(2, 10)}`;
    const mail = searchParams.get("email") || "";
    const nm = searchParams.get("name") || "";
    
    setUserId(id);
    setEmail(mail);
    setName(nm);
  }, [searchParams]);

  const toggleTrack = (trackId: string) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const handleNextStep = () => {
    if (step === 1 && selectedTracks.length === 0) {
      toast.warning("Please select at least one track interest.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      telemetry.track("action", "Completed Onboarding Wizard", {
        userId,
        selectedTracks,
        ticketTier,
      });

      // Execute server action saving configuration to SQLite on-disk
      await registerAttendeeAction({
        id: userId,
        name,
        email,
        interests: selectedTracks.join(","),
        ticketType: ticketTier,
      });

      // Complete authentication context
      loginAs("attendee");
      
      toast.success("Profile Onboarding Completed!", {
        description: "Welcome to Designare OS.",
      });

      router.push("/agenda");
    } catch (err) {
      toast.error("Failed to complete onboarding.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-xl">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 px-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Profile Creation Wizard
          </span>
          <span className="text-xs font-mono font-semibold text-foreground">
            Step {step} of 2
          </span>
        </div>

        {step === 1 ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-serif text-3xl font-normal text-foreground">
                Select Track Paths
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select the design disciplines you want personalized session recommendations for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {tracks.map((track) => {
                  const active = selectedTracks.includes(track.id);
                  return (
                    <div
                      key={track.id}
                      onClick={() => toggleTrack(track.id)}
                      className={cn(
                        "p-4 border cursor-pointer transition-all flex flex-col justify-between hover:border-foreground",
                        active ? "border-foreground bg-muted/20" : "border-border"
                      )}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {track.id}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground mt-1">{track.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{track.desc}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        {active ? (
                          <CheckCircle2 className="h-4 w-4 text-gold" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-border" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full bg-foreground text-background hover:bg-foreground/95 rounded-none font-bold uppercase tracking-wider text-xs h-11"
              >
                Choose Ticket Category
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-serif text-3xl font-normal text-foreground">
                Confirm Admission Tier
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Confirm your visual pass check-in details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { tier: "Full Conference Pass", desc: "Access to Day 1 & 2 stages, lanyards, and networking." },
                  { tier: "VIP Platinum Access", desc: "Front row seating, speaker dinings, and dedicated workshops." },
                  { tier: "Sponsor Representative", desc: "Corporate booth control access permissions." }
                ].map((item) => (
                  <div
                    key={item.tier}
                    onClick={() => setTicketTier(item.tier)}
                    className={cn(
                      "p-4 border cursor-pointer transition-all hover:border-foreground",
                      ticketTier === item.tier ? "border-foreground bg-muted/20" : "border-border"
                    )}
                  >
                    <h4 className="text-sm font-semibold text-foreground">{item.tier}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-none text-xs font-bold uppercase tracking-wider h-11"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  disabled={completing}
                  onClick={handleComplete}
                  className="flex-1 bg-foreground text-background hover:bg-foreground/95 rounded-none font-bold uppercase tracking-wider text-xs h-11"
                >
                  {completing ? (
                    "Syncing Profile..."
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Complete Profile Setup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
    </PageTransition>
  );
}

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
          <p className="mt-4 text-muted-foreground text-sm font-mono">Loading onboarding preferences...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </React.Suspense>
  );
}
