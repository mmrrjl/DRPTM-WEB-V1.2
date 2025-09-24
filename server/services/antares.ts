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
  // Optional additional fields for different device types
  moisture?: number;
  ec?: number;
  humidity?: number;
  light?: number;
}

export class AntaresService {
  private config: AntaresConfig;

  constructor(config: AntaresConfig) {
    this.config = {
      baseUrl: 'https://platform.antares.id:8443/~/antares-cse/antares-id',
      ...config,
    };
  }

  /**
   * Decode hex data based on device type
   */
  private decodeHexData(hexString: string, deviceCode: string): AntaresData | null {
    try {
      // Remove any whitespace and ensure uppercase
      const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();

      if (deviceCode.startsWith('CZ')) {  // Cabai (4 sensors)
        return {
          ph: parseInt(cleanHex.substr(0, 4), 16) / 100,
          moisture: parseInt(cleanHex.substr(4, 4), 16) / 10,
          ec: parseInt(cleanHex.substr(8, 4), 16) / 100,
          temperature: parseInt(cleanHex.substr(12, 4), 16) / 10,
          tdsLevel: parseInt(cleanHex.substr(8, 4), 16) / 100, // Using EC as TDS equivalent
        };
      }

      if (deviceCode.startsWith('MZ') || deviceCode.startsWith('SZ')) {  // Melon/Selada (3 sensors)
        return {
          ph: parseInt(cleanHex.substr(0, 4), 16) / 100,
          ec: parseInt(cleanHex.substr(4, 4), 16) / 100,
          temperature: parseInt(cleanHex.substr(8, 4), 16) / 10,
          tdsLevel: parseInt(cleanHex.substr(4, 4), 16) / 100, // Using EC as TDS equivalent
        };
      }

      if (deviceCode.startsWith('GZ')) {  // Greenhouse (3 sensors)
        return {
          temperature: parseInt(cleanHex.substr(0, 4), 16) / 10,
          humidity: parseInt(cleanHex.substr(4, 4), 16) / 10,
          light: parseInt(cleanHex.substr(8, 4), 16),
          ph: 7.0, // Default pH for greenhouse sensors
          tdsLevel: 0, // Default TDS for greenhouse sensors
        };
      }

      // Default decoding for your example format: temperature(4) + pH(4) + TDS(4)
      if (cleanHex.length >= 12) {
        return {
          temperature: parseInt(cleanHex.substr(0, 4), 16) / 10,
          ph: parseInt(cleanHex.substr(4, 4), 16) / 10,
          tdsLevel: parseInt(cleanHex.substr(8, 4), 16) / 10,
        };
      }

      return null;
    } catch (error) {
      console.error('Error decoding hex data:', error);
      return null;
    }
  }

  /**
   * Parse Antares response content
   */
  private parseContent(content: any): AntaresData | null {
    try {
      let parsedContent;

      // Handle string content
      if (typeof content === 'string') {
        try {
          parsedContent = JSON.parse(content);
        } catch {
          // If JSON parse fails, treat as plain string (might be hex)
          parsedContent = { data: content };
        }
      } else {
        parsedContent = content;
      }

      // Check if data is in hex format
      if (parsedContent.data && typeof parsedContent.data === 'string') {
        const hexData = parsedContent.data;
        // Try to decode as hex data
        const decodedData = this.decodeHexData(hexData, this.config.deviceId);
        if (decodedData) {
          return decodedData;
        }
      }

      // Fallback to direct parsing (for backward compatibility)
      return {
        temperature: parseFloat(parsedContent.temperature) || 0,
        ph: parseFloat(parsedContent.ph) || 0,
        tdsLevel: parseFloat(parsedContent.tdsLevel) || parseFloat(parsedContent.waterLevel) || 0,
      };

    } catch (error) {
      console.error('Error parsing content:', error);
      return null;
    }
  }

  async fetchLatestData(): Promise<AntaresData | null> {
    try {
      // Validate configuration
      if (!this.config.apiKey || this.config.apiKey === 'demo_key') {
        console.warn('Antares API key not configured, using demo data');
        return this.getDemoData();
      }

      if (!this.config.applicationId || !this.config.deviceId) {
        console.error('Antares configuration incomplete:', {
          applicationId: this.config.applicationId,
          deviceId: this.config.deviceId
        });
        return null;
      }

      const url = `${this.config.baseUrl}/${this.config.applicationId}/${this.config.deviceId}/la`;
      console.log('Fetching from Antares URL:', url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-M2M-Origin': this.config.apiKey,
          'Content-Type': 'application/json;ty=4',
          'Accept': 'application/json',
          'User-Agent': 'Hydroponic-Monitor/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Antares API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Antares API error response:', errorText);
        throw new Error(`Antares API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Antares API response data:', JSON.stringify(data, null, 2));

      // Parse the Antares response format
      const content = data['m2m:cin']?.con;
      if (!content) {
        console.error('Invalid response format from Antares API:', data);
        throw new Error('Invalid response format from Antares API');
      }

      const parsedData = this.parseContent(content);
      console.log('Parsed Antares data:', parsedData);
      return parsedData;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Antares API request timeout');
      } else {
        console.error('Error fetching data from Antares:', error);
      }
      return null;
    }
  }

  private getDemoData(): AntaresData {
    // Return demo data when API is not configured
    return {
      temperature: 25.5 + Math.random() * 5,
      ph: 6.8 + Math.random() * 0.4,
      tdsLevel: 800 + Math.random() * 200,
      humidity: 60 + Math.random() * 20,
    };
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

      const historicalData: AntaresData[] = [];

      for (const instance of contentInstances) {
        const content = instance.con;
        const parsedData = this.parseContent(content);

        if (parsedData) {
          historicalData.push(parsedData);
        }
      }

      return historicalData.reverse(); // Reverse to get chronological order

    } catch (error) {
      console.error('Error fetching historical data from Antares:', error);
      return [];
    }
  }

  /**
   * Utility method to test hex decoding
   */
  testDecode(hexString: string, deviceCode?: string): AntaresData | null {
    return this.decodeHexData(hexString, deviceCode || this.config.deviceId);
  }
}

export const antaresService = new AntaresService({
  apiKey: process.env.ANTARES_API_KEY || process.env.API_KEY || 'demo_key',
  deviceId: process.env.ANTARES_DEVICE_ID || 'hydro_sensor',
  applicationId: process.env.ANTARES_APPLICATION_ID || 'hydroponic_system',
});

// Example usage:
// const testData = antaresService.testDecode('FB0AF80B0002');
// console.log(testData);
// Expected output: { temperature: 251.0, ph: 27.92, tdsLevel: 248.1 }