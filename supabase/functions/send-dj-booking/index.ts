import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory IP rate limiter (resets on cold start). 5 requests / 10 min per IP.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateBuckets.set(ip, arr);
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function sanitize(v: unknown, max = 200): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, max);
}
function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = (await req.json()) as Partial<BookingForm>;
    const form: BookingForm = {
      fullName: sanitize(raw.fullName, 100),
      email: sanitize(raw.email, 254),
      phone: sanitize(raw.phone, 30),
      eventDate: sanitize(raw.eventDate, 50),
      eventTime: sanitize(raw.eventTime, 50),
      eventType: sanitize(raw.eventType, 100),
      venue: sanitize(raw.venue, 200),
      city: sanitize(raw.city, 100),
      state: sanitize(raw.state, 50),
      guestCount: sanitize(raw.guestCount, 50),
      musicGenres: sanitize(raw.musicGenres, 200),
      specialRequests: sanitize(raw.specialRequests, 1000),
      budget: sanitize(raw.budget, 50),
    };

    if (!form.fullName || !EMAIL_RE.test(form.email) || !form.eventType || !form.eventDate) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // HTML-escape every value used in email templates to prevent HTML injection.
    const e = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, escapeHtml(v)])
    ) as Record<keyof BookingForm, string>;

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
            <p><strong>Name:</strong> ${e.fullName}</p>
            <p><strong>Email:</strong> ${e.email}</p>
            <p><strong>Phone:</strong> ${e.phone}</p>
            <h2>Event Details</h2>
            <p><strong>Event Type:</strong> ${e.eventType}</p>
            <p><strong>Date:</strong> ${e.eventDate}</p>
            <p><strong>Time:</strong> ${e.eventTime}</p>
            <p><strong>Venue:</strong> ${e.venue}</p>
            <p><strong>City/State:</strong> ${e.city}, ${e.state}</p>
            <p><strong>Guest Count:</strong> ${e.guestCount}</p>
            <p><strong>Music Genres:</strong> ${e.musicGenres}</p>
            <p><strong>Budget:</strong> ${e.budget}</p>
            <h2>Special Requests</h2>
            <p>${e.specialRequests || "None"}</p>
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
            <p style="font-size: 16px;">Hi ${e.fullName},</p>
            <p style="font-size: 16px;">Thank you for choosing Miami Style DJs! We've received your booking request and our team will review it shortly.</p>
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h2 style="color: #fff; margin: 0 0 10px;">Your Event Summary</h2>
              <p style="margin: 5px 0;"><strong>Event:</strong> ${e.eventType}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${e.eventDate}</p>
              <p style="margin: 5px 0;"><strong>Venue:</strong> ${e.venue}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${e.city}, ${e.state}</p>
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
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
