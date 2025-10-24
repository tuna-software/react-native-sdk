/**
 * React Native Wrapper for TunaReactNative SDK
 * 
 * This wrapper provides React Native-specific functionality and imports
 */

import { Platform } from 'react-native';
import { TunaReactNativeEnhanced, TunaReactNativeConfig } from './core/TunaReactNativeCore';
import type {
  ApplePayConfig,
  GooglePayConfig,
  PaymentDetails,
  PaymentResult,
  ApplePayResult,
  GooglePayResult,
  PIXResult,
  CustomerInfo,
} from './types/payment';
import { CardData } from './api/tunaApi';
import { SavedCard } from './storage/savedCards';

// Import native payment libraries
let ApplePayModule: any = null;
let GooglePayModule: any = null;

try {
  const RNPayments = require('@rnw-community/react-native-payments');
  ApplePayModule = RNPayments;
  console.log('🍎 Apple Pay module loaded');
} catch (e) {
  console.log('🍎 Apple Pay module not available:', (e as Error).message);
}

try {
  GooglePayModule = null; // We'll use GooglePayAdapter instead
  console.log('🤖 Google Pay will use GooglePayAdapter with @rnw-community/react-native-payments');
} catch (e) {
  console.log('🤖 Google Pay module not available:', (e as Error).message);
}

/**
 * React Native TunaReactNative SDK Class
 * 
 * Extends the core SDK with React Native-specific functionality
 */
export class TunaReactNative extends TunaReactNativeEnhanced {
  
  constructor(config: TunaReactNativeConfig = {}) {
    super(config);
  }

  // ===========================================
  // REACT NATIVE APPLE PAY IMPLEMENTATION
  // ===========================================

  /**
   * Check if Apple Pay is available on this device (React Native)
   */
  async canMakeApplePayPayments(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      if (!ApplePayModule) {
        return false;
      }

      // TODO: Implement proper Apple Pay availability check with RN Payments
      return true;
    } catch (error) {
      if (this.config.debug) {
        console.error('Apple Pay availability check failed:', error);
      }
      return false;
    }
  }

  /**
   * Setup Apple Pay configuration (React Native)
   */
  async setupApplePay(config: ApplePayConfig): Promise<void> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Pay is only available on iOS');
    }

    this.applePayConfig = config;
    
    if (this.config.debug) {
      console.log('🍎 Apple Pay setup completed:', config);
    }
  }

  /**
   * Show Apple Pay payment sheet (React Native)
   */
  async showApplePaySheet(paymentDetails: PaymentDetails): Promise<ApplePayResult> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Pay is only available on iOS');
    }

    if (!this.applePayConfig) {
      throw new Error('Apple Pay is not configured. Call setupApplePay() first.');
    }

    try {
      console.log('🍎 [ApplePay] Starting Apple Pay payment:', paymentDetails);
      
      // Implementation with @rnw-community/react-native-payments will go here
      // For now, return a simulated result
      
      const result: ApplePayResult = {
        success: true,
        paymentId: `apple-pay-${Date.now()}`,
        status: 'success',
        statusMessage: 'Apple Pay payment completed',
        amount: paymentDetails.amount,
        currency: paymentDetails.currencyCode,
        createdAt: new Date(),
        applePayToken: 'simulated_apple_pay_token'
      };

      return result;

    } catch (error) {
      console.error('❌ [ApplePay] Payment failed:', error);
      throw new Error(
        'Apple Pay payment failed: ' + (error instanceof Error ? error.message : String(error))
      );
    }
  }

  // ===========================================
  // REACT NATIVE GOOGLE PAY IMPLEMENTATION
  // ===========================================

  /**
   * Check if Google Pay is ready to pay (React Native)
   */
  async isGooglePayReady(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        return false;
      }

      if (!GooglePayModule || !GooglePayModule.isReadyToPay) {
        return false;
      }

      const isReady = await GooglePayModule.isReadyToPay({
        allowedPaymentMethods: ['CARD'],
        allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
        allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
      });

      return isReady;
    } catch (error) {
      if (this.config.debug) {
        console.error('Google Pay readiness check failed:', error);
      }
      return false;
    }
  }

  /**
   * Setup Google Pay configuration (React Native)
   */
  async setupGooglePay(config: GooglePayConfig): Promise<void> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'android') {
      throw new Error('Google Pay is only available on Android');
    }

    this.googlePayConfig = config;
    
    if (this.config.debug) {
      console.log('🤖 Google Pay setup completed:', config);
    }
  }

  /**
   * Request Google Pay payment (React Native)
   */
  async requestGooglePayment(paymentDetails: PaymentDetails): Promise<GooglePayResult> {
    this.ensureInitialized();
    
    if (Platform.OS !== 'android') {
      throw new Error('Google Pay is only available on Android');
    }

    if (!this.googlePayConfig) {
      throw new Error('Google Pay is not configured. Call setupGooglePay() first.');
    }

    try {
      console.log('🤖 [GooglePay] Starting Google Pay payment:', paymentDetails);
      
      // Implementation with @rnw-community/react-native-payments will go here
      // For now, return a simulated result
      
      const result: GooglePayResult = {
        success: true,
        paymentId: `google-pay-${Date.now()}`,
        status: 'success',
        statusMessage: 'Google Pay payment completed',
        amount: paymentDetails.amount,
        currency: paymentDetails.currencyCode,
        createdAt: new Date(),
        googlePayToken: 'simulated_google_pay_token'
      };

      return result;

    } catch (error) {
      console.error('❌ [GooglePay] Payment failed:', error);
      throw new Error(
        'Google Pay payment failed: ' + (error instanceof Error ? error.message : String(error))
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
export function createTunaReactNative(config?: TunaReactNativeConfig): TunaReactNative {
  return new TunaReactNative(config);
}

/**
 * Create a production TunaReactNative instance
 */
export function createProductionTunaReactNative(config?: Omit<TunaReactNativeConfig, 'environment'>): TunaReactNative {
  return new TunaReactNative({ ...config, environment: 'production' });
}

/**
 * Create a sandbox TunaReactNative instance
 */
export function createSandboxTunaReactNative(config?: Omit<TunaReactNativeConfig, 'environment'>): TunaReactNative {
  return new TunaReactNative({ ...config, environment: 'sandbox' });
}