/**
 * Apple Pay adapter for Tuna React Native SDK
 * 
 * Provides Apple Pay integration using @rnw-community/react-native-payments
 */

import { PaymentRequest } from '@rnw-community/react-native-payments';
import { 
  ApplePayConfig,
  PaymentDetails,
  PaymentResult,
  ApplePayResult
} from '../types/payment';
import { ReactNativePaymentsAdapter } from './ReactNativePaymentsAdapter';
import { TunaNativePaymentError } from '../utils/errors';

export class ApplePayAdapter {
  private baseAdapter: ReactNativePaymentsAdapter;
  private config?: ApplePayConfig;

  constructor(baseAdapter: ReactNativePaymentsAdapter) {
    this.baseAdapter = baseAdapter;
  }

  /**
   * Checks if Apple Pay is available on the device
   */
  async canMakePayments(): Promise<boolean> {
    try {
      const { Platform } = require('react-native');
      
      // Apple Pay is only available on iOS
      if (Platform.OS !== 'ios') {
        return false;
      }

      // Check if Apple Pay is supported and configured
      if (!this.config) {
        return false;
      }

      // Create a minimal payment request to test capability
      const testMethodData = [{
        supportedMethods: ['apple-pay'],
        data: {
          merchantIdentifier: this.config.merchantIdentifier,
          supportedNetworks: this.config.supportedNetworks as any, // Type conversion for library compatibility
          countryCode: this.config.countryCode,
          currencyCode: this.config.currencyCode,
        },
      }];

      const testDetails = {
        total: {
          label: 'Test',
          amount: {
            currency: this.config.currencyCode,
            value: '0.01',
          },
        },
      };

      const paymentRequest = new PaymentRequest(testMethodData as any, testDetails);
      return await paymentRequest.canMakePayment();
    } catch (error) {
      console.warn('Apple Pay capability check failed:', error);
      return false;
    }
  }

  /**
   * Initializes Apple Pay with the provided configuration
   */
  async setup(config: ApplePayConfig): Promise<void> {
    try {
      const { Platform } = require('react-native');
      
      if (Platform.OS !== 'ios') {
        throw new TunaNativePaymentError('Apple Pay is only available on iOS');
      }

      // Validate configuration
      this.validateApplePayConfig(config);
      
      this.config = config;
      
      // Test if Apple Pay can be configured with these settings
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Apple Pay cannot be configured with the provided settings');
      }
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to setup Apple Pay');
    }
  }

  /**
   * Shows the Apple Pay payment sheet
   */
  async showPaymentSheet(paymentDetails: PaymentDetails): Promise<ApplePayResult> {
    try {
      if (!this.config) {
        throw new TunaNativePaymentError('Apple Pay must be configured before showing payment sheet');
      }

      // Check if Apple Pay is available
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Apple Pay is not available');
      }

      // Create Apple Pay specific payment request
      const methodData = [{
        supportedMethods: ['apple-pay'],
        data: {
          merchantIdentifier: this.config.merchantIdentifier,
          supportedNetworks: this.config.supportedNetworks as any, // Type conversion for library compatibility
          countryCode: this.config.countryCode,
          currencyCode: this.config.currencyCode,
          requestBillingAddress: this.config.requestBillingAddress,
          requestPayerEmail: this.config.requestPayerEmail,
          requestShipping: this.config.requestShipping,
        },
      }];

      const details = {
        id: paymentDetails.id || `apple-pay-${Date.now()}`,
        displayItems: paymentDetails.displayItems,
        total: paymentDetails.total,
        shippingOptions: paymentDetails.shippingOptions,
      };

      const paymentRequest = new PaymentRequest(methodData as any, details);

      // Show Apple Pay sheet
      const paymentResponse = await paymentRequest.show();

      // Process the response through the base adapter
      const result = await this.baseAdapter.processNativePaymentResponse(paymentResponse, paymentDetails);

      return {
        ...result,
        applePayToken: (paymentResponse.details as any)?.paymentToken,
        success: result.status === 'success',
      };
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to show Apple Pay payment sheet');
    }
  }

  /**
   * Validates Apple Pay configuration
   */
  private validateApplePayConfig(config: ApplePayConfig): void {
    if (!config.merchantIdentifier) {
      throw new TunaNativePaymentError('Apple Pay merchant identifier is required');
    }

    if (!config.supportedNetworks || config.supportedNetworks.length === 0) {
      throw new TunaNativePaymentError('Apple Pay supported networks are required');
    }

    if (!config.countryCode) {
      throw new TunaNativePaymentError('Apple Pay country code is required');
    }

    if (!config.currencyCode) {
      throw new TunaNativePaymentError('Apple Pay currency code is required');
    }

    // Validate supported networks
    const validNetworks = ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay'];
    for (const network of config.supportedNetworks) {
      if (!validNetworks.includes(network.toLowerCase())) {
        throw new TunaNativePaymentError(`Unsupported Apple Pay network: ${network}`);
      }
    }

    // Validate currency code format (should be 3-letter ISO code)
    if (!/^[A-Z]{3}$/.test(config.currencyCode)) {
      throw new TunaNativePaymentError('Apple Pay currency code must be a 3-letter ISO code');
    }

    // Validate country code format (should be 2-letter ISO code)
    if (!/^[A-Z]{2}$/.test(config.countryCode)) {
      throw new TunaNativePaymentError('Apple Pay country code must be a 2-letter ISO code');
    }
  }

  /**
   * Gets the current Apple Pay configuration
   */
  getConfig(): ApplePayConfig | undefined {
    return this.config;
  }

  /**
   * Checks if Apple Pay is properly configured
   */
  isConfigured(): boolean {
    return !!this.config;
  }

  /**
   * Resets the Apple Pay configuration
   */
  reset(): void {
    this.config = undefined;
  }

  /**
   * Gets Apple Pay capabilities for the current configuration
   */
  async getCapabilities(): Promise<{
    canMakePayments: boolean;
    supportedNetworks: string[];
    merchantIdentifier?: string;
  }> {
    const canMakePayments = await this.canMakePayments();
    
    return {
      canMakePayments,
      supportedNetworks: this.config?.supportedNetworks || [],
      merchantIdentifier: this.config?.merchantIdentifier,
    };
  }

  /**
   * Creates a formatted Apple Pay configuration for debugging
   */
  getDebugInfo(): Record<string, any> {
    return {
      configured: this.isConfigured(),
      config: this.config ? {
        merchantIdentifier: this.config.merchantIdentifier,
        supportedNetworks: this.config.supportedNetworks,
        countryCode: this.config.countryCode,
        currencyCode: this.config.currencyCode,
        requestBillingAddress: this.config.requestBillingAddress,
        requestPayerEmail: this.config.requestPayerEmail,
        requestShipping: this.config.requestShipping,
      } : null,
    };
  }
}

/**
 * Creates a new Apple Pay adapter instance
 */
export function createApplePayAdapter(baseAdapter: ReactNativePaymentsAdapter): ApplePayAdapter {
  return new ApplePayAdapter(baseAdapter);
}