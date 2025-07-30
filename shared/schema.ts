import { z } from "zod";

export const sensorReading = {
  id: z.string(),
  timestamp: z.string(),
  temperature: z.number(),
  humidity: z.number(),
  ph: z.number(),
  waterLevel: z.number(),
  createdAt: z.string(),
};

export const insertSensorReadingSchema = z.object({
  temperature: z.number().min(-50).max(100),
  humidity: z.number().min(0).max(100),
  ph: z.number().min(0).max(14),
  waterLevel: z.number().min(0).max(100),
});

export const systemStatus = {
  id: z.string(),
  connectionStatus: z.enum(['connected', 'disconnected', 'error']),
  lastUpdate: z.string(),
  dataPoints: z.number(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  storageUsage: z.number(),
  uptime: z.string(),
};

export const alertSettings = {
  temperatureAlerts: z.boolean(),
  phAlerts: z.boolean(),
  waterLevelAlerts: z.boolean(),
};

export const insertAlertSettingsSchema = z.object({
  temperatureAlerts: z.boolean(),
  phAlerts: z.boolean(),
  waterLevelAlerts: z.boolean(),
});

export type SensorReading = z.infer<typeof sensorReading>;
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SystemStatus = z.infer<typeof systemStatus>;
export type AlertSettings = z.infer<typeof alertSettings>;
export type InsertAlertSettings = z.infer<typeof insertAlertSettingsSchema>;
