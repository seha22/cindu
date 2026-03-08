import { Link, useLocation } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/programs", label: "Program Amal" },
    { href: "/articles", label: "Artikel" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-primary">
              Cinta Dhuafa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
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
            <Link href="/programs">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 shadow-lg shadow-accent/20 rounded-full transition-all hover:-translate-y-0.5">
                Mulai Donasi
              </Button>
            </Link>
          </nav>
          
          {/* Mobile Menu Button - simplified for brevity, assume desktop first but responsive visible */}
          <div className="md:hidden flex items-center">
            <Link href="/programs">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full shadow-md shadow-accent/20">
                Donasi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
