/**
 * PIX Payments Example
 * 
 * This example demonstrates how to use PIX payments with the Tuna React Native SDK.
 * PIX is a Brazilian instant payment system that generates QR codes for payments.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  ScrollView 
} from 'react-native';

import {
  useTunaPayments,
  usePIXPayments,
  type TunaReactNativeConfig,
  type CustomerInfo,
} from '../src';

// Configuration
const tunaConfig: TunaReactNativeConfig = {
  environment: 'sandbox',
  debug: true,
};

// Sample customer data
const customerInfo: CustomerInfo = {
  name: 'João Silva',
  document: '12345678901',
  email: 'joao.silva@example.com',
  phone: '+5511999999999',
};

export function PIXPaymentsExample() {
  const [paymentAmount, setPaymentAmount] = useState(99.99);

  // Main Tuna SDK hook
  const { 
    tunaSDK, 
    isInitialized, 
    isLoading: sdkLoading, 
    error: sdkError
  } = useTunaPayments(tunaConfig);

  // PIX payments hook
  const pixPayments = usePIXPayments(tunaSDK);

  /**
   * Generate PIX payment
   */
  const handleGeneratePIX = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      const pixResult = await pixPayments.generatePIXPayment(paymentAmount, customerInfo);
      
      if (pixResult?.success) {
        Alert.alert('PIX Generated', 'QR Code generated successfully! Check the details below.');
      } else {
        Alert.alert('Error', 'Failed to generate PIX payment');
      }
    } catch (error) {
      console.error('PIX generation error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'PIX generation failed');
    }
  };

  /**
   * Clear PIX payment data
   */
  const handleClearPIX = () => {
    pixPayments.clearPIXPayment();
    Alert.alert('Cleared', 'PIX payment data cleared');
  };

  /**
   * Copy QR code to clipboard (mock implementation)
   */
  const copyQRCode = () => {
    if (pixPayments.qrCode) {
      // In a real app, you would use @react-native-clipboard/clipboard
      Alert.alert('Copied', 'QR Code copied to clipboard');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PIX Payments Example</Text>
      <Text style={styles.subtitle}>Brazilian Instant Payment System</Text>

      {/* SDK Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          SDK Status: {isInitialized ? '✅ Ready' : sdkLoading ? '⏳ Loading...' : '❌ Not Ready'}
        </Text>
        <Text style={styles.statusText}>
          PIX Status: {pixPayments.isLoading ? '⏳ Processing...' : '✅ Ready'}
        </Text>
      </View>

      {/* Customer Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Customer Information:</Text>
        <Text style={styles.infoText}>Name: {customerInfo.name}</Text>
        <Text style={styles.infoText}>Document: {customerInfo.document}</Text>
        <Text style={styles.infoText}>Email: {customerInfo.email}</Text>
        <Text style={styles.infoText}>Phone: {customerInfo.phone}</Text>
        <Text style={styles.infoText}>Amount: R$ {paymentAmount.toFixed(2)}</Text>
      </View>

      {/* Loading Indicator */}
      {(sdkLoading || pixPayments.isLoading) && (
        <ActivityIndicator size="large" color="#32BCAD" style={styles.loader} />
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Generate PIX Payment"
          onPress={handleGeneratePIX}
          disabled={!isInitialized || pixPayments.isLoading}
          color="#32BCAD"
        />
        
        {pixPayments.qrCode && (
          <>
            <View style={styles.buttonSpacing} />
            <Button
              title="Copy QR Code"
              onPress={copyQRCode}
              color="#0066cc"
            />
          </>
        )}
        
        <View style={styles.buttonSpacing} />
        
        <Button
          title="Clear PIX Data"
          onPress={handleClearPIX}
          disabled={!pixPayments.qrCode}
          color="#FF3B30"
        />
      </View>

      {/* PIX Payment Details */}
      {pixPayments.qrCode && (
        <View style={styles.pixContainer}>
          <Text style={styles.pixTitle}>PIX Payment Details</Text>
          
          <View style={styles.pixInfo}>
            <Text style={styles.pixLabel}>QR Code:</Text>
            <Text style={styles.pixValue}>{pixPayments.qrCode}</Text>
          </View>
          
          {pixPayments.qrCodeImage && (
            <View style={styles.pixInfo}>
              <Text style={styles.pixLabel}>QR Code Image:</Text>
              <Text style={styles.pixValue}>Base64 image available</Text>
            </View>
          )}
          
          {pixPayments.paymentKey && (
            <View style={styles.pixInfo}>
              <Text style={styles.pixLabel}>Payment Key:</Text>
              <Text style={styles.pixValue}>{pixPayments.paymentKey}</Text>
            </View>
          )}
          
          {pixPayments.expirationTime && (
            <View style={styles.pixInfo}>
              <Text style={styles.pixLabel}>Expires At:</Text>
              <Text style={styles.pixValue}>{pixPayments.expirationTime.toLocaleString()}</Text>
            </View>
          )}
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>
              1. Open your bank app{'\n'}
              2. Go to PIX section{'\n'}
              3. Choose "Pay with QR Code"{'\n'}
              4. Scan the QR code above{'\n'}
              5. Confirm the payment
            </Text>
          </View>
        </View>
      )}

      {/* Error Display */}
      {(sdkError || pixPayments.error) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Errors:</Text>
          {sdkError && <Text style={styles.errorText}>SDK: {sdkError.message}</Text>}
          {pixPayments.error && <Text style={styles.errorText}>PIX: {pixPayments.error.message}</Text>}
        </View>
      )}
    </ScrollView>
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
  infoContainer: {
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: '4px solid #0066cc',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003d6b',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#003d6b',
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
  pixContainer: {
    backgroundColor: '#e7f5e7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeft: '4px solid #32BCAD',
  },
  pixTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d5016',
    textAlign: 'center',
  },
  pixInfo: {
    marginBottom: 10,
  },
  pixLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2d5016',
  },
  pixValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 4,
    color: '#333',
  },
  instructionsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 4,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d5016',
  },
  instructionsText: {
    fontSize: 12,
    color: '#2d5016',
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: '#ffe7e7',
    padding: 15,
    borderRadius: 8,
    borderLeft: '4px solid #FF3B30',
    marginBottom: 20,
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
 * How this PIX example works:
 * 
 * 1. SDK Initialization: Uses the main Tuna SDK with Brazilian configuration
 * 2. Customer Data: Collects required customer information (CPF, name, email, phone)
 * 3. PIX Generation: Creates a PIX payment with QR code through Tuna's APIs
 * 4. QR Code Display: Shows the generated QR code and payment details
 * 5. Payment Instructions: Provides clear instructions for users
 * 6. Real-time Status: Shows payment generation and expiration status
 * 
 * PIX Benefits:
 * - Instant payments (24/7/365)
 * - No transaction fees for consumers
 * - High security with Central Bank regulation
 * - Wide adoption in Brazil
 * - Mobile-first experience
 */