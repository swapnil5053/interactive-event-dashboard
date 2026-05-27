import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getSessionsData() {
  return await db.query.sessions.findMany({
    with: {
      speaker: true,
      stage: true,
    },
  });
}

export async function getUserBookmarks(userId: string) {
  return await db.query.bookmarks.findMany({
    where: eq(schema.bookmarks.userId, userId),
    with: {
      session: {
        with: {
          speaker: true,
          stage: true,
        }
      }
    }
  });
}

export async function getSessionById(id: string) {
  return await db.query.sessions.findFirst({
    where: eq(schema.sessions.id, id),
    with: {
      speaker: true,
      stage: true,
      feedback: {
        with: {
          user: true
        }
      }
    },
  });
}

export async function getSponsors() {
  return await db.query.sponsors.findMany();
}

export async function getSponsorLeads(sponsorId: string) {
  return await db.query.boothLeads.findMany({
    where: eq(schema.boothLeads.sponsorId, sponsorId),
    with: {
      user: true,
    },
  });
}

export async function getSponsorById(id: string) {
  return await db.query.sponsors.findFirst({
    where: eq(schema.sponsors.id, id),
  });
}

export async function getAnnouncements() {
  return await db.query.announcements.findMany({
    orderBy: [desc(schema.announcements.timestamp)],
  });
}

export async function getStages() {
  return await db.query.stages.findMany();
}

export async function getSpeakers() {
  return await db.query.speakers.findMany();
}
