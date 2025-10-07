/**
 * Tuna API Client
 * 
 * Handles all communication with Tuna's payment APIs
 */

import type { Environment } from '../types/payment';
import { TunaPaymentError } from '../types/errors';

/**
 * Tuna API Configuration
 */
const TUNA_CONFIGS = {
  production: {
    TOKEN_API_URL: 'https://token.tunagateway.com/api/Token',
    INTEGRATIONS_API_URL: 'https://token.tunagateway.com/api/integrations/plugin',
    PAYMENT_API_URL: 'https://engine.tunagateway.com/api/Payment',
    GOOGLE_PAY_ENV: 'PRODUCTION',
    GOOGLE_PAY_GATEWAY: 'tuna',
  },
  sandbox: {
    TOKEN_API_URL: 'https://token.tuna-demo.uy/api/Token',
    INTEGRATIONS_API_URL: 'https://token.tuna-demo.uy/api/integrations/plugin',
    PAYMENT_API_URL: 'https://sandbox.tuna-demo.uy/api/Payment',
    GOOGLE_PAY_ENV: 'TEST',
    GOOGLE_PAY_GATEWAY: 'tuna',
  },
};

/**
 * Token response from Tuna API
 */
export interface TokenResponse {
  code: number;
  message?: string;
  token?: string;
  brand?: string;
  lastFourDigits?: string;
  authenticationInformation?: {
    referenceId?: string;
    transactionId?: string;
    accessToken?: string;
    deviceDataCollectionUrl?: string;
  };
}

/**
 * Payment method data for API
 */
export interface PaymentMethodData {
  Amount: number;
  Token?: string;
  CVV?: string;
  Installments?: number;
  SaveCard?: boolean;
}

/**
 * Payment initialization request
 */
export interface PaymentInitRequest {
  SessionId: string;
  PartnerUniqueId: string;
  TotalAmount: number;
  PaymentMethods: PaymentMethodData[];
  Customer?: any;
  ReturnUrl?: string;
}

/**
 * Card data interface for tokenization
 */
export interface CardData {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv?: string;
  data?: any;
}

/**
 * Main Tuna API Client Class
 */
export class TunaApiClient {
  private config: any;
  private debug: boolean;
  private sessionId?: string;

  constructor(environment: Environment = 'production', debug: boolean = false) {
    this.config = TUNA_CONFIGS[environment];
    this.debug = debug;
  }

  /**
   * Set session ID for API calls
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Make HTTP request to Tuna API
   */
  async makeApiRequest(url: string, data: any, useSessionHeader: boolean = false): Promise<any> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=UTF-8',
      };

      // For certain endpoints, use session ID in header instead of body
      if (useSessionHeader && this.sessionId) {
        headers['X-Session-Id'] = this.sessionId;
      }

      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      };

      if (this.debug) {
        console.log('🌐 [TunaApi] Making request to:', url);
        console.log('🌐 [TunaApi] Request data:', data);
      }

      const response = await fetch(url, options);
      
      if (this.debug) {
        console.log('🌐 [TunaApi] Response status:', response.status);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      let result;
      if (contentLength === '0' || !contentType?.includes('application/json')) {
        result = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          message: response.ok ? 'Success' : `HTTP ${response.status}: ${response.statusText}`,
        };
      } else {
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('❌ [TunaApi] Failed to parse JSON response:', parseError);
          result = {
            success: false,
            error: 'Invalid JSON response',
            status: response.status,
            statusText: response.statusText,
          };
        }
      }

      if (this.debug) {
        console.log('🌐 [TunaApi] Response data:', result);
      }

      // Check for API-level errors
      if (!response.ok && !result.success) {
        throw new TunaPaymentError(`API request failed: ${response.status} ${response.statusText}`, result);
      }

      return result;
    } catch (error) {
      console.error('❌ [TunaApi] Request failed:', error);
      throw new TunaPaymentError(
        'API request failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Generate a token for a credit card
   */
  async generateToken(cardData: CardData): Promise<TokenResponse> {
    if (!this.sessionId) {
      throw new TunaPaymentError('Session ID not set');
    }

    const preparedCardData = {
      cardNumber: cardData.cardNumber,
      cardHolderName: cardData.cardHolderName,
      expirationMonth: cardData.expirationMonth,
      expirationYear: cardData.expirationYear,
      cvv: cardData.cvv,
      ...cardData.data,
    };

    const requestData = {
      SessionId: this.sessionId,
      card: preparedCardData,
      authenticationInformation: { code: this.sessionId },
    };

    return await this.makeApiRequest(`${this.config.TOKEN_API_URL}/Generate`, requestData);
  }

  /**
   * List saved tokens
   */
  async listTokens(): Promise<any> {
    if (!this.sessionId) {
      throw new TunaPaymentError('Session ID not set');
    }

    const requestData = {
      SessionId: this.sessionId,
    };

    return await this.makeApiRequest(`${this.config.TOKEN_API_URL}/List`, requestData);
  }

  /**
   * Bind a token with CVV
   */
  async bindToken(token: string, cvv: string): Promise<any> {
    if (!this.sessionId) {
      throw new TunaPaymentError('Session ID not set');
    }

    const requestData = {
      SessionId: this.sessionId,
      token,
      cvv,
      authenticationInformation: { code: this.sessionId },
    };

    return await this.makeApiRequest(`${this.config.TOKEN_API_URL}/Bind`, requestData);
  }

  /**
   * Delete a saved token
   */
  async deleteToken(token: string): Promise<any> {
    if (!this.sessionId) {
      throw new TunaPaymentError('Session ID not set');
    }

    const requestData = {
      SessionId: this.sessionId,
      token,
    };

    return await this.makeApiRequest(`${this.config.TOKEN_API_URL}/Delete`, requestData);
  }

  /**
   * Initialize payment
   */
  async initializePayment(request: PaymentInitRequest): Promise<any> {
    return await this.makeApiRequest(`${this.config.INTEGRATIONS_API_URL}/Init`, request);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentKey: string, methodId?: string | number): Promise<any> {
    if (!this.sessionId) {
      throw new TunaPaymentError('Session ID not set');
    }

    const requestData: any = {
      paymentKey,
      sessionId: this.sessionId,
    };

    if (methodId !== undefined) {
      requestData.methodId = methodId;
    }

    return await this.makeApiRequest(`${this.config.INTEGRATIONS_API_URL}/Status`, requestData);
  }

  /**
   * Process native payment (Apple Pay, Google Pay)
   */
  async processNativePayment(paymentToken: any, paymentMethod: string, amount: number, currency: string = 'BRL'): Promise<any> {
    if (!this.sessionId) {
      throw new TunaPaymentError('Session ID not set');
    }

    const requestData = {
      TokenSession: this.sessionId,
      Amount: amount,
      PaymentMethod: paymentMethod,
      PaymentData: paymentToken,
      Currency: currency
    };

    return await this.makeApiRequest(`${this.config.INTEGRATIONS_API_URL}/Init`, requestData);
  }

  /**
   * Get API configuration
   */
  getConfig() {
    return this.config;
  }
}