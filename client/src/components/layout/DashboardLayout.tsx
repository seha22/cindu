import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, User, History, LogOut, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ReactNode } from "react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profil Saya", icon: User },
  { href: "/dashboard/riwayat-donasi", label: "Riwayat Donasi", icon: History },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Cinta Dhuafa Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-lg text-primary">Cinta Dhuafa</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
                data-testid={`link-dashboard-${link.href.split("/").pop()}`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="px-3 py-2 text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">{user?.fullName}</span>
            <br />
            <span className="text-xs">Orang Tua Asuh</span>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64">
        <header className="h-16 bg-card border-b border-border/50 flex items-center px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-primary/5"
            data-testid="button-dashboard-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Lihat Website
            </Link>
            <Link href="/programs">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full">
                Donasi
              </Button>
            </Link>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
