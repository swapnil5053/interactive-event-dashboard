import { Session } from "@/components/SessionCard";

export interface RelationalSession {
  id: string;
  title: string;
  description: string | null;
  track: "air" | "water" | "fire" | "earth";
  level: "beginner" | "intermediate" | "advanced";
  time: string;
  duration: string;
  stageId: string | null;
  speakerId: string | null;
  format: string;
  day: number;
  speaker?: {
    id: string;
    name: string;
    role: string;
    company: string;
    avatar: string;
    track: string;
  } | null;
  stage?: {
    id: string;
    name: string;
    capacity: number;
    currentOccupancy: number | null;
  } | null;
}

// Conflict detection logic checking overlap sessions
export function detectConflicts(sessions: RelationalSession[]): Record<string, string[]> {
  const conflicts: Record<string, string[]> = {};

  for (let i = 0; i < sessions.length; i++) {
    const s1 = sessions[i];
    for (let j = i + 1; j < sessions.length; j++) {
      const s2 = sessions[j];

      // Must be on the same day and have the exact same time value
      if (s1.day === s2.day && s1.time === s2.time) {
        if (!conflicts[s1.id]) conflicts[s1.id] = [];
        if (!conflicts[s2.id]) conflicts[s2.id] = [];
        conflicts[s1.id].push(s2.id);
        conflicts[s2.id].push(s1.id);
      }
    }
  }

  return conflicts;
}

// Track scoring algorithm for personalization recommendations
export function generateRecommendations(
  allSessions: RelationalSession[],
  bookmarkedSessionIds: string[],
  userInterests: string[] // List of tracks: ["air", "water", etc.]
): RelationalSession[] {
  // Filter out already bookmarked
  const candidates = allSessions.filter((s) => !bookmarkedSessionIds.includes(s.id));

  return candidates
    .map((session) => {
      let score = 0;

      // Track alignment
      if (userInterests.includes(session.track)) {
        score += 5;
      }

      // Speaker track alignment
      if (session.speaker && userInterests.includes(session.speaker.track)) {
        score += 2;
      }

      // Format weights (keynotes score higher for recommendation discovery)
      if (session.format === "Keynote") score += 3;
      if (session.format === "Workshop") score += 1.5;

      return { session, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.session)
    .slice(0, 3); // Top 3 recommendations
}

// Google Calendar link generator
export function generateGoogleCalendarLink(session: RelationalSession): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  
  // Format dates: Designare 2026 is June 15 and June 16
  const dateStr = session.day === 1 ? "20260615" : "20260616";
  
  // Parse start hours. Let's do a simple mapping
  // e.g. "9:00 AM" -> "090000", "2:00 PM" -> "140000"
  let timeStr = "090000";
  const [hourMin, ampm] = session.time.split(" ");
  const [hour, min] = hourMin.split(":");
  let hr = parseInt(hour);
  if (ampm === "PM" && hr < 12) hr += 12;
  if (ampm === "AM" && hr === 12) hr = 0;
  
  const formattedHr = hr.toString().padStart(2, "0");
  const formattedMin = min.padStart(2, "0");
  timeStr = `${formattedHr}${formattedMin}00`;

  // Duration
  const durMinutes = parseInt(session.duration) || 45;
  const endMinTotal = (hr * 60) + parseInt(formattedMin) + durMinutes;
  const endHr = Math.floor(endMinTotal / 60) % 24;
  const endMin = endMinTotal % 60;
  const formattedEndHr = endHr.toString().padStart(2, "0");
  const formattedEndMin = endMin.toString().padStart(2, "0");
  const endTimeStr = `${formattedEndHr}${formattedEndMin}00`;

  const details = encodeURIComponent(
    `${session.description || ""}\n\nTrack: ${session.track.toUpperCase()}\nSpeaker: ${session.speaker?.name || ""}`
  );
  const location = encodeURIComponent(session.stage?.name || "Main Venue");
  const text = encodeURIComponent(`Designare OS: ${session.title}`);
  
  const dates = `${dateStr}T${timeStr}/${dateStr}T${endTimeStr}`;
  
  return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}
