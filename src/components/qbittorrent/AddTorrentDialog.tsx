import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Plus, Link, FileUp, Loader2 } from 'lucide-react';
import { getQbtClient } from '../../services/qbittorrent.service';
import { useSettingsStore } from '../../stores/settings.store';
import { toast } from 'sonner';

interface Props {
  onSuccess?: () => void;
}

export function AddTorrentDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'url' | 'file'>('url');
  
  // Form State
  const [urls, setUrls] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [savePath, setSavePath] = useState('');
  const [category, setCategory] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [sequential, setSequential] = useState(false);

  const { qbittorrent } = useSettingsStore();
  const client = getQbtClient(qbittorrent.baseUrl);

  const handleAdd = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      if (method === 'url' && !urls.trim()) {
        toast.error('Please enter at least one URL');
        setLoading(false);
        return;
      }

      if (method === 'file' && !file) {
        toast.error('Please select a .torrent file');
        setLoading(false);
        return;
      }

      const options = {
        savepath: savePath || undefined,
        category: category || undefined,
        paused: isPaused,
        sequentialDownload: sequential,
      };

      if (method === 'url') {
        const urlList = urls.split('\n').filter(u => u.trim());
        await client.addTorrent(urlList.join('\n'), undefined, options);
      } else if (file) {
        await client.addTorrent(undefined, file, options);
      }

      toast.success('Torrent added successfully');
      setOpen(false);
      onSuccess?.();
      
      // Reset form
      setUrls('');
      setFile(null);
    } catch (err: any) {
      toast.error(`Failed to add: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2 bg-qbittorrent hover:bg-qbittorrent/90 text-foreground">
            <Plus className="h-4 w-4" /> Add Torrent
          </Button>
        }
      />
      
      <DialogContent className="sm:max-w-[500px] bg-surface-2 border-border">
        <DialogHeader>
          <DialogTitle>Add New Torrent</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="url" onValueChange={(v) => setMethod(v as 'url' | 'file')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2"><Link className="h-4 w-4" /> Link</TabsTrigger>
            <TabsTrigger value="file" className="gap-2"><FileUp className="h-4 w-4" /> File</TabsTrigger>
          </TabsList>

          <div className="py-4 space-y-4">
            <TabsContent value="url" className="mt-0">
              <div className="space-y-2">
                <Label>Magnet Links / URLs (one per line)</Label>
                <textarea 
                  className="w-full h-32 bg-surface-3 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="magnet:?xt=urn:btih:..."
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-0">
              <div className="space-y-2">
                <Label>Select .torrent files</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface-3 hover:bg-surface-3/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".torrent"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-secondary">
                    {file ? file.name : "Click or drag torrent file here"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Save Path (Optional)</Label>
                <Input 
                  placeholder="Defaults to client settings"
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                  className="bg-surface-3 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Category (Optional)</Label>
                <Input 
                  placeholder="e.g. movies, tv"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-surface-3 border-border"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="paused" 
                  checked={isPaused}
                  onCheckedChange={setIsPaused}
                />
                <Label htmlFor="paused">Add Paused</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="sequential" 
                  checked={sequential}
                  onCheckedChange={setSequential}
                />
                <Label htmlFor="sequential">Sequential</Label>
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            className="bg-qbittorrent hover:bg-qbittorrent/90 text-foreground min-w-[100px]"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Torrent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
