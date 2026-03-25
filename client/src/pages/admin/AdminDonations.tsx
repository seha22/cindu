import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronLeft, ChevronRight, Filter, Plus, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Donation, Program } from "@shared/schema";

const ITEMS_PER_PAGE = 10;

export default function AdminDonations() {
  const { data: donations, isLoading } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    donorName: "", donorEmail: "", amount: "", message: "", paymentMethod: "transfer", programId: ""
  });
  const { toast } = useToast();

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string | Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      settlement: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      settlement: "Berhasil",
      pending: "Menunggu",
      failed: "Gagal",
    };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Filter and Search Logic
  const filteredDonations = donations?.filter((d) => {
    const matchesSearch =
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.message && d.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || d.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  // Pagination Logic
  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDonations = filteredDonations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to page 1 when filters change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const { data: programs } = useQuery<Program[]>({ queryKey: ["/api/programs"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/donations/manual", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({ title: "Donasi manual berhasil dicatat", description: "Dana otomatis berstatus berhasil." });
      setIsDialogOpen(false);
      setForm({ donorName: "", donorEmail: "", amount: "", message: "", paymentMethod: "transfer", programId: "" });
    },
    onError: (err: Error) => toast({ title: "Gagal mencatat donasi", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      amount: parseInt(form.amount) || 0,
      programId: parseInt(form.programId),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Donasi</h1>
            <p className="text-muted-foreground text-sm mt-1">Daftar semua donasi masuk</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Catat Donasi Manual
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama atau pesan donatur..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-input rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="bg-transparent border-none text-sm outline-none w-full sm:w-auto cursor-pointer font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="settlement">Berhasil</option>
                <option value="pending">Menunggu</option>
                <option value="failed">Gagal</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 font-semibold text-muted-foreground">Donatur</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Nominal</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Pesan</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDonations.map((d) => (
                      <tr key={d.id} className="border-b border-border/30 hover:bg-secondary/30" data-testid={`row-donation-${d.id}`}>
                        <td className="p-4">
                          <div className="font-medium">{d.donorName}</div>
                          {d.paymentMethod && d.paymentMethod !== "midtrans" && (
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                              {d.paymentMethod}
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-primary">{formatCurrency(d.amount)}</td>
                        <td className="p-4">{statusBadge(d.paymentStatus)}</td>
                        <td className="p-4 text-muted-foreground max-w-[200px] truncate" title={d.message || ""}>{d.message || "-"}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(d.createdAt)}</td>
                      </tr>
                    ))}
                    {paginatedDonations.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">Tidak ada data donasi yang ditemukan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan <span className="font-medium text-foreground">{startIndex + 1}</span> hingga{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredDonations.length)}
                    </span>{" "}
                    dari <span className="font-medium text-foreground">{filteredDonations.length}</span> data
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Sebelumnya
                    </Button>
                    
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, i, arr) => {
                          if (i > 0 && arr[i - 1] !== page - 1) {
                            return <span key={`ellipsis-${page}`} className="text-muted-foreground px-2">...</span>;
                          }
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "ghost"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 p-0 rounded-lg ${currentPage === page ? "bg-primary text-primary-foreground font-bold" : "font-medium"}`}
                            >
                              {page}
                            </Button>
                          );
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-lg"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Banknote className="w-5 h-5" /> Catat Donasi Manual
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Pilih Program Amal</Label>
              <select
                required
                value={form.programId}
                onChange={(e) => setForm({ ...form, programId: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>-- Pilih Program --</option>
                {programs?.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nama Donatur</Label>
              <Input
                required
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                className="rounded-xl"
                placeholder="Hamba Allah / Bapak Budi"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Donatur (Opsional)</Label>
              <Input
                type="email"
                value={form.donorEmail}
                onChange={(e) => setForm({ ...form, donorEmail: e.target.value })}
                className="rounded-xl"
                placeholder="budi@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Metode Pembayaran / Masuk</Label>
              <select
                required
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="transfer">Transfer Bank (BCA/Mandiri dll)</option>
                <option value="tunai">Tunai / Kotak Amal Cash</option>
                <option value="lainnya">Lainnya...</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nominal (Rp)</Label>
              <Input
                required
                type="number"
                min="1000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="rounded-xl font-medium"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Pesan / Doa (Opsional)</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="rounded-xl resize-none h-20"
                placeholder="Tulis pesan penyemangat..."
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl gap-2 h-11 pointer-events-auto">
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Catat Donasi Ini
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
