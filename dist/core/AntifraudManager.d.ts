/**
 * Anti-fraud Manager for Tuna React Native SDK
 *
 * This module handles anti-fraud provider initialization and device data collection
 * for fraud prevention systems including ClearSale, SiftScience, Konduto, and CyberSource.
 */
import { AntifraudConfig, DeviceData, AntifraudProvider, AntifraudResult } from '../types/payment';
export interface AntifraudManagerConfig {
    autoCollectDeviceData?: boolean;
    enabledProviders?: AntifraudProvider[];
    timeout?: number;
}
export declare class AntifraudManager {
    private config;
    private providers;
    private deviceData;
    private sessionId;
    private customerId?;
    constructor(sessionId: string, config?: AntifraudManagerConfig);
    /**
     * Initializes anti-fraud providers with their configurations
     */
    initializeProviders(antifraudConfigs: AntifraudConfig[]): Promise<void>;
    /**
     * Sets the customer ID for anti-fraud tracking
     */
    setCustomerId(customerId: string): void;
    /**
     * Collects comprehensive device data for anti-fraud analysis
     */
    collectDeviceData(): Promise<DeviceData>;
    /**
     * Initializes a specific anti-fraud provider
     */
    private initializeProvider;
    /**
     * Initializes ClearSale anti-fraud
     */
    private initializeClearSale;
    /**
     * Initializes SiftScience anti-fraud
     */
    private initializeSiftScience;
    /**
     * Initializes Konduto anti-fraud
     */
    private initializeKonduto;
    /**
     * Initializes CyberSource anti-fraud
     */
    private initializeCyberSource;
    /**
     * Gets the provider type from configuration key
     */
    private getProviderFromKey;
    /**
     * Extracts org ID from CyberSource configuration
     */
    private extractOrgId;
    /**
     * Gets device IP address (simplified for React Native)
     */
    private getIpAddress;
    /**
     * Gets screen resolution information
     */
    private getScreenResolution;
    /**
     * Gets device timezone
     */
    private getTimezone;
    /**
     * Generates a fallback device ID when DeviceInfo is not available
     */
    private generateFallbackDeviceId;
    /**
     * Generates a fallback user agent when DeviceInfo is not available
     */
    private generateFallbackUserAgent;
    /**
     * Gets anti-fraud results for payment processing
     */
    getAntifraudResults(): AntifraudResult[];
    /**
     * Generates device fingerprint for a specific provider
     */
    private generateFingerprint;
    /**
     * Gets the current device data
     */
    getDeviceData(): DeviceData | null;
    /**
     * Gets initialized providers
     */
    getInitializedProviders(): AntifraudProvider[];
    /**
     * Checks if a specific provider is initialized
     */
    isProviderInitialized(provider: AntifraudProvider): boolean;
    /**
     * Gets debug information about anti-fraud state
     */
    getDebugInfo(): Record<string, any>;
    /**
     * Resets anti-fraud state
     */
    reset(): void;
}
/**
 * Creates a new anti-fraud manager instance
 */
export declare function createAntifraudManager(sessionId: string, config?: AntifraudManagerConfig): AntifraudManager;
//# sourceMappingURL=AntifraudManager.d.ts.map