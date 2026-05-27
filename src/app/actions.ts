"use server";

import { UserRole } from "@/lib/auth";

// Import permissions & validation
import { enforcePermission } from "@/server/permissions/auth.permissions";

// Import queries
import * as queries from "@/server/queries/session.queries";

// Import mutations
import * as bookmarkMutations from "@/server/mutations/bookmark.mutations";
import * as feedbackMutations from "@/server/mutations/feedback.mutations";
import * as announcementMutations from "@/server/mutations/announcement.mutations";
import * as sponsorMutations from "@/server/mutations/sponsor.mutations";
import * as sessionMutations from "@/server/mutations/session.mutations";

import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

// 1. Queries Wrappers
export async function getSessionsData() {
  return await queries.getSessionsData();
}

export async function getUserBookmarks(userId: string) {
  return await queries.getUserBookmarks(userId);
}

export async function getSessionById(id: string) {
  return await queries.getSessionById(id);
}

export async function getSponsors() {
  return await queries.getSponsors();
}

export async function getSponsorLeads(sponsorId: string) {
  return await queries.getSponsorLeads(sponsorId);
}

export async function getSponsorById(id: string) {
  return await queries.getSponsorById(id);
}

export async function getAnnouncements() {
  return await queries.getAnnouncements();
}

export async function getStages() {
  return await queries.getStages();
}

export async function getSpeakers() {
  return await queries.getSpeakers();
}

// 2. Mutations Wrappers
export async function toggleBookmarkAction(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  active: boolean
) {
  return await bookmarkMutations.toggleBookmarkAction(userId, userRole, sessionId, active);
}

export async function submitFeedbackAction(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  rating: number,
  comment: string
) {
  return await feedbackMutations.submitFeedbackAction(userId, userRole, sessionId, rating, comment);
}

export async function publishAnnouncementAction(
  userRole: UserRole,
  title: string,
  message: string,
  category: "info" | "emergency" | "schedule",
  isPinned = false
) {
  return await announcementMutations.publishAnnouncementAction(userRole, title, message, category, isPinned);
}

export async function updateSponsorBoothAction(
  userRole: UserRole,
  sponsorId: string,
  description: string,
  boothMedia: string
) {
  return await sponsorMutations.updateSponsorBoothAction(userRole, sponsorId, description, boothMedia);
}

export async function recordLeadScanAction(
  userRole: UserRole,
  sponsorId: string,
  attendeeEmail: string
) {
  return await sponsorMutations.recordLeadScanAction(userRole, sponsorId, attendeeEmail);
}

export async function upsertSessionAction(
  userRole: UserRole,
  data: {
    id?: string;
    title: string;
    description?: string;
    track: "air" | "water" | "fire" | "earth";
    level: "beginner" | "intermediate" | "advanced";
    time: string;
    duration: string;
    stageId: string;
    speakerId: string;
    format: string;
    day: number;
  }
) {
  return await sessionMutations.upsertSessionAction(userRole, data);
}

export async function deleteSessionAction(userRole: UserRole, sessionId: string) {
  return await sessionMutations.deleteSessionAction(userRole, sessionId);
}

// 3. Onboarding & Registration Action
export async function registerAttendeeAction(data: {
  id: string;
  name: string;
  email: string;
  interests: string;
  ticketType: string;
}) {
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, data.email),
  });

  if (existing) {
    // Update user profile and complete onboarding
    await db
      .update(schema.users)
      .set({
        name: data.name,
        interests: data.interests,
        ticketType: data.ticketType,
        onboardingCompleted: true,
      })
      .where(eq(schema.users.id, existing.id));
    return { success: true, userId: existing.id, role: existing.role };
  } else {
    // Insert new user
    await db.insert(schema.users).values({
      id: data.id,
      name: data.name,
      email: data.email,
      role: "attendee",
      onboardingCompleted: true,
      interests: data.interests,
      ticketType: data.ticketType,
      createdAt: Date.now(),
    });
    return { success: true, userId: data.id, role: "attendee" as UserRole };
  }
}

