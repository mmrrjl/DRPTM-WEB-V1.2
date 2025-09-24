import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import {
  insertSensorReadingSchema,
  insertAlertSettingsSchema,
} from "@shared/schema.js";
import { antaresService } from "./services/antares.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get recent sensor readings
  app.get("/api/sensor-readings", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const readings = await storage.getSensorReadings(limit);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching sensor readings:", error);
      res.status(500).json({ error: "Failed to fetch sensor readings" });
    }
  });

  // Get sensor readings by time range
  app.get("/api/sensor-readings/range", async (req, res) => {
    try {
      const { startTime, endTime } = req.query;

      if (!startTime || !endTime) {
        return res
          .status(400)
          .json({ error: "startTime and endTime are required" });
      }

      const readings = await storage.getSensorReadingsByTimeRange(
        startTime as string,
        endTime as string,
      );
      res.json(readings);
    } catch (error) {
      console.error("Error fetching sensor readings by range:", error);
      res.status(500).json({ error: "Failed to fetch sensor readings" });
    }
  });

  // Get latest sensor reading
  app.get("/api/sensor-readings/latest", async (req, res) => {
    try {
      const readings = await storage.getSensorReadings(1);
      const latest = readings[0] || null;
      res.json(latest);
    } catch (error) {
      console.error("Error fetching latest sensor reading:", error);
      res.status(500).json({ error: "Failed to fetch latest sensor reading" });
    }
  });

  // Create new sensor reading (for manual data entry or testing)
  app.post("/api/sensor-readings", async (req, res) => {
    try {
      const validatedData = insertSensorReadingSchema.parse(req.body);
      const reading = await storage.createSensorReading(validatedData);
      res.status(201).json(reading);
    } catch (error) {
      console.error("Error creating sensor reading:", error);
      res.status(400).json({ error: "Invalid sensor reading data" });
    }
  });

  // Sync data from Antares API
  app.post("/api/sync-antares", async (req, res) => {
    try {
      const antaresData = await antaresService.fetchLatestData();

      if (!antaresData) {
        await storage.updateSystemStatus({ connectionStatus: "error" });
        return res
          .status(503)
          .json({ error: "Failed to fetch data from Antares API" });
      }

      const reading = await storage.createSensorReading(antaresData);
      await storage.updateSystemStatus({
        connectionStatus: "connected",
        lastUpdate: new Date().toISOString(),
      });

      res.json({ success: true, reading });
    } catch (error) {
      console.error("Error syncing with Antares:", error);
      await storage.updateSystemStatus({ connectionStatus: "error" });
      res.status(500).json({ error: "Failed to sync with Antares API" });
    }
  });

  // Get system status
  app.get("/api/system-status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      console.error("Error fetching system status:", error);
      res.status(500).json({ error: "Failed to fetch system status" });
    }
  });

  // Get alert settings
  app.get("/api/alert-settings", async (req, res) => {
    try {
      const settings = await storage.getAlertSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching alert settings:", error);
      res.status(500).json({ error: "Failed to fetch alert settings" });
    }
  });

  // Update alert settings
  app.put("/api/alert-settings", async (req, res) => {
    try {
      const validatedSettings = insertAlertSettingsSchema.parse(req.body);
      const settings = await storage.updateAlertSettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error updating alert settings:", error);
      res.status(400).json({ error: "Invalid alert settings data" });
    }
  });

  // Test hex decoding endpoint
  app.post("/api/test-decode", async (req, res) => {
    try {
      console.log("=== TEST DECODE REQUEST ===");
      console.log("Request body:", req.body);
      
      const { data } = req.body;
      if (!data) {
        console.log("No data field provided");
        return res.status(400).json({ error: "Data field is required" });
      }

      console.log("Hex data to decode:", data);

      // Test the hex decoding with the provided data
      const decodedData = antaresService.testDecode(data);
      console.log("Decoded data:", decodedData);
      
      // Manual calculation for verification
      const tempHex = data.substr(0, 4);
      const phHex = data.substr(4, 4);
      const tdsHex = data.substr(8, 4);
      
      const tempDecimal = parseInt(tempHex, 16);
      const phDecimal = parseInt(phHex, 16);
      const tdsDecimal = parseInt(tdsHex, 16);

      const result = {
        success: true,
        originalHex: data,
        decodedData,
        manualDecoding: {
          temperature: {
            hex: tempHex,
            decimal: tempDecimal,
            valueDiv10: tempDecimal / 10,
            valueDiv100: tempDecimal / 100,
            // Try different conversion methods
            signedInt16: tempDecimal > 32767 ? tempDecimal - 65536 : tempDecimal,
            signedDiv10: (tempDecimal > 32767 ? tempDecimal - 65536 : tempDecimal) / 10,
            signedDiv100: (tempDecimal > 32767 ? tempDecimal - 65536 : tempDecimal) / 100,
          },
          ph: {
            hex: phHex,
            decimal: phDecimal,
            valueDiv10: phDecimal / 10,
            valueDiv100: phDecimal / 100,
          },
          tds: {
            hex: tdsHex,
            decimal: tdsDecimal,
            valueDiv10: tdsDecimal / 10,
            valueDiv100: tdsDecimal / 100,
          }
        }
      };

      console.log("Response result:", JSON.stringify(result, null, 2));
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } catch (error) {
      console.error("Error testing decode:", error);
      res.status(500).json({ error: "Failed to decode hex data" });
    }
  });

  // Export sensor data
  app.get("/api/export-data", async (req, res) => {
    try {
      const { format = "json", startTime, endTime } = req.query;

      let readings;
      if (startTime && endTime) {
        readings = await storage.getSensorReadingsByTimeRange(
          startTime as string,
          endTime as string,
        );
      } else {
        readings = await storage.getSensorReadings(1000); // Export last 1000 readings
      }

      if (format === "csv") {
        const csvHeaders = "timestamp,temperature,ph,tdsLevel\n";
        const csvData = readings
          .map((r) => `${r.timestamp},${r.temperature},${r.ph},${r.tdsLevel}`)
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=sensor-data.csv",
        );
        res.send(csvHeaders + csvData);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=sensor-data.json",
        );
        res.json(readings);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);

  // Set up periodic data collection from Antares
  setInterval(async () => {
    try {
      const antaresData = await antaresService.fetchLatestData();
      if (antaresData) {
        await storage.createSensorReading(antaresData);
        await storage.updateSystemStatus({
          connectionStatus: "connected",
          lastUpdate: new Date().toISOString(),
        });
      } else {
        await storage.updateSystemStatus({ connectionStatus: "error" });
      }
    } catch (error) {
      console.error("Error in periodic data collection:", error);
      await storage.updateSystemStatus({ connectionStatus: "error" });
    }
  }, 10000); // Collect data every 5 minutes

  return httpServer;
}
