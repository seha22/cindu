import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { Donation } from "@shared/schema";

const ITEMS_PER_PAGE = 10;

export default function AdminDonations() {
  const { data: donations, isLoading } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Donasi</h1>
          <p className="text-muted-foreground text-sm mt-1">Daftar semua donasi masuk</p>
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
                        <td className="p-4 font-medium">{d.donorName}</td>
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
    </AdminLayout>
  );
}
