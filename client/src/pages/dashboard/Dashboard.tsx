import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Heart, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Donation } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: donations, isLoading } = useQuery<Donation[]>({ queryKey: ["/api/user/donations"] });

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const totalDonated = donations
    ?.filter((d) => d.paymentStatus === "settlement")
    .reduce((sum, d) => sum + d.amount, 0) ?? 0;

  const totalCount = donations?.filter((d) => d.paymentStatus === "settlement").length ?? 0;

  const latestDonations = donations?.slice(0, 5) ?? [];

  const formatDate = (d: string | Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold" data-testid="text-dashboard-title">
            Assalamu'alaikum, {user?.fullName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Terima kasih atas kebaikan Anda</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Total Donasi</span>
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary" data-testid="text-total-donated">{formatCurrency(totalDonated)}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Jumlah Donasi</span>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-total-count">{totalCount} kali</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Bergabung Sejak</span>
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold" data-testid="text-join-date">{formatDate(user?.createdAt as any)}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg">Donasi Terbaru</h2>
                  <Link href="/dashboard/riwayat-donasi">
                    <Button variant="ghost" size="sm" className="text-primary" data-testid="link-view-all-donations">
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
                {latestDonations.length > 0 ? (
                  <div className="space-y-3">
                    {latestDonations.map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <p className="font-medium text-sm">{d.message || "Donasi"}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>
                        </div>
                        <span className="font-semibold text-primary text-sm">{formatCurrency(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Belum ada riwayat donasi</p>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <Link href="/programs">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 rounded-full shadow-lg" data-testid="button-donate-now">
                  Mulai Berdonasi
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
