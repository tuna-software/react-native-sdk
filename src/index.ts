/**
 * Tuna React Native SDK
 * 
 * Provides React Native payment processing capabilities using native payment APIs
 * including Apple Pay and Google Pay through @rnw-community/react-native-payments
 */

// Core types
export * from './types/payment';
export * from './types/session';
export * from './types/tokenization';
export * from './types/errors';

// Core utilities
export * from './utils/formatting';
export * from './utils/validation';
export * from './utils/errors';

// Core services
export * from './core';

// Payment adapters
export * from './adapters';

// Main SDK class (simple version that works without React Native dependencies)
export { 
  TunaReactNative, 
  createTunaReactNative,
  createProductionTunaReactNative,
  createSandboxTunaReactNative,
  type TunaReactNativeConfig 
} from './TunaReactNativeSimple';

// Enhanced SDK class with all features (requires React Native)
export { 
  TunaReactNativeEnhanced,
  type TunaReactNativeConfig as TunaReactNativeEnhancedConfig
} from './core/TunaReactNativeCore';

// React hooks
export * from './hooks';

// Default export for convenience
export { TunaReactNative as default } from './TunaReactNativeSimple';