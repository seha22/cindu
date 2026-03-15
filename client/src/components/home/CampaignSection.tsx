import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { CmsPage } from "@shared/schema";

type CampaignContent = {
  topText: string;
  heading: string;
  description: string;
  listItems: string[];
  buttonText: string;
  buttonLink: string;
  statValue: string;
  statLabel: string;
  imageUrl: string;
};

const defaultCampaign: CampaignContent = {
  topText: "WELCOME TO CINTA DHUAFA",
  heading: "Membantu Sesama Membuat Dunia Menjadi Lebih Baik",
  description: "Kami berkomitmen untuk menjadi jembatan kebaikan bagi Anda yang ingin berbagi. Setiap kontribusi Anda memberikan harapan baru bagi mereka yang membutuhkan.",
  listItems: [
    "Transparansi dana donasi 100%",
    "Penyaluran bantuan tepat sasaran",
    "Program berkelanjutan & berdampak",
    "Laporan kegiatan rutin & terbuka"
  ],
  buttonText: "Jelajahi Program",
  buttonLink: "/programs",
  statValue: "125K+",
  statLabel: "Jiwa telah terbantu melalui kebaikan Anda",
  imageUrl: "/volunteer_box_donation.png"
};

export default function CampaignSection() {
  const { data: campaignPage } = useQuery<CmsPage | null>({
    queryKey: ["/api/cms/campaign-section"],
  });

  const content: CampaignContent = campaignPage 
    ? { ...defaultCampaign, ...JSON.parse(campaignPage.content) }
    : defaultCampaign;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left Side: Image with Blobs */}
          <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-start">
            {/* Background Blob Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
              <div className="absolute top-[10%] left-[10%] w-[70%] h-[70%] bg-amber-400/80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
              <div className="absolute top-[20%] right-[10%] w-[70%] h-[70%] bg-primary/80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
              <div className="absolute bottom-[20%] left-[20%] w-[70%] h-[70%] bg-teal-400/80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            <div className="relative">
              {/* Main Decorative Circle */}
              <div className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" />
              
              {/* Yellow Solid Circle background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-amber-400 rounded-full shadow-2xl shadow-amber-200" />

              {/* The Image */}
              <div className="relative z-10 w-[25rem] h-[25rem] sm:w-[34rem] sm:h-[34rem] flex items-end justify-center overflow-visible">
                <img 
                  src={content.imageUrl} 
                  alt="Campaign Volunteer" 
                  className="max-w-full h-auto drop-shadow-2xl translate-y-4"
                />
              </div>

              {/* Stat Bubble */}
              <div className="absolute -top-4 -left-4 sm:-left-12 z-20 bg-primary/95 backdrop-blur-sm text-white p-6 rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in duration-700">
                <div className="text-3xl font-bold mb-1">{content.statValue}</div>
                <div className="text-xs font-medium opacity-80 max-w-[120px] leading-snug">
                  {content.statLabel}
                </div>
              </div>
              
              {/* Arrow decoration */}
              <div className="absolute -bottom-8 right-0 z-20 hidden sm:block">
                 <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/40 rotate-12">
                   <path d="M10 90C40 90 90 70 90 10M90 10L70 15M90 10L85 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 </svg>
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <p className="text-primary font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <span className="w-8 h-px bg-primary" />
                {content.topText}
              </p>
              <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1]">
                {content.heading}
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.description}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {content.listItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link href={content.buttonLink}>
                <Button size="lg" className="rounded-2xl h-14 px-10 text-lg font-bold group shadow-xl shadow-primary/20">
                  {content.buttonText}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {/* Decorative background SVG for content side */}
            <div className="absolute -bottom-10 right-0 opacity-5 pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M300 100C350 150 350 250 300 300C250 350 150 350 100 300C50 250 50 150 100 100C150 50 250 50 300 100Z" stroke="currentColor" strokeWidth="1" />
                    <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="10 10" />
                </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
