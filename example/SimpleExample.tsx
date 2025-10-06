/**
 * Simple Example: Using Tuna React Native Payment Adapters
 * 
 * This demonstrates the basic usage of Apple Pay and Google Pay adapters
 */

import React from 'react';
import { View, Button, Alert, Platform } from 'react-native';
import type {
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
} from '../src';

// Example Apple Pay configuration
const applePayConfig: ApplePayConfig = {
  merchantIdentifier: 'merchant.com.yourcompany.app',
  supportedNetworks: ['visa', 'mastercard', 'amex'],
  countryCode: 'BR',
  currencyCode: 'BRL',
  requestBillingAddress: true,
  requestPayerEmail: true,
};

// Example Google Pay configuration
const googlePayConfig: GooglePayConfig = {
  environment: 'TEST',
  apiVersion: 2,
  apiVersionMinor: 0,
  merchantInfo: {
    merchantName: 'Your Store',
    merchantId: 'your-merchant-id',
  },
  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
  allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'tuna',
      gatewayMerchantId: 'your-gateway-merchant-id',
    },
  },
  billingAddressRequired: true,
  emailRequired: true,
  currencyCode: 'BRL',
};

// Example payment details
const paymentDetails: PaymentDetails = {
  amount: 10.99,
  currencyCode: 'BRL',
  countryCode: 'BR',
  total: {
    label: 'Total',
    amount: {
      currency: 'USD',
      value: '10.99',
    },
  },
  displayItems: [
    {
      label: 'Product',
      amount: {
        currency: 'USD',
        value: '9.99',
      },
    },
    {
      label: 'Tax',
      amount: {
        currency: 'USD',
        value: '1.00',
      },
    },
  ],
};

export function PaymentExample() {
  const handleApplePayPress = async () => {
    try {
      // Example using the new TunaReactNative API
      const { createTunaReactNative } = require('../src');
      
      const tunaSDK = createTunaReactNative({
        environment: 'sandbox',
        debug: true
      });
      
      await tunaSDK.initialize('demo-session-id');
      await tunaSDK.setupApplePay(applePayConfig);
      const result = await tunaSDK.showApplePaySheet(paymentDetails);
      
      Alert.alert(
        'Apple Pay Success',
        `Payment initiated: ${result.paymentId}`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to process Apple Pay payment: ${error}`);
    }
  };

  const handleGooglePayPress = async () => {
    try {
      // Example using the new TunaReactNative API
      const { createTunaReactNative } = require('../src');
      
      const tunaSDK = createTunaReactNative({
        environment: 'sandbox',
        debug: true
      });
      
      await tunaSDK.initialize('demo-session-id');
      await tunaSDK.setupGooglePay(googlePayConfig);
      const result = await tunaSDK.requestGooglePayment(paymentDetails);
      
      Alert.alert(
        'Google Pay Success',
        `Payment initiated: ${result.paymentId}`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to process Google Pay payment: ${error}`);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      {Platform.OS === 'ios' && (
        <Button
          title="Pay with Apple Pay"
          onPress={handleApplePayPress}
        />
      )}
      {Platform.OS === 'android' && (
        <Button
          title="Pay with Google Pay"
          onPress={handleGooglePayPress}
        />
      )}
    </View>
  );
}

/**
 * Example configuration objects that would be used in a real implementation
 */
export const ExampleConfigurations = {
  applePay: applePayConfig,
  googlePay: googlePayConfig,
  paymentDetails: paymentDetails,
};

/**
 * Example of how to initialize and use the SDK (working code)
 */
export const WorkingExample = `
// Real working implementation:

import { TunaReactNative, createTunaReactNative } from '@tuna/react-native-payments';

// 1. Create SDK instance
const tunaSDK = createTunaReactNative({
  environment: 'sandbox', // or 'production'
  debug: true
});

// 2. Initialize with session ID
await tunaSDK.initialize('your-session-id');

// 3. Setup payment methods
if (Platform.OS === 'ios') {
  await tunaSDK.setupApplePay(applePayConfig);
  const result = await tunaSDK.showApplePaySheet(paymentDetails);
}

if (Platform.OS === 'android') {
  await tunaSDK.setupGooglePay(googlePayConfig);
  const result = await tunaSDK.requestGooglePayment(paymentDetails);
}

// 4. Cleanup when done
await tunaSDK.cleanup();
`;