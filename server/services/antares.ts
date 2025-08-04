export interface AntaresConfig {
  apiKey: string;
  deviceId: string;
  applicationId: string;
  baseUrl?: string;
}

export interface AntaresData {
  temperature: number;
  ph: number;
  tdsLevel: number;
}

export class AntaresService {
  private config: AntaresConfig;

  constructor(config: AntaresConfig) {
    this.config = {
      baseUrl: 'https://platform.antares.id:8443/~/antares-cse/antares-id',
      ...config,
    };
  }

  async fetchLatestData(): Promise<AntaresData | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/${this.config.applicationId}/${this.config.deviceId}/la`,
        {
          method: 'GET',
          headers: {
            'X-M2M-Origin': this.config.apiKey,
            'Content-Type': 'application/json;ty=4',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Antares API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the Antares response format
      const content = data['m2m:cin']?.con;
      if (!content) {
        throw new Error('Invalid response format from Antares API');
      }

      // Parse the sensor data (assuming JSON format)
      const sensorData = typeof content === 'string' ? JSON.parse(content) : content;
      
      return {
        temperature: parseFloat(sensorData.temperature || sensorData.temp || sensorData.Temperature) || 0,
        ph: parseFloat(sensorData.ph || sensorData.pH || sensorData.PH) || 0,
        tdsLevel: parseFloat(sensorData.tdsLevel || sensorData.tds || sensorData.TDS || sensorData.waterLevel) || 0,
      };
    } catch (error) {
      console.error('Error fetching data from Antares:', error);
      return null;
    }
  }

  async fetchHistoricalData(limit = 100): Promise<AntaresData[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/${this.config.applicationId}/${this.config.deviceId}?rcn=4&lim=${limit}`,
        {
          method: 'GET',
          headers: {
            'X-M2M-Origin': this.config.apiKey,
            'Content-Type': 'application/json;ty=4',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Antares API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const contentInstances = data['m2m:cnt']?.['m2m:cin'] || [];
      
      return contentInstances.map((instance: any) => {
        const content = instance.con;
        const sensorData = typeof content === 'string' ? JSON.parse(content) : content;
        
        return {
          temperature: parseFloat(sensorData.temperature || sensorData.temp || sensorData.Temperature) || 0,
          ph: parseFloat(sensorData.ph || sensorData.pH || sensorData.PH) || 0,
          tdsLevel: parseFloat(sensorData.tdsLevel || sensorData.tds || sensorData.TDS || sensorData.waterLevel) || 0,
        };
      }).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error('Error fetching historical data from Antares:', error);
      return [];
    }
  }
}

export const antaresService = new AntaresService({
  apiKey: process.env.ANTARES_API_KEY || process.env.API_KEY || 'demo_key',
  deviceId: process.env.ANTARES_DEVICE_ID || 'hydro_sensor',
  applicationId: process.env.ANTARES_APPLICATION_ID || 'hydroponic_system',
});
