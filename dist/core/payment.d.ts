/**
 * Payment processing service for Tuna React Native SDK
 *
 * Handles payment initialization, processing, and status monitoring
 */
import { TunaPaymentConfig, PaymentRequest, PaymentResult, PaymentMethodConfig, PaymentStatusResponse, PaymentCancelRequest } from '../types/payment';
import { SessionManager } from './session';
import { TokenizationManager } from './tokenization';
export declare class PaymentManager {
    private sessionManager;
    private tokenizationManager;
    private config;
    constructor(sessionManager: SessionManager, tokenizationManager: TokenizationManager, config: {
        baseUrl: string;
        timeout?: number;
        statusPollingInterval?: number;
        maxStatusPollingAttempts?: number;
    });
    /**
     * Initializes a payment transaction
     */
    initializePayment(request: PaymentRequest): Promise<PaymentResult>;
    /**
     * Processes payment with an existing token
     */
    private processTokenPayment;
    /**
     * Processes payment with new card data (tokenizes first)
     */
    private processNewCardPayment;
    /**
     * Processes native payment (Apple Pay / Google Pay)
     */
    private processNativePayment;
    /**
     * Gets payment status
     */
    getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
    /**
     * Polls payment status until completion or timeout
     */
    pollPaymentStatus(paymentId: string, onStatusUpdate?: (status: PaymentStatusResponse) => void): Promise<PaymentStatusResponse>;
    /**
     * Cancels a payment
     */
    cancelPayment(request: PaymentCancelRequest): Promise<boolean>;
    /**
     * Validates payment configuration
     */
    validatePaymentConfig(config: TunaPaymentConfig): boolean;
    /**
     * Gets supported payment methods for current session
     */
    getSupportedPaymentMethods(): Promise<PaymentMethodConfig[]>;
    /**
     * Parses payment response from API
     */
    private parsePaymentResponse;
    /**
     * Maps API status to PaymentStatus enum
     */
    private mapPaymentStatus;
    /**
     * Checks if payment status is final
     */
    private isPaymentFinal;
    /**
     * Utility function for delays
     */
    private delay;
    /**
     * Updates payment manager configuration
     */
    updateConfig(config: Partial<{
        baseUrl: string;
        timeout: number;
        statusPollingInterval: number;
        maxStatusPollingAttempts: number;
    }>): void;
}
/**
 * Gets or creates the default payment manager
 */
export declare function getDefaultPaymentManager(sessionManager?: SessionManager, tokenizationManager?: TokenizationManager, config?: {
    baseUrl: string;
    timeout?: number;
}): PaymentManager;
/**
 * Creates a new payment manager instance
 */
export declare function createPaymentManager(sessionManager: SessionManager, tokenizationManager: TokenizationManager, config: {
    baseUrl: string;
    timeout?: number;
}): PaymentManager;
/**
 * Resets the default payment manager
 */
export declare function resetDefaultPaymentManager(): void;
//# sourceMappingURL=payment.d.ts.map