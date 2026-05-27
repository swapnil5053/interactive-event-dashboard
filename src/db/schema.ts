import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Users / Attendees Table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().$type<"super_admin" | "organizer" | "sponsor" | "speaker" | "attendee">().default("attendee"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" }).default(false),
  interests: text("interests"), // Comma-separated list of tracks/topics
  ticketType: text("ticket_type").default("Full Pass"), // VIP, Full Pass, Sponsor Pass
  createdAt: integer("created_at").notNull(),
});

// Organizations (Multi-tenant ready architecture)
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

// Events (Multi-conference ready architecture)
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id),
  name: text("name").notNull(),
  dateRange: text("date_range").notNull(),
  location: text("location").notNull(),
});

// Stages Table with Capacity for occupancy verification
export const stages = sqliteTable("stages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  currentOccupancy: integer("current_occupancy").default(0), // Simulation dynamic state
});

// Speakers Table
export const speakers = sqliteTable("speakers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  bio: text("bio"),
  avatar: text("avatar").notNull(),
  track: text("track").$type<"air" | "water" | "fire" | "earth">().notNull(),
  socialLinks: text("social_links"), // JSON object mapping social platforms
});

// Sessions Table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  track: text("track").$type<"air" | "water" | "fire" | "earth">().notNull(),
  level: text("level").$type<"beginner" | "intermediate" | "advanced">().notNull(),
  time: text("time").notNull(), // Start time, e.g. "9:00 AM"
  duration: text("duration").notNull(), // duration e.g. "60 min"
  stageId: text("stage_id").references(() => stages.id),
  speakerId: text("speaker_id").references(() => speakers.id),
  format: text("format").notNull(), // Keynote, Talk, Workshop, Panel, Case Study
  day: integer("day").notNull(), // Day 1 or Day 2
});

// Bookmarks / Saved Agendas
export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
});

// Session Feedback Systems
export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  sessionId: text("session_id").references(() => sessions.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 to 5 stars
  comment: text("comment"),
  sentiment: text("sentiment").default("neutral"), // analysis output (positive/negative/neutral)
  createdAt: integer("created_at").notNull(),
});

// Sponsors Table
export const sponsors = sqliteTable("sponsors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  tier: text("tier").$type<"gold" | "silver" | "community">().notNull(),
  description: text("description"),
  boothMedia: text("booth_media"), // JSON mapping images and videos uploads
  leadScanCount: integer("lead_scan_count").default(0),
  clickCount: integer("click_count").default(0),
});

// Sponsor Booth Leads Tracker
export const boothLeads = sqliteTable("booth_leads", {
  id: text("id").primaryKey(),
  sponsorId: text("sponsor_id").references(() => sponsors.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  scannedAt: integer("scanned_at").notNull(),
});

// Announcements Table (for Operations Room alerts)
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  category: text("category").$type<"info" | "emergency" | "schedule">().default("info"),
  timestamp: integer("timestamp").notNull(),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
});

// Define Relations for Drizzle Relational Queries
export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
  feedback: many(feedback),
  boothLeads: many(boothLeads),
}));

export const stagesRelations = relations(stages, ({ many }) => ({
  sessions: many(sessions),
}));

export const speakersRelations = relations(speakers, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  stage: one(stages, {
    fields: [sessions.stageId],
    references: [stages.id],
  }),
  speaker: one(speakers, {
    fields: [sessions.speakerId],
    references: [speakers.id],
  }),
  bookmarks: many(bookmarks),
  feedback: many(feedback),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [bookmarks.sessionId],
    references: [sessions.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [feedback.sessionId],
    references: [sessions.id],
  }),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  leads: many(boothLeads),
}));

export const boothLeadsRelations = relations(boothLeads, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [boothLeads.sponsorId],
    references: [sponsors.id],
  }),
  user: one(users, {
    fields: [boothLeads.userId],
    references: [users.id],
  }),
}));
