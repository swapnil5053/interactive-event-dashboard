import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { enforcePermission } from "../permissions/auth.permissions";
import { UserRole } from "@/lib/auth";

export async function toggleBookmarkAction(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  active: boolean
) {
  await enforcePermission(userRole, "agenda:write");

  if (active) {
    const existing = await db.query.bookmarks.findFirst({
      where: and(eq(schema.bookmarks.userId, userId), eq(schema.bookmarks.sessionId, sessionId)),
    });

    if (!existing) {
      await db.insert(schema.bookmarks).values({
        id: `bmk_${Math.random().toString(36).substring(2, 11)}`,
        userId,
        sessionId,
        createdAt: Date.now(),
      });
    }
  } else {
    await db
      .delete(schema.bookmarks)
      .where(and(eq(schema.bookmarks.userId, userId), eq(schema.bookmarks.sessionId, sessionId)));
  }

  return { success: true };
}
