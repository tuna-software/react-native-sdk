/**
 * Core payment configuration and result types for Tuna React Native
 */

import { TunaError } from './errors';

export type Environment = 'production' | 'sandbox';

export interface CustomerInfo {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  document?: string;
}

export interface AntifraudConfig {
  key: string;
  value: string;
}

export interface TunaPaymentConfig {
  sessionId: string;
  environment: Environment;
  amount?: number;
  currency?: string;
  orderId?: string;
  antifraudConfig?: AntifraudConfig[];
}

// Apple Pay Configuration
export interface ApplePayConfig {
  merchantIdentifier: string;
  supportedNetworks: ApplePaySupportedNetwork[];
  countryCode: string;
  currencyCode: string;
  requestBillingAddress?: boolean;
  requestPayerEmail?: boolean;
  requestShipping?: boolean;
  applicationData?: string;
}

export type ApplePaySupportedNetwork = 
  | 'visa' 
  | 'mastercard' 
  | 'amex' 
  | 'discover' 
  | 'elo' 
  | 'hipercard';

// Google Pay Configuration
export interface GooglePayConfig {
  environment: 'TEST' | 'PRODUCTION';
  apiVersion: number;
  apiVersionMinor: number;
  merchantInfo: {
    merchantName: string;
    merchantId?: string;
  };
  allowedAuthMethods: GooglePayAuthMethod[];
  allowedCardNetworks: GooglePaySupportedNetwork[];
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY' | 'DIRECT';
    parameters: Record<string, string>;
  };
  billingAddressRequired?: boolean;
  billingAddressParameters?: {
    format?: 'MIN' | 'FULL';
    phoneNumberRequired?: boolean;
  };
  shippingAddressRequired?: boolean;
  shippingAddressParameters?: {
    allowedCountryCodes?: string[];
    phoneNumberRequired?: boolean;
  };
  emailRequired?: boolean;
  currencyCode?: string;
}

export type GooglePayAuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';

export type GooglePaySupportedNetwork = 
  | 'VISA' 
  | 'MASTERCARD' 
  | 'AMEX' 
  | 'DISCOVER'
  | 'JCB';

// Credit Card Configuration
export interface CreditCardConfig {
  allowSaveCard?: boolean;
  installmentOptions?: InstallmentOption[];
}

export interface InstallmentOption {
  key: number;
  value: string;
}

// PIX Configuration
export interface PixConfig {
  enabled: boolean;
}

// Payment Method Configuration
export interface PaymentMethodConfig {
  type?: string;
  name?: string;
  enabled?: boolean;
  supportedBrands?: string[];
  maxInstallments?: number;
  qrCodeEnabled?: boolean;
  daysToExpire?: number;
  creditCard?: CreditCardConfig;
  applePay?: ApplePayConfig;
  googlePay?: GooglePayConfig;
  pix?: PixConfig;
}

// Payment Details
export interface PaymentDetails {
  id?: string;
  amount: number;
  currencyCode: string;
  countryCode: string;
  displayItems?: PaymentDisplayItem[];
  total: PaymentDisplayItem;
  shippingOptions?: PaymentShippingOption[];
}

export interface PaymentDisplayItem {
  label: string;
  amount: {
    currency: string;
    value: string;
  };
}

export interface PaymentShippingOption {
  id: string;
  label: string;
  amount: {
    currency: string;
    value: string;
  };
  selected?: boolean;
}

// Payment Results
export interface PaymentResult {
  paymentId: string;
  status: PaymentStatus;
  statusMessage?: string;
  transactionId?: string;
  authorizationCode?: string;
  receiptUrl?: string;
  threeDSData?: {
    url: string;
    token: string;
    paRequest?: string;
  };
  qrCodeData?: any;
  boletoData?: any;
  amount?: number;
  currency?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
  success?: boolean;
  paymentKey?: string;
  methodId?: string;
  token?: string;
  tokenData?: TokenData;
  paymentResponse?: any;
  error?: TunaError;
  errorMessage?: string;
  fullResponse?: any;
}

export interface ApplePayResult extends PaymentResult {
  applePayToken?: any;
}

export interface GooglePayResult extends PaymentResult {
  googlePayToken?: any;
}

export interface TokenResult {
  success: boolean;
  token?: string;
  brand?: string;
  validFor?: number;
  error?: TunaError;
}

export interface BindResult {
  success: boolean;
  validFor?: number;
  error?: TunaError;
}

export interface DeleteResult {
  success: boolean;
  status?: string;
  error?: TunaError;
}

export interface StatusResult {
  success: boolean;
  paymentApproved?: boolean;
  paymentStatusFound?: string;
  paymentMethodConfirmed?: boolean;
  allowRetry?: boolean;
  error?: TunaError;
}

export interface PIXResult extends PaymentResult {
  qrCode?: string;
  qrCodeBase64?: string;
  copyPasteCode?: string;
  expirationDate?: Date;
  fullResponse?: any;
}

export interface BoletoResult {
  success: boolean;
  boletoUrl?: string;
  barCode?: string;
  paymentKey?: string;
  expiresAt?: string;
  error?: TunaError;
}

export interface TokenData {
  token: string;
  brand: string;
  validFor?: number;
  authenticationInformation?: {
    referenceId?: string;
    transactionId?: string;
  };
}

// Card Data
export interface CardData {
  cardHolderName: string;
  cardNumber: string;
  expirationMonth: number;
  expirationYear: number;
  cvv: string;
  singleUse?: boolean;
  installment?: number;
  customer?: CustomerInfo;
}

export interface SavedCard {
  token: string;
  brand: string;
  cardHolderName: string;
  expirationMonth: number;
  expirationYear: number;
  maskedNumber: string;
  singleUse: boolean;
  data?: any;
}

// Payment Data for processing
export interface PaymentData {
  amount: number;
  countryCode: string;
  paymentMethods: PaymentMethodData[];
  customer?: CustomerInfo;
}

export interface PaymentMethodData {
  Amount: number;
  PaymentMethodType: string;
  Installments?: number;
  CardInfo?: {
    TokenProvider: string;
    Token: string;
    BrandName: string;
    SaveCard: boolean;
    ExpirationMonth: number;
    ExpirationYear: number;
    CardHolderName: string;
    CardNumber: string;
  };
  AuthenticationInformation?: {
    Code: string;
    ReferenceId?: string;
    TransactionId?: string;
  };
}

// Status Polling Types
export interface StatusPollingConfig {
  maxRetries?: number;
  retryInterval?: number;
  timeout?: number;
  backoffMultiplier?: number;
  maxBackoffInterval?: number;
}

export interface StatusCallbackData {
  status: PaymentStatus;
  statusMessage?: string;
  retryCount: number;
  elapsed: number;
  isComplete: boolean;
  response?: PaymentStatusResponse;
  error?: Error;
}

export type StatusCallback = (data: StatusCallbackData) => void;

// Additional types for PaymentManager
export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  description?: string;
  installments?: number;
  token?: string;
  cardData?: {
    number: string;
    holderName: string;
    expirationMonth: number;
    expirationYear: number;
    cvv: string;
    brand?: string;
  };
  nativePaymentData?: any;
  paymentMethod?: string;
  antifraudData?: any;
  metadata?: Record<string, any>;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing' 
  | 'authorized'
  | 'captured'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
  statusMessage?: string;
  transactionId?: string;
  authorizationCode?: string;
  receiptUrl?: string;
  lastUpdated: Date;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface PaymentCancelRequest {
  paymentId: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// 3D Secure Types
export interface SetupPayerInfo {
  accessToken: string;
  referenceId: string;
  deviceDataCollectionUrl: string;
  token: string;
  transactionId?: string;
}

export interface ThreeDSData {
  url: string;
  token: string;
  paRequest?: string;
  provider?: string;
  transactionId?: string;
}

export interface ThreeDSDataCollectionInfo {
  url: string;
  token: string;
  referenceId: string;
  transactionId?: string;
  collectionMethod: string;
  completed?: boolean;
  completedAt?: Date;
}

export interface ThreeDSChallengeInfo {
  url: string;
  token: string;
  paRequest?: string;
  provider?: string;
  transactionId?: string;
  challengeWindowSize?: string;
  messageVersion?: string;
}

export interface ThreeDSConfig {
  deepLink?: string;  // Deep link to return to app after 3DS completion
  autoClose?: boolean; // Whether to auto-close browser after completion (default: true)
  landingUrl?: string; // Custom 3DS landing page URL (defaults to Tuna's)
}

export interface ThreeDSResult {
  success: boolean;
  authenticationData?: any;
  transactionId?: string;
  timestamp: Date;
  provider?: string;
  error?: string;
}

// Anti-fraud Types
export type AntifraudProvider = 'clearsale' | 'siftscience' | 'konduto' | 'cybersource';

export interface DeviceData {
  deviceId: string;
  platform: string;
  platformVersion: string;
  appVersion: string;
  deviceModel: string;
  deviceBrand: string;
  systemName: string;
  systemVersion: string;
  ipAddress: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  locale: string;
  isEmulator: boolean;
  isTablet: boolean;
  hasNotch: boolean;
  batteryLevel: number;
  sessionId: string;
  customerId?: string;
  timestamp: string;
  carrier?: string;
  iosIdForVendor?: string;
  androidId?: string;
  buildNumber?: string;
}

export interface AntifraudResult {
  provider: AntifraudProvider;
  sessionId: string;
  customerId?: string;
  deviceFingerprint: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ===========================================
// DEVICE PROFILING TYPES
// ===========================================

/**
 * Device session information from a profiling provider
 */
export interface DeviceSession {
  key: 'Cybersource' | 'MercadoPago' | 'Sift' | 'Clearsale' | string;
  value: string; // Session ID or device fingerprint
}

/**
 * Callback function to collect device profiling data
 */
export type DeviceProfilingCallback = () => Promise<DeviceSession[]>;

/**
 * FrontData structure for sending device profiling information to Tuna API
 */
export interface FrontData {
  Sessions?: Array<{
    Key: string;
    Value: string;
  }>;
  Origin: 'MOBILE' | 'WEBSITE';
  IpAddress?: string;
  CookiesAccepted?: boolean;
}