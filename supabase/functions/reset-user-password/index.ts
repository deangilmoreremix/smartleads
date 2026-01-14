import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const userRoles = await supabase
      .from('user_roles')
      .select('role_id, roles!inner(name)')
      .eq('user_id', user.id);

    const isAdmin = userRoles.data?.some((ur: any) => ur.roles.name === 'admin');

    if (!isAdmin) {
      throw new Error("Only admins can reset passwords");
    }

    const { email, newPassword }: ResetPasswordRequest = await req.json();

    if (!email || !newPassword) {
      throw new Error("Email and new password are required");
    }

    const { data: targetUser, error: findError } = await supabase.auth.admin.listUsers();

    if (findError) {
      throw new Error(`Failed to find user: ${findError.message}`);
    }

    const userToUpdate = targetUser.users.find(u => u.email === email);

    if (!userToUpdate) {
      throw new Error("User not found");
    }

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      userToUpdate.id,
      { password: newPassword }
    );

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Password updated successfully for ${email}`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to reset password",
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