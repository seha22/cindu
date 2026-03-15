import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      // Error toast is handled in use-auth mutation onError.
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
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4">
              <img src="/logo.png" alt="Cinta Dhuafa Logo" className="w-full h-full object-contain" />
            </div>
            <CardTitle className="font-display text-2xl font-bold">Halo, Orang Tua Asuh!</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">Masuk untuk melihat perkembangan dan kebahagiaan anak asuh Anda</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="py-5 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="py-5 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link href="/forgot-password" title="Klik untuk mereset password" className="text-xs text-primary hover:underline transition-all">
                    Lupa password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white font-semibold shadow-lg shadow-primary/25"
                data-testid="button-login"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Masuk
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline" data-testid="link-register">
                Daftar sekarang
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

