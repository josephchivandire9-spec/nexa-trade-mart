import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, Mail, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Account and platform configuration.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted inline-flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg">Admin Account</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted inline-flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-display text-lg">Security</div>
              <div className="text-xs text-muted-foreground">Row-level security & admin-only access enabled.</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted inline-flex items-center justify-center">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg">Storefront</div>
              <div className="text-xs text-muted-foreground">
                Configure your store at the operational pages: products, categories, banners, orders.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
