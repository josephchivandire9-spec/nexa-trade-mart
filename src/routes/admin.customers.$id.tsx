import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/customers/$id")({
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();

  const { data: profile } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,full_name,phone,address,created_at")
        .eq("id", id)
        .maybeSingle();
      return data;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-customer-orders", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const lifetime = (orders as any[]).reduce((s, o) => s + Number(o.total ?? 0), 0);

  return (
    <div>
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All customers
      </Link>
      <h1 className="mt-2 font-display text-3xl">{profile?.full_name || "Customer"}</h1>
      <div className="mt-1 text-xs text-muted-foreground">ID: {id}</div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5 space-y-2 text-sm">
          {profile?.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold-deep" />{profile.email}</div>}
          {profile?.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-deep" />{profile.phone}</div>}
          {profile?.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold-deep" />{profile.address}</div>}
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Lifetime spend</div>
          <div className="mt-1 font-display text-2xl">{formatZAR(lifetime)}</div>
          <div className="text-xs text-muted-foreground mt-1">{orders.length} order{orders.length === 1 ? "" : "s"}</div>
        </div>
      </div>

      <h2 className="mt-8 font-display text-xl">Order history</h2>
      <div className="mt-3 space-y-2">
        {orders.length === 0 ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground text-center">No orders.</div>
        ) : (
          (orders as any[]).map((o) => (
            <div key={o.id} className="rounded-xl border bg-card p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">#{o.id.slice(0, 8)}</div>
                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatZAR(o.total)}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
