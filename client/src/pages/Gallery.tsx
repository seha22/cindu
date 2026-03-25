import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Loader2, Image as ImageIcon } from "lucide-react";
import type { Gallery } from "@shared/schema";

export default function GalleryPage() {
  const { data: galleries, isLoading } = useQuery<Gallery[]>({ queryKey: ["/api/galleries"] });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h1 className="font-bold text-4xl md:text-5xl text-foreground mb-6" data-testid="text-gallery-heading">
              Galeri <span className="text-primary">Kegiatan</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Dokumentasi beragam kegiatan penyaluran bantuan, program amal, dan aktivitas sosial Yayasan Cinta Dhuafa bersama para donatur dan relawan.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleries.map((g) => (
                <div
                  key={g.id}
                  className="group relative rounded-3xl overflow-hidden border border-border/50 shadow-lg shadow-primary/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block bg-muted aspect-square"
                  data-testid={`card-gallery-${g.id}`}
                >
                  {g.imageUrl ? (
                    <img
                      src={g.imageUrl}
                      alt={g.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 opacity-30" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/10 shadow-sm">
                      {g.category}
                    </Badge>
                  </div>
                  
                  {/* Content (Text) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="font-bold text-xl text-white mb-2 leading-tight drop-shadow-md">
                      {g.title}
                    </h3>
                    {g.description && (
                      <p className="text-sm text-white/80 line-clamp-2 drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {g.description}
                      </p>
                    )}
                    {g.createdAt && (
                      <p className="text-xs text-white/60 mt-3 pt-3 border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {new Date(g.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border flex flex-col items-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Belum ada foto kegiatan.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
