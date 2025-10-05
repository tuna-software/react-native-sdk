/**
 * Google Pay adapter for Tuna React Native SDK
 * 
 * Provides Google Pay integration using @rnw-community/react-native-payments
 */

import { PaymentRequest } from '@rnw-community/react-native-payments';
import { 
  GooglePayConfig,
  PaymentDetails,
  PaymentResult,
  GooglePayResult
} from '../types/payment';
import { ReactNativePaymentsAdapter } from './ReactNativePaymentsAdapter';
import { TunaNativePaymentError } from '../utils/errors';

export class GooglePayAdapter {
  private baseAdapter: ReactNativePaymentsAdapter;
  private config?: GooglePayConfig;

  constructor(baseAdapter: ReactNativePaymentsAdapter) {
    this.baseAdapter = baseAdapter;
  }

  /**
   * Checks if Google Pay is available on the device
   */
  async canMakePayments(): Promise<boolean> {
    try {
      const { Platform } = require('react-native');
      
      // Google Pay is only available on Android
      if (Platform.OS !== 'android') {
        return false;
      }

      // Check if Google Pay is configured
      if (!this.config) {
        return false;
      }

      // Create a minimal payment request to test capability
      const testMethodData = [{
        supportedMethods: ['google-pay'],
        data: {
          environment: this.config.environment,
          apiVersion: this.config.apiVersion,
          apiVersionMinor: this.config.apiVersionMinor,
          merchantInfo: {
            merchantName: this.config.merchantInfo.merchantName,
            merchantId: this.config.merchantInfo.merchantId,
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: this.config.allowedAuthMethods,
              allowedCardNetworks: this.config.allowedCardNetworks as any, // Type conversion
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: this.config.tokenizationSpecification.parameters,
            },
          }],
        },
      }];

      const testDetails = {
        total: {
          label: 'Test',
          amount: {
            currency: this.config.currencyCode || 'USD',
            value: '0.01',
          },
        },
      };

      const paymentRequest = new PaymentRequest(testMethodData as any, testDetails);
      return await paymentRequest.canMakePayment();
    } catch (error) {
      console.warn('Google Pay capability check failed:', error);
      return false;
    }
  }

  /**
   * Initializes Google Pay with the provided configuration
   */
  async setup(config: GooglePayConfig): Promise<void> {
    try {
      const { Platform } = require('react-native');
      
      if (Platform.OS !== 'android') {
        throw new TunaNativePaymentError('Google Pay is only available on Android');
      }

      // Validate configuration
      this.validateGooglePayConfig(config);
      
      this.config = config;
      
      // Test if Google Pay can be configured with these settings
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Google Pay cannot be configured with the provided settings');
      }
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to setup Google Pay');
    }
  }

  /**
   * Shows the Google Pay payment sheet
   */
  async showPaymentSheet(paymentDetails: PaymentDetails): Promise<GooglePayResult> {
    try {
      if (!this.config) {
        throw new TunaNativePaymentError('Google Pay must be configured before showing payment sheet');
      }

      // Check if Google Pay is available
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Google Pay is not available');
      }

      // Create Google Pay specific payment request
      const methodData = [{
        supportedMethods: ['google-pay'],
        data: {
          environment: this.config.environment,
          apiVersion: this.config.apiVersion,
          apiVersionMinor: this.config.apiVersionMinor,
          merchantInfo: {
            merchantName: this.config.merchantInfo.merchantName,
            merchantId: this.config.merchantInfo.merchantId,
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: this.config.allowedAuthMethods,
              allowedCardNetworks: this.config.allowedCardNetworks as any, // Type conversion
              billingAddressRequired: this.config.billingAddressRequired,
              billingAddressParameters: this.config.billingAddressParameters,
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: this.config.tokenizationSpecification.parameters,
            },
          }],
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: paymentDetails.total.amount.value,
            currencyCode: this.config.currencyCode || paymentDetails.total.amount.currency,
          },
          shippingAddressRequired: this.config.shippingAddressRequired,
          shippingAddressParameters: this.config.shippingAddressParameters,
          emailRequired: this.config.emailRequired,
        },
      }];

      const details = {
        id: paymentDetails.id || `google-pay-${Date.now()}`,
        displayItems: paymentDetails.displayItems,
        total: paymentDetails.total,
        shippingOptions: paymentDetails.shippingOptions,
      };

      const paymentRequest = new PaymentRequest(methodData as any, details);

      // Show Google Pay sheet
      const paymentResponse = await paymentRequest.show();

      // Process the response through the base adapter
      const result = await this.baseAdapter.processNativePaymentResponse(paymentResponse, paymentDetails);

      return {
        ...result,
        googlePayToken: (paymentResponse.details as any)?.paymentMethodData?.tokenizationData?.token,
        success: result.status === 'success',
      };
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to show Google Pay payment sheet');
    }
  }

  /**
   * Validates Google Pay configuration
   */
  private validateGooglePayConfig(config: GooglePayConfig): void {
    if (!config.environment) {
      throw new TunaNativePaymentError('Google Pay environment is required');
    }

    if (!['TEST', 'PRODUCTION'].includes(config.environment)) {
      throw new TunaNativePaymentError('Google Pay environment must be TEST or PRODUCTION');
    }

    if (!config.merchantInfo) {
      throw new TunaNativePaymentError('Google Pay merchant info is required');
    }

    if (!config.merchantInfo.merchantName) {
      throw new TunaNativePaymentError('Google Pay merchant name is required');
    }

    if (!config.allowedAuthMethods || config.allowedAuthMethods.length === 0) {
      throw new TunaNativePaymentError('Google Pay allowed auth methods are required');
    }

    if (!config.allowedCardNetworks || config.allowedCardNetworks.length === 0) {
      throw new TunaNativePaymentError('Google Pay allowed card networks are required');
    }

    if (!config.tokenizationSpecification) {
      throw new TunaNativePaymentError('Google Pay tokenization specification is required');
    }

    if (!config.tokenizationSpecification.parameters) {
      throw new TunaNativePaymentError('Google Pay tokenization parameters are required');
    }

    // Validate auth methods
    const validAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
    for (const method of config.allowedAuthMethods) {
      if (!validAuthMethods.includes(method)) {
        throw new TunaNativePaymentError(`Invalid Google Pay auth method: ${method}`);
      }
    }

    // Validate card networks
    const validNetworks = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
    for (const network of config.allowedCardNetworks) {
      if (!validNetworks.includes(network.toUpperCase())) {
        throw new TunaNativePaymentError(`Invalid Google Pay card network: ${network}`);
      }
    }

    // Validate API version
    if (typeof config.apiVersion !== 'number' || config.apiVersion < 1) {
      throw new TunaNativePaymentError('Google Pay API version must be a positive number');
    }

    if (typeof config.apiVersionMinor !== 'number' || config.apiVersionMinor < 0) {
      throw new TunaNativePaymentError('Google Pay API version minor must be a non-negative number');
    }
  }

  /**
   * Gets the current Google Pay configuration
   */
  getConfig(): GooglePayConfig | undefined {
    return this.config;
  }

  /**
   * Checks if Google Pay is properly configured
   */
  isConfigured(): boolean {
    return !!this.config;
  }

  /**
   * Resets the Google Pay configuration
   */
  reset(): void {
    this.config = undefined;
  }

  /**
   * Gets Google Pay capabilities for the current configuration
   */
  async getCapabilities(): Promise<{
    canMakePayments: boolean;
    allowedCardNetworks: string[];
    environment?: string;
  }> {
    const canMakePayments = await this.canMakePayments();
    
    return {
      canMakePayments,
      allowedCardNetworks: this.config?.allowedCardNetworks || [],
      environment: this.config?.environment,
    };
  }

  /**
   * Creates a formatted Google Pay configuration for debugging
   */
  getDebugInfo(): Record<string, any> {
    return {
      configured: this.isConfigured(),
      config: this.config ? {
        environment: this.config.environment,
        apiVersion: this.config.apiVersion,
        apiVersionMinor: this.config.apiVersionMinor,
        merchantInfo: this.config.merchantInfo,
        allowedAuthMethods: this.config.allowedAuthMethods,
        allowedCardNetworks: this.config.allowedCardNetworks,
        billingAddressRequired: this.config.billingAddressRequired,
        shippingAddressRequired: this.config.shippingAddressRequired,
        emailRequired: this.config.emailRequired,
        currencyCode: this.config.currencyCode,
      } : null,
    };
  }
}

/**
 * Creates a new Google Pay adapter instance
 */
export function createGooglePayAdapter(baseAdapter: ReactNativePaymentsAdapter): GooglePayAdapter {
  return new GooglePayAdapter(baseAdapter);
}