import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { adminAction } from "@/lib/adminAction";

const AdminGuard = () => {
  const { isAdmin, adminPassword, setAdmin } = useAuth();
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isAdmin || !adminPassword) {
        setChecked(true);
        return;
      }
      try {
        // Roundtrip a cheap admin call to verify the password against the server.
        await adminAction(adminPassword, { type: "admin_dashboard" });
        if (alive) { setValid(true); setChecked(true); }
      } catch {
        if (alive) {
          setAdmin(false);
          setChecked(true);
        }
      }
    })();
    return () => { alive = false; };
  }, [isAdmin, adminPassword, setAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;
  if (!checked) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/40">
        <p className="font-ui text-sm text-muted-foreground">Validando acesso administrativo…</p>
      </div>
    );
  }
  if (!valid) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminGuard;
