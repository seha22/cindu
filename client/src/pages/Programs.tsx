import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgramCard from "@/components/programs/ProgramCard";
import DonationDialog from "@/components/programs/DonationDialog";
import { usePrograms } from "@/hooks/use-programs";
import { useAuth } from "@/hooks/use-auth";
import { HeartHandshake, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Program } from "@shared/schema";

export default function Programs() {
  const { data: programs, isLoading } = usePrograms();
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDonateClick = (program: Program) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };

  const filteredPrograms = programs?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Banner */}
        <div className="bg-primary py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-6">
              Program Amal
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Temukan berbagai jalan kebaikan. Salurkan donasi Anda pada program-program terpercaya yang membawa dampak positif bagi yang membutuhkan.
            </p>
          </div>
        </div>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-display font-bold text-2xl text-foreground">Semua Program</h2>
              <div className="relative max-w-sm w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Cari program amal..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 bg-white rounded-full border-border/50 shadow-sm focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-3xl h-[450px] animate-pulse border border-border/50" />
                ))}
              </div>
            ) : filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.map((program) => (
                  <ProgramCard 
                    key={program.id} 
                    program={program} 
                    onDonate={handleDonateClick} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-border shadow-sm">
                <HeartHandshake className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">Program Tidak Ditemukan</h3>
                <p className="text-muted-foreground max-w-md mx-auto">Maaf, kami tidak dapat menemukan program yang sesuai dengan pencarian Anda.</p>
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
        user={user ? { fullName: user.fullName, email: user.email } : null}
      />
    </div>
  );
}
