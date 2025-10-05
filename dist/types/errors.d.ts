/**
 * Error types and handling for Tuna React Native
 */
export declare class TunaError extends Error {
    code: string;
    originalError?: any;
    constructor(message: string, code?: string, originalError?: any);
}
export declare class TunaNetworkError extends TunaError {
    constructor(message: string, originalError?: any);
}
export declare class TunaValidationError extends TunaError {
    constructor(message: string, field?: string);
}
export declare class TunaSessionError extends TunaError {
    constructor(message: string);
}
export declare class TunaTokenizationError extends TunaError {
    constructor(message: string, originalError?: any);
}
export declare class TunaPaymentError extends TunaError {
    constructor(message: string, originalError?: any);
}
export declare class TunaNativePaymentError extends TunaError {
    constructor(message: string, originalError?: any);
}
export declare class Tuna3DSError extends TunaError {
    constructor(message: string, originalError?: any);
}
export declare const TunaErrorCodes: {
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
export type TunaErrorCode = keyof typeof TunaErrorCodes;
/**
 * Creates a TunaError from an error code
 */
export declare function createTunaError(code: TunaErrorCode, originalError?: any): TunaError;
/**
 * Type guard to check if an error is a TunaError
 */
export declare function isTunaError(error: any): error is TunaError;
/**
 * Handles and converts various error types to TunaError
 */
export declare function handleError(error: any, defaultCode?: TunaErrorCode): TunaError;
//# sourceMappingURL=errors.d.ts.map