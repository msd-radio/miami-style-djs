import { motion } from "framer-motion";
import djHero from "@/assets/dj-hero-new.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      
      {/* Animated fire-like gradient orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-secondary/15 blur-[100px]" />

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-heading font-semibold uppercase tracking-widest text-primary">
                Live On Air
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold leading-none mb-6">
              <span className="text-foreground">Miami</span>
              <br />
              <span className="text-gradient-fire">Style DJ's</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mb-8 font-body">
              The hottest DJ radio station bringing Miami's finest beats, vibes, and energy to the world. 
              24/7 live mixes, exclusive shows, and non-stop party.
            </p>

            <div className="flex flex-wrap gap-4">
              <a

                className="px-8 py-3 rounded-lg bg-gradient-fire text-primary-foreground font-heading font-bold uppercase tracking-wider shadow-fire hover:scale-105 transition-transform" href="https://radio.miamistyledjs.com/listen/miami_style_djs_/radio.mp3">
                
                Listen Live
              </a>
              <a
                href="#about"
                className="px-8 py-3 rounded-lg border border-border bg-card/50 text-foreground font-heading font-semibold uppercase tracking-wider hover:border-primary/50 transition-colors">
                
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block">
            
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-fire opacity-20 blur-2xl" />
              <img
                src={djHero}
                alt="Miami Style DJs Live On Air"
                className="relative rounded-2xl w-full max-w-lg mx-auto shadow-2xl" />
              
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

};

export default HeroSection;