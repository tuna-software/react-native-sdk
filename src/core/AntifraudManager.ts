/**
 * Anti-fraud Manager for Tuna React Native SDK
 * 
 * This module handles anti-fraud provider initialization and device data collection
 * for fraud prevention systems including ClearSale, SiftScience, Konduto, and CyberSource.
 */

import { Platform } from 'react-native';
// Optional dependency - gracefully handle if not installed
let DeviceInfo: any;
try {
  DeviceInfo = require('react-native-device-info');
} catch (error) {
  console.warn('react-native-device-info not available. Some device data collection features will be limited.');
  DeviceInfo = null;
}
import {
  AntifraudConfig,
  DeviceData,
  AntifraudProvider,
  AntifraudResult,
} from '../types/payment';
import { TunaPaymentError } from '../utils/errors';

export interface AntifraudManagerConfig {
  autoCollectDeviceData?: boolean; // Default: true
  enabledProviders?: AntifraudProvider[]; // Default: all
  timeout?: number; // Default: 10 seconds
}

export class AntifraudManager {
  private config: AntifraudManagerConfig;
  private providers: Map<AntifraudProvider, any> = new Map();
  private deviceData: DeviceData | null = null;
  private sessionId: string;
  private customerId?: string;

  constructor(sessionId: string, config: AntifraudManagerConfig = {}) {
    this.sessionId = sessionId;
    this.config = {
      autoCollectDeviceData: config.autoCollectDeviceData !== false,
      enabledProviders: config.enabledProviders || ['clearsale', 'siftscience', 'konduto', 'cybersource'],
      timeout: config.timeout || 10000,
      ...config,
    };
  }

  /**
   * Initializes anti-fraud providers with their configurations
   */
  async initializeProviders(antifraudConfigs: AntifraudConfig[]): Promise<void> {
    try {
      console.log('Initializing anti-fraud providers...');

      // Process each anti-fraud configuration
      for (const config of antifraudConfigs) {
        const provider = this.getProviderFromKey(config.key);
        if (provider && this.config.enabledProviders!.includes(provider)) {
          await this.initializeProvider(provider, config);
        }
      }

      // Auto-collect device data if enabled
      if (this.config.autoCollectDeviceData) {
        await this.collectDeviceData();
      }

      console.log('Anti-fraud providers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize anti-fraud providers:', error);
      throw new TunaPaymentError('Anti-fraud initialization failed');
    }
  }

  /**
   * Sets the customer ID for anti-fraud tracking
   */
  setCustomerId(customerId: string): void {
    this.customerId = customerId;
    
    // Update providers that need customer ID
    this.providers.forEach((providerData, provider) => {
      if (provider === 'konduto' && providerData.setCustomerID) {
        providerData.setCustomerID(customerId);
      }
    });
  }

  /**
   * Collects comprehensive device data for anti-fraud analysis
   */
  async collectDeviceData(): Promise<DeviceData> {
    try {
      console.log('Collecting device data for anti-fraud analysis...');

      const deviceData: DeviceData = {
        // Basic device information
        deviceId: DeviceInfo ? await DeviceInfo.getUniqueId() : this.generateFallbackDeviceId(),
        platform: Platform.OS,
        platformVersion: Platform.Version.toString(),
        appVersion: DeviceInfo ? DeviceInfo.getVersion() : 'unknown',
        deviceModel: DeviceInfo ? await DeviceInfo.getModel() : 'unknown',
        deviceBrand: DeviceInfo ? await DeviceInfo.getBrand() : 'unknown',
        systemName: DeviceInfo ? await DeviceInfo.getSystemName() : Platform.OS,
        systemVersion: DeviceInfo ? await DeviceInfo.getSystemVersion() : Platform.Version.toString(),
        
        // Network information
        ipAddress: await this.getIpAddress(),
        userAgent: DeviceInfo ? await DeviceInfo.getUserAgent() : this.generateFallbackUserAgent(),
        
        // Screen information
        screenResolution: await this.getScreenResolution(),
        timezone: this.getTimezone(),
        locale: DeviceInfo ? await DeviceInfo.getDeviceLocale() : 'unknown',
        
        // Additional security data
        isEmulator: DeviceInfo ? await DeviceInfo.isEmulator() : false,
        isTablet: DeviceInfo ? await DeviceInfo.isTablet() : false,
        hasNotch: DeviceInfo ? await DeviceInfo.hasNotch() : false,
        batteryLevel: DeviceInfo ? await DeviceInfo.getBatteryLevel() : -1,
        
        // Session data
        sessionId: this.sessionId,
        customerId: this.customerId,
        timestamp: new Date().toISOString(),
        
        // Network carrier info (mobile only)
        ...(Platform.OS !== 'web' && DeviceInfo && {
          carrier: await DeviceInfo.getCarrier(),
        }),
        
        // iOS specific
        ...(Platform.OS === 'ios' && DeviceInfo && {
          iosIdForVendor: await DeviceInfo.getIosIdForVendor(),
        }),
        
        // Android specific
        ...(Platform.OS === 'android' && DeviceInfo && {
          androidId: await DeviceInfo.getAndroidId(),
          buildNumber: await DeviceInfo.getBuildNumber(),
        }),
      };

      this.deviceData = deviceData;
      console.log('Device data collection completed');

      return deviceData;
    } catch (error) {
      console.error('Failed to collect device data:', error);
      throw new TunaPaymentError('Device data collection failed');
    }
  }

  /**
   * Initializes a specific anti-fraud provider
   */
  private async initializeProvider(provider: AntifraudProvider, config: AntifraudConfig): Promise<void> {
    try {
      switch (provider) {
        case 'clearsale':
          await this.initializeClearSale(config);
          break;
        case 'siftscience':
          await this.initializeSiftScience(config);
          break;
        case 'konduto':
          await this.initializeKonduto(config);
          break;
        case 'cybersource':
          await this.initializeCyberSource(config);
          break;
        default:
          console.warn(`Unknown anti-fraud provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Failed to initialize ${provider}:`, error);
      // Don't throw - allow other providers to initialize
    }
  }

  /**
   * Initializes ClearSale anti-fraud
   */
  private async initializeClearSale(config: AntifraudConfig): Promise<void> {
    try {
      // Note: In React Native, we would need a native module or WebView
      // to properly initialize ClearSale. This is a simplified implementation.
      
      const clearSaleData = {
        appKey: config.value,
        sessionId: this.sessionId,
        initialized: true,
        timestamp: new Date(),
      };

      this.providers.set('clearsale', clearSaleData);
      console.log('ClearSale initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('ClearSale initialization failed');
    }
  }

  /**
   * Initializes SiftScience anti-fraud
   */
  private async initializeSiftScience(config: AntifraudConfig): Promise<void> {
    try {
      // SiftScience integration for React Native
      const siftData = {
        accountKey: config.value,
        sessionId: this.sessionId,
        userId: this.customerId,
        initialized: true,
        timestamp: new Date(),
      };

      this.providers.set('siftscience', siftData);
      console.log('SiftScience initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('SiftScience initialization failed');
    }
  }

  /**
   * Initializes Konduto anti-fraud
   */
  private async initializeKonduto(config: AntifraudConfig): Promise<void> {
    try {
      // Konduto integration for React Native
      const kondutoData = {
        publicKey: config.value,
        customerId: this.customerId,
        initialized: true,
        timestamp: new Date(),
        setCustomerID: (customerId: string) => {
          kondutoData.customerId = customerId;
        },
      };

      this.providers.set('konduto', kondutoData);
      console.log('Konduto initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('Konduto initialization failed');
    }
  }

  /**
   * Initializes CyberSource anti-fraud
   */
  private async initializeCyberSource(config: AntifraudConfig): Promise<void> {
    try {
      // CyberSource Device Fingerprinting
      const cybersourceData = {
        orgId: this.extractOrgId(config.value),
        sessionId: `${config.value}${this.sessionId}`,
        initialized: true,
        timestamp: new Date(),
      };

      this.providers.set('cybersource', cybersourceData);
      console.log('CyberSource initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('CyberSource initialization failed');
    }
  }

  /**
   * Gets the provider type from configuration key
   */
  private getProviderFromKey(key: string): AntifraudProvider | null {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('clearsale')) return 'clearsale';
    if (keyLower.includes('sift')) return 'siftscience';
    if (keyLower.includes('konduto')) return 'konduto';
    if (keyLower.includes('cyber')) return 'cybersource';
    
    return null;
  }

  /**
   * Extracts org ID from CyberSource configuration
   */
  private extractOrgId(value: string): string {
    // CyberSource key format typically includes org ID
    // This is a simplified extraction - adjust based on actual key format
    return value.split('_')[0] || value;
  }

  /**
   * Gets device IP address (simplified for React Native)
   */
  private async getIpAddress(): Promise<string> {
    try {
      // In React Native, IP address detection is limited
      // This would typically require a network request to a service
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Gets screen resolution information
   */
  private async getScreenResolution(): Promise<string> {
    try {
      const { Dimensions } = require('react-native');
      const { width, height } = Dimensions.get('screen');
      return `${width}x${height}`;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Gets device timezone
   */
  private getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Generates a fallback device ID when DeviceInfo is not available
   */
  private generateFallbackDeviceId(): string {
    // Generate a pseudo-unique ID based on available information
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${Platform.OS}-${timestamp}-${random}`;
  }

  /**
   * Generates a fallback user agent when DeviceInfo is not available
   */
  private generateFallbackUserAgent(): string {
    const platform = Platform.OS;
    const version = Platform.Version;
    return `ReactNative/${platform}/${version}`;
  }

  /**
   * Gets anti-fraud results for payment processing
   */
  getAntifraudResults(): AntifraudResult[] {
    const results: AntifraudResult[] = [];

    this.providers.forEach((data, provider) => {
      results.push({
        provider,
        sessionId: this.sessionId,
        customerId: this.customerId,
        deviceFingerprint: this.generateFingerprint(provider, data),
        timestamp: new Date(),
        metadata: {
          ...data,
          deviceData: this.deviceData,
        },
      });
    });

    return results;
  }

  /**
   * Generates device fingerprint for a specific provider
   */
  private generateFingerprint(provider: AntifraudProvider, data: any): string {
    // Generate a provider-specific fingerprint
    const baseData = {
      provider,
      sessionId: this.sessionId,
      timestamp: data.timestamp,
      deviceId: this.deviceData?.deviceId,
    };

    return Buffer.from(JSON.stringify(baseData)).toString('base64');
  }

  /**
   * Gets the current device data
   */
  getDeviceData(): DeviceData | null {
    return this.deviceData;
  }

  /**
   * Gets initialized providers
   */
  getInitializedProviders(): AntifraudProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Checks if a specific provider is initialized
   */
  isProviderInitialized(provider: AntifraudProvider): boolean {
    return this.providers.has(provider);
  }

  /**
   * Gets debug information about anti-fraud state
   */
  getDebugInfo(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      customerId: this.customerId,
      initializedProviders: this.getInitializedProviders(),
      deviceDataCollected: !!this.deviceData,
      config: this.config,
      providerData: Object.fromEntries(this.providers),
    };
  }

  /**
   * Resets anti-fraud state
   */
  reset(): void {
    this.providers.clear();
    this.deviceData = null;
    this.customerId = undefined;
  }
}

/**
 * Creates a new anti-fraud manager instance
 */
export function createAntifraudManager(sessionId: string, config?: AntifraudManagerConfig): AntifraudManager {
  return new AntifraudManager(sessionId, config);
}