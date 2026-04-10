import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { createApiClient } from '../services/api-client';
import { getQbtClient } from '../services/qbittorrent.service';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { cn } from '../lib/utils';
import { Check, Palette, Monitor, Sun, Moon, Layers, Boxes } from 'lucide-react';

export function SettingsPage() {
  const {
    sonarr, radarr, prowlarr, qbittorrent, theme, startupPage, defaultView,
    updateSonarr, updateRadarr, updateProwlarr, updateQBittorrent, updateSetting
  } = useSettings();

  const [testingSonarr, setTestingSonarr] = useState(false);
  const [testingRadarr, setTestingRadarr] = useState(false);
  const [testingProwlarr, setTestingProwlarr] = useState(false);
  const [testingQbt, setTestingQbt] = useState(false);

  const themes = [
    { id: 'minimal', name: 'Minimal', bg: '#0a0a0a', accent: '#00b4d8', label: 'Dark / Cyan' },
    { id: 'swizzin', name: 'Swizzin', bg: '#0a0b0c', accent: '#00d084', label: 'Dark / Emerald' },
    { id: 'autobrr', name: 'autobrr', bg: '#0e1012', accent: '#3b82f6', label: 'Dark / Indigo' },
    { id: 'kyle', name: 'The Kyle', bg: '#0d0b13', accent: '#ff0090', label: 'Dark / Magenta' },
    { id: 'nightwalker', name: 'Nightwalker', bg: '#0f172a', accent: '#38bdf8', label: 'Dark / Ocean' },
    { id: 'napster', name: 'Pristine (Napster)', bg: '#f1f3f5', accent: '#1971c2', label: 'Light / Blue' },
  ];

  const testConnection = async (
    service: 'sonarr' | 'radarr' | 'prowlarr',
    config: { baseUrl: string; apiKey: string }
  ) => {
    try {
      if (service === 'sonarr') setTestingSonarr(true);
      if (service === 'radarr') setTestingRadarr(true);
      if (service === 'prowlarr') setTestingProwlarr(true);

      const client = createApiClient(config.baseUrl, config.apiKey);
      const url = service === 'prowlarr' ? '/api/v1/system/status' : '/api/v3/system/status';
      const res = await client.get(url);
      
      toast.success(`${service.toUpperCase()} Connected! Version: ${res.data.version}`);
    } catch (err: any) {
      toast.error(`${service.toUpperCase()} Connection Failed: ${err.message}`);
    } finally {
      if (service === 'sonarr') setTestingSonarr(false);
      if (service === 'radarr') setTestingRadarr(false);
      if (service === 'prowlarr') setTestingProwlarr(false);
    }
  };

  const testQbtConnection = async () => {
    try {
      setTestingQbt(true);
      const client = getQbtClient(qbittorrent.baseUrl);
      if (!client) throw new Error('Invalid Base URL');
      
      const success = await client.login(qbittorrent.username, qbittorrent.password);
      if (success) {
        const version = await client.getVersion();
        toast.success(`qBittorrent Connected! Version: ${version}`);
      } else {
        toast.error('qBittorrent Login Failed: Check username/password');
      }
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
      
      if (msg.includes('CSRF')) {
        toast.error('Security Blocked', {
          description: 'qBittorrent rejected the request. Please disable "Web UI CSRF protection" and "Host header validation" in qBittorrent settings.',
          duration: 10000,
        });
      } else {
        toast.error(`qBittorrent Connection Failed: ${msg}`);
      }
    } finally {
      setTestingQbt(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          System <span className="text-accent underline decoration-4 underline-offset-4">Terminal</span>
        </h1>
        <p className="text-white/60 font-medium tracking-tight italic uppercase text-[11px]">
          Central configuration and thematic bridge
        </p>
      </div>

      <Tabs defaultValue="services" className="space-y-8">
        <TabsList className="bg-[#0B0C0E]/50 border border-white/5 p-1 h-12 rounded-xl backdrop-blur-sm">
          <TabsTrigger value="services" className="data-[state=active]:bg-white/5 data-[state=active]:text-white font-black uppercase italic tracking-widest text-[10px] h-full px-6">Services</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-white/5 data-[state=active]:text-white font-black uppercase italic tracking-widest text-[10px] h-full px-6">Appearance</TabsTrigger>
          <TabsTrigger value="behaviour" className="data-[state=active]:bg-white/5 data-[state=active]:text-white font-black uppercase italic tracking-widest text-[10px] h-full px-6">Behaviour</TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-white/5 data-[state=active]:text-white font-black uppercase italic tracking-widest text-[10px] h-full px-6">About</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sonarr */}
            <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-sonarr/20 rounded-2xl overflow-hidden shadow-xl group">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-sonarr animate-pulse shadow-[0_0_8px_rgba(0,188,255,0.4)]" />
                        <CardTitle className="text-sonarr font-black uppercase italic tracking-tighter text-xl">Sonarr</CardTitle>
                    </div>
                    <CardDescription className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 italic">TV Dataset Bridge</CardDescription>
                  </div>
                  <Switch 
                    checked={sonarr.enabled}
                    onCheckedChange={(c) => updateSonarr({ enabled: c })}
                    className="data-[state=checked]:bg-sonarr"
                  />
                </div>
              </CardHeader>
              {sonarr.enabled && (
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Base URL</Label>
                    <Input 
                      value={sonarr.baseUrl} 
                      onChange={(e) => updateSonarr({ baseUrl: e.target.value })}
                      placeholder="http://192.168.1.100:8989"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Terminal Key</Label>
                    <Input 
                      type="password"
                      value={sonarr.apiKey} 
                      onChange={(e) => updateSonarr({ apiKey: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button 
                    onClick={() => testConnection('sonarr', sonarr)}
                    disabled={testingSonarr}
                    className="bg-sonarr/10 text-sonarr border-sonarr/20 hover:bg-sonarr/20"
                  >
                    {testingSonarr ? 'Polling...' : 'Test Connection'}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Radarr */}
            <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-radarr/20 rounded-2xl overflow-hidden shadow-xl group">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-radarr animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                        <CardTitle className="text-radarr font-black uppercase italic tracking-tighter text-xl">Radarr</CardTitle>
                    </div>
                    <CardDescription className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 italic">Film Dataset Bridge</CardDescription>
                  </div>
                  <Switch 
                    checked={radarr.enabled}
                    onCheckedChange={(c) => updateRadarr({ enabled: c })}
                    className="data-[state=checked]:bg-radarr"
                  />
                </div>
              </CardHeader>
              {radarr.enabled && (
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Base URL</Label>
                    <Input 
                      value={radarr.baseUrl} 
                      onChange={(e) => updateRadarr({ baseUrl: e.target.value })}
                      placeholder="http://192.168.1.100:7878"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Terminal Key</Label>
                    <Input 
                      type="password"
                      value={radarr.apiKey} 
                      onChange={(e) => updateRadarr({ apiKey: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button 
                    onClick={() => testConnection('radarr', radarr)}
                    disabled={testingRadarr}
                    className="bg-radarr/10 text-radarr border-radarr/20 hover:bg-radarr/20"
                  >
                    {testingRadarr ? 'Polling...' : 'Test Connection'}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Prowlarr */}
            <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-prowlarr/20 rounded-2xl overflow-hidden shadow-xl group">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-prowlarr animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                        <CardTitle className="text-prowlarr font-black uppercase italic tracking-tighter text-xl">Prowlarr</CardTitle>
                    </div>
                    <CardDescription className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 italic">Indexer Protocol Bridge</CardDescription>
                  </div>
                  <Switch 
                    checked={prowlarr.enabled}
                    onCheckedChange={(c) => updateProwlarr({ enabled: c })}
                    className="data-[state=checked]:bg-prowlarr"
                  />
                </div>
              </CardHeader>
              {prowlarr.enabled && (
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Base URL</Label>
                    <Input 
                      value={prowlarr.baseUrl} 
                      onChange={(e) => updateProwlarr({ baseUrl: e.target.value })}
                      placeholder="http://192.168.1.100:9696"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Terminal Key</Label>
                    <Input 
                      type="password"
                      value={prowlarr.apiKey} 
                      onChange={(e) => updateProwlarr({ apiKey: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button 
                    onClick={() => testConnection('prowlarr', prowlarr)}
                    disabled={testingProwlarr}
                    className="bg-prowlarr/10 text-prowlarr border-prowlarr/20 hover:bg-prowlarr/20"
                  >
                    {testingProwlarr ? 'Polling...' : 'Test Connection'}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* qBittorrent */}
            <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-accent/20 rounded-2xl overflow-hidden shadow-xl group">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,180,216,0.4)]" />
                        <CardTitle className="text-accent font-black uppercase italic tracking-tighter text-xl">qBittorrent</CardTitle>
                    </div>
                    <CardDescription className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 italic">Transport Control Layer</CardDescription>
                  </div>
                  <Switch 
                    checked={qbittorrent.enabled}
                    onCheckedChange={(c) => updateQBittorrent({ enabled: c })}
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
              </CardHeader>
              {qbittorrent.enabled && (
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Base URL</Label>
                    <Input 
                      value={qbittorrent.baseUrl} 
                      onChange={(e) => updateQBittorrent({ baseUrl: e.target.value })}
                      placeholder="http://192.168.1.100:8080"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Logistics Username</Label>
                    <Input 
                      value={qbittorrent.username} 
                      onChange={(e) => updateQBittorrent({ username: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Logistics Key</Label>
                    <Input 
                      type="password"
                      value={qbittorrent.password} 
                      onChange={(e) => updateQBittorrent({ password: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <Button 
                    onClick={testQbtConnection}
                    disabled={testingQbt}
                    className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                  >
                    {testingQbt ? 'Polling...' : 'Test Connection'}
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <Palette className="text-accent h-5 w-5" />
                  <div>
                    <CardTitle className="text-white font-black uppercase italic tracking-tighter">Theme Intelligence</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30">Select a structural visual profile</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSetting('theme', t.id as any)}
                    className={cn(
                      "flex flex-col items-start p-4 border rounded-2xl transition-all group relative overflow-hidden",
                      theme === t.id 
                        ? "border-accent bg-accent/5 ring-1 ring-accent" 
                        : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] italic transition-colors",
                        theme === t.id ? "text-accent" : "text-white/40"
                      )}>
                        {t.name}
                      </span>
                      {theme === t.id && <Check className="h-3 w-3 text-accent" />}
                    </div>
                    
                    <div className="flex gap-2 w-full">
                       <div 
                         className="h-12 w-full rounded-lg border border-white/10" 
                         style={{ backgroundColor: t.bg }} 
                       />
                       <div 
                         className="h-12 w-4 rounded-lg shadow-[0_0_10px] transition-all" 
                         style={{ 
                          backgroundColor: t.accent,
                          boxShadow: `0 0 10px ${t.accent}40`
                         }} 
                       />
                    </div>
                    <span className="mt-3 text-[9px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid gap-6 max-w-md pt-6 border-t border-white/5">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-white/40" />
                    <Label className="text-[11px] uppercase font-black tracking-widest text-white/60 italic">Fallback Logic</Label>
                  </div>
                  <Select value={['minimal', 'swizzin', 'autobrr', 'kyle', 'nightwalker', 'napster'].includes(theme) ? 'custom' : theme} onValueChange={(v: any) => {
                    if (v !== 'custom') updateSetting('theme', v);
                  }}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="System Preference" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-3 border-white/10">
                      <SelectItem value="system">Auto System Switch</SelectItem>
                      <SelectItem value="dark">Standard Dark</SelectItem>
                      <SelectItem value="light">Standard Light</SelectItem>
                      <SelectItem value="custom" disabled>Custom Profile Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-white/40" />
                    <Label className="text-[11px] uppercase font-black tracking-widest text-white/60 italic">Core Visualization</Label>
                  </div>
                  <Select value={defaultView} onValueChange={(v: any) => updateSetting('defaultView', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-3 border-white/10">
                      <SelectItem value="grid">Grid Protocol (Posters)</SelectItem>
                      <SelectItem value="list">List Matrix (Table)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behaviour" className="space-y-8">
          <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-white font-black uppercase italic tracking-tighter text-xl">Behaviour Settings</CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-white/30 italic">Initialize startup sequences and polling intervals</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-3 max-w-sm">
                <Label className="text-[10px] uppercase font-black tracking-widest text-white/40">Initial Load Target</Label>
                <Select value={startupPage} onValueChange={(v: any) => updateSetting('startupPage', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-3 border-white/10">
                    <SelectItem value="/">Dashboard Bridge</SelectItem>
                    <SelectItem value="/queue">Downlink Queue</SelectItem>
                    <SelectItem value="/sonarr">Sonarr Interface</SelectItem>
                    <SelectItem value="/radarr">Radarr Interface</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="bg-[#0B0C0E]/50 backdrop-blur-sm border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-white font-black uppercase italic tracking-tighter text-xl">Operational Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="flex items-center gap-6">
                 <div className="h-20 w-20 rounded-3xl bg-accent/20 border border-accent/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,180,216,0.2)]">
                    <Boxes size={40} className="text-accent animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white italic tracking-tighter italic">ArrDeck <span className="text-white/20">v1.16.1</span></h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">A unified high-fidelity dashboard for the *arr fleet.</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="text-white/40 hover:text-white text-[11px] font-black uppercase tracking-widest border-white/10 hover:border-accent/40 hover:bg-accent/5" onClick={() => window.open('https://github.com')}>
                  Open Documentation
                </Button>
                <Button variant="outline" className="text-white/40 hover:text-white text-[11px] font-black uppercase tracking-widest border-white/10 hover:border-accent/40 hover:bg-accent/5" onClick={() => window.open('https://github.com')}>
                  Source Repository
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
