/**
 * Base adapter for React Native Payments integration with Tuna
 *
 * This adapter bridges @rnw-community/react-native-payments with Tuna's payment infrastructure
 */
import { PaymentRequest } from '@rnw-community/react-native-payments';
import { TunaPaymentConfig, PaymentResult, PaymentDetails, PaymentMethodConfig } from '../types/payment';
import { SessionManager } from '../core/session';
import { TokenizationManager } from '../core/tokenization';
import { PaymentManager } from '../core/payment';
export declare class ReactNativePaymentsAdapter {
    private sessionManager;
    private tokenizationManager;
    private paymentManager;
    private config;
    private supportedMethods;
    constructor(sessionManager: SessionManager, tokenizationManager: TokenizationManager, paymentManager: PaymentManager, config: TunaPaymentConfig);
    /**
     * Initializes the adapter and checks for native payment capabilities
     */
    initialize(): Promise<void>;
    /**
     * Checks what native payment capabilities are available
     */
    private checkNativePaymentCapabilities;
    /**
     * Converts Tuna payment configuration to React Native Payments format
     */
    createPaymentRequest(paymentDetails: PaymentDetails, methodConfig: PaymentMethodConfig): PaymentRequest;
    /**
     * Processes a native payment response and converts it to Tuna payment
     */
    processNativePaymentResponse(paymentResponse: any, originalDetails: PaymentDetails): Promise<PaymentResult>;
    /**
     * Processes Apple Pay payment response
     */
    private processApplePayResponse;
    /**
     * Processes Google Pay payment response
     */
    private processGooglePayResponse;
    /**
     * Shows the native payment sheet
     */
    showPaymentSheet(paymentDetails: PaymentDetails, methodConfig: PaymentMethodConfig): Promise<PaymentResult>;
    /**
     * Checks if the specified payment method is supported
     */
    isPaymentMethodSupported(method: string): boolean;
    /**
     * Gets all supported payment methods
     */
    getSupportedPaymentMethods(): string[];
    /**
     * Validates payment method configuration
     */
    validatePaymentMethodConfig(methodConfig: PaymentMethodConfig): boolean;
    /**
     * Updates the adapter configuration
     */
    updateConfig(config: Partial<TunaPaymentConfig>): void;
    /**
     * Cleans up adapter resources
     */
    destroy(): void;
}
/**
 * Creates a new React Native Payments adapter instance
 */
export declare function createReactNativePaymentsAdapter(sessionManager: SessionManager, tokenizationManager: TokenizationManager, paymentManager: PaymentManager, config: TunaPaymentConfig): ReactNativePaymentsAdapter;
//# sourceMappingURL=ReactNativePaymentsAdapter.d.ts.map