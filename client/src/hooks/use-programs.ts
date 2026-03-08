import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function usePrograms() {
  return useQuery({
    queryKey: [api.programs.list.path],
    queryFn: async () => {
      const res = await fetch(api.programs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal mengambil data program");
      const data = await res.json();
      return api.programs.list.responses[200].parse(data);
    },
  });
}

export function useProgram(id: number) {
  return useQuery({
    queryKey: [api.programs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.programs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Gagal mengambil data program");
      const data = await res.json();
      return api.programs.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

// In a real app this would be for an admin panel
export function useCreateProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.programs.create.input>) => {
      const validated = api.programs.create.input.parse(input);
      const res = await fetch(api.programs.create.path, {
        method: api.programs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validasi gagal");
        }
        throw new Error("Gagal membuat program");
      }
      return api.programs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.programs.list.path] });
    },
  });
}
