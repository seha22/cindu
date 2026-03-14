import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, HeartHandshake, Users, CheckCircle, Calculator } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgramCard from "@/components/programs/ProgramCard";
import DonationDialog from "@/components/programs/DonationDialog";
import { usePrograms } from "@/hooks/use-programs";
import { useArticles } from "@/hooks/use-articles";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import type { Program, HeroSlide, Article, CmsPage } from "@shared/schema";

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: 0,
    title: "",
    subtitle: "",
    altText: "Hero Background",
    imageUrl: "https://pixabay.com/get/g56b0474d1de4839510af3ede3e607d69258b65e606382a2961dad2f5e9e77347b7754484a81027c8a7636c9abd2c08258df3e5dfe8970394d7273d29731eaddc_1280.jpg",
    imagePath: null,
    isActive: true,
    sortOrder: 1,
    createdAt: null,
    updatedAt: null,
  },
];

type HomeVideoItem = {
  title: string;
  youtubeUrl: string;
};

type DonorPrayer = {
  id: number;
  donorName: string;
  message: string;
  createdAt: string | Date | null;
};

type HomeVideoContent = {
  heading: string;
  description: string;
  videos: HomeVideoItem[];
};

const defaultHomeVideoContent: HomeVideoContent = {
  heading: "Video Kegiatan",
  description: "Tampilkan satu atau beberapa video YouTube terbaru untuk memperlihatkan kegiatan dan dampak program yayasan.",
  videos: [],
};

function extractYouTubeId(url: string) {
  const normalized = url.trim();
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0])) {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export default function Home() {
  const { data: programs, isLoading } = usePrograms();
  const { data: articles, isLoading: isArticlesLoading } = useArticles();
  const { data: heroSlides } = useQuery<HeroSlide[]>({ queryKey: ["/api/hero-slides"] });
  const { data: donorPrayers } = useQuery<DonorPrayer[]>({ queryKey: ["/api/donor-prayers"] });
  const { data: homeVideoPage } = useQuery<CmsPage | null>({
    queryKey: ["/api/cms/home-video"],
    queryFn: async () => {
      const res = await fetch("/api/cms/home-video", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Gagal memuat video homepage");
      return res.json();
    },
  });
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [donorPrayerCarouselApi, setDonorPrayerCarouselApi] = useState<CarouselApi | null>(null);

  const handleDonateClick = (program: Program) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };

  const featuredPrograms = programs?.slice(0, 3) || [];
  const latestArticles: Article[] = (articles || []).slice(0, 2);

  let homeVideoContent = defaultHomeVideoContent;
  if (homeVideoPage) {
    try {
      const parsed = JSON.parse(homeVideoPage.content) as Partial<HomeVideoContent> & { youtubeUrl?: string };
      const parsedVideos = Array.isArray(parsed.videos)
        ? parsed.videos.map((video) => ({
            title: typeof video?.title === "string" ? video.title : "",
            youtubeUrl: typeof video?.youtubeUrl === "string" ? video.youtubeUrl : "",
          }))
        : [];

      homeVideoContent = {
        heading: parsed.heading || defaultHomeVideoContent.heading,
        description: parsed.description || defaultHomeVideoContent.description,
        videos: parsedVideos.length > 0
          ? parsedVideos
          : parsed.youtubeUrl
            ? [{ title: "", youtubeUrl: parsed.youtubeUrl }]
            : [],
      };
    } catch {}
  }

  const homeVideos = homeVideoContent.videos
    .map((video) => {
      const youtubeId = extractYouTubeId(video.youtubeUrl);
      if (!youtubeId) return null;
      return {
        ...video,
        youtubeId,
      };
    })
    .filter((video): video is HomeVideoItem & { youtubeId: string } => Boolean(video));

  const activeHeroSlides = useMemo(
    () => (heroSlides || []).filter((slide) => slide.isActive).sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id),
    [heroSlides],
  );
  const slidesToShow = activeHeroSlides.length > 0 ? activeHeroSlides : fallbackHeroSlides;
  const currentSlide = slidesToShow[currentSlideIndex] || slidesToShow[0];
  const currentVideo = homeVideos[currentVideoIndex] || homeVideos[0];

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [slidesToShow.length]);

  useEffect(() => {
    if (slidesToShow.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slidesToShow.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slidesToShow.length]);

  useEffect(() => {
    setCurrentVideoIndex(0);
  }, [homeVideos.length]);

  useEffect(() => {
    if (!donorPrayerCarouselApi || !donorPrayers || donorPrayers.length <= 1) return;

    const timer = window.setInterval(() => {
      donorPrayerCarouselApi.scrollNext();
    }, 4500);

    return () => window.clearInterval(timer);
  }, [donorPrayerCarouselApi, donorPrayers]);

  const showPreviousVideo = () => {
    if (homeVideos.length <= 1) return;
    setCurrentVideoIndex((prev) => (prev - 1 + homeVideos.length) % homeVideos.length);
  };

  const showNextVideo = () => {
    if (homeVideos.length <= 1) return;
    setCurrentVideoIndex((prev) => (prev + 1) % homeVideos.length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* landing page hero slideshow */}
          <div className="absolute inset-0">
            {slidesToShow.map((slide, index) => (
              <img
                key={`${slide.id}-${slide.imageUrl}`}
                src={slide.imageUrl}
                alt={slide.altText || "Hero Background"}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-out ${index === currentSlideIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary/30" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/90 border border-white/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <HeartHandshake className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium tracking-wide">Bersama Membangun Harapan</span>
            </div>

            <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-white text-balance mx-auto leading-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-shadow-hero">
              Satu Kebaikan, <span className="text-accent relative inline-block">
                Sejuta Senyuman
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-accent/30 rounded-full blur-md -z-10" />
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 text-balance mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
              Yayasan Cinta Dhuafa menyalurkan kepedulian Anda kepada mereka yang paling membutuhkan. Mari ciptakan perubahan nyata hari ini.
            </p>

            {currentSlide?.subtitle ? (
              <p className="max-w-2xl mx-auto text-sm md:text-base text-white/75 mb-6">{currentSlide.subtitle}</p>
            ) : null}

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

            {slidesToShow.length > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2" data-testid="hero-slide-indicators">
                {slidesToShow.map((slide, index) => (
                  <button
                    key={slide.id || index}
                    type="button"
                    aria-label={`Tampilkan slide ${index + 1}`}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${index === currentSlideIndex ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 bg-transparent relative z-10 -mt-16 lg:-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: Users, label: "Donatur Tergabung", value: "125.000+", gradient: "from-teal-500 to-emerald-500" },
                { icon: CheckCircle, label: "Penerima Manfaat", value: "85.000+", gradient: "from-amber-500 to-orange-500" },
                { icon: Calculator, label: "Program Sukses", value: "340+", gradient: "from-primary to-teal-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-7 flex items-center gap-5 shadow-2xl shadow-primary/10 border border-border/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-3xl text-foreground">{stat.value}</h3>
                    <p className="text-muted-foreground font-medium text-sm">{stat.label}</p>
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

            <div className="mt-10 flex justify-center">
              <Link href="/programs">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-semibold"
                  data-testid="button-home-more-programs"
                >
                  Lihat program pilihan lainnya
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
                Berita <span className="text-primary">Terkini</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Ikuti kabar terbaru kegiatan yayasan dan cerita inspiratif dari lapangan.
              </p>
            </div>

            {isArticlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-3xl h-[360px] animate-pulse border border-border/50" />
                ))}
              </div>
            ) : latestArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group bg-white rounded-3xl border border-border/50 shadow-lg shadow-primary/5 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    data-testid={`card-home-article-${article.id}`}
                  >
                    <div className="h-56 overflow-hidden">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">{article.category}</p>
                      <h3 className="font-bold text-2xl text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                      <span className="text-primary font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Baca selengkapnya
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
                <p className="text-lg font-medium text-muted-foreground">Belum ada berita terbaru saat ini.</p>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Link href="/articles">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base font-semibold"
                  data-testid="button-home-more-articles"
                >
                  Lihat berita terbaru lainnya
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Home Video Section */}
        {currentVideo ? (
          <section className="py-24 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
                <div className="max-w-xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70 mb-4">Media Visual</p>
                  <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
                    {homeVideoContent.heading}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {homeVideoContent.description}
                  </p>
                  {currentVideo.title ? (
                    <div className="rounded-2xl border border-border/60 bg-white/80 backdrop-blur px-5 py-4 shadow-lg shadow-primary/5">
                      <p className="text-sm text-muted-foreground mb-1">Sedang diputar</p>
                      <h3 className="font-semibold text-lg text-foreground">{currentVideo.title}</h3>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[2rem] overflow-hidden border border-border/50 bg-black shadow-2xl shadow-primary/10">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${currentVideo.youtubeId}`}
                        title={currentVideo.title || homeVideoContent.heading}
                        className="w-full h-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  {homeVideos.length > 1 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={showPreviousVideo} data-testid="button-home-video-prev">
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={showNextVideo} data-testid="button-home-video-next">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap" data-testid="home-video-indicators">
                        {homeVideos.map((video, index) => (
                          <button
                            key={`${video.youtubeId}-${index}`}
                            type="button"
                            onClick={() => setCurrentVideoIndex(index)}
                            aria-label={`Tampilkan video ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all ${index === currentVideoIndex ? "w-8 bg-primary" : "w-2.5 bg-primary/30 hover:bg-primary/50"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Donor Prayer Section */}
        {donorPrayers && donorPrayers.length > 0 ? (
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mb-12">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/70 mb-4">Suara Kebaikan</p>
                <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
                  Doa dari <span className="text-primary">Para Donatur</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Sebagian pesan tulus yang menyertai setiap donasi dan menjadi penguat langkah kebaikan bersama.
                </p>
              </div>

              <Carousel
                setApi={setDonorPrayerCarouselApi}
                opts={{ align: "start", loop: donorPrayers.length > 3 }}
                className="px-12 md:px-16"
              >
                <CarouselContent className="-ml-4">
                  {donorPrayers.map((prayer) => (
                    <CarouselItem key={prayer.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <article className="h-full rounded-[2rem] border border-border/60 bg-white p-8 shadow-xl shadow-primary/5">
                        <div className="flex items-center justify-between gap-4 mb-6">
                          <div>
                            <p className="text-sm text-muted-foreground">Doa donatur</p>
                            <h3 className="font-semibold text-lg text-foreground">{prayer.donorName}</h3>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                            "
                          </div>
                        </div>

                        <p className="text-foreground/90 leading-relaxed text-base min-h-[144px]">
                          {prayer.message}
                        </p>

                        {prayer.createdAt ? (
                          <p className="mt-6 text-xs text-muted-foreground">
                            {new Date(prayer.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        ) : null}
                      </article>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 top-1/2 -translate-y-1/2 rounded-full border-border bg-white text-foreground hover:bg-white" />
                <CarouselNext className="right-0 top-1/2 -translate-y-1/2 rounded-full border-border bg-white text-foreground hover:bg-white" />
              </Carousel>
            </div>
          </section>
        ) : null}
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