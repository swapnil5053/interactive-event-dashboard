import { UserRole } from "@/lib/auth";

export type PermissionAction =
  | "ops:read"            // View Command Center
  | "ops:broadcast"       // Publish emergency alerts
  | "cms:write"           // Publish speakers / sessions
  | "booth:write"         // Manage sponsor media assets
  | "leads:read"          // View sponsor lead details
  | "agenda:write"        // Bookmark sessions / edit personal schedule
  | "feedback:write";     // Rate speakers / sessions

const PERMISSION_MATRIX: Record<UserRole, PermissionAction[]> = {
  super_admin: ["ops:read", "ops:broadcast", "cms:write", "booth:write", "leads:read", "agenda:write", "feedback:write"],
  organizer: ["ops:read", "ops:broadcast", "cms:write", "booth:write", "leads:read", "agenda:write", "feedback:write"],
  sponsor: ["booth:write", "leads:read", "agenda:write", "feedback:write"],
  speaker: ["agenda:write", "feedback:write"],
  attendee: ["agenda:write", "feedback:write"],
};

export function hasPermission(role: UserRole | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[role]?.includes(action) || false;
}

export async function enforcePermission(role: UserRole | undefined, action: PermissionAction) {
  if (!role || !hasPermission(role, action)) {
    throw new Error(`Forbidden: Role [${role || "anonymous"}] lacks capability [${action}]`);
  }
}
