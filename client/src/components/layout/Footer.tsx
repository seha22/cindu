import { Heart, Mail, MapPin, Phone, Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img src="/logo.png" alt="Cinta Dhuafa Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-bold text-xl">Cinta Dhuafa</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed max-w-sm">
              Yayasan Cinta Dhuafa berdedikasi untuk membantu masyarakat yang membutuhkan melalui program-program amal berkelanjutan dan terpercaya.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-accent transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/programs" className="text-primary-foreground/80 hover:text-accent transition-colors">Program Amal</Link>
              </li>
              <li>
                <Link href="/articles" className="text-primary-foreground/80 hover:text-accent transition-colors">Artikel</Link>
              </li>
              <li>
                <Link href="/galeri" className="text-primary-foreground/80 hover:text-accent transition-colors">Galeri</Link>
              </li>
              <li>
                <Link href="/about/sejarah" className="text-primary-foreground/80 hover:text-accent transition-colors">Sejarah</Link>
              </li>
              <li>
                <Link href="/about/visi-misi" className="text-primary-foreground/80 hover:text-accent transition-colors">Visi & Misi</Link>
              </li>
              <li>
                <Link href="/about/struktur-organisasi" className="text-primary-foreground/80 hover:text-accent transition-colors">Struktur Organisasi</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-6">Hubungi Kami</h3>
            <ul className="space-y-4 text-primary-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>Jln. Merpati Utara Blok H1/21 Sektor 1 Bintaro, Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>0877-8874-3536</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>info@cintadhuafa.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Yayasan Cinta Dhuafa. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-1 text-sm text-primary-foreground/60">
            Dibuat dengan <Heart className="w-4 h-4 text-accent mx-1" /> untuk kebaikan
          </div>
        </div>
      </div>
    </footer>
  );
}
