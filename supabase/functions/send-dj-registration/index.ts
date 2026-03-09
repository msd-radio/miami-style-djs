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

    // Send welcome email to DJ
    const djRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Miami Style DJs <onboarding@resend.dev>",
        to: [form.email],
        subject: "Welcome to Miami Style DJs!",
        html: `
          <h1>Welcome to Miami Style DJs!</h1>
          <p>Hi ${form.firstName},</p>
          <p>Thank you for registering. We're excited to have you on board!</p>
          <p>Please log in to the DJ Portal to access your Onboarding Guide.</p>
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