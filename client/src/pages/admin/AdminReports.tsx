import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Loader2, Users, Heart, TrendingUp, TrendingDown, DollarSign,
  Clock, BarChart3, Download, Printer, CalendarIcon, ArrowUpRight,
  ArrowDownRight, Target, Percent, PieChart as PieChartIcon,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ReportData {
  overview: {
    totalUsers: number;
    totalSettledDonations: number;
    totalAmount: number;
    totalExpense: number;
    totalPrograms: number;
    pendingDonations: number;
    averageDonation: number;
    conversionRate: number;
    todayAmount: number;
    todayCount: number;
    weekAmount: number;
    weekCount: number;
    previousPeriodAmount: number;
  };
  programStats: {
    id: number;
    title: string;
    targetAmount: number;
    currentAmount: number;
    donorCount: number;
    percentage: number;
    totalFromDonations: number;
    donationsInRange: number;
  }[];
  monthlyStats: {
    month: string;
    amount: number;
    count: number;
    expenseAmount: number;
  }[];
  topDonors: {
    name: string;
    amount: number;
    count: number;
  }[];
}

type PresetKey = "all" | "thisMonth" | "lastMonth" | "3months" | "thisYear";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "thisMonth", label: "Bulan Ini" },
  { key: "lastMonth", label: "Bulan Lalu" },
  { key: "3months", label: "3 Bulan" },
  { key: "thisYear", label: "Tahun Ini" },
];

function getPresetRange(key: PresetKey): { from: string | null; to: string | null } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  switch (key) {
    case "all":
      return { from: null, to: null };
    case "thisMonth":
      return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) };
    case "lastMonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(s), to: fmt(e) };
    }
    case "3months": {
      const s = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { from: fmt(s), to: fmt(now) };
    }
    case "thisYear":
      return { from: fmt(new Date(now.getFullYear(), 0, 1)), to: fmt(now) };
  }
}

const PIE_COLORS = [
  "hsl(var(--chart-1, 220 70% 50%))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
  "#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6",
];

export default function AdminReports() {
  const [preset, setPreset] = useState<PresetKey>("all");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const dateRange = useMemo(() => {
    if (customFrom || customTo) {
      return {
        from: customFrom ? customFrom.toISOString().split("T")[0] : null,
        to: customTo ? customTo.toISOString().split("T")[0] : null,
      };
    }
    return getPresetRange(preset);
  }, [preset, customFrom, customTo]);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    if (dateRange.from) p.set("from", dateRange.from);
    if (dateRange.to) p.set("to", dateRange.to);
    const qs = p.toString();
    return qs ? `?${qs}` : "";
  }, [dateRange]);

  const { data: report, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/admin/reports", queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports${queryParams}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatShortCurrency = (v: number) => {
    if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `Rp${(v / 1_000).toFixed(0)}rb`;
    return `Rp${v}`;
  };

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleExportCSV = () => {
    const url = `/api/admin/reports/export${queryParams}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePreset = (key: PresetKey) => {
    setPreset(key);
    setCustomFrom(undefined);
    setCustomTo(undefined);
  };

  const growthPercent = useMemo(() => {
    if (!report) return null;
    const { totalAmount, previousPeriodAmount } = report.overview;
    if (!previousPeriodAmount || previousPeriodAmount === 0) return null;
    return Math.round(((totalAmount - previousPeriodAmount) / previousPeriodAmount) * 100);
  }, [report]);

  const barChartData = useMemo(() => {
    if (!report) return [];
    return report.programStats.map(p => ({
      name: p.title.length > 18 ? p.title.substring(0, 18) + "…" : p.title,
      fullName: p.title,
      target: p.targetAmount,
      realisasi: p.currentAmount,
    }));
  }, [report]);

  const pieChartData = useMemo(() => {
    if (!report) return [];
    const total = report.programStats.reduce((s, p) => s + p.totalFromDonations, 0);
    if (total === 0) return [];
    return report.programStats
      .filter(p => p.totalFromDonations > 0)
      .map(p => ({
        name: p.title,
        value: p.totalFromDonations,
        percentage: Math.round((p.totalFromDonations / total) * 100),
      }));
  }, [report]);

  const areaChartConfig = {
    amount: { label: "Pemasukan (Donasi)", color: "hsl(var(--primary))" },
    expenseAmount: { label: "Pengeluaran", color: "hsl(var(--destructive))" },
  };
  const barChartConfig = {
    target: { label: "Target", color: "hsl(210 80% 65%)" },
    realisasi: { label: "Realisasi", color: "hsl(150 60% 50%)" },
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
      <div className="space-y-6 print:space-y-4">
        {/* Header + Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold" data-testid="text-admin-reports-heading">Laporan</h1>
            <p className="text-muted-foreground text-sm mt-1">Ringkasan dan analitik donasi yayasan</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" /> Cetak PDF
            </Button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <Card className="border-0 shadow-md rounded-2xl print:shadow-none print:border">
          <CardContent className="p-4 print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-1">Periode:</span>
              {PRESETS.map(p => (
                <Button
                  key={p.key}
                  variant={preset === p.key && !customFrom && !customTo ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePreset(p.key)}
                  className="text-xs h-8"
                >
                  {p.label}
                </Button>
              ))}
              <div className="h-4 w-px bg-border mx-1" />

              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 min-w-[130px] justify-start">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {customFrom ? format(customFrom, "dd MMM yyyy", { locale: idLocale }) : "Dari tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customFrom}
                    onSelect={(d) => { setCustomFrom(d || undefined); setFromOpen(false); setPreset("all"); }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">—</span>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 min-w-[130px] justify-start">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {customTo ? format(customTo, "dd MMM yyyy", { locale: idLocale }) : "Sampai tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customTo}
                    onSelect={(d) => { setCustomTo(d || undefined); setToOpen(false); setPreset("all"); }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(customFrom || customTo) && (
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setCustomFrom(undefined); setCustomTo(undefined); setPreset("all"); }}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Total Donasi Masuk</p>
                  <p className="font-bold text-lg text-primary truncate" data-testid="text-report-total-amount">{formatCurrency(report.overview.totalAmount || 0)}</p>
                </div>
                {growthPercent !== null && !isNaN(growthPercent) && (
                  <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${growthPercent >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {growthPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(growthPercent)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
                  <p className="font-bold text-lg text-destructive truncate">{formatCurrency(report.overview.totalExpense || 0)}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Sisa Saldo: <span className="font-semibold text-foreground">{formatCurrency((report.overview.totalAmount || 0) - (report.overview.totalExpense || 0))}</span>
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
                  <p className="font-bold text-lg" data-testid="text-report-settled">{report.overview.totalSettledDonations || 0}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending: {report.overview.pendingDonations || 0}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Konversi: {report.overview.conversionRate || 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata Donasi</p>
                  <p className="font-bold text-lg">{formatCurrency(report.overview.averageDonation || 0)}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Hari ini: {formatShortCurrency(report.overview.todayAmount || 0)} ({(report.overview.todayCount || 0)} donasi)
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
                  <p className="font-bold text-lg" data-testid="text-report-users">{report.overview.totalUsers || 0}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Minggu ini: {formatShortCurrency(report.overview.weekAmount || 0)} ({(report.overview.weekCount || 0)} donasi)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart — Monthly Trend */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tren Donasi Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.monthlyStats.length > 0 ? (
                <ChartContainer config={areaChartConfig} className="h-[280px] w-full">
                  <AreaChart data={report.monthlyStats} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="areaGradientExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => formatShortCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      name="Pemasukan"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fill="url(#areaGradient)"
                      dot={{ r: 3, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenseAmount"
                      name="Pengeluaran"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2.5}
                      fill="url(#areaGradientExpense)"
                      dot={{ r: 3, fill: "hsl(var(--destructive))" }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data donasi bulanan</p>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart — Distribution */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Distribusi Donasi per Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name.length > 12 ? name.substring(0, 12) + "…" : name} ${percentage}%`}
                        labelLine={{ strokeWidth: 1 }}
                      >
                        {pieChartData.map((_entry, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data distribusi</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart — Target vs Realisasi */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Target vs Realisasi per Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-[320px] w-full">
                <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(v: number) => formatShortCurrency(v)} tick={{ fontSize: 11 }} width={70} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />
                    }
                  />
                  <Legend />
                  <Bar dataKey="target" fill="hsl(210 80% 65%)" radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="realisasi" fill="hsl(150 60% 50%)" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data program</p>
            )}
          </CardContent>
        </Card>

        {/* Data Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donasi per Program */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Progress per Program
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

          {/* Donasi Bulanan Table */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Donasi Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.monthlyStats.length > 0 ? (
                <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 font-semibold text-muted-foreground">Bulan</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Jumlah Donasi</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Pemasukan</th>
                        <th className="text-right py-2 font-semibold text-muted-foreground">Pengeluaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...report.monthlyStats].reverse().map((m) => (
                        <tr key={m.month} className="border-b border-border/30" data-testid={`report-month-${m.month}`}>
                          <td className="py-2 font-medium">{formatMonth(m.month)}</td>
                          <td className="py-2 text-right text-muted-foreground">{m.count} donasi</td>
                          <td className="py-2 text-right font-semibold text-primary">{formatCurrency(m.amount)}</td>
                          <td className="py-2 text-right font-semibold text-destructive">{formatCurrency(m.expenseAmount)}</td>
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

        {/* Top Donors */}
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

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:space-y-4, .print\\:space-y-4 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          @page { margin: 1cm; size: A4 landscape; }
          .recharts-responsive-container { page-break-inside: avoid; }
          table { page-break-inside: avoid; }
        }
      `}</style>
    </AdminLayout>
  );
}
