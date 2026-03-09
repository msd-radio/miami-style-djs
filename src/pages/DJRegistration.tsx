import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Music, User, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/dj-registration-hero.jpg";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const DJRegistration = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    djName: "",
    firstName: "",
    lastName: "",
    email: "",
    experience: "",
    state: "",
    phone: "",
    facebook: "",
    instagram: "",
    howFound: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed.", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === "photo") {
      setProfilePhoto(file);
      setProfilePhotoPreview(url);
    } else {
      setLogoFile(file);
      setLogoPreview(url);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/dj-portal/onboarding-guide`,
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Google sign-in failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.djName || !form.firstName || !form.lastName || !form.email || !form.experience || !form.state || !form.phone || !form.facebook || !form.instagram) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Sign up the DJ with their email
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: crypto.randomUUID().slice(0, 16) + "Aa1!",
        options: {
          data: {
            full_name: `${form.firstName} ${form.lastName}`,
            dj_name: form.djName,
            phone: form.phone,
            experience: form.experience,
            state: form.state,
            facebook: form.facebook,
            instagram: form.instagram,
            how_found: form.howFound,
          },
        },
      });

      if (error) throw error;

      // Call edge function to send emails (runs asynchronously)
      supabase.functions.invoke("send-dj-registration", {
        body: form,
      }).catch(console.error);

      toast({
        title: "🎉 Registration Submitted!",
        description: "Welcome to Miami Style DJs! Redirecting to Onboarding...",
      });

      setForm({ djName: "", firstName: "", lastName: "", email: "", experience: "", state: "", phone: "", facebook: "", instagram: "", howFound: "" });
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      setLogoFile(null);

      // Redirect to onboarding guide
      setTimeout(() => {
        navigate("/dj-portal/onboarding-guide");
      }, 1500);
      setLogoPreview(null);
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-gradient-fire leading-tight">
              Live Stream DJ Registration
            </h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-xl">
              Thank you for your interest in the{" "}
              <span className="text-primary font-bold">Miami Style DJ's Radio LIVE STREAM</span>.
              Please fill out this form to get registered.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <img
              src={heroImg}
              alt="Miami Style DJs Live Stream"
              className="w-full max-w-md rounded-2xl shadow-fire"
            />
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-4 pb-20">
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-10 space-y-8 shadow-glow"
        >
          {/* DJ Name */}
          <div className="space-y-2">
            <Label htmlFor="djName" className="text-foreground font-heading uppercase tracking-wider text-sm">
              DJ Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="djName"
              placeholder="Your DJ Name"
              value={form.djName}
              onChange={(e) => set("djName", e.target.value)}
              className="bg-background border-border"
              maxLength={100}
            />
          </div>

          {/* Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-heading uppercase tracking-wider text-sm">
                First Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                className="bg-background border-border"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-heading uppercase tracking-wider text-sm">
                Last Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                className="bg-background border-border"
                maxLength={100}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-heading uppercase tracking-wider text-sm">
              E-mail <span className="text-primary">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="bg-background border-border"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">ex: myname@example.com</p>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label className="text-foreground font-heading uppercase tracking-wider text-sm">
              Years of Experience <span className="text-primary">*</span>
            </Label>
            <Select value={form.experience} onValueChange={(v) => set("experience", v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label className="text-foreground font-heading uppercase tracking-wider text-sm">
              State <span className="text-primary">*</span>
            </Label>
            <Select value={form.state} onValueChange={(v) => set("state", v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="State / Province" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-heading uppercase tracking-wider text-sm">
              Phone Number <span className="text-primary">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(000) 000-0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="bg-background border-border"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">ex: (666) 666-6666</p>
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook" className="text-foreground font-heading uppercase tracking-wider text-sm">
              Facebook <span className="text-primary">*</span>
            </Label>
            <Input
              id="facebook"
              placeholder="https://www.facebook.com/yourpage"
              value={form.facebook}
              onChange={(e) => set("facebook", e.target.value)}
              className="bg-background border-border"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">ex: https://www.facebook.com/djbradmusicfanpage</p>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-foreground font-heading uppercase tracking-wider text-sm">
              Instagram <span className="text-primary">*</span>
            </Label>
            <Input
              id="instagram"
              placeholder="https://www.instagram.com/yourhandle"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              className="bg-background border-border"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">ex: https://www.instagram.com/djbradmusic</p>
          </div>

          {/* How did you find us */}
          <div className="space-y-2">
            <Label htmlFor="howFound" className="text-foreground font-heading uppercase tracking-wider text-sm">
              How did you find us?
            </Label>
            <Textarea
              id="howFound"
              placeholder="Let us know how you heard about Miami Style DJs..."
              value={form.howFound}
              onChange={(e) => set("howFound", e.target.value)}
              className="bg-background border-border"
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Photo Upload Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Photo */}
            <div className="space-y-3">
              <Label className="text-foreground font-heading uppercase tracking-wider text-sm flex items-center gap-2">
                <Camera size={16} className="text-primary" /> Profile Photo
              </Label>
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-background/50 overflow-hidden">
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <User size={32} />
                    <span className="text-sm">Click to upload photo</span>
                    <span className="text-xs">Max 5MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "photo")}
                />
              </label>
            </div>

            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-foreground font-heading uppercase tracking-wider text-sm flex items-center gap-2">
                <Upload size={16} className="text-primary" /> DJ Logo
              </Label>
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-background/50 overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Music size={32} />
                    <span className="text-sm">Click to upload logo</span>
                    <span className="text-xs">Max 5MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "logo")}
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-14 text-lg font-heading font-bold uppercase tracking-wider bg-gradient-fire text-primary-foreground shadow-fire hover:scale-[1.02] transition-transform"
          >
            {submitting ? "Submitting..." : "🎧 Submit Registration"}
          </Button>
        </motion.form>
      </section>

      <Footer />
    </div>
  );
};

export default DJRegistration;
