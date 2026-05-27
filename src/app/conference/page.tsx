"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wind, Droplets, Flame, Mountain, Calendar, MapPin, Clock, Users } from "lucide-react";

const tracks = [
  {
    id: "air",
    title: "Air",
    subtitle: "Systems & Strategy",
    description: "Explore the foundational frameworks that enable design at scale. Learn how to build design systems, develop strategic thinking, and create scalable solutions that breathe life into organizations.",
    stage: "Air Stage",
    icon: Wind,
    color: "var(--air)",
    topics: ["Design Systems", "Strategic Thinking", "Organizational Design", "Leadership", "Design Governance"],
  },
  {
    id: "water",
    title: "Water",
    subtitle: "Experience & Storytelling",
    description: "Dive into the fluid world of user experience and brand storytelling. Discover how to create emotional connections, craft compelling narratives, and design experiences that flow seamlessly.",
    stage: "Water Stage",
    icon: Droplets,
    color: "var(--water)",
    topics: ["User Experience", "Brand Design", "Storytelling", "Emotional Design", "Content Strategy"],
  },
  {
    id: "fire",
    title: "Fire",
    subtitle: "Innovation & AI",
    description: "Ignite your creativity with cutting-edge tools and emerging technologies. Push the boundaries of what's possible with AI-powered design, experimental interfaces, and innovative methodologies.",
    stage: "Fire Stage",
    icon: Flame,
    color: "var(--fire)",
    topics: ["AI Tools", "Generative Design", "Emerging Tech", "Experimental UI", "Future Interfaces"],
  },
  {
    id: "earth",
    title: "Earth",
    subtitle: "Craft & Operations",
    description: "Ground yourself in the fundamentals of exceptional execution. Master the craft of pixel-perfect design, efficient workflows, and operational excellence that forms the bedrock of great work.",
    stage: "Earth Studio",
    icon: Mountain,
    color: "var(--earth)",
    topics: ["Design Craft", "Design Ops", "Portfolio Reviews", "Production Design", "Quality Assurance"],
  },
];

const stages = [
  {
    name: "Air Stage",
    description: "Main keynote hall for systems and strategy talks",
    capacity: "800 seats",
    floor: "Level 1",
  },
  {
    name: "Water Stage",
    description: "Immersive theater for brand and experience sessions",
    capacity: "400 seats",
    floor: "Level 2",
  },
  {
    name: "Fire Stage",
    description: "Tech-forward space for innovation and AI demos",
    capacity: "300 seats",
    floor: "Level 2",
  },
  {
    name: "Earth Studio",
    description: "Hands-on workshop space for craft sessions",
    capacity: "100 seats",
    floor: "Level 3",
  },
];

const levels = [
  {
    name: "Beginner",
    description: "Perfect for those new to design or exploring new areas. No prior experience required.",
  },
  {
    name: "Intermediate",
    description: "For practicing designers looking to level up their skills. Some experience recommended.",
  },
  {
    name: "Advanced",
    description: "Deep dives for experienced practitioners. Assumes strong foundational knowledge.",
  },
];

const logistics = [
  { icon: Calendar, label: "Dates", value: "June 15–16, 2026" },
  { icon: MapPin, label: "Location", value: "Moscone Center, San Francisco" },
  { icon: Clock, label: "Hours", value: "9:00 AM – 6:00 PM daily" },
  { icon: Users, label: "Capacity", value: "2,000 attendees" },
];

export default function ConferencePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      suppressHydrationWarning
    >
      <section className="relative overflow-hidden border-b border-border bg-[#F7F7F5]">
        <div className="absolute inset-0 opacity-[0.03] grayscale" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 15 30 25 Q25 15 30 5' fill='none' stroke='%23111111' stroke-width='0.5'/%3E%3C/svg%3E")` }} />
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Core Philosophy
            </p>
            <h1 className="mt-6 font-serif text-5xl font-normal leading-[1.1] text-foreground sm:text-6xl">
              The Elemental States <br /> of Modern Design
            </h1>
            <p className="mt-8 text-xl leading-relaxed text-muted-foreground max-w-2xl">
              Designare 2026 is built on four pillars that define the lifecycle of a product. 
              From the invisible systems of Air to the grounded execution of Earth, we explore 
              the forces that shape our industry.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-20"
          >
            <h2 className="font-serif text-4xl font-normal text-foreground">
              Four elemental tracks
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              A balanced curriculum designed for strategic growth and technical mastery.
            </p>
          </motion.div>

          <div className="space-y-32">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                id={track.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="scroll-mt-24"
              >
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="mb-8 flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-sm"
                        style={{ backgroundColor: track.color, color: "white" }}
                      >
                        <track.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Track {index + 1}
                      </span>
                    </div>
                    <h3 className="text-3xl font-medium text-foreground sm:text-4xl">
                      {track.title} — <span className="text-muted-foreground">{track.subtitle}</span>
                    </h3>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                      {track.description}
                    </p>
                    <div className="mt-8">
                      <div className="flex flex-wrap gap-2">
                        {track.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full border border-border bg-muted/30 px-4 py-1.5 text-xs font-medium text-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-10">
                      <Button variant="outline" className="rounded-none border-foreground hover:bg-foreground hover:text-background transition-all" asChild>
                        <Link href={`/schedule?track=${track.id}`}>
                          View {track.title} Sessions
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="aspect-[16/10] overflow-hidden bg-[#F1F1EF] border border-border">
                      <div className="flex h-full items-center justify-center grayscale opacity-40">
                        <track.icon className="h-32 w-32" style={{ color: track.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[#F7F7F5] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="font-serif text-4xl font-normal text-foreground">
                Stages & <br />Learning Zones
              </h2>
              <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
                The Moscone Center is divided into four distinct environments, 
                each optimized for a specific style of learning and collaboration.
              </p>
            </div>
            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
              {stages.map((stage) => (
                <div
                  key={stage.name}
                  className="group border border-border bg-white p-8 transition-all hover:border-foreground"
                >
                  <h3 className="text-xl font-medium text-foreground">{stage.name}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{stage.description}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stage.floor}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stage.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-serif text-4xl font-normal text-foreground">
              Experience Levels
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3 w-full">
              {levels.map((level) => (
                <div key={level.name} className="text-left border-l border-border pl-8 py-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Level
                  </span>
                  <h3 className="mt-2 text-xl font-medium text-foreground">{level.name}</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {level.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[#111111] py-24 sm:py-32 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {logistics.map((item) => (
              <div key={item.label} className="border-l border-white/10 pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B6B]">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
