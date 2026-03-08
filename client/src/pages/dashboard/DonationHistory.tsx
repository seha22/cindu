import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Donation } from "@shared/schema";

export default function DonationHistory() {
  const { data: donations, isLoading } = useQuery<Donation[]>({ queryKey: ["/api/user/donations"] });

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string | Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Riwayat Donasi</h1>
          <p className="text-muted-foreground text-sm mt-1">Semua riwayat donasi Anda</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : donations && donations.length > 0 ? (
          <div className="space-y-3">
            {donations.map((d) => (
              <Card key={d.id} className="border-0 shadow-md rounded-2xl" data-testid={`card-donation-${d.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(d.paymentStatus)}
                    </div>
                    <p className="font-semibold text-primary text-lg">{formatCurrency(d.amount)}</p>
                    {d.message && <p className="text-sm text-muted-foreground mt-1 truncate">{d.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(d.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Belum ada riwayat donasi</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
