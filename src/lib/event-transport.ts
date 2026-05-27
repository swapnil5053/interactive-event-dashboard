"use client";

import { telemetry } from "@/lib/telemetry";

type EventCallback = (data: any) => void;

class EventTransport {
  private listeners: Record<string, EventCallback[]> = {};

  constructor() {
    if (typeof window !== "undefined") {
      // Intercept system level live-ticks and route to active listeners
      window.addEventListener("designare_live_tick", (e: any) => {
        const { channel, data } = e.detail || {};
        if (channel && this.listeners[channel]) {
          this.listeners[channel].forEach((cb) => cb(data));
        }
      });
    }
  }

  // Subscribe to live feed channels (announcements, occupancy, leads)
  public subscribe(channel: string, callback: EventCallback) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
    telemetry.track("action", "Subscribed to event channel", { channel });

    return () => {
      this.listeners[channel] = this.listeners[channel].filter((cb) => cb !== callback);
      telemetry.track("action", "Unsubscribed from event channel", { channel });
    };
  }

  // Publish event, routing immediately to local channels and logging observability traces
  public publish(channel: string, data: any) {
    telemetry.track("action", "Published Event Broadcast", { channel, data });

    if (this.listeners[channel]) {
      this.listeners[channel].forEach((cb) => cb(data));
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("designare_live_tick", {
          detail: { channel, data },
        })
      );
    }
  }
}

export const eventTransport = new EventTransport();
export type EventTransportType = typeof eventTransport;
