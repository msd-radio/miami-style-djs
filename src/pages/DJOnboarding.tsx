import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";

const steps = ["Basic Info", "Genre & Style", "Bio & Links", "Complete"];

const DJOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    dj_name: "",
    genre: "",
    bio: "",
    instagram: "",
    soundcloud: "",
    profile_image_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/dj-portal");
        return;
      }
      setUserId(session.user.id);
      setForm((f) => ({
        ...f,
        dj_name: session.user.user_metadata?.full_name || "",
      }));
    });
  }, [navigate]);

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("dj_profiles").upsert({
        user_id: userId,
        dj_name: form.dj_name,
        genre: form.genre,
        bio: form.bio,
        instagram_url: form.instagram,
        soundcloud_url: form.soundcloud,
        profile_image_url: form.profile_image_url,
        onboarding_complete: true,
      }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Profile created! Welcome to Miami Style DJ's 🔥");
      navigate("/dj-portal/dashboard");
    } catch (err: any) {
      console.error("Profile save error:", err?.message);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isValidImageUrl = (url: string) => {
    if (!url.trim()) return true; // optional field
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const canNext = () => {
    if (currentStep === 0) return form.dj_name.trim().length > 0 && isValidImageUrl(form.profile_image_url);
    if (currentStep === 1) return form.genre.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-primary/10 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-card border border-border rounded-2xl p-8 relative z-10"
      >
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < currentStep
                    ? "bg-primary text-primary-foreground"
                    : i === currentStep
                    ? "bg-gradient-fire text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStep ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-display font-bold text-foreground mb-1">{steps[currentStep]}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {currentStep === 0 && "What should we call you on air?"}
          {currentStep === 1 && "What genres define your sound?"}
          {currentStep === 2 && "Tell listeners about yourself."}
          {currentStep === 3 && "You're all set! Let's go live."}
        </p>

        {/* Step content */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <InputField label="DJ Name" value={form.dj_name} onChange={(v) => handleChange("dj_name", v)} placeholder="DJ Blaze" />
            <InputField label="Profile Image URL (optional)" value={form.profile_image_url} onChange={(v) => handleChange("profile_image_url", v)} placeholder="https://..." />
            {form.profile_image_url.trim() && !isValidImageUrl(form.profile_image_url) && (
              <p className="text-xs text-destructive mt-1">Must be a valid HTTPS URL</p>
            )}
          </div>
        )}
        {currentStep === 1 && (
          <div className="space-y-4">
            <InputField label="Primary Genre" value={form.genre} onChange={(v) => handleChange("genre", v)} placeholder="Hip-Hop, EDM, House..." />
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition resize-none"
                placeholder="Tell us your story..."
              />
            </div>
            <InputField label="Instagram" value={form.instagram} onChange={(v) => handleChange("instagram", v)} placeholder="@yourhandle" />
            <InputField label="SoundCloud" value={form.soundcloud} onChange={(v) => handleChange("soundcloud", v)} placeholder="https://soundcloud.com/..." />
          </div>
        )}
        {currentStep === 3 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="text-lg font-heading font-bold text-foreground">You're ready!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your DJ profile for <span className="text-primary">{form.dj_name}</span> will be created.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-5 py-2 rounded-lg border border-border text-muted-foreground font-heading text-sm uppercase tracking-wider hover:border-primary/50 transition-colors disabled:opacity-30"
          >
            Back
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canNext()}
              className="px-5 py-2 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Creating..." : "Complete Setup"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div>
    <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
      placeholder={placeholder}
    />
  </div>
);

export default DJOnboarding;
