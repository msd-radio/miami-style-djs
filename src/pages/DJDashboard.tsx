import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User, Music, Mic2, Settings, Sparkles, BookOpen } from "lucide-react";
import logo from "@/assets/miami-style-djs-logo.jpg";
import type { User as SupaUser } from "@supabase/supabase-js";

const DJDashboard = () => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiClip, setAiClip] = useState("");
  const [generatingClip, setGeneratingClip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/dj-portal");
        return;
      }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/dj-portal");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("dj_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/dj-portal");
  };

  const generateShowClip = async () => {
    setGeneratingClip(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-show-clip", {
        body: {
          djName: profile?.dj_name || user?.user_metadata?.full_name || "DJ",
          genre: profile?.genre || "Hip-Hop",
        },
      });
      if (error) throw error;
      setAiClip(data.clip);
      toast.success("Show clip generated!");
    } catch (err: any) {
      toast.error("Failed to generate clip");
    } finally {
      setGeneratingClip(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Miami Style DJs" className="h-8 rounded" />
            <span className="font-display text-sm font-bold text-foreground uppercase">DJ Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome, <span className="text-gradient-fire">{profile?.dj_name || user?.user_metadata?.full_name || "DJ"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Your DJ command center</p>
        </motion.div>

        {/* Dashboard cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            icon={User}
            title="Profile"
            description={profile ? "Edit your DJ profile" : "Complete your profile setup"}
            action={() => navigate("/dj-portal/onboarding")}
            actionLabel={profile ? "Edit Profile" : "Set Up Profile"}
          />
          <DashboardCard
            icon={Music}
            title="My Shows"
            description="Manage your show schedule and playlists"
            action={() => toast.info("Shows coming soon!")}
            actionLabel="View Shows"
          />
          <DashboardCard
            icon={Sparkles}
            title="AI Show Clips"
            description="Generate intro clips for your shows with AI"
            action={generateShowClip}
            actionLabel={generatingClip ? "Generating..." : "Generate Clip"}
            disabled={generatingClip}
          />
        </div>

        {/* AI generated clip */}
        {aiClip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-card border border-primary/30 mb-8"
          >
            <h3 className="font-heading font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> AI Generated Show Clip
            </h3>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{aiClip}</p>
          </motion.div>
        )}

        {/* Onboarding progress */}
        {!profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 rounded-xl bg-primary/5 border border-primary/20"
          >
            <h3 className="font-heading font-bold text-foreground mb-2">🎯 Complete Your Onboarding</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set up your DJ profile to unlock all portal features and get your public page.
            </p>
            <button
              onClick={() => navigate("/dj-portal/onboarding")}
              className="px-6 py-2 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:scale-[1.02] transition-transform"
            >
              Start Onboarding
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const DashboardCard = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  disabled,
}: {
  icon: any;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  disabled?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
  >
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="font-heading font-bold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <button
      onClick={action}
      disabled={disabled}
      className="text-sm font-heading font-semibold text-primary hover:underline uppercase tracking-wider disabled:opacity-50"
    >
      {actionLabel} →
    </button>
  </motion.div>
);

export default DJDashboard;
