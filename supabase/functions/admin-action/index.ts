// Edge Function: admin-action
// Valida a senha do admin (server-side) e executa operações privilegiadas
// usando service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_PASSWORD = "23012013k";
const ADMIN_SENTINEL = "00000000-0000-0000-0000-000000000001";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const password = req.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return json({ error: "Não autorizado" }, 401);
    }

    const body = await req.json() as { type: string; payload?: any };
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    switch (body.type) {
      // ===== TASKS =====
      case "create_broadcast_task": {
        const { titulo, descricao, data_criacao, data_limite } = body.payload;
        if (!titulo?.trim()) return json({ error: "Título obrigatório" }, 400);
        const { data, error } = await sb.from("tasks").insert({
          owner_id: ADMIN_SENTINEL, origin: "professora", is_broadcast: true,
          titulo: titulo.trim(), descricao: descricao?.trim() || null, data_criacao,
          data_limite: data_limite || null,
        }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "update_broadcast_task": {
        const { id, ...updates } = body.payload;
        const { data, error } = await sb.from("tasks").update(updates).eq("id", id).eq("is_broadcast", true).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "delete_broadcast_task": {
        const { error } = await sb.from("tasks").delete().eq("id", body.payload.id).eq("is_broadcast", true);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }
      case "list_broadcast_tasks": {
        const { data, error } = await sb.from("tasks").select("*").eq("is_broadcast", true).order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      // ===== ALERTS =====
      case "create_broadcast_alert": {
        const { titulo, mensagem, tipo, data_criacao } = body.payload;
        if (!titulo?.trim() || !mensagem?.trim()) return json({ error: "Título e mensagem obrigatórios" }, 400);
        const validTypes = ["URGENTE", "ATENCAO", "INFORMACAO", "NOVO_MATERIAL"];
        if (!validTypes.includes(tipo)) return json({ error: "Tipo inválido" }, 400);
        const { data, error } = await sb.from("alerts").insert({
          owner_id: ADMIN_SENTINEL, is_broadcast: true,
          titulo: titulo.trim(), mensagem: mensagem.trim(), tipo, data_criacao,
        }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "update_broadcast_alert": {
        const { id, ...updates } = body.payload;
        const { data, error } = await sb.from("alerts").update(updates).eq("id", id).eq("is_broadcast", true).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "delete_broadcast_alert": {
        const { error } = await sb.from("alerts").delete().eq("id", body.payload.id).eq("is_broadcast", true);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }
      case "list_broadcast_alerts": {
        const { data, error } = await sb.from("alerts").select("*").eq("is_broadcast", true).order("data_criacao", { ascending: false });
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }

      // ===== POSTS (moderação) =====
      case "list_all_posts": {
        const { data: posts, error } = await sb.from("posts").select("*").order("created_at", { ascending: false });
        if (error) return json({ error: error.message }, 500);
        // Buscar nomes dos autores
        const ids = [...new Set((posts || []).map(p => p.author_id))];
        const { data: profs } = await sb.from("profiles").select("id, nome").in("id", ids);
        const map = Object.fromEntries((profs || []).map(p => [p.id, p.nome]));
        return json({ data: posts?.map(p => ({ ...p, author_nome: map[p.author_id] || "—" })) });
      }
      case "moderate_post": {
        const { id, action, justificativa } = body.payload;
        // action: 'publicar' | 'revisar' | 'reprovar'
        const updates: any = {};
        if (action === "publicar") {
          updates.status = "publicado";
          updates.published_at = new Date().toISOString();
          updates.justificativa_reprovacao = null;
        } else if (action === "revisar") {
          updates.status = "rascunho";
        } else if (action === "reprovar") {
          if (!justificativa?.trim()) return json({ error: "Justificativa obrigatória" }, 400);
          updates.status = "reprovado";
          updates.justificativa_reprovacao = justificativa.trim();
        } else return json({ error: "Ação inválida" }, 400);
        const { data, error } = await sb.from("posts").update(updates).eq("id", id).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "delete_post": {
        const { error } = await sb.from("posts").delete().eq("id", body.payload.id);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }

      // ===== MATERIAIS =====
      case "create_material": {
        const { titulo, descricao, tipo, trimestre, arquivo_url, arquivo_path, capa_url, visivel_publico, ordem } = body.payload;
        if (!titulo?.trim() || !tipo) return json({ error: "Título e tipo obrigatórios" }, 400);
        const { data, error } = await sb.from("materiais").insert({
          titulo: titulo.trim(), descricao: descricao?.trim() || null, tipo,
          trimestre: trimestre || null, arquivo_url: arquivo_url || null, arquivo_path: arquivo_path || null,
          capa_url: capa_url || null, visivel_publico: !!visivel_publico, ordem: ordem || 0,
          created_by: ADMIN_SENTINEL,
        }).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "update_material": {
        const { id, ...updates } = body.payload;
        const { data, error } = await sb.from("materiais").update(updates).eq("id", id).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "delete_material": {
        const { id } = body.payload;
        const { data: m } = await sb.from("materiais").select("arquivo_path").eq("id", id).maybeSingle();
        if (m?.arquivo_path) await sb.storage.from("materiais").remove([m.arquivo_path]);
        const { error } = await sb.from("materiais").delete().eq("id", id);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }
      case "sign_material_upload": {
        const { path } = body.payload;
        if (!path) return json({ error: "Path obrigatório" }, 400);
        const { data, error } = await sb.storage.from("materiais").createSignedUploadUrl(path);
        if (error) return json({ error: error.message }, 500);
        const { data: pub } = sb.storage.from("materiais").getPublicUrl(path);
        return json({ data: { signedUrl: data.signedUrl, token: data.token, path: data.path, publicUrl: pub.publicUrl } });
      }

      // ===== ALUNOS =====
      case "list_alunos": {
        const { data, error } = await sb.from("profiles").select("*").order("nome");
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "update_aluno": {
        const { id, nome, classe, bio } = body.payload;
        const { data, error } = await sb.from("profiles").update({ nome, classe, bio }).eq("id", id).select().single();
        if (error) return json({ error: error.message }, 500);
        return json({ data });
      }
      case "delete_aluno": {
        const { id } = body.payload;
        const { error } = await sb.auth.admin.deleteUser(id);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }

      // ===== KPIs =====
      case "admin_dashboard": {
        const [{ count: totalAlunos }, { count: totalPosts }, { count: postsAguardando }, { count: totalMateriais }] = await Promise.all([
          sb.from("profiles").select("*", { count: "exact", head: true }),
          sb.from("posts").select("*", { count: "exact", head: true }).eq("status", "publicado"),
          sb.from("posts").select("*", { count: "exact", head: true }).eq("status", "aguardando"),
          sb.from("materiais").select("*", { count: "exact", head: true }),
        ]);
        return json({ data: { totalAlunos, totalPosts, postsAguardando, totalMateriais } });
      }

      default:
        return json({ error: "Ação desconhecida" }, 400);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
