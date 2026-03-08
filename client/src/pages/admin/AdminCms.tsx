import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, FileText } from "lucide-react";
import type { CmsPage } from "@shared/schema";

const slugLabels: Record<string, string> = {
  sejarah: "Sejarah",
  "visi-misi": "Visi & Misi",
  "struktur-organisasi": "Struktur Organisasi",
  program: "Program Kami",
};

export default function AdminCms() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const { data: pages, isLoading } = useQuery<CmsPage[]>({ queryKey: ["/api/cms"] });

  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/cms/${slug}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms"] });
      toast({ title: "Halaman berhasil diperbarui" });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const openEdit = (p: CmsPage) => {
    setEditing(p);
    setForm({ title: p.title, content: p.content });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    updateMutation.mutate({ slug: editing.slug, data: form });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Halaman CMS</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola konten halaman Tentang Kami</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {pages?.map((p) => (
              <Card key={p.id} className="border-0 shadow-md rounded-2xl" data-testid={`card-cms-${p.slug}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{slugLabels[p.slug] || p.title}</h3>
                      <p className="text-xs text-muted-foreground">/{p.slug}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="rounded-xl gap-2" data-testid={`button-edit-cms-${p.slug}`}>
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editing ? (slugLabels[editing.slug] || editing.title) : ""}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl" data-testid="input-cms-title" />
            </div>
            <div className="space-y-2">
              <Label>Konten (JSON)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                className="rounded-xl min-h-[300px] font-mono text-sm"
                data-testid="input-cms-content"
              />
              <p className="text-xs text-muted-foreground">Konten disimpan dalam format JSON. Edit dengan hati-hati.</p>
            </div>
            <Button type="submit" disabled={updateMutation.isPending} className="w-full rounded-xl" data-testid="button-submit-cms">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Simpan Perubahan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
