import { Clock, Heart, Award, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const milestones = [
  {
    year: "2010",
    title: "Pendirian Yayasan",
    description: "Yayasan Cinta Dhuafa didirikan oleh sekelompok relawan yang memiliki kepedulian tinggi terhadap masyarakat kurang mampu di Indonesia.",
    icon: Heart,
  },
  {
    year: "2013",
    title: "Ekspansi Program",
    description: "Memperluas jangkauan program ke berbagai provinsi di Indonesia dengan fokus pada pendidikan dan kesehatan masyarakat.",
    icon: Users,
  },
  {
    year: "2017",
    title: "Pengakuan Nasional",
    description: "Mendapatkan penghargaan sebagai salah satu yayasan terpercaya dalam pengelolaan dana sosial dan program pemberdayaan masyarakat.",
    icon: Award,
  },
  {
    year: "2020",
    title: "Transformasi Digital",
    description: "Mengadopsi teknologi digital untuk mempermudah donasi dan memperluas jangkauan program ke seluruh Indonesia.",
    icon: Clock,
  },
  {
    year: "2024",
    title: "Dampak Berkelanjutan",
    description: "Telah membantu lebih dari 50.000 penerima manfaat di seluruh Indonesia melalui berbagai program pemberdayaan.",
    icon: Heart,
  },
];

export default function Sejarah() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-sejarah-heading">
              Sejarah <span className="text-primary">Kami</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Perjalanan panjang Yayasan Cinta Dhuafa dalam memberikan manfaat bagi masyarakat yang membutuhkan.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-primary/20 md:-translate-x-px" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={milestone.year}
                    className={`relative flex items-start gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                    data-testid={`milestone-${milestone.year}`}
                  >
                    <div className={`hidden md:block flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                      <div className={`inline-block bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 p-8 max-w-md ${isLeft ? "ml-auto" : "mr-auto"}`}>
                        <span className="text-sm font-bold text-primary mb-2 block">{milestone.year}</span>
                        <h3 className="font-bold text-xl text-foreground mb-3">{milestone.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>

                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="md:hidden flex-1 ml-16">
                      <div className="bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 p-6">
                        <span className="text-sm font-bold text-primary mb-2 block">{milestone.year}</span>
                        <h3 className="font-bold text-xl text-foreground mb-3">{milestone.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>

                    <div className="hidden md:block flex-1" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
