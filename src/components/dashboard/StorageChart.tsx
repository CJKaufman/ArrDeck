interface StorageDisk {
  name: string;
  total: number;
  used: number;
  percentage: number;
  color: string;
}

interface StorageChartProps {
  data: StorageDisk[];
}

import { cn } from "../../lib/utils";

export function StorageChart({ data }: StorageChartProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-foreground/5 rounded-2xl p-4 shadow-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-1 flex-shrink-0 min-w-0">
        <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40 italic truncate">
          Storage Array
        </h3>
        <span className="text-[10px] uppercase font-black tracking-widest text-foreground/20 truncate">
          · Path Monitor
        </span>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 no-scrollbar">
        {data.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-foreground/20 text-[10px] uppercase font-black italic tracking-widest text-center">
            Operational Drive Metrics
            <br />
            Awaiting System Scan
          </div>
        ) : (
          data.map((disk) => {
            const isWarning = disk.percentage > 85;
            const isCritical = disk.percentage > 95;

            return (
              <div key={disk.name} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tight text-foreground/60 group-hover:text-foreground transition-colors">
                      {disk.name}
                    </span>
                    <span className="text-[9px] font-mono text-foreground/20 uppercase font-bold tracking-tighter">
                      {disk.used.toFixed(0)} GB / {disk.total.toFixed(0)} GB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={cn(
                        "text-[11px] font-black italic",
                        isCritical
                          ? "text-status-error"
                          : isWarning
                            ? "text-status-warning"
                            : "text-accent",
                      )}
                    >
                      {disk.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000 ease-out",
                      isCritical
                        ? "bg-status-error shadow-[0_0_10px_var(--color-status-error)]"
                        : isWarning
                          ? "bg-status-warning shadow-[0_0_10px_var(--color-status-warning)]"
                          : "bg-accent shadow-[0_0_10px_var(--accent-color)]",
                    )}
                    style={{ width: `${disk.percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-foreground/5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-foreground/20 uppercase font-bold tracking-widest">
            Aggregate Fleet Capacity:{" "}
            <span className="text-foreground/40">
              {data.reduce((acc, d) => acc + d.total, 0).toLocaleString()} GB
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
