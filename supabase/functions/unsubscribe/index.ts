import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const campaignId = url.searchParams.get("campaign_id");
    const reason = url.searchParams.get("reason");

    if (!email) {
      throw new Error("Email address required");
    }

    const ipAddress = req.headers.get("x-forwarded-for") ||
                     req.headers.get("x-real-ip") ||
                     "unknown";

    const { data: campaign } = campaignId
      ? await supabase
          .from("campaigns")
          .select("user_id")
          .eq("id", campaignId)
          .maybeSingle()
      : { data: null };

    const { error } = await supabase
      .from("unsubscribes")
      .insert({
        email: email.toLowerCase().trim(),
        campaign_id: campaignId || null,
        user_id: campaign?.user_id || null,
        ip_address: ipAddress,
        reason: reason || null,
      });

    if (error && !error.message.includes("duplicate")) {
      throw error;
    }

    return new Response(
      `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed Successfully</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 48px;
      height: 48px;
      color: white;
    }
    h1 {
      color: #1f2937;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .email {
      color: #6b7280;
      font-size: 18px;
      margin-bottom: 8px;
    }
    .email strong {
      color: #374151;
      font-weight: 600;
    }
    .message {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 14px;
    }
    @media (max-width: 640px) {
      .container {
        padding: 32px 24px;
      }
      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <h1>Successfully Unsubscribed</h1>
    <p class="email">You've been removed from our mailing list</p>
    <p class="email"><strong>${email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}</strong></p>
    <div class="message">
      <p>You will no longer receive emails from us. This change is effective immediately.</p>
      <p style="margin-top: 16px;">If you unsubscribed by mistake, please contact us and we'll be happy to help.</p>
    </div>
    <div class="footer">
      <p>Unsubscribed on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
    </div>
  </div>
</body>
</html>
      `,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);

    return new Response(
      `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe Error</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    h1 {
      color: #dc2626;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Oops! Something went wrong</h1>
    <p>${error instanceof Error ? error.message : "An unexpected error occurred"}</p>
    <p style="margin-top: 16px;">Please try again or contact support if the problem persists.</p>
  </div>
</body>
</html>
      `,
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
        },
      }
    );
  }
});