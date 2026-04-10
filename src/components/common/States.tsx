import { AlertCircle, SearchX, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: any;
}

export function EmptyState({ title = "No Results", message, icon: Icon = SearchX }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="p-4 bg-surface-2 rounded-full">
        <Icon size={48} className="text-muted-foreground opacity-20" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-xs">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
      <div className="p-4 bg-status-error/10 rounded-full">
        <AlertCircle size={48} className="text-status-error" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-status-error">Connection Failed</h3>
        <p className="text-muted-foreground max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw size={16} /> Retry Connection
        </Button>
      )}
    </div>
  );
}
