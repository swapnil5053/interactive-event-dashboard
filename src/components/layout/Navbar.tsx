"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, Briefcase, Play, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useLive } from "@/providers/live-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loginAs, logout } = useAuth();
  const { isLiveMode, virtualTime } = useLive();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close role menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowRoleMenu(false);
  }, [pathname]);

  const handleRoleSwap = (role: "super_admin" | "organizer" | "sponsor" | "speaker" | "attendee") => {
    loginAs(role);
    setShowRoleMenu(false);
    
    // Redirect to match role target
    if (role === "organizer" || role === "super_admin") router.push("/admin");
    else if (role === "sponsor") router.push("/sponsor");
    else router.push("/agenda");
  };

  const navLink = (href: string, label: string, className?: string) => (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "text-xs font-bold uppercase tracking-wider transition-colors",
        pathname === href ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center bg-primary">
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
              <path
                d="M16 2C16 2 20 8 20 14C20 20 16 24 16 24C16 24 12 20 12 14C12 8 16 2 16 2Z"
                fill="currentColor"
                className="text-primary-foreground"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground leading-none">DESIGNARE OS</span>
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Intelligent Event OS</span>
          </div>
        </Link>

        {/* Center: Dynamic Nav Links based on Roles */}
        <div className="hidden items-center gap-6 md:flex">
          {navLink("/schedule", "Schedule")}
          {user && (
            <>
              {navLink("/agenda", "My Agenda")}
              {navLink("/pass", "Pass")}
            </>
          )}
          {(user?.role === "organizer" || user?.role === "super_admin") && (
            <>
              <Link
                href="/admin"
                prefetch={true}
                className={cn(
                  "text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1",
                  pathname === "/admin" ? "text-foreground" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
                )}
              >
                <Settings className="h-3 w-3" />
                CMS
              </Link>
              <Link
                href="/ops"
                prefetch={true}
                className={cn(
                  "text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1",
                  pathname === "/ops" ? "text-emerald-400" : "text-emerald-500 hover:text-emerald-400"
                )}
              >
                <Play className="h-3 w-3" />
                Ops center
              </Link>
            </>
          )}
          {user?.role === "sponsor" && (
            <Link
              href="/sponsor"
              prefetch={true}
              className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1",
                pathname === "/sponsor" ? "text-amber-400" : "text-amber-500 hover:text-amber-400"
              )}
            >
              <Briefcase className="h-3 w-3" />
              Sponsor portal
            </Link>
          )}
          {navLink("/help", "Help")}
        </div>

        {/* Right Side: Virtual Time & Developer switcher */}
        <div className="hidden items-center gap-4 md:flex">
          
          {/* Virtual clock tracker */}
          {isLiveMode && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1.5 border border-amber-500/20 text-[10px] font-mono rounded-sm">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>{virtualTime.split("·")[1]}</span>
            </div>
          )}

          {/* Sandbox Role Switcher button */}
          <div className="relative" ref={roleMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="border-border hover:border-foreground text-[10px] font-bold uppercase tracking-wider h-9 px-3 rounded-none flex items-center gap-1.5 bg-card"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Role: <span className="text-gold">{user?.role || "anonymous"}</span>
            </Button>

            <AnimatePresence>
              {showRoleMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-52 border border-border bg-card shadow-xl z-50 text-xs font-medium text-foreground py-1"
                >
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Sandbox Role Switcher</p>
                  </div>
                  <button
                    onClick={() => handleRoleSwap("super_admin")}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-sky-500 font-semibold flex items-center gap-2"
                  >
                    <Settings className="h-3 w-3" />
                    Super Admin (Arthur)
                  </button>
                  <button
                    onClick={() => handleRoleSwap("organizer")}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-stone-500 font-semibold flex items-center gap-2"
                  >
                    <Settings className="h-3 w-3" />
                    Organizer (Olivia)
                  </button>
                  <button
                    onClick={() => handleRoleSwap("sponsor")}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-amber-500 font-semibold flex items-center gap-2"
                  >
                    <Briefcase className="h-3 w-3" />
                    Sponsor Partner (Figma)
                  </button>
                  <button
                    onClick={() => handleRoleSwap("speaker")}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-blue-500 font-semibold flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    Speaker (Sarah Chen)
                  </button>
                  <button
                    onClick={() => handleRoleSwap("attendee")}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-emerald-500 font-semibold flex items-center gap-2"
                  >
                    <Play className="h-3 w-3" />
                    Attendee (Alex)
                  </button>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted text-muted-foreground"
                  >
                    Clear Credentials
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/95 transition-colors px-4 rounded-none h-9 text-[10px] font-bold uppercase tracking-wider" asChild>
            <Link href="/pass" prefetch={true}>QR Ticket Pass</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center md:hidden text-foreground"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="border-b border-border bg-background md:hidden absolute top-full left-0 w-full shadow-lg z-50 text-xs font-bold uppercase tracking-wider"
          >
            <div className="flex flex-col gap-1 px-4 py-6">
              <Link href="/schedule" prefetch={true} className="px-3 py-3 border-b border-border">
                Schedule
              </Link>
              {user && (
                <>
                  <Link href="/agenda" prefetch={true} className="px-3 py-3 border-b border-border">
                    My Agenda
                  </Link>
                  <Link href="/pass" prefetch={true} className="px-3 py-3 border-b border-border">
                    QR Pass
                  </Link>
                </>
              )}
              {(user?.role === "organizer" || user?.role === "super_admin") && (
                <>
                  <Link href="/admin" prefetch={true} className="px-3 py-3 border-b border-border text-stone-500">
                    CMS Panel
                  </Link>
                  <Link href="/ops" prefetch={true} className="px-3 py-3 border-b border-border text-emerald-500">
                    Ops center
                  </Link>
                </>
              )}
              {user?.role === "sponsor" && (
                <Link href="/sponsor" prefetch={true} className="px-3 py-3 border-b border-border text-amber-500">
                  Sponsor Portal
                </Link>
              )}
              <Link href="/help" prefetch={true} className="px-3 py-3 border-b border-border">
                Help
              </Link>
              <div className="mt-6 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {(["super_admin", "organizer", "sponsor", "attendee", "speaker"] as const).map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      className="rounded-none text-[10px] font-bold uppercase tracking-wider"
                      onClick={() => handleRoleSwap(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
                <Button className="w-full rounded-none" asChild>
                  <Link href="/pass" prefetch={true}>QR Ticket Pass</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
