import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/miami-style-djs-logo.jpg";

const DJAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated (e.g. returning from email confirmation link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dj-portal/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dj-portal/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin + "/dj-portal",
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      }
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("Email not confirmed")) {
        toast.error("Please confirm your email first.");
      } else if (msg.includes("Invalid login credentials")) {
        toast.error("Incorrect email or password.");
      } else if (msg.includes("User already registered")) {
        toast.error("An account with this email already exists.");
      } else if (msg.includes("Password should be")) {
        toast.error("Password must be at least 6 characters.");
      } else {
        console.error("Auth error:", msg);
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-20 left-20 w-60 h-60 rounded-full bg-secondary/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="Miami Style DJs" className="h-16 mx-auto mb-4 rounded" />
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isLogin ? "DJ Portal Login" : "Join the Roster"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Access your DJ dashboard" : "Create your DJ account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
                placeholder="DJ Blaze"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              placeholder="dj@miamistyledjs.com"
            />
          </div>
          <div>
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold uppercase tracking-wider shadow-fire hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "New DJ? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default DJAuth;
