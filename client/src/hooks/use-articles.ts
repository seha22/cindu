import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

export function useArticles() {
  return useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });
}

export function useArticle(id: number) {
  return useQuery<Article>({
    queryKey: ["/api/articles", id],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${id}`);
      if (!res.ok) throw new Error("Article not found");
      return res.json();
    },
    enabled: !!id,
  });
}
