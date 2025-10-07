/**
 * Simplified Tuna React Native SDK Example
 * 
 * This example demonstrates the core payment features without advanced functionality
 * that requires complex API implementations.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

// Import the main Tuna SDK
import { TunaReactNative, TunaReactNativeConfig } from '../../src/index';
import type { 
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
  PaymentResult
} from '../../src/types/payment';

// SDK Configuration
const TUNA_CONFIG: TunaReactNativeConfig = {
  environment: 'sandbox',
  debug: true,
};

interface CustomerInfo {
  name: string;
  email: string;
  document: string;
}

export default function SimpleTunaExample() {
  // SDK State
  const [sdk, setSdk] = useState<TunaReactNative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready to initialize');
  const [isSessionConfigured, setIsSessionConfigured] = useState(false);

  // Platform Availability
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  // Payment Form
  const [amount, setAmount] = useState('100.00');
  const [sessionId, setSessionId] = useState('demo-session-12345');
  
  // Credit Card Form
  const [cardNumber, setCardNumber] = useState('4111111111111111');
  const [cardHolderName, setCardHolderName] = useState('Test User');
  const [expirationMonth, setExpirationMonth] = useState('12');
  const [expirationYear, setExpirationYear] = useState('2025');
  const [cvv, setCvv] = useState('123');
  const [installments, setInstallments] = useState('1');
  const [saveCard, setSaveCard] = useState(false);

  // Customer Information
  const [customerName, setCustomerName] = useState('Test Customer');
  const [customerEmail, setCustomerEmail] = useState('test@example.com');
  const [customerDocument, setCustomerDocument] = useState('12345678901');

  // 3D Secure Configuration
  const [enable3DSecure, setEnable3DSecure] = useState(false);

  /**
   * Initialize SDK with session ID
   */
  const initializeSDK = async () => {
    if (!sessionId.trim()) {
      Alert.alert('Error', 'Please enter a session ID');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Initializing Tuna SDK...');

      // Create TunaReactNative instance
      console.log('🚀 Creating TunaReactNative instance');
      const tunaSDK = new TunaReactNative(TUNA_CONFIG);
      
      console.log('🔑 Initializing with session ID:', sessionId);
      await tunaSDK.initialize(sessionId);
      setSdk(tunaSDK);
      setIsSessionConfigured(true);
      
      setStatus('Tuna SDK initialized successfully!');

      // Check platform availability
      if (Platform.OS === 'ios') {
        const canMakeApplePay = await tunaSDK.canMakeApplePayPayments();
        setApplePayAvailable(canMakeApplePay);
        
        if (canMakeApplePay) {
          await tunaSDK.setupApplePay({
            merchantIdentifier: 'merchant.uy.tunahmlg',
            supportedNetworks: ['visa', 'mastercard', 'amex'],
            countryCode: 'BR',
            currencyCode: 'BRL',
          });
        }
      }

      if (Platform.OS === 'android') {
        const isGooglePayReady = await tunaSDK.isGooglePayReady();
        setGooglePayAvailable(isGooglePayReady);
        
        if (isGooglePayReady) {
          await tunaSDK.setupGooglePay({
            environment: TUNA_CONFIG.environment === 'production' ? 'PRODUCTION' : 'TEST',
            merchantInfo: {
              merchantName: 'Tuna Demo',
              merchantId: 'BCR2DN6TR7QYLIKK'
            },
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
            allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
          });
        }
      }

    } catch (error) {
      console.error('Failed to initialize SDK:', error);
      Alert.alert('Error', 'Failed to initialize SDK: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process Apple Pay payment
   */
  const processApplePay = async () => {
    if (!sdk) return;

    try {
      setIsLoading(true);
      setStatus('Processing Apple Pay...');

      const paymentDetails: PaymentDetails = {
        amount: parseFloat(amount),
        currencyCode: 'BRL',
        total: {
          label: 'Test Payment',
          amount: parseFloat(amount)
        }
      };

      const result = await sdk.showApplePaySheet(paymentDetails);
      
      if (result.success) {
        setStatus('Apple Pay payment successful!');
        Alert.alert('Success', `Payment completed: ${result.paymentId}`);
      } else {
        setStatus('Apple Pay payment failed');
        Alert.alert('Error', 'Apple Pay payment failed');
      }

    } catch (error) {
      console.error('Apple Pay error:', error);
      setStatus('Apple Pay payment failed');
      Alert.alert('Error', 'Apple Pay failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process Google Pay payment
   */
  const processGooglePay = async () => {
    if (!sdk) return;

    try {
      setIsLoading(true);
      setStatus('Processing Google Pay...');

      const paymentDetails: PaymentDetails = {
        amount: parseFloat(amount),
        currencyCode: 'BRL',
        total: {
          label: 'Test Payment',
          amount: parseFloat(amount)
        }
      };

      const result = await sdk.requestGooglePayment(paymentDetails);
      
      if (result.success) {
        setStatus('Google Pay payment successful!');
        Alert.alert('Success', `Payment completed: ${result.paymentId}`);
      } else {
        setStatus('Google Pay payment failed');
        Alert.alert('Error', 'Google Pay payment failed');
      }

    } catch (error) {
      console.error('Google Pay error:', error);
      setStatus('Google Pay payment failed');
      Alert.alert('Error', 'Google Pay failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process credit card payment
   */
  const processCreditCard = async () => {
    if (!sdk) return;

    try {
      setIsLoading(true);
      setStatus('Processing credit card...');

      const cardData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName,
        expirationMonth,
        expirationYear,
        cvv
      };

      const customer: CustomerInfo = {
        name: customerName,
        email: customerEmail,
        document: customerDocument
      };

      const result = await sdk.processCreditCardPayment(
        parseFloat(amount),
        cardData,
        parseInt(installments),
        saveCard,
        customer
      );

      if (result.success) {
        setStatus('Credit card payment successful!');
        Alert.alert('Success', `Payment completed: ${result.paymentId}`);
      } else {
        setStatus('Credit card payment failed');
        Alert.alert('Error', 'Payment failed: ' + result.errorMessage);
      }

    } catch (error) {
      console.error('Credit card error:', error);
      setStatus('Credit card payment failed');
      Alert.alert('Error', 'Payment failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate PIX payment
   */
  const generatePIX = async () => {
    if (!sdk) return;

    try {
      setIsLoading(true);
      setStatus('Generating PIX...');

      const customer: CustomerInfo = {
        name: customerName,
        email: customerEmail,
        document: customerDocument
      };

      const result = await sdk.generatePIXPayment(parseFloat(amount), customer);

      if (result.success) {
        setStatus('PIX generated successfully!');
        Alert.alert('PIX Generated', `QR Code: ${result.qrCode}\nCopy & Paste: ${result.copyPasteCode}`);
      } else {
        setStatus('PIX generation failed');
        Alert.alert('Error', 'PIX failed: ' + result.errorMessage);
      }

    } catch (error) {
      console.error('PIX error:', error);
      setStatus('PIX generation failed');
      Alert.alert('Error', 'PIX failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tuna React Native SDK Example</Text>
      
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status}</Text>
        {isLoading && <ActivityIndicator style={styles.loader} />}
      </View>

      {/* Session Configuration */}
      {!isSessionConfigured && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Initialize SDK</Text>
          <TextInput
            style={styles.input}
            placeholder="Session ID"
            value={sessionId}
            onChangeText={setSessionId}
          />
          <TouchableOpacity style={styles.button} onPress={initializeSDK}>
            <Text style={styles.buttonText}>Initialize SDK</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Methods */}
      {isSessionConfigured && (
        <>
          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount (BRL)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Native Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Native Payments</Text>
            
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.button, !applePayAvailable && styles.buttonDisabled]}
                onPress={processApplePay}
                disabled={!applePayAvailable || isLoading}
              >
                <Text style={styles.buttonText}>
                  🍎 {applePayAvailable ? 'Pay with Apple Pay' : 'Apple Pay Not Available'}
                </Text>
              </TouchableOpacity>
            )}

            {Platform.OS === 'android' && (
              <TouchableOpacity
                style={[styles.button, !googlePayAvailable && styles.buttonDisabled]}
                onPress={processGooglePay}
                disabled={!googlePayAvailable || isLoading}
              >
                <Text style={styles.buttonText}>
                  🤖 {googlePayAvailable ? 'Pay with Google Pay' : 'Google Pay Not Available'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Credit Card Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credit Card Payment</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              value={cardHolderName}
              onChangeText={setCardHolderName}
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM"
                value={expirationMonth}
                onChangeText={setExpirationMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="YYYY"
                value={expirationYear}
                onChangeText={setExpirationYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Installments"
                value={installments}
                onChangeText={setInstallments}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={processCreditCard} disabled={isLoading}>
              <Text style={styles.buttonText}>💳 Process Credit Card</Text>
            </TouchableOpacity>
          </View>

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Document (CPF/CNPJ)"
              value={customerDocument}
              onChangeText={setCustomerDocument}
              keyboardType="numeric"
            />
          </View>

          {/* PIX Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PIX Payment</Text>
            <TouchableOpacity style={styles.button} onPress={generatePIX} disabled={isLoading}>
              <Text style={styles.buttonText}>🇧🇷 Generate PIX</Text>
            </TouchableOpacity>
          </View>
        </>
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
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loader: {
    marginLeft: 10,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});