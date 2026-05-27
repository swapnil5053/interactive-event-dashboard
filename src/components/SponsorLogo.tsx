"use client";

import { cn } from "@/lib/utils";

export type SponsorTier = "gold" | "silver" | "community";

export interface Sponsor {
  name: string;
  logo: string;
  tier: SponsorTier;
}

interface SponsorLogoProps {
  sponsor: Sponsor;
  className?: string;
}

const tierSizes: Record<SponsorTier, string> = {
  gold: "h-16 md:h-20",
  silver: "h-12 md:h-14",
  community: "h-8 md:h-10",
};

export function SponsorLogo({ sponsor, className }: SponsorLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/30 hover:shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          tierSizes[sponsor.tier]
        )}
      >
        <span className="text-xl font-semibold">{sponsor.name}</span>
      </div>
    </div>
  );
}
