import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Heart, TrendingUp, DollarSign, Clock, BarChart3 } from "lucide-react";

interface ReportData {
  overview: {
    totalUsers: number;
    totalSettledDonations: number;
    totalAmount: number;
    totalPrograms: number;
    pendingDonations: number;
  };
  programStats: {
    id: number;
    title: string;
    targetAmount: number;
    currentAmount: number;
    donorCount: number;
    percentage: number;
    totalFromDonations: number;
  }[];
  monthlyStats: {
    month: string;
    amount: number;
    count: number;
  }[];
  topDonors: {
    name: string;
    amount: number;
    count: number;
  }[];
}

export default function AdminReports() {
  const { data: report, isLoading } = useQuery<ReportData>({ queryKey: ["/api/admin/reports"] });

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  if (!report) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold" data-testid="text-admin-reports-heading">Laporan</h1>
          <p className="text-muted-foreground text-sm mt-1">Ringkasan dan analitik donasi yayasan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Donasi Masuk</p>
                  <p className="font-bold text-lg text-primary" data-testid="text-report-total-amount">{formatCurrency(report.overview.totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Donasi Berhasil</p>
                  <p className="font-bold text-lg" data-testid="text-report-settled">{report.overview.totalSettledDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Donasi Pending</p>
                  <p className="font-bold text-lg" data-testid="text-report-pending">{report.overview.pendingDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Orang Tua Asuh</p>
                  <p className="font-bold text-lg" data-testid="text-report-users">{report.overview.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Donasi per Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.programStats.map((p) => (
                  <div key={p.id} data-testid={`report-program-${p.id}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate mr-2">{p.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{p.percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div
                        className="bg-primary rounded-full h-2.5 transition-all"
                        style={{ width: `${Math.min(p.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{formatCurrency(p.currentAmount)}</span>
                      <span className="text-xs text-muted-foreground">Target: {formatCurrency(p.targetAmount)}</span>
                    </div>
                  </div>
                ))}
                {report.programStats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada data program</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Donasi Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.monthlyStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 font-semibold text-muted-foreground">Bulan</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Jumlah</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthlyStats.map((m) => (
                        <tr key={m.month} className="border-b border-border/30" data-testid={`report-month-${m.month}`}>
                          <td className="py-2 font-medium">{formatMonth(m.month)}</td>
                          <td className="py-2 text-right text-muted-foreground">{m.count} donasi</td>
                          <td className="py-2 text-right font-semibold text-primary">{formatCurrency(m.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada data bulanan</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Top 10 Donatur
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.topDonors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-3 font-semibold text-muted-foreground">#</th>
                      <th className="text-left p-3 font-semibold text-muted-foreground">Nama Donatur</th>
                      <th className="text-right p-3 font-semibold text-muted-foreground">Jumlah Donasi</th>
                      <th className="text-right p-3 font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topDonors.map((d, i) => (
                      <tr key={d.name} className="border-b border-border/30 hover:bg-secondary/30" data-testid={`report-donor-${i}`}>
                        <td className="p-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            i < 3 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                          }`}>
                            {i + 1}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{d.name}</td>
                        <td className="p-3 text-right text-muted-foreground">{d.count}x</td>
                        <td className="p-3 text-right font-semibold text-primary">{formatCurrency(d.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada data donatur</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
