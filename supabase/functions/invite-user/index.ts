import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InviteRequest {
  email: string;
  fullName?: string;
  companyName?: string;
  planType: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requestingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await userClient
      .from("profiles")
      .select("is_admin")
      .eq("id", requestingUser.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, fullName, companyName, planType }: InviteRequest = await req.json();

    if (!email || !planType) {
      return new Response(
        JSON.stringify({ error: "Email and plan type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const tempPassword = crypto.randomUUID().slice(0, 12) + "Aa1!";

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || "",
        company_name: companyName || "",
      },
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planCredits: Record<string, number> = {
      free: 50,
      starter: 500,
      professional: 2000,
      enterprise: 10000,
    };

    await adminClient.from("profiles").upsert({
      id: newUser.user.id,
      email,
      full_name: fullName || null,
      company_name: companyName || null,
      is_admin: false,
    });

    await adminClient.from("subscriptions").upsert({
      user_id: newUser.user.id,
      plan_type: planType,
      status: "active",
      credits_remaining: planCredits[planType] || 50,
      credits_total: planCredits[planType] || 50,
    });

    await adminClient.from("audit_logs").insert({
      user_id: requestingUser.id,
      target_user_id: newUser.user.id,
      action: "invite_user",
      resource: "users",
      new_value: { email, planType, fullName, companyName },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        },
        tempPassword,
        message: "User created successfully. Share the temporary password with them.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error inviting user:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});