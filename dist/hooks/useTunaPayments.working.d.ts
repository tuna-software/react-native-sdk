/**
 * React Hooks for Tuna React Native SDK
 *
 * This file provides React hooks for integrating Tuna payment functionality
 * into React Native applications. Currently only hooks that work with the
 * simplified TunaReactNative API are enabled.
 */
import TunaReactNative from '../TunaReactNativeSimple';
import { TunaConfig } from '../types';
/**
 * Main Tuna Payments Hook
 *
 * This is the primary hook for integrating Tuna payments into your React Native app.
 * It provides automatic initialization, state management, and platform-specific methods.
 */
export declare function useTunaPayments(config?: TunaConfig): any;
/**
 * Apple Pay Hook
 *
 * Hook for Apple Pay integration
 */
export declare function useApplePay(tunaSDK: TunaReactNative | null): any;
/**
 * Google Pay Hook
 *
 * Hook for Google Pay integration
 */
export declare function useGooglePay(tunaSDK: TunaReactNative | null): any;
/**
 * PIX Payments Hook
 *
 * Hook for PIX payment integration
 */
export declare function usePIXPayments(tunaSDK: TunaReactNative | null): any;
export { useTunaPayments, useApplePay, useGooglePay, usePIXPayments, };
export default useTunaPayments;
//# sourceMappingURL=useTunaPayments.working.d.ts.map