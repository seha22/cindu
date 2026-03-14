import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, Loader2 } from "lucide-react";
import type { Program } from "@shared/schema";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

interface DonationDialogProps {
  program: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetAmount?: number | null;
  user?: { fullName: string; email: string } | null;
}

const PREDEFINED_AMOUNTS = [50000, 100000, 250000, 500000];
const SNAP_DIALOG_CLOSE_DELAY_MS = 250;

export default function DonationDialog({ program, open, onOpenChange, presetAmount, user }: DonationDialogProps) {
  const { toast } = useToast();

  const [amount, setAmount] = useState<number | "">(presetAmount || "");
  const [donorName, setDonorName] = useState(user?.fullName || "");
  const [donorEmail, setDonorEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && presetAmount) setAmount(presetAmount);
  }, [open, presetAmount]);

  useEffect(() => {
    if (open && user) {
      setDonorName(user.fullName);
      setDonorEmail(user.email);
    }
  }, [open, user]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

  const reopenDialog = () => onOpenChange(true);

  const resetAndClose = () => {
    setAmount("");
    setDonorName(user?.fullName || "");
    setDonorEmail(user?.email || "");
    setMessage("");
    onOpenChange(false);
  };

  const openSnapPayment = (snapToken: string) => {
    // Close the local dialog first so Radix overlay/focus handling does not block Snap interactions.
    onOpenChange(false);

    window.setTimeout(() => {
      if (!window.snap) {
        toast({
          title: "Pembayaran belum siap",
          description: "Popup pembayaran gagal dimuat. Silakan coba lagi.",
          variant: "destructive",
        });
        reopenDialog();
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: () => {
          toast({ title: "Alhamdulillah!", description: "Pembayaran berhasil. Terima kasih atas kebaikannya." });
          queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
          queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/donations"] });
          resetAndClose();
        },
        onPending: () => {
          toast({ title: "Menunggu Pembayaran", description: "Silakan selesaikan pembayaran Anda." });
          resetAndClose();
        },
        onError: () => {
          toast({ title: "Pembayaran Gagal", description: "Terjadi kesalahan saat memproses pembayaran.", variant: "destructive" });
          reopenDialog();
        },
        onClose: () => {
          toast({ title: "Pembayaran Dibatalkan", description: "Anda menutup halaman pembayaran." });
          reopenDialog();
        },
      });
    }, SNAP_DIALOG_CLOSE_DELAY_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;
    if (!amount || amount < 10000) {
      toast({ title: "Nominal tidak valid", description: "Minimal donasi adalah Rp 10.000", variant: "destructive" });
      return;
    }
    if (!donorName.trim()) {
      toast({ title: "Nama diperlukan", description: "Mohon masukkan nama Anda", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/donations/create-payment", {
        programId: program.id,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim() || undefined,
        amount: Number(amount),
        message: message.trim() || undefined,
      });
      const result = await res.json();

      if (result.snapToken) {
        openSnapPayment(result.snapToken);
      } else {
        toast({
          title: "Donasi Tercatat",
          description: result.midtransError || "Donasi berhasil dicatat. Pembayaran akan diproses.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/donations"] });
        resetAndClose();
      }
    } catch (err: any) {
      toast({ title: "Gagal memproses donasi", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        {program && (
          <>
            <div className="relative h-32 w-full overflow-hidden bg-primary/10">
              <img src={program.imageUrl} alt={program.title} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <DialogTitle className="font-display text-2xl font-bold leading-tight">{program.title}</DialogTitle>
                <DialogDescription className="text-white/80 mt-1">Mulai berdonasi untuk program ini</DialogDescription>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold">Pilih Nominal Donasi</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {PREDEFINED_AMOUNTS.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                          amount === amt
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:bg-secondary/50"
                        }`}
                        data-testid={`button-amount-${amt}`}
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customAmount" className="text-foreground font-semibold">Nominal Lainnya</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">Rp</span>
                    <Input
                      id="customAmount"
                      type="number"
                      min="10000"
                      placeholder="Min. 10.000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                      className="pl-12 py-6 text-lg font-bold bg-secondary/30 border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
                      data-testid="input-custom-amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorName" className="text-foreground font-semibold">Nama Lengkap</Label>
                  <Input
                    id="donorName"
                    placeholder="Nama Anda atau Hamba Allah"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="py-6 bg-secondary/30 border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
                    required
                    data-testid="input-donor-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorEmail" className="text-foreground font-semibold">Email (Opsional)</Label>
                  <Input
                    id="donorEmail"
                    type="email"
                    placeholder="email@contoh.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="py-6 bg-secondary/30 border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
                    data-testid="input-donor-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground font-semibold">Pesan & Doa (Opsional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tuliskan doa untuk donasi ini..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-secondary/30 border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl resize-none min-h-[100px]"
                    data-testid="input-donation-message"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-teal-500 hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                data-testid="button-submit-donation"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Memproses...</>
                ) : (
                  <><Heart className="w-5 h-5 mr-2 fill-white/20" />Lanjutkan Pembayaran</>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
