/**
 * API endpoints configuration for Tuna React Native
 */
import { Environment } from '../types/payment';
export declare const API_ENDPOINTS: {
    readonly production: {
        readonly TOKEN_API_URL: "https://token.tunagateway.com/api/Token";
        readonly INTEGRATIONS_API_URL: "https://token.tunagateway.com/api/integrations/plugin";
        readonly PAYMENT_API_URL: "https://engine.tunagateway.com/api/Payment";
        readonly GOOGLE_PAY_ENV: "PRODUCTION";
        readonly GOOGLE_PAY_GATEWAY: "tuna";
        readonly CYBERSOURCE_ORG_ID: "k8vif92e";
    };
    readonly sandbox: {
        readonly TOKEN_API_URL: "https://token.tuna-demo.uy/api/Token";
        readonly INTEGRATIONS_API_URL: "https://token.tuna-demo.uy/api/integrations/plugin";
        readonly PAYMENT_API_URL: "https://sandbox.tuna-demo.uy/api/Payment";
        readonly GOOGLE_PAY_ENV: "TEST";
        readonly GOOGLE_PAY_GATEWAY: "tuna";
        readonly CYBERSOURCE_ORG_ID: "1snn5n9w";
    };
};
export declare function getApiConfig(environment: Environment): {
    readonly TOKEN_API_URL: "https://token.tunagateway.com/api/Token";
    readonly INTEGRATIONS_API_URL: "https://token.tunagateway.com/api/integrations/plugin";
    readonly PAYMENT_API_URL: "https://engine.tunagateway.com/api/Payment";
    readonly GOOGLE_PAY_ENV: "PRODUCTION";
    readonly GOOGLE_PAY_GATEWAY: "tuna";
    readonly CYBERSOURCE_ORG_ID: "k8vif92e";
} | {
    readonly TOKEN_API_URL: "https://token.tuna-demo.uy/api/Token";
    readonly INTEGRATIONS_API_URL: "https://token.tuna-demo.uy/api/integrations/plugin";
    readonly PAYMENT_API_URL: "https://sandbox.tuna-demo.uy/api/Payment";
    readonly GOOGLE_PAY_ENV: "TEST";
    readonly GOOGLE_PAY_GATEWAY: "tuna";
    readonly CYBERSOURCE_ORG_ID: "1snn5n9w";
};
export declare const TOKEN_ENDPOINTS: {
    readonly NEW_SESSION: "/NewSession";
    readonly GENERATE: "/Generate";
    readonly LIST: "/List";
    readonly BIND: "/Bind";
    readonly DELETE: "/Delete";
    readonly VALIDATE: "/Validate";
};
export declare const PAYMENT_ENDPOINTS: {
    readonly INIT: "/Init";
    readonly STATUS_POLL: "/StatusPoll";
    readonly CAPTURE: "/Capture";
    readonly CANCEL: "/Cancel";
};
export declare const INTEGRATION_ENDPOINTS: {
    readonly STATUS_POLL: "/StatusPoll";
};
//# sourceMappingURL=endpoints.d.ts.map