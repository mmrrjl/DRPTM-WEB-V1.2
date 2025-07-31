import { type SensorReading, type InsertSensorReading, type SystemStatus, type AlertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Sensor readings
  getSensorReadings(limit?: number): Promise<SensorReading[]>;
  getSensorReadingsByTimeRange(startTime: string, endTime: string): Promise<SensorReading[]>;
  createSensorReading(reading: InsertSensorReading): Promise<SensorReading>;
  
  // System status
  getSystemStatus(): Promise<SystemStatus>;
  updateSystemStatus(status: Partial<SystemStatus>): Promise<SystemStatus>;
  
  // Alert settings
  getAlertSettings(): Promise<AlertSettings>;
  updateAlertSettings(settings: AlertSettings): Promise<AlertSettings>;
}

export class MemStorage implements IStorage {
  private sensorReadings: Map<string, SensorReading>;
  private systemStatus: SystemStatus;
  private alertSettings: AlertSettings;

  constructor() {
    this.sensorReadings = new Map();
    this.systemStatus = {
      id: randomUUID(),
      connectionStatus: 'connected',
      lastUpdate: new Date().toISOString(),
      dataPoints: 0,
      cpuUsage: 23,
      memoryUsage: 30,
      storageUsage: 26,
      uptime: '3d 14h 22m',
    };
    this.alertSettings = {
      temperatureAlerts: true,
      phAlerts: true,
      tdsLevelAlerts: false,
    };
  }

  async getSensorReadings(limit = 50): Promise<SensorReading[]> {
    const readings = Array.from(this.sensorReadings.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    return readings;
  }

  async getSensorReadingsByTimeRange(startTime: string, endTime: string): Promise<SensorReading[]> {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    return Array.from(this.sensorReadings.values())
      .filter(reading => {
        const readingTime = new Date(reading.timestamp).getTime();
        return readingTime >= start && readingTime <= end;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createSensorReading(insertReading: InsertSensorReading): Promise<SensorReading> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const reading: SensorReading = {
      id,
      timestamp,
      createdAt: timestamp,
      ...insertReading,
    };
    
    this.sensorReadings.set(id, reading);
    
    // Update system status
    this.systemStatus.dataPoints = this.sensorReadings.size;
    this.systemStatus.lastUpdate = timestamp;
    
    return reading;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return { ...this.systemStatus };
  }

  async updateSystemStatus(status: Partial<SystemStatus>): Promise<SystemStatus> {
    this.systemStatus = { ...this.systemStatus, ...status };
    return { ...this.systemStatus };
  }

  async getAlertSettings(): Promise<AlertSettings> {
    return { ...this.alertSettings };
  }

  async updateAlertSettings(settings: AlertSettings): Promise<AlertSettings> {
    this.alertSettings = { ...settings };
    return { ...this.alertSettings };
  }
}

export const storage = new MemStorage();
