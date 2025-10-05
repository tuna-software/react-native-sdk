/**
 * Payment processing service for Tuna React Native SDK
 * 
 * Handles payment initialization, processing, and status monitoring
 */

import { 
  TunaPaymentConfig,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PaymentMethodConfig,
  PaymentStatusResponse,
  PaymentCancelRequest
} from '../types/payment';
import { TunaPaymentError, TunaNetworkError, TunaSessionError } from '../utils/errors';
import { TUNA_API_ENDPOINTS } from '../utils/constants';
import { SessionManager } from './session';
import { TokenizationManager } from './tokenization';
import { validatePaymentData } from '../utils/validation';
import { handleHttpError } from '../utils/errors';

export class PaymentManager {
  private sessionManager: SessionManager;
  private tokenizationManager: TokenizationManager;
  private config: {
    baseUrl: string;
    timeout: number;
    statusPollingInterval: number;
    maxStatusPollingAttempts: number;
  };

  constructor(
    sessionManager: SessionManager,
    tokenizationManager: TokenizationManager,
    config: { 
      baseUrl: string; 
      timeout?: number;
      statusPollingInterval?: number;
      maxStatusPollingAttempts?: number;
    }
  ) {
    this.sessionManager = sessionManager;
    this.tokenizationManager = tokenizationManager;
    this.config = {
      timeout: 30000,
      statusPollingInterval: 2000,
      maxStatusPollingAttempts: 30,
      ...config,
    };
  }

  /**
   * Initializes a payment transaction
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required for payment processing');
    }

    // Validate payment data
    const validationErrors = validatePaymentData(request);
    if (validationErrors.length > 0) {
      throw new TunaPaymentError(`Payment validation failed: ${validationErrors[0].message}`);
    }

    try {
      // Handle token-based payments
      if (request.token) {
        return this.processTokenPayment(request);
      }

      // Handle new card payments with tokenization
      if (request.cardData) {
        return this.processNewCardPayment(request);
      }

      // Handle native payments (Apple Pay / Google Pay)
      if (request.nativePaymentData) {
        return this.processNativePayment(request);
      }

      throw new TunaPaymentError('Invalid payment method specified');
    } catch (error) {
      if (error instanceof TunaPaymentError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaPaymentError('Payment initialization failed');
    }
  }

  /**
   * Processes payment with an existing token
   */
  private async processTokenPayment(request: PaymentRequest): Promise<PaymentResult> {
    const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.INIT_PAYMENT}`;
    const sessionHeaders = this.sessionManager.getSessionHeaders();

    const requestBody = {
      Amount: request.amount,
      Currency: request.currency,
      Token: request.token,
      OrderId: request.orderId,
      CustomerId: request.customerId,
      Description: request.description,
      Installments: request.installments || 1,
      ...(request.antifraudData && { AntifraudData: request.antifraudData }),
      ...(request.metadata && { Metadata: request.metadata }),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...sessionHeaders,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw handleHttpError(response, responseText);
    }

    const responseData = await response.json();
    return this.parsePaymentResponse(responseData);
  }

  /**
   * Processes payment with new card data (tokenizes first)
   */
  private async processNewCardPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.cardData) {
      throw new TunaPaymentError('Card data is required for new card payments');
    }

    // First, tokenize the card
    const tokenRequest = {
      cardNumber: request.cardData.number,
      cardholderName: request.cardData.holderName,
      expirationMonth: request.cardData.expirationMonth,
      expirationYear: request.cardData.expirationYear,
      cvv: request.cardData.cvv,
      customerId: request.customerId,
      brand: request.cardData.brand,
    };

    const tokenResponse = await this.tokenizationManager.generateToken(tokenRequest);

    // Process payment with the new token
    const paymentRequest: PaymentRequest = {
      ...request,
      token: tokenResponse.token,
      cardData: undefined, // Remove card data for security
    };

    return this.processTokenPayment(paymentRequest);
  }

  /**
   * Processes native payment (Apple Pay / Google Pay)
   */
  private async processNativePayment(request: PaymentRequest): Promise<PaymentResult> {
    const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.INIT_PAYMENT}`;
    const sessionHeaders = this.sessionManager.getSessionHeaders();

    const requestBody = {
      Amount: request.amount,
      Currency: request.currency,
      OrderId: request.orderId,
      CustomerId: request.customerId,
      Description: request.description,
      PaymentMethod: request.paymentMethod,
      NativePaymentData: request.nativePaymentData,
      ...(request.antifraudData && { AntifraudData: request.antifraudData }),
      ...(request.metadata && { Metadata: request.metadata }),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...sessionHeaders,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw handleHttpError(response, responseText);
    }

    const responseData = await response.json();
    return this.parsePaymentResponse(responseData);
  }

  /**
   * Gets payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to get payment status');
    }

    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.PAYMENT_STATUS}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();

      const queryParams = new URLSearchParams({ PaymentId: paymentId });
      const url = `${endpoint}?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...sessionHeaders,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const responseData = await response.json();
      
      return {
        paymentId,
        status: this.mapPaymentStatus(responseData.Status),
        statusMessage: responseData.StatusMessage,
        transactionId: responseData.TransactionId,
        authorizationCode: responseData.AuthorizationCode,
        receiptUrl: responseData.ReceiptUrl,
        lastUpdated: new Date(responseData.LastUpdated || Date.now()),
        amount: responseData.Amount,
        currency: responseData.Currency,
        metadata: responseData.Metadata,
      };
    } catch (error) {
      if (error instanceof TunaPaymentError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaPaymentError('Failed to get payment status');
    }
  }

  /**
   * Polls payment status until completion or timeout
   */
  async pollPaymentStatus(
    paymentId: string,
    onStatusUpdate?: (status: PaymentStatusResponse) => void
  ): Promise<PaymentStatusResponse> {
    let attempts = 0;
    
    while (attempts < this.config.maxStatusPollingAttempts) {
      try {
        const status = await this.getPaymentStatus(paymentId);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        // Check if payment is in a final state
        if (this.isPaymentFinal(status.status)) {
          return status;
        }

        // Wait before next poll
        await this.delay(this.config.statusPollingInterval);
        attempts++;
      } catch (error) {
        attempts++;
        if (attempts >= this.config.maxStatusPollingAttempts) {
          throw error;
        }
        await this.delay(this.config.statusPollingInterval);
      }
    }

    throw new TunaPaymentError('Payment status polling timeout');
  }

  /**
   * Cancels a payment
   */
  async cancelPayment(request: PaymentCancelRequest): Promise<boolean> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to cancel payment');
    }

    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.PAYMENT_CANCEL}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();

      const requestBody = {
        PaymentId: request.paymentId,
        Reason: request.reason || 'User cancelled',
        ...(request.metadata && { Metadata: request.metadata }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const responseData = await response.json();
      return responseData.Success === true;
    } catch (error) {
      if (error instanceof TunaPaymentError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaPaymentError('Failed to cancel payment');
    }
  }

  /**
   * Validates payment configuration
   */
  validatePaymentConfig(config: TunaPaymentConfig): boolean {
    if (!config.amount || config.amount <= 0) {
      throw new TunaPaymentError('Valid payment amount is required');
    }

    if (!config.currency) {
      throw new TunaPaymentError('Currency is required');
    }

    if (!config.orderId) {
      throw new TunaPaymentError('Order ID is required');
    }

    return true;
  }

  /**
   * Gets supported payment methods for current session
   */
  async getSupportedPaymentMethods(): Promise<PaymentMethodConfig[]> {
    // This would typically come from a dedicated API endpoint
    // For now, return default supported methods
    return [
      {
        type: 'credit_card',
        name: 'Credit Card',
        enabled: true,
        supportedBrands: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
        maxInstallments: 12,
      },
      {
        type: 'debit_card',
        name: 'Debit Card',
        enabled: true,
        supportedBrands: ['visa', 'mastercard'],
        maxInstallments: 1,
      },
      {
        type: 'pix',
        name: 'PIX',
        enabled: true,
        qrCodeEnabled: true,
      },
      {
        type: 'boleto',
        name: 'Boleto',
        enabled: true,
        daysToExpire: 3,
      },
    ];
  }

  /**
   * Parses payment response from API
   */
  private parsePaymentResponse(responseData: any): PaymentResult {
    return {
      paymentId: responseData.PaymentId,
      status: this.mapPaymentStatus(responseData.Status),
      statusMessage: responseData.StatusMessage,
      transactionId: responseData.TransactionId,
      authorizationCode: responseData.AuthorizationCode,
      receiptUrl: responseData.ReceiptUrl,
      threeDSData: responseData.ThreeDSData ? {
        url: responseData.ThreeDSData.Url,
        token: responseData.ThreeDSData.Token,
        paRequest: responseData.ThreeDSData.PaRequest,
      } : undefined,
      qrCodeData: responseData.QrCodeData,
      boletoData: responseData.BoletoData,
      amount: responseData.Amount,
      currency: responseData.Currency,
      createdAt: new Date(responseData.CreatedAt || Date.now()),
      metadata: responseData.Metadata,
    };
  }

  /**
   * Maps API status to PaymentStatus enum
   */
  private mapPaymentStatus(apiStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': 'pending',
      'processing': 'processing',
      'authorized': 'authorized',
      'captured': 'captured',
      'success': 'success',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'expired': 'expired',
      'refunded': 'refunded',
    };

    return statusMap[apiStatus?.toLowerCase()] || 'pending';
  }

  /**
   * Checks if payment status is final
   */
  private isPaymentFinal(status: PaymentStatus): boolean {
    const finalStatuses: PaymentStatus[] = [
      'success',
      'failed',
      'cancelled',
      'expired',
      'refunded',
    ];
    return finalStatuses.includes(status);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Updates payment manager configuration
   */
  updateConfig(config: Partial<{
    baseUrl: string;
    timeout: number;
    statusPollingInterval: number;
    maxStatusPollingAttempts: number;
  }>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}

/**
 * Default payment manager instance
 */
let defaultPaymentManager: PaymentManager | null = null;

/**
 * Gets or creates the default payment manager
 */
export function getDefaultPaymentManager(
  sessionManager?: SessionManager,
  tokenizationManager?: TokenizationManager,
  config?: { baseUrl: string; timeout?: number }
): PaymentManager {
  if (!defaultPaymentManager) {
    if (!sessionManager || !tokenizationManager || !config) {
      throw new TunaPaymentError('Session manager, tokenization manager, and configuration are required');
    }
    defaultPaymentManager = new PaymentManager(sessionManager, tokenizationManager, config);
  }
  return defaultPaymentManager;
}

/**
 * Creates a new payment manager instance
 */
export function createPaymentManager(
  sessionManager: SessionManager,
  tokenizationManager: TokenizationManager,
  config: { baseUrl: string; timeout?: number }
): PaymentManager {
  return new PaymentManager(sessionManager, tokenizationManager, config);
}

/**
 * Resets the default payment manager
 */
export function resetDefaultPaymentManager(): void {
  defaultPaymentManager = null;
}