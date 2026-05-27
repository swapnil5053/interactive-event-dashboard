"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ElementCard } from "@/components/ElementCard";
import { SessionCard, type Session } from "@/components/SessionCard";
import { SpeakerCard, type Speaker } from "@/components/SpeakerCard";
import { SponsorLogo, type Sponsor } from "@/components/SponsorLogo";
import { ArrowRight, Sparkles, Users, Palette, Briefcase, Loader2, Radio, Play } from "lucide-react";
import { useLive } from "@/providers/live-provider";
import { useAuth } from "@/providers/auth-provider";
import { FadeIn, SlideIn, StaggerContainer, staggerChildVariants } from "@/animations/motion-primitives";
import { PageTransition } from "@/animations/PageTransition";

// Dynamic import WebGL R3F canvas (client-only hydration boundary check)
const ElementCanvas = dynamic(() => import("@/components/3d/ElementCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[450px] w-full items-center justify-center text-zinc-500 font-mono text-xs">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Hydrating WebGL Elements...
    </div>
  ),
});

const featuredSessions: Session[] = [
  {
    id: "1",
    title: "The Future of Design Systems in the Age of AI",
    track: "air",
    level: "intermediate",
    time: "9:30 AM",
    duration: "45 min",
    stage: "Air Stage",
    speaker: "Sarah Chen",
    speakerRole: "Design Director, Figma",
    format: "Keynote",
  },
  {
    id: "3",
    title: "Building AI-Native Design Tools from Scratch",
    track: "fire",
    level: "advanced",
    time: "2:00 PM",
    duration: "60 min",
    stage: "Fire Stage",
    speaker: "Yuki Tanaka",
    speakerRole: "CTO, Runway",
    format: "Workshop",
  },
];

const featuredSpeakers: Speaker[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Design Director",
    company: "Figma",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
    track: "air",
  },
  {
    id: "2",
    name: "Marcus Webb",
    role: "Creative Director",
    company: "Airbnb",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    track: "water",
  },
  {
    id: "3",
    name: "Yuki Tanaka",
    role: "CTO",
    company: "Runway",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
    track: "fire",
  },
];

const sponsors: Sponsor[] = [
  { name: "Figma", logo: "", tier: "gold" },
  { name: "Framer", logo: "", tier: "gold" },
  { name: "Notion", logo: "", tier: "silver" },
  { name: "Linear", logo: "", tier: "silver" },
  { name: "Vercel", logo: "", tier: "silver" },
];

const audienceTypes = [
  { icon: Sparkles, label: "Students", description: "Emerging designers eager to learn" },
  { icon: Palette, label: "Designers", description: "Product, UX, and visual designers" },
  { icon: Users, label: "Freelancers", description: "Independent creative professionals" },
  { icon: Briefcase, label: "Founders", description: "Design-led startup founders" },
];

export default function HomePage() {
  const { isLiveMode, announcements, virtualTime } = useLive();
  const { user } = useAuth();
  
  const pinnedAnnouncement = announcements.find((a) => a.isPinned);

  return (
    <PageTransition>
      <div className="relative">
        {/* Live Event Announcement Banner */}
        {isLiveMode && pinnedAnnouncement && (
          <div className="bg-amber-500 text-black py-3 px-4 text-center text-xs font-semibold tracking-wider flex items-center justify-center gap-3 relative z-30 shadow-md">
            <Radio className="h-4 w-4 text-black animate-pulse" />
            <span>
              <strong>LIVE ALERT ({virtualTime}):</strong> {pinnedAnnouncement.title} — {pinnedAnnouncement.message}
            </span>
            <Link href="/ops" className="underline font-bold ml-2 hover:opacity-90">
              Go to Operations Room
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-light)] via-transparent to-[var(--air)] opacity-20 pointer-events-none" />
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[var(--gold)]/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[var(--air)]/5 blur-3xl pointer-events-none" />
          
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="glassmorphism rounded-xl p-8">
              
              {/* Left Content Column */}
              <StaggerContainer className="flex flex-col justify-center">
                <motion.p
                  variants={staggerChildVariants}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-gold"
                >
                  Designare Conference 2026
                </motion.p>
                
                <motion.h1
                  variants={staggerChildVariants}
                  className="mt-4 font-serif text-5xl font-normal leading-tight text-foreground sm:text-6xl lg:text-7xl"
                >
                  Design, in its <span className="italic text-gradient-gold">elemental</span> states.
                </motion.h1>
                
                <motion.p
                  variants={staggerChildVariants}
                  className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
                >
                  Four tracks. Four elements. Two days of transformative design thinking. Explore Air, Water, Fire, and Earth — the forces shaping modern visual systems.
                </motion.p>
                
                <motion.div
                  variants={staggerChildVariants}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <Button size="lg" className="bg-gradient-gold text-black font-bold hover:opacity-90 rounded-xl transition-colors h-12 px-8" asChild>
                    <Link href="/schedule">
                      Explore Schedule
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  {user ? (
                    <Button size="lg" variant="outline" className="rounded-xl border-stone-400 hover:border-foreground transition-colors h-12 px-8" asChild>
                      <Link href="/agenda">My Personal Agenda</Link>
                    </Button>
                  ) : (
                    <Button size="lg" variant="outline" className="rounded-xl border-stone-400 hover:border-foreground transition-colors h-12 px-8" asChild>
                      <Link href="/auth">Access Sandbox</Link>
                    </Button>
                  )}
                </motion.div>
                
                <motion.p
                  variants={staggerChildVariants}
                  className="mt-8 text-xs font-mono text-muted-foreground"
                >
                  June 15–16, 2026 · San Francisco, CA · local.db synced
                </motion.p>
              </StaggerContainer>
              </div>

            {/* Right WebGL Particle Column */}
            <div className="relative h-[450px] w-full flex items-center justify-center">
              <ElementCanvas />
            </div>

          </div>
        </div>
      </section>

      {/* Elements Grid Section */}
      <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-normal text-foreground sm:text-4xl">
              Four Elements. Four Paths.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Explore design through the lens of fundamental forces
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ElementCard
              element="air"
              title="Air"
              description="Systems thinking, design strategy, and scalable solutions."
              href="/schedule?track=air"
              className="transform transition-all hover:scale-105 hover:shadow-premium-md rounded-xl"
            />
            <ElementCard
              element="water"
              title="Water"
              description="User experience, brand storytelling, and emotional design."
              href="/schedule?track=water"
              className="transform transition-all hover:scale-105 hover:shadow-premium-md rounded-xl"
            />
            <ElementCard
              element="fire"
              title="Fire"
              description="Innovation, AI tools, and experimental design frontiers."
              href="/schedule?track=fire"
              className="transform transition-all hover:scale-105 hover:shadow-premium-md rounded-xl"
            />
            <ElementCard
              element="earth"
              title="Earth"
              description="Craft excellence, operations, and design execution."
              href="/schedule?track=earth"
              className="transform transition-all hover:scale-105 hover:shadow-premium-md rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-normal text-foreground sm:text-4xl">
              Who Designare is For
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Whether you're starting out or leading teams, there's a track for you
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audienceTypes.map((audience, index) => (
              <div
                key={audience.label}
                className="rounded-xl border border-border bg-card p-6 text-center hover:border-foreground transition-all"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <audience.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground">{audience.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sessions */}
      <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl font-normal text-foreground sm:text-4xl">
                Featured Curriculum
              </h2>
              <p className="mt-4 text-muted-foreground">
                A glimpse of what awaits you at Designare
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex rounded-none border-stone-400 hover:border-foreground">
              <Link href="/schedule">
                View all sessions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {featuredSessions.map((session) => (
              <SessionCard key={session.id} session={session} className="border-border bg-card hover:border-foreground" />
            ))}
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-normal text-foreground sm:text-4xl">
              World-Class Speakers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Learn from the best minds in design
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {featuredSpeakers.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-normal text-foreground sm:text-4xl">
              Our Sponsors
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Made possible by industry leaders
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            {sponsors.map((sponsor) => (
              <SponsorLogo key={sponsor.name} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      {/* Pass Promo Card */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-[var(--air)]/5 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-normal text-foreground sm:text-5xl">
            Ready to transform your practice?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Join 2,000+ designers, founders, and creative leaders for two days of 
            inspiration, learning, and connection.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-gold text-black font-bold hover:opacity-90 rounded-none h-12 px-8" asChild>
              <Link href="/pass">
                Register Ticket Pass
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-none border-stone-400 hover:border-foreground h-12 px-8" asChild>
              <Link href="/schedule">View full schedule</Link>
            </Button>
          </div>
        </div>
      </section>
      </div>
    </PageTransition>
  );
}
