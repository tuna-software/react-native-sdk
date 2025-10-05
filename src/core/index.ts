/**
 * Core services for Tuna React Native SDK
 * 
 * This module exports all core payment processing services including
 * session management, tokenization, payment processing, 3DS authentication,
 * anti-fraud integration, and status polling.
 */

// Core payment services
export { SessionManager } from './session';
export { TokenizationManager } from './tokenization';
export { PaymentManager } from './payment';

// Phase 4: Advanced features
export { ThreeDSHandler, createThreeDSHandler } from './ThreeDSHandler';
export { AntifraudManager, createAntifraudManager } from './AntifraudManager';
export { StatusPoller, createStatusPoller } from './StatusPoller';

// Re-export types for convenience
export type {
  ThreeDSData,
  ThreeDSResult,
  ThreeDSDataCollectionInfo,
  ThreeDSChallengeInfo,
  SetupPayerInfo,
  AntifraudProvider,
  DeviceData,
  AntifraudResult,
  StatusPollingConfig,
  StatusCallbackData,
  StatusCallback,
} from '../types/payment';