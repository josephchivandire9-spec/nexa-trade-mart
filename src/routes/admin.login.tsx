import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — NEXA TRADE MART" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: role } = await supabase.from("user_roles")
          .select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle();
        if (role) navigate({ to: "/admin" });
      }
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: role } = await supabase.from("user_roles")
        .select("role").eq("user_id", data.user!.id).eq("role", "admin").maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      toast.success("Welcome, admin");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center container-px py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold mb-3">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted area. Admin credentials only.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-lg bg-ink text-gold font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In to Admin
          </button>
        </form>
      </div>
    </div>
  );
}
