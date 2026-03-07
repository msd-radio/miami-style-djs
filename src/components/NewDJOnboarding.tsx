import { useState } from "react";
import { motion } from "framer-motion";
import { Check, FileText, Send, ChevronDown, ChevronUp, Music, Radio, Headphones, Mic, Clock, Shield, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

const CONTRACT_TEXT = `MIAMI STYLE DJ's — INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is entered into between Miami Style DJ's ("Station") and the undersigned DJ ("Contractor").

1. ENGAGEMENT: The Station engages the Contractor as an independent on-air personality / DJ for scheduled programming as assigned.

2. TERM: This agreement begins on the date of signature and continues on a month-to-month basis unless terminated by either party with 14 days written notice.

3. COMPENSATION: Contractor will be compensated per the rate schedule provided separately. Payment is issued bi-weekly via direct deposit or check.

4. CONTENT STANDARDS: Contractor agrees to comply with all FCC regulations, Station content guidelines, and the Miami Style DJ's Code of Conduct at all times during broadcasts.

5. EQUIPMENT: The Station provides all studio equipment. Contractor may use personal equipment (controllers, headphones) with prior approval. Contractor is responsible for any damage to Station equipment caused by negligence.

6. SCHEDULING: Contractor agrees to arrive at least 30 minutes before their scheduled set time. Failure to show without 4-hour advance notice may result in suspension or termination.

7. SOCIAL MEDIA: Contractor grants the Station permission to use their name, likeness, and DJ name for promotional purposes across all platforms.

8. NON-COMPETE: During the term of this agreement, Contractor agrees not to host a competing live radio show on any other terrestrial or internet radio station within the Miami-Dade market.

9. INTELLECTUAL PROPERTY: All recordings, mixes, and content produced during Station broadcasts remain the property of Miami Style DJ's.

10. TERMINATION: Either party may terminate this agreement with 14 days written notice. The Station reserves the right to terminate immediately for cause, including but not limited to FCC violations, no-shows, or conduct detrimental to the Station.

By signing below, both parties agree to the terms outlined above.`;

const preShowChecklist = [
  { id: "arrive", label: "Arrive at studio 30 minutes before your set", category: "Before Set" },
  { id: "signin", label: "Sign in at the front desk log", category: "Before Set" },
  { id: "check-eq", label: "Check all equipment is powered on and functional", category: "Before Set" },
  { id: "headphones", label: "Test headphones and monitor levels", category: "Before Set" },
  { id: "playlist", label: "Have your playlist / crates ready and organized", category: "Before Set" },
  { id: "mic-check", label: "Perform a mic check with the engineer", category: "Before Set" },
  { id: "handoff", label: "Coordinate handoff with the outgoing DJ", category: "Before Set" },
  { id: "socials", label: "Post 'Going Live' on your socials & tag @MiamiStyleDJs", category: "During Set" },
  { id: "breaks", label: "Run ad breaks at the scheduled times", category: "During Set" },
  { id: "fcc", label: "Monitor content for FCC compliance at all times", category: "During Set" },
  { id: "engage", label: "Engage listeners — shoutouts, requests, contests", category: "During Set" },
  { id: "log-tracks", label: "Log all tracks played in the station system", category: "After Set" },
  { id: "power-down", label: "Power down personal equipment, leave studio clean", category: "After Set" },
  { id: "signout", label: "Sign out at the front desk log", category: "After Set" },
];

const stationInfo = [
  { icon: Radio, title: "Station Frequency", detail: "Online Stream — MiamiStyleDJs.com" },
  { icon: Mic, title: "Studio Location", detail: "Miami, FL — Address provided after contract signing" },
  { icon: Clock, title: "Studio Hours", detail: "24/7 — Staffed 6AM–2AM, automated overnight" },
  { icon: Users, title: "Program Director", detail: "Contact: admin@miamistyledjs.com" },
  { icon: Shield, title: "Emergency Contact", detail: "Station Hotline provided in welcome packet" },
  { icon: BookOpen, title: "FCC Guidelines", detail: "Review required — provided in DJ handbook" },
];

const NewDJOnboarding = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [contractSent, setContractSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    info: true, checklist: false, contract: false,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((completedCount / preShowChecklist.length) * 100);

  const handleSignContract = () => {
    if (!signatureName.trim()) {
      toast.error("Please enter your full name to sign.");
      return;
    }
    setContractSigned(true);
    toast.success("Contract signed! 🔥");
  };

  const handleSendContract = async () => {
    if (!contractSigned) {
      toast.error("Please sign the contract first.");
      return;
    }
    setSending(true);
    // Simulate sending — in production this would call an edge function
    await new Promise((r) => setTimeout(r, 1500));
    setContractSent(true);
    setSending(false);
    toast.success("Contract sent to admin@miamistyledjs.com! 🎉");
  };

  const categories = [...new Set(preShowChecklist.map((item) => item.category))];

  return (
    <section id="onboarding" className="py-24 relative">
      <div className="absolute top-40 left-20 w-80 h-80 rounded-full bg-primary/8 blur-[120px]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-fire mb-4">
            New DJ Onboarding
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Welcome to the Miami Style DJ's family! Complete the steps below to get set up and ready to rock the airwaves. 🔥
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Station Info */}
          <SectionCard
            title="Station Information"
            icon={<Radio className="w-5 h-5 text-primary" />}
            expanded={expandedSections.info}
            onToggle={() => toggleSection("info")}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {stationInfo.map((info) => (
                <div key={info.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <info.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">{info.title}</p>
                    <p className="text-xs text-muted-foreground">{info.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Checklist */}
          <SectionCard
            title={`Pre-Show Checklist (${completedCount}/${preShowChecklist.length})`}
            icon={<Headphones className="w-5 h-5 text-primary" />}
            expanded={expandedSections.checklist}
            onToggle={() => toggleSection("checklist")}
            badge={progress === 100 ? "✅ Complete" : `${progress}%`}
          >
            <div className="mb-4">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-fire rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            {categories.map((cat) => (
              <div key={cat} className="mb-4 last:mb-0">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-accent mb-2">{cat}</h4>
                <div className="space-y-2">
                  {preShowChecklist
                    .filter((item) => item.category === cat)
                    .map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          checkedItems[item.id]
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-card hover:border-primary/20"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            checkedItems[item.id]
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30"
                          }`}
                          onClick={() => toggleCheck(item.id)}
                        >
                          {checkedItems[item.id] && <Check size={14} className="text-primary-foreground" />}
                        </div>
                        <span
                          className={`text-sm ${checkedItems[item.id] ? "text-muted-foreground line-through" : "text-foreground"}`}
                          onClick={() => toggleCheck(item.id)}
                        >
                          {item.label}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </SectionCard>

          {/* Contract */}
          <SectionCard
            title="DJ Contract"
            icon={<FileText className="w-5 h-5 text-primary" />}
            expanded={expandedSections.contract}
            onToggle={() => toggleSection("contract")}
            badge={contractSent ? "✅ Sent" : contractSigned ? "Signed" : undefined}
          >
            <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto border border-border">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-body leading-relaxed">
                {CONTRACT_TEXT}
              </pre>
            </div>

            {!contractSigned ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Full Legal Name (Electronic Signature)
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                    placeholder="Enter your full legal name..."
                    maxLength={100}
                  />
                </div>
                <button
                  onClick={handleSignContract}
                  disabled={!signatureName.trim()}
                  className="px-6 py-2.5 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  Sign Contract
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/40 bg-primary/5">
                  <Check className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">Signed by: {signatureName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
                {!contractSent ? (
                  <button
                    onClick={handleSendContract}
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    <Send size={16} />
                    {sending ? "Sending..." : "Send to admin@miamistyledjs.com"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-accent font-heading font-bold">
                    <Check size={16} />
                    Contract sent successfully!
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </section>
  );
};

const SectionCard = ({
  title,
  icon,
  expanded,
  onToggle,
  badge,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="border border-border rounded-xl bg-card overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-heading font-bold text-foreground text-left">{title}</h3>
        {badge && (
          <span className="text-xs font-heading font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
    </button>
    {expanded && <div className="px-5 pb-5">{children}</div>}
  </motion.div>
);

export default NewDJOnboarding;
