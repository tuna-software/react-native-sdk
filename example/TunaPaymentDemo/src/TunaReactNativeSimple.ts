/**
 * Main TunaReactNative SDK Class (Simplified Implementation)
 * 
 * This is a simplified implementation of the main SDK class that works with
 * the existing core components. It provides the basic unified interface
 * while adapting to the current implementation constraints.
 */

import { Platform } from 'react-native';
import type {
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
  PaymentResult,
  ApplePayResult,
  GooglePayResult,
  PIXResult,
  CustomerInfo,
  Environment,
} from './types/payment';
import { TunaPaymentError } from './types/errors';
import { validateCustomerInfo } from './utils/validation';

/**
 * Main TunaReactNative SDK Configuration
 */
export interface TunaReactNativeConfig {
  /** Environment to use for payments (defaults to 'production') */
  environment?: Environment;
  /** Session timeout in milliseconds (default: 30 minutes) */
  sessionTimeout?: number;
  /** Base URL override (optional, auto-determined from environment) */
  baseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<TunaReactNativeConfig> = {
  environment: 'production',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  baseUrl: '',
  debug: false,
};

/**
 * Main TunaReactNative SDK Class
 * 
 * This class provides a unified interface for payment operations.
 * It's designed to be simple and extensible for Phase 5.
 */
export class TunaReactNative {
  private config: Required<TunaReactNativeConfig>;
  private isInitialized = false;
  private currentSessionId?: string;

  constructor(config: TunaReactNativeConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize the SDK with a session
   */
  async initialize(sessionId: string): Promise<void> {
    try {
      this.currentSessionId = sessionId;
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
      // For now, return a basic platform check
      // This would be enhanced with actual Apple Pay availability check
      return true;
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
      // Store Apple Pay configuration
      // This would be enhanced to actually configure the adapter
      if (this.config.debug) {
        console.log('Apple Pay configured:', config);
      }
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
      // This would integrate with the actual Apple Pay adapter
      // For now, return a mock result
      return {
        paymentId: `apple_pay_${Date.now()}`,
        status: 'pending',
        createdAt: new Date(),
        success: true,
        applePayToken: 'mock_apple_pay_token'
      };
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
      // For now, return a basic platform check
      // This would be enhanced with actual Google Pay readiness check
      return true;
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
      // Store Google Pay configuration
      // This would be enhanced to actually configure the adapter
      if (this.config.debug) {
        console.log('Google Pay configured:', config);
      }
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
      // This would integrate with the actual Google Pay adapter
      // For now, return a mock result
      return {
        paymentId: `google_pay_${Date.now()}`,
        status: 'pending',
        createdAt: new Date(),
        success: true,
        googlePayToken: 'mock_google_pay_token'
      };
    } catch (error) {
      throw new TunaPaymentError(
        'Google Pay payment failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
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

      // This would integrate with the actual PIX payment processing
      // For now, return a mock result
      return {
        success: true,
        qrCode: `pix_qr_code_${Date.now()}`,
        qrCodeBase64: 'mock_base64_qr_code',
        paymentKey: `pix_${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
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
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
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
 * Create a new TunaReactNative instance with production environment (convenience function)
 */
export function createProductionTunaReactNative(config?: Omit<TunaReactNativeConfig, 'environment'>): TunaReactNative {
  return new TunaReactNative({ ...config, environment: 'production' });
}

/**
 * Create a new TunaReactNative instance with sandbox environment (for testing)
 */
export function createSandboxTunaReactNative(config?: Omit<TunaReactNativeConfig, 'environment'>): TunaReactNative {
  return new TunaReactNative({ ...config, environment: 'sandbox' });
}