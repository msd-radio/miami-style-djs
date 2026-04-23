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

interface RegistrationForm {
  djName: string;
  firstName: string;
  lastName: string;
  email: string;
  experience: string;
  state: string;
  phone: string;
  facebook: string;
  instagram: string;
  howFound: string;
}

serve(async (req) => {
  // Handle CORS
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

    const raw = (await req.json()) as Partial<RegistrationForm>;
    const form: RegistrationForm = {
      djName: sanitize(raw.djName, 100),
      firstName: sanitize(raw.firstName, 100),
      lastName: sanitize(raw.lastName, 100),
      email: sanitize(raw.email, 254),
      experience: sanitize(raw.experience, 100),
      state: sanitize(raw.state, 50),
      phone: sanitize(raw.phone, 30),
      facebook: sanitize(raw.facebook, 200),
      instagram: sanitize(raw.instagram, 200),
      howFound: sanitize(raw.howFound, 200),
    };

    if (!form.djName || !form.firstName || !EMAIL_RE.test(form.email)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const e = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, escapeHtml(v)])
    ) as Record<keyof RegistrationForm, string>;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Missing API key");
    }

    // Send email to admin
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Miami Style DJs <onboarding@resend.dev>",
        to: ["admin@miamistyledjs.com"],
        subject: `New DJ Registration: ${form.djName}`,
        html: `
          <h1>New DJ Registration</h1>
          <p><strong>Name:</strong> ${e.firstName} ${e.lastName} (${e.djName})</p>
          <p><strong>Email:</strong> ${e.email}</p>
          <p><strong>Phone:</strong> ${e.phone}</p>
          <p><strong>Experience:</strong> ${e.experience}</p>
          <p><strong>State:</strong> ${e.state}</p>
          <p><strong>Facebook:</strong> ${e.facebook}</p>
          <p><strong>Instagram:</strong> ${e.instagram}</p>
          <p><strong>How they found us:</strong> ${e.howFound}</p>
        `,
      }),
    });

    // Send welcome email to DJ with member area credentials
    const djRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Miami Style DJs <onboarding@resend.dev>",
        to: [form.email],
        subject: "Welcome to Miami Style DJs - Your Member Area Access",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ff6b35; margin: 0;">🎧 Welcome to Miami Style DJs!</h1>
            </div>
            
            <p style="font-size: 16px;">Hi ${e.firstName},</p>
            
            <p style="font-size: 16px;">Congratulations! You're now part of the Miami Style DJs family. We're thrilled to have you on board, <strong>${e.djName}</strong>!</p>
            
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px;">🔐 Your Member Area Access</h2>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Login Email:</strong> ${e.email}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Member Portal:</strong> <a href="https://miami-beat-builder.lovable.app/dj-portal" style="color: #ffffff;">miami-beat-builder.lovable.app/dj-portal</a></p>
              <p style="margin: 15px 0 0 0; font-size: 13px; opacity: 0.9;">Use your registered email to sign in via Google or create a password.</p>
            </div>
            
            <h3 style="color: #ff6b35;">📋 Next Steps:</h3>
            <ol style="font-size: 14px; line-height: 1.8;">
              <li>Log in to your <strong>Member Area</strong></li>
              <li>Complete the <strong>DJ Onboarding Guide</strong></li>
              <li>Set up your <strong>DJ Profile</strong></li>
              <li>Get ready to spin! 🎵</li>
            </ol>
            
            <p style="font-size: 14px; margin-top: 30px;">Questions? Reply to this email or contact us anytime.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="font-size: 12px; color: #888;">Miami Style DJs - Where the Beat Never Stops</p>
            </div>
          </div>
        `,
      }),
    });

    if (!adminRes.ok || !djRes.ok) {
      throw new Error("Failed to send emails via Resend");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});