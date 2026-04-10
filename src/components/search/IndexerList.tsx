import { useQuery } from '@tanstack/react-query';
import { prowlarrService } from '../../services/prowlarr.service';
import { useSettingsStore } from '../../stores/settings.store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export function IndexerList() {
  const { prowlarr } = useSettingsStore();

  const { data: indexers, isLoading, isError, refetch } = useQuery({
    queryKey: ['prowlarr', 'indexers'],
    queryFn: () => prowlarrService.getIndexers(prowlarr.baseUrl, prowlarr.apiKey),
    enabled: prowlarr.enabled && !!prowlarr.baseUrl && !!prowlarr.apiKey,
  });

  if (!prowlarr.enabled) {
    return (
      <Card>
        <CardContent className="min-h-[200px] flex items-center justify-center text-muted-foreground">
          Prowlarr is not enabled in settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface-2 border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Active Indexers</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Loading indexers...</div>
        ) : isError ? (
          <div className="py-8 text-center text-destructive text-sm">Failed to load indexers.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {indexers?.map((indexer: any) => (
              <div 
                key={indexer.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-surface-3 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  {indexer.enable ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">{indexer.name}</span>
                </div>
                <div className="flex gap-2">
                   <Badge variant="outline" className="text-[9px] uppercase">
                    {indexer.protocol}
                   </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
