import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  reward_points: number;
  created_at: string;
}

export function useReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("referrals")
      .select("id,referrer_id,referred_id,status,reward_points,created_at")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });
    setReferrals((data as Referral[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { referrals, loading, refresh: load };
}
