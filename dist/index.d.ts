import { PaymentRequest as PaymentRequest$1 } from '@rnw-community/react-native-payments';

/**
 * Error types and handling for Tuna React Native
 */
declare class TunaError extends Error {
    code: string;
    originalError?: any;
    constructor(message: string, code?: string, originalError?: any);
}
declare class TunaNetworkError extends TunaError {
    constructor(message: string, originalError?: any);
}
declare class TunaValidationError extends TunaError {
    constructor(message: string, field?: string);
}
declare class TunaSessionError extends TunaError {
    constructor(message: string);
}
declare class TunaTokenizationError extends TunaError {
    constructor(message: string, originalError?: any);
}
declare class TunaPaymentError extends TunaError {
    constructor(message: string, originalError?: any);
}
declare class TunaNativePaymentError extends TunaError {
    constructor(message: string, originalError?: any);
}
declare class Tuna3DSError extends TunaError {
    constructor(message: string, originalError?: any);
}
declare const TunaErrorCodes: {
    readonly ERR_34: "Session ID is required";
    readonly ERR_01: "Session has expired";
    readonly ERR_19: "Invalid Google Pay configuration";
    readonly ERR_09: "Checkout callback function is required";
    readonly ERR_18: "Container selector not found";
    readonly ERR_25: "Checkout callback or checkout and pay config is required";
    readonly ERR_26: "Checkout and pay config must be an object";
    readonly ERR_27: "Total payment amount must be a positive number";
    readonly ERR_28: "Payment method amount must be a positive number";
    readonly ERR_29: "Callback function is required";
    readonly ERR_30: "Invalid checkout and pay configuration";
    readonly ERR_38: "Custom area title is required";
    readonly ERR_39: "Custom area fields are required";
    readonly ERR_36: "Invalid payment method type";
    readonly ERR_37: "Checkout data is required";
    readonly ERR_42: "Invalid card data for payment processing";
    readonly UNKNOWN_ERROR: "An unknown error occurred";
    readonly NETWORK_ERROR: "Network connection error";
    readonly VALIDATION_ERROR: "Validation error";
    readonly SESSION_ERROR: "Session error";
    readonly TOKENIZATION_ERROR: "Tokenization error";
    readonly PAYMENT_ERROR: "Payment processing error";
    readonly NATIVE_PAYMENT_ERROR: "Native payment error";
    readonly THREE_DS_ERROR: "3D Secure authentication error";
};
type TunaErrorCode = keyof typeof TunaErrorCodes;
/**
 * Creates a TunaError from an error code
 */
declare function createTunaError(code: TunaErrorCode, originalError?: any): TunaError;
/**
 * Type guard to check if an error is a TunaError
 */
declare function isTunaError(error: any): error is TunaError;
/**
 * Handles and converts various error types to TunaError
 */
declare function handleError(error: any, defaultCode?: TunaErrorCode): TunaError;

/**
 * Core payment configuration and result types for Tuna React Native
 */

type Environment = 'production' | 'sandbox';
interface CustomerInfo {
    id?: string;
    email?: string;
    name?: string;
    phone?: string;
    document?: string;
}
interface AntifraudConfig {
    key: string;
    value: string;
}
interface TunaPaymentConfig {
    sessionId: string;
    environment: Environment;
    amount?: number;
    currency?: string;
    orderId?: string;
    antifraudConfig?: AntifraudConfig[];
}
interface ApplePayConfig {
    merchantIdentifier: string;
    supportedNetworks: ApplePaySupportedNetwork[];
    countryCode: string;
    currencyCode: string;
    requestBillingAddress?: boolean;
    requestPayerEmail?: boolean;
    requestShipping?: boolean;
    applicationData?: string;
}
type ApplePaySupportedNetwork = 'visa' | 'mastercard' | 'amex' | 'discover' | 'elo' | 'hipercard';
interface GooglePayConfig {
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
type GooglePayAuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';
type GooglePaySupportedNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'JCB';
interface CreditCardConfig {
    allowSaveCard?: boolean;
    installmentOptions?: InstallmentOption[];
}
interface InstallmentOption {
    key: number;
    value: string;
}
interface PixConfig {
    enabled: boolean;
}
interface PaymentMethodConfig {
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
interface PaymentDetails {
    id?: string;
    amount: number;
    currencyCode: string;
    countryCode: string;
    displayItems?: PaymentDisplayItem[];
    total: PaymentDisplayItem;
    shippingOptions?: PaymentShippingOption[];
}
interface PaymentDisplayItem {
    label: string;
    amount: {
        currency: string;
        value: string;
    };
}
interface PaymentShippingOption {
    id: string;
    label: string;
    amount: {
        currency: string;
        value: string;
    };
    selected?: boolean;
}
interface PaymentResult {
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
    tokenData?: TokenData;
    paymentResponse?: any;
    error?: TunaError;
}
interface ApplePayResult extends PaymentResult {
    applePayToken?: any;
}
interface GooglePayResult extends PaymentResult {
    googlePayToken?: any;
}
interface TokenResult {
    success: boolean;
    token?: string;
    brand?: string;
    validFor?: number;
    error?: TunaError;
}
interface BindResult {
    success: boolean;
    validFor?: number;
    error?: TunaError;
}
interface DeleteResult {
    success: boolean;
    status?: string;
    error?: TunaError;
}
interface StatusResult {
    success: boolean;
    paymentApproved?: boolean;
    paymentStatusFound?: string;
    paymentMethodConfirmed?: boolean;
    allowRetry?: boolean;
    error?: TunaError;
}
interface PIXResult {
    success: boolean;
    qrCode?: string;
    qrCodeBase64?: string;
    paymentKey?: string;
    expiresAt?: string;
    error?: TunaError;
}
interface BoletoResult {
    success: boolean;
    boletoUrl?: string;
    barCode?: string;
    paymentKey?: string;
    expiresAt?: string;
    error?: TunaError;
}
interface TokenData {
    token: string;
    brand: string;
    validFor?: number;
    authenticationInformation?: {
        referenceId?: string;
        transactionId?: string;
    };
}
interface CardData {
    cardHolderName: string;
    cardNumber: string;
    expirationMonth: number;
    expirationYear: number;
    cvv: string;
    singleUse?: boolean;
    installment?: number;
    customer?: CustomerInfo;
}
interface SavedCard {
    token: string;
    brand: string;
    cardHolderName: string;
    expirationMonth: number;
    expirationYear: number;
    maskedNumber: string;
    singleUse: boolean;
    data?: any;
}
interface PaymentData {
    amount: number;
    countryCode: string;
    paymentMethods: PaymentMethodData[];
    customer?: CustomerInfo;
}
interface PaymentMethodData {
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
interface StatusPollingConfig {
    maxRetries?: number;
    retryInterval?: number;
    timeout?: number;
    backoffMultiplier?: number;
    maxBackoffInterval?: number;
}
interface StatusCallbackData {
    status: PaymentStatus;
    statusMessage?: string;
    retryCount: number;
    elapsed: number;
    isComplete: boolean;
    response?: PaymentStatusResponse;
    error?: Error;
}
type StatusCallback = (data: StatusCallbackData) => void;
interface PaymentRequest {
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
type PaymentStatus = 'pending' | 'processing' | 'authorized' | 'captured' | 'success' | 'failed' | 'cancelled' | 'expired' | 'refunded';
interface PaymentStatusResponse {
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
interface PaymentCancelRequest {
    paymentId: string;
    reason?: string;
    metadata?: Record<string, any>;
}
interface SetupPayerInfo {
    accessToken: string;
    referenceId: string;
    deviceDataCollectionUrl: string;
    token: string;
    transactionId?: string;
}
interface ThreeDSData {
    url: string;
    token: string;
    paRequest?: string;
    provider?: string;
    transactionId?: string;
}
interface ThreeDSDataCollectionInfo {
    url: string;
    token: string;
    referenceId: string;
    transactionId?: string;
    collectionMethod: string;
    completed?: boolean;
    completedAt?: Date;
}
interface ThreeDSChallengeInfo {
    url: string;
    token: string;
    paRequest?: string;
    provider?: string;
    transactionId?: string;
    challengeWindowSize?: string;
    messageVersion?: string;
}
interface ThreeDSResult {
    success: boolean;
    authenticationData?: any;
    transactionId?: string;
    timestamp: Date;
    provider?: string;
    error?: string;
}
type AntifraudProvider = 'clearsale' | 'siftscience' | 'konduto' | 'cybersource';
interface DeviceData {
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
interface AntifraudResult {
    provider: AntifraudProvider;
    sessionId: string;
    customerId?: string;
    deviceFingerprint: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

/**
 * Session management types for Tuna React Native
 */

interface SessionResponse {
    sessionId: string;
    code: number | string;
    message?: string;
}
interface ValidationResponse {
    partnerUniqueId?: string;
    partnerId?: number;
    accountIsolation?: boolean;
    code: number | string;
    message?: string;
}
interface SessionConfig {
    sessionId: string;
    environment: Environment;
    customer?: CustomerInfo;
}
interface CreateSessionRequest {
    customer?: CustomerInfo;
}
interface ValidateSessionRequest {
    sessionId: string;
}
/**
 * Configuration for Tuna session management
 */
interface TunaSessionConfig {
    baseUrl: string;
    environment: Environment;
    sessionTimeout?: number;
    headers?: Record<string, string>;
}
/**
 * Credentials required to create a session
 */
interface SessionCredentials {
    appToken: string;
    account: string;
    customerId?: string;
    sessionId?: string;
}
/**
 * Active session data
 */
interface TunaSession {
    sessionId: string;
    account: string;
    customerId?: string;
    environment: Environment;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}

/**
 * Tokenization types for Tuna React Native
 */

interface TokenResponse {
    token: string;
    brand: string;
    validFor?: number;
    code: number | string;
    message?: string;
}
interface TokenListResponse {
    tokens: SavedCard[];
    code: number | string;
    message?: string;
}
interface BindResponse {
    validFor?: number;
    code: number | string;
    message?: string;
}
interface DeleteResponse {
    status: string;
    code: number | string;
    message?: string;
}
interface GenerateTokenRequest {
    sessionId: string;
    card: CardData;
    authenticationInformation?: {
        code: string;
    };
}
interface ListTokensRequest {
    sessionId: string;
}
interface BindTokenRequest {
    sessionId: string;
    token: string;
    cvv: string;
    authenticationInformation?: {
        code: string;
    };
}
interface DeleteTokenRequest {
    sessionId: string;
    token: string;
}
interface TokenizationRequest {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: number;
    expirationYear: number;
    cvv: string;
    customerId?: string;
    brand?: string;
}
interface TokenizationResponse {
    token: string;
    maskedCardNumber: string;
    cardBrand?: string;
    lastFourDigits: string;
    expirationMonth: number;
    expirationYear: number;
    customerId?: string;
    createdAt: Date;
}
interface SavedToken {
    token: string;
    maskedCardNumber: string;
    cardBrand?: string;
    lastFourDigits: string;
    expirationMonth: number;
    expirationYear: number;
    customerId?: string;
    createdAt: Date;
    isDefault?: boolean;
}
interface CardTokenizationData {
    CardNumber: string;
    CardHolderName: string;
    ExpirationMonth: number;
    ExpirationYear: number;
    CVV: string;
    CustomerId?: string;
    Brand?: string;
}
interface TokenBindRequest {
    token: string;
    customerId: string;
    isDefault?: boolean;
}
interface TokenListRequest {
    customerId?: string;
}
interface TokenDeleteRequest {
    token: string;
    customerId?: string;
}

/**
 * Formatting utilities for Tuna React Native
 */
/**
 * Masks a credit card number showing only first 6 and last 4 digits
 */
declare function maskCreditCard(creditCardNumber: string): string;
/**
 * Formats a credit card number with spaces for display
 */
declare function formatCreditCardDisplay(cardNumber: string): string;
/**
 * Formats CPF for display (XXX.XXX.XXX-XX)
 */
declare function formatCPF(cpf: string): string;
/**
 * Formats CNPJ for display (XX.XXX.XXX/XXXX-XX)
 */
declare function formatCNPJ(cnpj: string): string;
/**
 * Formats phone number for display
 */
declare function formatPhone(phone: string): string;
/**
 * Formats currency for display
 */
declare function formatCurrency(amount: number, currencyCode?: string, locale?: string): string;
/**
 * Cleans a string removing all non-alphanumeric characters
 */
declare function cleanString(str: string): string;
/**
 * Capitalizes first letter of each word
 */
declare function capitalizeWords(str: string): string;
/**
 * Truncates text to specified length with ellipsis
 */
declare function truncateText(text: string, maxLength: number): string;
/**
 * Formats expiration date for display (MM/YY)
 */
declare function formatExpirationDate(month: number, year: number): string;
/**
 * Validates and formats card expiration input
 */
declare function formatCardExpiration(input: string): string;

/**
 * Error handling utilities for Tuna React Native
 */

/**
 * Handles HTTP response errors and converts to appropriate TunaError
 */
declare function handleHttpError(response: Response, responseText?: string): TunaError;
/**
 * Handles API response and checks for errors
 */
declare function handleApiResponse<T>(response: any): T;
/**
 * Safely parses JSON and handles errors
 */
declare function safeJsonParse<T>(json: string, defaultValue: T): T;
/**
 * Creates a timeout promise for network requests
 */
declare function createTimeoutPromise(timeoutMs: number): Promise<never>;
/**
 * Wraps a promise with timeout functionality
 */
declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
/**
 * Retry function with exponential backoff
 */
declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Logs error information for debugging
 */
declare function logError(error: any, context?: string): void;
/**
 * Creates a user-friendly error message
 */
declare function getUserFriendlyErrorMessage(error: TunaError): string;

/**
 * Validation utilities for Tuna React Native
 */

/**
 * Credit card validation utilities
 */
declare class CardValidator {
    /**
     * Validates a credit card number using Luhn algorithm
     */
    static isValidNumber(cardNumber: string): boolean;
    /**
     * Luhn algorithm implementation
     */
    private static luhnCheck;
    /**
     * Detects credit card type based on number
     */
    static getCardType(cardNumber: string): string;
    /**
     * Validates CVV/CVC based on card type
     */
    static isValidCVV(cvv: string, cardType?: string): boolean;
    /**
     * Validates expiration date (MM/YY or MM/YYYY format)
     */
    static isValidExpiry(expiry: string): boolean;
    /**
     * Validates cardholder name
     */
    static isValidName(name: string): boolean;
}
/**
 * Brazilian document validation utilities
 */
declare class BrazilianDocumentValidator {
    /**
     * Validates CPF (Brazilian individual taxpayer ID)
     */
    static isValidCPF(cpf: string): boolean;
    /**
     * Validates CNPJ (Brazilian company taxpayer ID)
     */
    static isValidCNPJ(cnpj: string): boolean;
}
/**
 * Email validation utility
 */
declare class EmailValidator {
    /**
     * Validates email format using regex
     */
    static isValid(email: string): boolean;
}
/**
 * Phone validation utility
 */
declare class PhoneValidator {
    /**
     * Validates Brazilian phone number format
     */
    static isValidBrazilian(phone: string): boolean;
}
/**
 * General payment validation utilities
 */
declare class PaymentValidator {
    /**
     * Validates payment amount
     */
    static isValidAmount(amount: number): boolean;
    /**
     * Validates currency code (ISO 4217)
     */
    static isValidCurrency(currency: string): boolean;
    /**
     * Validates installment count
     */
    static isValidInstallments(installments: number): boolean;
}
/**
 * Comprehensive validation function for payment data
 */
declare function validatePaymentData(data: any): TunaPaymentError[];
/**
 * Convenience functions for individual validations
 */
declare function validateCardNumber(cardNumber: string): boolean;
declare function validateCVV(cvv: string, cardNumber?: string): boolean;
declare function validateExpirationDate(expiry: string): boolean;
declare function validateCardholderName(name: string): boolean;
declare function validateEmail(email: string): boolean;
declare function validateCPF(cpf: string): boolean;
declare function validateCNPJ(cnpj: string): boolean;
/**
 * Validation result interface
 */
interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Validate card data for tokenization
 */
declare function validateCardData(cardData: any): ValidationResult;
/**
 * Validate customer information
 */
declare function validateCustomerInfo(customer: any): ValidationResult;

/**
 * Session management service for Tuna React Native SDK
 *
 * Handles session creation, validation, and renewal with Tuna's backend APIs
 */

declare class SessionManager {
    private session;
    private sessionTimeout;
    private config;
    private onSessionExpired?;
    constructor(config: TunaSessionConfig);
    /**
     * Creates a new session with Tuna's backend
     */
    createSession(credentials: SessionCredentials): Promise<TunaSession>;
    /**
     * Gets the current active session
     */
    getCurrentSession(): TunaSession | null;
    /**
     * Validates if the current session is active and valid
     */
    isSessionValid(): boolean;
    /**
     * Refreshes the current session
     */
    refreshSession(): Promise<TunaSession>;
    /**
     * Expires the current session
     */
    expireSession(): void;
    /**
     * Sets a callback for session expiration events
     */
    onSessionExpiredCallback(callback: () => void): void;
    /**
     * Updates session configuration
     */
    updateConfig(config: Partial<TunaSessionConfig>): void;
    /**
     * Schedules session expiry timer
     */
    private scheduleSessionExpiry;
    /**
     * Gets session headers for API requests
     */
    getSessionHeaders(): Record<string, string>;
    /**
     * Cleans up session manager resources
     */
    destroy(): void;
}

/**
 * Tokenization service for Tuna React Native SDK
 *
 * Handles credit card tokenization, saved card management, and PCI compliance
 */

declare class TokenizationManager {
    private sessionManager;
    private config;
    constructor(sessionManager: SessionManager, config: {
        baseUrl: string;
        timeout?: number;
    });
    /**
     * Generates a new token from card data
     */
    generateToken(request: TokenizationRequest): Promise<TokenizationResponse>;
    /**
     * Lists all saved tokens for a customer
     */
    listTokens(request: TokenListRequest): Promise<SavedToken[]>;
    /**
     * Binds a token to a customer for future use
     */
    bindToken(request: TokenBindRequest): Promise<boolean>;
    /**
     * Deletes a saved token
     */
    deleteToken(request: TokenDeleteRequest): Promise<boolean>;
    /**
     * Validates if a token is still valid and active
     */
    validateToken(token: string, customerId?: string): Promise<boolean>;
    /**
     * Gets a specific token details
     */
    getTokenDetails(token: string, customerId?: string): Promise<SavedToken | null>;
    /**
     * Sets a token as the default for a customer
     */
    setDefaultToken(token: string, customerId: string): Promise<boolean>;
    /**
     * Gets the default token for a customer
     */
    getDefaultToken(customerId: string): Promise<SavedToken | null>;
    /**
     * Masks a card number for display
     */
    private maskCardNumber;
    /**
     * Creates a tokenization request from card data
     */
    static createTokenizationRequest(cardNumber: string, cardholderName: string, expirationMonth: number, expirationYear: number, cvv: string, customerId?: string, brand?: string): TokenizationRequest;
}

/**
 * Payment processing service for Tuna React Native SDK
 *
 * Handles payment initialization, processing, and status monitoring
 */

declare class PaymentManager {
    private sessionManager;
    private tokenizationManager;
    private config;
    constructor(sessionManager: SessionManager, tokenizationManager: TokenizationManager, config: {
        baseUrl: string;
        timeout?: number;
        statusPollingInterval?: number;
        maxStatusPollingAttempts?: number;
    });
    /**
     * Initializes a payment transaction
     */
    initializePayment(request: PaymentRequest): Promise<PaymentResult>;
    /**
     * Processes payment with an existing token
     */
    private processTokenPayment;
    /**
     * Processes payment with new card data (tokenizes first)
     */
    private processNewCardPayment;
    /**
     * Processes native payment (Apple Pay / Google Pay)
     */
    private processNativePayment;
    /**
     * Gets payment status
     */
    getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
    /**
     * Polls payment status until completion or timeout
     */
    pollPaymentStatus(paymentId: string, onStatusUpdate?: (status: PaymentStatusResponse) => void): Promise<PaymentStatusResponse>;
    /**
     * Cancels a payment
     */
    cancelPayment(request: PaymentCancelRequest): Promise<boolean>;
    /**
     * Validates payment configuration
     */
    validatePaymentConfig(config: TunaPaymentConfig): boolean;
    /**
     * Gets supported payment methods for current session
     */
    getSupportedPaymentMethods(): Promise<PaymentMethodConfig[]>;
    /**
     * Parses payment response from API
     */
    private parsePaymentResponse;
    /**
     * Maps API status to PaymentStatus enum
     */
    private mapPaymentStatus;
    /**
     * Checks if payment status is final
     */
    private isPaymentFinal;
    /**
     * Utility function for delays
     */
    private delay;
    /**
     * Updates payment manager configuration
     */
    updateConfig(config: Partial<{
        baseUrl: string;
        timeout: number;
        statusPollingInterval: number;
        maxStatusPollingAttempts: number;
    }>): void;
}

/**
 * 3D Secure (3DS) Authentication Handler for Tuna React Native SDK
 *
 * This module handles 3D Secure authentication flows including:
 * - Data collection (always performed)
 * - Challenge authentication (only when required by payment response)
 */

interface ThreeDSConfig {
    dataCollectionTimeout?: number;
    challengeTimeout?: number;
    autoDataCollection?: boolean;
}
declare class ThreeDSHandler {
    private config;
    private webViewComponent;
    private dataCollectionCompleted;
    constructor(config?: ThreeDSConfig);
    /**
     * Sets the WebView component reference for 3DS authentication
     * This should be called when the WebView component is available
     */
    setWebViewComponent(webViewComponent: any): void;
    /**
     * Performs 3DS data collection
     * This should ALWAYS be called at the beginning of any payment flow
     * to ensure device fingerprinting data is collected
     */
    performDataCollection(setupPayerInfo: SetupPayerInfo): Promise<ThreeDSDataCollectionInfo>;
    /**
     * Handles 3DS challenge authentication
     * This should ONLY be called if the payment response contains threeDSInfo
     */
    handleChallenge(threeDSInfo: ThreeDSChallengeInfo): Promise<ThreeDSResult>;
    /**
     * Executes the data collection process
     */
    private executeDataCollection;
    /**
     * Executes the 3DS challenge process
     */
    private executeChallenge;
    /**
     * Performs data collection using WebView
     */
    private performWebViewDataCollection;
    /**
     * Performs challenge using WebView
     */
    private performWebViewChallenge;
    /**
     * Fallback data collection using hidden iframe approach
     */
    private performIframeDataCollection;
    /**
     * Generates HTML for data collection iframe
     */
    private generateDataCollectionHTML;
    /**
     * Generates HTML for 3DS challenge
     */
    private generateChallengeHTML;
    /**
     * Parses challenge details from paRequest if available
     */
    private parseChallengeDetails;
    /**
     * Gets challenge window size based on challengeWindowSize parameter
     */
    private getChallengeWindowSize;
    /**
     * Determines the best data collection method for the current environment
     */
    private getDataCollectionMethod;
    /**
     * Resets the handler state
     */
    reset(): void;
    /**
     * Gets the current status of 3DS processes
     */
    getStatus(): {
        dataCollectionCompleted: boolean;
        hasWebView: boolean;
        config: ThreeDSConfig;
    };
}
/**
 * Creates a new 3DS handler instance
 */
declare function createThreeDSHandler(config?: ThreeDSConfig): ThreeDSHandler;

/**
 * Anti-fraud Manager for Tuna React Native SDK
 *
 * This module handles anti-fraud provider initialization and device data collection
 * for fraud prevention systems including ClearSale, SiftScience, Konduto, and CyberSource.
 */

interface AntifraudManagerConfig {
    autoCollectDeviceData?: boolean;
    enabledProviders?: AntifraudProvider[];
    timeout?: number;
}
declare class AntifraudManager {
    private config;
    private providers;
    private deviceData;
    private sessionId;
    private customerId?;
    constructor(sessionId: string, config?: AntifraudManagerConfig);
    /**
     * Initializes anti-fraud providers with their configurations
     */
    initializeProviders(antifraudConfigs: AntifraudConfig[]): Promise<void>;
    /**
     * Sets the customer ID for anti-fraud tracking
     */
    setCustomerId(customerId: string): void;
    /**
     * Collects comprehensive device data for anti-fraud analysis
     */
    collectDeviceData(): Promise<DeviceData>;
    /**
     * Initializes a specific anti-fraud provider
     */
    private initializeProvider;
    /**
     * Initializes ClearSale anti-fraud
     */
    private initializeClearSale;
    /**
     * Initializes SiftScience anti-fraud
     */
    private initializeSiftScience;
    /**
     * Initializes Konduto anti-fraud
     */
    private initializeKonduto;
    /**
     * Initializes CyberSource anti-fraud
     */
    private initializeCyberSource;
    /**
     * Gets the provider type from configuration key
     */
    private getProviderFromKey;
    /**
     * Extracts org ID from CyberSource configuration
     */
    private extractOrgId;
    /**
     * Gets device IP address (simplified for React Native)
     */
    private getIpAddress;
    /**
     * Gets screen resolution information
     */
    private getScreenResolution;
    /**
     * Gets device timezone
     */
    private getTimezone;
    /**
     * Generates a fallback device ID when DeviceInfo is not available
     */
    private generateFallbackDeviceId;
    /**
     * Generates a fallback user agent when DeviceInfo is not available
     */
    private generateFallbackUserAgent;
    /**
     * Gets anti-fraud results for payment processing
     */
    getAntifraudResults(): AntifraudResult[];
    /**
     * Generates device fingerprint for a specific provider
     */
    private generateFingerprint;
    /**
     * Gets the current device data
     */
    getDeviceData(): DeviceData | null;
    /**
     * Gets initialized providers
     */
    getInitializedProviders(): AntifraudProvider[];
    /**
     * Checks if a specific provider is initialized
     */
    isProviderInitialized(provider: AntifraudProvider): boolean;
    /**
     * Gets debug information about anti-fraud state
     */
    getDebugInfo(): Record<string, any>;
    /**
     * Resets anti-fraud state
     */
    reset(): void;
}
/**
 * Creates a new anti-fraud manager instance
 */
declare function createAntifraudManager(sessionId: string, config?: AntifraudManagerConfig): AntifraudManager;

/**
 * Status Poller for Tuna React Native SDK
 *
 * This module handles long polling for payment status updates,
 * providing real-time payment status tracking.
 */

interface StatusPollerConfig {
    maxRetries?: number;
    retryInterval?: number;
    timeout?: number;
    backoffMultiplier?: number;
    maxBackoffInterval?: number;
}
interface PollingSession {
    id: string;
    methodId: string;
    paymentKey: string;
    startTime: Date;
    lastUpdate: Date;
    retryCount: number;
    status: PaymentStatus;
    isActive: boolean;
}
declare class StatusPoller {
    private config;
    private sessions;
    private intervals;
    private baseUrl;
    private sessionId;
    constructor(baseUrl: string, sessionId: string, config?: StatusPollerConfig);
    /**
     * Starts polling for payment status
     */
    startPolling(methodId: string, paymentKey: string, callback: StatusCallback, config?: StatusPollingConfig): Promise<string>;
    /**
     * Stops polling for a specific session
     */
    stopPolling(sessionId: string): void;
    /**
     * Stops all active polling sessions
     */
    stopAllPolling(): void;
    /**
     * Gets the current status of a polling session
     */
    getPollingStatus(sessionId: string): PollingSession | null;
    /**
     * Gets all active polling sessions
     */
    getActiveSessions(): PollingSession[];
    /**
     * Performs a single status check
     */
    checkStatus(methodId: string, paymentKey: string): Promise<PaymentStatusResponse>;
    /**
     * Schedules the next polling attempt with exponential backoff
     */
    private scheduleNextPoll;
    /**
     * Performs a single polling attempt
     */
    private performPoll;
    /**
     * Handles polling errors
     */
    private handlePollingError;
    /**
     * Handles timeout scenarios
     */
    private handleTimeout;
    /**
     * Handles max retries exceeded
     */
    private handleMaxRetriesExceeded;
    /**
     * Handles completed payment
     */
    private handleCompletedPayment;
    /**
     * Checks if a status is terminal (no more polling needed)
     */
    private isTerminalStatus;
    /**
     * Parses the status response from the API
     */
    private parseStatusResponse;
    /**
     * Generates a unique session ID
     */
    private generateSessionId;
    /**
     * Gets debug information
     */
    getDebugInfo(): Record<string, any>;
    /**
     * Cleanup method to stop all polling and clear resources
     */
    destroy(): void;
}
/**
 * Creates a new status poller instance
 */
declare function createStatusPoller(baseUrl: string, sessionId: string, config?: StatusPollerConfig): StatusPoller;

/**
 * Base adapter for React Native Payments integration with Tuna
 *
 * This adapter bridges @rnw-community/react-native-payments with Tuna's payment infrastructure
 */

declare class ReactNativePaymentsAdapter {
    private sessionManager;
    private tokenizationManager;
    private paymentManager;
    private config;
    private supportedMethods;
    constructor(sessionManager: SessionManager, tokenizationManager: TokenizationManager, paymentManager: PaymentManager, config: TunaPaymentConfig);
    /**
     * Initializes the adapter and checks for native payment capabilities
     */
    initialize(): Promise<void>;
    /**
     * Checks what native payment capabilities are available
     */
    private checkNativePaymentCapabilities;
    /**
     * Converts Tuna payment configuration to React Native Payments format
     */
    createPaymentRequest(paymentDetails: PaymentDetails, methodConfig: PaymentMethodConfig): PaymentRequest$1;
    /**
     * Processes a native payment response and converts it to Tuna payment
     */
    processNativePaymentResponse(paymentResponse: any, originalDetails: PaymentDetails): Promise<PaymentResult>;
    /**
     * Processes Apple Pay payment response
     */
    private processApplePayResponse;
    /**
     * Processes Google Pay payment response
     */
    private processGooglePayResponse;
    /**
     * Shows the native payment sheet
     */
    showPaymentSheet(paymentDetails: PaymentDetails, methodConfig: PaymentMethodConfig): Promise<PaymentResult>;
    /**
     * Checks if the specified payment method is supported
     */
    isPaymentMethodSupported(method: string): boolean;
    /**
     * Gets all supported payment methods
     */
    getSupportedPaymentMethods(): string[];
    /**
     * Validates payment method configuration
     */
    validatePaymentMethodConfig(methodConfig: PaymentMethodConfig): boolean;
    /**
     * Updates the adapter configuration
     */
    updateConfig(config: Partial<TunaPaymentConfig>): void;
    /**
     * Cleans up adapter resources
     */
    destroy(): void;
}

/**
 * Apple Pay adapter for Tuna React Native SDK
 *
 * Provides Apple Pay integration using @rnw-community/react-native-payments
 */

declare class ApplePayAdapter {
    private baseAdapter;
    private config?;
    constructor(baseAdapter: ReactNativePaymentsAdapter);
    /**
     * Checks if Apple Pay is available on the device
     */
    canMakePayments(): Promise<boolean>;
    /**
     * Initializes Apple Pay with the provided configuration
     */
    setup(config: ApplePayConfig): Promise<void>;
    /**
     * Shows the Apple Pay payment sheet
     */
    showPaymentSheet(paymentDetails: PaymentDetails): Promise<ApplePayResult>;
    /**
     * Validates Apple Pay configuration
     */
    private validateApplePayConfig;
    /**
     * Gets the current Apple Pay configuration
     */
    getConfig(): ApplePayConfig | undefined;
    /**
     * Checks if Apple Pay is properly configured
     */
    isConfigured(): boolean;
    /**
     * Resets the Apple Pay configuration
     */
    reset(): void;
    /**
     * Gets Apple Pay capabilities for the current configuration
     */
    getCapabilities(): Promise<{
        canMakePayments: boolean;
        supportedNetworks: string[];
        merchantIdentifier?: string;
    }>;
    /**
     * Creates a formatted Apple Pay configuration for debugging
     */
    getDebugInfo(): Record<string, any>;
}
/**
 * Creates a new Apple Pay adapter instance
 */
declare function createApplePayAdapter(baseAdapter: ReactNativePaymentsAdapter): ApplePayAdapter;

/**
 * Google Pay adapter for Tuna React Native SDK
 *
 * Provides Google Pay integration using @rnw-community/react-native-payments
 */

declare class GooglePayAdapter {
    private baseAdapter;
    private config?;
    constructor(baseAdapter: ReactNativePaymentsAdapter);
    /**
     * Checks if Google Pay is available on the device
     */
    canMakePayments(): Promise<boolean>;
    /**
     * Initializes Google Pay with the provided configuration
     */
    setup(config: GooglePayConfig): Promise<void>;
    /**
     * Shows the Google Pay payment sheet
     */
    showPaymentSheet(paymentDetails: PaymentDetails): Promise<GooglePayResult>;
    /**
     * Validates Google Pay configuration
     */
    private validateGooglePayConfig;
    /**
     * Gets the current Google Pay configuration
     */
    getConfig(): GooglePayConfig | undefined;
    /**
     * Checks if Google Pay is properly configured
     */
    isConfigured(): boolean;
    /**
     * Resets the Google Pay configuration
     */
    reset(): void;
    /**
     * Gets Google Pay capabilities for the current configuration
     */
    getCapabilities(): Promise<{
        canMakePayments: boolean;
        allowedCardNetworks: string[];
        environment?: string;
    }>;
    /**
     * Creates a formatted Google Pay configuration for debugging
     */
    getDebugInfo(): Record<string, any>;
}
/**
 * Creates a new Google Pay adapter instance
 */
declare function createGooglePayAdapter(baseAdapter: ReactNativePaymentsAdapter): GooglePayAdapter;

/**
 * Main TunaReactNative SDK Class (Simplified Implementation)
 *
 * This is a simplified implementation of the main SDK class that works with
 * the existing core components. It provides the basic unified interface
 * while adapting to the current implementation constraints.
 */

/**
 * Main TunaReactNative SDK Configuration
 */
interface TunaReactNativeConfig {
    /** Environment to use for payments */
    environment: Environment;
    /** Session timeout in milliseconds (default: 30 minutes) */
    sessionTimeout?: number;
    /** Base URL override (optional, auto-determined from environment) */
    baseUrl?: string;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Main TunaReactNative SDK Class
 *
 * This class provides a unified interface for payment operations.
 * It's designed to be simple and extensible for Phase 5.
 */
declare class TunaReactNative {
    private config;
    private isInitialized;
    private currentSessionId?;
    constructor(config: TunaReactNativeConfig);
    /**
     * Initialize the SDK with a session
     */
    initialize(sessionId: string): Promise<void>;
    /**
     * Check if the SDK is initialized
     */
    isReady(): boolean;
    /**
     * Check if Apple Pay is available on this device
     */
    canMakeApplePayPayments(): Promise<boolean>;
    /**
     * Setup Apple Pay configuration
     */
    setupApplePay(config: ApplePayConfig): Promise<void>;
    /**
     * Show Apple Pay payment sheet
     */
    showApplePaySheet(paymentDetails: PaymentDetails): Promise<ApplePayResult>;
    /**
     * Check if Google Pay is ready to pay
     */
    isGooglePayReady(): Promise<boolean>;
    /**
     * Setup Google Pay configuration
     */
    setupGooglePay(config: GooglePayConfig): Promise<void>;
    /**
     * Request Google Pay payment
     */
    requestGooglePayment(paymentDetails: PaymentDetails): Promise<GooglePayResult>;
    /**
     * Initiate PIX payment
     */
    initiatePIXPayment(amount: number, customer: CustomerInfo): Promise<PIXResult>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Get current session ID
     */
    getSessionId(): string | undefined;
    /**
     * Get current environment
     */
    getEnvironment(): Environment;
    private ensureInitialized;
}
/**
 * Create a new TunaReactNative instance
 */
declare function createTunaReactNative(config: TunaReactNativeConfig): TunaReactNative;

/**
 * React Hooks for Tuna React Native SDK
 *
 * This file provides React hooks for integrating Tuna payment functionality
 * into React Native applications using @rnw-community/react-native-payments
 */

interface TunaPaymentState {
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
}
interface ApplePayState {
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
}
interface GooglePayState {
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
}
interface PIXPaymentState {
    isLoading: boolean;
    qrCode: string | null;
    qrCodeImage: string | null;
    expirationTime: Date | null;
    paymentKey: string | null;
    error: Error | null;
}
/**
 * Main Tuna Payments Hook
 *
 * This is the primary hook for integrating Tuna payments into your React Native app.
 * It provides automatic initialization, state management, and platform-specific methods.
 */
declare function useTunaPayments(config?: TunaReactNativeConfig): {
    initialize: (initConfig?: TunaReactNativeConfig) => Promise<void>;
    processPayment: (paymentDetails: PaymentDetails) => Promise<PaymentResult | null>;
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
    tunaSDK: TunaReactNative | null;
};
/**
 * Apple Pay Hook
 *
 * Hook for Apple Pay integration using native payment capabilities
 */
declare function useApplePay(tunaSDK: TunaReactNative | null): {
    setupApplePay: (config: ApplePayConfig) => Promise<boolean>;
    showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<ApplePayResult | null>;
    checkAvailability: () => Promise<void>;
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Google Pay Hook
 *
 * Hook for Google Pay integration using native payment capabilities
 */
declare function useGooglePay(tunaSDK: TunaReactNative | null): {
    setupGooglePay: (config: GooglePayConfig) => Promise<boolean>;
    showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<GooglePayResult | null>;
    checkAvailability: () => Promise<void>;
    isAvailable: boolean;
    isConfigured: boolean;
    isLoading: boolean;
    error: Error | null;
};
/**
 * PIX Payments Hook
 *
 * Hook for PIX payment integration
 */
declare function usePIXPayments(tunaSDK: TunaReactNative | null): {
    generatePIXPayment: (amount: number, customer: CustomerInfo) => Promise<PIXResult | null>;
    clearPIXPayment: () => void;
    isLoading: boolean;
    qrCode: string | null;
    qrCodeImage: string | null;
    expirationTime: Date | null;
    paymentKey: string | null;
    error: Error | null;
};
/**
 * Complete Tuna integration with all features
 */
declare function useTunaComplete(config: TunaReactNativeConfig): {
    applePay: {
        setupApplePay: (config: ApplePayConfig) => Promise<boolean>;
        showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<ApplePayResult | null>;
        checkAvailability: () => Promise<void>;
        isAvailable: boolean;
        isConfigured: boolean;
        isLoading: boolean;
        error: Error | null;
    };
    googlePay: {
        setupGooglePay: (config: GooglePayConfig) => Promise<boolean>;
        showPaymentSheet: (paymentDetails: PaymentDetails) => Promise<GooglePayResult | null>;
        checkAvailability: () => Promise<void>;
        isAvailable: boolean;
        isConfigured: boolean;
        isLoading: boolean;
        error: Error | null;
    };
    pixPayments: {
        generatePIXPayment: (amount: number, customer: CustomerInfo) => Promise<PIXResult | null>;
        clearPIXPayment: () => void;
        isLoading: boolean;
        qrCode: string | null;
        qrCodeImage: string | null;
        expirationTime: Date | null;
        paymentKey: string | null;
        error: Error | null;
    };
    initialize: (initConfig?: TunaReactNativeConfig) => Promise<void>;
    processPayment: (paymentDetails: PaymentDetails) => Promise<PaymentResult | null>;
    isInitialized: boolean;
    isLoading: boolean;
    error: Error | null;
    tunaSDK: TunaReactNative | null;
};

export { AntifraudConfig, AntifraudManager, AntifraudProvider, AntifraudResult, ApplePayAdapter, ApplePayConfig, ApplePayResult, ApplePayState, ApplePaySupportedNetwork, BindResponse, BindResult, BindTokenRequest, BoletoResult, BrazilianDocumentValidator, CardData, CardTokenizationData, CardValidator, CreateSessionRequest, CreditCardConfig, CustomerInfo, DeleteResponse, DeleteResult, DeleteTokenRequest, DeviceData, EmailValidator, Environment, GenerateTokenRequest, GooglePayAdapter, GooglePayAuthMethod, GooglePayConfig, GooglePayResult, GooglePayState, GooglePaySupportedNetwork, InstallmentOption, ListTokensRequest, PIXPaymentState, PIXResult, PaymentCancelRequest, PaymentData, PaymentDetails, PaymentDisplayItem, PaymentManager, PaymentMethodConfig, PaymentMethodData, PaymentRequest, PaymentResult, PaymentShippingOption, PaymentStatus, PaymentStatusResponse, PaymentValidator, PhoneValidator, PixConfig, ReactNativePaymentsAdapter, SavedCard, SavedToken, SessionConfig, SessionCredentials, SessionManager, SessionResponse, SetupPayerInfo, StatusCallback, StatusCallbackData, StatusPoller, StatusPollingConfig, StatusResult, ThreeDSChallengeInfo, ThreeDSData, ThreeDSDataCollectionInfo, ThreeDSHandler, ThreeDSResult, TokenBindRequest, TokenData, TokenDeleteRequest, TokenListRequest, TokenListResponse, TokenResponse, TokenResult, TokenizationManager, TokenizationRequest, TokenizationResponse, Tuna3DSError, TunaError, TunaErrorCode, TunaErrorCodes, TunaNativePaymentError, TunaNetworkError, TunaPaymentConfig, TunaPaymentError, TunaPaymentState, TunaReactNative, TunaReactNativeConfig, TunaSession, TunaSessionConfig, TunaSessionError, TunaTokenizationError, TunaValidationError, ValidateSessionRequest, ValidationResponse, ValidationResult, capitalizeWords, cleanString, createAntifraudManager, createApplePayAdapter, createGooglePayAdapter, createStatusPoller, createThreeDSHandler, createTimeoutPromise, createTunaError, createTunaReactNative, TunaReactNative as default, formatCNPJ, formatCPF, formatCardExpiration, formatCreditCardDisplay, formatCurrency, formatExpirationDate, formatPhone, getUserFriendlyErrorMessage, handleApiResponse, handleError, handleHttpError, isTunaError, logError, maskCreditCard, retryWithBackoff, safeJsonParse, truncateText, useApplePay, useGooglePay, usePIXPayments, useTunaComplete, useTunaPayments, validateCNPJ, validateCPF, validateCVV, validateCardData, validateCardNumber, validateCardholderName, validateCustomerInfo, validateEmail, validateExpirationDate, validatePaymentData, withTimeout };
