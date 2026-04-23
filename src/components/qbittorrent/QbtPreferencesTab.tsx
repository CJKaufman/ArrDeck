import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQbtClient } from "../../services/qbittorrent.service";
import { useSettingsStore } from "../../stores/settings.store";
import { QBPreferences } from "../../types/qbittorrent.types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Save, Loader2, Gauge, Zap, Globe, Shield } from "lucide-react";
import { toast } from "sonner";

export function QbtPreferencesTab() {
  const { qbittorrent } = useSettingsStore();
  const client = getQbtClient(qbittorrent.baseUrl);
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery<QBPreferences>({
    queryKey: ["qbittorrent", "preferences"],
    queryFn: () => client!.getPreferences(),
    enabled: !!client,
  });

  const [localPrefs, setLocalPrefs] = useState<Partial<QBPreferences>>({});

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const mutation = useMutation({
    mutationFn: (newPrefs: Partial<QBPreferences>) =>
      client!.setPreferences(newPrefs),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["qbittorrent", "preferences"],
      });
      toast.success("Client preferences updated");
    },
    onError: (err: any) => {
      toast.error(`Failed to update settings: ${err.message}`);
    },
  });

  const handleSave = () => {
    mutation.mutate(localPrefs);
  };

  const updateField = (key: keyof QBPreferences, value: any) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-accent h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium group-data-[variant=default]/tabs-list:text-foreground">
            qBittorrent Preferences
          </h3>
          <p className="text-sm text-muted-foreground">
            Adjust your download client's global behavior
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="gap-2 bg-qbittorrent hover:bg-qbittorrent/90 text-foreground"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed Limits */}
        <Card className="bg-surface-2 border-border shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm uppercase tracking-wider opacity-60">
                Global Speed Limits
              </CardTitle>
            </div>
            <CardDescription>
              Overall limits for the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Download Limit (KiB/s)</Label>
              <Input
                type="number"
                value={Math.floor((localPrefs.dl_limit || 0) / 1024)}
                onChange={(e) =>
                  updateField("dl_limit", parseInt(e.target.value) * 1024)
                }
                className="bg-surface-3 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Limit (KiB/s)</Label>
              <Input
                type="number"
                value={Math.floor((localPrefs.up_limit || 0) / 1024)}
                onChange={(e) =>
                  updateField("up_limit", parseInt(e.target.value) * 1024)
                }
                className="bg-surface-3 border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alternative Speed Limits */}
        <Card className="bg-surface-2 border-border shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-status-warn" />
              <CardTitle className="text-sm uppercase tracking-wider opacity-60">
                Alternative Limits
              </CardTitle>
            </div>
            <CardDescription>
              Secondary limits used for scheduling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alt Download Limit (KiB/s)</Label>
              <Input
                type="number"
                value={Math.floor((localPrefs.alt_dl_limit || 0) / 1024)}
                onChange={(e) =>
                  updateField("alt_dl_limit", parseInt(e.target.value) * 1024)
                }
                className="bg-surface-3 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Upload Limit (KiB/s)</Label>
              <Input
                type="number"
                value={Math.floor((localPrefs.alt_up_limit || 0) / 1024)}
                onChange={(e) =>
                  updateField("alt_up_limit", parseInt(e.target.value) * 1024)
                }
                className="bg-surface-3 border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card className="bg-surface-2 border-border shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-qbittorrent" />
              <CardTitle className="text-sm uppercase tracking-wider opacity-60">
                Downloads
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Save Path</Label>
              <Input
                value={localPrefs.save_path || ""}
                onChange={(e) => updateField("save_path", e.target.value)}
                className="bg-surface-3 border-border"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dht">Enable DHT</Label>
              <Switch
                id="dht"
                checked={localPrefs.dht}
                onCheckedChange={(v) => updateField("dht", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pex">Enable PEX</Label>
              <Switch
                id="pex"
                checked={localPrefs.pex}
                onCheckedChange={(v) => updateField("pex", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security / Connections */}
        <Card className="bg-surface-2 border-border shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-status-ok" />
              <CardTitle className="text-sm uppercase tracking-wider opacity-60">
                Connections
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Max Global Connections</Label>
              <Input
                type="number"
                value={localPrefs.max_connec || 0}
                onChange={(e) =>
                  updateField("max_connec", parseInt(e.target.value))
                }
                className="bg-surface-3 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Upload Slots per Torrent</Label>
              <Input
                type="number"
                value={localPrefs.max_uploads_per_torrent || 0}
                onChange={(e) =>
                  updateField(
                    "max_uploads_per_torrent",
                    parseInt(e.target.value),
                  )
                }
                className="bg-surface-3 border-border"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
