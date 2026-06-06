import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RewardEntry {
  id: string;
  points: number;
  reason: string;
  status: string;
  order_id: string | null;
  created_at: string;
}

export function useRewards() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("reward_points")
      .select("id,points,reason,status,order_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setEntries((data as RewardEntry[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const approved = entries.filter((e) => e.status === "approved").reduce((s, e) => s + e.points, 0);
  const pending = entries.filter((e) => e.status === "pending").reduce((s, e) => s + e.points, 0);

  return { entries, loading, approved, pending, refresh: load };
}
