"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: "info" | "emergency" | "schedule";
  timestamp: number;
  isPinned: boolean;
}

interface LiveContextType {
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
  virtualTime: string; // E.g., "June 15, 10:45 AM"
  speedDial: number; // multiplier for simulation speed
  setSpeedDial: (speed: number) => void;
  announcements: Announcement[];
  publishAnnouncement: (title: string, message: string, category: "info" | "emergency" | "schedule", isPinned?: boolean) => void;
  occupancy: Record<string, { current: number; capacity: number }>;
  simulateOccupancyStep: () => void;
}

const LiveContext = createContext<LiveContextType | undefined>(undefined);

const initialAnnouncements: Announcement[] = [
  {
    id: "anc_1",
    title: "Schedule Shift",
    message: "Next-Gen Design Workflows moved from Fire Stage to Air Stage due to high capacity demand.",
    category: "schedule",
    timestamp: Date.now() - 3600000,
    isPinned: true,
  },
  {
    id: "anc_2",
    title: "Welcome to SF",
    message: "Check-in doors are officially open at the Main Entrance. Grab your visual lanyard pass.",
    category: "info",
    timestamp: Date.now() - 7200000,
    isPinned: false,
  },
];

const initialOccupancy = {
  stg_air: { current: 340, capacity: 500 },
  stg_water: { current: 120, capacity: 300 },
  stg_fire: { current: 80, capacity: 200 },
  stg_earth: { current: 95, capacity: 120 },
};

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [speedDial, setSpeedDial] = useState(1);
  const [virtualMinutes, setVirtualMinutes] = useState(540); // Minutes from 12:00 AM (540 = 9:00 AM)
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [occupancy, setOccupancy] = useState<Record<string, { current: number; capacity: number }>>(initialOccupancy);

  // Time ticker simulation
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setVirtualMinutes((prev) => {
        const next = prev + 1 * speedDial;
        // Reset day cycle at 6:00 PM (1080 mins) -> wrap to 8:00 AM (480 mins)
        if (next > 1080) {
          return 480;
        }
        return next;
      });
    }, 2000); // Every 2s simulation tick

    return () => clearInterval(interval);
  }, [isLiveMode, speedDial]);

  // Simulated active capacity changes based on clock ticking
  useEffect(() => {
    if (!isLiveMode) return;
    simulateOccupancyStep();
  }, [virtualMinutes, isLiveMode]);

  const simulateOccupancyStep = () => {
    setOccupancy((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        const stage = updated[key];
        const variance = Math.floor((Math.random() - 0.5) * 15);
        let nextCount = stage.current + variance;
        if (nextCount > stage.capacity) nextCount = stage.capacity;
        if (nextCount < 10) nextCount = 10;
        updated[key] = { ...stage, current: nextCount };
      });
      return updated;
    });
  };

  const publishAnnouncement = (
    title: string,
    message: string,
    category: "info" | "emergency" | "schedule",
    isPinned = false
  ) => {
    const newAnc: Announcement = {
      id: `anc_${Date.now()}`,
      title,
      message,
      category,
      timestamp: Date.now(),
      isPinned,
    };
    setAnnouncements((prev) => [newAnc, ...prev]);

    if (category === "emergency") {
      toast.error(`⚠️ EMERGENCY ALERT: ${title}`, {
        description: message,
        duration: 10000,
      });
    } else {
      toast.message(`📢 ${title}`, {
        description: message,
      });
    }
  };

  const formatVirtualTime = (minutes: number) => {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const paddedMins = mins.toString().padStart(2, "0");
    return `Day 1 · ${hours12}:${paddedMins} ${ampm}`;
  };

  const virtualTime = formatVirtualTime(virtualMinutes);

  return (
    <LiveContext.Provider
      value={{
        isLiveMode,
        setIsLiveMode,
        virtualTime,
        speedDial,
        setSpeedDial,
        announcements,
        publishAnnouncement,
        occupancy,
        simulateOccupancyStep,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  const context = useContext(LiveContext);
  if (!context) {
    throw new Error("useLive must be used within a LiveProvider");
  }
  return context;
}
