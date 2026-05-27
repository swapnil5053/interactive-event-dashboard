import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = "file:local.db";
const client = createClient({ url });
const db = drizzle(client, { schema });

async function main() {
  console.log("🌱 Database seeding starting...");

  // Clear existing tables
  try {
    console.log("🧹 Cleaning old records...");
    await db.delete(schema.boothLeads);
    await db.delete(schema.bookmarks);
    await db.delete(schema.feedback);
    await db.delete(schema.announcements);
    await db.delete(schema.sessions);
    await db.delete(schema.speakers);
    await db.delete(schema.stages);
    await db.delete(schema.sponsors);
    await db.delete(schema.events);
    await db.delete(schema.organizations);
    await db.delete(schema.users);
  } catch (err) {
    console.log("⚠️ Tables might not exist yet, executing inserts directly.");
  }

  // 1. Seed Users (Including different Roles for RBAC validation)
  console.log("👤 Seeding user accounts...");
  const adminId = "usr_admin";
  const sponsorId = "usr_sponsor";
  const speakerId = "usr_speaker";
  const attendeeId = "usr_attendee";

  await db.insert(schema.users).values([
    {
      id: adminId,
      name: "Olivia Vance",
      email: "admin@designare.co",
      role: "organizer",
      onboardingCompleted: true,
      interests: "air,fire",
      createdAt: Date.now(),
    },
    {
      id: sponsorId,
      name: "Figma Team Account",
      email: "sponsor@figma.com",
      role: "sponsor",
      onboardingCompleted: true,
      interests: "air",
      createdAt: Date.now(),
    },
    {
      id: speakerId,
      name: "Sarah Chen",
      email: "sarah@figma.com",
      role: "speaker",
      onboardingCompleted: true,
      interests: "air,water",
      createdAt: Date.now(),
    },
    {
      id: attendeeId,
      name: "Alex Thompson",
      email: "attendee@designare.co",
      role: "attendee",
      onboardingCompleted: true,
      interests: "water,earth",
      createdAt: Date.now(),
    },
  ]);

  // 2. Seed Organization and Event
  console.log("🏢 Seeding organization and events...");
  const orgId = "org_designare";
  const eventId = "evt_conf2026";
  await db.insert(schema.organizations).values({
    id: orgId,
    name: "Designare LLC",
    slug: "designare",
  });

  await db.insert(schema.events).values({
    id: eventId,
    orgId,
    name: "Designare Conference 2026",
    dateRange: "June 15–16, 2026",
    location: "San Francisco, CA",
  });

  // 3. Seed Stages
  console.log("🎭 Seeding stages...");
  const airStage = "stg_air";
  const waterStage = "stg_water";
  const fireStage = "stg_fire";
  const earthStage = "stg_earth";

  await db.insert(schema.stages).values([
    { id: airStage, name: "Air Stage", capacity: 500, currentOccupancy: 340 },
    { id: waterStage, name: "Water Stage", capacity: 300, currentOccupancy: 120 },
    { id: fireStage, name: "Fire Stage", capacity: 200, currentOccupancy: 80 },
    { id: earthStage, name: "Earth Studio", capacity: 120, currentOccupancy: 95 },
  ]);

  // 4. Seed Speakers
  console.log("🎙️ Seeding speakers...");
  const spkChen = "spk_chen";
  const spkWebb = "spk_webb";
  const spkTanaka = "spk_tanaka";
  const spkRivera = "spk_rivera";
  const spkLarsson = "spk_larsson";
  const spkKim = "spk_kim";

  await db.insert(schema.speakers).values([
    {
      id: spkChen,
      name: "Sarah Chen",
      role: "Design Director",
      company: "Figma",
      bio: "Sarah leads Figma's prototyping and system interface divisions.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
      track: "air",
      socialLinks: JSON.stringify({ twitter: "https://twitter.com", github: "https://github.com" }),
    },
    {
      id: spkWebb,
      name: "Marcus Webb",
      role: "Creative Director",
      company: "Airbnb",
      bio: "Marcus shapes emotional experiences and dynamic motion choreography at Airbnb.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      track: "water",
      socialLinks: JSON.stringify({ twitter: "https://twitter.com" }),
    },
    {
      id: spkTanaka,
      name: "Yuki Tanaka",
      role: "CTO",
      company: "Runway",
      bio: "Yuki builds intelligent creative media tools and models for filmmaking.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
      track: "fire",
      socialLinks: JSON.stringify({ github: "https://github.com" }),
    },
    {
      id: spkRivera,
      name: "Alex Rivera",
      role: "VP Design Operations",
      company: "Google",
      bio: "Alex oversees scaling design processes across thousands of active products.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
      track: "earth",
      socialLinks: JSON.stringify({ linkedin: "https://linkedin.com" }),
    },
    {
      id: spkLarsson,
      name: "Emma Larsson",
      role: "Principal Designer",
      company: "Stripe",
      bio: "Emma builds stripe interfaces, checkout flows, and payment dashboard designs.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
      track: "air",
      socialLinks: JSON.stringify({ twitter: "https://twitter.com", dribbble: "https://dribbble.com" }),
    },
    {
      id: spkKim,
      name: "David Kim",
      role: "Design Lead",
      company: "Linear",
      bio: "David orchestrates keyboard-shortcut layouts and editor interactions at Linear.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
      track: "fire",
      socialLinks: JSON.stringify({ github: "https://github.com" }),
    },
  ]);

  // 5. Seed Sessions
  console.log("📅 Seeding session schedule...");
  await db.insert(schema.sessions).values([
    // Day 1
    {
      id: "1",
      title: "Opening Keynote: The Future of Design",
      description: "How generative interfaces and systems will reshape visual engineering landscapes.",
      track: "air",
      level: "beginner",
      time: "9:00 AM",
      duration: "60 min",
      stageId: airStage,
      speakerId: spkChen,
      format: "Keynote",
      day: 1,
    },
    {
      id: "2",
      title: "Building Design Systems That Scale",
      description: "Architectural insights on orchestrating tokenized foundations across platforms.",
      track: "air",
      level: "intermediate",
      time: "10:30 AM",
      duration: "45 min",
      stageId: airStage,
      speakerId: spkLarsson,
      format: "Talk",
      day: 1,
    },
    {
      id: "3",
      title: "Storytelling Through Motion",
      description: "Choreographing premium page transitions and responsive user feedback loops.",
      track: "water",
      level: "beginner",
      time: "10:30 AM",
      duration: "45 min",
      stageId: waterStage,
      speakerId: spkWebb,
      format: "Talk",
      day: 1,
    },
    {
      id: "4",
      title: "Next-Gen Design Workflows",
      description: "Building production integrations with machine models for media editing.",
      track: "fire",
      level: "advanced",
      time: "11:30 AM",
      duration: "60 min",
      stageId: fireStage,
      speakerId: spkTanaka,
      format: "Workshop",
      day: 1,
    },
    {
      id: "5",
      title: "Design Operations at Scale",
      description: "Tactical guidelines for maintaining consistency inside global corporate teams.",
      track: "earth",
      level: "intermediate",
      time: "2:00 PM",
      duration: "45 min",
      stageId: airStage,
      speakerId: spkRivera,
      format: "Case Study",
      day: 1,
    },
    {
      id: "6",
      title: "Generative UI: Beyond the Hype",
      description: "Evaluating real layout engines rendering code output in browser client spaces.",
      track: "fire",
      level: "advanced",
      time: "2:00 PM",
      duration: "45 min",
      stageId: fireStage,
      speakerId: spkKim,
      format: "Talk",
      day: 1,
    },
    // Day 2
    {
      id: "7",
      title: "Component Architecture Deep Dive",
      description: "Server Actions, RSCs, Suspense Boundaries, and clean patterns for hydration.",
      track: "air",
      level: "advanced",
      time: "10:30 AM",
      duration: "45 min",
      stageId: airStage,
      speakerId: spkLarsson,
      format: "Talk",
      day: 2,
    },
  ]);

  // 6. Seed Sponsors
  console.log("🤝 Seeding sponsors...");
  const figSponsor = "spn_figma";
  await db.insert(schema.sponsors).values([
    {
      id: figSponsor,
      name: "Figma",
      logo: "",
      tier: "gold",
      description: "The collaborative interface design tool.",
      boothMedia: JSON.stringify([
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
      ]),
      leadScanCount: 45,
      clickCount: 120,
    },
    {
      id: "spn_framer",
      name: "Framer",
      logo: "",
      tier: "gold",
      description: "Design and publish stunning sites immediately.",
      boothMedia: JSON.stringify([]),
      leadScanCount: 32,
      clickCount: 88,
    },
    {
      id: "spn_linear",
      name: "Linear",
      logo: "",
      tier: "silver",
      description: "The issue tracker you actually like using.",
      boothMedia: JSON.stringify([]),
      leadScanCount: 28,
      clickCount: 95,
    },
    {
      id: "spn_vercel",
      name: "Vercel",
      logo: "",
      tier: "silver",
      description: "Frontend cloud deployment engines.",
      boothMedia: JSON.stringify([]),
      leadScanCount: 40,
      clickCount: 110,
    },
  ]);

  // 7. Seed Initial Bookmark and feedback
  console.log("📌 Seeding bookmarks & feedback...");
  await db.insert(schema.bookmarks).values({
    id: "bmk_1",
    userId: attendeeId,
    sessionId: "1",
    createdAt: Date.now(),
  });

  await db.insert(schema.feedback).values({
    id: "fb_1",
    userId: attendeeId,
    sessionId: "1",
    rating: 5,
    comment: "Absolutely stellar opening. Mind blown by the visual elements!",
    sentiment: "positive",
    createdAt: Date.now(),
  });

  // 8. Seed Live Announcements
  console.log("📢 Seeding announcements...");
  await db.insert(schema.announcements).values([
    {
      id: "anc_1",
      title: "Schedule Shift",
      message: "Next-Gen Design Workflows moved from Fire Stage to Air Stage due to capacity demand.",
      category: "schedule",
      timestamp: Date.now() - 3600000,
      isPinned: true,
    },
    {
      id: "anc_2",
      title: "Opening Soon",
      message: "Check-in doors are open. Collect your pass and NFC badge at the front entrance.",
      category: "info",
      timestamp: Date.now() - 7200000,
      isPinned: false,
    },
  ]);

  console.log("✨ Database successfully seeded!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
