import { z } from "zod";

export const sensorReadingSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  temperature: z.number(),
  ph: z.number(),
  tdsLevel: z.number(),
  createdAt: z.string(),
});

export const insertSensorReadingSchema = z.object({
  temperature: z.number().min(-50).max(100),
  ph: z.number().min(0).max(14),
  tdsLevel: z.number().min(0).max(2000),
});

export const systemStatusSchema = z.object({
  id: z.string(),
  connectionStatus: z.enum(['connected', 'disconnected', 'error']),
  lastUpdate: z.string(),
  dataPoints: z.number(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  storageUsage: z.number(),
  uptime: z.string(),
});

export const alertSettingsSchema = z.object({
  temperatureAlerts: z.boolean(),
  phAlerts: z.boolean(),
  tdsLevelAlerts: z.boolean(),
});

export const insertAlertSettingsSchema = z.object({
  temperatureAlerts: z.boolean(),
  phAlerts: z.boolean(),
  tdsLevelAlerts: z.boolean(),
});

export type SensorReading = z.infer<typeof sensorReadingSchema>;
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SystemStatus = z.infer<typeof systemStatusSchema>;
export type AlertSettings = z.infer<typeof alertSettingsSchema>;
export type InsertAlertSettings = z.infer<typeof insertAlertSettingsSchema>;
