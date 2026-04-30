// Edge Function: admin-action
// Valida a senha do admin (server-side) e executa operações privilegiadas
// usando service role. Substitui a necessidade de role admin na sessão Supabase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_PASSWORD = "23012013k";

type Action =
  | { type: "create_broadcast_task"; payload: { titulo: string; descricao?: string; data_criacao: string; data_limite?: string | null } }
  | { type: "update_broadcast_task"; payload: { id: string; titulo?: string; descricao?: string; data_limite?: string | null } }
  | { type: "delete_broadcast_task"; payload: { id: string } }
  | { type: "create_broadcast_alert"; payload: { titulo: string; mensagem: string; tipo: string; data_criacao: string } }
  | { type: "update_broadcast_alert"; payload: { id: string; titulo?: string; mensagem?: string; tipo?: string } }
  | { type: "delete_broadcast_alert"; payload: { id: string } }
  | { type: "list_broadcast_tasks" }
  | { type: "list_broadcast_alerts" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const password = req.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Action;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Sentinel admin owner_id: usamos um UUID fixo para representar "professora"
    // Como RLS exige owner_id = auth.uid() OU ser admin, e estamos usando service role,
    // RLS é ignorado. Marcamos owner_id como o UUID do admin sentinel.
    const ADMIN_SENTINEL = "00000000-0000-0000-0000-000000000001";

    switch (body.type) {
      case "create_broadcast_task": {
        const { titulo, descricao, data_criacao, data_limite } = body.payload;
        if (!titulo?.trim()) {
          return json({ error: "Título obrigatório" }, 400);
        }
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            owner_id: ADMIN_SENTINEL,
            origin: "professora",
            is_broadcast: true,
            titulo: titulo.trim(),
            descricao: descricao?.trim() || null,
            data_criacao,
            data_limite: data_limite || null,
          })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 200);
      }

      case "update_broadcast_task": {
        const { id, ...updates } = body.payload;
        const { data, error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", id)
          .eq("is_broadcast", true)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 200);
      }

      case "delete_broadcast_task": {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", body.payload.id)
          .eq("is_broadcast", true);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true }, 200);
      }

      case "create_broadcast_alert": {
        const { titulo, mensagem, tipo, data_criacao } = body.payload;
        if (!titulo?.trim() || !mensagem?.trim()) {
          return json({ error: "Título e mensagem obrigatórios" }, 400);
        }
        const validTypes = ["URGENTE", "ATENCAO", "INFORMACAO", "NOVO_MATERIAL"];
        if (!validTypes.includes(tipo)) {
          return json({ error: "Tipo inválido" }, 400);
        }
        const { data, error } = await supabase
          .from("alerts")
          .insert({
            owner_id: ADMIN_SENTINEL,
            is_broadcast: true,
            titulo: titulo.trim(),
            mensagem: mensagem.trim(),
            tipo,
            data_criacao,
          })
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 200);
      }

      case "update_broadcast_alert": {
        const { id, ...updates } = body.payload;
        const { data, error } = await supabase
          .from("alerts")
          .update(updates)
          .eq("id", id)
          .eq("is_broadcast", true)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 200);
      }

      case "delete_broadcast_alert": {
        const { error } = await supabase
          .from("alerts")
          .delete()
          .eq("id", body.payload.id)
          .eq("is_broadcast", true);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true }, 200);
      }

      case "list_broadcast_tasks": {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("is_broadcast", true)
          .order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 200);
      }

      case "list_broadcast_alerts": {
        const { data, error } = await supabase
          .from("alerts")
          .select("*")
          .eq("is_broadcast", true)
          .order("data_criacao", { ascending: false });
        if (error) return json({ error: error.message }, 500);
        return json({ data }, 200);
      }

      default:
        return json({ error: "Ação desconhecida" }, 400);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
