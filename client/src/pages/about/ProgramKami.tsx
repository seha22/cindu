import { GraduationCap, Stethoscope, Home, HandHeart, Heart, TrendingUp, Users, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import type { CmsPage } from "@shared/schema";

const iconMapping: Record<string, any> = {
  GraduationCap, Heart, TrendingUp, Users, Stethoscope, Home, HandHeart,
};

const defaultAreas = [
  { title: "Pendidikan", description: "Program beasiswa dan bantuan pendidikan untuk anak yatim dan dhuafa.", icon: "GraduationCap" },
  { title: "Kesehatan", description: "Layanan kesehatan gratis dan bantuan biaya pengobatan.", icon: "Heart" },
  { title: "Ekonomi", description: "Program pemberdayaan ekonomi melalui pelatihan dan modal usaha.", icon: "TrendingUp" },
  { title: "Sosial", description: "Bantuan pangan, air bersih, dan kebutuhan dasar masyarakat.", icon: "Users" },
];

export default function ProgramKami() {
  const { data: page, isLoading } = useQuery<CmsPage>({ queryKey: ["/api/cms/program"] });

  let intro = "Berbagai bidang program yang kami jalankan untuk memberikan manfaat seluas-luasnya bagi masyarakat.";
  let areas = defaultAreas;

  if (page) {
    try {
      const content = JSON.parse(page.content);
      if (content.intro) intro = content.intro;
      if (content.areas) areas = content.areas;
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-32 pb-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-program-heading">
              Program <span className="text-primary">Kami</span>
            </h1>
            <p className="text-lg text-muted-foreground">{intro}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {areas.map((area, index) => {
              const Icon = iconMapping[area.icon] || Heart;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  data-testid={`card-program-area-${index}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-3">{area.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{area.description}</p>
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
