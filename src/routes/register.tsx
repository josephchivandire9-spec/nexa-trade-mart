import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, Loader2, User, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const Search = z.object({ ref: z.string().optional() });

export const Route = createFileRoute("/register")({
  validateSearch: Search,
  head: () => ({
    meta: [
      { title: "Create Account — NEXA TRADE MART" },
      { name: "description", content: "Join NEXA TRADE MART for faster checkout, order tracking, and loyalty rewards." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { ref } = Route.useSearch();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", referral: ref ?? "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: {
            full_name: form.full_name,
            referral_code: form.referral.trim() || null,
          },
        },
      });
      if (error) throw error;
      toast.success("Account created! Check your email to confirm.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-up failed");
    } finally {
      setLoading(false);
    }
  }

  const input = "mt-1 w-full h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";

  return (
    <div className="min-h-[80vh] flex items-center justify-center container-px py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full gradient-gold text-ink mb-3">
            <User className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl">Create Customer Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Earn points, track orders, refer friends.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border bg-card p-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required maxLength={120} className={input} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Gift className="h-3.5 w-3.5" /> Referral code (optional)
            </label>
            <input value={form.referral} onChange={(e) => setForm({ ...form, referral: e.target.value })}
              maxLength={32} placeholder="e.g. REFAB12CD" className={input} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-gold-deep font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
