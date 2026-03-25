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
import { Plus, Pencil, Trash2, Loader2, ArrowUpRight, TrendingDown } from "lucide-react";
import type { Expense } from "@shared/schema";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function AdminExpenses() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", amount: "", category: "operasional", date: new Date().toISOString().split("T")[0]
  });

  const { data: expenses, isLoading } = useQuery<Expense[]>({ queryKey: ["/api/admin/expenses"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/admin/expenses", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] }); toast({ title: "Pengeluaran berhasil dicatat" }); closeDialog(); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PUT", `/api/admin/expenses/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] }); toast({ title: "Data berhasil diperbarui" }); closeDialog(); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/expenses/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] }); toast({ title: "Data berhasil dihapus" }); },
    onError: (err: Error) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
  });

  const closeDialog = () => { 
    setDialogOpen(false); 
    setEditing(null); 
    setForm({ title: "", description: "", amount: "", category: "operasional", date: new Date().toISOString().split("T")[0] }); 
  };

  const openCreate = () => { 
    setEditing(null); 
    setForm({ title: "", description: "", amount: "", category: "operasional", date: new Date().toISOString().split("T")[0] }); 
    setDialogOpen(true); 
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({ ...e, description: e.description || "", amount: e.amount.toString(), date: e.date ? new Date(e.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: parseInt(form.amount) || 0,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
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
            <h1 className="font-display text-2xl font-bold">Pengeluaran & Penyaluran</h1>
            <p className="text-muted-foreground text-sm mt-1">Catat dan kelola dana operasional atau penyaluran ke program</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl gap-2" data-testid="button-add-expense">
            <Plus className="w-4 h-4" /> Catat Pengeluaran
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr className="border-b border-border">
                      <th className="text-left font-semibold p-4">Tanggal</th>
                      <th className="text-left font-semibold p-4">Keterangan</th>
                      <th className="text-left font-semibold p-4">Kategori</th>
                      <th className="text-right font-semibold p-4">Nominal</th>
                      <th className="text-center font-semibold p-4 w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses?.map((ex) => (
                      <tr key={ex.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="p-4 whitespace-nowrap">
                          {ex.date ? format(new Date(ex.date), "dd MMM yyyy", { locale: idLocale }) : "-"}
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-foreground leading-tight">{ex.title}</p>
                          {ex.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ex.description}</p>}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            {ex.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold text-destructive">
                          <div className="flex items-center justify-end gap-1">
                            {formatCurrency(ex.amount)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => openEdit(ex)} className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(ex.id)} className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {expenses?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Belum ada catatan pengeluaran
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              {editing ? "Edit Pengeluaran" : "Catat Pengeluaran Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Keterangan / Nama Pengeluaran</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="rounded-xl" placeholder="Contoh: Belanja Sembako" />
            </div>
            
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="rounded-xl" placeholder="Contoh: program, operasional, logistik" />
            </div>
            
            <div className="space-y-2">
              <Label>Nominal (Rp)</Label>
              <Input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="rounded-xl font-medium" placeholder="0" />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Lengkap (Opsional)</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl resize-none h-20" placeholder="Detail tambahan jika diperlukan..." />
            </div>
            
            <div className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full rounded-xl gap-2 h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Simpan Perubahan" : "Simpan Catatan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
