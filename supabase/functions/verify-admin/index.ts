import { corsHeaders } from "@supabase/supabase-js/cors";

const ADMIN_PASSWORD = "23012013k";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { password } = await req.json();
    if (typeof password !== "string") {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    const valid = password === ADMIN_PASSWORD;
    return new Response(JSON.stringify({ valid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ valid: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
