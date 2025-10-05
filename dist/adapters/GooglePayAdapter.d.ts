/**
 * Google Pay adapter for Tuna React Native SDK
 *
 * Provides Google Pay integration using @rnw-community/react-native-payments
 */
import { GooglePayConfig, PaymentDetails, GooglePayResult } from '../types/payment';
import { ReactNativePaymentsAdapter } from './ReactNativePaymentsAdapter';
export declare class GooglePayAdapter {
    private baseAdapter;
    private config?;
    constructor(baseAdapter: ReactNativePaymentsAdapter);
    /**
     * Checks if Google Pay is available on the device
     */
    canMakePayments(): Promise<boolean>;
    /**
     * Initializes Google Pay with the provided configuration
     */
    setup(config: GooglePayConfig): Promise<void>;
    /**
     * Shows the Google Pay payment sheet
     */
    showPaymentSheet(paymentDetails: PaymentDetails): Promise<GooglePayResult>;
    /**
     * Validates Google Pay configuration
     */
    private validateGooglePayConfig;
    /**
     * Gets the current Google Pay configuration
     */
    getConfig(): GooglePayConfig | undefined;
    /**
     * Checks if Google Pay is properly configured
     */
    isConfigured(): boolean;
    /**
     * Resets the Google Pay configuration
     */
    reset(): void;
    /**
     * Gets Google Pay capabilities for the current configuration
     */
    getCapabilities(): Promise<{
        canMakePayments: boolean;
        allowedCardNetworks: string[];
        environment?: string;
    }>;
    /**
     * Creates a formatted Google Pay configuration for debugging
     */
    getDebugInfo(): Record<string, any>;
}
/**
 * Creates a new Google Pay adapter instance
 */
export declare function createGooglePayAdapter(baseAdapter: ReactNativePaymentsAdapter): GooglePayAdapter;
//# sourceMappingURL=GooglePayAdapter.d.ts.map