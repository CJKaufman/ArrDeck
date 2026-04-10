import { useState } from 'react';
import { useProwlarrIndexers } from '../hooks/useProwlarrIndexers';
import { useProwlarrHealth } from '../hooks/useProwlarrHealth';
import { IndexerCard } from '../components/search/IndexerCard';
import { prowlarrService } from '../services/prowlarr.service';
import { useSettingsStore } from '../stores/settings.store';
import { 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  History, 
  Loader2,
  Search,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

export function ProwlarrPage() {
  const { prowlarr } = useSettingsStore();
  const { indexers, isLoading: fleetLoading, refetch: refetchFleet } = useProwlarrIndexers();
  const { healthIssues, hasIssues } = useProwlarrHealth();
  
  const [syncing, setSyncing] = useState(false);
  const [testingAll, setTestingAll] = useState(false);

  const activeCount = indexers?.filter(i => i.enable).length || 0;
  const errorCount = healthIssues?.filter(h => 
    h.type?.toLowerCase() === 'error' || 
    h.level?.toLowerCase() === 'error'
  ).length || 0;

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await prowlarrService.syncToApps(prowlarr.baseUrl, prowlarr.apiKey);
      toast.success('Sync triggered for all applications');
    } catch (err: any) {
      toast.error('Failed to trigger synchronization');
    } finally {
      setSyncing(false);
    }
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    try {
      await refetchFleet();
      toast.success('Fleet health scan completed');
    } catch (err: any) {
      toast.error('Failed to scan fleet');
    } finally {
      setTestingAll(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header & Command Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Fleet <span className="text-prowlarr">Management</span></h1>
            <p className="text-white/60 font-medium tracking-tight italic uppercase text-[11px]">Aggregated tracker health and synchronization bridge</p>
          </div>
          <p className="text-white/60 font-medium tracking-tight">
            Managing <span className="text-white font-bold">{indexers?.length || 0}</span> trackers across your Arr ecosystem
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Button 
            variant="ghost" 
            className="bg-white/5 hover:bg-white/10 text-white font-bold gap-2 px-6 h-12"
            onClick={handleSyncAll}
            disabled={syncing}
           >
             {syncing ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <ArrowRightLeft className="h-4 w-4" />}
             Sync Apps
           </Button>
           <Button 
            className="bg-prowlarr hover:bg-prowlarr/80 text-white font-black uppercase tracking-widest gap-2 px-8 h-12 shadow-lg shadow-prowlarr/20"
            onClick={handleTestAll}
            disabled={testingAll}
           >
             {testingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
             Test Fleet
           </Button>
        </div>
      </div>

      {/* Health Alerts */}
      {hasIssues && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
           <Card className="bg-status-error/10 border-status-error/20 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-status-error" />
              <CardContent className="p-6 flex items-start gap-5">
                 <div className="p-3 bg-status-error/20 rounded-xl text-status-error">
                    <AlertCircle className="h-6 w-6" />
                 </div>
                 <div className="flex-1 space-y-1">
                    <h3 className="font-black text-white uppercase tracking-wider text-sm">System Health Critical</h3>
                    <div className="space-y-2">
                       {healthIssues.map((issue, idx) => (
                         <p key={idx} className="text-white/60 text-xs font-medium leading-relaxed">
                            {issue.message}
                         </p>
                       ))}
                    </div>
                 </div>
                 <Button variant="ghost" className="text-white/20 hover:text-white" onClick={() => window.open(prowlarr.baseUrl, '_blank')}>
                    FIX IN PROWLARR
                 </Button>
              </CardContent>
           </Card>
        </div>
      )}

      {/* Stat Wall */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard 
          icon={<ShieldCheck className="h-5 w-5 text-status-ok" />} 
          label="Operational" 
          value={`${activeCount}`} 
          subLabel="Healthy Indexers"
         />
         <StatCard 
          icon={<AlertCircle className="h-5 w-5 text-status-error" />} 
          label="Errors" 
          value={`${errorCount}`} 
          subLabel="Critical System Issues"
         />
         <StatCard 
          icon={<History className="h-5 w-5 text-accent" />} 
          label="Searches" 
          value="24h" 
          subLabel="Global Aggregation"
         />
         <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col justify-center gap-1 group cursor-pointer hover:bg-white/10 transition-colors">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Global Search</span>
            <div className="flex items-center justify-between">
               <span className="text-lg font-black text-white/60 group-hover:text-white transition-colors">Launch Query</span>
               <Search className="h-5 w-5 text-white/20 group-hover:text-accent group-hover:animate-pulse transition-colors" />
            </div>
         </div>
      </div>

      {/* Indexer Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Active Fleet</h2>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                 <div className="h-1.5 w-1.5 rounded-full spectral-green animate-pulse" />
                 <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Refresh: 30s</span>
              </div>
           </div>
           <Button variant="ghost" size="sm" className="text-white/20 hover:text-white gap-2 font-bold" onClick={() => refetchFleet()}>
              <RefreshCw className={`h-3 w-3 ${fleetLoading ? 'animate-spin text-accent' : ''}`} />
              FORCE POLLING
           </Button>
        </div>

        {fleetLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
              ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
            {indexers?.map((indexer) => (
              <IndexerCard 
                key={indexer.id} 
                indexer={indexer} 
                onRefresh={refetchFleet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subLabel }: { icon: React.ReactNode, label: string, value: string, subLabel: string }) {
  return (
    <div className="bg-[#16171a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all shadow-xl">
       <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">{label}</span>
          <div className="text-white/20 group-hover:text-white transition-colors">
            {icon}
          </div>
       </div>

       <div className="space-y-1">
          <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
            {value}
          </p>
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-tight">
            {subLabel}
          </p>
       </div>

       <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent shadow-[0_-2px_10px_rgba(255,255,255,0.05)]" />
    </div>
  );
}
