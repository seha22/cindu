import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, User as UserIcon, Calendar, School, MapPin, Search, Download, Upload, ChevronLeft, ChevronRight, UserCircle } from "lucide-react";
import type { FosterChild } from "@shared/schema";
import { format } from "date-fns";

export default function AdminFosterChildren() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<FosterChild | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    birthPlace: "",
    birthDate: "",
    gender: "Laki-laki",
    educationLevel: "",
    schoolName: "",
    grade: "",
    parentName: "",
    status: "Yatim",
    address: "",
    joinDate: format(new Date(), "yyyy-MM-dd"),
    bio: "",
    imageUrl: "",
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: children, isLoading } = useQuery<FosterChild[]>({ 
    queryKey: ["/api/admin/foster-children"] 
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/foster-children", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/foster-children"] });
      toast({ title: "Data anak asuh berhasil ditambahkan" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/foster-children/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/foster-children"] });
      toast({ title: "Data anak asuh berhasil diperbarui" });
      closeDialog();
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/foster-children/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/foster-children"] });
      toast({ title: "Data anak asuh berhasil dihapus" });
    },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingChild(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      birthPlace: "",
      birthDate: "",
      gender: "Laki-laki",
      educationLevel: "",
      schoolName: "",
      grade: "",
      parentName: "",
      status: "Yatim",
      address: "",
      joinDate: format(new Date(), "yyyy-MM-dd"),
      bio: "",
      imageUrl: "",
      isActive: true,
    });
  };

  const openCreate = () => {
    setEditingChild(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (c: FosterChild) => {
    setEditingChild(c);
    setForm({
      fullName: c.fullName,
      birthPlace: c.birthPlace || "",
      birthDate: c.birthDate ? format(new Date(c.birthDate), "yyyy-MM-dd") : "",
      gender: c.gender,
      educationLevel: c.educationLevel || "",
      schoolName: c.schoolName || "",
      grade: c.grade || "",
      parentName: c.parentName || "",
      status: c.status,
      address: c.address || "",
      joinDate: c.joinDate ? format(new Date(c.joinDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      bio: c.bio || "",
      imageUrl: c.imageUrl || "",
      isActive: c.isActive,
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/uploads/child", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json();
      setForm({ ...form, imageUrl: data.imageUrl });
      toast({ title: "Foto berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
      joinDate: form.joinDate ? new Date(form.joinDate).toISOString() : new Date().toISOString(),
    };
    if (editingChild) {
      updateMutation.mutate({ id: editingChild.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleExport = () => {
    if (!children) return;
    const header = ["Nama Lengkap,Jenis Kelamin,Status,Tempat Lahir,Tanggal Lahir,Pendidikan,Sekolah,Kelas,Wali,Alamat,Bio,Tgl Bergabung,Status Aktif"];
    const rows = children.map(c => {
      return `"${c.fullName}","${c.gender}","${c.status}","${c.birthPlace||''}","${c.birthDate ? format(new Date(c.birthDate), 'yyyy-MM-dd') : ''}","${c.educationLevel||''}","${c.schoolName||''}","${c.grade||''}","${c.parentName||''}","${c.address||''}","${c.bio||''}","${c.joinDate ? format(new Date(c.joinDate), 'yyyy-MM-dd') : ''}","${c.isActive ? 'Ya' : 'Tidak'}"`;
    });
    const csvContent = "\uFEFF" + header.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `data-anak-asuh-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim() !== "");
      if (lines.length < 2) throw new Error("File CSV kosong atau tidak valid");
      
      const successData = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanCol = (idx: number) => (cols[idx] || "").replace(/^"|"$/g, "").trim();

        if (cleanCol(0)) {
          successData.push({
            fullName: cleanCol(0),
            gender: cleanCol(1) || "Laki-laki",
            status: cleanCol(2) || "Yatim",
            birthPlace: cleanCol(3),
            birthDate: cleanCol(4) ? new Date(cleanCol(4)).toISOString() : null,
            educationLevel: cleanCol(5),
            schoolName: cleanCol(6),
            grade: cleanCol(7),
            parentName: cleanCol(8),
            address: cleanCol(9),
            bio: cleanCol(10),
            joinDate: cleanCol(11) ? new Date(cleanCol(11)).toISOString() : new Date().toISOString(),
            isActive: cleanCol(12).toLowerCase() === "ya",
            imageUrl: null,
          });
        }
      }

      let count = 0;
      for (const data of successData) {
        await apiRequest("POST", "/api/admin/foster-children", data);
        count++;
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/foster-children"] });
      toast({ title: "Import Selesai", description: `${count} data anak asuh berhasil ditambahkan.` });
    } catch (err: any) {
      toast({ title: "Gagal Import", description: err.message || "Pastikan format CSV sesuai", variant: "destructive" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredChildren = useMemo(() => {
    if (!children) return [];
    return children.filter(c => 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.schoolName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [children, searchQuery]);

  const paginatedChildren = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredChildren.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredChildren, page]);

  const totalPages = Math.ceil(filteredChildren.length / ITEMS_PER_PAGE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Daftar Anak Asuh</h1>
            <p className="text-muted-foreground text-sm mt-1">Kelola data anak asuh yayasan</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl gap-2">
              <Upload className="w-4 h-4" /> Import Data
            </Button>
            <Button variant="outline" onClick={handleExport} className="rounded-xl gap-2">
              <Download className="w-4 h-4" /> Export Data
            </Button>
            <Button onClick={openCreate} className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Tambah Anak Asuh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl w-fit">
                <UserCircle className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">{children?.length || 0}</span>
                <span className="text-sm text-muted-foreground">Total Anak Asuh</span>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama, sekolah, alamat..." 
                  className="pl-9 h-10 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/10">
                      <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Anak Asuh</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Biodata Lintas</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Pendidikan</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Wali & Tempat</th>
                      <th className="text-right p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {paginatedChildren.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-secondary flex items-center justify-center">
                              {c.imageUrl ? (
                                <img src={c.imageUrl} alt={c.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="w-6 h-6 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="max-w-[150px] sm:max-w-none truncate">
                              <p className="font-semibold text-foreground truncate">{c.fullName}</p>
                              <div className="mt-1 flex gap-1">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {c.isActive ? 'Aktif' : 'Non-Aktif'}
                                </span>
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
                                  {c.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">{c.gender}</p>
                            <p className="text-xs text-muted-foreground">Lahir: {c.birthPlace ? `${c.birthPlace}, ` : ''}{c.birthDate ? format(new Date(c.birthDate), "dd MMM yy") : "-"}</p>
                            <p className="text-xs text-muted-foreground">Bergabung: {c.joinDate ? format(new Date(c.joinDate), "MMM yyyy") : "-"}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium flex items-center gap-1.5"><School className="w-3.5 h-3.5 text-muted-foreground" /> {c.schoolName || "-"}</p>
                            <p className="text-xs text-muted-foreground">{c.educationLevel || "-"} {c.grade ? `(${c.grade})` : ""}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 max-w-[200px]">
                            <p className="text-sm font-medium truncate">Wali: {c.parentName || "-"}</p>
                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span className="truncate line-clamp-2 whitespace-normal">{c.address || "-"}</span>
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="w-8 h-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              if (confirm("Hapus data anak asuh ini?")) deleteMutation.mutate(c.id);
                            }} className="w-8 h-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/5">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedChildren.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <UserCircle className="w-10 h-10 opacity-20" />
                            <p>Tidak ada data anak asuh yang ditemukan</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-border/50 flex items-center justify-between bg-card/50">
                  <p className="text-xs text-muted-foreground">
                    Halaman {page} dari {totalPages} ({filteredChildren.length} total)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-lg"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-lg"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingChild ? "Edit Data Anak Asuh" : "Tambah Anak Asuh"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2 text-center">
                  <Label>Foto Anak</Label>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center border-2 border-dashed border-border group relative">
                      {form.imageUrl ? (
                        <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-muted-foreground/30" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploadingImage} className="w-full text-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Jenis Kelamin</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yatim">Yatim</SelectItem>
                        <SelectItem value="Piatu">Piatu</SelectItem>
                        <SelectItem value="Yatim Piatu">Yatim Piatu</SelectItem>
                        <SelectItem value="Dhuafa">Dhuafa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tempat Lahir</Label>
                    <Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Jenjang Pendidikan</Label>
                    <Select value={form.educationLevel} onValueChange={(v) => setForm({ ...form, educationLevel: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Belum Sekolah">Belum Sekolah</SelectItem>
                        <SelectItem value="PAUD/TK">PAUD/TK</SelectItem>
                        <SelectItem value="SD">SD</SelectItem>
                        <SelectItem value="SMP">SMP</SelectItem>
                        <SelectItem value="SMA">SMA</SelectItem>
                        <SelectItem value="Kuliah">Kuliah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kelas/Semester</Label>
                    <Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Cth: Kelas 4" className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nama Sekolah</Label>
                  <Input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label>Nama Orang Tua/Wali</Label>
                  <Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl min-h-[60px]" />
            </div>

            <div className="space-y-2">
              <Label>Bio / Catatan</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Kisah singkat anak..." className="rounded-xl min-h-[80px]" />
            </div>

            <div className="flex items-center gap-6">
               <div className="flex-1 space-y-2">
                <Label>Tanggal Bergabung</Label>
                <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} className="rounded-xl" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={form.isActive} 
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Status Aktif</Label>
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full rounded-xl py-6 text-lg font-bold shadow-lg shadow-primary/20">
              {isPending && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {editingChild ? "Simpan Perubahan" : "Simpan Data Anak"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
