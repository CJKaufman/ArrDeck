import { ShieldCheck } from 'lucide-react';

export function SecurityCard() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-foreground/5 rounded-2xl p-6 flex flex-col gap-5 h-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-status-ok/10 rounded-lg border border-status-ok/20">
          <ShieldCheck className="h-4 w-4 text-status-ok" />
        </div>
        <span className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40 italic">Security Status</span>
      </div>
      <div className="space-y-1">
        <p className="text-4xl font-black text-foreground italic tracking-tighter uppercase">Secured</p>
        <p className="text-[10px] text-foreground/30 uppercase font-bold tracking-widest">API Gateway & Auth Tunneling Active</p>
      </div>
    </div>
  );
}
