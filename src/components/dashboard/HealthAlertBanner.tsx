import { AlertCircle, FileWarning, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export interface AlertData {
  service: string;
  message: string;
  type: 'error' | 'warning';
  id: string; // unique identifier to allow dismissal
}

export function HealthAlertBanner({ alerts }: { alerts: AlertData[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const isError = alert.type === 'error';
        const Icon = isError ? AlertCircle : FileWarning;
        const colorClasses = isError 
          ? 'spectral-red bg-destructive/10 border-destructive/30' 
          : 'spectral-orange bg-yellow-500/10 border-yellow-500/30';

        return (
          <div 
            key={alert.id}
            className={clsx('flex items-start gap-3 p-3 rounded-lg border', colorClasses)}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold uppercase text-xs mr-2 opacity-80">
                {alert.service}
              </span>
              <span className="text-sm font-medium">
                {alert.message}
              </span>
            </div>
            <button 
              onClick={() => {
                const newSet = new Set(dismissed);
                newSet.add(alert.id);
                setDismissed(newSet);
              }}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )
      })}
    </div>
  );
}
