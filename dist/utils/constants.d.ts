/**
 * Constants for Tuna React Native SDK
 */
/**
 * API endpoints for Tuna services
 */
export declare const TUNA_API_ENDPOINTS: {
    readonly NEW_SESSION: "/api/Token/NewSession";
    readonly GENERATE_TOKEN: "/api/Token/Generate";
    readonly LIST_TOKENS: "/api/Token/List";
    readonly BIND_TOKEN: "/api/Token/Bind";
    readonly DELETE_TOKEN: "/api/Token/Delete";
    readonly INIT_PAYMENT: "/api/Payment/Init";
    readonly PAYMENT_STATUS: "/api/Payment/Status";
    readonly PAYMENT_CANCEL: "/api/Payment/Cancel";
    readonly THREEDS_AUTHENTICATE: "/api/3DS/Authenticate";
    readonly THREEDS_CALLBACK: "/api/3DS/Callback";
    readonly ANTIFRAUD_VALIDATE: "/api/AntifraudValidate";
};
export declare const ENDPOINTS: {
    readonly NEW_SESSION: "/api/Token/NewSession";
    readonly GENERATE_TOKEN: "/api/Token/Generate";
    readonly LIST_TOKENS: "/api/Token/List";
    readonly BIND_TOKEN: "/api/Token/Bind";
    readonly DELETE_TOKEN: "/api/Token/Delete";
    readonly INIT_PAYMENT: "/api/Payment/Init";
    readonly PAYMENT_STATUS: "/api/Payment/Status";
    readonly PAYMENT_CANCEL: "/api/Payment/Cancel";
    readonly THREEDS_AUTHENTICATE: "/api/3DS/Authenticate";
    readonly THREEDS_CALLBACK: "/api/3DS/Callback";
    readonly ANTIFRAUD_VALIDATE: "/api/AntifraudValidate";
};
/**
 * Default configuration values
 */
export declare const DEFAULT_CONFIG: {
    readonly SESSION_TIMEOUT: 30;
    readonly PAYMENT_TIMEOUT: 120;
    readonly MAX_RETRIES: 3;
    readonly REQUEST_TIMEOUT: 30000;
    readonly DEFAULT_CURRENCY: "BRL";
    readonly DEFAULT_ENVIRONMENT: "sandbox";
};
/**
 * Supported payment methods
 */
export declare const PAYMENT_METHODS: {
    readonly CREDIT_CARD: "credit_card";
    readonly DEBIT_CARD: "debit_card";
    readonly PIX: "pix";
    readonly BOLETO: "boleto";
    readonly APPLE_PAY: "apple_pay";
    readonly GOOGLE_PAY: "google_pay";
    readonly SAVED_CARD: "saved_card";
};
/**
 * Supported card brands
 */
export declare const CARD_BRANDS: {
    readonly VISA: "visa";
    readonly MASTERCARD: "mastercard";
    readonly AMEX: "amex";
    readonly DINERS: "diners";
    readonly DISCOVER: "discover";
    readonly JCB: "jcb";
    readonly ELO: "elo";
    readonly HIPERCARD: "hipercard";
};
/**
 * Environment configurations
 */
export declare const ENVIRONMENTS: {
    readonly SANDBOX: "sandbox";
    readonly PRODUCTION: "production";
};
/**
 * Event types for payment flow
 */
export declare const PAYMENT_EVENTS: {
    readonly SESSION_CREATED: "session_created";
    readonly SESSION_EXPIRED: "session_expired";
    readonly TOKEN_GENERATED: "token_generated";
    readonly TOKEN_FAILED: "token_failed";
    readonly PAYMENT_STARTED: "payment_started";
    readonly PAYMENT_SUCCESS: "payment_success";
    readonly PAYMENT_FAILED: "payment_failed";
    readonly PAYMENT_CANCELLED: "payment_cancelled";
    readonly THREEDS_STARTED: "threeds_started";
    readonly THREEDS_SUCCESS: "threeds_success";
    readonly THREEDS_FAILED: "threeds_failed";
    readonly NATIVE_PAYMENT_AVAILABLE: "native_payment_available";
    readonly NATIVE_PAYMENT_UNAVAILABLE: "native_payment_unavailable";
};
/**
 * HTTP status codes
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
};
/**
 * Anti-fraud script configurations
 */
export declare const ANTIFRAUD_CONFIG: {
    readonly SCRIPT_TIMEOUT: 10000;
    readonly SESSION_ID_LENGTH: 32;
    readonly SANDBOX_SCRIPT_URL: "https://h.online-metrix.net/fp/tags.js";
    readonly PRODUCTION_SCRIPT_URL: "https://h.online-metrix.net/fp/tags.js";
};
/**
 * Validation rules
 */
export declare const VALIDATION_RULES: {
    readonly MIN_CARD_LENGTH: 13;
    readonly MAX_CARD_LENGTH: 19;
    readonly CVV_LENGTH_DEFAULT: 3;
    readonly CVV_LENGTH_AMEX: 4;
    readonly CPF_LENGTH: 11;
    readonly CNPJ_LENGTH: 14;
    readonly MIN_NAME_LENGTH: 2;
    readonly MAX_NAME_LENGTH: 100;
    readonly MIN_AMOUNT: 0.01;
    readonly MAX_AMOUNT: 999999.99;
    readonly MIN_INSTALLMENTS: 1;
    readonly MAX_INSTALLMENTS: 12;
};
/**
 * Type exports for constants
 */
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
export type CardBrand = typeof CARD_BRANDS[keyof typeof CARD_BRANDS];
export type TunaEnvironment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];
export type PaymentEvent = typeof PAYMENT_EVENTS[keyof typeof PAYMENT_EVENTS];
//# sourceMappingURL=constants.d.ts.map