import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, FileText, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { CmsPage } from "@shared/schema";
import HeroSlidesManager from "@/components/admin/HeroSlidesManager";

type HomeVideoItem = {
  title: string;
  youtubeUrl: string;
};

type HomeVideoForm = {
  heading: string;
  description: string;
  videos: HomeVideoItem[];
};

const defaultHomeVideoForm: HomeVideoForm = {
  heading: "Video Kegiatan",
  description: "Masukkan satu atau beberapa link YouTube untuk ditampilkan sebagai slider video di halaman utama.",
  videos: [{ title: "", youtubeUrl: "" }],
};

const defaultHomeVideoContent = JSON.stringify(defaultHomeVideoForm, null, 2);

const slugLabels: Record<string, string> = {
  sejarah: "Sejarah",
  "visi-misi": "Visi & Misi",
  "struktur-organisasi": "Struktur Organisasi",
  program: "Program Kami",
  "home-video": "Video Homepage",
};

const requiredCmsPages = [
  { slug: "home-video", title: "Video Homepage", content: defaultHomeVideoContent },
];

function createEmptyVideoItem(): HomeVideoItem {
  return { title: "", youtubeUrl: "" };
}

function parseHomeVideoContent(content: string): HomeVideoForm {
  try {
    const parsed = JSON.parse(content) as Partial<HomeVideoForm> & { youtubeUrl?: string };
    const parsedVideos = Array.isArray(parsed.videos)
      ? parsed.videos.map((video) => ({
          title: typeof video?.title === "string" ? video.title : "",
          youtubeUrl: typeof video?.youtubeUrl === "string" ? video.youtubeUrl : "",
        }))
      : [];

    return {
      heading: parsed.heading || defaultHomeVideoForm.heading,
      description: parsed.description || defaultHomeVideoForm.description,
      videos: parsedVideos.length > 0
        ? parsedVideos
        : parsed.youtubeUrl
          ? [{ title: "", youtubeUrl: parsed.youtubeUrl }]
          : defaultHomeVideoForm.videos,
    };
  } catch {
    return defaultHomeVideoForm;
  }
}

export default function AdminCms() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [homeVideoForm, setHomeVideoForm] = useState<HomeVideoForm>(defaultHomeVideoForm);

  const { data: pages, isLoading } = useQuery<CmsPage[]>({ queryKey: ["/api/cms"] });
  const cmsPages = [
    ...(pages || []),
    ...requiredCmsPages
      .filter((requiredPage) => !(pages || []).some((page) => page.slug === requiredPage.slug))
      .map((requiredPage, index) => ({
        id: -1000 - index,
        slug: requiredPage.slug,
        title: requiredPage.title,
        content: requiredPage.content,
        updatedAt: null,
      })),
  ];

  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/cms/${slug}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/home-video"] });
      toast({ title: "Halaman berhasil diperbarui" });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const openEdit = (page: CmsPage) => {
    setEditing(page);
    setForm({ title: page.title, content: page.content });
    setHomeVideoForm(page.slug === "home-video" ? parseHomeVideoContent(page.content) : defaultHomeVideoForm);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const payload = editing.slug === "home-video"
      ? {
          title: form.title,
          content: JSON.stringify(homeVideoForm, null, 2),
        }
      : form;

    updateMutation.mutate({ slug: editing.slug, data: payload });
  };

  const isHomeVideo = editing?.slug === "home-video";

  const updateHomeVideoItem = (index: number, key: keyof HomeVideoItem, value: string) => {
    setHomeVideoForm((current) => ({
      ...current,
      videos: current.videos.map((video, videoIndex) =>
        videoIndex === index ? { ...video, [key]: value } : video,
      ),
    }));
  };

  const addHomeVideoItem = () => {
    setHomeVideoForm((current) => ({
      ...current,
      videos: [...current.videos, createEmptyVideoItem()],
    }));
  };

  const removeHomeVideoItem = (index: number) => {
    setHomeVideoForm((current) => ({
      ...current,
      videos: current.videos.length > 1
        ? current.videos.filter((_, videoIndex) => videoIndex !== index)
        : [createEmptyVideoItem()],
    }));
  };

  const moveHomeVideoItem = (index: number, direction: -1 | 1) => {
    setHomeVideoForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.videos.length) {
        return current;
      }

      const nextVideos = [...current.videos];
      const currentVideo = nextVideos[index];
      nextVideos[index] = nextVideos[nextIndex];
      nextVideos[nextIndex] = currentVideo;

      return {
        ...current,
        videos: nextVideos,
      };
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Halaman CMS</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola konten halaman Tentang Kami dan section homepage</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {cmsPages.map((page) => (
              <Card key={page.id} className="border-0 shadow-md rounded-2xl" data-testid={`card-cms-${page.slug}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{slugLabels[page.slug] || page.title}</h3>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openEdit(page)} className="rounded-xl gap-2" data-testid={`button-edit-cms-${page.slug}`}>
                    <Pencil className="w-4 h-4" /> Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <HeroSlidesManager />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[760px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editing ? (slugLabels[editing.slug] || editing.title) : ""}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl" data-testid="input-cms-title" />
            </div>

            {isHomeVideo ? (
              <>
                <div className="space-y-2">
                  <Label>Heading Section</Label>
                  <Input
                    value={homeVideoForm.heading}
                    onChange={(e) => setHomeVideoForm({ ...homeVideoForm, heading: e.target.value })}
                    required
                    className="rounded-xl"
                    data-testid="input-home-video-heading"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={homeVideoForm.description}
                    onChange={(e) => setHomeVideoForm({ ...homeVideoForm, description: e.target.value })}
                    required
                    className="rounded-xl min-h-[140px]"
                    data-testid="input-home-video-description"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Daftar Video YouTube</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl gap-2"
                      onClick={addHomeVideoItem}
                      data-testid="button-home-video-add"
                    >
                      <Plus className="w-4 h-4" /> Tambah Video
                    </Button>
                  </div>

                  {homeVideoForm.videos.map((video, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Video {index + 1}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg"
                            onClick={() => moveHomeVideoItem(index, -1)}
                            disabled={index === 0}
                            data-testid={`button-home-video-up-${index}`}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg"
                            onClick={() => moveHomeVideoItem(index, 1)}
                            disabled={index === homeVideoForm.videos.length - 1}
                            data-testid={`button-home-video-down-${index}`}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => removeHomeVideoItem(index)}
                            data-testid={`button-home-video-remove-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Judul Video (opsional)</Label>
                        <Input
                          value={video.title}
                          onChange={(e) => updateHomeVideoItem(index, "title", e.target.value)}
                          placeholder="Contoh: Dokumentasi Penyaluran Bantuan"
                          className="rounded-xl"
                          data-testid={`input-home-video-title-${index}`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link YouTube</Label>
                        <Input
                          type="url"
                          value={video.youtubeUrl}
                          onChange={(e) => updateHomeVideoItem(index, "youtubeUrl", e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="rounded-xl"
                          data-testid={`input-home-video-url-${index}`}
                        />
                      </div>
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground">Gunakan link YouTube biasa seperti `watch?v=...` atau `youtu.be/...`. Video dengan link kosong akan diabaikan di homepage.</p>
                </div>
              </>
            ) : (
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
            )}

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