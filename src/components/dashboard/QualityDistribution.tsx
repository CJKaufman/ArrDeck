interface QualityData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface QualityDistributionProps {
  data: QualityData[];
}

import { cn } from '../../lib/utils';

export function QualityDistribution({ data }: QualityDistributionProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-foreground/5 rounded-2xl p-4 shadow-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-1 flex-shrink-0 min-w-0">
        <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40 italic truncate">Library Fidelity</h3>
        <span className="text-[10px] uppercase font-black tracking-widest text-foreground/20 truncate">· Resolution Weight</span>
      </div>

      <div className="space-y-5 flex-grow overflow-y-auto pr-2 no-scrollbar">
        {data.map((item) => (
          <div key={item.name} className="space-y-2 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-black uppercase tracking-tight text-foreground/60 group-hover:text-foreground transition-colors italic">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[10px] font-bold text-foreground/40">{item.value}</span>
                <span className={cn(
                  "text-[11px] font-black italic",
                  item.percentage > 70 ? "text-accent" : "text-foreground/90"
                )}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
               <div 
                 className="h-full transition-all duration-1000 ease-out"
                 style={{ 
                   width: `${item.percentage}%`, 
                   backgroundColor: item.color,
                   boxShadow: `0 0 10px ${item.color}30`
                 }} 
               />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-5 border-t border-foreground/5 flex-shrink-0">
         <p className="text-[9px] text-foreground/20 uppercase font-bold tracking-tighter">
            Aggregated resolution tiers from mission dataset
         </p>
      </div>
    </div>
  );
}
