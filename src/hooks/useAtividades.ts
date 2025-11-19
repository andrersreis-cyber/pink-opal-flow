import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAtividades = () => {
  const { data: atividades, isLoading } = useQuery({
    queryKey: ["atividades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atividades_dashboard")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  return { atividades, isLoading };
};

