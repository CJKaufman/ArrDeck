import { cn } from '../../lib/utils';

interface ProgressBeamProps {
  progress: number; // 0 to 1
  className?: string;
}

export function ProgressBeam({ progress, className }: ProgressBeamProps) {
  const percentage = Math.min(Math.max(progress * 100, 0), 100);
  
  return (
    <div className={cn("relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden", className)}>
      <div 
        className="absolute top-0 left-0 h-full bg-accent transition-all duration-500 ease-out shadow-[0_0_8px_var(--accent)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
