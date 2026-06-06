import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Plus, Trash2, Star, MapPin } from "lucide-react";
import { useAddresses, type CustomerAddress } from "@/hooks/useAddresses";
import { toast } from "sonner";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({ meta: [{ title: "Saved Addresses — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: AddressesPage,
});

const empty = { label: "", recipient: "", phone: "", street: "", city: "Port Elizabeth", province: "Eastern Cape", postal_code: "", is_default: false };

function AddressesPage() {
  const { addresses, loading, save, remove } = useAddresses();
  const [editing, setEditing] = useState<null | { id?: string; data: typeof empty }>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!editing) return;
    if (!editing.data.recipient || !editing.data.phone || !editing.data.street) {
      toast.error("Recipient, phone and street are required");
      return;
    }
    setSaving(true);
    const { error } = (await save(editing.data, editing.id)) ?? {};
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Address saved");
      setEditing(null);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Saved Addresses</h1>
          <p className="text-sm text-muted-foreground">Default address auto-fills your next order.</p>
        </div>
        <button onClick={() => setEditing({ data: { ...empty } })}
          className="h-10 px-4 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {loading ? <Loader2 className="h-5 w-5 animate-spin mt-6" /> : (
        <div className="mt-5 space-y-3">
          {addresses.length === 0 && <p className="text-sm text-muted-foreground">No saved addresses yet.</p>}
          {addresses.map((a: CustomerAddress) => (
            <div key={a.id} className="rounded-xl border p-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold-deep" />
                  <span className="font-semibold">{a.label || a.recipient}</span>
                  {a.is_default && <span className="text-[10px] uppercase tracking-widest bg-gold/20 text-gold-deep px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Star className="h-3 w-3" /> Default</span>}
                </div>
                <p className="text-sm mt-1">{a.recipient} · {a.phone}</p>
                <p className="text-sm text-muted-foreground">{a.street}, {a.city}{a.province ? `, ${a.province}` : ""}{a.postal_code ? ` ${a.postal_code}` : ""}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ id: a.id, data: { label: a.label ?? "", recipient: a.recipient, phone: a.phone, street: a.street, city: a.city, province: a.province ?? "", postal_code: a.postal_code ?? "", is_default: a.is_default } })}
                  className="text-xs px-3 py-1.5 rounded border hover:bg-muted">Edit</button>
                <button onClick={() => { if (confirm("Delete this address?")) remove(a.id); }}
                  className="p-1.5 rounded border hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-2xl border w-full max-w-md p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg">{editing.id ? "Edit" : "New"} address</h3>
            {[
              ["label", "Label (Home, Office...)"],
              ["recipient", "Recipient *"],
              ["phone", "Phone *"],
              ["street", "Street *"],
              ["city", "City"],
              ["province", "Province"],
              ["postal_code", "Postal code"],
            ].map(([k, l]) => (
              <input key={k} placeholder={l}
                value={(editing.data as any)[k]}
                onChange={(e) => setEditing({ ...editing, data: { ...editing.data, [k]: e.target.value } })}
                className="w-full h-10 rounded-lg border bg-background px-3 text-sm" />
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.data.is_default}
                onChange={(e) => setEditing({ ...editing, data: { ...editing.data, is_default: e.target.checked } })} />
              Set as default
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 h-10 rounded-lg border text-sm">Cancel</button>
              <button onClick={submit} disabled={saving} className="flex-1 h-10 rounded-lg gradient-gold text-ink font-bold text-sm inline-flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
