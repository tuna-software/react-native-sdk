/**
 * Session management types for Tuna React Native
 */

import { CustomerInfo, Environment } from './payment';

export interface SessionResponse {
  sessionId: string;
  code: number | string;
  message?: string;
}

export interface ValidationResponse {
  partnerUniqueId?: string;
  partnerId?: number;
  accountIsolation?: boolean;
  code: number | string;
  message?: string;
}

export interface SessionConfig {
  sessionId: string;
  environment: Environment;
  customer?: CustomerInfo;
}

export interface CreateSessionRequest {
  customer?: CustomerInfo;
}

export interface ValidateSessionRequest {
  sessionId: string;
}

/**
 * Configuration for Tuna session management
 */
export interface TunaSessionConfig {
  baseUrl: string;
  environment: Environment;
  sessionTimeout?: number; // in minutes
  headers?: Record<string, string>;
}

/**
 * Credentials required to create a session
 */
export interface SessionCredentials {
  appToken: string;
  account: string;
  customerId?: string;
  sessionId?: string;
}

/**
 * Active session data
 */
export interface TunaSession {
  sessionId: string;
  account: string;
  customerId?: string;
  environment: Environment;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}