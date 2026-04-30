import { supabase } from "@/integrations/supabase/client";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-action`;

export async function adminAction<T = any>(password: string, body: unknown): Promise<T> {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "x-admin-password": password,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Erro na operação administrativa");
  return json as T;
}

// Garante que tem sessão; se não, retorna client sem auth (broadcast pode ser lido por authenticated apenas)
export { supabase };
