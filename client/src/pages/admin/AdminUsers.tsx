import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Eye, Mail, Phone, MapPin, Calendar, Heart } from "lucide-react";
import type { Donation } from "@shared/schema";

interface UserWithStats {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  createdAt: string | null;
  totalDonations: number;
  donationCount: number;
}

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery<UserWithStats[]>({ queryKey: ["/api/admin/users"] });
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: userDonations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/admin/users", selectedUser?.id, "donations"],
    enabled: !!selectedUser,
  });

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string | Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (d: string | Date | null) => {
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

  const openDetail = (user: UserWithStats) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold" data-testid="text-admin-users-heading">Orang Tua Asuh</h1>
            <p className="text-muted-foreground text-sm mt-1">Daftar semua orang tua asuh yang terdaftar</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary" data-testid="text-total-users">{users?.length || 0}</span>
            <span className="text-sm text-muted-foreground">Terdaftar</span>
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
                      <th className="text-left p-4 font-semibold text-muted-foreground">Nama</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Telepon</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Total Donasi</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Jumlah Donasi</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Bergabung</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((u) => (
                      <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/30" data-testid={`row-user-${u.id}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-primary">{u.fullName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium">{u.fullName}</p>
                              <p className="text-xs text-muted-foreground">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-muted-foreground">{u.phone || "-"}</td>
                        <td className="p-4 font-semibold text-primary">{formatCurrency(u.totalDonations)}</td>
                        <td className="p-4 text-center">{u.donationCount}x</td>
                        <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetail(u)}
                            className="text-primary hover:text-primary/80 hover:bg-primary/5"
                            data-testid={`button-view-user-${u.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!users || users.length === 0) && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          Belum ada orang tua asuh yang terdaftar
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Detail Orang Tua Asuh</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary">{selectedUser.fullName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg" data-testid="text-detail-user-name">{selectedUser.fullName}</h3>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.address || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Bergabung {formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-xl p-4 text-center">
                    <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-primary">{formatCurrency(selectedUser.totalDonations)}</p>
                    <p className="text-xs text-muted-foreground">Total Donasi</p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4 text-center">
                    <Users className="w-5 h-5 text-accent mx-auto mb-1" />
                    <p className="text-xl font-bold text-accent">{selectedUser.donationCount}x</p>
                    <p className="text-xs text-muted-foreground">Jumlah Donasi</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Riwayat Donasi</h4>
                  {donationsLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : userDonations && userDonations.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {userDonations.map(d => (
                        <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 text-sm" data-testid={`row-user-donation-${d.id}`}>
                          <div>
                            <p className="font-medium">{formatCurrency(d.amount)}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(d.createdAt)}</p>
                          </div>
                          {statusBadge(d.paymentStatus)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat donasi</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
