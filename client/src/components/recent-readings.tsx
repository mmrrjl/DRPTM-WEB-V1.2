import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { exportData } from "@/lib/api";
import { format } from "date-fns";
import type { SensorReading } from "@shared/schema";

interface RecentReadingsProps {
  data: SensorReading[];
  isLoading: boolean;
}

export default function RecentReadings({ data, isLoading }: RecentReadingsProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      await exportData('csv');
      toast({
        title: "Data exported successfully",
        description: "Sensor data has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export sensor data.",
        variant: "destructive",
      });
    }
  };

  const recentData = data.slice(0, 10); // Show last 10 readings

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Readings</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : recentData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No sensor readings available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Time</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">Temp</th>

                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">pH</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider pb-3">TDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentData.map((reading) => (
                  <tr key={reading.id}>
                    <td className="py-3 text-sm text-slate-600">
                      {format(new Date(reading.timestamp), "HH:mm")}
                    </td>
                    <td className="py-3 text-sm text-slate-900">
                      {reading.temperature.toFixed(1)}°C
                    </td>

                    <td className="py-3 text-sm text-slate-900">
                      {reading.ph.toFixed(1)}
                    </td>
                    <td className="py-3 text-sm text-slate-900">
                      {reading.tdsLevel.toFixed(0)} ppm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
