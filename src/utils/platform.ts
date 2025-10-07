/**
 * Platform Utilities
 * 
 * Handles platform detection for cross-platform compatibility
 */

export type PlatformType = 'ios' | 'android' | 'web' | 'unknown';

/**
 * Simple platform detection that doesn't require React Native
 */
export function detectPlatform(): PlatformType {
  // Check for user agent in web environments
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'web';
  }
  
  // Default to unknown for other environments
  return 'unknown';
}

/**
 * Check if platform is iOS
 */
export function isIOS(): boolean {
  return detectPlatform() === 'ios';
}

/**
 * Check if platform is Android
 */
export function isAndroid(): boolean {
  return detectPlatform() === 'android';
}

/**
 * Check if platform is web
 */
export function isWeb(): boolean {
  return detectPlatform() === 'web';
}

/**
 * Check if we're in a React Native environment
 * This will be overridden by the React Native wrapper
 */
export function isReactNative(): boolean {
  const platform = detectPlatform();
  return platform === 'ios' || platform === 'android';
}