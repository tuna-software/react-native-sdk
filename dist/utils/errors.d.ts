/**
 * Error handling utilities for Tuna React Native
 */
import { TunaError, TunaNetworkError, TunaValidationError, TunaSessionError, TunaTokenizationError, TunaPaymentError, TunaNativePaymentError, Tuna3DSError, createTunaError, handleError, TunaErrorCode } from '../types/errors';
/**
 * Handles HTTP response errors and converts to appropriate TunaError
 */
export declare function handleHttpError(response: Response, responseText?: string): TunaError;
/**
 * Handles API response and checks for errors
 */
export declare function handleApiResponse<T>(response: any): T;
/**
 * Safely parses JSON and handles errors
 */
export declare function safeJsonParse<T>(json: string, defaultValue: T): T;
/**
 * Creates a timeout promise for network requests
 */
export declare function createTimeoutPromise(timeoutMs: number): Promise<never>;
/**
 * Wraps a promise with timeout functionality
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
/**
 * Retry function with exponential backoff
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Logs error information for debugging
 */
export declare function logError(error: any, context?: string): void;
/**
 * Creates a user-friendly error message
 */
export declare function getUserFriendlyErrorMessage(error: TunaError): string;
export { TunaError, TunaNetworkError, TunaValidationError, TunaSessionError, TunaTokenizationError, TunaPaymentError, TunaNativePaymentError, Tuna3DSError, createTunaError, handleError, type TunaErrorCode, };
//# sourceMappingURL=errors.d.ts.map