"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { registerAttendeeAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Key, Users, Settings, Briefcase, Award } from "lucide-react";
import { toast } from "sonner";
import { telemetry } from "@/lib/telemetry";
import { PageTransition } from "@/animations/PageTransition";

export default function AuthPage() {
  const router = useRouter();
  const { loginAs, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      telemetry.track("action", isRegistering ? "Auth Sign Up Initiated" : "Auth Sign In Initiated", { email });
      
      const userId = `usr_${Math.random().toString(36).substring(2, 10)}`;
      
      if (isRegistering) {
        if (!name) {
          toast.warning("Please provide your name.");
          setSubmitting(false);
          return;
        }
        router.push(`/onboarding?id=${userId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
      } else {
        let role = "attendee";
        let resolvedName = "Attendee Account";
        if (email.includes("super")) {
          role = "super_admin";
          resolvedName = "Arthur Pendragon";
        } else if (email.includes("admin")) {
          role = "organizer";
          resolvedName = "Olivia Vance";
        } else if (email.includes("sponsor")) {
          role = "sponsor";
          resolvedName = "Figma Team";
        } else if (email.includes("speaker")) {
          role = "speaker";
          resolvedName = "Sarah Chen";
        }

        const result = await registerAttendeeAction({
          id: userId,
          name: resolvedName,
          email,
          interests: "",
          ticketType: "Full Conference Pass",
        });

        loginAs(result.role as any);
        router.push("/agenda");
      }
    } catch (err) {
      toast.error("Authentication failed. Use the quick switcher buttons.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-4xl grid gap-8 md:grid-cols-2">
          
          {/* Left Side: Credentials */}
          <Card className="border-border bg-card rounded-none">
            <CardHeader>
              <CardTitle className="font-serif text-3xl font-normal text-foreground">
                {isRegistering ? "Create your Pass" : "Verify Session"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Development authentication provider compatible with future OAuth integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <Input
                      placeholder="Olivia Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-none focus:border-foreground text-xs"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@designare.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-none focus:border-foreground text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-foreground text-background hover:bg-foreground/95 rounded-none font-bold uppercase tracking-wider text-xs h-11"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isRegistering ? "Continue to Onboarding" : "Verify Authenticity"}
                </Button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 bg-transparent border-0 cursor-pointer"
                  >
                    {isRegistering ? "Already have a registration? Sign in" : "Create new attendee profile"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right Side: Role Swapping Quick Switcher */}
          <Card className="border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between rounded-none">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gold" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Developer Auth Sandbox</CardTitle>
              </div>
              <CardDescription className="text-zinc-550 text-xs">
                Recruiters can use these quick-access triggers to swap roles instantly and audit permission structures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-none text-xs font-bold uppercase tracking-wider h-11"
                onClick={() => {
                  loginAs("super_admin");
                  router.push("/admin");
                }}
              >
                <Settings className="h-4 w-4 mr-3 text-sky-500" />
                Toggle Super Admin Role (Arthur)
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-none text-xs font-bold uppercase tracking-wider h-11"
                onClick={() => {
                  loginAs("organizer");
                  router.push("/admin");
                }}
              >
                <Settings className="h-4 w-4 mr-3 text-stone-500" />
                Toggle Organizer Role (Olivia)
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-none text-xs font-bold uppercase tracking-wider h-11"
                onClick={() => {
                  loginAs("sponsor");
                  router.push("/sponsor");
                }}
              >
                <Award className="h-4 w-4 mr-3 text-amber-500" />
                Toggle Sponsor Role (Figma)
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-none text-xs font-bold uppercase tracking-wider h-11"
                onClick={() => {
                  loginAs("speaker");
                  router.push("/agenda");
                }}
              >
                <Users className="h-4 w-4 mr-3 text-blue-500" />
                Toggle Speaker Role (Sarah)
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-none text-xs font-bold uppercase tracking-wider h-11"
                onClick={() => {
                  loginAs("attendee");
                  router.push("/agenda");
                }}
              >
                <Users className="h-4 w-4 mr-3 text-emerald-500" />
                Toggle Attendee Role (Alex)
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
