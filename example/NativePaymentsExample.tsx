/**
 * Native Payments Example - Apple Pay & Google Pay
 * 
 * This example demonstrates how to use the Tuna React Native SDK
 * with native payment capabilities through @rnw-community/react-native-payments
 * without any WebView dependencies.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Alert, 
  ActivityIndicator,
  Platform,
  StyleSheet 
} from 'react-native';

import {
  TunaReactNative,
  type TunaReactNativeConfig,
  type PaymentDetails,
  type ApplePayConfig,
  type GooglePayConfig,
} from '../src';

// Configuration
const tunaConfig: TunaReactNativeConfig = {
  environment: 'production',
  debug: true,
};

const applePayConfig: ApplePayConfig = {
  merchantIdentifier: 'merchant.uy.tunahmlg',
  supportedNetworks: ['visa', 'mastercard', 'amex'],
  countryCode: 'BR',
  currencyCode: 'BRL',
  requestBillingAddress: true,
  requestPayerEmail: true,
  requestShipping: false,
};

const googlePayConfig: GooglePayConfig = {
  environment: 'PRODUCTION',
  apiVersion: 2,
  apiVersionMinor: 0,
  merchantInfo: {
    merchantName: 'Tuna Store',
    merchantId: 'BCR2DN6TR7QYLIKK',
  },
  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
  allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'tuna',
      gatewayMerchantId: 'BCR2DN6TR7QYLIKK',
    },
  },
  billingAddressRequired: true,
  emailRequired: true,
  currencyCode: 'BRL',
};

export function NativePaymentsExample() {
  const [tunaSDK, setTunaSDK] = useState<TunaReactNative | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [setupComplete, setSetupComplete] = useState(false);

  // Initialize SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const sdk = new TunaReactNative(tunaConfig);
        
        // Initialize with a demo session ID (in real app, get this from your backend)
        await sdk.initialize('l33NGKwUa0YzEsfdgBeQfuWmbTRoQ6xsleAu2Cpmug2wFkYQGYkn0Ugw8YDEFMhXsGA9+xV3BTSD9T9Nbec48xpjCVQRYmyIv63HhGgXoyhWxiOIsWXSJ/z4V3wrL9vpRBs2VV9VnYOxaUDPdtFKss9Lc5cxJPn4i+SXCCQJZZ8lqAYe7xsbnfA2U95W');
        
        setTunaSDK(sdk);
        setIsInitialized(true);
      } catch (err) {
        console.error('SDK initialization error:', err);
        setError(err instanceof Error ? err : new Error('SDK initialization failed'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  /**
   * Setup platform-specific payment methods
   */
  const setupPaymentMethods = async () => {
    if (!tunaSDK || !isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      
      if (Platform.OS === 'ios') {
        const isAvailable = await tunaSDK.canMakeApplePayPayments();
        if (isAvailable) {
          await tunaSDK.setupApplePay(applePayConfig);
          setSetupComplete(true);
          Alert.alert('Apple Pay', 'Apple Pay configured successfully');
        } else {
          Alert.alert('Not Available', 'Apple Pay is not available on this device');
        }
      } else if (Platform.OS === 'android') {
        const isAvailable = await tunaSDK.isGooglePayReady();
        if (isAvailable) {
          await tunaSDK.setupGooglePay(googlePayConfig);
          setSetupComplete(true);
          Alert.alert('Google Pay', 'Google Pay configured successfully');
        } else {
          Alert.alert('Not Available', 'Google Pay is not available on this device');
        }
      }
    } catch (err) {
      console.error('Setup error:', err);
      Alert.alert('Setup Error', err instanceof Error ? err.message : 'Failed to setup payment method');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle native payment processing
   */
  const handleNativePayment = async () => {
    if (!tunaSDK || !isInitialized || !setupComplete) {
      Alert.alert('Error', 'Payment method not set up');
      return;
    }

    try {
      setIsLoading(true);
      
      const paymentDetails: PaymentDetails = {
        amount: 99.99,
        currencyCode: 'BRL',
        countryCode: 'BR',
        total: {
          label: 'Total Purchase',
          amount: {
            currency: 'USD',
            value: '99.99',
          },
        },
        displayItems: [
          {
            label: 'Product',
            amount: {
              currency: 'USD',
              value: '89.99',
            },
          },
          {
            label: 'Tax',
            amount: {
              currency: 'USD',
              value: '10.00',
            },
          },
        ],
      };

      let result;
      
      if (Platform.OS === 'ios') {
        result = await tunaSDK.showApplePaySheet(paymentDetails);
      } else if (Platform.OS === 'android') {
        result = await tunaSDK.requestGooglePayment(paymentDetails);
      }
      
      if (result) {
        setPaymentResult(result);
        Alert.alert('Success', `Payment completed!`);
      } else {
        Alert.alert('Error', 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get platform-specific payment info
   */
  const getPaymentInfo = async () => {
    if (!tunaSDK) {
      Alert.alert('Info', 'SDK not initialized');
      return;
    }

    try {
      let info = `Platform: ${Platform.OS}\n`;
      info += `SDK Initialized: ${isInitialized}\n`;
      info += `Setup Complete: ${setupComplete}\n`;
      
      if (Platform.OS === 'ios') {
        const available = await tunaSDK.canMakeApplePayPayments();
        info += `Apple Pay Available: ${available}\n`;
      } else if (Platform.OS === 'android') {
        const available = await tunaSDK.isGooglePayReady();
        info += `Google Pay Available: ${available}\n`;
      }

      Alert.alert('Payment Info', info);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to get info');
    }
  };

  const clearResult = () => {
    setPaymentResult(null);
  };

  const isPaymentReady = isInitialized && setupComplete && !isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Native Payments Example</Text>
      <Text style={styles.subtitle}>
        {Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'} Integration
      </Text>

      {/* SDK Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          SDK Status: {isInitialized ? '✅ Ready' : isLoading ? '⏳ Loading...' : '❌ Not Ready'}
        </Text>
        <Text style={styles.statusText}>
          Payment Setup: {setupComplete ? '✅ Complete' : '⚙️ Pending'}
        </Text>
        <Text style={styles.statusText}>
          Platform: {Platform.OS === 'ios' ? 'iOS (Apple Pay)' : 'Android (Google Pay)'}
        </Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Setup Payment Methods"
          onPress={setupPaymentMethods}
          disabled={!isInitialized || isLoading || setupComplete}
        />
        
        <View style={styles.buttonSpacing} />
        
        <Button
          title={`Pay with ${Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'}`}
          onPress={handleNativePayment}
          disabled={!isPaymentReady}
          color="#007AFF"
        />
        
        <View style={styles.buttonSpacing} />
        
        <Button
          title="Get Payment Info"
          onPress={getPaymentInfo}
          color="#34C759"
        />
        
        {paymentResult && (
          <>
            <View style={styles.buttonSpacing} />
            <Button
              title="Clear Result"
              onPress={clearResult}
              color="#FF3B30"
            />
          </>
        )}
      </View>

      {/* Payment Result */}
      {paymentResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Payment Result:</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(paymentResult, null, 2)}
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  buttonSpacing: {
    height: 10,
  },
  loader: {
    marginVertical: 20,
  },
  resultContainer: {
    backgroundColor: '#e7f5e7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d5016',
  },
  resultText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#2d5016',
  },
  errorContainer: {
    backgroundColor: '#ffe7e7',
    padding: 15,
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8b0000',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#8b0000',
  },
});

/**
 * How this example works:
 * 
 * 1. SDK Initialization: Creates and initializes the Tuna SDK
 * 2. Platform Detection: Automatically detects iOS/Android and shows appropriate payment method
 * 3. Native Integration: Uses @rnw-community/react-native-payments for native payment sheets
 * 4. No WebView: Completely WebView-free implementation using native APIs
 * 5. Real-time Status: Shows availability and configuration status for payment methods
 * 6. Error Handling: Comprehensive error handling and user feedback
 * 7. Production Ready: Can be easily adapted for production use
 * 
 * Key Benefits:
 * - Native payment experience (Apple Pay/Google Pay)
 * - No web dependencies
 * - Platform-optimized UI
 * - Secure tokenization through native APIs
 * - Follows platform design guidelines
 */