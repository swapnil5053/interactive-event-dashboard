"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { telemetry } from "@/lib/telemetry";
import { PageTransition } from "@/animations/PageTransition";

function PassContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Monitor payment success codes
  useEffect(() => {
    const chk = searchParams?.get("checkout_session");
    if (chk) {
      telemetry.track("action", "Verified Payment Callback", { sessionId: chk });
      toast.success("Ticket registration verified!", {
        description: "Your digital conference pass has been generated.",
        duration: 8000,
      });
    }
  }, [searchParams]);

  const handleDownload = () => {
    telemetry.track("action", "Downloaded Pass PDF Invoice");
    toast.success("PDF Invoice & Ticket downloaded", {
      description: "Saved local offline copy to downloads.",
    });
  };

  const handleAddToWallet = () => {
    telemetry.track("action", "Added Pass to Apple Wallet");
    toast.success("Lanyard synchronized with Wallet", {
      description: "Your boarding code is now accessible on-device.",
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary border border-border">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Pass not found</h2>
          <p className="mt-2 max-w-sm text-muted-foreground text-sm">
            Please log in or register a new account inside the Sandbox to view your visual entry pass lanyards.
          </p>
          <Button variant="outline" className="mt-6 border-stone-400 rounded-none text-xs font-bold uppercase tracking-wider h-11" onClick={() => window.location.href = "/auth"}>
            Authenticate Session
          </Button>
        </div>
      </div>
    );
  }

  const passId = `DSG-2026-${user.id.substring(4, 8).toUpperCase() || "4829"}`;

  const roleConfig: Record<string, { name: string; color: string; bgGradient: string; darkColor: string }> = {
    super_admin: {
      name: "Super Admin",
      color: "#38BDF8", // Cyan
      darkColor: "#0369A1", // Deep blue
      bgGradient: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
    },
    organizer: {
      name: "Organizer",
      color: "#EF4444", // Red
      darkColor: "#991B1B", // Deep red
      bgGradient: "linear-gradient(135deg, #EF4444 0%, #FCA5A5 100%)",
    },
    sponsor: {
      name: "Sponsor",
      color: "#10B981", // Emerald
      darkColor: "#065F46", // Deep green
      bgGradient: "linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)",
    },
    speaker: {
      name: "Speaker",
      color: "#F59E0B", // Amber
      darkColor: "#92400E", // Deep brown-gold
      bgGradient: "linear-gradient(135deg, #F59E0B 0%, #FDE68A 100%)",
    },
    attendee: {
      name: "Attendee",
      color: "#8B5CF6", // Violet
      darkColor: "#5B21B6", // Deep purple
      bgGradient: "linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%)",
    },
  };

  const config = roleConfig[user.role] || roleConfig.attendee;

  return (
    <PageTransition>
      <div>
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl font-normal text-foreground">My Pass</h1>
              <p className="mt-2 text-muted-foreground text-sm">Your operational entry token</p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            <div style={{ background: config.bgGradient }} className="p-6 text-center text-black">
              <svg viewBox="0 0 32 32" className="mx-auto h-10 w-10 text-black animate-pulse" fill="none">
                <path
                  d="M16 2C16 2 20 8 20 14C20 20 16 24 16 24C16 24 12 20 12 14C12 8 16 2 16 2Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <path
                  d="M16 8C16 8 22 12 22 16C22 20 16 22 16 22C16 22 10 20 10 16C10 12 16 8 16 8Z"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
              <h2 className="mt-3 text-xl font-bold font-serif uppercase tracking-widest text-black">DESIGNARE OS</h2>
              <p className="text-[10px] uppercase font-mono tracking-widest opacity-95 font-bold">
                {config.name} Passcode 2026
              </p>
            </div>

            <div className="p-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div style={{ borderColor: config.color }} className="h-48 w-48 border-4 bg-white p-2">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      {/* Visual pattern representing QR token */}
                      <rect x="5" y="5" width="10" height="10" fill={config.darkColor} />
                      <rect x="20" y="5" width="10" height="10" fill={config.darkColor} />
                      <rect x="35" y="5" width="10" height="10" fill={config.darkColor} />
                      <rect x="55" y="5" width="10" height="10" fill={config.darkColor} />
                      <rect x="70" y="5" width="10" height="10" fill={config.darkColor} />
                      <rect x="85" y="5" width="10" height="10" fill={config.darkColor} />
                      
                      <rect x="5" y="20" width="10" height="10" fill={config.darkColor} />
                      <rect x="35" y="20" width="10" height="10" fill={config.darkColor} />
                      <rect x="55" y="20" width="10" height="10" fill={config.darkColor} />
                      <rect x="85" y="20" width="10" height="10" fill={config.darkColor} />
                      
                      <rect x="5" y="35" width="10" height="10" fill={config.darkColor} />
                      <rect x="20" y="35" width="10" height="10" fill={config.darkColor} />
                      <rect x="35" y="35" width="10" height="10" fill={config.darkColor} />
                      <rect x="55" y="35" width="10" height="10" fill={config.darkColor} />
                      <rect x="70" y="35" width="10" height="10" fill={config.darkColor} />
                      <rect x="85" y="35" width="10" height="10" fill={config.darkColor} />
                      
                      <rect x="5" y="55" width="10" height="10" fill={config.darkColor} />
                      <rect x="35" y="55" width="10" height="10" fill={config.darkColor} />
                      <rect x="55" y="55" width="10" height="10" fill={config.darkColor} />
                      <rect x="85" y="55" width="10" height="10" fill={config.darkColor} />
                      
                      <rect x="5" y="70" width="10" height="10" fill={config.darkColor} />
                      <rect x="20" y="70" width="10" height="10" fill={config.darkColor} />
                      <rect x="55" y="70" width="10" height="10" fill={config.darkColor} />
                      <rect x="70" y="70" width="10" height="10" fill={config.darkColor} />
                      
                      <rect x="5" y="85" width="10" height="10" fill={config.darkColor} />
                      <rect x="35" y="85" width="10" height="10" fill={config.darkColor} />
                      <rect x="55" y="85" width="10" height="10" fill={config.darkColor} />
                      <rect x="85" y="85" width="10" height="10" fill={config.darkColor} />
                      
                      {/* Dynamic accent colors in the pattern based on user role */}
                      <rect x="20" y="55" width="10" height="10" fill={config.color} />
                      <rect x="35" y="70" width="10" height="10" fill={config.color} />
                      <rect x="70" y="55" width="10" height="10" fill={config.color} />
                      <rect x="85" y="70" width="10" height="10" fill={config.color} />
                    </svg>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-none bg-card px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase border border-border tracking-wider shadow">
                    Scan at Entry Gates
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="rounded-none bg-muted/50 p-4 border border-border">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase tracking-wider">
                    <div>
                      <p className="text-muted-foreground">Ticket Type</p>
                      <p className="font-bold text-foreground mt-0.5">{user.ticketType || "Full Conference Pass"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valid Days</p>
                      <p className="font-bold text-foreground mt-0.5">June 15–16, 2026</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pass ID</p>
                      <p className="font-mono font-bold text-foreground mt-0.5">{passId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="font-bold capitalize text-emerald-500">
                          verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/30 p-4">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-none border-stone-400 font-bold text-xs uppercase tracking-wider h-11" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF Invoice
                </Button>
                <Button variant="outline" className="flex-1 rounded-none border-stone-400 font-bold text-xs uppercase tracking-wider h-11" onClick={handleAddToWallet}>
                  <Wallet className="mr-2 h-4 w-4" />
                  Apple Wallet
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 rounded-none border border-border bg-card p-6"
          >
            <h3 className="font-bold text-foreground text-xs uppercase tracking-widest mb-4">Entry Instructions</h3>
            <ul className="space-y-4 text-xs text-muted-foreground">
              <li className="flex items-start gap-3">
                <span style={{ backgroundColor: `${config.color}22`, color: config.color }} className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="mt-0.5 font-medium">NFC Check-in gates unlock at 8:00 AM at the Main Entrance corridor.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ backgroundColor: `${config.color}22`, color: config.color }} className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="mt-0.5 font-medium">Present this QR interface code to scan NFC proximity sensors.</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ backgroundColor: `${config.color}22`, color: config.color }} className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="mt-0.5 font-medium">Collect your physical metal-lanyard pass at the visual catalog desk.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function PassPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    }>
      <PassContent />
    </Suspense>
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
