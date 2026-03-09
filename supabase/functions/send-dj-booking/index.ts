import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingForm {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
  venue: string;
  city: string;
  state: string;
  guestCount: string;
  musicGenres: string;
  specialRequests: string;
  budget: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const form = (await req.json()) as BookingForm;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing API key");
    }

    // Send booking request to admin
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Miami Style DJs <onboarding@resend.dev>",
        to: ["admin@miamistyledjs.com"],
        subject: `New DJ Booking Request: ${form.eventType} on ${form.eventDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ff6b35;">🎧 New DJ Booking Request</h1>
            <h2>Client Details</h2>
            <p><strong>Name:</strong> ${form.fullName}</p>
            <p><strong>Email:</strong> ${form.email}</p>
            <p><strong>Phone:</strong> ${form.phone}</p>
            <h2>Event Details</h2>
            <p><strong>Event Type:</strong> ${form.eventType}</p>
            <p><strong>Date:</strong> ${form.eventDate}</p>
            <p><strong>Time:</strong> ${form.eventTime}</p>
            <p><strong>Venue:</strong> ${form.venue}</p>
            <p><strong>City/State:</strong> ${form.city}, ${form.state}</p>
            <p><strong>Guest Count:</strong> ${form.guestCount}</p>
            <p><strong>Music Genres:</strong> ${form.musicGenres}</p>
            <p><strong>Budget:</strong> ${form.budget}</p>
            <h2>Special Requests</h2>
            <p>${form.specialRequests || "None"}</p>
          </div>
        `,
      }),
    });

    // Send confirmation to customer
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Miami Style DJs <onboarding@resend.dev>",
        to: [form.email],
        subject: "We Received Your DJ Booking Request! 🎶",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #ff6b35; text-align: center;">🎧 Booking Request Received!</h1>
            <p style="font-size: 16px;">Hi ${form.fullName},</p>
            <p style="font-size: 16px;">Thank you for choosing Miami Style DJs! We've received your booking request and our team will review it shortly.</p>
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h2 style="color: #fff; margin: 0 0 10px;">Your Event Summary</h2>
              <p style="margin: 5px 0;"><strong>Event:</strong> ${form.eventType}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${form.eventDate}</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> ${form.venue}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${form.city}, ${form.state}</p>
            </div>
            <p style="font-size: 14px;">We'll get back to you within 24-48 hours with available DJs and pricing. If you have any questions, feel free to reply to this email.</p>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="font-size: 12px; color: #888;">Miami Style DJs - Where the Beat Never Stops</p>
            </div>
          </div>
        `,
      }),
    });

    if (!adminRes.ok || !customerRes.ok) {
      throw new Error("Failed to send emails via Resend");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Booking email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
