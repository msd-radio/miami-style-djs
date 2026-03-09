import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User } from "lucide-react";

const FloatingMemberButton = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-40 right-6 z-50"
    >
      <Link
        to="/dj-portal"
        className="flex items-center gap-2 px-4 py-3 md:px-6 md:py-3 rounded-full bg-gradient-fire text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider shadow-fire hover:scale-105 transition-transform"
      >
        <User size={18} />
        <span className="hidden sm:inline">Member Area</span>
        <span className="sm:hidden">Login</span>
      </Link>
    </motion.div>
  );
};

export default FloatingMemberButton;
