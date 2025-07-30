import { ArrowUp, ArrowDown, Minus, Thermometer, Droplet, FlaskConical, Waves, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: number;
  unit: string;
  icon: "thermometer" | "droplet" | "flask" | "waves";
  trend: number;
  status: "optimal" | "low" | "high" | "unknown";
  optimalRange: string;
}

const iconMap = {
  thermometer: Thermometer,
  droplet: Droplet,
  flask: FlaskConical,
  waves: Waves,
};

const statusColorMap = {
  optimal: "text-green-600 bg-green-100",
  low: "text-blue-600 bg-blue-100",
  high: "text-yellow-600 bg-yellow-100",
  unknown: "text-gray-600 bg-gray-100",
};

const statusIndicatorMap = {
  optimal: { icon: CheckCircle, text: "Good", color: "text-green-600" },
  low: { icon: ArrowDown, text: "Low", color: "text-blue-600" },
  high: { icon: AlertTriangle, text: "Alert", color: "text-yellow-600" },
  unknown: { icon: Minus, text: "Unknown", color: "text-gray-600" },
};

export default function StatusCard({ title, value, unit, icon, trend, status, optimalRange }: StatusCardProps) {
  const Icon = iconMap[icon];
  const statusIcon = statusIndicatorMap[status].icon;
  const StatusIcon = statusIcon;
  
  const formatValue = (val: number) => {
    if (title === "pH Level") return val.toFixed(1);
    return Math.round(val * 10) / 10;
  };

  const formatTrend = (trend: number) => {
    const abs = Math.abs(trend);
    if (abs < 0.1) return null;
    
    if (title === "pH Level") return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}`;
    return `${trend > 0 ? '+' : ''}${trend.toFixed(1)}${unit}`;
  };

  const trendDisplay = formatTrend(trend);

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${statusColorMap[status]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-medium text-slate-700">{title}</h3>
          </div>
          <div className={`flex items-center space-x-1 text-xs ${statusIndicatorMap[status].color}`}>
            <StatusIcon className="h-3 w-3" />
            <span>{statusIndicatorMap[status].text}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline space-x-1">
            <div className="text-2xl font-semibold text-slate-900">
              {formatValue(value)}
            </div>
            <div className="text-lg text-slate-600">{unit}</div>
            {trendDisplay && (
              <div className={`flex items-center text-xs ml-2 ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend > 0 ? <ArrowUp className="h-3 w-3" /> : trend < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                <span>{trendDisplay}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500">Optimal: {optimalRange}</div>
        </div>
      </CardContent>
    </Card>
  );
}
