"use client";

import { motion } from "framer-motion";
import { Wind, Droplets, Flame, Mountain, MapPin, Coffee, Utensils, Wifi, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/animations/PageTransition";

const zones = [
  {
    id: "air",
    name: "Air Stage",
    description: "Main keynote hall for systems and strategy talks",
    floor: "Level 1",
    room: "Hall A",
    icon: Wind,
    color: "var(--air)",
    borderColor: "rgba(123, 184, 212, 0.3)",
  },
  {
    id: "water",
    name: "Water Stage",
    description: "Immersive theater for brand and experience sessions",
    floor: "Level 2",
    room: "Room 201",
    icon: Droplets,
    color: "var(--water)",
    borderColor: "rgba(42, 186, 181, 0.3)",
  },
  {
    id: "fire",
    name: "Fire Stage",
    description: "Tech-forward space for innovation and AI demos",
    floor: "Level 2",
    room: "Room 210",
    icon: Flame,
    color: "var(--fire)",
    borderColor: "rgba(242, 125, 82, 0.3)",
  },
  {
    id: "earth",
    name: "Earth Studio",
    description: "Hands-on workshop space for craft sessions",
    floor: "Level 3",
    room: "Workshop Suite",
    icon: Mountain,
    color: "var(--earth)",
    borderColor: "rgba(93, 190, 138, 0.3)",
  },
];

const facilities = [
  { name: "Registration", floor: "Level 1", icon: MapPin },
  { name: "Main Café", floor: "Level 1", icon: Coffee },
  { name: "Food Court", floor: "Level 2", icon: Utensils },
  { name: "WiFi Hub", floor: "All Levels", icon: Wifi },
];

export default function VenuePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0F0F0F] text-foreground pt-20">
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl font-normal text-white">Venue & Zones</h1>
              <p className="mt-2 text-[#A1A1A1] text-sm">Moscone Center, San Francisco</p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Venue Map Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#262626] border border-white/5">
                  <Navigation className="h-4 w-4 text-gold" />
                </div>
                <h2 className="text-xl font-semibold text-white">Interactive Map</h2>
              </div>
              
              <div className="relative flex-1 aspect-[4/3] overflow-hidden rounded-2xl border border-[#262626] bg-[#1A1A1A] p-6 shadow-2xl">
                <div className="absolute inset-0 opacity-10 gold-pattern" />
                <svg viewBox="0 0 400 300" className="relative h-full w-full drop-shadow-2xl">
                  {/* Level 1 - Air Stage */}
                  <g className="transition-all hover:opacity-80">
                    <rect x="20" y="20" width="360" height="80" rx="12" fill="rgba(123, 184, 212, 0.08)" stroke="rgba(123, 184, 212, 0.4)" strokeWidth="1.5" />
                    <text x="200" y="55" textAnchor="middle" fill="#7BB8D4" fontSize="14" fontWeight="600" className="font-sans">Level 1</text>
                    <text x="200" y="78" textAnchor="middle" fill="#A1A1A1" fontSize="11" fontWeight="400">Air Stage · Registration · Café</text>
                  </g>
                  
                  {/* Level 2 - Water & Fire */}
                  <g className="transition-all hover:opacity-80">
                    <rect x="20" y="110" width="175" height="80" rx="12" fill="rgba(42, 186, 181, 0.08)" stroke="rgba(42, 186, 181, 0.4)" strokeWidth="1.5" />
                    <text x="107" y="145" textAnchor="middle" fill="#2ABAB5" fontSize="14" fontWeight="600">Level 2</text>
                    <text x="107" y="168" textAnchor="middle" fill="#A1A1A1" fontSize="11">Water Stage</text>
                  </g>
                  
                  <g className="transition-all hover:opacity-80">
                    <rect x="205" y="110" width="175" height="80" rx="12" fill="rgba(242, 125, 82, 0.08)" stroke="rgba(242, 125, 82, 0.4)" strokeWidth="1.5" />
                    <text x="292" y="145" textAnchor="middle" fill="#F27D52" fontSize="14" fontWeight="600">Level 2</text>
                    <text x="292" y="168" textAnchor="middle" fill="#A1A1A1" fontSize="11">Fire Stage</text>
                  </g>
                  
                  {/* Level 3 - Earth Studio */}
                  <g className="transition-all hover:opacity-80">
                    <rect x="20" y="200" width="360" height="80" rx="12" fill="rgba(93, 190, 138, 0.08)" stroke="rgba(93, 190, 138, 0.4)" strokeWidth="1.5" />
                    <text x="200" y="235" textAnchor="middle" fill="#5DBE8A" fontSize="14" fontWeight="600">Level 3</text>
                    <text x="200" y="258" textAnchor="middle" fill="#A1A1A1" fontSize="11">Earth Studio · Workshops</text>
                  </g>
                  
                  {/* User Location */}
                  <circle cx="350" cy="50" r="16" fill="#C5A880" className="animate-pulse" />
                  <circle cx="350" cy="50" r="22" fill="#C5A880" opacity="0.2" className="animate-ping" />
                  <text x="350" y="54" textAnchor="middle" fill="black" fontSize="10" fontWeight="700">YOU</text>
                </svg>
              </div>
            </motion.div>

            {/* Zones Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="mb-6 text-xl font-semibold text-white">Stage Zones</h2>
              <div className="space-y-4">
                {zones.map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group relative flex items-start gap-5 rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 transition-all hover:bg-[#222222] hover:border-[#333333]"
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ 
                        backgroundColor: `color-mix(in srgb, ${zone.color} 10%, transparent)`,
                        border: `1px solid ${zone.borderColor}`
                      }}
                    >
                      <zone.icon className="h-6 w-6" style={{ color: zone.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg text-white group-hover:text-gold transition-colors">{zone.name}</h3>
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[#262626] text-[#A1A1A1] border border-white/5"
                        >
                          {zone.room}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-[#A1A1A1] leading-relaxed">{zone.description}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#666666]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
                        {zone.floor}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Facilities Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="mb-6 text-xl font-semibold text-white">Facilities</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {facilities.map((facility, index) => (
                <motion.div
                  key={facility.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 rounded-2xl border border-[#262626] bg-[#1A1A1A] p-5 transition-all hover:bg-[#222222] group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#262626] border border-white/5 group-hover:border-gold/30 group-hover:bg-gold/5 transition-all">
                    <facility.icon className="h-5 w-5 text-[#A1A1A1] group-hover:text-gold transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{facility.name}</p>
                    <p className="text-xs text-[#666666] font-medium uppercase tracking-tighter mt-0.5">{facility.floor}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 rounded-3xl border border-[#262626] bg-[#141414] overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-gold h-1.5 w-full" />
            <div className="p-8 md:p-10">
              <h2 className="mb-8 text-2xl font-serif text-white italic">Getting There</h2>
              <div className="grid gap-10 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-gold" />
                    <h3 className="font-semibold text-white uppercase tracking-wider text-xs">Conference Address</h3>
                  </div>
                  <div className="pl-5">
                    <p className="text-lg text-[#A1A1A1] leading-relaxed">
                      Moscone Center<br />
                      747 Howard St<br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#2ABAB5]" />
                    <h3 className="font-semibold text-white uppercase tracking-wider text-xs">Public Transit</h3>
                  </div>
                  <div className="pl-5">
                    <p className="text-lg text-[#A1A1A1] leading-relaxed">
                      BART: <span className="text-white">Powell St Station</span> (5 min walk)<br />
                      Muni: <span className="text-white">Lines 8, 14, 30, 45</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-[#666666]">Need more help? Visit our help desk at Registration.</p>
                <button className="text-sm font-semibold text-gold hover:underline underline-offset-4 bg-transparent border-0 cursor-pointer">
                  View Full Map (PDF)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
