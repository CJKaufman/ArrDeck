import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Shield, 
  Tv, 
  Film, 
  Link as LinkIcon, 
  Download, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  Terminal, 
  Power 
} from 'lucide-react';
import { useSettingsStore } from '../../stores/settings.store';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';

type Step = 'induction' | 'selection' | 'linkage' | 'sync' | 'handshake';

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('induction');
  const [loading, setLoading] = useState(false);
  const { 
    sonarr, radarr, prowlarr, qbittorrent, 
    updateSonarr, updateRadarr, updateProwlarr, updateQBittorrent,
    theme, updateSetting, setIsOnboarded 
  } = useSettingsStore();

  const [bootText, setBootText] = useState<string[]>([]);
  
  useEffect(() => {
    if (step === 'induction') {
      const messages = [
        "> INITIALIZING BOOT LOADER...",
        "> LOADING COMMAND MATRIX...",
        "> SCANNING NETWORK INTERFACES...",
        "> READY FOR OPERATIONAL INDUCTION."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < messages.length) {
          setBootText(prev => [...prev, messages[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [step]);

  const nextStep = () => {
    if (step === 'induction') setStep('selection');
    else if (step === 'selection') setStep('linkage');
    else if (step === 'linkage') setStep('sync');
    else if (step === 'sync') setStep('handshake');
    else if (step === 'handshake') finalize();
  };

  const prevStep = () => {
    if (step === 'selection') setStep('induction');
    else if (step === 'linkage') setStep('selection');
    else if (step === 'sync') setStep('linkage');
    else if (step === 'handshake') setStep('sync');
  };

  const finalize = () => {
    setLoading(true);
    setTimeout(() => {
      setIsOnboarded(true);
    }, 1500);
  };

  const handleSkip = () => {
    setIsOnboarded(true);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-base text-foreground flex flex-col items-center justify-center p-6 md:p-12 font-geist overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--accent-color)_0%,_transparent_70%)] opacity-10" />
        <div className="absolute h-px w-full bg-border top-1/4 opacity-20" />
        <div className="absolute h-px w-full bg-border top-2/4 opacity-20" />
        <div className="absolute h-px w-full bg-border top-3/4 opacity-20" />
        <div className="absolute w-px h-full bg-border left-1/4 opacity-20" />
        <div className="absolute w-px h-full bg-border left-2/4 opacity-20" />
        <div className="absolute w-px h-full bg-border left-3/4 opacity-20" />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl z-10 space-y-16 animate-in fade-in zoom-in-95 duration-700 py-12">
        
        {step === 'induction' && (
          <div className="space-y-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-3xl shadow-[0_0_30px_rgba(0,180,216,0.2)]">
                  <Terminal className="h-10 w-10 text-accent animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-foreground">
                  Arr<span className="text-accent underline decoration-8 underline-offset-8">Deck</span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl font-bold text-muted-foreground tracking-tight uppercase italic ml-1">Mission Control Initialization Sequence</p>
            </div>

            <div className="bg-surface border border-border rounded-3xl p-8 space-y-4 font-mono text-[11px] text-accent/60 h-48 overflow-hidden shadow-2xl relative group">
              <div className="absolute top-4 right-4 animate-pulse">
                <Activity size={12} />
              </div>
              {bootText.map((txt, i) => (
                <p key={i} className="animate-in fade-in slide-in-from-left-2 duration-300 tracking-wider font-bold uppercase">{txt}</p>
              ))}
              {bootText.length === 4 && (
                <p className="animate-pulse font-black text-foreground">_ SYSTEM STANDBY</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <Button size="lg" onClick={nextStep} className="w-full md:w-auto px-12 h-16 bg-accent hover:bg-accent/90 text-foreground font-black italic uppercase tracking-widest text-lg group rounded-2xl shadow-[0_0_30px_rgba(0,188,255,0.3)] transition-all hover:scale-105 active:scale-95">
                Initialize Fleet <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground hover:text-foreground font-black uppercase tracking-widest italic text-xs hover:bg-surface group">
                Manual Override <Power className="ml-2 h-3 w-3 group-hover:rotate-90 transition-transform" />
              </Button>
            </div>
          </div>
        )}

         {step === 'selection' && (
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
             <div className="space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Fleet <span className="text-accent">Commissioning</span></h2>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] italic">Select the operational nodes to bridge into your deck</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'sonarr', label: 'Sonarr', sub: 'TV Dataset Matrix', icon: Tv, color: 'text-sonarr', border: 'border-sonarr/20', shadow: 'shadow-sonarr/10', enabled: sonarr.enabled, update: (e: any) => updateSonarr({ enabled: e }) },
                  { id: 'radarr', label: 'Radarr', sub: 'Film Dataset Matrix', icon: Film, color: 'text-radarr', border: 'border-radarr/20', shadow: 'shadow-radarr/10', enabled: radarr.enabled, update: (e: any) => updateRadarr({ enabled: e }) },
                  { id: 'prowlarr', label: 'Prowlarr', sub: 'Indexer Protocol Link', icon: LinkIcon, color: 'text-prowlarr', border: 'border-prowlarr/20', shadow: 'shadow-prowlarr/10', enabled: prowlarr.enabled, update: (e: any) => updateProwlarr({ enabled: e }) },
                  { id: 'qbittorrent', label: 'qBittorrent', sub: 'Transport Control Layer', icon: Download, color: 'text-accent', border: 'border-accent/20', shadow: 'shadow-accent/10', enabled: qbittorrent.enabled, update: (e: any) => updateQBittorrent({ enabled: e }) },
                ].map((svc) => (
                  <Card key={svc.id} className={cn("bg-surface/30 border transition-all duration-300 rounded-2xl group cursor-pointer", svc.enabled ? svc.border : "border-border opacity-60 grayscale hover:grayscale-0", svc.enabled && svc.shadow)}
                     onClick={() => svc.update(!svc.enabled)}>
                   <CardContent className="p-6 flex items-center justify-between">
                     <div className="flex items-center gap-5">
                        <div className={cn("p-4 rounded-2xl bg-foreground/5 group-hover:scale-110 transition-transform", svc.enabled && svc.color)}>
                          <svc.icon size={28} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black italic uppercase tracking-tighter text-xl text-foreground">{svc.label}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">{svc.sub}</p>
                        </div>
                     </div>
                     <Switch checked={svc.enabled} onCheckedChange={svc.update} className={cn("data-[state=checked]:bg-accent", svc.id === 'sonarr' && "data-[state=checked]:bg-sonarr", svc.id === 'radarr' && "data-[state=checked]:bg-radarr", svc.id === 'prowlarr' && "data-[state=checked]:bg-prowlarr")} />
                   </CardContent>
                  </Card>
                ))}
             </div>

             <div className="flex justify-between items-center pt-8 border-t border-border">
                <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground uppercase font-black italic tracking-widest">
                   <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                <Button onClick={nextStep} className="h-14 px-10 bg-accent hover:bg-accent/90 text-foreground font-black italic uppercase tracking-widest rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95">
                   Next Protocol
                </Button>
             </div>
          </div>
        )}

        {step === 'linkage' && (
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
             <div className="space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Connection <span className="text-accent">Protocol</span></h2>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] italic">Configure data links for commissioned services (Optional)</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto px-1 pr-4 no-scrollbar">
                {sonarr.enabled && (
                  <div className="space-y-4 p-6 bg-surface border border-sonarr/10 rounded-2xl">
                     <h3 className="text-sonarr font-black uppercase italic tracking-tighter flex items-center gap-2 px-1"><Tv size={16} /> Sonarr Link</h3>
                     <div className="space-y-3">
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">Base URL</Label>
                        <Input value={sonarr.baseUrl} onChange={e => updateSonarr({ baseUrl: e.target.value })} className="bg-base border-border" /></div>
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">API Key</Label>
                        <Input type="password" value={sonarr.apiKey} onChange={e => updateSonarr({ apiKey: e.target.value })} className="bg-base border-border" /></div>
                     </div>
                  </div>
                )}
                {radarr.enabled && (
                  <div className="space-y-4 p-6 bg-surface border border-radarr/10 rounded-2xl">
                     <h3 className="text-radarr font-black uppercase italic tracking-tighter flex items-center gap-2 px-1"><Film size={16} /> Radarr Link</h3>
                     <div className="space-y-3">
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">Base URL</Label>
                        <Input value={radarr.baseUrl} onChange={e => updateRadarr({ baseUrl: e.target.value })} className="bg-base border-border" /></div>
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">API Key</Label>
                        <Input type="password" value={radarr.apiKey} onChange={e => updateRadarr({ apiKey: e.target.value })} className="bg-base border-border" /></div>
                     </div>
                  </div>
                )}
                {prowlarr.enabled && (
                  <div className="space-y-4 p-6 bg-surface border border-prowlarr/10 rounded-2xl">
                     <h3 className="text-prowlarr font-black uppercase italic tracking-tighter flex items-center gap-2 px-1"><LinkIcon size={16} /> Prowlarr Link</h3>
                     <div className="space-y-3">
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">Base URL</Label>
                        <Input value={prowlarr.baseUrl} onChange={e => updateProwlarr({ baseUrl: e.target.value })} className="bg-base border-border" /></div>
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">API Key</Label>
                        <Input type="password" value={prowlarr.apiKey} onChange={e => updateProwlarr({ apiKey: e.target.value })} className="bg-base border-border" /></div>
                     </div>
                  </div>
                )}
                {qbittorrent.enabled && (
                  <div className="space-y-4 p-6 bg-surface border border-accent/10 rounded-2xl">
                     <h3 className="text-accent font-black uppercase italic tracking-tighter flex items-center gap-2 px-1"><Download size={16} /> qBittorrent Link</h3>
                     <div className="space-y-3">
                        <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">Base URL</Label>
                        <Input value={qbittorrent.baseUrl} onChange={e => updateQBittorrent({ baseUrl: e.target.value })} className="bg-base border-border" /></div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">User</Label>
                           <Input value={qbittorrent.username} onChange={e => updateQBittorrent({ username: e.target.value })} className="bg-base border-border" /></div>
                           <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-1">Pass</Label>
                           <Input type="password" value={qbittorrent.password} onChange={e => updateQBittorrent({ password: e.target.value })} className="bg-base border-border" /></div>
                        </div>
                     </div>
                  </div>
                )}
                {!sonarr.enabled && !radarr.enabled && !prowlarr.enabled && !qbittorrent.enabled && (
                  <div className="col-span-full py-12 text-center text-muted-foreground/30 italic font-black uppercase tracking-widest text-xs">
                     No services commissioned. Continuing to thematic calibration...
                  </div>
                )}
             </div>

             <div className="flex justify-between items-center pt-8 border-t border-border">
                <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground uppercase font-black italic tracking-widest">
                   <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={nextStep} className="text-muted-foreground hover:text-foreground uppercase font-black italic tracking-widest text-[10px]">
                     Set up later
                  </Button>
                  <Button onClick={nextStep} className="h-14 px-10 bg-accent hover:bg-accent/90 text-foreground font-black italic uppercase tracking-widest rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95">
                     Connect Fleet
                  </Button>
                </div>
             </div>
          </div>
        )}

        {step === 'sync' && (
          <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
             <div className="space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">Thematic <span className="text-accent">Calibration</span></h2>
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] italic">Select your visual command profile</p>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'matrix', name: 'Emerald (Matrix)', bg: '#0d1117', accent: '#00d084' },
                  { id: 'obsidian', name: 'Obsidian', bg: '#0a0a0a', accent: '#00b4d8' },
                  { id: 'void', name: 'Void', bg: '#0d1117', accent: '#3b82f6' },
                  { id: 'nebula', name: 'Nebula', bg: '#13112a', accent: '#ff0090' },
                  { id: 'glacier', name: 'Glacier', bg: '#0f172a', accent: '#38bdf8' },
                  { id: 'ghost', name: 'Ghost', bg: '#f8fafc', accent: '#1971c2' },
                ].map((t) => (
                  <button key={t.id} onClick={() => updateSetting('theme', t.id as any)}
                    className={cn("p-4 border rounded-2xl transition-all flex flex-col items-center gap-3 relative overflow-hidden group hover:scale-[1.02]", theme === t.id ? "bg-surface border-accent shadow-[0_0_20px_rgba(0,180,216,0.1)]" : "bg-surface/40 border-border hover:border-border/60")}>
                    {theme === t.id && (
                      <div className="absolute top-2 right-2 bg-accent text-foreground p-1 rounded-full"><Check size={8} /></div>
                    )}
                    <div className="w-full h-12 rounded-lg border border-border flex gap-1 overflow-hidden">
                       <div className="flex-1" style={{ backgroundColor: t.bg }} />
                       <div className="w-4" style={{ backgroundColor: t.accent }} />
                    </div>
                    <span className={cn("text-[9px] font-black uppercase italic tracking-widest", theme === t.id ? "text-accent" : "text-muted-foreground")}>{t.name}</span>
                  </button>
                ))}
             </div>

             <div className="flex justify-between items-center pt-8 border-t border-border">
                <Button variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-foreground uppercase font-black italic tracking-widest">
                   <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                <Button onClick={nextStep} className="h-14 px-10 bg-accent hover:bg-accent/90 text-foreground font-black italic uppercase tracking-widest rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95">
                   Confirm Protocol
                </Button>
             </div>
          </div>
        )}

        {step === 'handshake' && (
          <div className="space-y-12 text-center animate-in zoom-in-95 duration-700">
             <div className="space-y-4">
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                   <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping opacity-20" />
                   <div className="h-24 w-24 bg-accent/10 border-2 border-accent/40 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,188,255,0.2)]">
                      <Shield className="h-10 w-10 text-accent" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground">Deck <span className="text-accent underline decoration-4 underline-offset-8">Secured</span></h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] italic">Handshake protocol finalized. Mission logic verified.</p>
                </div>
             </div>

             <div className="bg-surface border border-border rounded-3xl p-8 max-w-xl mx-auto grid grid-cols-2 gap-6 text-left">
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Command Theme</p>
                   <p className="text-accent font-black uppercase text-xs italic tracking-tighter">{theme.toUpperCase()}</p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Operational Nodes</p>
                   <p className="text-foreground font-black uppercase text-xs italic tracking-tighter">
                     {[sonarr, radarr, prowlarr, qbittorrent].filter(s => s.enabled).length} ACTIVE
                   </p>
                </div>
             </div>

             <Button size="lg" onClick={finalize} disabled={loading} className="w-full max-w-sm h-16 bg-accent hover:bg-accent/90 text-foreground font-black italic uppercase tracking-widest text-lg group rounded-2xl shadow-[0_0_30px_rgba(0,188,255,0.3)] transition-all hover:scale-105 active:scale-95">
                {loading ? 'Booting...' : 'Enter Mission Control'} <Power className="ml-2 h-5 w-5" />
              </Button>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 left-8 hidden md:flex items-center gap-4 text-muted-foreground/30">
        <div className="flex items-center gap-2">
          <Cpu className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">CORTEX LINK ACTIVE</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em]">TELEMETRY NOMINAL</span>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-8 text-muted-foreground/30">
         <span className="text-[8px] font-black uppercase tracking-[0.3em]">ARRDECK VERSION {import.meta.env.VITE_APP_VERSION} // INITIAL INDUCTION</span>
      </div>
    </div>
  );
}
