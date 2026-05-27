import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { enforcePermission } from "../permissions/auth.permissions";
import { UserRole } from "@/lib/auth";

export async function updateSponsorBoothAction(
  userRole: UserRole,
  sponsorId: string,
  description: string,
  boothMedia: string
) {
  await enforcePermission(userRole, "booth:write");

  await db
    .update(schema.sponsors)
    .set({
      description,
      boothMedia,
    })
    .where(eq(schema.sponsors.id, sponsorId));

  return { success: true };
}

export async function recordLeadScanAction(
  userRole: UserRole,
  sponsorId: string,
  attendeeEmail: string
) {
  await enforcePermission(userRole, "leads:read");

  const attendee = await db.query.users.findFirst({
    where: eq(schema.users.email, attendeeEmail),
  });

  if (!attendee) {
    throw new Error("No attendee matching that registration record found.");
  }

  // Record scan
  const id = `lead_${Math.random().toString(36).substring(2, 11)}`;
  await db.insert(schema.boothLeads).values({
    id,
    sponsorId,
    userId: attendee.id,
    scannedAt: Date.now(),
  });

  // Increment lead counter on sponsor table
  const sponsor = await db.query.sponsors.findFirst({
    where: eq(schema.sponsors.id, sponsorId),
  });

  if (sponsor) {
    await db
      .update(schema.sponsors)
      .set({
        leadScanCount: (sponsor.leadScanCount || 0) + 1,
      })
      .where(eq(schema.sponsors.id, sponsorId));
  }

  return { success: true, lead: { name: attendee.name, email: attendee.email } };
}
