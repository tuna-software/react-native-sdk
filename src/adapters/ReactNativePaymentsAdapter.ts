/**
 * Base adapter for React Native Payments integration with Tuna
 * 
 * This adapter bridges @rnw-community/react-native-payments with Tuna's payment infrastructure
 */

import { PaymentRequest } from '@rnw-community/react-native-payments';
import { 
  TunaPaymentConfig,
  PaymentResult,
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
  PaymentMethodConfig
} from '../types/payment';
import { SessionManager } from '../core/session';
import { TokenizationManager } from '../core/tokenization';
import { PaymentManager } from '../core/payment';
import { TunaNativePaymentError, TunaPaymentError } from '../utils/errors';

export class ReactNativePaymentsAdapter {
  private sessionManager: SessionManager;
  private tokenizationManager: TokenizationManager;
  private paymentManager: PaymentManager;
  private config: TunaPaymentConfig;
  private supportedMethods: Set<string> = new Set();

  constructor(
    sessionManager: SessionManager,
    tokenizationManager: TokenizationManager,
    paymentManager: PaymentManager,
    config: TunaPaymentConfig
  ) {
    this.sessionManager = sessionManager;
    this.tokenizationManager = tokenizationManager;
    this.paymentManager = paymentManager;
    this.config = config;
  }

  /**
   * Initializes the adapter and checks for native payment capabilities
   */
  async initialize(): Promise<void> {
    try {
      // Check which payment methods are available
      await this.checkNativePaymentCapabilities();
    } catch (error) {
      throw new TunaNativePaymentError('Failed to initialize native payments adapter');
    }
  }

  /**
   * Checks what native payment capabilities are available
   */
  private async checkNativePaymentCapabilities(): Promise<void> {
    this.supportedMethods.clear();

    try {
      // We'll implement Apple Pay and Google Pay checks in their respective adapters
      // For now, we'll assume basic capability checking
      const { Platform } = require('react-native');
      
      if (Platform.OS === 'ios') {
        // Apple Pay might be available
        this.supportedMethods.add('apple-pay');
      } else if (Platform.OS === 'android') {
        // Google Pay might be available
        this.supportedMethods.add('google-pay');
      }

      // Credit cards are always supported through tokenization
      this.supportedMethods.add('credit-card');
    } catch (error) {
      // React Native might not be available in test environment
      console.warn('Platform detection failed, assuming test environment');
    }
  }

  /**
   * Converts Tuna payment configuration to React Native Payments format
   */
  createPaymentRequest(
    paymentDetails: PaymentDetails,
    methodConfig: PaymentMethodConfig
  ): PaymentRequest {
    const methodData: any[] = [];

    // Add supported payment methods based on configuration
    if (methodConfig.applePay && this.supportedMethods.has('apple-pay')) {
      methodData.push({
        supportedMethods: ['apple-pay'],
        data: {
          merchantIdentifier: methodConfig.applePay.merchantIdentifier,
          supportedNetworks: methodConfig.applePay.supportedNetworks,
          countryCode: methodConfig.applePay.countryCode,
          currencyCode: methodConfig.applePay.currencyCode,
          requestBillingAddress: methodConfig.applePay.requestBillingAddress,
          requestPayerEmail: methodConfig.applePay.requestPayerEmail,
          requestShipping: methodConfig.applePay.requestShipping,
        },
      });
    }

    if (methodConfig.googlePay && this.supportedMethods.has('google-pay')) {
      methodData.push({
        supportedMethods: ['google-pay'],
        data: {
          environment: methodConfig.googlePay.environment,
          apiVersion: methodConfig.googlePay.apiVersion || 2,
          apiVersionMinor: methodConfig.googlePay.apiVersionMinor || 0,
          merchantInfo: methodConfig.googlePay.merchantInfo,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: methodConfig.googlePay.allowedAuthMethods,
              allowedCardNetworks: methodConfig.googlePay.allowedCardNetworks,
              billingAddressRequired: methodConfig.googlePay.billingAddressRequired,
              billingAddressParameters: methodConfig.googlePay.billingAddressParameters,
            },
            tokenizationSpecification: methodConfig.googlePay.tokenizationSpecification,
          }],
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: paymentDetails.total.amount.value,
            currencyCode: methodConfig.googlePay.currencyCode || paymentDetails.total.amount.currency,
          },
          shippingAddressRequired: methodConfig.googlePay.shippingAddressRequired,
          shippingAddressParameters: methodConfig.googlePay.shippingAddressParameters,
          emailRequired: methodConfig.googlePay.emailRequired,
        },
      });
    }

    return new PaymentRequest(methodData, {
      id: paymentDetails.id || `tuna-${Date.now()}`,
      displayItems: paymentDetails.displayItems,
      total: paymentDetails.total,
      ...(paymentDetails.shippingOptions && { shippingOptions: paymentDetails.shippingOptions }),
    });
  }

  /**
   * Processes a native payment response and converts it to Tuna payment
   */
  async processNativePaymentResponse(
    paymentResponse: any,
    originalDetails: PaymentDetails
  ): Promise<PaymentResult> {
    try {
      if (!this.sessionManager.isSessionValid()) {
        throw new TunaPaymentError('Valid session required for payment processing');
      }

      // Extract payment method and token from the response
      const { methodName, details } = paymentResponse;

      let tunaPaymentRequest;

      switch (methodName) {
        case 'apple-pay':
          tunaPaymentRequest = await this.processApplePayResponse(details, originalDetails);
          break;
        
        case 'google-pay':
          tunaPaymentRequest = await this.processGooglePayResponse(details, originalDetails);
          break;
          
        default:
          throw new TunaNativePaymentError(`Unsupported payment method: ${methodName}`);
      }

      // Process payment through Tuna's payment manager
      const result = await this.paymentManager.initializePayment(tunaPaymentRequest);

      // Complete the payment response
      await paymentResponse.complete('success');

      return result;
    } catch (error) {
      // Complete the payment response with failure
      try {
        await paymentResponse.complete('fail');
      } catch (completeError) {
        console.warn('Failed to complete payment response:', completeError);
      }

      if (error instanceof TunaPaymentError || error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to process native payment response');
    }
  }

  /**
   * Processes Apple Pay payment response
   */
  private async processApplePayResponse(details: any, originalDetails: PaymentDetails) {
    return {
      amount: parseFloat(originalDetails.total.amount.value),
      currency: originalDetails.total.amount.currency,
      orderId: originalDetails.id || `apple-pay-${Date.now()}`,
      paymentMethod: 'apple_pay',
      nativePaymentData: {
        paymentToken: details.paymentToken,
        paymentMethod: details.paymentMethod,
        transactionIdentifier: details.transactionIdentifier,
        billingContact: details.billingContact,
        shippingContact: details.shippingContact,
      },
      metadata: {
        source: 'apple-pay',
        platform: 'ios',
      },
    };
  }

  /**
   * Processes Google Pay payment response
   */
  private async processGooglePayResponse(details: any, originalDetails: PaymentDetails) {
    return {
      amount: parseFloat(originalDetails.total.amount.value),
      currency: originalDetails.total.amount.currency,
      orderId: originalDetails.id || `google-pay-${Date.now()}`,
      paymentMethod: 'google_pay',
      nativePaymentData: {
        paymentToken: details.paymentToken,
        paymentMethodData: details.paymentMethodData,
        shippingAddress: details.shippingAddress,
        payerEmail: details.payerEmail,
      },
      metadata: {
        source: 'google-pay',
        platform: 'android',
      },
    };
  }

  /**
   * Shows the native payment sheet
   */
  async showPaymentSheet(
    paymentDetails: PaymentDetails,
    methodConfig: PaymentMethodConfig
  ): Promise<PaymentResult> {
    try {
      const paymentRequest = this.createPaymentRequest(paymentDetails, methodConfig);

      // Check if payment can be made
      const canMakePayment = await paymentRequest.canMakePayment();
      if (!canMakePayment) {
        throw new TunaNativePaymentError('No supported payment methods available');
      }

      // Show the payment sheet
      const paymentResponse = await paymentRequest.show();

      // Process the response
      return await this.processNativePaymentResponse(paymentResponse, paymentDetails);
    } catch (error) {
      if (error instanceof TunaNativePaymentError || error instanceof TunaPaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to show payment sheet');
    }
  }

  /**
   * Checks if the specified payment method is supported
   */
  isPaymentMethodSupported(method: string): boolean {
    return this.supportedMethods.has(method);
  }

  /**
   * Gets all supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return Array.from(this.supportedMethods);
  }

  /**
   * Validates payment method configuration
   */
  validatePaymentMethodConfig(methodConfig: PaymentMethodConfig): boolean {
    const { Platform } = require('react-native');

    // Validate Apple Pay configuration on iOS
    if (Platform.OS === 'ios' && methodConfig.applePay) {
      if (!methodConfig.applePay.merchantIdentifier) {
        throw new TunaPaymentError('Apple Pay merchant identifier is required');
      }
      if (!methodConfig.applePay.supportedNetworks?.length) {
        throw new TunaPaymentError('Apple Pay supported networks are required');
      }
    }

    // Validate Google Pay configuration on Android
    if (Platform.OS === 'android' && methodConfig.googlePay) {
      if (!methodConfig.googlePay.merchantInfo?.merchantName) {
        throw new TunaPaymentError('Google Pay merchant name is required');
      }
      if (!methodConfig.googlePay.allowedCardNetworks?.length) {
        throw new TunaPaymentError('Google Pay allowed card networks are required');
      }
      if (!methodConfig.googlePay.tokenizationSpecification?.parameters) {
        throw new TunaPaymentError('Google Pay tokenization specification is required');
      }
    }

    return true;
  }

  /**
   * Updates the adapter configuration
   */
  updateConfig(config: Partial<TunaPaymentConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Cleans up adapter resources
   */
  destroy(): void {
    this.supportedMethods.clear();
  }
}

/**
 * Creates a new React Native Payments adapter instance
 */
export function createReactNativePaymentsAdapter(
  sessionManager: SessionManager,
  tokenizationManager: TokenizationManager,
  paymentManager: PaymentManager,
  config: TunaPaymentConfig
): ReactNativePaymentsAdapter {
  return new ReactNativePaymentsAdapter(
    sessionManager,
    tokenizationManager,
    paymentManager,
    config
  );
}