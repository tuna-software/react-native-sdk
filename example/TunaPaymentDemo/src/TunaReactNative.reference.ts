/**
 * Main TunaReactNative SDK Class
 * 
 * Provides a unified interface for all Tuna payment operations in React Native apps.
 * Supports Apple Pay, Google Pay, credit cards, PIX, and other payment methods.
 * 
 * This is the main entry point for the Tuna React Native SDK, orchestrating all
 * the underlying components to provide a simple, developer-friendly API.
 */

import { Platform } from 'react-native';
import { 
  SessionManager,
  TokenizationManager,
  PaymentManager,
  ThreeDSHandler,
  AntifraudManager,
  StatusPoller
} from './core';
import { ReactNativePaymentsAdapter } from './adapters/ReactNativePaymentsAdapter';
import { ApplePayAdapter } from './adapters/ApplePayAdapter';
import { GooglePayAdapter } from './adapters/GooglePayAdapter';
import type {
  TunaPaymentConfig,
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
  PaymentResult,
  ApplePayResult,
  GooglePayResult,
  CardData,
  TokenResult,
  SavedCard,
  BindResult,
  DeleteResult,
  PaymentData,
  StatusResult,
  PIXResult,
  CustomerInfo,
  PaymentMethodConfig,
  ThreeDSResult,
  AntifraudConfig,
  StatusPollingConfig,
  StatusCallback,
  PaymentRequest,
  Environment,
} from './types/payment';
import type { SessionConfig } from './types/session';
import { TunaError, TunaErrorCodes, TunaPaymentError, createTunaError } from './types/errors';
import { validateCardData, validateCustomerInfo } from './utils/validation';

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
export class TunaReactNative {
  private session: SessionManager;
  private tokenizer: TokenizationManager;
  private payment: PaymentManager;
  private threeds: ThreeDSHandler;
  private antifraud: AntifraudManager;
  private statusPoller: StatusPoller;
  private adapter: ReactNativePaymentsAdapter;
  private applePayAdapter?: ApplePayAdapter;
  private googlePayAdapter?: GooglePayAdapter;
  private isInitialized = false;
  private config: TunaReactNativeConfig;
  private currentSessionId?: string;

  constructor(config: TunaReactNativeConfig) {
    this.config = config;
    
    // Determine base URL from environment
    const baseUrl = config.baseUrl || (config.environment === 'production' 
      ? 'https://token.tunagateway.com' 
      : 'https://token.tuna-demo.uy');

    // Initialize core managers with proper configuration
    const sessionConfig = {
      baseUrl,
      environment: config.environment,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000,
      debug: config.debug || false,
    };

    this.session = new SessionManager(sessionConfig);
    this.tokenizer = new TokenizationManager(this.session, { baseUrl });
    this.payment = new PaymentManager(this.session, this.tokenizer, { 
      baseUrl,
      environment: config.environment,
      timeout: 30000
    });
    this.threeds = new ThreeDSHandler({ baseUrl, sessionId: '', timeout: 30000 });
    this.antifraud = new AntifraudManager('', {});
    this.statusPoller = new StatusPoller(baseUrl, '');

    // Initialize payments adapter (will be reconfigured during initialization)
    this.adapter = new ReactNativePaymentsAdapter(
      this.session,
      this.tokenizer,
      this.payment,
      { sessionId: '', environment: config.environment }
    );
  }

  /**
   * Initialize the SDK with a session
   * @param sessionId The session ID from Tuna backend
   * @param customerInfo Optional customer information
   */
  async initialize(sessionId: string, customerInfo?: CustomerInfo): Promise<void> {
    try {
      this.currentSessionId = sessionId;
      
      // Update adapter configuration
      this.adapter = new ReactNativePaymentsAdapter(
        this.session,
        this.tokenizer,
        this.payment,
        { sessionId, environment: this.config.environment }
      );

      // Initialize session (using createSession method that exists)
      await this.session.createSession({ sessionId });

      // Initialize anti-fraud if configured
      if (this.config.antifraudConfig) {
        await this.antifraud.initializeProviders(this.config.antifraudConfig);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to initialize TunaReactNative SDK: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Check if the SDK is initialized
   */
  isReady(): boolean {
    return this.isInitialized && !!this.currentSessionId;
  }

  // ===========================================
  // APPLE PAY METHODS
  // ===========================================

  /**
   * Check if Apple Pay is available on this device
   */
  async canMakeApplePayPayments(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      return await this.getApplePayAdapter().canMakePayments();
    } catch (error) {
      if (this.config.debug) {
        console.warn('Apple Pay availability check failed:', error);
      }
      return false;
    }
  }

  /**
   * Setup Apple Pay configuration
   */
  async setupApplePay(config: ApplePayConfig): Promise<void> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'ios') {
      throw new TunaPaymentError('Apple Pay is only available on iOS');
    }

    try {
      const adapter = this.getApplePayAdapter();
      await adapter.setup(config);
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to setup Apple Pay: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Show Apple Pay payment sheet
   */
  async showApplePaySheet(paymentDetails: PaymentDetails): Promise<ApplePayResult> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'ios') {
      throw new TunaPaymentError('Apple Pay is only available on iOS');
    }

    try {
      const adapter = this.getApplePayAdapter();
      return await adapter.showPaymentSheet(paymentDetails);
    } catch (error) {
      throw new TunaPaymentError(
        'Apple Pay payment failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  // ===========================================
  // GOOGLE PAY METHODS
  // ===========================================

  /**
   * Check if Google Pay is ready to pay
   */
  async isGooglePayReady(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      return await this.getGooglePayAdapter().canMakePayments();
    } catch (error) {
      if (this.config.debug) {
        console.warn('Google Pay readiness check failed:', error);
      }
      return false;
    }
  }

  /**
   * Setup Google Pay configuration
   */
  async setupGooglePay(config: GooglePayConfig): Promise<void> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'android') {
      throw new TunaPaymentError('Google Pay is only available on Android');
    }

    try {
      const adapter = this.getGooglePayAdapter();
      await adapter.setup(config);
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to setup Google Pay: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Request Google Pay payment
   */
  async requestGooglePayment(paymentDetails: PaymentDetails): Promise<GooglePayResult> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'android') {
      throw new TunaPaymentError('Google Pay is only available on Android');
    }

    try {
      const adapter = this.getGooglePayAdapter();
      return await adapter.showPaymentSheet(paymentDetails);
    } catch (error) {
      throw new TunaPaymentError(
        'Google Pay payment failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  // ===========================================
  // CREDIT CARD METHODS
  // ===========================================

  /**
   * Tokenize a credit card
   */
  async tokenizeCard(cardData: CardData): Promise<TokenResult> {
    this.ensureInitialized();
    
    try {
      // Validate card data
      const validation = validateCardData(cardData);
      if (!validation.isValid) {
        throw new TunaPaymentError(
          `Card validation failed: ${validation.errors.join(', ')}`
        );
      }

      // Convert CardData to TokenizationRequest format
      const tokenRequest = {
        cardholderName: cardData.cardHolderName,
        cardNumber: cardData.cardNumber,
        expirationMonth: cardData.expirationMonth,
        expirationYear: cardData.expirationYear,
        cvv: cardData.cvv,
        singleUse: cardData.singleUse || false
      };

      const response = await this.tokenizer.generateToken(tokenRequest);
      
      // Convert response to TokenResult format
      return {
        success: !!response.token,
        token: response.token,
        brand: response.brand,
        validFor: response.validFor
      };
    } catch (error) {
      if (error instanceof TunaPaymentError) {
        throw error;
      }
      throw new TunaPaymentError(
        'Card tokenization failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * List saved cards for the current session
   */
  async listSavedCards(): Promise<SavedCard[]> {
    this.ensureInitialized();
    
    try {
      const request = { sessionId: this.currentSessionId! };
      const tokens = await this.tokenizer.listTokens(request);
      
      // Convert SavedToken[] to SavedCard[] format
      return tokens.map(token => ({
        token: token.token,
        brand: token.brand || 'unknown',
        cardHolderName: token.cardholderName || '',
        expirationMonth: token.expirationMonth || 0,
        expirationYear: token.expirationYear || 0,
        maskedNumber: token.maskedNumber || '',
        singleUse: token.singleUse || false,
        data: token
      }));
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to list saved cards: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Bind a saved card with CVV
   */
  async bindSavedCard(token: string, cvv: string): Promise<BindResult> {
    this.ensureInitialized();
    
    try {
      const request = { token, cvv };
      const success = await this.tokenizer.bindToken(request);
      
      return {
        success: success,
        validFor: success ? 3600 : undefined // Default 1 hour if successful
      };
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to bind saved card: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Delete a saved card
   */
  async deleteSavedCard(token: string): Promise<DeleteResult> {
    this.ensureInitialized();
    
    try {
      const request = { token };
      const success = await this.tokenizer.deleteToken(request);
      
      return {
        success: success,
        status: success ? 'deleted' : 'failed'
      };
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to delete saved card: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  // ===========================================
  // PAYMENT PROCESSING METHODS
  // ===========================================

  /**
   * Process a payment
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    this.ensureInitialized();
    
    try {
      // Collect anti-fraud data if enabled
      if (this.config.antifraudConfig) {
        const antifraudData = await this.antifraud.collectDeviceData();
        paymentRequest.antifraudData = antifraudData;
      }

      // Process the payment using the payment manager
      const result = await this.payment.initializePayment(paymentRequest);

      // Handle 3DS if required
      if (result.threeDSData) {
        const threeDSResult = await this.threeds.handleChallenge(result.threeDSData);
        if (!threeDSResult.success) {
          throw new TunaPaymentError('3D Secure authentication failed');
        }
      }

      return result;
    } catch (error) {
      if (error instanceof TunaPaymentError) {
        throw error;
      }
      throw new TunaPaymentError(
        'Payment processing failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(methodId: string, paymentKey: string): Promise<StatusResult> {
    this.ensureInitialized();
    
    try {
      const request = { paymentId: `${methodId}:${paymentKey}` };
      const response = await this.payment.getPaymentStatus(request);
      
      // Convert to StatusResult format
      return {
        success: true,
        paymentApproved: response.status === 'success',
        paymentStatusFound: response.status,
        paymentMethodConfirmed: !!response.transactionId,
        allowRetry: response.status === 'pending'
      };
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to get payment status: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Start polling payment status with automatic updates
   */
  async startStatusPolling(
    methodId: string, 
    paymentKey: string, 
    callback: StatusCallback,
    config?: StatusPollingConfig
  ): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.statusPoller.startPolling(`${methodId}:${paymentKey}`, callback, config);
    } catch (error) {
      throw new TunaPaymentError(
        'Failed to start status polling: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Stop polling payment status
   */
  async stopStatusPolling(methodId: string, paymentKey: string): Promise<void> {
    try {
      await this.statusPoller.stopPolling(`${methodId}:${paymentKey}`);
    } catch (error) {
      if (this.config.debug) {
        console.warn('Failed to stop status polling:', error);
      }
    }
  }

  // ===========================================
  // PIX PAYMENT METHODS
  // ===========================================

  /**
   * Initiate PIX payment
   */
  async initiatePIXPayment(amount: number, customer: CustomerInfo): Promise<PIXResult> {
    this.ensureInitialized();
    
    try {
      // Validate customer info
      const validation = validateCustomerInfo(customer);
      if (!validation.isValid) {
        throw new TunaPaymentError(
          `Customer validation failed: ${validation.errors.join(', ')}`
        );
      }

      const paymentRequest: PaymentRequest = {
        amount,
        currency: 'BRL',
        orderId: `pix_${Date.now()}`,
        paymentMethod: 'pix',
        metadata: { customer }
      };

      // Use generic payment initialization for PIX
      const result = await this.payment.initializePayment(paymentRequest);
      
      return {
        success: result.success || false,
        qrCode: result.qrCodeData?.qrCode,
        qrCodeBase64: result.qrCodeData?.qrCodeBase64,
        paymentKey: result.paymentKey,
        expiresAt: result.qrCodeData?.expiresAt
      };
    } catch (error) {
      if (error instanceof TunaPaymentError) {
        throw error;
      }
      throw new TunaPaymentError(
        'PIX payment initiation failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Cleanup resources and stop any ongoing operations
   */
  async cleanup(): Promise<void> {
    try {
      // Stop any ongoing status polling
      // Note: Individual polling cleanup is handled automatically
      
      this.isInitialized = false;
      this.currentSessionId = undefined;
    } catch (error) {
      if (this.config.debug) {
        console.warn('Cleanup failed:', error);
      }
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | undefined {
    return this.currentSessionId;
  }

  /**
   * Get current environment
   */
  getEnvironment(): Environment {
    return this.config.environment;
  }

  // ===========================================
  // PRIVATE HELPER METHODS
  // ===========================================

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.currentSessionId) {
      throw new TunaPaymentError(
        'TunaReactNative SDK is not initialized. Call initialize() first.'
      );
    }
  }

  private getApplePayAdapter(): ApplePayAdapter {
    if (!this.applePayAdapter) {
      this.applePayAdapter = new ApplePayAdapter(this.adapter);
    }
    return this.applePayAdapter;
  }

  private getGooglePayAdapter(): GooglePayAdapter {
    if (!this.googlePayAdapter) {
      this.googlePayAdapter = new GooglePayAdapter(this.adapter);
    }
    return this.googlePayAdapter;
  }
}

// ===========================================
// FACTORY FUNCTIONS
// ===========================================

/**
 * Create a new TunaReactNative instance
 */
export function createTunaReactNative(config: TunaReactNativeConfig): TunaReactNative {
  return new TunaReactNative(config);
}

/**
 * Create Apple Pay adapter from existing TunaReactNative instance
 */
export function createApplePayAdapter(tunaSDK: TunaReactNative): ApplePayAdapter {
  if (!tunaSDK.isReady()) {
    throw new TunaPaymentError(
      'TunaReactNative SDK must be initialized before creating adapters'
    );
  }
  
  return new ApplePayAdapter((tunaSDK as any).adapter);
}

/**
 * Create Google Pay adapter from existing TunaReactNative instance
 */
export function createGooglePayAdapter(tunaSDK: TunaReactNative): GooglePayAdapter {
  if (!tunaSDK.isReady()) {
    throw new TunaPaymentError(
      'TunaReactNative SDK must be initialized before creating adapters'
    );
  }
  
  return new GooglePayAdapter((tunaSDK as any).adapter);
}