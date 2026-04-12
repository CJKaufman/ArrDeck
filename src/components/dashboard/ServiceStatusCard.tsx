import { Cpu } from 'lucide-react';
import { UseQueryResult } from '@tanstack/react-query';

interface ServiceStatusCardProps {
  name: string;
  query: UseQueryResult<any, Error>;
  colorClass: string;
}

export function ServiceStatusCard({ name, query, colorClass }: ServiceStatusCardProps) {
  const { data, isLoading, isError, error, isFetching } = query;

  let statusColor = 'bg-white/10';
  let statusText = 'BOOTING';
  let isOperational = false;

  if (isLoading) {
    statusText = 'CONNECTING';
    statusColor = 'bg-accent/40';
  } else if (isError) {
    statusText = 'OFFLINE';
    statusColor = 'bg-status-error';
  } else if (data) {
    const errorIssues = data.health?.filter((h: any) => h.type === 'error') || [];
    const warningIssues = data.health?.filter((h: any) => h.type === 'warning') || [];

    if (errorIssues.length > 0) {
      statusText = 'CRITICAL';
      statusColor = 'bg-status-error';
    } else if (warningIssues.length > 0) {
      statusText = 'WARNING';
      statusColor = 'bg-yellow-500';
    } else {
      statusText = 'CONNECTED';
      statusColor = 'bg-status-ok';
      isOperational = true;
    }
  }

  const nameColor = colorClass.replace('border-', 'text-');

  return (
    <div className={`bg-surface/50 border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-border/60 transition-all shadow-xl`}>
       {/* Background Watermark/Glow */}
       <div className={`absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${statusColor}`} />

       {/* Header: Service Identity Block */}
       <div className="flex items-start justify-between mb-5">
          <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5">
                 <div className="flex items-center justify-center p-1.5 bg-base/50 rounded-lg border border-border shadow-inner">
                    <Cpu className={`h-3.5 w-3.5 ${isOperational ? nameColor : 'text-muted-foreground/20'}`} />
                 </div>
                 <h3 className={`font-black tracking-tighter uppercase italic text-[13px] ${nameColor}`}>{name}</h3>
              </div>
                          <div className="flex items-center gap-2.5 pl-1.5 h-5">
                 <div className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColor}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor}`}></span>
                 </div>
                 <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${statusText === 'OFFLINE' ? 'text-status-error' : 'text-muted-foreground'}`}>
                    {statusText}
                 </span>
              </div>
          </div>
                    <div className="mt-1">
              <div className={`h-1.5 w-6 rounded-full ${isOperational ? 'bg-foreground/5' : 'bg-status-error/10'} border border-border opacity-40 shadow-inner`} />
           </div>
       </div>

       {/* Divider */}
       <div className="h-[1px] w-full bg-white/5 mb-6" />

        {/* Metrics Wall */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-base/50 rounded-xl py-3 px-2 border border-border flex flex-col items-center justify-center gap-1 shadow-inner hover:bg-base/30 transition-colors group/gauge overflow-hidden">
              <span className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 group-hover/gauge:text-muted-foreground transition-colors uppercase italic tracking-tighter">Version</span>
              <span className="text-[10px] font-black font-mono text-foreground whitespace-nowrap tracking-tighter italic">
                 {data?.status?.version || (isLoading ? '---' : 'UNKNOWN')}
              </span>
           </div>
           <div className="bg-base/50 rounded-xl py-3 px-2 border border-border flex flex-col items-center justify-center gap-1 shadow-inner hover:bg-base/30 transition-colors group/gauge overflow-hidden">
              <span className="text-[8px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 group-hover/gauge:text-muted-foreground transition-colors uppercase italic tracking-tighter">Response</span>
              <span className={`text-[10px] font-black font-mono tracking-tighter italic ${isOperational ? 'text-status-ok' : 'text-status-error'}`}>
                 {isFetching ? 'PULSING' : (isError ? 'TIMEOUT' : 'STABLE')}
              </span>
           </div>
        </div>

       {/* Error Message if any */}
       {isError && (
         <div className="mt-4 p-2 bg-status-error/5 rounded-lg border border-status-error/10">
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-tight">
               {error.message}
            </p>
         </div>
       )}

       {/* Polling Indicator Bar */}
       {isFetching && (
         <div className="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden">
            <div className={`h-full bg-accent w-1/2 animate-[shimmer_2s_infinite]`} style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
            }} />
         </div>
       )}
    </div>
  );
}
