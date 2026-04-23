import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Music, Instagram, Headphones, ArrowLeft } from "lucide-react";
import logo from "@/assets/miami-style-djs-logo.jpg";

// Only allow https:// links to be rendered as clickable hrefs.
// Blocks javascript:, data:, and other dangerous schemes that bypass `rel`.
const safeHttpsUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

const DJProfile = () => {
  const { djName } = useParams<{ djName: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!djName) return;
      const decoded = decodeURIComponent(djName).replace(/-/g, " ");
      const { data, error } = await supabase
        .from("dj_profiles")
        .select(
          "id, dj_name, genre, bio, profile_image_url, instagram_url, soundcloud_url, created_at"
        )
        .ilike("dj_name", decoded)
        .eq("is_active", true)
        .eq("onboarding_complete", true)
        .maybeSingle();

      if (!data || error) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [djName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">DJ Not Found</h1>
        <p className="text-muted-foreground mb-6">This DJ profile doesn't exist or isn't public yet.</p>
        <Link to="/" className="text-primary font-heading font-semibold hover:underline uppercase tracking-wider">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Miami Style DJs" className="h-8 rounded" />
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {profile.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={profile.dj_name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-6 object-cover border-4 border-primary/30 shadow-glow"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-6 bg-primary/10 flex items-center justify-center border-4 border-primary/30">
              <Headphones className="w-12 h-12 text-primary" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-fire mb-2">
            {profile.dj_name}
          </h1>
          {profile.genre && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-heading font-semibold uppercase tracking-wider mt-3"
            >
              <Music size={14} /> {profile.genre}
            </motion.div>
          )}
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <h2 className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </motion.div>
        )}

        {/* Social links */}
        {(profile.instagram_url || profile.soundcloud_url) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {profile.instagram_url && safeHttpsUrl(profile.instagram_url) && (
              <a
                href={safeHttpsUrl(profile.instagram_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card border border-border hover:border-primary/40 text-foreground font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
              >
                <Instagram size={18} className="text-primary" /> Instagram
              </a>
            )}
            {profile.soundcloud_url && safeHttpsUrl(profile.soundcloud_url) && (
              <a
                href={safeHttpsUrl(profile.soundcloud_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card border border-border hover:border-primary/40 text-foreground font-heading font-semibold text-sm uppercase tracking-wider transition-colors"
              >
                <Headphones size={18} className="text-primary" /> SoundCloud
              </a>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DJProfile;
