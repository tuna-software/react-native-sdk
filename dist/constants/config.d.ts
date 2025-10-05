/**
 * Configuration constants for Tuna React Native
 */
export declare const PAYMENT_METHOD_TYPES: {
    readonly CREDIT_CARD: "1";
    readonly DEBIT_CARD: "2";
    readonly BANK_INVOICE: "3";
    readonly PIX: "D";
    readonly CRYPTO: "E";
};
export declare const CARD_BRANDS: {
    readonly VISA: "Visa";
    readonly MASTERCARD: "Mastercard";
    readonly AMEX: "American Express";
    readonly ELO: "Elo";
    readonly HIPERCARD: "Hipercard";
    readonly DISCOVER: "Discover";
};
export declare const APPLE_PAY_NETWORKS: {
    readonly VISA: "visa";
    readonly MASTERCARD: "mastercard";
    readonly AMEX: "amex";
    readonly DISCOVER: "discover";
    readonly ELO: "elo";
    readonly HIPERCARD: "hipercard";
};
export declare const GOOGLE_PAY_NETWORKS: {
    readonly VISA: "VISA";
    readonly MASTERCARD: "MASTERCARD";
    readonly AMEX: "AMEX";
    readonly DISCOVER: "DISCOVER";
};
export declare const PAYMENT_STATUS: {
    readonly SUCCESS: readonly ["2", "8"];
    readonly FAILED: readonly ["4", "5", "A", "N"];
    readonly PENDING: readonly ["1", "3", "6", "7", "9"];
};
export declare const API_RESPONSE_CODES: {
    readonly SUCCESS: 1;
    readonly SESSION_EXPIRED: -1;
    readonly INVALID_CARD: -2;
    readonly INSUFFICIENT_FUNDS: -3;
    readonly CARD_DECLINED: -4;
    readonly PROCESSING_ERROR: -5;
};
export declare const DEFAULT_CONFIG: {
    readonly REQUEST_TIMEOUT: 30000;
    readonly STATUS_POLL_INTERVAL: 2000;
    readonly MAX_STATUS_POLL_ATTEMPTS: 30;
    readonly CARD_NUMBER_MAX_LENGTH: 19;
    readonly CVV_MAX_LENGTH: 4;
    readonly CARDHOLDER_NAME_MAX_LENGTH: 100;
};
export declare const ANTIFRAUD_PROVIDERS: {
    readonly CLEARSALE: "clearsale";
    readonly SIFTSCIENCE: "siftscience";
    readonly KONDUTO: "konduto";
    readonly CYBERSOURCE: "cybersource";
};
export declare const THREE_DS_WINDOW_SIZES: {
    readonly SIZE_01: {
        readonly width: 250;
        readonly height: 400;
    };
    readonly SIZE_02: {
        readonly width: 390;
        readonly height: 400;
    };
    readonly SIZE_03: {
        readonly width: 500;
        readonly height: 600;
    };
    readonly SIZE_04: {
        readonly width: 600;
        readonly height: 400;
    };
    readonly SIZE_05: {
        readonly width: "100%";
        readonly height: "100%";
    };
};
export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];
export type CardBrand = typeof CARD_BRANDS[keyof typeof CARD_BRANDS];
export type ApplePayNetwork = typeof APPLE_PAY_NETWORKS[keyof typeof APPLE_PAY_NETWORKS];
export type GooglePayNetwork = typeof GOOGLE_PAY_NETWORKS[keyof typeof GOOGLE_PAY_NETWORKS];
export type AntifraudProvider = typeof ANTIFRAUD_PROVIDERS[keyof typeof ANTIFRAUD_PROVIDERS];
//# sourceMappingURL=config.d.ts.map