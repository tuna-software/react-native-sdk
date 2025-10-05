/**
 * Apple Pay adapter for Tuna React Native SDK
 *
 * Provides Apple Pay integration using @rnw-community/react-native-payments
 */
import { ApplePayConfig, PaymentDetails, ApplePayResult } from '../types/payment';
import { ReactNativePaymentsAdapter } from './ReactNativePaymentsAdapter';
export declare class ApplePayAdapter {
    private baseAdapter;
    private config?;
    constructor(baseAdapter: ReactNativePaymentsAdapter);
    /**
     * Checks if Apple Pay is available on the device
     */
    canMakePayments(): Promise<boolean>;
    /**
     * Initializes Apple Pay with the provided configuration
     */
    setup(config: ApplePayConfig): Promise<void>;
    /**
     * Shows the Apple Pay payment sheet
     */
    showPaymentSheet(paymentDetails: PaymentDetails): Promise<ApplePayResult>;
    /**
     * Validates Apple Pay configuration
     */
    private validateApplePayConfig;
    /**
     * Gets the current Apple Pay configuration
     */
    getConfig(): ApplePayConfig | undefined;
    /**
     * Checks if Apple Pay is properly configured
     */
    isConfigured(): boolean;
    /**
     * Resets the Apple Pay configuration
     */
    reset(): void;
    /**
     * Gets Apple Pay capabilities for the current configuration
     */
    getCapabilities(): Promise<{
        canMakePayments: boolean;
        supportedNetworks: string[];
        merchantIdentifier?: string;
    }>;
    /**
     * Creates a formatted Apple Pay configuration for debugging
     */
    getDebugInfo(): Record<string, any>;
}
/**
 * Creates a new Apple Pay adapter instance
 */
export declare function createApplePayAdapter(baseAdapter: ReactNativePaymentsAdapter): ApplePayAdapter;
//# sourceMappingURL=ApplePayAdapter.d.ts.map