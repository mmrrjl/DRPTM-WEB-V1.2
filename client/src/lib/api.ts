  import { apiRequest } from "./queryClient";

export async function syncAntaresData() {
  const response = await apiRequest("POST", "/api/sync-antares");
  return response.json();
}

export async function exportData(format: 'json' | 'csv' = 'json', startTime?: string, endTime?: string) {
  const params = new URLSearchParams();
  params.append('format', format);
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);
  
  const response = await apiRequest("GET", `/api/export-data?${params}`);
  
  if (format === 'csv') {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sensor-data.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sensor-data.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export async function updateAlertSettings(settings: {
  temperatureAlerts: boolean;
  phAlerts: boolean;
  waterLevelAlerts: boolean;
}) {
  const response = await apiRequest("PUT", "/api/alert-settings", settings);
  return response.json();
}
