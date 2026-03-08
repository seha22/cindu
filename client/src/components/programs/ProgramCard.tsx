import { Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Program } from "@shared/schema";

interface ProgramCardProps {
  program: Program;
  onDonate: (program: Program) => void;
}

export default function ProgramCard({ program, onDonate }: ProgramCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const progressPercentage = Math.min((program.currentAmount / program.targetAmount) * 100, 100);

  return (
    <div className="group bg-card rounded-3xl overflow-hidden border border-border/50 shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col" data-testid={`card-program-${program.id}`}>
      <Link href={`/programs/${program.id}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={program.imageUrl} 
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-2 border border-white/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Mendesak</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/programs/${program.id}`} className="block">
          <h3 className="font-display font-bold text-xl text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {program.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
          {program.description}
        </p>
        
        <div className="space-y-4 mb-6 mt-auto">
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          
          <div className="flex justify-between items-end gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Terkumpul</p>
              <p className="font-bold text-primary">{formatCurrency(program.currentAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium mb-1">Target</p>
              <p className="font-bold text-foreground text-sm">{formatCurrency(program.targetAmount)}</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={(e) => {
            e.preventDefault();
            onDonate(program);
          }}
          className="w-full py-6 rounded-xl font-bold bg-primary text-white shadow-md shadow-primary/20"
          data-testid={`button-donate-${program.id}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          Donasi Sekarang
        </Button>
      </div>
    </div>
  );
}
