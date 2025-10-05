/**
 * Test for NativePaymentsExample to verify it's runnable
 */

import { TunaReactNative, type ApplePaySupportedNetwork, type GooglePayAuthMethod, type GooglePaySupportedNetwork } from '../index';

describe('NativePaymentsExample Compatibility', () => {
  let sdk: TunaReactNative;

  beforeEach(() => {
    sdk = new TunaReactNative({
      environment: 'sandbox',
      debug: true,
    });
  });

  it('should have all methods used by the example', () => {
    // Check that all methods used in NativePaymentsExample exist
    expect(typeof sdk.initialize).toBe('function');
    expect(typeof sdk.canMakeApplePayPayments).toBe('function');
    expect(typeof sdk.isGooglePayReady).toBe('function');
    expect(typeof sdk.setupApplePay).toBe('function');
    expect(typeof sdk.setupGooglePay).toBe('function');
    expect(typeof sdk.showApplePaySheet).toBe('function');
    expect(typeof sdk.requestGooglePayment).toBe('function');
  });

  it('should initialize successfully', async () => {
    await expect(sdk.initialize('test-session-123')).resolves.not.toThrow();
  });

  it('should handle Apple Pay availability check', async () => {
    const result = await sdk.canMakeApplePayPayments();
    expect(typeof result).toBe('boolean');
  });

  it('should handle Google Pay availability check', async () => {
    const result = await sdk.isGooglePayReady();
    expect(typeof result).toBe('boolean');
  });

  it('should handle Apple Pay setup', async () => {
    await sdk.initialize('test-session-123');
    
    const applePayConfig = {
      merchantIdentifier: 'merchant.test',
      supportedNetworks: ['visa', 'mastercard'] as ApplePaySupportedNetwork[],
      countryCode: 'US',
      currencyCode: 'USD',
      requestBillingAddress: true,
      requestPayerEmail: true,
      requestShipping: false,
    };

    await expect(sdk.setupApplePay(applePayConfig)).resolves.not.toThrow();
  });

  it('should handle Google Pay setup', async () => {
    await sdk.initialize('test-session-123');
    
    const googlePayConfig = {
      environment: 'TEST' as const,
      apiVersion: 2,
      apiVersionMinor: 0,
      merchantInfo: {
        merchantName: 'Test Store',
        merchantId: 'test-merchant',
      },
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'] as GooglePayAuthMethod[],
      allowedCardNetworks: ['VISA', 'MASTERCARD'] as GooglePaySupportedNetwork[],
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY' as const,
        parameters: {
          gateway: 'tuna',
          gatewayMerchantId: 'test-gateway',
        },
      },
      billingAddressRequired: true,
      emailRequired: true,
      currencyCode: 'USD',
    };

    await expect(sdk.setupGooglePay(googlePayConfig)).resolves.not.toThrow();
  });
});