import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Article } from "@shared/schema";

export default function AdminArticles() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", imageUrl: "", author: "", category: "",
  });

  const { data: articles, isLoading } = useQuery<Article[]>({ queryKey: ["/api/articles"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/articles", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/articles"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); toast({ title: "Artikel berhasil ditambahkan" }); closeDialog(); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PUT", `/api/articles/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/articles"] }); toast({ title: "Artikel berhasil diperbarui" }); closeDialog(); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/articles/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/articles"] }); queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] }); toast({ title: "Artikel berhasil dihapus" }); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm({ title: "", excerpt: "", content: "", imageUrl: "", author: "", category: "" }); };

  const openCreate = () => { setEditing(null); setForm({ title: "", excerpt: "", content: "", imageUrl: "", author: "", category: "" }); setDialogOpen(true); };

  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({ title: a.title, excerpt: a.excerpt, content: a.content, imageUrl: a.imageUrl, author: a.author, category: a.category });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Artikel</h1>
            <p className="text-muted-foreground text-sm mt-1">Kelola artikel dan berita</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl gap-2" data-testid="button-add-article">
            <Plus className="w-4 h-4" /> Tambah Artikel
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {articles?.map((a) => (
              <Card key={a.id} className="border-0 shadow-md rounded-2xl" data-testid={`card-article-${a.id}`}>
                <CardContent className="p-4 flex gap-4 items-start">
                  <img src={a.imageUrl} alt={a.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.category}</span>
                    </div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{a.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-1">Oleh: {a.author}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(a)} className="rounded-xl" data-testid={`button-edit-article-${a.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(a.id)} className="rounded-xl text-destructive hover:text-destructive" data-testid={`button-delete-article-${a.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Artikel" : "Tambah Artikel"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl" data-testid="input-article-title" />
            </div>
            <div className="space-y-2">
              <Label>Ringkasan</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required className="rounded-xl" data-testid="input-article-excerpt" />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required className="rounded-xl min-h-[150px]" data-testid="input-article-content" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Penulis</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required className="rounded-xl" data-testid="input-article-author" />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="rounded-xl" data-testid="input-article-category" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required className="rounded-xl" data-testid="input-article-image" />
            </div>
            <Button type="submit" disabled={isPending} className="w-full rounded-xl" data-testid="button-submit-article">
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Simpan Perubahan" : "Tambah Artikel"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
