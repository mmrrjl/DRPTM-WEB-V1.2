import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subHours } from "date-fns";
import type { SensorReading } from "@shared/schema";

interface SeparateSensorChartsProps {
  data: SensorReading[];
  isLoading: boolean;
}

// Temperature Chart Component
function TemperatureChart({
  data,
  isLoading,
  range,
}: {
  data: SensorReading[];
  isLoading: boolean;
  range: string;
}) {
  const getFilteredData = () => {
    const now = new Date();
    let cutoff = now;
    if (range === "24h") cutoff = subHours(now, 24);
    else if (range === "7d") cutoff = subHours(now, 24 * 7);
    else if (range === "30d") cutoff = subHours(now, 24 * 30);

    return data
      .filter((reading) => new Date(reading.timestamp) >= cutoff)
      .map((reading) => ({
        timestamp: reading.timestamp,
        temperature: reading.temperature,
        time: format(new Date(reading.timestamp), "HH:mm"),
      }))
      .reverse();
  };

  const chartData = getFilteredData();

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
          Temperature (°C)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px]" aria-live="polite">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No temperature data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickMargin={8}
                  height={40}
                />
                <YAxis stroke="#64748b" fontSize={10} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number) => [
                    `${value.toFixed(1)}°C`,
                    "Temperature",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
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

// pH Chart Component
function PHChart({
  data,
  isLoading,
  range,
}: {
  data: SensorReading[];
  isLoading: boolean;
  range: string;
}) {
  const getFilteredData = () => {
    const now = new Date();
    let cutoff = now;
    if (range === "24h") cutoff = subHours(now, 24);
    else if (range === "7d") cutoff = subHours(now, 24 * 7);
    else if (range === "30d") cutoff = subHours(now, 24 * 30);

    return data
      .filter((reading) => new Date(reading.timestamp) >= cutoff)
      .map((reading) => ({
        timestamp: reading.timestamp,
        ph: reading.ph,
        time: format(new Date(reading.timestamp), "HH:mm"),
      }))
      .reverse();
  };

  const chartData = getFilteredData();

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
          pH Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px]" aria-live="polite">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No pH data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickMargin={8}
                  height={40}
                />
                <YAxis stroke="#64748b" fontSize={10} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number) => [`${value.toFixed(1)}`, "pH"]}
                />
                <Line
                  type="monotone"
                  dataKey="ph"
                  stroke="#8b5cf6"
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

// TDS Chart Component
function TDSChart({
  data,
  isLoading,
  range,
}: {
  data: SensorReading[];
  isLoading: boolean;
  range: string;
}) {
  const getFilteredData = () => {
    const now = new Date();
    let cutoff = now;
    if (range === "24h") cutoff = subHours(now, 24);
    else if (range === "7d") cutoff = subHours(now, 24 * 7);
    else if (range === "30d") cutoff = subHours(now, 24 * 30);

    return data
      .filter((reading) => new Date(reading.timestamp) >= cutoff)
      .map((reading) => ({
        timestamp: reading.timestamp,
        tdsLevel: reading.tdsLevel,
        time: format(new Date(reading.timestamp), "HH:mm"),
      }))
      .reverse();
  };

  const chartData = getFilteredData();

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
          TDS Level (ppm)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px]" aria-live="polite">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No TDS data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickMargin={8}
                  height={40}
                />
                <YAxis stroke="#64748b" fontSize={10} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number) => [
                    `${value.toFixed(0)} ppm`,
                    "TDS Level",
                  ]}
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

// Main Component with Range Selector
export default function SeparateSensorCharts({
  data,
  isLoading,
}: SeparateSensorChartsProps) {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div className="space-y-6">
      {/* Range Selector */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Time Range:</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "24h" | "7d" | "30d")}
            className="border rounded px-3 py-1 text-sm bg-white shadow-sm"
            aria-label="Select data range"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Separate Charts */}
      <div className="flex flex-col gap-6">
        <TemperatureChart data={data} isLoading={isLoading} range={range} />
        <PHChart data={data} isLoading={isLoading} range={range} />
        <TDSChart data={data} isLoading={isLoading} range={range} />
      </div>
    </div>
  );
}
