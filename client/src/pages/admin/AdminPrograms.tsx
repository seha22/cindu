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
import type { Program } from "@shared/schema";

export default function AdminPrograms() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", content: "", targetAmount: "", imageUrl: "[]",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const parseImages = (jsonStr: string): string[] => {
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : (jsonStr ? [jsonStr] : []);
    } catch {
      return jsonStr ? [jsonStr] : [];
    }
  };

  const { data: programs, isLoading } = useQuery<Program[]>({ queryKey: ["/api/programs"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/programs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Program berhasil ditambahkan" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/programs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Program berhasil diperbarui" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Program berhasil dihapus" });
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProgram(null);
    setForm({ title: "", description: "", content: "", targetAmount: "", imageUrl: "[]" });
  };

  const openCreate = () => {
    setEditingProgram(null);
    setForm({ title: "", description: "", content: "", targetAmount: "", imageUrl: "[]" });
    setDialogOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditingProgram(p);
    setForm({
      title: p.title,
      description: p.description,
      content: p.content || "",
      targetAmount: String(p.targetAmount),
      imageUrl: p.imageUrl,
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach(f => formData.append("files", f));
      const res = await fetch("/api/admin/uploads/programs", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload gagal");
      }
      const data = await res.json();
      const newUrls = data.imageUrls;

      let existing: string[] = [];
      try {
        const parsed = JSON.parse(form.imageUrl || "[]");
        existing = Array.isArray(parsed) ? parsed : [form.imageUrl];
      } catch {
        existing = form.imageUrl ? [form.imageUrl] : [];
      }

      setForm({ ...form, imageUrl: JSON.stringify([...existing, ...newUrls]) });
      toast({ title: "Gambar berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    try {
      const parsed = JSON.parse(form.imageUrl || "[]");
      if (Array.isArray(parsed)) {
        parsed.splice(index, 1);
        setForm({ ...form, imageUrl: JSON.stringify(parsed) });
      }
    } catch {
      setForm({ ...form, imageUrl: "[]" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title,
      description: form.description,
      content: form.content,
      targetAmount: Number(form.targetAmount),
      imageUrl: form.imageUrl,
      currentAmount: 0,
      donorCount: 0,
    };
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Program Amal</h1>
            <p className="text-muted-foreground text-sm mt-1">Kelola program donasi</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl gap-2" data-testid="button-add-program">
            <Plus className="w-4 h-4" /> Tambah Program
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {programs?.map((p) => (
              <Card key={p.id} className="border-0 shadow-md rounded-2xl" data-testid={`card-program-${p.id}`}>
                <CardContent className="p-4 flex gap-4 items-start">
                  <img src={parseImages(p.imageUrl)[0] || ""} alt={p.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Target: {formatCurrency(p.targetAmount)}</span>
                      <span>Terkumpul: {formatCurrency(p.currentAmount)}</span>
                      <span>{p.donorCount} donatur</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(p)} className="rounded-xl" data-testid={`button-edit-program-${p.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="rounded-xl text-destructive hover:text-destructive" data-testid={`button-delete-program-${p.id}`}>
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
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Edit Program" : "Tambah Program"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl" data-testid="input-program-title" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="rounded-xl" data-testid="input-program-description" />
            </div>
            <div className="space-y-2">
              <Label>Konten Detail</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="rounded-xl min-h-[120px]" data-testid="input-program-content" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Donasi (Rp)</Label>
                <Input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required className="rounded-xl" data-testid="input-program-target" />
              </div>
              <div className="space-y-4 col-span-2">
                <Label>Gambar Program</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="rounded-xl w-full"
                    data-testid="input-program-image-upload"
                  />
                  {uploadingImage && <div className="flex items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
                </div>
                {form.imageUrl && form.imageUrl !== "[]" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {parseImages(form.imageUrl).map((url, i) => (
                      <div key={i} className="relative w-20 h-20 group">
                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover rounded-lg border border-border" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isPending} className="w-full rounded-xl" data-testid="button-submit-program">
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProgram ? "Simpan Perubahan" : "Tambah Program"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
