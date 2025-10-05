/**
 * Main TunaReactNative SDK Class (Simplified Implementation)
 *
 * This is a simplified implementation of the main SDK class that works with
 * the existing core components. It provides the basic unified interface
 * while adapting to the current implementation constraints.
 */
import type { ApplePayConfig, GooglePayConfig, PaymentDetails, ApplePayResult, GooglePayResult, PIXResult, CustomerInfo, Environment } from './types/payment';
/**
 * Main TunaReactNative SDK Configuration
 */
export interface TunaReactNativeConfig {
    /** Environment to use for payments */
    environment: Environment;
    /** Session timeout in milliseconds (default: 30 minutes) */
    sessionTimeout?: number;
    /** Base URL override (optional, auto-determined from environment) */
    baseUrl?: string;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Main TunaReactNative SDK Class
 *
 * This class provides a unified interface for payment operations.
 * It's designed to be simple and extensible for Phase 5.
 */
export declare class TunaReactNative {
    private config;
    private isInitialized;
    private currentSessionId?;
    constructor(config: TunaReactNativeConfig);
    /**
     * Initialize the SDK with a session
     */
    initialize(sessionId: string): Promise<void>;
    /**
     * Check if the SDK is initialized
     */
    isReady(): boolean;
    /**
     * Check if Apple Pay is available on this device
     */
    canMakeApplePayPayments(): Promise<boolean>;
    /**
     * Setup Apple Pay configuration
     */
    setupApplePay(config: ApplePayConfig): Promise<void>;
    /**
     * Show Apple Pay payment sheet
     */
    showApplePaySheet(paymentDetails: PaymentDetails): Promise<ApplePayResult>;
    /**
     * Check if Google Pay is ready to pay
     */
    isGooglePayReady(): Promise<boolean>;
    /**
     * Setup Google Pay configuration
     */
    setupGooglePay(config: GooglePayConfig): Promise<void>;
    /**
     * Request Google Pay payment
     */
    requestGooglePayment(paymentDetails: PaymentDetails): Promise<GooglePayResult>;
    /**
     * Initiate PIX payment
     */
    initiatePIXPayment(amount: number, customer: CustomerInfo): Promise<PIXResult>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Get current session ID
     */
    getSessionId(): string | undefined;
    /**
     * Get current environment
     */
    getEnvironment(): Environment;
    private ensureInitialized;
}
/**
 * Create a new TunaReactNative instance
 */
export declare function createTunaReactNative(config: TunaReactNativeConfig): TunaReactNative;
//# sourceMappingURL=TunaReactNativeSimple.d.ts.map