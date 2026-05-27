"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserSession, hasPermission, PermissionAction } from "@/lib/auth";
import { getClientSession, setClientSession, DEV_USERS } from "@/lib/auth.client";
import { toast } from "sonner";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  loginAs: (role: "super_admin" | "organizer" | "sponsor" | "speaker" | "attendee") => void;
  logout: () => void;
  can: (action: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    setUser(session);
    setLoading(false);

    const handleStorageChange = () => {
      setUser(getClientSession());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginAs = (role: "super_admin" | "organizer" | "sponsor" | "speaker" | "attendee") => {
    const session = DEV_USERS[role];
    if (session) {
      setClientSession(session);
      setUser(session);
      toast.success(`Authenticated as ${role.toUpperCase()}`, {
        description: `Logged in as: ${session.name} (${session.email})`,
      });
    }
  };

  const logout = () => {
    setClientSession(null);
    setUser(null);
    toast.info("Logged out successfully");
  };

  const can = (action: PermissionAction) => {
    return hasPermission(user?.role, action);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
