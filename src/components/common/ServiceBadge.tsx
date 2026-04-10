import { clsx } from 'clsx';

interface ServiceBadgeProps {
  service: 'sonarr' | 'radarr' | 'prowlarr';
  className?: string;
}

export function ServiceBadge({ service, className }: ServiceBadgeProps) {
  const colors = {
    sonarr: 'bg-sonarr/20 text-sonarr border-sonarr/30',
    radarr: 'bg-radarr/20 text-radarr border-radarr/30',
    prowlarr: 'bg-prowlarr/20 text-prowlarr border-prowlarr/30',
  };

  return (
    <span className={clsx(
      'px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider',
      colors[service] || 'bg-muted text-muted-foreground border-border',
      className
    )}>
      {service}
    </span>
  );
}
