import { Zap } from 'lucide-react';

export function EfficiencyCard() {
  return (
    <div className="bg-[#0B0C0E]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col gap-5 h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
          <Zap className="h-4 w-4 text-accent" />
        </div>
        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 italic">System Efficiency</span>
      </div>
      <div className="space-y-1">
        <p className="text-4xl font-black text-white italic tracking-tighter">98.4%</p>
        <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Indexer Success Rate nominal</p>
      </div>
    </div>
  );
}
