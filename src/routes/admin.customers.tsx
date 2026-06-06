import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";
import { Search, User } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const [q, setQ] = useState("");

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,address,customer_code,created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: ordersByCustomer = {} } = useQuery({
    queryKey: ["admin-customer-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("customer_id,total");
      const map: Record<string, { count: number; total: number }> = {};
      (data ?? []).forEach((o: any) => {
        if (!o.customer_id) return;
        if (!map[o.customer_id]) map[o.customer_id] = { count: 0, total: 0 };
        map[o.customer_id].count += 1;
        map[o.customer_id].total += Number(o.total ?? 0);
      });
      return map;
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return profiles;
    return (profiles as any[]).filter(
      (p) =>
        p.email?.toLowerCase().includes(term) ||
        p.full_name?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term) ||
        p.customer_code?.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term)
    );
  }, [profiles, q]);

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <p className="text-sm text-muted-foreground mt-1">{profiles.length} registered</p>

      <div className="mt-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, phone, customer ID…"
          className="w-full h-11 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="mt-6 rounded-2xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No customers found.</div>
        ) : (
          <ul className="divide-y">
            {(filtered as any[]).map((p) => {
              const stats = (ordersByCustomer as any)[p.id] ?? { count: 0, total: 0 };
              return (
                <li key={p.id}>
                  <Link
                    to="/admin/customers/$id"
                    params={{ id: p.id }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-gold/10 text-gold-deep inline-flex items-center justify-center shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate flex items-center gap-2">
                        {p.full_name || "(no name)"}
                        {p.customer_code && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold/15 text-gold-deep">{p.customer_code}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.email} {p.phone ? `· ${p.phone}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatZAR(stats.total)}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {stats.count} order{stats.count === 1 ? "" : "s"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
