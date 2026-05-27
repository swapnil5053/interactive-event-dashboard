// Roles & Permissions system mapping RBAC
// NOTE: No "use client" directive — this file is safe for server imports
export type UserRole = "super_admin" | "organizer" | "sponsor" | "speaker" | "attendee";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests?: string;
  ticketType?: string;
}

// Permission tags mapping capability boundaries
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

// Check capability matching user role
export function hasPermission(role: UserRole | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[role]?.includes(action) || false;
}
