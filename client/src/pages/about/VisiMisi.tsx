import { Eye, Target, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const misiItems = [
  "Menyelenggarakan program-program sosial yang tepat sasaran dan berkelanjutan untuk masyarakat kurang mampu.",
  "Memberikan akses pendidikan berkualitas bagi anak-anak dari keluarga prasejahtera.",
  "Menyediakan layanan kesehatan dan gizi untuk meningkatkan kualitas hidup masyarakat.",
  "Memberdayakan ekonomi umat melalui pelatihan keterampilan dan modal usaha.",
  "Membangun kemitraan strategis dengan berbagai pihak untuk memperluas dampak sosial.",
  "Mengelola dana amanah dengan transparan, profesional, dan akuntabel.",
];

export default function VisiMisi() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-visimisi-heading">
              Visi & <span className="text-primary">Misi</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Panduan dan arah perjalanan Yayasan Cinta Dhuafa dalam mewujudkan kebaikan untuk umat.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-10 text-white shadow-xl shadow-primary/20" data-testid="card-visi">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-bold text-2xl mb-4">Visi</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Menjadi yayasan terdepan dan terpercaya dalam memberdayakan masyarakat kurang mampu untuk mencapai kehidupan yang bermartabat, mandiri, dan sejahtera melalui program-program sosial yang berkelanjutan.
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-3xl p-10 text-accent-foreground shadow-xl shadow-accent/20" data-testid="card-misi-intro">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="font-bold text-2xl mb-4">Misi</h2>
              <p className="text-accent-foreground/90 text-lg leading-relaxed">
                Kami berkomitmen untuk menjalankan misi-misi berikut dalam setiap langkah perjalanan kami melayani umat dan masyarakat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {misiItems.map((misi, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-border/50 shadow-lg shadow-primary/5 p-6 flex items-start gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                data-testid={`card-misi-${index}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground/90 leading-relaxed">{misi}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
