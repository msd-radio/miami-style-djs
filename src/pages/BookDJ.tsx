import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Music, Calendar, MapPin, Users, DollarSign, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().min(7, "Phone number is required").max(20),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  eventType: z.string().min(1, "Event type is required"),
  venue: z.string().trim().min(2, "Venue name is required").max(200),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().min(1, "State is required"),
  guestCount: z.string().min(1, "Guest count is required"),
  musicGenres: z.string().trim().min(2, "Preferred genres required").max(500),
  specialRequests: z.string().max(1000).optional().default(""),
  budget: z.string().min(1, "Budget range is required"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const eventTypes = [
  "Wedding", "Birthday Party", "Corporate Event", "Club Night",
  "Pool Party", "House Party", "Quinceañera", "Festival",
  "Charity Event", "Other",
];

const budgetRanges = [
  "$300 - $500", "$500 - $1,000", "$1,000 - $2,000",
  "$2,000 - $5,000", "$5,000+", "Not Sure",
];

const guestCounts = [
  "Under 50", "50 - 100", "100 - 200", "200 - 500", "500+",
];

const states = [
  "Florida", "Georgia", "Alabama", "South Carolina", "North Carolina",
  "Tennessee", "Louisiana", "Texas", "New York", "California", "Other",
];

const BookDJ = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", eventDate: "", eventTime: "",
      eventType: "", venue: "", city: "", state: "", guestCount: "",
      musicGenres: "", specialRequests: "", budget: "",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Save booking to database
      const { error: dbError } = await supabase.from("booking_inquiries").insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        event_date: data.eventDate,
        event_time: data.eventTime,
        event_type: data.eventType,
        venue: data.venue,
        city: data.city,
        state: data.state,
        guest_count: data.guestCount,
        music_genres: data.musicGenres,
        special_requests: data.specialRequests,
        budget: data.budget,
      });
      if (dbError) console.error("DB save error:", dbError);

      // Send notification emails
      const { error } = await supabase.functions.invoke("send-dj-booking", {
        body: data,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Booking Request Sent! 🎶", description: "We'll get back to you within 24-48 hours." });
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-lg mx-auto px-4"
          >
            <div className="text-6xl mb-6">🎧</div>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Booking Request Sent!</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Thank you! Our team will review your request and get back to you within 24-48 hours with available DJs and pricing.
            </p>
            <Button onClick={() => { setSubmitted(false); form.reset(); }} className="bg-gradient-miami text-primary-foreground font-heading font-bold uppercase tracking-wider">
              Submit Another Request
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 px-4"
        >
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-4">
            Book a <span className="text-primary">DJ</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fill out the form below and we'll match you with the perfect DJ for your event. From weddings to club nights, Miami Style DJs has you covered.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto px-4"
        >
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Contact Info */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Users className="text-primary" size={20} /> Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl><Input type="tel" placeholder="(305) 555-1234" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="text-secondary" size={20} /> Event Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="eventType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="guestCount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Guests *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select guest count" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {guestCounts.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="eventDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date *</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="eventTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Time *</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="text-accent" size={20} /> Venue & Location
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="venue" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Venue Name *</FormLabel>
                        <FormControl><Input placeholder="The Grand Ballroom" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl><Input placeholder="Miami" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Music & Budget */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Music className="text-primary" size={20} /> Music & Budget
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={form.control} name="musicGenres" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Music Genres *</FormLabel>
                        <FormControl><Input placeholder="Hip Hop, Reggaeton, House, Top 40..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="budget" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><DollarSign size={14} /> Budget Range *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {budgetRanges.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="specialRequests" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests / Notes</FormLabel>
                        <FormControl><Textarea placeholder="Any special songs, equipment needs, or other details..." rows={4} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-miami text-primary-foreground font-heading font-bold text-lg uppercase tracking-wider py-6 hover:scale-[1.02] transition-transform"
                >
                  {isSubmitting ? "Sending..." : <><Send size={18} className="mr-2" /> Submit Booking Request</>}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default BookDJ;
