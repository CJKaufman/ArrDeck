import { clsx } from 'clsx';

interface ProgressBarProps {
  progress: number;
  className?: string;
  colorClass?: string;
}

export function ProgressBar({ progress, className, colorClass = 'bg-accent' }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={clsx('w-full bg-surface-3 rounded-full h-2 overflow-hidden', className)}>
      <div 
        className={clsx('h-full transition-all duration-500 ease-out', colorClass)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
