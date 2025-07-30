import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subHours, subDays } from "date-fns";
import type { SensorReading } from "@shared/schema";

interface TemperatureChartProps {
  data: SensorReading[];
  isLoading: boolean;
}

type TimeRange = "24h" | "7d" | "30d";

export default function TemperatureChart({ data, isLoading }: TemperatureChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  const getFilteredData = () => {
    const now = new Date();
    let cutoff: Date;
    
    switch (timeRange) {
      case "24h":
        cutoff = subHours(now, 24);
        break;
      case "7d":
        cutoff = subDays(now, 7);
        break;
      case "30d":
        cutoff = subDays(now, 30);
        break;
    }

    return data
      .filter(reading => new Date(reading.timestamp) >= cutoff)
      .map(reading => ({
        timestamp: reading.timestamp,
        temperature: reading.temperature,
        time: format(new Date(reading.timestamp), timeRange === "24h" ? "HH:mm" : "MM/dd"),
      }))
      .reverse();
  };

  const chartData = getFilteredData();

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Temperature Trend</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === "24h" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("24h")}
              className={timeRange === "24h" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              24H
            </Button>
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7d")}
              className={timeRange === "7d" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              7D
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30d")}
              className={timeRange === "30d" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              30D
            </Button>
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
              No temperature data available
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
                  domain={['dataMin - 2', 'dataMax + 2']}
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
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperature']}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
