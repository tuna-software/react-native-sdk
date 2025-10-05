/**
 * Error types and handling for Tuna React Native
 */

export class TunaError extends Error {
  public code: string;
  public originalError?: any;
  
  constructor(message: string, code: string = 'UNKNOWN_ERROR', originalError?: any) {
    super(message);
    this.name = 'TunaError';
    this.code = code;
    this.originalError = originalError;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, TunaError);
    }
  }
}

export class TunaNetworkError extends TunaError {
  constructor(message: string, originalError?: any) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'TunaNetworkError';
  }
}

export class TunaValidationError extends TunaError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'TunaValidationError';
  }
}

export class TunaSessionError extends TunaError {
  constructor(message: string) {
    super(message, 'SESSION_ERROR');
    this.name = 'TunaSessionError';
  }
}

export class TunaTokenizationError extends TunaError {
  constructor(message: string, originalError?: any) {
    super(message, 'TOKENIZATION_ERROR', originalError);
    this.name = 'TunaTokenizationError';
  }
}

export class TunaPaymentError extends TunaError {
  constructor(message: string, originalError?: any) {
    super(message, 'PAYMENT_ERROR', originalError);
    this.name = 'TunaPaymentError';
  }
}

export class TunaNativePaymentError extends TunaError {
  constructor(message: string, originalError?: any) {
    super(message, 'NATIVE_PAYMENT_ERROR', originalError);
    this.name = 'TunaNativePaymentError';
  }
}

export class Tuna3DSError extends TunaError {
  constructor(message: string, originalError?: any) {
    super(message, 'THREE_DS_ERROR', originalError);
    this.name = 'Tuna3DSError';
  }
}

// Error codes mapping similar to the existing JS plugin
export const TunaErrorCodes = {
  // Session errors
  ERR_34: 'Session ID is required',
  ERR_01: 'Session has expired',
  
  // Validation errors
  ERR_19: 'Invalid Google Pay configuration',
  ERR_09: 'Checkout callback function is required',
  ERR_18: 'Container selector not found',
  ERR_25: 'Checkout callback or checkout and pay config is required',
  ERR_26: 'Checkout and pay config must be an object',
  ERR_27: 'Total payment amount must be a positive number',
  ERR_28: 'Payment method amount must be a positive number',
  ERR_29: 'Callback function is required',
  ERR_30: 'Invalid checkout and pay configuration',
  ERR_38: 'Custom area title is required',
  ERR_39: 'Custom area fields are required',
  
  // Payment errors
  ERR_36: 'Invalid payment method type',
  ERR_37: 'Checkout data is required',
  ERR_42: 'Invalid card data for payment processing',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network connection error',
  VALIDATION_ERROR: 'Validation error',
  SESSION_ERROR: 'Session error',
  TOKENIZATION_ERROR: 'Tokenization error',
  PAYMENT_ERROR: 'Payment processing error',
  NATIVE_PAYMENT_ERROR: 'Native payment error',
  THREE_DS_ERROR: '3D Secure authentication error',
} as const;

export type TunaErrorCode = keyof typeof TunaErrorCodes;

/**
 * Creates a TunaError from an error code
 */
export function createTunaError(code: TunaErrorCode, originalError?: any): TunaError {
  const message = TunaErrorCodes[code] || TunaErrorCodes.UNKNOWN_ERROR;
  return new TunaError(message, code, originalError);
}

/**
 * Type guard to check if an error is a TunaError
 */
export function isTunaError(error: any): error is TunaError {
  return error instanceof TunaError;
}

/**
 * Handles and converts various error types to TunaError
 */
export function handleError(error: any, defaultCode: TunaErrorCode = 'UNKNOWN_ERROR'): TunaError {
  if (isTunaError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new TunaError(error.message, defaultCode, error);
  }
  
  if (typeof error === 'string') {
    return new TunaError(error, defaultCode);
  }
  
  return new TunaError('An unknown error occurred', defaultCode, error);
}