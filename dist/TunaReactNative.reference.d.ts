/**
 * Main TunaReactNative SDK Class
 *
 * Provides a unified interface for all Tuna payment operations in React Native apps.
 * Supports Apple Pay, Google Pay, credit cards, PIX, and other payment methods.
 *
 * This is the main entry point for the Tuna React Native SDK, orchestrating all
 * the underlying components to provide a simple, developer-friendly API.
 */
import { ApplePayAdapter } from './adapters/ApplePayAdapter';
import { GooglePayAdapter } from './adapters/GooglePayAdapter';
import type { ApplePayConfig, GooglePayConfig, PaymentDetails, PaymentResult, ApplePayResult, GooglePayResult, CardData, TokenResult, SavedCard, BindResult, DeleteResult, StatusResult, PIXResult, CustomerInfo, AntifraudConfig, StatusPollingConfig, StatusCallback, PaymentRequest, Environment } from './types/payment';
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
    /** Anti-fraud configurations */
    antifraudConfig?: AntifraudConfig[];
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Main TunaReactNative SDK Class
 *
 * This class provides a unified interface for all Tuna payment operations.
 * It orchestrates the underlying components to provide a simple API for:
 * - Apple Pay and Google Pay integration
 * - Credit card tokenization and payments
 * - PIX payments
 * - 3D Secure authentication
 * - Anti-fraud integration
 * - Payment status polling
 */
export declare class TunaReactNative {
    private session;
    private tokenizer;
    private payment;
    private threeds;
    private antifraud;
    private statusPoller;
    private adapter;
    private applePayAdapter?;
    private googlePayAdapter?;
    private isInitialized;
    private config;
    private currentSessionId?;
    constructor(config: TunaReactNativeConfig);
    /**
     * Initialize the SDK with a session
     * @param sessionId The session ID from Tuna backend
     * @param customerInfo Optional customer information
     */
    initialize(sessionId: string, customerInfo?: CustomerInfo): Promise<void>;
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
     * Tokenize a credit card
     */
    tokenizeCard(cardData: CardData): Promise<TokenResult>;
    /**
     * List saved cards for the current session
     */
    listSavedCards(): Promise<SavedCard[]>;
    /**
     * Bind a saved card with CVV
     */
    bindSavedCard(token: string, cvv: string): Promise<BindResult>;
    /**
     * Delete a saved card
     */
    deleteSavedCard(token: string): Promise<DeleteResult>;
    /**
     * Process a payment
     */
    processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult>;
    /**
     * Get payment status
     */
    getPaymentStatus(methodId: string, paymentKey: string): Promise<StatusResult>;
    /**
     * Start polling payment status with automatic updates
     */
    startStatusPolling(methodId: string, paymentKey: string, callback: StatusCallback, config?: StatusPollingConfig): Promise<void>;
    /**
     * Stop polling payment status
     */
    stopStatusPolling(methodId: string, paymentKey: string): Promise<void>;
    /**
     * Initiate PIX payment
     */
    initiatePIXPayment(amount: number, customer: CustomerInfo): Promise<PIXResult>;
    /**
     * Cleanup resources and stop any ongoing operations
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
    private getApplePayAdapter;
    private getGooglePayAdapter;
}
/**
 * Create a new TunaReactNative instance
 */
export declare function createTunaReactNative(config: TunaReactNativeConfig): TunaReactNative;
/**
 * Create Apple Pay adapter from existing TunaReactNative instance
 */
export declare function createApplePayAdapter(tunaSDK: TunaReactNative): ApplePayAdapter;
/**
 * Create Google Pay adapter from existing TunaReactNative instance
 */
export declare function createGooglePayAdapter(tunaSDK: TunaReactNative): GooglePayAdapter;
//# sourceMappingURL=TunaReactNative.reference.d.ts.map