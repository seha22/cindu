import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Settings } from "lucide-react";

export default function AdminSettings() {
  const { toast } = useToast();
  
  const { data: midtransSettings, isLoading } = useQuery({
    queryKey: ["/api/cms/settings-midtrans"],
  });

  const [form, setForm] = useState({
    mode: "sandbox",
    clientKey: "",
    serverKey: "",
  });

  useEffect(() => {
    if (midtransSettings && (midtransSettings as any).content) {
      try {
        const config = JSON.parse((midtransSettings as any).content);
        setForm({
          mode: config.mode || "sandbox",
          clientKey: config.clientKey || "",
          serverKey: config.serverKey || "",
        });
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, [midtransSettings]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("PUT", "/api/cms/settings-midtrans", {
        slug: "settings-midtrans",
        title: "Pengaturan Midtrans",
        content: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings-midtrans"] });
      toast({ title: "Pengaturan Midtrans berhasil disimpan" });
    },
    onError: (error: Error) => {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-display text-2xl font-bold">Pengaturan Sistem</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola konfigurasi integrasi dan fungsionalitas aplikasi.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Midtrans Payment Gateway</CardTitle>
                  <CardDescription>
                    Konfigurasi kunci API Sandbox atau Production untuk Midtrans.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mode">Environment Mode</Label>
                  <Select
                    value={form.mode}
                    onValueChange={(val) => setForm({ ...form, mode: val })}
                  >
                    <SelectTrigger className="flex-1 w-full rounded-xl py-5">
                      <SelectValue placeholder="Pilih environment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production (Real)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientKey">Client Key</Label>
                  <Input
                    id="clientKey"
                    value={form.clientKey}
                    onChange={(e) => setForm({ ...form, clientKey: e.target.value })}
                    required
                    className="py-5 rounded-xl font-mono text-sm"
                    placeholder="SB-Mid-client-..."
                  />
                  <p className="text-xs text-muted-foreground">Kunci client akan digunakan secara publik di halaman frontend untuk menginisiasi Snap payment.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverKey">Server Key</Label>
                  <Input
                    id="serverKey"
                    type="password"
                    value={form.serverKey}
                    onChange={(e) => setForm({ ...form, serverKey: e.target.value })}
                    required
                    className="py-5 rounded-xl font-mono text-sm"
                    placeholder="SB-Mid-server-..."
                  />
                  <p className="text-xs text-muted-foreground">Kunci server tidak akan pernah diekspos secara publik. Digunakan utuk verifikasi transaksi dan notifikasi balik (webhook) dari Midtrans.</p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-xl px-8"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Simpan Pengaturan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
