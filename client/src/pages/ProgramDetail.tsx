import { useState } from "react";
import { Link, useParams } from "wouter";
import { Heart, ArrowLeft, Users, Target, Calendar, Share2, Loader2, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DonationDialog from "@/components/programs/DonationDialog";
import { useProgram } from "@/hooks/use-programs";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Donation, Program } from "@shared/schema";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 500000, 1000000];

function parseImages(jsonStr: string): string[] {
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : (jsonStr ? [jsonStr] : []);
  } catch {
    return jsonStr ? [jsonStr] : [];
  }
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function formatShortCurrency(value: number) {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)} Jt`;
  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)} Rb`;
  return `Rp ${value}`;
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function DonorList({ programId }: { programId: number }) {
  const { data: donations, isLoading } = useQuery<Donation[]>({
    queryKey: ["/api/programs", programId, "donations"],
    queryFn: async () => {
      const res = await fetch(`/api/programs/${programId}/donations`);
      if (!res.ok) throw new Error("Failed to fetch donations");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-secondary/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const sortedDonations = [...(donations || [])].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  if (sortedDonations.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/30 rounded-2xl">
        <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Jadilah donatur pertama untuk program ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDonations.map((donation) => (
        <div
          key={donation.id}
          className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm"
          data-testid={`donor-item-${donation.id}`}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate" data-testid={`donor-name-${donation.id}`}>
                  {donation.donorName}
                </h4>
                <Badge variant="secondary" className="shrink-0 text-xs font-bold text-primary bg-primary/10">
                  {formatShortCurrency(donation.amount)}
                </Badge>
              </div>
              {donation.message && (
                <p className="text-sm text-muted-foreground leading-relaxed italic" data-testid={`donor-message-${donation.id}`}>
                  "{donation.message}"
                </p>
              )}
              {donation.createdAt && (
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {timeAgo(donation.createdAt.toString())}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProgramDetail() {
  const params = useParams<{ id: string }>();
  const programId = Number(params.id);
  const { data: program, isLoading } = useProgram(programId);
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [presetAmount, setPresetAmount] = useState<number | null>(null);

  const handleQuickDonate = (amount: number) => {
    setPresetAmount(amount);
    setIsDialogOpen(true);
  };

  const handleDonateClick = () => {
    setPresetAmount(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-80 bg-secondary/50 rounded-3xl animate-pulse mb-8" />
            <div className="h-8 bg-secondary/50 rounded-xl animate-pulse w-2/3 mb-4" />
            <div className="h-4 bg-secondary/50 rounded-xl animate-pulse w-1/2" />
          </div>
        </main>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 pb-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-bold text-2xl text-foreground mb-4">Program Tidak Ditemukan</h2>
            <Link href="/programs">
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Program
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const progressPercentage = Math.min((program.currentAmount / program.targetAmount) * 100, 100);
  const remaining = program.targetAmount - program.currentAmount;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/programs">
            <Button variant="ghost" className="mb-6 text-muted-foreground rounded-full px-6" data-testid="button-back-programs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Program
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Image & Title Card */}
              <div className="relative rounded-3xl border border-border/50 bg-white shadow-xl shadow-primary/5 overflow-hidden">
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <Carousel className="w-full h-full" opts={{ loop: true }}>
                    <CarouselContent className="h-full ml-0">
                      {parseImages(program.imageUrl).map((src, idx) => (
                        <CarouselItem key={idx} className="h-full pl-0 relative">
                          <img
                            src={src}
                            alt={`${program.title} - ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {parseImages(program.imageUrl).length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 bg-black/20 hover:bg-black/40 text-white border-none" />
                        <CarouselNext className="right-4 bg-black/20 hover:bg-black/40 text-white border-none" />
                      </>
                    )}
                  </Carousel>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <Badge variant="secondary" className="mb-3 bg-primary text-white border-none pointer-events-auto px-4 py-1">
                      Program Amal
                    </Badge>
                    <h1 className="font-bold text-2xl md:text-4xl text-white leading-tight" data-testid="text-program-title">
                      {program.title}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Donation Card (Shown after image on mobile, sticky on desktop) */}
              <div className="lg:hidden">
                <div className="bg-white rounded-3xl border border-border/50 shadow-xl shadow-primary/5 p-6" data-testid="donation-mobile">
                  <div className="space-y-4 mb-6">
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full relative"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex justify-between items-end gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Terkumpul</p>
                        <p className="font-bold text-2xl text-primary" data-testid="text-collected-amount-mobile">{formatCurrency(program.currentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Target</p>
                        <p className="font-bold text-sm text-foreground">{formatCurrency(program.targetAmount)}</p>
                      </div>
                    </div>

                    {remaining > 0 && (
                      <p className="text-xs text-muted-foreground text-center bg-secondary/50 rounded-lg py-2">
                        Kurang <strong className="text-foreground">{formatCurrency(remaining)}</strong> lagi
                      </p>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-foreground mb-3">Pilih Nominal Donasi</h3>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {QUICK_AMOUNTS.slice(0, 3).map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleQuickDonate(amt)}
                        className="py-3 px-1 rounded-xl border-2 border-border text-xs font-bold text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                      >
                        {formatShortCurrency(amt)}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleDonateClick}
                    className="w-full py-6 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 text-lg"
                  >
                    Donasi Sekarang
                  </Button>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 p-6 md:p-8">
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Donatur</span>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-bold text-lg text-foreground">{program.donorCount}</span>
                    </div>
                  </div>
                  <div className="w-px h-10 bg-border/50" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Target Dana</span>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="font-bold text-lg text-foreground">{formatShortCurrency(program.targetAmount)}</span>
                    </div>
                  </div>
                </div>

                <h2 className="font-bold text-2xl text-foreground mb-6">Tentang Program Ini</h2>
                <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed space-y-4" data-testid="text-program-content">
                  {(program.content || program.description).split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Donor List Card */}
              <div className="bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 p-6 md:p-8">
                <h2 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Doa & Dukungan Donatur
                </h2>
                <DonorList programId={program.id} />
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <div className="bg-white rounded-3xl border border-border/50 shadow-xl shadow-primary/5 p-8" data-testid="donation-sidebar">
                  <div className="space-y-5 mb-8">
                    <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full relative"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground font-medium">Terkumpul</p>
                      <p className="font-bold text-3xl text-primary" data-testid="text-collected-amount">{formatCurrency(program.currentAmount)}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">Target Dana</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(program.targetAmount)}</span>
                      </div>
                    </div>

                    {remaining > 0 && (
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Kekurangan Dana</p>
                        <p className="font-bold text-primary">{formatCurrency(remaining)}</p>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-foreground mb-4">Pilih Nominal Donasi</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleQuickDonate(amt)}
                        className="py-4 px-2 rounded-2xl border-2 border-border text-sm font-bold text-foreground transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
                        data-testid={`quick-donate-${amt}`}
                      >
                        {formatShortCurrency(amt)}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleDonateClick}
                    className="w-full py-8 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 text-lg hover:-translate-y-1 transition-all"
                    data-testid="button-donate-main"
                  >
                    <Heart className="w-5 h-5 mr-3 fill-white/20" />
                    Donasi Sekarang
                  </Button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: program.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link berhasil disalin!");
                      }
                    }}
                    className="w-full mt-4 py-4 rounded-2xl border-2 border-border text-sm font-bold text-muted-foreground flex items-center justify-center gap-2 transition-all hover:border-primary/30 hover:text-primary"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4" />
                    Bagikan via Sosial Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <DonationDialog
        program={program as Program}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        presetAmount={presetAmount}
        user={user ? { fullName: user.fullName, email: user.email } : null}
      />
    </div>
  );
}
