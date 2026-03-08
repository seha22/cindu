import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const aboutLinks = [
  { href: "/about/sejarah", label: "Sejarah" },
  { href: "/about/visi-misi", label: "Visi & Misi" },
  { href: "/about/struktur-organisasi", label: "Struktur Organisasi" },
  { href: "/about/program", label: "Program" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAboutActive = location.startsWith("/about");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAboutOpen(false);
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
                aria-controls="about-dropdown"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 hover:text-primary ${
                  isAboutActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid="button-tentang-kami"
              >
                Tentang Kami
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`} />
              </button>

              {aboutOpen && (
                <div id="about-dropdown" role="menu" className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 bg-card rounded-2xl border border-border/50 shadow-xl shadow-primary/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
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

            <Link href="/programs">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 shadow-lg shadow-accent/20 rounded-full transition-all hover:-translate-y-0.5">
                Mulai Donasi
              </Button>
            </Link>
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
