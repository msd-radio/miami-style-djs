import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/miami-style-djs-logo.jpg";
import NewDJOnboarding from "@/components/NewDJOnboarding";

const DJOnboardingGuide = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/dj-portal");
        return;
      }
      setUser(session.user);
    });
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dj-portal/dashboard" className="flex items-center gap-3">
            <img src={logo} alt="Miami Style DJs" className="h-8 rounded" />
            <span className="font-display text-sm font-bold text-foreground uppercase">DJ Portal</span>
          </Link>
          <Link
            to="/dj-portal/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </header>

      <NewDJOnboarding />
    </div>
  );
};

export default DJOnboardingGuide;
