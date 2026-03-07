import { motion } from "framer-motion";
import { Clock, Flame } from "lucide-react";

const shows = [
  { name: "Morning Heat", time: "6AM - 10AM", genre: "Hip-Hop / R&B", hot: true },
  { name: "Midday Vibes", time: "10AM - 2PM", genre: "Reggaeton / Latin" },
  { name: "Afternoon Mix", time: "2PM - 6PM", genre: "EDM / House" },
  { name: "Prime Time Party", time: "6PM - 10PM", genre: "Top 40 / Club Hits", hot: true },
  { name: "DJ Black's Quiet Storm", time: "11PM - 6AM", genre: "Slow Jams", hot: true },
  
];

const ShowsSection = () => (
  <section id="shows" className="py-24 relative">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient-fire mb-4">
          Show Schedule
        </h2>
        <p className="text-muted-foreground">Daily programming that keeps the party going.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {shows.map((show, i) => (
          <motion.div
            key={show.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-xl border transition-colors ${
              show.hot
                ? "border-primary/40 bg-primary/5 hover:shadow-fire"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-foreground">{show.name}</h3>
              {show.hot && <Flame className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock size={12} />
              {show.time}
            </div>
            <span className="text-xs font-medium text-accent">{show.genre}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ShowsSection;
