import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
}

export function useBanners() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["banners-public"],
    queryFn: async (): Promise<Banner[]> => {
      const { data, error } = await supabase
        .from("banners")
        .select("id,title,subtitle,image_url,cta_text,cta_link,sort_order,is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Banner[];
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("banners-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, () => {
        qc.invalidateQueries({ queryKey: ["banners-public"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return query;
}
