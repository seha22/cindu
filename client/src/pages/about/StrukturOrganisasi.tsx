import { User, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { CmsPage } from "@shared/schema";

const defaultMembers = [
  { name: "Dr. H. Ahmad Sulaiman", position: "Ketua Yayasan" },
  { name: "Hj. Fatimah Azzahra, M.Pd", position: "Wakil Ketua" },
  { name: "Ustadz Muhammad Hasan", position: "Sekretaris Jenderal" },
  { name: "Ir. Abdullah Rahman", position: "Bendahara" },
  { name: "Siti Khadijah, S.Sos", position: "Direktur Program" },
  { name: "Ahmad Fauzi, SE", position: "Direktur Keuangan" },
];

export default function StrukturOrganisasi() {
  const { data: page, isLoading } = useQuery<CmsPage>({ queryKey: ["/api/cms/struktur-organisasi"] });

  let description = "Tim profesional dan berdedikasi yang menjalankan amanah untuk kepentingan umat.";
  let members = defaultMembers;

  if (page) {
    try {
      const content = JSON.parse(page.content);
      if (content.description) description = content.description;
      if (content.members) members = content.members;
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
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-struktur-heading">
              Struktur <span className="text-primary">Organisasi</span>
            </h1>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-border/50 shadow-lg shadow-primary/5 p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                data-testid={`card-member-${index}`}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
