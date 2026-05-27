"use client";

// Observability trace log schema
export interface TelemetryEvent {
  id: string;
  timestamp: number;
  type: "page_view" | "click" | "action" | "error" | "performance";
  name: string;
  properties?: Record<string, any>;
  durationMs?: number;
}

const STORAGE_KEY = "designare_telemetry_logs";
const MAX_LOGS = 100;

export const telemetry = {
  track: (
    type: TelemetryEvent["type"],
    name: string,
    properties?: Record<string, any>,
    durationMs?: number
  ) => {
    if (typeof window === "undefined") return;

    const event: TelemetryEvent = {
      id: `tel_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      type,
      name,
      properties,
      durationMs,
    };

    // Log to console in development
    console.log(`[Telemetry Trace] [${type.toUpperCase()}] ${name}`, {
      properties,
      durationMs,
    });

    try {
      const logs = telemetry.getLogs();
      const updated = [event, ...logs].slice(0, MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Dispatch event to allow dashboards to bind realtime logs
      window.dispatchEvent(new CustomEvent("designare_telemetry_event", { detail: event }));
    } catch (err) {
      // Storage limits or quota error
    }
  },

  getLogs: (): TelemetryEvent[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  clearLogs: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("designare_telemetry_event"));
  },
};
