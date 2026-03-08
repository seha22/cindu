import { GraduationCap, Stethoscope, Home, HandHeart } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const programAreas = [
  {
    title: "Pendidikan",
    icon: GraduationCap,
    description: "Program beasiswa, pembangunan sekolah, dan pelatihan guru untuk meningkatkan akses pendidikan berkualitas bagi anak-anak kurang mampu.",
    highlights: ["Beasiswa Prestasi", "Bantuan Perlengkapan Sekolah", "Program Bimbingan Belajar", "Pelatihan Guru Daerah Terpencil"],
  },
  {
    title: "Kesehatan",
    icon: Stethoscope,
    description: "Layanan kesehatan gratis, program gizi anak, dan penyediaan obat-obatan untuk masyarakat yang tidak mampu mengakses fasilitas kesehatan.",
    highlights: ["Pengobatan Gratis", "Program Gizi Anak", "Khitanan Massal", "Klinik Keliling"],
  },
  {
    title: "Ekonomi & Pemberdayaan",
    icon: Home,
    description: "Program pemberdayaan ekonomi melalui pelatihan keterampilan, bantuan modal usaha, dan pendampingan UMKM.",
    highlights: ["Pelatihan Keterampilan", "Bantuan Modal Usaha", "Pendampingan UMKM", "Program Wakaf Produktif"],
  },
  {
    title: "Sosial & Kemanusiaan",
    icon: HandHeart,
    description: "Bantuan tanggap darurat bencana, program pangan untuk kaum dhuafa, dan santunan untuk yatim piatu serta janda.",
    highlights: ["Tanggap Darurat Bencana", "Paket Sembako", "Santunan Yatim & Janda", "Qurban & Aqiqah"],
  },
];

export default function ProgramKami() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-program-heading">
              Program <span className="text-primary">Kami</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Berbagai bidang program yang kami jalankan untuk memberikan manfaat seluas-luasnya bagi masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {programAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className="bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  data-testid={`card-program-area-${index}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">{area.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{area.description}</p>
                  <ul className="space-y-2">
                    {area.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-10 md:p-14 text-center text-white shadow-xl shadow-primary/20">
            <h2 className="font-bold text-3xl mb-4">Ingin Berkontribusi?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Setiap donasi Anda akan langsung disalurkan untuk mendukung program-program yang berdampak nyata bagi masyarakat.
            </p>
            <Link href="/programs">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 rounded-full shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5"
                data-testid="button-donate-cta"
              >
                Lihat Program Donasi
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
