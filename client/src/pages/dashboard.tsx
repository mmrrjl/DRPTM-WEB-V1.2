import { useQuery } from "@tanstack/react-query";
import { Sprout, Settings, Cpu } from "lucide-react";
import StatusCard from "@/components/status-card";
import TemperatureChart from "@/components/temperature-chart";
import MultiMetricChart from "@/components/multi-metric-chart";
import RecentReadings from "@/components/recent-readings";
import SystemInfo from "@/components/system-info";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { syncAntaresData } from "@/lib/api";
import type { SensorReading, SystemStatus } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: sensorReadings = [], isLoading: readingsLoading } = useQuery<SensorReading[]>({
    queryKey: ["/api/sensor-readings"],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: latestReading } = useQuery<SensorReading | null>({
    queryKey: ["/api/sensor-readings/latest"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system-status"],
    refetchInterval: 30000,
  });

  const handleSyncData = async () => {
    try {
      await syncAntaresData();
      toast({
        title: "Data synced successfully",
        description: "Latest sensor data has been retrieved from Antares.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync data from Antares API.",
        variant: "destructive",
      });
    }
  };

  const getOptimalityStatus = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return "optimal";
    if (Math.abs(value - min) < Math.abs(value - max)) return "low";
    return "high";
  };

  const getTemperatureStatus = (temp: number) => getOptimalityStatus(temp, 22, 26);
  const getHumidityStatus = (humidity: number) => getOptimalityStatus(humidity, 60, 70);
  const getPhStatus = (ph: number) => getOptimalityStatus(ph, 5.5, 6.5);
  const getWaterLevelStatus = (level: number) => level > 20 ? "optimal" : "low";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sprout className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-slate-900">HydroMonitor</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    systemStatus?.connectionStatus === 'connected' 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-red-500'
                  }`} />
                  <span>
                    {systemStatus?.connectionStatus === 'connected' 
                      ? 'Connected to Antares' 
                      : 'Disconnected from Antares'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                <Cpu className="h-4 w-4 text-slate-400" />
                <span>Raspberry Pi 4B</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncData}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Sync Data
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Temperature"
            value={latestReading?.temperature ?? 0}
            unit="°C"
            icon="thermometer"
            trend={sensorReadings.length >= 2 ? latestReading!.temperature - sensorReadings[1].temperature : 0}
            status={latestReading ? getTemperatureStatus(latestReading.temperature) : "unknown"}
            optimalRange="22-26°C"
          />
          <StatusCard
            title="Humidity"
            value={latestReading?.humidity ?? 0}
            unit="%"
            icon="droplet"
            trend={sensorReadings.length >= 2 ? latestReading!.humidity - sensorReadings[1].humidity : 0}
            status={latestReading ? getHumidityStatus(latestReading.humidity) : "unknown"}
            optimalRange="60-70%"
          />
          <StatusCard
            title="pH Level"
            value={latestReading?.ph ?? 0}
            unit=""
            icon="flask"
            trend={sensorReadings.length >= 2 ? latestReading!.ph - sensorReadings[1].ph : 0}
            status={latestReading ? getPhStatus(latestReading.ph) : "unknown"}
            optimalRange="5.5-6.5"
          />
          <StatusCard
            title="Water Level"
            value={latestReading?.waterLevel ?? 0}
            unit="%"
            icon="waves"
            trend={sensorReadings.length >= 2 ? latestReading!.waterLevel - sensorReadings[1].waterLevel : 0}
            status={latestReading ? getWaterLevelStatus(latestReading.waterLevel) : "unknown"}
            optimalRange="Minimum: 20%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TemperatureChart data={sensorReadings} isLoading={readingsLoading} />
          <MultiMetricChart data={sensorReadings} isLoading={readingsLoading} />
        </div>

        {/* Detailed Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReadings data={sensorReadings} isLoading={readingsLoading} />
          <SystemInfo systemStatus={systemStatus} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-slate-600">
              © 2024 HydroMonitor - Raspberry Pi Hydroponic System
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span>v1.2.0</span>
              <span>•</span>
              <a href="#" className="hover:text-slate-700 transition-colors">Documentation</a>
              <span>•</span>
              <a href="#" className="hover:text-slate-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
