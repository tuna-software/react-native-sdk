/**
 * Session management service for Tuna React Native SDK
 * 
 * Handles session creation, validation, and renewal with Tuna's backend APIs
 */

import { TunaSessionConfig, TunaSession, SessionCredentials } from '../types/session';
import { TunaSessionError, TunaNetworkError } from '../utils/errors';
import { TUNA_API_ENDPOINTS, DEFAULT_CONFIG } from '../utils/constants';
import { handleHttpError } from '../utils/errors';

export class SessionManager {
  private session: TunaSession | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;
  private config: TunaSessionConfig;
  private onSessionExpired?: () => void;

  constructor(config: TunaSessionConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Creates a new session with Tuna's backend
   */
  async createSession(credentials: SessionCredentials): Promise<TunaSession> {
    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.NEW_SESSION}`;
      
      const requestBody = {
        AppToken: credentials.appToken,
        Account: credentials.account,
        IsSandbox: this.config.environment === 'sandbox',
        ...(credentials.customerId && { CustomerId: credentials.customerId }),
        ...(credentials.sessionId && { SessionId: credentials.sessionId }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const sessionData = await response.json();
      
      if (!sessionData.SessionId) {
        throw new TunaSessionError('Invalid session response from server');
      }

      this.session = {
        sessionId: sessionData.SessionId,
        account: credentials.account,
        customerId: credentials.customerId,
        environment: this.config.environment,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ((this.config.sessionTimeout || DEFAULT_CONFIG.SESSION_TIMEOUT) * 60 * 1000)),
        isActive: true,
      };

      // Set up session expiration timer
      this.scheduleSessionExpiry();

      return this.session;
    } catch (error) {
      if (error instanceof TunaSessionError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaSessionError('Failed to create session');
    }
  }

  /**
   * Gets the current active session
   */
  getCurrentSession(): TunaSession | null {
    if (!this.session || !this.session.isActive) {
      return null;
    }

    // Check if session is expired
    if (this.session.expiresAt < new Date()) {
      this.expireSession();
      return null;
    }

    return this.session;
  }

  /**
   * Validates if the current session is active and valid
   */
  isSessionValid(): boolean {
    const session = this.getCurrentSession();
    return session !== null && session.isActive;
  }

  /**
   * Refreshes the current session
   */
  async refreshSession(): Promise<TunaSession> {
    if (!this.session) {
      throw new TunaSessionError('No active session to refresh');
    }

    const credentials: SessionCredentials = {
      appToken: this.session.sessionId, // Use current session as app token for refresh
      account: this.session.account,
      customerId: this.session.customerId,
    };

    return this.createSession(credentials);
  }

  /**
   * Expires the current session
   */
  expireSession(): void {
    if (this.session) {
      this.session.isActive = false;
    }

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }

    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  /**
   * Sets a callback for session expiration events
   */
  onSessionExpiredCallback(callback: () => void): void {
    this.onSessionExpired = callback;
  }

  /**
   * Updates session configuration
   */
  updateConfig(config: Partial<TunaSessionConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Schedules session expiry timer
   */
  private scheduleSessionExpiry(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    if (!this.session) {
      return;
    }

    const timeUntilExpiry = this.session.expiresAt.getTime() - Date.now();
    
    if (timeUntilExpiry > 0) {
      this.sessionTimeout = setTimeout(() => {
        this.expireSession();
      }, timeUntilExpiry);
    }
  }

  /**
   * Gets session headers for API requests
   */
  getSessionHeaders(): Record<string, string> {
    const session = this.getCurrentSession();
    
    if (!session) {
      throw new TunaSessionError('No active session available');
    }

    return {
      'Session-Id': session.sessionId,
      'Account': session.account,
      ...(session.customerId && { 'Customer-Id': session.customerId }),
    };
  }

  /**
   * Cleans up session manager resources
   */
  destroy(): void {
    this.expireSession();
    this.session = null;
    this.onSessionExpired = undefined;
  }
}

/**
 * Default session manager instance
 */
let defaultSessionManager: SessionManager | null = null;

/**
 * Gets or creates the default session manager
 */
export function getDefaultSessionManager(config?: TunaSessionConfig): SessionManager {
  if (!defaultSessionManager) {
    if (!config) {
      throw new TunaSessionError('Session configuration is required');
    }
    defaultSessionManager = new SessionManager(config);
  }
  return defaultSessionManager;
}

/**
 * Creates a new session manager instance
 */
export function createSessionManager(config: TunaSessionConfig): SessionManager {
  return new SessionManager(config);
}

/**
 * Resets the default session manager
 */
export function resetDefaultSessionManager(): void {
  if (defaultSessionManager) {
    defaultSessionManager.destroy();
    defaultSessionManager = null;
  }
}