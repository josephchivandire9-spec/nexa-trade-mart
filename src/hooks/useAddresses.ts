import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: string | null;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string | null;
  postal_code: string | null;
  is_default: boolean;
}

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("customer_addresses").select("*")
      .eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at");
    setAddresses((data as CustomerAddress[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function save(addr: Omit<CustomerAddress, "id" | "user_id">, id?: string) {
    if (!user) return { error: new Error("Not signed in") };
    if (addr.is_default) {
      await supabase.from("customer_addresses").update({ is_default: false }).eq("user_id", user.id);
    }
    if (id) {
      const { error } = await supabase.from("customer_addresses").update(addr).eq("id", id);
      await load();
      return { error };
    } else {
      const { error } = await supabase.from("customer_addresses").insert({ ...addr, user_id: user.id });
      await load();
      return { error };
    }
  }

  async function remove(id: string) {
    await supabase.from("customer_addresses").delete().eq("id", id);
    await load();
  }

  return { addresses, loading, save, remove, refresh: load };
}
