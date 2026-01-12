import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConnectRequest {
  code?: string;
  provider?: string;
  redirectUrl?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const unipileApiKey = Deno.env.get("UNIPILE_API_KEY");

    if (!unipileApiKey) {
      throw new Error("UNIPILE_API_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { code, provider = "GMAIL", redirectUrl }: ConnectRequest = await req.json();

    if (req.method === "POST" && !code) {
      const origin = new URL(req.url).origin;
      const callbackUrl = `${origin}/auth/callback/unipile`;
      const authUrl = `https://api.unipile.com/api/v1/hosted/accounts/link?api_key=${unipileApiKey}&provider=${provider}&success_redirect_url=${encodeURIComponent(redirectUrl || callbackUrl)}`;

      return new Response(
        JSON.stringify({ authUrl }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!code) {
      throw new Error("Authorization code required");
    }

    const unipileResponse = await fetch(
      `https://api.unipile.com/api/v1/accounts`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": unipileApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          provider,
        }),
      }
    );

    if (!unipileResponse.ok) {
      const errorData = await unipileResponse.text();
      throw new Error(`Unipile API error: ${errorData}`);
    }

    const accountData = await unipileResponse.json();
    
    const { data: existingAccount } = await supabase
      .from("gmail_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("email", accountData.email)
      .maybeSingle();

    if (existingAccount) {
      const { error: updateError } = await supabase
        .from("gmail_accounts")
        .update({
          unipile_account_id: accountData.account_id,
          unipile_provider: provider,
          unipile_connected_at: new Date().toISOString(),
          is_active: true,
          webhook_enabled: true,
        })
        .eq("id", existingAccount.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("gmail_accounts")
        .insert({
          user_id: user.id,
          email: accountData.email,
          unipile_account_id: accountData.account_id,
          unipile_provider: provider,
          unipile_connected_at: new Date().toISOString(),
          is_active: true,
          webhook_enabled: true,
          daily_limit: 500,
          emails_sent_today: 0,
        });

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          email: accountData.email,
          provider,
          account_id: accountData.account_id,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error connecting Unipile account:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to connect account",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});