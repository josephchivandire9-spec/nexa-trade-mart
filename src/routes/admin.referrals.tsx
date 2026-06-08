import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "lucide-react";

export const Route = createFileRoute("/admin/referrals")({
  component: AdminReferrals,
});

function AdminReferrals() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () =>
      (await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Referral Program</h1>
        <p className="text-sm text-muted-foreground mt-1">Track referrals and bonus payouts.</p>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No referrals yet.</div>
        ) : (
          <ul className="divide-y">
            {(rows as any[]).map((r) => (
              <li key={r.id} className="p-4 flex items-center gap-3 text-sm">
                <div className="h-10 w-10 rounded-full bg-gold/10 text-gold-deep inline-flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">Code: {r.code}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(r.created_at).toLocaleString()} · status: {r.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{r.reward_points} pts</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
