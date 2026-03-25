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
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import type { Gallery } from "@shared/schema";

export default function AdminGallery() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", imageUrl: "", category: "umum",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: galleries, isLoading } = useQuery<Gallery[]>({ queryKey: ["/api/galleries"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/galleries", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/galleries"] }); toast({ title: "Galeri berhasil ditambahkan" }); closeDialog(); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PUT", `/api/admin/galleries/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/galleries"] }); toast({ title: "Galeri berhasil diperbarui" }); closeDialog(); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/galleries/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/galleries"] }); toast({ title: "Galeri berhasil dihapus" }); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm({ title: "", description: "", imageUrl: "", category: "umum" }); };

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", imageUrl: "", category: "umum" }); setDialogOpen(true); };

  const openEdit = (g: Gallery) => {
    setEditing(g);
    setForm({ title: g.title, description: g.description || "", imageUrl: g.imageUrl, category: g.category });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      const res = await fetch("/api/admin/uploads/gallery", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload gagal");
      }
      const data = await res.json();
      setForm({ ...form, imageUrl: data.imageUrl });
      toast({ title: "Gambar berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setForm({ ...form, imageUrl: "" });
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
            <h1 className="font-display text-2xl font-bold">Galeri Kegiatan</h1>
            <p className="text-muted-foreground text-sm mt-1">Kelola foto kegiatan yayasan</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl gap-2" data-testid="button-add-gallery">
            <Plus className="w-4 h-4" /> Tambah Foto
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries?.map((g) => (
              <Card key={g.id} className="border-border/50 shadow-md rounded-2xl overflow-hidden group hover:shadow-lg transition-all" data-testid={`card-gallery-${g.id}`}>
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {g.imageUrl ? (
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-10 h-10 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" onClick={() => openEdit(g)} className="w-8 h-8 rounded-lg shadow-md bg-white/90 hover:bg-white text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(g.id)} className="w-8 h-8 rounded-lg shadow-md bg-red-500/90 hover:bg-red-500 text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-sm shadow-sm">
                      {g.category}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4 bg-card">
                  <h3 className="font-bold text-foreground line-clamp-1">{g.title}</h3>
                  {g.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{g.description}</p>}
                </CardContent>
              </Card>
            ))}
            
            {galleries?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada foto galeri.</p>
                <Button variant="ghost" onClick={openCreate} className="mt-2 text-primary">Tambah foto sekarang</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Foto Galeri" : "Tambah Foto Galeri"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Judul Kegiatan</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl" placeholder="Contoh: Penyaluran Sembako Ramadhan" />
            </div>
            
            <div className="space-y-2">
              <Label>Deskripsi Singkat (Opsional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl resize-none h-20" placeholder="Keterangan tambahan mengenai foto ini..." />
            </div>
            
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="rounded-xl" placeholder="Contoh: umum, donasi, program" />
            </div>
            
            <div className="space-y-3">
              <Label>Upload Foto</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="rounded-xl w-full"
                />
                {uploadingImage && <div className="flex items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
              </div>
              
              {form.imageUrl && (
                <div className="relative mt-3 rounded-xl overflow-hidden border border-border group w-full aspect-video bg-muted flex items-center justify-center">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="gap-2">
                      <Trash2 className="w-4 h-4" /> Hapus Foto
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-2">
              <Button type="submit" disabled={isPending || !form.imageUrl} className="w-full rounded-xl gap-2 h-11">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Simpan Perubahan" : "Tambah Koleksi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
