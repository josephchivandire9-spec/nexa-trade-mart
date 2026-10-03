import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, Loader2, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — NEXA TRADE MART" },
      {
        name: "description",
        content:
          "Sign in to your customer account to track orders, earn rewards, and check out faster.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse({ email, password });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function googleSignIn() {
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });

      if (error) throw error;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Google sign-in failed",
      );
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center container-px py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full gradient-gold text-ink mb-3">
            <User className="h-7 w-7" />
          </div>

          <h1 className="font-display text-3xl">Customer Sign In</h1>

          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Sign in to your account.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <button
            type="button"
            onClick={googleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-11 rounded-lg border bg-background inline-flex items-center justify-center gap-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or use email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Email
              </label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <input
                  type="email"
                  required
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Password
              </label>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-lg border bg-background pl-9 pr-10 text-sm outline-none focus:border-gold"
                />

                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/register"
              className="text-gold-deep font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}
