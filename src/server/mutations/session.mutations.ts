import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { enforcePermission } from "../permissions/auth.permissions";
import { UserRole } from "@/lib/auth";

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
  await enforcePermission(userRole, "cms:write");

  const sessionId = data.id || `sess_${Math.random().toString(36).substring(2, 11)}`;

  const existing = data.id
    ? await db.query.sessions.findFirst({
        where: eq(schema.sessions.id, data.id),
      })
    : null;

  if (existing) {
    await db
      .update(schema.sessions)
      .set({
        title: data.title,
        description: data.description || "",
        track: data.track,
        level: data.level,
        time: data.time,
        duration: data.duration,
        stageId: data.stageId,
        speakerId: data.speakerId,
        format: data.format,
        day: data.day,
      })
      .where(eq(schema.sessions.id, sessionId));
  } else {
    await db.insert(schema.sessions).values({
      id: sessionId,
      title: data.title,
      description: data.description || "",
      track: data.track,
      level: data.level,
      time: data.time,
      duration: data.duration,
      stageId: data.stageId,
      speakerId: data.speakerId,
      format: data.format,
      day: data.day,
    });
  }

  return { success: true, sessionId };
}

export async function deleteSessionAction(userRole: UserRole, sessionId: string) {
  await enforcePermission(userRole, "cms:write");

  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));

  return { success: true };
}
