"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { telemetry } from "@/lib/telemetry";

const TelemetryContext = createContext<typeof telemetry | undefined>(undefined);

function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    telemetry.track("page_view", "Page Loaded", { url });
  }, [pathname, searchParams]);

  return null;
}

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [role='button']");
      if (clickable) {
        const text = clickable.textContent?.trim().substring(0, 30) || "";
        const id = clickable.id || "";
        const tag = clickable.tagName.toLowerCase();
        telemetry.track("click", `Clicked ${tag}`, { text, id });
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <TelemetryContext.Provider value={telemetry}>
      <React.Suspense fallback={null}>
        <RouteTracker />
      </React.Suspense>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
