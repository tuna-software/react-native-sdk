/**
 * React Hooks for Tuna React Native SDK
 *
 * This file provides React hooks for integrating Tuna payment functionality
 * into React Native applications using @rnw-community/react-native-payments
 */
import { TunaReactNative, type TunaReactNativeConfig } from '../TunaReactNativeSimple';
import type { PaymentDetails, PaymentResult, ApplePayConfig, GooglePayConfig, ApplePayResult, GooglePayResult, PIXResult, CustomerInfo } from '../types/payment';
export interface TunaPaymentState {
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
}
export interface ApplePayState {
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
}
export interface GooglePayState {
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
}
export interface PIXPaymentState {
    isLoading: boolean;
    qrCode: string | null;
    qrCodeImage: string | null;
    expirationTime: Date | null;
    paymentKey: string | null;
    error: Error | null;
}
/**
 * Main Tuna Payments Hook
 *
 * This is the primary hook for integrating Tuna payments into your React Native app.
 * It provides automatic initialization, state management, and platform-specific methods.
 */
export declare function useTunaPayments(config?: TunaReactNativeConfig): {
    initialize: (initConfig?: TunaReactNativeConfig) => Promise<void>;
    processPayment: (paymentDetails: PaymentDetails) => Promise<PaymentResult | null>;
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
    tunaSDK: TunaReactNative | null;
};
/**
 * Apple Pay Hook
 *
 * Hook for Apple Pay integration using native payment capabilities
 */
export declare function useApplePay(tunaSDK: TunaReactNative | null): {
    setupApplePay: (config: ApplePayConfig) => Promise<boolean>;
    showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<ApplePayResult | null>;
    checkAvailability: () => Promise<void>;
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Google Pay Hook
 *
 * Hook for Google Pay integration using native payment capabilities
 */
export declare function useGooglePay(tunaSDK: TunaReactNative | null): {
    setupGooglePay: (config: GooglePayConfig) => Promise<boolean>;
    showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<GooglePayResult | null>;
    checkAvailability: () => Promise<void>;
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
};
/**
 * PIX Payments Hook
 *
 * Hook for PIX payment integration
 */
export declare function usePIXPayments(tunaSDK: TunaReactNative | null): {
    generatePIXPayment: (amount: number, customer: CustomerInfo) => Promise<PIXResult | null>;
    clearPIXPayment: () => void;
    isLoading: boolean;
    qrCode: string | null;
    qrCodeImage: string | null;
    expirationTime: Date | null;
    paymentKey: string | null;
    error: Error | null;
};
/**
 * Complete Tuna integration with all features
 */
export declare function useTunaComplete(config: TunaReactNativeConfig): {
    applePay: {
        setupApplePay: (config: ApplePayConfig) => Promise<boolean>;
        showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<ApplePayResult | null>;
        checkAvailability: () => Promise<void>;
        isAvailable: boolean;
        isConfigured: boolean;
        isLoading: boolean;
        error: Error | null;
    };
    googlePay: {
        setupGooglePay: (config: GooglePayConfig) => Promise<boolean>;
        showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<GooglePayResult | null>;
        checkAvailability: () => Promise<void>;
        isAvailable: boolean;
        isConfigured: boolean;
        isLoading: boolean;
        error: Error | null;
    };
    pixPayments: {
        generatePIXPayment: (amount: number, customer: CustomerInfo) => Promise<PIXResult | null>;
        clearPIXPayment: () => void;
        isLoading: boolean;
        qrCode: string | null;
        qrCodeImage: string | null;
        expirationTime: Date | null;
        paymentKey: string | null;
        error: Error | null;
    };
    initialize: (initConfig?: TunaReactNativeConfig) => Promise<void>;
    processPayment: (paymentDetails: PaymentDetails) => Promise<PaymentResult | null>;
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
    tunaSDK: TunaReactNative | null;
};
export default useTunaPayments;
//# sourceMappingURL=useTunaPayments.d.ts.map