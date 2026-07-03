import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_enabled: boolean;
}

export function useSocialLinks(all = false) {
  return useQuery({
    queryKey: ["social-links", all],
    queryFn: async (): Promise<SocialLink[]> => {
      let q = supabase.from("social_links").select("*").order("sort_order", { ascending: true });
      if (!all) q = q.eq("is_enabled", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as SocialLink[];
    },
    staleTime: 30_000,
  });
}
