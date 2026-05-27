"use client";

import { UserSession, UserRole } from "./auth";

// Dev Auth Provider cache key
const SESSION_KEY = "designare_user_session";

// Default pre-loaded session to represent offline-first readiness
const DEFAULT_ATTENDEE: UserSession = {
  id: "usr_attendee",
  name: "Alex Thompson",
  email: "attendee@designare.co",
  role: "attendee",
  interests: "water,earth",
  ticketType: "Full Conference Pass",
};

export const DEV_USERS: Record<string, UserSession> = {
  super_admin: {
    id: "usr_super",
    name: "Arthur Pendragon",
    email: "superadmin@designare.co",
    role: "super_admin",
    interests: "air,water,fire,earth",
  },
  attendee: DEFAULT_ATTENDEE,
  organizer: {
    id: "usr_admin",
    name: "Olivia Vance",
    email: "admin@designare.co",
    role: "organizer",
    interests: "air,fire",
  },
  sponsor: {
    id: "usr_sponsor",
    name: "Figma Team",
    email: "sponsor@figma.com",
    role: "sponsor",
    interests: "air",
  },
  speaker: {
    id: "usr_speaker",
    name: "Sarah Chen",
    email: "sarah@figma.com",
    role: "speaker",
    interests: "air,water",
  },
};

export function getClientSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) {
    // Seed default attendee so app works instantly
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEFAULT_ATTENDEE));
    return DEFAULT_ATTENDEE;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

export function setClientSession(session: UserSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  // Dispatch custom storage event for sync
  window.dispatchEvent(new Event("storage"));
}
