import { motion } from "framer-motion";
import { Radio, Users, Mic2, Headphones } from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "24/7 Live Radio",
    description: "Non-stop Miami beats streaming around the clock with rotating DJ sets.",
  },
  {
    icon: Users,
    title: "Elite DJ Roster",
    description: "Curated roster of Miami's finest DJs bringing diverse genres and styles.",
  },
  {
    icon: Mic2,
    title: "Exclusive Shows",
    description: "Original programming, interviews, and special event broadcasts.",
  },
  {
    icon: Headphones,
    title: "DJ Portal",
    description: "Professional portal for our DJs to manage shows, clips, and profiles.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-fire mb-4">
            Why Miami Style
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're not just a radio station — we're a movement. Miami Style DJ's delivers the heat,
            the rhythm, and the culture of Miami to listeners worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:shadow-fire transition-shadow">
                <feat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
