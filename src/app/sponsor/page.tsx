"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/providers/auth-provider";
import { recordLeadScanAction, updateSponsorBoothAction, getSponsorById, getSponsorLeads } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Download, Camera, ShieldAlert, Award, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { telemetry } from "@/lib/telemetry";
import { PageTransition } from "@/animations/PageTransition";

export default function SponsorPage() {
  const { user, can, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Sponsor state records
  const [sponsorRecord, setSponsorRecord] = useState<any>(null);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [description, setDescription] = useState("");

  // Scan lead form state
  const [scanEmail, setScanEmail] = useState("");
  const [submittingScan, setSubmittingScan] = useState(false);

  // Load leads and sponsor configurations
  const loadSponsorDetails = async () => {
    try {
      const spn = await getSponsorById("spn_figma");
      setSponsorRecord(spn);
      setDescription(spn?.description || "");

      const leads = await getSponsorLeads("spn_figma");
      setLeadsList(
        leads.map((l) => ({
          id: l.id,
          name: l.user?.name || "Anonymous",
          email: l.user?.email || "",
          date: new Date(l.scannedAt).toLocaleTimeString(),
        }))
      );
    } catch (err) {
      toast.error("Failed to sync sponsor records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorDetails();
  }, []);

  // All hooks declared — now safe to conditionally render
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // Enforce access control guard (after all hooks)
  if (!user || !can("leads:read")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive animate-pulse" />
          <h2 className="mt-4 text-2xl font-serif text-foreground">Access Denied</h2>
          <p className="mt-2 text-muted-foreground max-w-sm text-sm">
            Sponsor Portal requires sponsor credentials. Switch roles to Sponsor using the selector inside the navigation bar header.
          </p>
        </div>
      </div>
    );
  }

  const handleScanNFC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanEmail) return;

    setSubmittingScan(true);
    try {
      telemetry.track("action", "Initiated Sponsor NFC Scan simulation", { email: scanEmail });
      
      const result = await recordLeadScanAction(user.role, "spn_figma", scanEmail);
      
      toast.success(`Success: NFC Pass Scanned`, {
        description: `Lead Captured: ${result.lead.name} (${result.lead.email})`,
      });

      setScanEmail("");
      // Reload sponsor details
      await loadSponsorDetails();
    } catch (err: any) {
      toast.error(err.message || "Invalid registration pass email. Try 'attendee@designare.co'.");
    } finally {
      setSubmittingScan(false);
    }
  };

  const handleExportCSV = () => {
    telemetry.track("action", "Exported Booth Leads Spreadsheet", { sponsorId: "spn_figma" });
    
    // Generate text/csv data
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Email,Scan Time", ...leadsList.map(l => `"${l.name}","${l.email}","${l.date}"`)].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "designare_figma_booth_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Spreadsheet Downloaded", {
      description: "Excel-compatible CSV logs exported successfully.",
    });
  };

  const handleSaveBooth = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        telemetry.track("action", "Updated Booth Assets", { description });
        await updateSponsorBoothAction(user.role, "spn_figma", description, JSON.stringify([]));
        toast.success("Booth configurations updated on database.");
      } catch (err) {
        toast.error("Failed to commit booth changes.");
      }
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-28 pb-20 text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Portal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-gold">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Sponsor Hub</span>
              </div>
              <h1 className="font-serif text-5xl font-normal mt-2">Partner Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Capture attendee lanyards, export spreadsheets, and configure booth assets dynamically.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats summaries */}
              <div className="grid gap-6 sm:grid-cols-3">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Leads Captured</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-bold text-foreground">{sponsorRecord?.leadScanCount || 0}</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Booth Engagements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-bold text-foreground">{sponsorRecord?.clickCount || 0}</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Booth Tier Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-serif text-gold capitalize">{sponsorRecord?.tier || "Gold"} Partner</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                
                {/* Column 1: Captured Leads logs */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">Leads capture logs</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Attendee credentials collected via NFC check-in pass triggers.
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-stone-400 hover:border-foreground font-bold text-xs uppercase tracking-wider"
                        onClick={handleExportCSV}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                              <th className="pb-3">Name</th>
                              <th className="pb-3">Email</th>
                              <th className="pb-3">Scan Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {leadsList.map((lead) => (
                              <tr key={lead.id} className="text-foreground">
                                <td className="py-3 font-semibold">{lead.name}</td>
                                <td className="py-3 text-muted-foreground">{lead.email}</td>
                                <td className="py-3 font-mono text-muted-foreground">{lead.date}</td>
                              </tr>
                            ))}
                            {leadsList.length === 0 && (
                              <tr>
                                <td colSpan={3} className="text-center py-6 text-muted-foreground italic">No leads scanned yet. Use the scanner simulator!</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Column 2: Simulated NFC input */}
                <div className="space-y-6">
                  
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gold" />
                        <CardTitle className="text-sm font-bold uppercase tracking-wider">NFC Badge Scanner</CardTitle>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        Simulate scanning attendee passes (type an attendee email address below).
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleScanNFC} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Pass Email</label>
                          <Input
                            placeholder="e.g. attendee@designare.co"
                            value={scanEmail}
                            onChange={(e) => setScanEmail(e.target.value)}
                            className="rounded-none focus:border-foreground text-xs"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={submittingScan}
                          className="w-full bg-foreground text-background hover:bg-foreground/95 font-bold uppercase tracking-wider text-xs rounded-none h-11"
                        >
                          {submittingScan ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Briefcase className="h-4 w-4 mr-2" />
                          )}
                          {submittingScan ? "Scanning..." : "Simulate Pass Scan"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider">Booth Content Assets</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Update showcase details visible to attendees.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveBooth} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Booth Description</label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="rounded-none focus:border-foreground min-h-[100px] text-xs text-foreground"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isPending}
                          className="w-full bg-foreground text-background hover:bg-foreground/95 font-bold uppercase tracking-wider text-xs rounded-none h-11"
                        >
                          {isPending ? "Saving..." : "Commit Booth Changes"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
