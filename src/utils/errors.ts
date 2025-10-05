/**
 * Error handling utilities for Tuna React Native
 */

import { 
  TunaError, 
  TunaNetworkError, 
  TunaValidationError, 
  TunaSessionError, 
  TunaTokenizationError, 
  TunaPaymentError,
  TunaNativePaymentError,
  Tuna3DSError,
  createTunaError,
  handleError,
  TunaErrorCode 
} from '../types/errors';

/**
 * Handles HTTP response errors and converts to appropriate TunaError
 */
export function handleHttpError(response: Response, responseText?: string): TunaError {
  const status = response.status;
  const statusText = response.statusText;
  
  let errorCode: TunaErrorCode = 'NETWORK_ERROR';
  let message = `HTTP ${status}: ${statusText}`;
  
  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.message) {
        message = parsed.message;
      }
      if (parsed.code) {
        errorCode = parsed.code;
      }
    } catch {
      // Ignore JSON parse errors
    }
  }
  
  if (status >= 500) {
    return new TunaNetworkError(message);
  } else if (status === 401 || status === 403) {
    return new TunaSessionError(message);
  } else if (status === 400) {
    return new TunaValidationError(message);
  }
  
  return new TunaNetworkError(message);
}

/**
 * Handles API response and checks for errors
 */
export function handleApiResponse<T>(response: any): T {
  if (response.code && response.code < 0) {
    const errorMessage = response.message || 'API request failed';
    throw new TunaError(errorMessage, response.code.toString());
  }
  
  return response as T;
}

/**
 * Safely parses JSON and handles errors
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Creates a timeout promise for network requests
 */
export function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TunaNetworkError('Request timeout'));
    }, timeoutMs);
  });
}

/**
 * Wraps a promise with timeout functionality
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs)
  ]);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw handleError(lastError!);
}

/**
 * Logs error information for debugging
 */
export function logError(error: any, context?: string): void {
  if (__DEV__) {
    console.error(`[TunaRN${context ? ` - ${context}` : ''}]:`, error);
    
    if (error instanceof TunaError && error.originalError) {
      console.error('Original error:', error.originalError);
    }
  }
}

/**
 * Creates a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: TunaError): string {
  // Map technical errors to user-friendly messages
  const userFriendlyMessages: Record<string, string> = {
    'ERR_34': 'Session is required. Please restart the payment process.',
    'ERR_01': 'Your session has expired. Please restart the payment process.',
    'ERR_19': 'Google Pay configuration is invalid.',
    'ERR_36': 'Invalid payment method selected.',
    'ERR_37': 'Payment information is incomplete.',
    'NETWORK_ERROR': 'Connection error. Please check your internet connection and try again.',
    'VALIDATION_ERROR': 'Please check your payment information and try again.',
    'SESSION_ERROR': 'Session error. Please restart the payment process.',
    'TOKENIZATION_ERROR': 'Error processing card information. Please try again.',
    'PAYMENT_ERROR': 'Payment processing error. Please try again.',
    'NATIVE_PAYMENT_ERROR': 'Payment service is not available. Please try again.',
    'THREE_DS_ERROR': 'Authentication error. Please try again.',
  };
  
  return userFriendlyMessages[error.code] || 'An unexpected error occurred. Please try again.';
}

// Re-export error types for convenience
export {
  TunaError,
  TunaNetworkError,
  TunaValidationError,
  TunaSessionError,
  TunaTokenizationError,
  TunaPaymentError,
  TunaNativePaymentError,
  Tuna3DSError,
  createTunaError,
  handleError,
  type TunaErrorCode,
};