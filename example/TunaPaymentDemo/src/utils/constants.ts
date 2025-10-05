/**
 * Constants for Tuna React Native SDK
 */

/**
 * API endpoints for Tuna services
 */
export const TUNA_API_ENDPOINTS = {
  // Session management
  NEW_SESSION: '/api/Token/NewSession',
  
  // Tokenization
  GENERATE_TOKEN: '/api/Token/Generate',
  LIST_TOKENS: '/api/Token/List',
  BIND_TOKEN: '/api/Token/Bind',
  DELETE_TOKEN: '/api/Token/Delete',
  
  // Payment processing
  INIT_PAYMENT: '/api/Payment/Init',
  PAYMENT_STATUS: '/api/Payment/Status',
  PAYMENT_CANCEL: '/api/Payment/Cancel',
  
  // 3DS
  THREEDS_AUTHENTICATE: '/api/3DS/Authenticate',
  THREEDS_CALLBACK: '/api/3DS/Callback',
  
  // Anti-fraud
  ANTIFRAUD_VALIDATE: '/api/AntifraudValidate',
} as const;

// Alias for backwards compatibility and easier imports
export const ENDPOINTS = TUNA_API_ENDPOINTS;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  // Session timeout in minutes
  SESSION_TIMEOUT: 30,
  
  // Payment timeout in seconds
  PAYMENT_TIMEOUT: 120,
  
  // Maximum retry attempts
  MAX_RETRIES: 3,
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,
  
  // Default currency
  DEFAULT_CURRENCY: 'BRL',
  
  // Default environment
  DEFAULT_ENVIRONMENT: 'production',
} as const;

/**
 * Supported payment methods
 */
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  BOLETO: 'boleto',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  SAVED_CARD: 'saved_card',
} as const;

/**
 * Supported card brands
 */
export const CARD_BRANDS = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DINERS: 'diners',
  DISCOVER: 'discover',
  JCB: 'jcb',
  ELO: 'elo',
  HIPERCARD: 'hipercard',
} as const;

/**
 * Environment configurations
 */
export const ENVIRONMENTS = {
  SANDBOX: 'sandbox',
  PRODUCTION: 'production',
} as const;

/**
 * Event types for payment flow
 */
export const PAYMENT_EVENTS = {
  // Session events
  SESSION_CREATED: 'session_created',
  SESSION_EXPIRED: 'session_expired',
  
  // Tokenization events
  TOKEN_GENERATED: 'token_generated',
  TOKEN_FAILED: 'token_failed',
  
  // Payment events
  PAYMENT_STARTED: 'payment_started',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_CANCELLED: 'payment_cancelled',
  
  // 3DS events
  THREEDS_STARTED: 'threeds_started',
  THREEDS_SUCCESS: 'threeds_success',
  THREEDS_FAILED: 'threeds_failed',
  
  // Native payment events
  NATIVE_PAYMENT_AVAILABLE: 'native_payment_available',
  NATIVE_PAYMENT_UNAVAILABLE: 'native_payment_unavailable',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Anti-fraud script configurations
 */
export const ANTIFRAUD_CONFIG = {
  // Script loading timeout
  SCRIPT_TIMEOUT: 10000,
  
  // Session ID length
  SESSION_ID_LENGTH: 32,
  
  // Default script URLs (will be configured based on environment)
  SANDBOX_SCRIPT_URL: 'https://h.online-metrix.net/fp/tags.js',
  PRODUCTION_SCRIPT_URL: 'https://h.online-metrix.net/fp/tags.js',
} as const;

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  // Card number length limits
  MIN_CARD_LENGTH: 13,
  MAX_CARD_LENGTH: 19,
  
  // CVV length limits
  CVV_LENGTH_DEFAULT: 3,
  CVV_LENGTH_AMEX: 4,
  
  // Document lengths
  CPF_LENGTH: 11,
  CNPJ_LENGTH: 14,
  
  // Name length limits
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  
  // Amount limits
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
  
  // Installment limits
  MIN_INSTALLMENTS: 1,
  MAX_INSTALLMENTS: 12,
} as const;

/**
 * Type exports for constants
 */
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
export type CardBrand = typeof CARD_BRANDS[keyof typeof CARD_BRANDS];
export type TunaEnvironment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
export type PaymentEvent = typeof PAYMENT_EVENTS[keyof typeof PAYMENT_EVENTS];