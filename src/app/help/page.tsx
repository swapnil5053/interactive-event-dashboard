"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ChevronDown, Shield, AlertTriangle } from "lucide-react";
import { PageTransition } from "@/animations/PageTransition";
import { toast } from "sonner";

const quickHelp = [
  { icon: MapPin, label: "Help Desk", value: "Level 1, near Registration" },
  { icon: Phone, label: "Phone", value: "+1 (415) 555-0126" },
  { icon: Mail, label: "Email", value: "help@designare.conf" },
];

const faqCategories = [
  {
    id: "pass",
    title: "Pass & Entry",
    questions: [
      {
        q: "How do I access my pass?",
        a: "Your digital pass is available in the 'My Pass' section of this app. You can also add it to your mobile wallet for quick access at entry.",
      },
      {
        q: "What if I forgot my pass?",
        a: "Visit the Help Desk at Level 1 with a valid photo ID. We can look up your registration and issue a replacement badge.",
      },
      {
        q: "Can I transfer my pass to someone else?",
        a: "Passes are non-transferable. If you can no longer attend, please contact us about refund options at least 7 days before the event.",
      },
    ],
  },
  {
    id: "venue",
    title: "Venue & Facilities",
    questions: [
      {
        q: "Is there WiFi available?",
        a: "Yes, complimentary high-speed WiFi is available throughout the venue. Network: 'Designare2026' / Password: 'elements'",
      },
      {
        q: "Where can I find food and drinks?",
        a: "The Main Café on Level 1 serves coffee and light snacks. The Food Court on Level 2 offers full meals. Water stations are available on all levels.",
      },
      {
        q: "Are there charging stations?",
        a: "Charging stations are located near each stage entrance and in the networking areas. We recommend bringing your own cable.",
      },
    ],
  },
  {
    id: "schedule",
    title: "Schedule & Sessions",
    questions: [
      {
        q: "Can I attend any session?",
        a: "Most sessions are open to all attendees on a first-come, first-served basis. Some workshops have limited capacity and may require pre-registration.",
      },
      {
        q: "Will sessions be recorded?",
        a: "Keynotes and main stage talks will be recorded and available to attendees 2 weeks after the conference. Workshops are not recorded.",
      },
      {
        q: "What if a session is full?",
        a: "If a session reaches capacity, an overflow viewing area will be set up nearby. You can also save it to your agenda and watch the recording later.",
      },
    ],
  },
  {
    id: "conduct",
    title: "Code of Conduct",
    questions: [
      {
        q: "What is the code of conduct?",
        a: "We are committed to providing a harassment-free, inclusive experience for everyone. All attendees, speakers, and staff must follow our code of conduct.",
      },
      {
        q: "How do I report an issue?",
        a: "Report any concerns to our Safety Team at the Help Desk, call our hotline at +1 (415) 555-0911, or use the 'Report' button in this app.",
      },
    ],
  },
  {
    id: "emergency",
    title: "Emergency",
    questions: [
      {
        q: "What should I do in an emergency?",
        a: "Follow instructions from venue staff. Emergency exits are clearly marked. Assembly points are in the plaza outside the main entrance.",
      },
      {
        q: "Where is the first aid station?",
        a: "First aid is available at the Help Desk on Level 1. For medical emergencies, alert any staff member immediately.",
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-xs uppercase tracking-wider text-foreground px-4"
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 px-4 text-xs text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("pass");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground pb-20">
        <section className="border-b border-border bg-muted/30 pt-28">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-serif text-4xl font-normal text-foreground">Help & FAQ</h1>
              <p className="mt-2 text-muted-foreground text-sm">Get answers to common questions</p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 rounded-none border border-gold/30 bg-gold/5 p-6"
          >
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">Quick Help channels</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickHelp.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-gold/15 border border-gold/20">
                    <item.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <nav className="sticky top-24 space-y-1">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full rounded-none px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-colors ${
                      activeCategory === category.id
                        ? "bg-gold/10 text-gold border-l-2 border-gold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">
                {faqCategories.map(
                  (category) =>
                    activeCategory === category.id && (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-foreground">
                          {category.title}
                        </h2>
                        <div className="rounded-none border border-border bg-card">
                          {category.questions.map((faq, index) => (
                            <FAQItem key={index} question={faq.q} answer={faq.a} />
                          ))}
                        </div>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 rounded-none border border-border bg-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-gold/10 border border-gold/25">
                <Shield className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Code of Conduct</h3>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  Designare OS is dedicated to providing a harassment-free experience for 
                  everyone, regardless of gender, gender identity and expression, age, sexual orientation, 
                  disability, physical appearance, body size, race, ethnicity, religion, or technology choices.
                </p>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  We do not tolerate harassment of conference participants in any form. Sexual language 
                  and imagery is not appropriate for any conference venue, including talks, workshops, 
                  parties, and online spaces.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-none border-stone-400 font-bold text-xs uppercase tracking-wider h-11 px-5"
                  onClick={() => toast.info("Code of Conduct: In line with industry standards, all participants must treat others with respect. Report infractions to our team.")}
                >
                  Read Full Code of Conduct
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 rounded-none border border-amber-500/20 bg-amber-500/5 p-6 text-amber-500"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-widest">Report a Concern</h3>
                <p className="mt-4 text-xs text-amber-600/90 leading-relaxed">
                  If you experience or witness any behavior that violates our code of conduct, please 
                  report it immediately. Your safety and comfort is our priority.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-black font-bold text-[10px] uppercase tracking-wider h-10 px-4 rounded-none"
                    onClick={() => toast.success("Safety Incident Report Form Initiated", { description: "Our safety team has been notified. We will reach out immediately." })}
                  >
                    Report Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-[10px] font-bold uppercase tracking-wider h-10 px-4 rounded-none bg-transparent"
                    onClick={() => toast.info("Dialing Safety Hotline: +1 (415) 555-0911")}
                  >
                    Call Safety Hotline
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
