import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

export function useDonations() {
  return useQuery({
    queryKey: [api.donations.list.path],
    queryFn: async () => {
      const res = await fetch(api.donations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal mengambil data donasi");
      const data = await res.json();
      return api.donations.list.responses[200].parse(data);
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.donations.create.input>) => {
      // Coerce amount to a number to be safe if it comes from a text input
      const preparedInput = {
        ...input,
        amount: Number(input.amount)
      };
      
      const validated = api.donations.create.input.parse(preparedInput);
      const res = await fetch(api.donations.create.path, {
        method: api.donations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validasi gagal");
        }
        throw new Error("Gagal memproses donasi");
      }
      return api.donations.create.responses[201].parse(await res.json());
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.donations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.programs.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      queryClient.invalidateQueries({ queryKey: [api.programs.get.path, variables.programId] });
    },
  });
}
