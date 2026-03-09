import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useCallback } from "react";
import logo from "@/assets/miami-style-djs-logo.jpg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Home", hash: "" },
    { label: "About", hash: "about" },
    { label: "Shows", hash: "shows" },
    { label: "Contact", hash: "contact" },
  ];

  const handleNavClick = useCallback(
    (hash: string) => {
      setOpen(false);
      if (!hash) {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const scrollToEl = () => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(scrollToEl, 100);
      } else {
        scrollToEl();
      }
    },
    [navigate, location.pathname]
  );

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Miami Style DJs" className="h-10 rounded" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => handleNavClick(l.hash)}
              className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </button>
          ))}
          <Link
            to="/dj-registration"
            className="px-5 py-2 rounded-lg bg-gradient-miami text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform"
          >
            DJ Registration
          </Link>
          <Link
            to="/dj-portal"
            className="px-5 py-2 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider shadow-fire hover:scale-105 transition-transform"
          >
            DJ Portal
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-3"
        >
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => handleNavClick(l.hash)}
              className="block w-full text-left font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              {l.label}
            </button>
          ))}
          <Link
            to="/dj-portal"
            onClick={() => setOpen(false)}
            className="block text-center px-5 py-2 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider"
          >
            DJ Portal
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
