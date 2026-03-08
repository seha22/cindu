import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Donation } from "@shared/schema";

export default function AdminDonations() {
  const { data: donations, isLoading } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Donasi</h1>
          <p className="text-muted-foreground text-sm mt-1">Daftar semua donasi masuk</p>
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
                    {donations?.map((d) => (
                      <tr key={d.id} className="border-b border-border/30 hover:bg-secondary/30" data-testid={`row-donation-${d.id}`}>
                        <td className="p-4 font-medium">{d.donorName}</td>
                        <td className="p-4 font-semibold text-primary">{formatCurrency(d.amount)}</td>
                        <td className="p-4">{statusBadge(d.paymentStatus)}</td>
                        <td className="p-4 text-muted-foreground max-w-[200px] truncate">{d.message || "-"}</td>
                        <td className="p-4 text-muted-foreground">{formatDate(d.createdAt)}</td>
                      </tr>
                    ))}
                    {(!donations || donations.length === 0) && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada donasi</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
