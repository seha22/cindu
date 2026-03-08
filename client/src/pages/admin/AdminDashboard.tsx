import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { FolderHeart, Heart, Users, Newspaper, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<{
    totalPrograms: number;
    totalDonations: number;
    totalDonors: number;
    totalArticles: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

  const statCards = [
    { label: "Total Program", value: stats?.totalPrograms ?? 0, icon: FolderHeart, color: "text-primary" },
    { label: "Total Donasi", value: formatCurrency(stats?.totalDonations ?? 0), icon: Heart, color: "text-green-600" },
    { label: "Total Donatur", value: stats?.totalDonors ?? 0, icon: Users, color: "text-amber-600" },
    { label: "Total Artikel", value: stats?.totalArticles ?? 0, icon: Newspaper, color: "text-blue-600" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold" data-testid="text-admin-title">Dashboard Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Ringkasan data yayasan</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
