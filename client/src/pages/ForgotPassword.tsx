import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengirim permintaan reset password");
      }

      setSubmitted(true);
      toast({
        title: "Permintaan Terkirim",
        description: "Jika email terdaftar, instruksi reset password akan dikirimkan.",
      });
    } catch (error: any) {
      toast({
        title: "Kesalahan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-md border-0 shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-2">
            <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
            </Link>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl font-bold">Lupa Password?</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password Anda.
            </p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <p className="text-teal-600 font-medium">Instruksi telah dikirim ke email Anda.</p>
                <p className="text-sm text-muted-foreground">
                  Silakan periksa kotak masuk (dan folder spam) Anda.
                </p>
                <Button variant="outline" className="w-full mt-4" onClick={() => setSubmitted(false)}>
                  Kirim ulang email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-5 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white font-semibold shadow-lg shadow-primary/25"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Kirim Tautan Reset
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
