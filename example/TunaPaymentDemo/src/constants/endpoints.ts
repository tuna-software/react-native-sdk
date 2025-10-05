/**
 * API endpoints configuration for Tuna React Native
 */

import { Environment } from '../types/payment';

export const API_ENDPOINTS = {
  production: {
    TOKEN_API_URL: 'https://token.tunagateway.com/api/Token',
    INTEGRATIONS_API_URL: 'https://token.tunagateway.com/api/integrations/plugin',
    PAYMENT_API_URL: 'https://engine.tunagateway.com/api/Payment',
    GOOGLE_PAY_ENV: 'PRODUCTION' as const,
    GOOGLE_PAY_GATEWAY: 'tuna',
    CYBERSOURCE_ORG_ID: 'k8vif92e',
  },
  sandbox: {
    TOKEN_API_URL: 'https://token.tuna-demo.uy/api/Token',
    INTEGRATIONS_API_URL: 'https://token.tuna-demo.uy/api/integrations/plugin',
    PAYMENT_API_URL: 'https://sandbox.tuna-demo.uy/api/Payment',
    GOOGLE_PAY_ENV: 'TEST' as const,
    GOOGLE_PAY_GATEWAY: 'tuna',
    CYBERSOURCE_ORG_ID: '1snn5n9w',
  },
} as const;

export function getApiConfig(environment: Environment) {
  return API_ENDPOINTS[environment];
}

// Token API endpoints
export const TOKEN_ENDPOINTS = {
  NEW_SESSION: '/NewSession',
  GENERATE: '/Generate',
  LIST: '/List',
  BIND: '/Bind',
  DELETE: '/Delete',
  VALIDATE: '/Validate',
} as const;

// Payment API endpoints
export const PAYMENT_ENDPOINTS = {
  INIT: '/Init',
  STATUS_POLL: '/StatusPoll',
  CAPTURE: '/Capture',
  CANCEL: '/Cancel',
} as const;

// Integration API endpoints
export const INTEGRATION_ENDPOINTS = {
  STATUS_POLL: '/StatusPoll',
} as const;