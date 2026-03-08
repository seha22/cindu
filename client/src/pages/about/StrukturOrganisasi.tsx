import { User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const strukturData = [
  {
    level: "Dewan Pembina",
    members: [
      { name: "H. Ahmad Fauzi, M.Ag", role: "Ketua Dewan Pembina" },
      { name: "Dr. Siti Nurhaliza", role: "Anggota Dewan Pembina" },
    ],
  },
  {
    level: "Dewan Pengawas",
    members: [
      { name: "Ir. Muhammad Rizki", role: "Ketua Dewan Pengawas" },
      { name: "Hj. Fatimah Zahra, S.E.", role: "Anggota Dewan Pengawas" },
    ],
  },
  {
    level: "Pengurus Harian",
    members: [
      { name: "Ustadz Hasan Abdullah", role: "Ketua Yayasan" },
      { name: "Aisyah Putri, S.Sos", role: "Sekretaris Umum" },
      { name: "Ir. Budi Santoso", role: "Bendahara Umum" },
    ],
  },
  {
    level: "Divisi Program",
    members: [
      { name: "Rahmat Hidayat, S.Pd", role: "Kepala Divisi Pendidikan" },
      { name: "dr. Layla Karima", role: "Kepala Divisi Kesehatan" },
      { name: "Ahmad Zainudin, S.E.", role: "Kepala Divisi Ekonomi" },
      { name: "Nur Aini, S.Sos", role: "Kepala Divisi Sosial & Kemanusiaan" },
    ],
  },
];

export default function StrukturOrganisasi() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-struktur-heading">
              Struktur <span className="text-primary">Organisasi</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Tim profesional dan berdedikasi yang menjalankan amanah untuk kepentingan umat.
            </p>
          </div>

          <div className="space-y-10">
            {strukturData.map((section, sectionIndex) => (
              <div key={section.level} data-testid={`section-${section.level.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-8 rounded-full bg-primary" />
                  <h2 className="font-bold text-2xl text-foreground">{section.level}</h2>
                </div>

                <div className={`grid grid-cols-1 ${section.members.length > 2 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"} gap-6`}>
                  {section.members.map((member, memberIndex) => (
                    <div
                      key={member.name}
                      className="bg-white rounded-2xl border border-border/50 shadow-lg shadow-primary/5 p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                      data-testid={`card-member-${sectionIndex}-${memberIndex}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
