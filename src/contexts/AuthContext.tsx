import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Profile = { id: string; nome: string; classe: string };

interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (nome: string, senha: string) => Promise<{ error?: string }>;
  signUp: (nome: string, classe: string, senha: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  setAdmin: (v: boolean, password?: string) => void;
  adminPassword: string | null;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

// Convert "nome do aluno" -> pseudo-email for Supabase auth
const nomeToEmail = (nome: string) =>
  `${nome.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "")}@aluno.colegiomundial.local`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem("jcs_admin") === "1");
  const [adminPassword, setAdminPassword] = useState<string | null>(() => sessionStorage.getItem("jcs_admin_pwd"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(async () => {
          const { data } = await supabase.from("profiles").select("*").eq("id", sess.user.id).maybeSingle();
          if (data) setProfile(data as Profile);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle().then(({ data }) => {
          if (data) setProfile(data as Profile);
        });
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthCtx["signIn"] = async (nome, senha) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: nomeToEmail(nome),
      password: senha,
    });
    if (error) return { error: "Nome ou senha inválidos." };
    return {};
  };

  const signUp: AuthCtx["signUp"] = async (nome, classe, senha) => {
    const { error } = await supabase.auth.signUp({
      email: nomeToEmail(nome),
      password: senha,
      options: {
        data: { nome, classe },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("registered")) return { error: "Esse nome de aluno já está em uso." };
      return { error: error.message };
    }
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("jcs_admin");
    sessionStorage.removeItem("jcs_admin_pwd");
    setIsAdmin(false);
    setAdminPassword(null);
  };

  const setAdmin = (v: boolean, password?: string) => {
    setIsAdmin(v);
    if (v) {
      sessionStorage.setItem("jcs_admin", "1");
      if (password) {
        sessionStorage.setItem("jcs_admin_pwd", password);
        setAdminPassword(password);
      }
    } else {
      sessionStorage.removeItem("jcs_admin");
      sessionStorage.removeItem("jcs_admin_pwd");
      setAdminPassword(null);
    }
  };

  return (
    <Ctx.Provider value={{ session, user, profile, isAdmin, adminPassword, loading, signIn, signUp, signOut, setAdmin }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
