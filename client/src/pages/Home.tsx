import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, HeartHandshake, Users, CheckCircle, Calculator } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgramCard from "@/components/programs/ProgramCard";
import DonationDialog from "@/components/programs/DonationDialog";
import { usePrograms } from "@/hooks/use-programs";
import { Button } from "@/components/ui/button";
import type { Program } from "@shared/schema";

export default function Home() {
  const { data: programs, isLoading } = usePrograms();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDonateClick = (program: Program) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };

  const featuredPrograms = programs?.slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* landing page hero caring hands community */}
          <img 
            src="https://pixabay.com/get/g56b0474d1de4839510af3ede3e607d69258b65e606382a2961dad2f5e9e77347b7754484a81027c8a7636c9abd2c08258df3e5dfe8970394d7273d29731eaddc_1280.jpg" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 border border-white/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HeartHandshake className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium tracking-wide">Bersama Membangun Harapan</span>
            </div>
            
            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-white text-balance mx-auto leading-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Satu Kebaikan, <span className="text-accent relative inline-block">
                Sejuta Senyuman
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-accent/20 rounded-full blur-md -z-10" />
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 text-balance mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              Yayasan Cinta Dhuafa menyalurkan kepedulian Anda kepada mereka yang paling membutuhkan. Mari ciptakan perubahan nyata hari ini.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link href="/programs">
                <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-xl shadow-accent/25 hover:-translate-y-1 transition-all">
                  Mulai Berdonasi
                </Button>
              </Link>
              <Link href="/programs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-14 text-lg font-bold rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-md">
                  Lihat Program
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background relative z-10 -mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Users, label: "Donatur Tergabung", value: "125.000+" },
                { icon: CheckCircle, label: "Penerima Manfaat", value: "85.000+" },
                { icon: Calculator, label: "Program Sukses", value: "340+" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 flex items-center gap-6 shadow-xl shadow-primary/5 border border-border/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-3xl text-foreground">{stat.value}</h3>
                    <p className="text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Programs Section */}
        <section className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
                  Program <span className="text-primary">Pilihan</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Pilih program kebaikan yang ingin Anda dukung. Setiap donasi Anda sangat berarti bagi mereka yang menanti harapan.
                </p>
              </div>
              <Link href="/programs">
                <Button variant="ghost" className="group font-semibold text-primary hover:text-primary hover:bg-primary/5 rounded-full px-6">
                  Lihat Semua Program 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl h-[450px] animate-pulse border border-border/50" />
                ))}
              </div>
            ) : featuredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPrograms.map((program) => (
                  <ProgramCard 
                    key={program.id} 
                    program={program} 
                    onDonate={handleDonateClick} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
                <HeartHandshake className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Belum ada program yang tersedia saat ini.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <DonationDialog 
        program={selectedProgram}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
