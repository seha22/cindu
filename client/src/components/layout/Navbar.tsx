import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const aboutLinks = [
  { href: "/about/sejarah", label: "Sejarah" },
  { href: "/about/visi-misi", label: "Visi & Misi" },
  { href: "/about/struktur-organisasi", label: "Struktur Organisasi" },
  { href: "/about/program", label: "Program" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAdmin } = useAuth();

  const isAboutActive = location.startsWith("/about");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAboutOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const mainLinks = [
    { href: "/", label: "Beranda" },
    { href: "/programs", label: "Program Amal" },
    { href: "/articles", label: "Artikel" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-primary">
              Cinta Dhuafa
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" data-testid="nav-desktop">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors duration-200 hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                onKeyDown={(e) => { if (e.key === "Escape") setAboutOpen(false); }}
                aria-expanded={aboutOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 hover:text-primary ${
                  isAboutActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="button-tentang-kami"
              >
                Tentang Kami
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`} />
              </button>

              {aboutOpen && (
                <div role="menu" className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 bg-card rounded-2xl border border-border/50 shadow-xl shadow-primary/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary ${
                        location === link.href ? "text-primary bg-primary/5" : "text-foreground/80"
                      }`}
                      data-testid={`link-${link.href.split("/").pop()}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden lg:inline">{user.fullName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 w-48 bg-card rounded-2xl border border-border/50 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      href={isAdmin ? "/admin" : "/dashboard"}
                      className="block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                      data-testid="link-dashboard"
                    >
                      {isAdmin ? "Admin Panel" : "Dashboard"}
                    </Link>
                    {!isAdmin && (
                      <Link
                        href="/dashboard/profile"
                        className="block px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                        data-testid="link-profile"
                      >
                        Profil Saya
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                      data-testid="button-logout-nav"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-semibold" data-testid="link-login">
                    Masuk
                  </Button>
                </Link>
                <Link href="/programs">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 shadow-lg shadow-accent/20 rounded-full transition-all hover:-translate-y-0.5" data-testid="button-donate">
                    Mulai Donasi
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Link href="/programs">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full shadow-md shadow-accent/20">
                Donasi
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
              className="p-2 rounded-xl text-foreground hover:bg-primary/5 transition-colors"
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-6 border-t border-border/50 animate-in slide-in-from-top-2 duration-200" data-testid="nav-mobile">
            <div className="pt-4 space-y-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    location === link.href ? "text-primary bg-primary/5" : "text-foreground/80 hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="px-4 py-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tentang Kami</p>
                <div className="space-y-1 pl-2">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        location === link.href ? "text-primary bg-primary/5" : "text-foreground/80 hover:bg-primary/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="px-4 pt-3 border-t border-border/50">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      href={isAdmin ? "/admin" : "/dashboard"}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-foreground/80 hover:bg-primary/5"
                    >
                      {isAdmin ? "Admin Panel" : "Dashboard"}
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/5"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    Masuk
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
