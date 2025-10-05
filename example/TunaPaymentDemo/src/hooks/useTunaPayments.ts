/**
 * React Hooks for Tuna React Native SDK
 * 
 * This file provides React hooks for integrating Tuna payment functionality
 * into React Native applications using @rnw-community/react-native-payments
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { TunaReactNative, type TunaReactNativeConfig } from '../TunaReactNativeSimple';
import { TunaPaymentError } from '../types/errors';
import type {
  PaymentDetails,
  PaymentResult,
  ApplePayConfig,
  GooglePayConfig,
  ApplePayResult,
  GooglePayResult,
  PIXResult,
  CustomerInfo,
} from '../types/payment';

// ========================================
// Hook State Types
// ========================================

export interface TunaPaymentState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface ApplePayState {
  isAvailable: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface GooglePayState {
  isAvailable: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface PIXPaymentState {
  isLoading: boolean;
  qrCode: string | null;
  qrCodeImage: string | null;
  expirationTime: Date | null;
  paymentKey: string | null;
  error: Error | null;
}

// ========================================
// Main Tuna Payments Hook
// ========================================

/**
 * Main Tuna Payments Hook
 * 
 * This is the primary hook for integrating Tuna payments into your React Native app.
 * It provides automatic initialization, state management, and platform-specific methods.
 */
export function useTunaPayments(config?: TunaReactNativeConfig) {
  const [tunaSDK, setTunaSDK] = useState<TunaReactNative | null>(null);
  const [state, setState] = useState<TunaPaymentState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  const initializationAttempted = useRef(false);

  /**
   * Initialize the Tuna SDK
   */
  const initialize = useCallback(async (initConfig?: TunaReactNativeConfig) => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    const configToUse = initConfig || config;
    if (!configToUse) {
      setState({
        isInitialized: false,
        isLoading: false,
        error: new TunaPaymentError('Configuration required'),
      });
      return;
    }

    setState((prev: TunaPaymentState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const sdk = new TunaReactNative(configToUse);
      await sdk.initialize('session-' + Date.now());
      
      setTunaSDK(sdk);
      setState({
        isInitialized: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error : new TunaPaymentError(String(error)),
      });
    }
  }, [config]);

  /**
   * Process a payment using native payment sheets
   */
  const processPayment = useCallback(async (paymentDetails: PaymentDetails): Promise<PaymentResult | null> => {
    if (!tunaSDK?.isReady()) {
      setState((prev: TunaPaymentState) => ({ 
        ...prev, 
        error: new TunaPaymentError('SDK not ready') 
      }));
      return null;
    }

    setState((prev: TunaPaymentState) => ({ ...prev, isLoading: true, error: null }));

    try {
      let result: PaymentResult;

      // Use platform-specific native payment methods
      if (Platform.OS === 'ios' && await tunaSDK.canMakeApplePayPayments()) {
        const applePayResult = await tunaSDK.showApplePaySheet(paymentDetails);
        result = {
          paymentId: applePayResult.transactionId || 'apple-pay-' + Date.now(),
          status: applePayResult.success ? 'success' : 'failed',
          transactionId: applePayResult.transactionId,
          amount: paymentDetails.amount,
          createdAt: new Date(),
        };
      } else if (Platform.OS === 'android' && await tunaSDK.isGooglePayReady()) {
        const googlePayResult = await tunaSDK.requestGooglePayment(paymentDetails);
        result = {
          paymentId: googlePayResult.transactionId || 'google-pay-' + Date.now(),
          status: googlePayResult.success ? 'success' : 'failed',
          transactionId: googlePayResult.transactionId,
          amount: paymentDetails.amount,
          createdAt: new Date(),
        };
      } else {
        throw new TunaPaymentError('No supported native payment methods available');
      }
      
      setState((prev: TunaPaymentState) => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      setState((prev: TunaPaymentState) => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new TunaPaymentError(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);

  // Auto-initialize on mount if config is provided
  useEffect(() => {
    if (config && !initializationAttempted.current) {
      initialize();
    }
  }, [config, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tunaSDK) {
        tunaSDK.cleanup?.();
      }
    };
  }, [tunaSDK]);

  return {
    // SDK instance
    tunaSDK,
    // State
    ...state,
    // Methods
    initialize,
    processPayment,
  };
}

// ========================================
// Apple Pay Hook
// ========================================

/**
 * Apple Pay Hook
 * 
 * Hook for Apple Pay integration using native payment capabilities
 */
export function useApplePay(tunaSDK: TunaReactNative | null) {
  const [applePayState, setApplePayState] = useState<ApplePayState>({
    isAvailable: false,
    isConfigured: false,
    isLoading: false,
    error: null,
  });

  /**
   * Check Apple Pay availability
   */
  const checkAvailability = useCallback(async () => {
    if (Platform.OS !== 'ios' || !tunaSDK?.isReady()) {
      setApplePayState((prev: ApplePayState) => ({ ...prev, isAvailable: false }));
      return;
    }

    try {
      const available = await tunaSDK.canMakeApplePayPayments();
      setApplePayState((prev: ApplePayState) => ({ ...prev, isAvailable: available }));
    } catch (error) {
      setApplePayState((prev: ApplePayState) => ({ 
        ...prev, 
        isAvailable: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [tunaSDK]);

  /**
   * Setup Apple Pay configuration
   */
  const setupApplePay = useCallback(async (config: ApplePayConfig) => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setApplePayState((prev: ApplePayState) => ({ ...prev, error }));
      return false;
    }

    setApplePayState((prev: ApplePayState) => ({ ...prev, isLoading: true, error: null }));

    try {
      await tunaSDK.setupApplePay(config);
      setApplePayState((prev: ApplePayState) => ({ 
        ...prev, 
        isLoading: false, 
        isConfigured: true 
      }));
      return true;
    } catch (error) {
      setApplePayState((prev: ApplePayState) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return false;
    }
  }, [tunaSDK]);

  /**
   * Show Apple Pay payment sheet
   */
  const showPaymentSheet = useCallback(async (paymentDetails: PaymentDetails): Promise<ApplePayResult | null> => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setApplePayState((prev: ApplePayState) => ({ ...prev, error }));
      return null;
    }

    setApplePayState((prev: ApplePayState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await tunaSDK.showApplePaySheet(paymentDetails);
      setApplePayState((prev: ApplePayState) => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      setApplePayState((prev: ApplePayState) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);

  // Check availability when SDK becomes ready
  useEffect(() => {
    if (tunaSDK?.isReady()) {
      checkAvailability();
    }
  }, [tunaSDK, checkAvailability]);

  return {
    ...applePayState,
    setupApplePay,
    showPaymentSheet,
    checkAvailability,
  };
}

// ========================================
// Google Pay Hook
// ========================================

/**
 * Google Pay Hook
 * 
 * Hook for Google Pay integration using native payment capabilities
 */
export function useGooglePay(tunaSDK: TunaReactNative | null) {
  const [googlePayState, setGooglePayState] = useState<GooglePayState>({
    isAvailable: false,
    isConfigured: false,
    isLoading: false,
    error: null,
  });

  /**
   * Check Google Pay availability
   */
  const checkAvailability = useCallback(async () => {
    if (Platform.OS !== 'android' || !tunaSDK?.isReady()) {
      setGooglePayState((prev: GooglePayState) => ({ ...prev, isAvailable: false }));
      return;
    }

    try {
      const available = await tunaSDK.isGooglePayReady();
      setGooglePayState((prev: GooglePayState) => ({ ...prev, isAvailable: available }));
    } catch (error) {
      setGooglePayState((prev: GooglePayState) => ({ 
        ...prev, 
        isAvailable: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [tunaSDK]);

  /**
   * Setup Google Pay configuration
   */
  const setupGooglePay = useCallback(async (config: GooglePayConfig) => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setGooglePayState((prev: GooglePayState) => ({ ...prev, error }));
      return false;
    }

    setGooglePayState((prev: GooglePayState) => ({ ...prev, isLoading: true, error: null }));

    try {
      await tunaSDK.setupGooglePay(config);
      setGooglePayState((prev: GooglePayState) => ({ 
        ...prev, 
        isLoading: false, 
        isConfigured: true 
      }));
      return true;
    } catch (error) {
      setGooglePayState((prev: GooglePayState) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return false;
    }
  }, [tunaSDK]);

  /**
   * Show Google Pay payment sheet
   */
  const showPaymentSheet = useCallback(async (paymentDetails: PaymentDetails): Promise<GooglePayResult | null> => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setGooglePayState((prev: GooglePayState) => ({ ...prev, error }));
      return null;
    }

    setGooglePayState((prev: GooglePayState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await tunaSDK.requestGooglePayment(paymentDetails);
      setGooglePayState((prev: GooglePayState) => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      setGooglePayState((prev: GooglePayState) => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);

  // Check availability when SDK becomes ready
  useEffect(() => {
    if (tunaSDK?.isReady()) {
      checkAvailability();
    }
  }, [tunaSDK, checkAvailability]);

  return {
    ...googlePayState,
    setupGooglePay,
    showPaymentSheet,
    checkAvailability,
  };
}

// ========================================
// PIX Payments Hook
// ========================================

/**
 * PIX Payments Hook
 * 
 * Hook for PIX payment integration
 */
export function usePIXPayments(tunaSDK: TunaReactNative | null) {
  const [pixState, setPixState] = useState<PIXPaymentState>({
    isLoading: false,
    qrCode: null,
    qrCodeImage: null,
    expirationTime: null,
    paymentKey: null,
    error: null,
  });

  /**
   * Generate PIX payment
   */
  const generatePIXPayment = useCallback(async (amount: number, customer: CustomerInfo): Promise<PIXResult | null> => {
    if (!tunaSDK?.isReady()) {
      const error = new TunaPaymentError('SDK not ready');
      setPixState((prev: PIXPaymentState) => ({ ...prev, error }));
      return null;
    }

    setPixState((prev: PIXPaymentState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await tunaSDK.initiatePIXPayment(amount, customer);
      setPixState((prev: PIXPaymentState) => ({ 
        ...prev, 
        isLoading: false,
        qrCode: result.qrCode || null,
        qrCodeImage: result.qrCodeBase64 || null,
        expirationTime: result.expiresAt ? new Date(result.expiresAt) : null,
        paymentKey: result.paymentKey || null,
      }));
      return result;
    } catch (error) {
      setPixState((prev: PIXPaymentState) => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);

  /**
   * Clear PIX payment data
   */
  const clearPIXPayment = useCallback(() => {
    setPixState({
      isLoading: false,
      qrCode: null,
      qrCodeImage: null,
      expirationTime: null,
      paymentKey: null,
      error: null,
    });
  }, []);

  return {
    ...pixState,
    generatePIXPayment,
    clearPIXPayment,
  };
}

// ========================================
// Composite Hook
// ========================================

/**
 * Complete Tuna integration with all features
 */
export function useTunaComplete(config: TunaReactNativeConfig) {
  // Main SDK
  const mainHook = useTunaPayments(config);
  
  // Platform-specific hooks
  const applePayHook = useApplePay(mainHook.tunaSDK);
  const googlePayHook = useGooglePay(mainHook.tunaSDK);
  
  // Feature hooks
  const pixPaymentHook = usePIXPayments(mainHook.tunaSDK);

  return {
    // Main SDK
    ...mainHook,
    
    // Apple Pay
    applePay: applePayHook,
    
    // Google Pay
    googlePay: googlePayHook,
    
    // PIX Payments
    pixPayments: pixPaymentHook,
  };
}

export default useTunaPayments;