/**
 * Configuration constants for Tuna React Native
 */

// Payment method types
export const PAYMENT_METHOD_TYPES = {
  CREDIT_CARD: '1',
  DEBIT_CARD: '2',
  BANK_INVOICE: '3',
  PIX: 'D',
  CRYPTO: 'E',
} as const;

// Card brands
export const CARD_BRANDS = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  ELO: 'Elo',
  HIPERCARD: 'Hipercard',
  DISCOVER: 'Discover',
} as const;

// Apple Pay supported networks
export const APPLE_PAY_NETWORKS = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMEX: 'amex',
  DISCOVER: 'discover',
  ELO: 'elo',
  HIPERCARD: 'hipercard',
} as const;

// Google Pay supported networks
export const GOOGLE_PAY_NETWORKS = {
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  AMEX: 'AMEX',
  DISCOVER: 'DISCOVER',
} as const;

// Payment status codes
export const PAYMENT_STATUS = {
  SUCCESS: ['2', '8'],
  FAILED: ['4', '5', 'A', 'N'],
  PENDING: ['1', '3', '6', '7', '9'],
} as const;

// API response codes
export const API_RESPONSE_CODES = {
  SUCCESS: 1,
  SESSION_EXPIRED: -1,
  INVALID_CARD: -2,
  INSUFFICIENT_FUNDS: -3,
  CARD_DECLINED: -4,
  PROCESSING_ERROR: -5,
} as const;

// Default configuration values
export const DEFAULT_CONFIG = {
  REQUEST_TIMEOUT: 30000, // 30 seconds
  STATUS_POLL_INTERVAL: 2000, // 2 seconds
  MAX_STATUS_POLL_ATTEMPTS: 30, // 1 minute total
  CARD_NUMBER_MAX_LENGTH: 19,
  CVV_MAX_LENGTH: 4,
  CARDHOLDER_NAME_MAX_LENGTH: 100,
} as const;

// Anti-fraud providers
export const ANTIFRAUD_PROVIDERS = {
  CLEARSALE: 'clearsale',
  SIFTSCIENCE: 'siftscience',
  KONDUTO: 'konduto',
  CYBERSOURCE: 'cybersource',
} as const;

// 3DS challenge window sizes
export const THREE_DS_WINDOW_SIZES = {
  SIZE_01: { width: 250, height: 400 },
  SIZE_02: { width: 390, height: 400 },
  SIZE_03: { width: 500, height: 600 },
  SIZE_04: { width: 600, height: 400 },
  SIZE_05: { width: '100%', height: '100%' },
} as const;

// 3DS Landing Page URL
export const THREE_DS_LANDING_URL = 'https://threedslanding-28449915088.europe-west1.run.app';

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];
export type CardBrand = typeof CARD_BRANDS[keyof typeof CARD_BRANDS];
export type ApplePayNetwork = typeof APPLE_PAY_NETWORKS[keyof typeof APPLE_PAY_NETWORKS];
export type GooglePayNetwork = typeof GOOGLE_PAY_NETWORKS[keyof typeof GOOGLE_PAY_NETWORKS];
export type AntifraudProvider = typeof ANTIFRAUD_PROVIDERS[keyof typeof ANTIFRAUD_PROVIDERS];