import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { updateAlertSettings } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import type { SystemStatus, AlertSettings } from "@shared/schema";

interface SystemInfoProps {
  systemStatus?: SystemStatus;
}

export default function SystemInfo({ systemStatus }: SystemInfoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alertSettings } = useQuery<AlertSettings>({
    queryKey: ["/api/alert-settings"],
  });

  const [localSettings, setLocalSettings] = useState<AlertSettings>({
    temperatureAlerts: alertSettings?.temperatureAlerts ?? true,
    phAlerts: alertSettings?.phAlerts ?? true,
    waterLevelAlerts: alertSettings?.waterLevelAlerts ?? false,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateAlertSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alert-settings"] });
      toast({
        title: "Settings saved",
        description: "Alert preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to update alert settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const formatUptime = (uptime: string) => {
    // If uptime is in format "3d 14h 22m", return as is
    if (uptime.includes('d') || uptime.includes('h') || uptime.includes('m')) {
      return uptime;
    }
    // Otherwise try to format as distance to now
    try {
      return formatDistanceToNow(new Date(uptime), { addSuffix: false });
    } catch {
      return uptime;
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">System Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="border-b border-slate-100 pb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Connection Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Antares API</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemStatus?.connectionStatus === 'connected' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    systemStatus?.connectionStatus === 'connected' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {systemStatus?.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last Update</span>
                <span className="text-sm text-slate-900">
                  {systemStatus?.lastUpdate 
                    ? formatDistanceToNow(new Date(systemStatus.lastUpdate), { addSuffix: true })
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Data Points</span>
                <span className="text-sm text-slate-900">
                  {systemStatus?.dataPoints?.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="border-b border-slate-100 pb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Device Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">CPU Usage</span>
                <span className="text-sm text-slate-900">
                  {systemStatus?.cpuUsage ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Memory</span>
                <span className="text-sm text-slate-900">
                  {systemStatus?.memoryUsage ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Storage</span>
                <span className="text-sm text-slate-900">
                  {systemStatus?.storageUsage ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Uptime</span>
                <span className="text-sm text-slate-900">
                  {systemStatus?.uptime ? formatUptime(systemStatus.uptime) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Alert Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="temperature-alerts"
                  checked={localSettings.temperatureAlerts}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, temperatureAlerts: Boolean(checked) }))
                  }
                />
                <label htmlFor="temperature-alerts" className="text-sm text-slate-600">
                  Temperature alerts
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="ph-alerts"
                  checked={localSettings.phAlerts}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, phAlerts: Boolean(checked) }))
                  }
                />
                <label htmlFor="ph-alerts" className="text-sm text-slate-600">
                  pH level warnings
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="water-level-alerts"
                  checked={localSettings.waterLevelAlerts}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, waterLevelAlerts: Boolean(checked) }))
                  }
                />
                <label htmlFor="water-level-alerts" className="text-sm text-slate-600">
                  Water level notifications
                </label>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
