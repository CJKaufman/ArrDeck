import { useUnifiedQueue } from '../hooks/useUnifiedQueue';
import { ProgressBar } from '../components/common/ProgressBar';
import { ServiceBadge } from '../components/common/ServiceBadge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { sonarrService } from '../services/sonarr.service';
import { radarrService } from '../services/radarr.service';
import { useSettingsStore } from '../stores/settings.store';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function QueuePage() {
  const { items, isLoading, refetch } = useUnifiedQueue();
  const { sonarr, radarr } = useSettingsStore();

  const handleRemove = async (item: any) => {
    try {
      if (item.service === 'sonarr') {
        await sonarrService.deleteFromQueue(sonarr.baseUrl, sonarr.apiKey, item.id);
      } else {
        await radarrService.deleteFromQueue(radarr.baseUrl, radarr.apiKey, item.id);
      }
      toast.success('Removed from queue');
      refetch();
    } catch (err: any) {
      toast.error(`Failed to remove: ${err.message}`);
    }
  };

  const formatEta = (eta?: string) => {
    if (!eta) return '-';
    try {
      return formatDistanceToNow(new Date(eta), { addSuffix: true });
    } catch {
      return eta;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Unified Queue</h1>
          <p className="text-muted-foreground mt-1">
            Active downloads across all services
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
        </Button>
      </div>

      <div className="bg-surface-2 rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Service</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead className="w-48">Progress</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading queue...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No active downloads found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={`${item.service}-${item.id}`}>
                  <TableCell>
                    <ServiceBadge service={item.service} />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate" title={item.title}>
                    {item.title}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.quality}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <ProgressBar 
                        progress={item.progress} 
                        colorClass={item.service === 'sonarr' ? 'bg-sonarr' : 'bg-radarr'}
                      />
                      <div className="text-[10px] text-muted-foreground flex justify-between">
                        <span>{Math.round(item.progress)}%</span>
                        <span>{item.downloadClient}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatEta(item.estimatedCompletionTime)}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-surface-3 border border-border">
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemove(item)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
