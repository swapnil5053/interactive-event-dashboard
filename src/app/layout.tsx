import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { LiveProvider } from "@/providers/live-provider";
import { TelemetryProvider } from "@/providers/telemetry-provider";
import { CursorTrail } from "@/components/ui/cursor-trail";

export const metadata: Metadata = {
  title: "Designare OS - Premium Event Operating System",
  description: "Design, in its elemental states. A premium design conference platform exploring Air, Water, Fire, and Earth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans selection:bg-primary selection:text-primary-foreground" suppressHydrationWarning>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="ca9852c3-cd6e-4e4f-bb91-496edf690766"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <TelemetryProvider>
          <AuthProvider>
            <LiveProvider>
              <CursorTrail />
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <Toaster position="bottom-right" theme="dark" />
              <VisualEditsMessenger />
            </LiveProvider>
          </AuthProvider>
        </TelemetryProvider>
      </body>
    </html>
  );
}
