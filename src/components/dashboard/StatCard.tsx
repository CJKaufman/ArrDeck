import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColorClass?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColorClass = 'text-white/20' }: StatCardProps) {
  return (
    <div className="bg-[#0B0C0E]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all shadow-xl">
       {/* Top Row: Title & Icon */}
       <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors uppercase italic tracking-tighter">{title}</span>
          <div className={`${iconColorClass} group-hover:text-white transition-colors`}>
            <Icon className="h-4 w-4" />
          </div>
       </div>

       {/* Main Content: Value & Subtitle */}
       <div className="space-y-1">
          <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight italic">
              {subtitle}
            </p>
          )}
       </div>

       {/* Subtle Bottom Rim Light */}
       <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_-2px_10px_rgba(255,255,255,0.05)]" />
    </div>
  );
}
