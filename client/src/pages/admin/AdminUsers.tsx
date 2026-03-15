import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Eye, Mail, Phone, MapPin, Calendar, Heart, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

interface GuestDonorSummary {
  key: string;
  donorName: string;
  donorEmail: string | null;
  totalDonations: number;
  donationCount: number;
  lastDonationAt: string | Date | null;
}

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const { data: users, isLoading } = useQuery<UserWithStats[]>({ queryKey: ["/api/admin/users"] });
  const { data: allDonations, isLoading: allDonationsLoading } = useQuery<Donation[]>({ queryKey: ["/api/donations"] });
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // States for Registered Users
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  // States for Guest Donors
  const [guestSearch, setGuestSearch] = useState("");
  const [guestPage, setGuestPage] = useState(1);

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

  // Process registered users with filtering and pagination
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, userPage]);

  const userTotalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Process guest donors with filtering and pagination
  const guestDonors: GuestDonorSummary[] = useMemo(() => {
    const donorMap = new Map<string, GuestDonorSummary>();

    for (const donation of allDonations || []) {
      if (donation.userId || donation.paymentStatus !== "settlement") {
        continue;
      }

      const key = `${(donation.donorName || "Hamba Allah").trim().toLowerCase()}::${(donation.donorEmail || "").trim().toLowerCase()}`;
      const existing = donorMap.get(key);

      if (existing) {
        existing.totalDonations += donation.amount;
        existing.donationCount += 1;

        if (donation.createdAt && (!existing.lastDonationAt || new Date(donation.createdAt).getTime() > new Date(existing.lastDonationAt).getTime())) {
          existing.lastDonationAt = donation.createdAt;
        }
      } else {
        donorMap.set(key, {
          key,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          totalDonations: donation.amount,
          donationCount: 1,
          lastDonationAt: donation.createdAt,
        });
      }
    }

    return Array.from(donorMap.values()).sort((a, b) => {
      const dateA = a.lastDonationAt ? new Date(a.lastDonationAt).getTime() : 0;
      const dateB = b.lastDonationAt ? new Date(b.lastDonationAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [allDonations]);

  const filteredGuests = useMemo(() => {
    return guestDonors.filter(d => 
      d.donorName.toLowerCase().includes(guestSearch.toLowerCase()) || 
      (d.donorEmail || "").toLowerCase().includes(guestSearch.toLowerCase())
    );
  }, [guestDonors, guestSearch]);

  const paginatedGuests = useMemo(() => {
    const start = (guestPage - 1) * ITEMS_PER_PAGE;
    return filteredGuests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGuests, guestPage]);

  const guestTotalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE);

  const totalDonorRecords = (users?.length || 0) + guestDonors.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold" data-testid="text-admin-users-heading">Kelola User & Donatur</h1>
            <p className="text-muted-foreground text-sm mt-1">Manajemen Orang Tua Asuh dan database donatur guest</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl w-fit">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary" data-testid="text-total-users">{totalDonorRecords}</span>
            <span className="text-sm text-muted-foreground">Total Entitas</span>
          </div>
        </div>

        {isLoading || allDonationsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="registered" className="w-full">
            <TabsList className="bg-card w-full justify-start h-auto p-1 border border-border/50 rounded-xl mb-6">
              <TabsTrigger value="registered" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                User Terdaftar
              </TabsTrigger>
              <TabsTrigger value="guest" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="w-4 h-4 mr-2" />
                Donatur Guest
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registered" className="mt-0 space-y-4">
              <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">Orang Tua Asuh</h2>
                    <p className="text-sm text-muted-foreground">User yang memiliki akun dan terdaftar di platform</p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari nama, username, email..." 
                      className="pl-9 h-10 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setUserPage(1);
                      }}
                    />
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-secondary/10">
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Donatur</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Kontak</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Total Donasi</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Frekuensi</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Tgl Gabung</th>
                          <th className="text-right p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {paginatedUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-secondary/30 transition-colors" data-testid={`row-user-${u.id}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                  <span className="text-sm font-bold text-primary">{u.fullName.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="max-w-[150px] sm:max-w-none truncate">
                                  <p className="font-semibold text-foreground truncate">{u.fullName}</p>
                                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <p className="text-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {u.email}</p>
                                {u.phone && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {u.phone}</p>}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-primary">{formatCurrency(u.totalDonations)}</td>
                            <td className="p-4"><span className="px-2 py-1 bg-secondary rounded-lg font-medium">{u.donationCount} Kali</span></td>
                            <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                            <td className="p-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetail(u)}
                                className="rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground h-8"
                                data-testid={`button-view-user-${u.id}`}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Detail
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {paginatedUsers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Users className="w-10 h-10 opacity-20" />
                                <p>Tidak ada user terdaftar yang ditemukan</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {userTotalPages > 1 && (
                    <div className="p-4 border-t border-border/50 flex items-center justify-between bg-card/50">
                      <p className="text-xs text-muted-foreground">
                        Halaman {userPage} dari {userTotalPages} ({filteredUsers.length} total)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg"
                          disabled={userPage === 1}
                          onClick={() => setUserPage(p => p - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg"
                          disabled={userPage === userTotalPages}
                          onClick={() => setUserPage(p => p + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guest" className="mt-0 space-y-4">
              <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">Donatur Guest</h2>
                    <p className="text-sm text-muted-foreground">Donatur tanpa akun dengan pembayaran berhasil</p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari nama, email donatur..." 
                      className="pl-9 h-10 rounded-xl bg-secondary/30 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                      value={guestSearch}
                      onChange={(e) => {
                        setGuestSearch(e.target.value);
                        setGuestPage(1);
                      }}
                    />
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-secondary/10">
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Nama Donatur</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Email</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Total Donasi</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Frekuensi</th>
                          <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Donasi Terakhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {paginatedGuests.map((donor) => (
                          <tr key={donor.key} className="hover:bg-secondary/30 transition-colors" data-testid={`row-guest-donor-${donor.key}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                  <span className="text-sm font-bold text-accent">{donor.donorName.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="font-semibold">{donor.donorName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground truncate max-w-[200px]">{donor.donorEmail || <span className="text-xs italic opacity-50">Tidak ada email</span>}</td>
                            <td className="p-4 font-bold text-primary">{formatCurrency(donor.totalDonations)}</td>
                            <td className="p-4 font-medium">{donor.donationCount}x Transaksi</td>
                            <td className="p-4 text-muted-foreground">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Calendar className="w-3.5 h-3.5 opacity-50" />
                                {formatDateTime(donor.lastDonationAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {paginatedGuests.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Heart className="w-10 h-10 opacity-20" />
                                <p>Tidak ada donatur guest yang ditemukan</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {guestTotalPages > 1 && (
                    <div className="p-4 border-t border-border/50 flex items-center justify-between bg-card/50">
                      <p className="text-xs text-muted-foreground">
                        Halaman {guestPage} dari {guestTotalPages} ({filteredGuests.length} total)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg"
                          disabled={guestPage === 1}
                          onClick={() => setGuestPage(p => p - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-8 h-8 rounded-lg"
                          disabled={guestPage === guestTotalPages}
                          onClick={() => setGuestPage(p => p + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-0 rounded-2xl shadow-2xl">
          {selectedUser && (
            <>
              <div className="p-6 pb-0">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Profil Orang Tua Asuh</DialogTitle>
                </DialogHeader>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-secondary/20 border border-border/30">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <span className="text-2xl font-bold">{selectedUser.fullName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xl leading-tight" data-testid="text-detail-user-name">{selectedUser.fullName}</h3>
                    <p className="text-sm text-primary font-medium">@{selectedUser.username}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                       <Calendar className="w-3.5 h-3.5" />
                       Terdaftar sejak {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="truncate">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{selectedUser.phone || <em className="italic opacity-50">Belum diisi</em>}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 text-sm h-full">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{selectedUser.address || <em className="italic opacity-50">Alamat belum diinput</em>}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-primary/5 border-primary/20 rounded-2xl p-4 shadow-none">
                    <div className="flex items-center justify-between mb-1.5">
                      <Heart className="w-5 h-5 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Finansial</span>
                    </div>
                    <p className="text-xl font-bold text-primary">{formatCurrency(selectedUser.totalDonations)}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">TOTAL KONTRIBUSI</p>
                  </Card>
                  <Card className="bg-accent/5 border-accent/20 rounded-2xl p-4 shadow-none">
                    <div className="flex items-center justify-between mb-1.5">
                      <Users className="w-5 h-5 text-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent/60">Interaksi</span>
                    </div>
                    <p className="text-xl font-bold text-accent">{selectedUser.donationCount} Kali</p>
                    <p className="text-[10px] font-medium text-muted-foreground">FREKUENSI DONASI</p>
                  </Card>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Riwayat Donasi</h4>
                    <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">TERBARU</span>
                  </div>
                  {donationsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : userDonations && userDonations.length > 0 ? (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {userDonations.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-colors shadow-sm" data-testid={`row-user-donation-${d.id}`}>
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{formatCurrency(d.amount)}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> {formatDateTime(d.createdAt)}
                            </p>
                          </div>
                          {statusBadge(d.paymentStatus)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                      <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground font-medium">Belum ada catatan riwayat donasi</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-secondary/10 border-t border-border/50 flex justify-end">
                <Button variant="outline" className="rounded-xl px-8" onClick={() => setDetailOpen(false)}>Tutup</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
