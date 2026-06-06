import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  customer_code: string | null;
  referral_code: string | null;
  referred_by: string | null;
}

const COLS = "id,email,full_name,phone,address,customer_code,referral_code,referred_by";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select(COLS)
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile((data as Profile | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function update(patch: Partial<Pick<Profile, "full_name" | "phone" | "address">>) {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select(COLS)
      .single();
    if (!error && data) setProfile(data as Profile);
    return { error };
  }

  return { profile, loading, update };
}
