import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HeroSlide } from "@shared/schema";

type UploadResult = {
  imageUrl: string;
  imagePath: string;
};

type SlideForm = {
  title: string;
  subtitle: string;
  altText: string;
  imageUrl: string;
  imagePath: string | null;
  isActive: boolean;
};

const initialForm: SlideForm = {
  title: "",
  subtitle: "",
  altText: "",
  imageUrl: "",
  imagePath: null,
  isActive: true,
};

async function uploadHeroImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/uploads/hero", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const errorPayload = await res.json().catch(() => null);
    throw new Error(errorPayload?.message || "Gagal mengunggah gambar");
  }

  return res.json();
}

export default function HeroSlidesManager() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<SlideForm>(initialForm);

  const { data: slides, isLoading } = useQuery<HeroSlide[]>({ queryKey: ["/api/admin/hero-slides"] });

  const sortedSlides = useMemo(
    () => [...(slides || [])].sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id),
    [slides],
  );

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(form.imageUrl);
  }, [selectedFile, form.imageUrl]);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingSlide(null);
    setSelectedFile(null);
    setForm(initialForm);
  };

  const openCreate = () => {
    setEditingSlide(null);
    setSelectedFile(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSelectedFile(null);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      altText: slide.altText,
      imageUrl: slide.imageUrl,
      imagePath: slide.imagePath || null,
      isActive: slide.isActive,
    });
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let nextForm = { ...form };

      if (selectedFile) {
        const upload = await uploadHeroImage(selectedFile);
        nextForm = {
          ...nextForm,
          imageUrl: upload.imageUrl,
          imagePath: upload.imagePath,
        };
      }

      if (!nextForm.imageUrl) {
        throw new Error("Gambar hero wajib diunggah");
      }

      if (editingSlide) {
        const res = await apiRequest("PUT", `/api/admin/hero-slides/${editingSlide.id}`, nextForm);
        return res.json();
      }

      const res = await apiRequest("POST", "/api/admin/hero-slides", nextForm);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] });
      toast({ title: editingSlide ? "Slide hero diperbarui" : "Slide hero ditambahkan" });
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/hero-slides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] });
      toast({ title: "Slide hero dihapus" });
    },
    onError: (err: Error) => {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: Array<{ id: number; sortOrder: number }>) => {
      await apiRequest("PATCH", "/api/admin/hero-slides/reorder", { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-slides"] });
    },
    onError: (err: Error) => {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    },
  });

  const moveSlide = (slideId: number, direction: -1 | 1) => {
    const index = sortedSlides.findIndex((slide) => slide.id === slideId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= sortedSlides.length) {
      return;
    }

    const next = [...sortedSlides];
    const current = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = current;

    reorderMutation.mutate(next.map((slide, idx) => ({ id: slide.id, sortOrder: idx + 1 })));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const mutationPending = saveMutation.isPending || reorderMutation.isPending || deleteMutation.isPending;

  return (
    <Card className="border-0 shadow-md rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Hero Homepage</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Kelola gambar slideshow pada section hero halaman utama.</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl gap-2" data-testid="button-add-hero-slide">
          <Plus className="w-4 h-4" /> Tambah Slide
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : sortedSlides.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada slide hero. Tambahkan slide pertama Anda.
          </div>
        ) : (
          sortedSlides.map((slide, index) => (
            <div key={slide.id} className="border border-border/70 rounded-xl p-3 flex gap-3 items-start" data-testid={`card-hero-slide-${slide.id}`}>
              <div className="w-28 h-20 rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center flex-shrink-0">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.altText} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{slide.title || "(Tanpa Judul)"}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {slide.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">Alt: {slide.altText}</p>
                {slide.subtitle ? <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{slide.subtitle}</p> : null}
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  disabled={mutationPending || index === 0}
                  onClick={() => moveSlide(slide.id, -1)}
                  data-testid={`button-hero-slide-up-${slide.id}`}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  disabled={mutationPending || index === sortedSlides.length - 1}
                  onClick={() => moveSlide(slide.id, 1)}
                  data-testid={`button-hero-slide-down-${slide.id}`}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg"
                  disabled={mutationPending}
                  onClick={() => openEdit(slide)}
                  data-testid={`button-edit-hero-slide-${slide.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg text-destructive hover:text-destructive"
                  disabled={mutationPending}
                  onClick={() => deleteMutation.mutate(slide.id)}
                  data-testid={`button-delete-hero-slide-${slide.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Edit Slide Hero" : "Tambah Slide Hero"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-image">Upload Gambar</Label>
              <Input
                id="hero-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                }}
                className="rounded-xl"
                data-testid="input-hero-slide-image"
              />
              <p className="text-xs text-muted-foreground">Format: JPG, PNG, WEBP. Ukuran maksimal 3MB.</p>
            </div>

            {previewUrl ? (
              <div className="rounded-xl overflow-hidden border border-border/60">
                <img src={previewUrl} alt="Preview slide hero" className="w-full h-48 object-cover" />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="hero-alt-text">Alt Text</Label>
              <Input
                id="hero-alt-text"
                value={form.altText}
                onChange={(event) => setForm({ ...form, altText: event.target.value })}
                required
                className="rounded-xl"
                data-testid="input-hero-slide-alt-text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-title">Judul (opsional)</Label>
              <Input
                id="hero-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="rounded-xl"
                data-testid="input-hero-slide-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">Subjudul (opsional)</Label>
              <Textarea
                id="hero-subtitle"
                value={form.subtitle}
                onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                className="rounded-xl min-h-[90px]"
                data-testid="input-hero-slide-subtitle"
              />
            </div>

            <div className="flex items-center justify-between border border-border/60 rounded-xl px-3 py-2">
              <div>
                <p className="text-sm font-medium">Slide aktif</p>
                <p className="text-xs text-muted-foreground">Hanya slide aktif yang tampil di homepage.</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                data-testid="switch-hero-slide-active"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="rounded-xl" onClick={closeDialog}>
                Batal
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saveMutation.isPending} data-testid="button-submit-hero-slide">
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingSlide ? "Simpan Perubahan" : "Tambah Slide"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
