import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const form = await req.json() as RegistrationForm;

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
          <p><strong>Name:</strong> ${form.firstName} ${form.lastName} (${form.djName})</p>
          <p><strong>Email:</strong> ${form.email}</p>
          <p><strong>Phone:</strong> ${form.phone}</p>
          <p><strong>Experience:</strong> ${form.experience}</p>
          <p><strong>State:</strong> ${form.state}</p>
          <p><strong>Facebook:</strong> ${form.facebook}</p>
          <p><strong>Instagram:</strong> ${form.instagram}</p>
          <p><strong>How they found us:</strong> ${form.howFound}</p>
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
            
            <p style="font-size: 16px;">Hi ${form.firstName},</p>
            
            <p style="font-size: 16px;">Congratulations! You're now part of the Miami Style DJs family. We're thrilled to have you on board, <strong>${form.djName}</strong>!</p>
            
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px;">🔐 Your Member Area Access</h2>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Login Email:</strong> ${form.email}</p>
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});