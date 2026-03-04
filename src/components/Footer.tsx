import { motion } from "framer-motion";
import { Mail, Instagram, Phone } from "lucide-react";

const Footer = () => (
  <footer id="contact" className="border-t border-border py-16 bg-card/30">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-2xl font-display font-bold text-gradient-fire mb-4">
            Miami Style DJ's
          </h3>
          <p className="text-sm text-muted-foreground">
            Miami's premier DJ radio station. Bringing the heat 24/7.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-bold text-foreground mb-4 uppercase tracking-wider">Quick Links</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="/#about" className="block hover:text-primary transition-colors">About</a>
            <a href="/#shows" className="block hover:text-primary transition-colors">Shows</a>
            <a href="/dj-portal" className="block hover:text-primary transition-colors">DJ Portal</a>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-bold text-foreground mb-4 uppercase tracking-wider">Contact</h4>
          <div className="space-y-3 text-sm text-muted-foreground">
            <a href="mailto:info@miamistyledjs.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail size={16} /> info@miamistyledjs.com
            </a>
            <a href="https://instagram.com/miamistyledjs" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Instagram size={16} /> @miamistyledjs
            </a>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Miami Style DJ's. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
