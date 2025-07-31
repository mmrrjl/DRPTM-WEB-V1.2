import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subHours } from "date-fns";
import type { SensorReading } from "@shared/schema";

interface MultiMetricChartProps {
  data: SensorReading[];
  isLoading: boolean;
}

export default function MultiMetricChart({ data, isLoading }: MultiMetricChartProps) {
  const getFilteredData = () => {
    const now = new Date();
    const cutoff = subHours(now, 24); // Show last 24 hours

    return data
      .filter(reading => new Date(reading.timestamp) >= cutoff)
      .map(reading => ({
        timestamp: reading.timestamp,
        temperature: reading.temperature,

        ph: reading.ph * 10, // Scale pH for better visualization
        tdsLevel: reading.tdsLevel / 10, // Scale TDS for better visualization (ppm/10)
        time: format(new Date(reading.timestamp), "HH:mm"),
      }))
      .reverse();
  };

  const chartData = getFilteredData();

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Multi-Metric View</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span className="text-slate-600">Temperature</span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              <span className="text-slate-600">pH (×10)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-slate-600">TDS Level (÷10)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No sensor data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number, name: string) => {
                    if (name === 'ph') {
                      return [`${(value / 10).toFixed(1)}`, 'pH'];
                    } else if (name === 'temperature') {
                      return [`${value.toFixed(1)}°C`, 'Temperature'];
                    } else if (name === 'tdsLevel') {
                      return [`${(value * 10).toFixed(0)} ppm`, 'TDS Level'];
                    }
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="ph"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tdsLevel"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
