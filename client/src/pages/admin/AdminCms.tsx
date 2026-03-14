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
import { Pencil, Loader2, FileText, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, User } from "lucide-react";
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

type StrukturMember = {
  name: string;
  position: string;
  image: string;
  imagePath?: string | null;
};

type StrukturForm = {
  description: string;
  members: StrukturMember[];
};

const defaultStrukturForm: StrukturForm = {
  description: "Struktur organisasi Yayasan Cinta Dhuafa terdiri dari para profesional yang berdedikasi tinggi.",
  members: [
    { name: "Dr. H. Ahmad Sulaiman", position: "Ketua Yayasan", image: "" },
  ],
};

function parseStrukturContent(content: string): StrukturForm {
  try {
    const parsed = JSON.parse(content);
    return {
      description: parsed.description || defaultStrukturForm.description,
      members: Array.isArray(parsed.members) ? parsed.members.map((m: any) => ({
        name: m.name || "",
        position: m.position || "",
        image: m.image || "",
        imagePath: m.imagePath || null
      })) : defaultStrukturForm.members
    };
  } catch {
    return defaultStrukturForm;
  }
}

type SejarahTimelineItem = {
  year: string;
  title: string;
  description: string;
};

type SejarahForm = {
  intro: string;
  timeline: SejarahTimelineItem[];
};

const defaultSejarahForm: SejarahForm = {
  intro: "Yayasan Cinta Dhuafa didirikan pada tahun 2010...",
  timeline: [
    { year: "2010", title: "Pendirian Yayasan", description: "Yayasan Cinta Dhuafa resmi didirikan di Jakarta." },
  ],
};

function parseSejarahContent(content: string): SejarahForm {
  try {
    const parsed = JSON.parse(content);
    return {
      intro: parsed.intro || defaultSejarahForm.intro,
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline.map((t: any) => ({
        year: t.year || "",
        title: t.title || "",
        description: t.description || ""
      })) : defaultSejarahForm.timeline
    };
  } catch {
    return defaultSejarahForm;
  }
}

type VisiMisiValueItem = {
  title: string;
  description: string;
};

type VisiMisiForm = {
  visi: string;
  misi: string[];
  values: VisiMisiValueItem[];
};

const defaultVisiMisiForm: VisiMisiForm = {
  visi: "Menjadi yayasan terdepan...",
  misi: ["Menyalurkan bantuan pangan..."],
  values: [
    { title: "Amanah", description: "Menjaga kepercayaan donatur..." }
  ]
};

function parseVisiMisiContent(content: string): VisiMisiForm {
  try {
    const parsed = JSON.parse(content);
    return {
      visi: parsed.visi || defaultVisiMisiForm.visi,
      misi: Array.isArray(parsed.misi) ? parsed.misi : defaultVisiMisiForm.misi,
      values: Array.isArray(parsed.values) ? parsed.values.map((v: any) => ({
        title: v.title || "",
        description: v.description || ""
      })) : defaultVisiMisiForm.values
    };
  } catch {
    return defaultVisiMisiForm;
  }
}

type ProgramAreaItem = {
  title: string;
  description: string;
  icon: string;
};

type ProgramForm = {
  intro: string;
  areas: ProgramAreaItem[];
};

const defaultProgramForm: ProgramForm = {
  intro: "Yayasan Cinta Dhuafa menjalankan berbagai program...",
  areas: [
    { title: "Pendidikan", description: "Program beasiswa...", icon: "GraduationCap" }
  ]
};

function parseProgramContent(content: string): ProgramForm {
  try {
    const parsed = JSON.parse(content);
    return {
      intro: parsed.intro || defaultProgramForm.intro,
      areas: Array.isArray(parsed.areas) ? parsed.areas.map((a: any) => ({
        title: a.title || "",
        description: a.description || "",
        icon: a.icon || "GraduationCap"
      })) : defaultProgramForm.areas
    };
  } catch {
    return defaultProgramForm;
  }
}

export default function AdminCms() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [homeVideoForm, setHomeVideoForm] = useState<HomeVideoForm>(defaultHomeVideoForm);
  const [strukturForm, setStrukturForm] = useState<StrukturForm>(defaultStrukturForm);
  const [sejarahForm, setSejarahForm] = useState<SejarahForm>(defaultSejarahForm);
  const [visiMisiForm, setVisiMisiForm] = useState<VisiMisiForm>(defaultVisiMisiForm);
  const [programForm, setProgramForm] = useState<ProgramForm>(defaultProgramForm);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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
    setStrukturForm(page.slug === "struktur-organisasi" ? parseStrukturContent(page.content) : defaultStrukturForm);
    setSejarahForm(page.slug === "sejarah" ? parseSejarahContent(page.content) : defaultSejarahForm);
    setVisiMisiForm(page.slug === "visi-misi" ? parseVisiMisiContent(page.content) : defaultVisiMisiForm);
    setProgramForm(page.slug === "program" ? parseProgramContent(page.content) : defaultProgramForm);
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
      : editing.slug === "struktur-organisasi"
        ? {
          title: form.title,
          content: JSON.stringify(strukturForm, null, 2),
        }
        : editing.slug === "sejarah"
          ? {
            title: form.title,
            content: JSON.stringify(sejarahForm, null, 2),
          }
          : editing.slug === "visi-misi"
            ? {
              title: form.title,
              content: JSON.stringify(visiMisiForm, null, 2),
            }
            : editing.slug === "program"
              ? {
                title: form.title,
                content: JSON.stringify(programForm, null, 2),
              }
              : form;

    updateMutation.mutate({ slug: editing.slug, data: payload });
  };

  const isHomeVideo = editing?.slug === "home-video";
  const isStruktur = editing?.slug === "struktur-organisasi";
  const isSejarah = editing?.slug === "sejarah";
  const isVisiMisi = editing?.slug === "visi-misi";
  const isProgram = editing?.slug === "program";

  // Helpers for VisiMisi
  const addVisiMisiMisi = () => {
    setVisiMisiForm(cur => ({ ...cur, misi: [...cur.misi, ""] }));
  };
  const updateVisiMisiMisi = (index: number, val: string) => {
    setVisiMisiForm(cur => ({ ...cur, misi: cur.misi.map((m, i) => i === index ? val : m) }));
  };
  const removeVisiMisiMisi = (index: number) => {
    setVisiMisiForm(cur => ({ ...cur, misi: cur.misi.filter((_, i) => i !== index) }));
  };
  const moveVisiMisiMisi = (idx: number, dir: -1 | 1) => {
    setVisiMisiForm(cur => {
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= cur.misi.length) return cur;
      const nextMisi = [...cur.misi];
      const temp = nextMisi[idx];
      nextMisi[idx] = nextMisi[nextIdx];
      nextMisi[nextIdx] = temp;
      return { ...cur, misi: nextMisi };
    });
  };

  const addVisiMisiValue = () => {
    setVisiMisiForm(cur => ({ ...cur, values: [...cur.values, { title: "", description: "" }] }));
  };
  const updateVisiMisiValue = (index: number, key: keyof VisiMisiValueItem, val: string) => {
    setVisiMisiForm(cur => ({ ...cur, values: cur.values.map((v, i) => i === index ? { ...v, [key]: val } : v) }));
  };
  const removeVisiMisiValue = (index: number) => {
    setVisiMisiForm(cur => ({ ...cur, values: cur.values.filter((_, i) => i !== index) }));
  };
  const moveVisiMisiValue = (idx: number, dir: -1 | 1) => {
    setVisiMisiForm(cur => {
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= cur.values.length) return cur;
      const nextVals = [...cur.values];
      const temp = nextVals[idx];
      nextVals[idx] = nextVals[nextIdx];
      nextVals[nextIdx] = temp;
      return { ...cur, values: nextVals };
    });
  };

  // Helpers for Program
  const addProgramArea = () => {
    setProgramForm(cur => ({ ...cur, areas: [...cur.areas, { title: "", description: "", icon: "Star" }] }));
  };
  const updateProgramArea = (index: number, key: keyof ProgramAreaItem, val: string) => {
    setProgramForm(cur => ({ ...cur, areas: cur.areas.map((a, i) => i === index ? { ...a, [key]: val } : a) }));
  };
  const removeProgramArea = (index: number) => {
    setProgramForm(cur => ({ ...cur, areas: cur.areas.filter((_, i) => i !== index) }));
  };
  const moveProgramArea = (idx: number, dir: -1 | 1) => {
    setProgramForm(cur => {
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= cur.areas.length) return cur;
      const nextAreas = [...cur.areas];
      const temp = nextAreas[idx];
      nextAreas[idx] = nextAreas[nextIdx];
      nextAreas[nextIdx] = temp;
      return { ...cur, areas: nextAreas };
    });
  };

  const updateSejarahTimeline = (index: number, key: keyof SejarahTimelineItem, value: string) => {
    setSejarahForm((current) => ({
      ...current,
      timeline: current.timeline.map((item, i) => i === index ? { ...item, [key]: value } : item),
    }));
  };

  const addSejarahTimeline = () => {
    setSejarahForm((current) => ({
      ...current,
      timeline: [...current.timeline, { year: "", title: "", description: "" }],
    }));
  };

  const removeSejarahTimeline = (index: number) => {
    setSejarahForm((current) => ({
      ...current,
      timeline: current.timeline.filter((_, i) => i !== index),
    }));
  };

  const moveSejarahTimeline = (index: number, direction: -1 | 1) => {
    setSejarahForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.timeline.length) return current;
      const nextTimeline = [...current.timeline];
      const temp = nextTimeline[index];
      nextTimeline[index] = nextTimeline[nextIndex];
      nextTimeline[nextIndex] = temp;
      return { ...current, timeline: nextTimeline };
    });
  };

  const updateStrukturMember = (index: number, key: keyof StrukturMember, value: string) => {
    setStrukturForm((current) => ({
      ...current,
      members: current.members.map((member, i) => i === index ? { ...member, [key]: value } : member),
    }));
  };

  const addStrukturMember = () => {
    setStrukturForm((current) => ({
      ...current,
      members: [...current.members, { name: "", position: "", image: "" }],
    }));
  };

  const removeStrukturMember = (index: number) => {
    setStrukturForm((current) => ({
      ...current,
      members: current.members.filter((_, i) => i !== index),
    }));
  };

  const moveStrukturMember = (index: number, direction: -1 | 1) => {
    setStrukturForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.members.length) return current;
      const nextMembers = [...current.members];
      const temp = nextMembers[index];
      nextMembers[index] = nextMembers[nextIndex];
      nextMembers[nextIndex] = temp;
      return { ...current, members: nextMembers };
    });
  };

  const handleUploadPhoto = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/uploads/hero", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => null);
        throw new Error(errPayload?.message || "Gagal mengunggah foto");
      }

      const data = await res.json();
      updateStrukturMember(index, "image", data.imageUrl);
      updateStrukturMember(index, "imagePath", data.imagePath);
      toast({ title: "Foto berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Gagal mengunggah foto", description: err.message, variant: "destructive" });
    } finally {
      setUploadingIndex(null);
    }
  };

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
            ) : isStruktur ? (
              <>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={strukturForm.description}
                    onChange={(e) => setStrukturForm({ ...strukturForm, description: e.target.value })}
                    required
                    className="rounded-xl min-h-[90px]"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Daftar Jabatan</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl gap-2"
                      onClick={addStrukturMember}
                    >
                      <Plus className="w-4 h-4" /> Tambah Jabatan
                    </Button>
                  </div>

                  {strukturForm.members.map((member, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Anggota {index + 1}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg h-8 w-8"
                            onClick={() => moveStrukturMember(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg h-8 w-8"
                            onClick={() => moveStrukturMember(index, 1)}
                            disabled={index === strukturForm.members.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => removeStrukturMember(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-20 h-20 rounded-full bg-background overflow-hidden flex items-center justify-center border border-border/50 flex-shrink-0">
                            {member.image ? (
                              <img src={member.image} alt="foto profil" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-muted-foreground/50" />
                            )}
                          </div>
                          {uploadingIndex === index ? (
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          ) : (
                            <div>
                              <Input
                                type="file"
                                id={`file-upload-${index}`}
                                className="hidden"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadPhoto(index, file);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 rounded-lg"
                                onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                              >
                                Upload Foto
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3 w-full">
                          <div className="space-y-2">
                            <Label>Nama</Label>
                            <Input
                              value={member.name}
                              onChange={(e) => updateStrukturMember(index, "name", e.target.value)}
                              placeholder="Contoh: Dr. H. Ahmad Sulaiman"
                              className="rounded-xl"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Jabatan</Label>
                            <Input
                              value={member.position}
                              onChange={(e) => updateStrukturMember(index, "position", e.target.value)}
                              placeholder="Contoh: Ketua Yayasan"
                              className="rounded-xl"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : isSejarah ? (
              <>
                <div className="space-y-2">
                  <Label>Teks Pengantar</Label>
                  <Textarea
                    value={sejarahForm.intro}
                    onChange={(e) => setSejarahForm({ ...sejarahForm, intro: e.target.value })}
                    required
                    className="rounded-xl min-h-[90px]"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Timeline Sejarah</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl gap-2"
                      onClick={addSejarahTimeline}
                    >
                      <Plus className="w-4 h-4" /> Tambah Momen
                    </Button>
                  </div>

                  {sejarahForm.timeline.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Momen {index + 1}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg h-8 w-8"
                            onClick={() => moveSejarahTimeline(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg h-8 w-8"
                            onClick={() => moveSejarahTimeline(index, 1)}
                            disabled={index === sejarahForm.timeline.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-lg text-destructive hover:text-destructive h-8 w-8"
                            onClick={() => removeSejarahTimeline(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-2 sm:col-span-1">
                          <Label>Tahun</Label>
                          <Input
                            value={item.year}
                            onChange={(e) => updateSejarahTimeline(index, "year", e.target.value)}
                            placeholder="Contoh: 2010"
                            className="rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-3">
                          <Label>Judul Momen</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateSejarahTimeline(index, "title", e.target.value)}
                            placeholder="Contoh: Pendirian Yayasan"
                            className="rounded-xl"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi Momen</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateSejarahTimeline(index, "description", e.target.value)}
                          placeholder="Jelaskan secara singkat apa yang terjadi..."
                          className="rounded-xl min-h-[60px]"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : isVisiMisi ? (
              <>
                <div className="space-y-2">
                  <Label>Teks Visi</Label>
                  <Textarea
                    value={visiMisiForm.visi}
                    onChange={(e) => setVisiMisiForm({ ...visiMisiForm, visi: e.target.value })}
                    required
                    className="rounded-xl min-h-[90px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Daftar Misi</Label>
                    <Button type="button" variant="outline" className="rounded-xl gap-2" onClick={addVisiMisiMisi}>
                      <Plus className="w-4 h-4" /> Tambah Misi
                    </Button>
                  </div>
                  {visiMisiForm.misi.map((m, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex flex-col gap-1 -mt-1 pt-1 justify-center">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => moveVisiMisiMisi(index, -1)} disabled={index === 0}><ArrowUp className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => moveVisiMisiMisi(index, 1)} disabled={index === visiMisiForm.misi.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                      </div>
                      <Input value={m} onChange={(e) => updateVisiMisiMisi(index, e.target.value)} required className="rounded-xl flex-1" placeholder="Pernyataan Misi..." />
                      <Button type="button" variant="outline" size="icon" className="rounded-lg text-destructive hover:text-destructive flex-shrink-0" onClick={() => removeVisiMisiMisi(index)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Daftar Nilai (Values)</Label>
                    <Button type="button" variant="outline" className="rounded-xl gap-2" onClick={addVisiMisiValue}>
                      <Plus className="w-4 h-4" /> Tambah Nilai
                    </Button>
                  </div>
                  {visiMisiForm.values.map((v, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 p-4 space-y-3 bg-muted/20">
                      <div className="flex gap-2 mb-2 items-center justify-between">
                        <Label className="text-sm font-semibold">Nilai {index + 1}</Label>
                        <div className="flex gap-1 justify-end">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => moveVisiMisiValue(index, -1)} disabled={index === 0}><ArrowUp className="w-4 h-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => moveVisiMisiValue(index, 1)} disabled={index === visiMisiForm.values.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => removeVisiMisiValue(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Judul Nilai</Label>
                        <Input value={v.title} onChange={(e) => updateVisiMisiValue(index, "title", e.target.value)} required className="rounded-xl" placeholder="Contoh: Amanah" />
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Input value={v.description} onChange={(e) => updateVisiMisiValue(index, "description", e.target.value)} required className="rounded-xl" placeholder="Penjelasan singkat..." />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : isProgram ? (
              <>
                <div className="space-y-2">
                  <Label>Teks Pengantar</Label>
                  <Textarea
                    value={programForm.intro}
                    onChange={(e) => setProgramForm({ ...programForm, intro: e.target.value })}
                    required
                    className="rounded-xl min-h-[90px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Daftar Area Program</Label>
                    <Button type="button" variant="outline" className="rounded-xl gap-2" onClick={addProgramArea}>
                      <Plus className="w-4 h-4" /> Tambah Area
                    </Button>
                  </div>
                  {programForm.areas.map((a, index) => (
                    <div key={index} className="rounded-2xl border border-border/60 p-4 space-y-3 bg-muted/20">
                      <div className="flex gap-2 mb-2 items-center justify-between">
                        <Label className="text-sm font-semibold">Area {index + 1}</Label>
                        <div className="flex gap-1 justify-end">
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => moveProgramArea(index, -1)} disabled={index === 0}><ArrowUp className="w-4 h-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => moveProgramArea(index, 1)} disabled={index === programForm.areas.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => removeProgramArea(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-2 sm:col-span-3">
                          <Label>Nama Area</Label>
                          <Input value={a.title} onChange={(e) => updateProgramArea(index, "title", e.target.value)} required className="rounded-xl" placeholder="Contoh: Pendidikan" />
                        </div>
                        <div className="space-y-2 sm:col-span-1">
                          <Label>Nama Icon</Label>
                          <Input value={a.icon} onChange={(e) => updateProgramArea(index, "icon", e.target.value)} required className="rounded-xl" placeholder="Lucide icon: GraduationCap" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea value={a.description} onChange={(e) => updateProgramArea(index, "description", e.target.value)} required className="rounded-xl min-h-[60px]" placeholder="Penjelasan bidang area ini..." />
                      </div>
                    </div>
                  ))}
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