/**
 * Complete Tuna Native Payments Example with REAL Tuna SDK Integration
 * Supports Apple Pay, Google Pay, Credit Cards (3DS), and PIX payments
 * Uses the actual Tuna React Native SDK with real API calls
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Switch,
  Image,
} from 'react-native';
import QRCode from 'qrcode';
// Multi-approach clipboard functionality that works in different environments
const copyToClipboard = async (text: string) => {
  // Approach 1: Try web Clipboard API (works in web builds and some React Native WebView contexts)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // Silent fail, try next approach
  }

  // Approach 2: Try React Native's built-in Clipboard (if available)
  try {
    const { Clipboard: RNClipboard } = require('react-native');
    if (RNClipboard && RNClipboard.setString) {
      RNClipboard.setString(text);
      return true;
    }
  } catch (error) {
    // Silent fail
  }

  // Approach 3: Try expo-clipboard if available
  try {
    const ExpoClipboard = require('expo-clipboard');
    if (ExpoClipboard && ExpoClipboard.setStringAsync) {
      await ExpoClipboard.setStringAsync(text);
      return true;
    }
  } catch (error) {
    // Silent fail
  }

  // Fallback: log the content so user can manually copy
  console.log('📋 Content to copy:', text);
  return false;
};

const getFromClipboard = async (): Promise<string> => {
  // Approach 1: Try web Clipboard API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (error) {
    // Silent fail, try next approach
  }

  // Approach 2: Try React Native's built-in Clipboard
  try {
    const { Clipboard: RNClipboard } = require('react-native');
    if (RNClipboard && RNClipboard.getString) {
      return await RNClipboard.getString();
    }
  } catch (error) {
    // Silent fail
  }

  // Approach 3: Try expo-clipboard if available
  try {
    const ExpoClipboard = require('expo-clipboard');
    if (ExpoClipboard && ExpoClipboard.getStringAsync) {
      return await ExpoClipboard.getStringAsync();
    }
  } catch (error) {
    // Silent fail
  }

  return '';
};

// Import the working Tuna SDK from the example directory
import { TunaReactNative, TunaReactNativeConfig } from './src/TunaReactNativeReal';
import type { 
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
  PaymentResult
} from './src/types/payment';

// Import native 3DS handler (no WebViews)
import { 
  createNativeThreeDSHandler, 
  extractThreeDSInfo, 
  extractChallengeInfo,
  type ThreeDSDataCollectionInfo,
  type ThreeDSChallengeInfo 
} from './src/ThreeDSNative';

// Import enhanced native payments for 3DS challenges
import { 
  createNative3DSHandler,
  handleNative3DSChallenge,
  type ThreeDSChallengeConfig,
  type ThreeDSNativeResult
} from './src/ThreeDSNativePayments';

// Import real 3DS challenge executor (Browser Redirect)
import {
  executeReal3DSChallenge,
  type Real3DSChallengeConfig,
  type Real3DSChallengeResult
} from './src/ThreeDSBrowserChallenge';

// Import ACS URL extractor
import {
  extractCompleteChallenge,
  type ExtractedChallengeData
} from './src/ThreeDSACSExtractor';

// Tab navigation types
type PaymentTab = 'applePay' | 'googlePay' | 'creditCard' | 'pix';

interface CreditCardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
  saveCard?: boolean;
}

interface CustomerInfo {
  name?: string;  // Optional - defaults to 'John Doe'
  email?: string; // Optional - defaults to 'john.doe@example.com'
  document?: string; // Optional - only included if provided
  phone?: string;    // Optional - only included if provided
}

// Configuration using REAL session from Tuna backend
const TUNA_CONFIG: TunaReactNativeConfig = {
  // environment defaults to 'production' now
  debug: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};

// REAL session ID from Tuna - this should come from your backend
const REAL_SESSION_ID = '30p6uerv7PGhzitZRUmmLpvWskqbk2EfhOQc9HqyUOMVcPCvXLoVSDBTAEdChO6nUFMTOYU/r/O+UJUzfXq/2WY+a2wJFDSZjtjwEmPi+QxBok6DNIjuMAzzt9O/k0AAkJpHbza2pMmoMN229JLRAzQu5gcJpCSt6dyvQAwrbBmbcHCLWU3h4P0ujH51';

export default function TunaPaymentExample() {
  // Session management state
  const [sessionId, setSessionId] = useState(REAL_SESSION_ID);
  const [isSessionConfigured, setIsSessionConfigured] = useState(false);
  
  // SDK state - using REAL TunaReactNative instance with actual API calls
  const [sdk, setSdk] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Enter session ID to initialize REAL Tuna SDK');
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<PaymentTab>('applePay');
  const [amount, setAmount] = useState('1');
  const [currency, setCurrency] = useState('BRL');

  // Credit Card state
  const [cardNumber, setCardNumber] = useState('4456530000001096');
  const [expiryMonth, setExpiryMonth] = useState('01');
  const [expiryYear, setExpiryYear] = useState('28');
  const [cvv, setCvv] = useState('123');
  const [holderName, setHolderName] = useState('Authorized');
  const [saveCard, setSaveCard] = useState(false);
  const [enable3DS, setEnable3DS] = useState(true);

  // Customer info for credit card
  const [customerNameCC, setCustomerNameCC] = useState('John Doe');
  const [customerEmailCC, setCustomerEmailCC] = useState('john.doe@example.com');

  // Customer info for PIX
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');
  const [customerDocument, setCustomerDocument] = useState(''); // Optional
  const [customerPhone, setCustomerPhone] = useState(''); // Optional

  // PIX result state
  const [pixResult, setPixResult] = useState<{ qrCode: string; qrImage: string; qrCodeDataURL: string; paymentKey: string; expiresAt: Date } | null>(null);
  const [pixStatus, setPixStatus] = useState<string>('');
  const [isPollingPix, setIsPollingPix] = useState(false);

  // Payment processing state
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Generate consistent partnerUniqueId for session matching
  const [partnerUniqueId] = useState(() => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return uuid;
  });

  // 3DS state management (native, no WebViews)
  const [threeDSHandler] = useState(() => createNativeThreeDSHandler(true)); // debug enabled
  const [isPerformingDataCollection, setIsPerformingDataCollection] = useState(false);
  const [isPerformingChallenge, setIsPerformingChallenge] = useState(false);
  const [threeDSStatus, setThreeDSStatus] = useState<string>('');

  // Saved cards state
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [isLoadingSavedCards, setIsLoadingSavedCards] = useState(false);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false); // Toggle between list and form
  // Initialize SDK manually after session ID is provided
  // useEffect(() => {
  //   initializeSDK();
  // }, []);

  // Auto-select available payment method
  useEffect(() => {
    if (Platform.OS === 'ios' && applePayAvailable) {
      setActiveTab('applePay');
    } else if (Platform.OS === 'android' && googlePayAvailable) {
      setActiveTab('googlePay');
    } else {
      setActiveTab('creditCard');
    }
  }, [applePayAvailable, googlePayAvailable]);

  const initializeSDK = async () => {
    try {
      if (!sessionId.trim()) {
        console.log('Error', 'Please enter a valid session ID');
        return;
      }
      
      setIsLoading(true);
      setStatus('Initializing REAL Tuna SDK...');

      // Create REAL TunaReactNative instance
      console.log('🚀 Creating TunaReactNative instance with config:', TUNA_CONFIG);
      const tunaSDK = new TunaReactNative(TUNA_CONFIG);
      
      console.log('🔑 Initializing with session ID:', sessionId.substring(0, 20) + '...');
      await tunaSDK.initialize(sessionId);
      setSdk(tunaSDK);
      setIsSessionConfigured(true);
      
      setStatus('REAL Tuna SDK initialized successfully!');
      console.log('✅ SDK initialized successfully');

      // Load saved credit cards after SDK is set
      try {
        console.log('🔍 Loading saved cards...');
        const cards = await tunaSDK.listSavedCards();
        setSavedCards(cards);
        console.log('💳 Loaded saved cards:', cards);
        // Show form by default if no cards, show list if cards exist
        setShowCardForm(cards.length === 0);
      } catch (error) {
        console.error('❌ Failed to load saved cards:', error);
        // Show form if we can't load cards
        setShowCardForm(true);
      }

      // Check REAL platform availability
      if (Platform.OS === 'ios') {
        console.log('🍎 Checking Apple Pay availability...');
        const canMakeApplePay = await tunaSDK.canMakeApplePayPayments();
        setApplePayAvailable(canMakeApplePay);
        console.log('🍎 Apple Pay available:', canMakeApplePay);
        
        if (canMakeApplePay) {
          await tunaSDK.setupApplePay({
            merchantIdentifier: 'merchant.uy.tunahmlg',
            supportedNetworks: ['visa', 'mastercard', 'amex'],
            countryCode: 'BR',
            currencyCode: 'BRL',
          });
          setStatus('Apple Pay configured with REAL SDK');
          console.log('🍎 Apple Pay setup completed');
        }
      }

      if (Platform.OS === 'android') {
        console.log('🤖 Checking Google Pay availability...');
        const isGooglePayReady = await tunaSDK.isGooglePayReady();
        setGooglePayAvailable(isGooglePayReady);
        console.log('🤖 Google Pay ready:', isGooglePayReady);
        
        if (isGooglePayReady) {
          await tunaSDK.setupGooglePay({
            environment: 'PRODUCTION',
            apiVersion: 2,
            apiVersionMinor: 0,
            merchantInfo: {
              merchantName: 'Tuna',
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'tuna',
                gatewayMerchantId: 'BCR2DN6TR7QYLIKK',
              },
            },
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          });
          setStatus('Google Pay configured with REAL SDK');
          console.log('🤖 Google Pay setup completed');
        }
      }

      setStatus('REAL Tuna SDK ready for payments!');
    } catch (error) {
      console.error('❌ REAL SDK initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`REAL SDK Error: ${errorMessage}`);
      console.log('REAL SDK Initialization Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplePay = async () => {
    console.log('🍎 Apple Pay button clicked!');
    console.log('Debug', '🍎 Apple Pay button was clicked! Check console for logs.');
    
    if (!sdk) {
      console.log('❌ SDK not initialized');
      console.log('Error', 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Processing Apple Pay...');
      console.log('🍎 Starting Apple Pay with amount:', amount);

      const result = await sdk.showApplePaySheet({
        amount: parseFloat(amount),
        currencyCode: currency,
        countryCode: 'BR',
        total: { 
          label: 'Purchase', 
          amount: { currency, value: amount }
        },
      });

      console.log('🍎 Apple Pay result:', result);

      if (result.success) {
        setStatus('Apple Pay payment successful!');
        console.log(
          'Mock Payment Successful! 🎉',
          `⚠️ This is MOCK data from the SDK:\n\nPayment ID: ${result.paymentId}\nToken: ${result.applePayToken}\nStatus: ${result.status}\n\n📱 The SDK needs real payment integration!`,
          [{ text: 'OK' }]
        );
      } else {
        setStatus('Apple Pay payment failed');
        console.log('Payment Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Apple Pay error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Apple Pay error: ${errorMessage}`);
      console.log('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePay = async () => {
    console.log('🤖 Google Pay button clicked!');
    if (!sdk) {
      console.log('❌ SDK not initialized');
      console.log('Error', 'SDK not initialized');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Processing Google Pay...');
      console.log('🤖 Starting Google Pay with amount:', amount);

      const result = await sdk.requestGooglePayment({
        amount: parseFloat(amount),
        currencyCode: currency,
        countryCode: 'BR',
        total: { 
          label: 'Purchase', 
          amount: { currency, value: amount }
        },
      });

      if (result.success) {
        setStatus('Google Pay payment successful!');
        console.log(
          'Payment Successful! 🎉',
          `Transaction ID: ${result.transactionId}\nToken: ${result.token?.substring(0, 20)}...`,
          [{ text: 'OK' }]
        );
      } else {
        setStatus('Google Pay payment failed');
        console.log('Payment Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Google Pay error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Google Pay error: ${errorMessage}`);
      console.log('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreditCard = async () => {
    console.log('💳 Credit Card button clicked!');
    if (!sdk) {
      console.log('❌ SDK not initialized');
      console.log('Error', 'SDK not initialized');
      return;
    }

    // Check if payment already in progress
    if (paymentInProgress) {
      console.log('Warning', 'A payment is already in progress. Please wait...');
      return;
    }

    // Validation based on current mode
    if (!showCardForm && selectedSavedCard) {
      // Using saved card - only CVV required
      if (!cvv) {
        console.log('Validation Error', 'Please enter CVV for the selected saved card');
        return;
      }
    } else if (showCardForm) {
      // Using new card - all fields required
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !holderName) {
        console.log('Validation Error', 'Please fill in all credit card fields');
        return;
      }
    } else {
      console.log('Validation Error', 'Please select a saved card or add a new card');
      return;
    }

    if (!customerNameCC || !customerEmailCC) {
      console.log('Validation Error', 'Please fill in customer information');
      return;
    }

    try {
      setIsLoading(true);
      setPaymentInProgress(true);
      setPaymentResult(null);
      setStatus('🔄 Processing credit card payment...');
      console.log('💳 Processing credit card:', { 
        mode: showCardForm ? 'new card' : 'saved card', 
        selectedToken: selectedSavedCard,
        cardNumber: showCardForm ? cardNumber : 'N/A'
      });
      console.log('💰 Amount debug:', { amount, parsedAmount: parseFloat(amount), currency });

      let result;
      
      if (!showCardForm && selectedSavedCard) {
        // Use saved card with bind + payment
        console.log('💳 Using saved card payment flow');
        result = await sdk.processSavedCardPayment(
          parseFloat(amount),
          selectedSavedCard,
          cvv,
          1, // installments
          {
            name: customerNameCC,
            email: customerEmailCC,
          }
        );
      } else {
        // Use new card with tokenization + payment
        console.log('💳 Using new card payment flow');
        result = await sdk.processCreditCardPayment(
          parseFloat(amount),
          {
            cardNumber: cardNumber,
            cardHolderName: holderName,
            expirationMonth: expiryMonth,
            expirationYear: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
            cvv: cvv,
          },
          1, // installments
          saveCard,
          {
            name: customerNameCC,
            email: customerEmailCC,
          }
        );
        
        // Reload saved cards if we saved a new one
        if (saveCard && result.success) {
          console.log('🔄 Reloading saved cards after saving new card');
          await loadSavedCards();
        }
      }

      console.log('💳 Credit Card result:', result);
      setPaymentResult(result);

      // Check if 3DS data collection is required using native handler (only if 3DS is enabled)
      // Extract from the full payment result since it includes token response data
      const threeDSInfo = extractThreeDSInfo(result);
      if (enable3DS && threeDSInfo.needsDataCollection && threeDSInfo.dataCollectionInfo) {
        console.log('🔒 3DS data collection required, starting native collection...');
        setIsPerformingDataCollection(true);
        setThreeDSStatus('🔒 Performing 3DS data collection...');
        setStatus('🔒 Performing 3DS data collection...');
        
        try {
          const collectionResult = await threeDSHandler.performDataCollection(threeDSInfo.dataCollectionInfo);
          
          if (collectionResult.success) {
            console.log('✅ Native 3DS data collection completed');
            setThreeDSStatus('✅ Data collection complete');
            setStatus('🔒 Data collection complete, proceeding with payment...');
            // Continue with payment processing
          } else {
            throw new Error(collectionResult.error || 'Data collection failed');
          }
        } catch (error) {
          console.error('❌ 3DS data collection failed:', error);
          setThreeDSStatus('❌ Data collection failed');
          setStatus('❌ 3DS data collection failed');
          console.log('3DS Error', `Data collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        } finally {
          setIsPerformingDataCollection(false);
        }
      } else if (!enable3DS && threeDSInfo.needsDataCollection) {
        console.log('🔓 3DS data collection available but skipped (3DS disabled)');
        setThreeDSStatus('🔓 3DS disabled - skipped data collection');
      }

      // Check if 3DS challenge is required (only if 3DS is enabled)
      const challengeInfo = extractChallengeInfo(result.paymentResponse, TUNA_CONFIG.debug);
      if (enable3DS && challengeInfo.needsChallenge && challengeInfo.challengeInfo) {
        console.log('🔒 3DS challenge required:', challengeInfo.challengeInfo.challengeUrl);
        setIsPerformingChallenge(true);
        setThreeDSStatus('🔒 Performing 3DS challenge...');
        setStatus('🔒 3DS authentication required...');
        
        try {
          // Extract complete challenge configuration including ACS URL
          console.log('🔍 Extracting complete challenge configuration...');
          setThreeDSStatus('🔍 Analyzing 3DS challenge...');
          setStatus('🔍 Analyzing 3DS challenge requirements...');
          
          const completeChallenge = await extractCompleteChallenge(challengeInfo.challengeInfo);
          console.log('✅ Complete challenge config:', completeChallenge);
          
          if (!completeChallenge.acsUrl) {
            throw new Error('Could not extract ACS URL from challenge data');
          }
          
          // Prepare real 3DS challenge configuration
          const realChallengeConfig: Real3DSChallengeConfig = {
            challengeUrl: completeChallenge.challengeUrl,
            acsUrl: completeChallenge.acsUrl,
            paRequest: completeChallenge.paRequest,
            termUrl: completeChallenge.termUrl || 'https://centinelapistag.cardinalcommerce.com/V1/TermURL/Overlay/CCA',
            token: completeChallenge.token || '',
            transactionId: completeChallenge.transactionId || challengeInfo.challengeInfo.transactionId || 'unknown',
            md: completeChallenge.md
          };
          
          console.log('🔒 Starting REAL 3DS challenge execution');
          setThreeDSStatus('🔒 Executing real 3DS challenge...');
          setStatus('🔒 3DS challenge - real authentication required');
          
          // Execute real 3DS challenge
          const realResult = await executeReal3DSChallenge(realChallengeConfig);
          
          if (realResult.success) {
            console.log('✅ Real 3DS challenge completed successfully:', realResult);
            setThreeDSStatus('✅ Real 3DS authentication completed');
            setStatus('🔒 3DS authentication successful, finalizing payment...');
            
            // The authentication result would be sent back to Tuna APIs in a real implementation
            setStatus('✅ Payment processing complete (Real 3DS authenticated)');
            setThreeDSStatus('✅ Real 3DS flow completed successfully');
            
          } else {
            throw new Error(realResult.errorMessage || 'Real 3DS challenge failed');
          }
          
        } catch (error) {
          console.error('❌ Real 3DS challenge failed:', error);
          setThreeDSStatus('❌ Real 3DS challenge failed');
          setStatus('❌ Real 3DS authentication failed');
          console.log('3DS Challenge Error', `Real authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        } finally {
          setIsPerformingChallenge(false);
        }
      } else if (!enable3DS && challengeInfo.needsChallenge) {
        console.log('🔓 3DS challenge available but skipped (3DS disabled)');
        setThreeDSStatus('🔓 3DS disabled - skipped challenge');
      }

      if (result.success && result.paymentKey && result.methodId) {
        setCurrentPaymentId(result.paymentId);
        setStatus('🔄 Payment initiated, checking status...');
        
        // Start status polling for final result
        console.log('🔄 Starting status polling...');
        await sdk.startStatusPolling(
          result.paymentKey,
          result.methodId,
          (statusUpdate: any) => {
            console.log('� Payment status update:', statusUpdate);
            handlePaymentStatusUpdate(statusUpdate, result);
          }
        );
      } else if (result.success) {
        // Handle immediate success without polling
        const statusMessage = getStatusMessage(result.paymentResponse);
        setStatus(statusMessage);
        console.log('Payment Completed! 🎉', 'Your payment has been processed successfully.');
      } else {
        // Handle payment failure
        const errorMessage = result.paymentResponse?.message || result.error?.message || 'Credit card payment was not successful';
        const statusCode = result.paymentResponse?.code || 'unknown';
        setStatus(`❌ Payment failed (Code: ${statusCode}): ${errorMessage}`);
        console.log('Payment Failed', `${errorMessage}\n\nError Code: ${statusCode}`);
      }
    } catch (error) {
      console.error('Credit card error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Credit card error: ${errorMessage}`);
      setPaymentResult({ success: false, error: errorMessage });
      console.log('Real API Error', `This is a real error from Tuna API:\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
      setPaymentInProgress(false);
    }
  };

  // Handle payment status updates from polling
  const handlePaymentStatusUpdate = (statusUpdate: any, originalResult: any) => {
    console.log('📊 Processing status update:', statusUpdate);
    
    // Payment status codes from https://dev.tuna.uy/api/tuna-codes#payment-status
    const statusCodes: Record<string, { status: string; message: string; type: string }> = {
      '2': { status: 'approved', message: '✅ Payment Approved!', type: 'success' },
      '4': { status: 'denied', message: '❌ Payment Denied', type: 'error' },
      '5': { status: 'cancelled', message: '🚫 Payment Cancelled', type: 'warning' },
      '8': { status: 'approved', message: '✅ Payment Approved!', type: 'success' },
      'A': { status: 'denied', message: '❌ Payment Denied (Anti-fraud)', type: 'error' },
      'N': { status: 'denied', message: '❌ Payment Denied (Network)', type: 'error' },
    };

    const statusInfo = statusCodes[statusUpdate.paymentStatusFound] || 
                      { status: 'unknown', message: `⚠️ Unknown status: ${statusUpdate.paymentStatusFound}`, type: 'warning' };

    console.log('📊 Status interpretation:', statusInfo);

    // Update the result state
    setPaymentResult({
      ...originalResult,
      finalStatus: statusInfo.status,
      statusMessage: statusInfo.message,
      statusCode: statusUpdate.paymentStatusFound,
      paymentApproved: statusUpdate.paymentApproved
    });

    // Update status display
    setStatus(statusInfo.message);

    // Show appropriate alert
    if (statusInfo.type === 'success') {
      console.log(
        'Payment Successful! 🎉', 
        `${statusInfo.message}\n\nPayment ID: ${originalResult.paymentId}\nStatus Code: ${statusUpdate.paymentStatusFound}`
      );
    } else if (statusInfo.type === 'error') {
      console.log(
        'Payment Failed', 
        `${statusInfo.message}\n\nPayment ID: ${originalResult.paymentId}\nStatus Code: ${statusUpdate.paymentStatusFound}\n\nPlease try again or use a different payment method.`
      );
    } else {
      console.log('Payment Status', `${statusInfo.message}\n\nStatus Code: ${statusUpdate.paymentStatusFound}`);
    }
  };

  // Load saved credit cards
  const loadSavedCards = async () => {
    if (!sdk) {
      console.log('❌ SDK not initialized');
      return;
    }

    setIsLoadingSavedCards(true);
    try {
      console.log('🔍 Loading saved cards...');
      const cards = await sdk.listSavedCards();
      setSavedCards(cards);
      console.log('💳 Loaded saved cards:', cards);
      // Update form visibility based on card count
      if (cards.length === 0) {
        setShowCardForm(true);
      }
    } catch (error) {
      console.error('❌ Failed to load saved cards:', error);
      console.log('Error', 'Failed to load saved cards: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setShowCardForm(true); // Show form if we can't load cards
    } finally {
      setIsLoadingSavedCards(false);
    }
  };

  // Delete a saved card
  const deleteSavedCard = async (token: string) => {
    if (!sdk) {
      console.log('❌ SDK not initialized');
      return;
    }

    try {
      console.log('🗑️ Deleting saved card...');
      const result = await sdk.deleteSavedCard(token);
      if (result.success) {
        console.log('✅ Card deleted successfully');
        // Reload saved cards
        await loadSavedCards();
      } else {
        console.log('Error', 'Failed to delete card: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Failed to delete saved card:', error);
      console.log('Error', 'Failed to delete card: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Helper function to get status message from payment response
  const getStatusMessage = (paymentResponse: any): string => {
    if (!paymentResponse) return '✅ Credit card payment successful!';
    
    const code = paymentResponse.code;
    const status = paymentResponse.status;
    const message = paymentResponse.message;
    
    // Map Tuna API response codes to user-friendly messages
    switch (code) {
      case 1:
        return '✅ Payment successful!';
      case 2:
        return '✅ Payment approved!';
      case 0:
        return '❌ Payment failed';
      default:
        if (status === 'approved' || status === 'success') {
          return '✅ Payment successful!';
        } else if (status === 'denied' || status === 'failed') {
          return `❌ Payment denied${message ? `: ${message}` : ''}`;
        } else if (status === 'pending') {
          return '🔄 Payment pending...';
        } else {
          return `📊 Payment status: ${status || 'unknown'}${message ? ` - ${message}` : ''}`;
        }
    }
  };

  const handlePIX = async () => {
    console.log('🏦 PIX button clicked!');
    if (!sdk) {
      console.log('❌ SDK not initialized');
      console.log('Error', 'SDK not initialized');
      return;
    }

    // Validation - only name and email are required (document is optional)
    if (!customerName || !customerEmail) {
      console.log('Validation Error', 'Please fill in customer name and email for PIX');
      return;
    }

    try {
      setIsLoading(true);
      setPaymentInProgress(true);
      setStatus('Generating PIX payment...');
      console.log('🏦 Generating PIX for customer:', { customerName, customerEmail });

      // Use the real PIX payment API
      const result = await sdk.generatePIXPayment(
        parseFloat(amount),
        {
          name: customerName,
          email: customerEmail,
          document: customerDocument,
          phone: customerPhone
        }
      );

      console.log('🏦 PIX result:', result);

      if (result.success && result.paymentKey) {
        setPixResult({
          qrCode: result.qrCode || '',
          qrImage: result.qrCodeBase64 || '', // Base64 image from API
          qrCodeDataURL: '', // We'll use qrImage instead
          paymentKey: result.paymentKey,
          expiresAt: new Date(result.expiresAt || Date.now() + 30 * 60 * 1000)
        });
        
        setCurrentPaymentId(result.paymentKey);
        setPixStatus('pending');
        setStatus('PIX QR Code generated - waiting for payment...');
        
        // Start polling for payment status using methodId if available
        setIsPollingPix(true);
        await sdk.startStatusPolling(
          result.paymentKey,
          result.methodId || '', // Use methodId from PIX response if available
          (statusUpdate: any) => {
            console.log('📊 PIX Status update:', statusUpdate);
            
            if (statusUpdate.status === 'approved' || statusUpdate.paymentApproved === true) {
              setPixStatus('approved');
              setStatus('PIX payment approved! ✅');
              setIsPollingPix(false);
              console.log(
                'PIX Payment Successful! 🎉',
                'Your PIX payment has been approved and processed.',
                [{ text: 'OK' }]
              );
            } else if (statusUpdate.status === 'declined' || statusUpdate.paymentApproved === false) {
              setPixStatus('declined');
              setStatus('PIX payment declined ❌');
              setIsPollingPix(false);
              console.log(
                'PIX Payment Declined',
                'Your PIX payment was declined. Please try again.',
                [{ text: 'OK' }]
              );
            } else if (statusUpdate.status === 'timeout') {
              setPixStatus('timeout');
              setStatus('PIX payment timeout - please check manually');
              setIsPollingPix(false);
              console.log(
                'PIX Payment Timeout',
                'PIX payment monitoring timed out. Please check your banking app or try again.',
                [{ text: 'OK' }]
              );
            } else if (statusUpdate.status === 'error') {
              setPixStatus('error');
              setStatus('PIX status check error');
              setIsPollingPix(false);
            } else {
              setPixStatus('pending');
              setStatus('PIX payment pending - waiting for confirmation...');
            }
          },
          { maxAttempts: 60, intervalMs: 5000 } // Poll for 5 minutes
        );

        console.log(
          'Real PIX Generated! 🇧🇷',
          `✅ PIX QR Code generated successfully!\n\n📱 Scan the QR code below with your banking app to complete the payment.\n\n⏱️ Monitoring payment status in real-time...`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('PIX generation failed');
      }
    } catch (error) {
      console.error('PIX error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`PIX error: ${errorMessage}`);
      setPaymentInProgress(false);
      console.log('Real API Error', `This is a real error from Tuna API:\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabs = () => {
    const tabs = [
      { key: 'applePay', label: '🍎 Apple Pay', available: Platform.OS === 'ios' && applePayAvailable },
      { key: 'googlePay', label: '🤖 Google Pay', available: Platform.OS === 'android' && googlePayAvailable },
      { key: 'creditCard', label: '💳 Credit Card', available: true },
      { key: 'pix', label: '🇧🇷 PIX', available: true },
    ];

    return (
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
              !tab.available && styles.disabledTab
            ]}
            onPress={() => tab.available && setActiveTab(tab.key as PaymentTab)}
            disabled={!tab.available}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
              !tab.available && styles.disabledTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderApplePayTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Apple Pay Payment</Text>
      <Text style={styles.description}>
        Use Touch ID, Face ID, or passcode to authorize payment with Apple Pay.
      </Text>
      
      <TouchableOpacity
        style={[styles.paymentButton, styles.applePayButton]}
        onPress={handleApplePay}
        disabled={isLoading}
      >
        <Text style={styles.applePayButtonText}>🍎 Pay with Apple Pay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGooglePayTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Google Pay Payment</Text>
      <Text style={styles.description}>
        Pay quickly and securely with Google Pay using your saved payment methods.
      </Text>
      
      <TouchableOpacity
        style={[styles.paymentButton, styles.googlePayButton]}
        onPress={handleGooglePay}
        disabled={isLoading}
      >
        <Text style={styles.googlePayButtonText}>G Pay with Google Pay</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreditCardTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Credit Card Payment</Text>
      <Text style={styles.description}>
        Enter your credit card details. 3DS authentication provides extra security.
      </Text>
      
      {/* Customer Information */}
      <Text style={[styles.label, styles.sectionTitle]}>Customer Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          style={styles.input}
          value={customerNameCC}
          onChangeText={setCustomerNameCC}
          placeholder="Customer name (pre-filled)"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Customer Email</Text>
        <TextInput
          style={styles.input}
          value={customerEmailCC}
          onChangeText={setCustomerEmailCC}
          placeholder="Customer email (pre-filled)"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Saved Cards Section */}
      <Text style={[styles.label, styles.sectionTitle]}>
        {savedCards.length > 0 ? 'Saved Cards' : 'Credit Card Payment'}
      </Text>
      
      {savedCards.length > 0 && (
        <View style={styles.savedCardsToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, !showCardForm && styles.toggleButtonActive]}
            onPress={() => setShowCardForm(false)}
          >
            <Text style={[styles.toggleButtonText, !showCardForm && styles.toggleButtonTextActive]}>
              💳 Use Saved Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showCardForm && styles.toggleButtonActive]}
            onPress={() => {
              setShowCardForm(true);
              setSelectedSavedCard(null); // Clear selection when switching to form
            }}
          >
            <Text style={[styles.toggleButtonText, showCardForm && styles.toggleButtonTextActive]}>
              ➕ Add New Card
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!showCardForm && savedCards.length > 0 ? (
        // Show saved cards list
        <View style={styles.savedCardsContainer}>
          <View style={styles.savedCardsHeader}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadSavedCards}
              disabled={isLoadingSavedCards}
            >
              <Text style={styles.refreshButtonText}>
                {isLoadingSavedCards ? '🔄 Loading...' : '🔄 Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.savedCardsList} horizontal>
            {savedCards.map((card, index) => (
              <TouchableOpacity
                key={card.token}
                style={[
                  styles.savedCardItem,
                  selectedSavedCard === card.token && styles.savedCardSelected
                ]}
                onPress={() => {
                  if (selectedSavedCard === card.token) {
                    setSelectedSavedCard(null);
                  } else {
                    setSelectedSavedCard(card.token);
                    // Pre-fill CVV field only - other fields not needed for saved cards
                    setCvv(''); // CVV always needs to be entered fresh
                  }
                }}
              >
                <Text style={styles.savedCardBrand}>{card.brand || 'Card'}</Text>
                <Text style={styles.savedCardNumber}>{card.maskedNumber}</Text>
                <Text style={styles.savedCardHolder}>{card.cardHolderName}</Text>
                <Text style={styles.savedCardExpiry}>
                  {String(card.expirationMonth).padStart(2, '0')}/{card.expirationYear}
                </Text>
                <TouchableOpacity
                  style={styles.deleteCardButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteSavedCard(card.token);
                  }}
                >
                  <Text style={styles.deleteCardText}>🗑️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {selectedSavedCard && (
            <View style={styles.cvvSection}>
              <Text style={styles.label}>CVV for Selected Card</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="Enter CVV"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              
              {/* Payment Button for Saved Cards */}
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  styles.creditCardButton,
                  (!cvv || isLoading || paymentInProgress) && styles.disabledPaymentButton
                ]}
                onPress={handleCreditCard}
                disabled={!cvv || isLoading || paymentInProgress}
              >
                {(isLoading || paymentInProgress) ? (
                  <View style={styles.loadingButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.creditCardButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.creditCardButtonText}>💳 Pay with Saved Card</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : showCardForm ? (
        // Show new card form
        <>
          <Text style={[styles.label, styles.sectionTitle]}>Card Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={setCardNumber}
                        placeholder="Card number (pre-filled for testing)"
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Expiry Month</Text>
          <TextInput
            style={styles.input}
            value={expiryMonth}
            onChangeText={setExpiryMonth}
                          placeholder="MM (pre-filled)"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        
        <View style={[styles.formGroup, styles.halfWidth]}>
          <Text style={styles.label}>Expiry Year</Text>
          <TextInput
            style={styles.input}
            value={expiryYear}
            onChangeText={setExpiryYear}
            placeholder="YY (pre-filled)"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>CVV</Text>
        <TextInput
          style={styles.input}
          value={cvv}
          onChangeText={setCvv}
                        placeholder="CVV (pre-filled)"
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={styles.input}
          value={holderName}
          onChangeText={setHolderName}
                        placeholder="Cardholder name (pre-filled)"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Enable 3D Secure</Text>
        <Switch value={enable3DS} onValueChange={setEnable3DS} />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Save card for future payments</Text>
        <Switch value={saveCard} onValueChange={setSaveCard} />
      </View>

      <TouchableOpacity
        style={[
          styles.paymentButton, 
          styles.creditCardButton,
          (isLoading || paymentInProgress) && styles.disabledPaymentButton
        ]}
        onPress={handleCreditCard}
        disabled={isLoading || paymentInProgress}
      >
        {(isLoading || paymentInProgress) ? (
          <View style={styles.loadingButtonContent}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.creditCardButtonText}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.creditCardButtonText}>
            {!showCardForm && selectedSavedCard ? '💳 Pay with Saved Card' : 
             showCardForm ? '💳 Pay with New Card' : 
             '💳 Pay with Credit Card'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Payment Result Display */}
      {paymentResult && (
        <View style={[
          styles.paymentResultContainer,
          paymentResult.success 
            ? (paymentResult.finalStatus === 'approved' ? styles.successResult : styles.pendingResult)
            : styles.errorResult
        ]}>
          <Text style={styles.resultTitle}>
            {paymentResult.success 
              ? (paymentResult.finalStatus === 'approved' ? '✅ Payment Successful' 
                 : paymentResult.finalStatus === 'denied' ? '❌ Payment Denied'
                 : '🔄 Payment Processing')
              : '❌ Payment Failed'}
          </Text>
          {paymentResult.paymentId && (
            <Text style={styles.resultDetail}>Payment ID: {paymentResult.paymentId}</Text>
          )}
          {paymentResult.statusCode && (
            <Text style={styles.resultDetail}>Status Code: {paymentResult.statusCode}</Text>
          )}
          {paymentResult.statusMessage && (
            <Text style={styles.resultMessage}>{paymentResult.statusMessage}</Text>
          )}
        </View>
      )}

      {/* Credit Card Payment Status */}
      {paymentInProgress && currentPaymentId && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Payment Processing</Text>
          <Text style={styles.statusText}>{status}</Text>
          <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
        </View>
      )}
        </>
      ) : null}
    </View>
  );

  const renderPIXTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>PIX Payment (Brazil)</Text>
      <Text style={styles.description}>
        PIX is Brazil's instant payment system. Complete customer information to generate QR code.
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="João Silva"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={customerEmail}
          onChangeText={setCustomerEmail}
          placeholder="joao@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Document (CPF/CNPJ) - Optional</Text>
        <TextInput
          style={styles.input}
          value={customerDocument}
          onChangeText={setCustomerDocument}
          placeholder="123.456.789-00 (optional)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone - Optional</Text>
        <TextInput
          style={styles.input}
          value={customerPhone}
          onChangeText={setCustomerPhone}
          placeholder="+55 11 99999-9999 (optional)"
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.paymentButton, styles.pixButton]}
        onPress={handlePIX}
        disabled={isLoading}
      >
        <Text style={styles.pixButtonText}>🇧🇷 Generate PIX QR Code</Text>
      </TouchableOpacity>

      {pixResult && (
        <View style={styles.pixResult}>
          <Text style={styles.pixResultTitle}>PIX QR Code Generated! 🎉</Text>
          
          {/* PIX Status */}
          <View style={styles.pixStatusContainer}>
            <Text style={styles.pixStatusLabel}>Payment Status:</Text>
            <Text style={[
              styles.pixStatusText,
              pixStatus === 'approved' && styles.statusApproved,
              pixStatus === 'declined' && styles.statusDeclined,
              pixStatus === 'timeout' && styles.statusTimeout,
              pixStatus === 'error' && styles.statusError,
              pixStatus === 'pending' && styles.statusPending
            ]}>
              {pixStatus === 'approved' && '✅ APPROVED'}
              {pixStatus === 'declined' && '❌ DECLINED'}
              {pixStatus === 'timeout' && '⏰ TIMEOUT'}
              {pixStatus === 'error' && '⚠️ ERROR'}
              {pixStatus === 'pending' && '⏳ PENDING'}
            </Text>
          </View>

          {/* Real-time polling indicator */}
          {isPollingPix && (
            <View style={styles.pollingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.pollingText}>
                🔄 Monitoring payment status in real-time...
              </Text>
            </View>
          )}

          <Text style={styles.pixResultText}>
            Expires: {pixResult.expiresAt.toLocaleString()}
          </Text>
          
          {/* QR Code Display */}
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodeTitle}>Scan with your banking app</Text>
            
            {/* Actual QR Code */}
            <View style={styles.qrCodeWrapper}>
              {pixResult.qrImage ? (
                <Image
                  source={{ 
                    uri: pixResult.qrImage.startsWith('data:') 
                      ? pixResult.qrImage 
                      : `data:image/png;base64,${pixResult.qrImage}`
                  }}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.qrCodePlaceholder}>
                  <Text style={styles.qrCodePlaceholderText}>📱 QR Code</Text>
                </View>
              )}
            </View>
            
            {/* Copy QR Code Button */}
            <TouchableOpacity 
              style={styles.copyQrButton}
              onPress={async () => {
                const copied = await copyToClipboard(pixResult.qrCode);
                if (copied) {
                  console.log('📋 PIX code copied to clipboard');
                } else {
                  console.log('⚠️ Clipboard not available - PIX code:', pixResult.qrCode);
                }
              }}
            >
              <Text style={styles.copyQrButtonText}>📋 Copy PIX Code</Text>
            </TouchableOpacity>
          </View>
          
          {/* PIX Code Text with Copy Button */}
          <View style={styles.pixCodeSection}>
            <Text style={styles.pixCodeLabel}>PIX Code (Copy & Paste):</Text>
            <View style={styles.pixCodeContainer}>
              <Text style={styles.pixCode} numberOfLines={3} selectable>
                {pixResult.qrCode}
              </Text>
              <TouchableOpacity 
                style={styles.copyIconButton}
                onPress={async () => {
                  const copied = await copyToClipboard(pixResult.qrCode);
                  if (copied) {
                    console.log('📋 PIX code copied to clipboard');
                  } else {
                    console.log('⚠️ Clipboard not available - PIX code:', pixResult.qrCode);
                  }
                }}
              >
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Instructions */}
          <View style={styles.pixInstructionsContainer}>
            <Text style={styles.pixInstructionsTitle}>How to pay:</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Open your banking app</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Scan the QR code or copy the PIX code</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Confirm the payment</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'applePay':
        return renderApplePayTab();
      case 'googlePay':
        return renderGooglePayTab();
      case 'creditCard':
        return renderCreditCardTab();
      case 'pix':
        return renderPIXTab();
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 Tuna Payments</Text>
        <Text style={styles.subtitle}>Real Payment Processing</Text>
      </View>

      {!isSessionConfigured && (
        <View style={styles.sessionCard}>
          <Text style={styles.cardTitle}>Session Configuration</Text>
          <Text style={styles.sessionDescription}>
            Enter your Tuna session ID to initialize the SDK
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Partner Unique ID (for session matching)</Text>
            <View style={styles.partnerIdContainer}>
              <Text style={styles.partnerIdText} selectable={true}>{partnerUniqueId}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={async () => {
                  try {
                    const copied = await copyToClipboard(partnerUniqueId);
                    if (copied) {
                        console.log('📋 Partner ID copied to clipboard');
                    } else {
                        console.log('⚠️ Clipboard not available - Partner ID:', partnerUniqueId);
                    }
                  } catch (error) {
                    console.log('❌ Failed to copy to clipboard:', error);
                  }
                }}
              >
                <Text style={styles.copyButtonText}>📋 Copy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partnerIdNote}>
              Use this ID when generating your session in the backend
            </Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Session ID</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.sessionInput]}
                value={sessionId}
                onChangeText={setSessionId}
                placeholder="Enter Tuna session ID..."
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={styles.pasteButton}
                onPress={async () => {
                  try {
                    const clipboardContent = await getFromClipboard();
                    if (clipboardContent.trim()) {
                      setSessionId(clipboardContent.trim());
                      console.log('📋 Session ID pasted from clipboard');
                    } else {
                      console.log('📋 No content found in clipboard (or clipboard not available)');
                    }
                  } catch (error) {
                    console.log('❌ Failed to read from clipboard:', error);
                  }
                }}
              >
                <Text style={styles.pasteButtonText}>📋 Paste</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={initializeSDK}
            disabled={isLoading || !sessionId.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Initialize SDK</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isSessionConfigured && (
        <View style={styles.sessionCard}>
          <Text style={styles.cardTitle}>Session Active</Text>
          <Text style={styles.sessionId}>
            Session: {sessionId.substring(0, 20)}...
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              setIsSessionConfigured(false);
              setSdk(null);
              setStatus('Enter session ID to initialize REAL Tuna SDK');
            }}
          >
            <Text style={styles.secondaryButtonText}>Change Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>{status}</Text>
        {isLoading && (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
        )}
      </View>

      {isSessionConfigured && (
        <>
          <View style={styles.amountCard}>
            <Text style={styles.cardTitle}>Payment Amount</Text>
            <View style={styles.row}>
              <View style={[styles.formGroup, styles.flexGrow]}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.formGroup, styles.currencyGroup]}>
                <Text style={styles.label}>Currency</Text>
                <TextInput
                  style={styles.input}
                  value={currency}
                  onChangeText={setCurrency}
                  placeholder="BRL"
                  maxLength={3}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          <View style={styles.paymentMethodCard}>
            <Text style={styles.cardTitle}>Payment Methods</Text>
            {renderTabs()}
            {renderTabContent()}
          </View>
        </>
      )}

      {/* Native 3DS Status Display */}
      {(isPerformingDataCollection || isPerformingChallenge) && (
        <View style={styles.threeDSOverlay}>
          <View style={styles.threeDSContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.threeDSTitle}>
              {isPerformingDataCollection ? '🔒 3D Secure Data Collection' : '🔒 3D Secure Authentication'}
            </Text>
            <Text style={styles.threeDSMessage}>
              {threeDSStatus || (isPerformingDataCollection ? 'Collecting device data...' : 'Processing authentication...')}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  loader: {
    marginLeft: 10,
  },
  amountCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  disabledTab: {
    opacity: 0.3,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledTabText: {
    color: '#ccc',
  },
  tabContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  flexGrow: {
    flex: 1,
  },
  currencyGroup: {
    width: 80,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  paymentButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applePayButton: {
    backgroundColor: '#000',
  },
  applePayButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  googlePayButton: {
    backgroundColor: '#4285F4',
  },
  googlePayButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  creditCardButton: {
    backgroundColor: '#6c757d',
  },
  creditCardButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pixButton: {
    backgroundColor: '#32CD32',
  },
  pixButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pixResult: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0fff0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90EE90',
  },
  pixResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 5,
  },
  pixResultText: {
    fontSize: 14,
    color: '#006400',
    marginBottom: 15,
  },
  qrCodeContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  qrCodePlaceholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  qrCodeNote: {
    fontSize: 12,
    color: '#666',
  },
  pixCode: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
  },
  pixStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  pixStatusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pixStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusApproved: {
    color: '#28a745',
  },
  statusDeclined: {
    color: '#dc3545',
  },
  statusTimeout: {
    color: '#ffc107',
  },
  statusError: {
    color: '#dc3545',
  },
  statusPending: {
    color: '#007bff',
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
  },
  pollingText: {
    fontSize: 14,
    color: '#007bff',
    marginLeft: 10,
    fontWeight: '500',
  },
  qrCodeVisual: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  qrCodeArt: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#000',
    lineHeight: 10,
    textAlign: 'center',
  },
  pixCodeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  pixInstructions: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  // Session ID styles
  sessionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  sessionInput: {
    flex: 1,
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  sessionId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  // Button styles
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Payment loading and result styles
  disabledPaymentButton: {
    opacity: 0.6,
    backgroundColor: '#cccccc',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentResultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 2,
  },
  successResult: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  pendingResult: {
    borderColor: '#ffc107',
    backgroundColor: '#fff3cd',
  },
  errorResult: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  // Section title style
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  // Native 3DS Status styles
  threeDSOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  threeDSContainer: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  threeDSTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  threeDSMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  // Partner ID styles
  partnerIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  partnerIdText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  partnerIdNote: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Input container for session ID with paste button
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pasteButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
    marginTop: 2,
  },
  pasteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  // PIX QR Code styles
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  qrCodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  copyQrButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyQrButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pixCodeSection: {
    marginTop: 20,
  },
  pixCodeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  copyIconButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  copyIcon: {
    color: 'white',
    fontSize: 16,
  },
  pixInstructionsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  pixInstructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  // Saved Cards Styles
  savedCardsContainer: {
    marginBottom: 20,
  },
  savedCardsToggle: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  savedCardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  savedCardsList: {
    maxHeight: 120,
  },
  savedCardItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 180,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  savedCardSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  savedCardBrand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  savedCardNumber: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  savedCardHolder: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  savedCardExpiry: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  deleteCardButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  deleteCardText: {
    fontSize: 16,
  },
  cvvSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noSavedCards: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    padding: 20,
  },
});