import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { enforcePermission } from "../permissions/auth.permissions";
import { UserRole } from "@/lib/auth";

export async function publishAnnouncementAction(
  userRole: UserRole,
  title: string,
  message: string,
  category: "info" | "emergency" | "schedule",
  isPinned = false
) {
  await enforcePermission(userRole, "ops:broadcast");

  const id = `anc_${Date.now()}`;
  await db.insert(schema.announcements).values({
    id,
    title,
    message,
    category,
    isPinned,
    timestamp: Date.now(),
  });

  return { success: true, announcementId: id };
}
