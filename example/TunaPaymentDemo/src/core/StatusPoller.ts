/**
 * Status Poller for Tuna React Native SDK
 * 
 * This module handles long polling for payment status updates,
 * providing real-time payment status tracking.
 */

import {
  PaymentStatus,
  PaymentStatusResponse,
  StatusCallback,
  StatusCallbackData,
  StatusPollingConfig,
} from '../types/payment';
import { TunaPaymentError } from '../utils/errors';
import { ENDPOINTS } from '../utils/constants';

export interface StatusPollerConfig {
  maxRetries?: number; // Default: 30
  retryInterval?: number; // Default: 2000ms (2 seconds)
  timeout?: number; // Default: 10 minutes
  backoffMultiplier?: number; // Default: 1.2
  maxBackoffInterval?: number; // Default: 10 seconds
}

export interface PollingSession {
  id: string;
  methodId: string;
  paymentKey: string;
  startTime: Date;
  lastUpdate: Date;
  retryCount: number;
  status: PaymentStatus;
  isActive: boolean;
}

export class StatusPoller {
  private config: StatusPollerConfig;
  private sessions: Map<string, PollingSession> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private baseUrl: string;
  private sessionId: string;

  constructor(baseUrl: string, sessionId: string, config: StatusPollerConfig = {}) {
    this.baseUrl = baseUrl;
    this.sessionId = sessionId;
    this.config = {
      maxRetries: config.maxRetries || 30,
      retryInterval: config.retryInterval || 2000,
      timeout: config.timeout || 600000, // 10 minutes
      backoffMultiplier: config.backoffMultiplier || 1.2,
      maxBackoffInterval: config.maxBackoffInterval || 10000,
      ...config,
    };
  }

  /**
   * Starts polling for payment status
   */
  async startPolling(
    methodId: string,
    paymentKey: string,
    callback: StatusCallback,
    config?: StatusPollingConfig
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const mergedConfig = { ...this.config, ...config };

    try {
      console.log(`Starting status polling for payment ${methodId}/${paymentKey}`);

      // Create polling session
      const session: PollingSession = {
        id: sessionId,
        methodId,
        paymentKey,
        startTime: new Date(),
        lastUpdate: new Date(),
        retryCount: 0,
        status: 'pending',
        isActive: true,
      };

      this.sessions.set(sessionId, session);

      // Start polling with exponential backoff
      this.scheduleNextPoll(sessionId, callback, mergedConfig, mergedConfig.retryInterval!);

      return sessionId;
    } catch (error) {
      console.error('Failed to start status polling:', error);
      throw new TunaPaymentError('Status polling initialization failed');
    }
  }

  /**
   * Stops polling for a specific session
   */
  stopPolling(sessionId: string): void {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isActive = false;
        this.sessions.delete(sessionId);
      }

      const interval = this.intervals.get(sessionId);
      if (interval) {
        clearTimeout(interval);
        this.intervals.delete(sessionId);
      }

      console.log(`Stopped status polling for session ${sessionId}`);
    } catch (error) {
      console.error('Error stopping polling:', error);
    }
  }

  /**
   * Stops all active polling sessions
   */
  stopAllPolling(): void {
    const sessionIds = Array.from(this.sessions.keys());
    sessionIds.forEach(sessionId => this.stopPolling(sessionId));
  }

  /**
   * Gets the current status of a polling session
   */
  getPollingStatus(sessionId: string): PollingSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Gets all active polling sessions
   */
  getActiveSessions(): PollingSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * Performs a single status check
   */
  async checkStatus(methodId: string, paymentKey: string): Promise<PaymentStatusResponse> {
    try {
      const url = `${this.baseUrl}${ENDPOINTS.PAYMENT_STATUS}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionId}`,
        },
        body: JSON.stringify({
          methodId,
          paymentKey,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new TunaPaymentError(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      return this.parseStatusResponse(data);
    } catch (error) {
      console.error('Status check failed:', error);
      throw new TunaPaymentError('Payment status check failed');
    }
  }

  /**
   * Schedules the next polling attempt with exponential backoff
   */
  private scheduleNextPoll(
    sessionId: string,
    callback: StatusCallback,
    config: StatusPollerConfig,
    interval: number
  ): void {
    const timeout = setTimeout(async () => {
      try {
        await this.performPoll(sessionId, callback, config);
      } catch (error) {
        console.error('Polling error:', error);
        this.handlePollingError(sessionId, callback, error);
      }
    }, interval);

    this.intervals.set(sessionId, timeout);
  }

  /**
   * Performs a single polling attempt
   */
  private async performPoll(
    sessionId: string,
    callback: StatusCallback,
    config: StatusPollerConfig
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return;
    }

    try {
      // Check if timeout exceeded
      const elapsed = Date.now() - session.startTime.getTime();
      if (elapsed > config.timeout!) {
        this.handleTimeout(sessionId, callback);
        return;
      }

      // Check if max retries exceeded
      if (session.retryCount >= config.maxRetries!) {
        this.handleMaxRetriesExceeded(sessionId, callback);
        return;
      }

      // Perform status check
      const statusResponse = await this.checkStatus(session.methodId, session.paymentKey);
      
      // Update session
      session.lastUpdate = new Date();
      session.retryCount++;
      session.status = statusResponse.status;

      // Check if payment is complete
      if (this.isTerminalStatus(statusResponse.status)) {
        this.handleCompletedPayment(sessionId, callback, statusResponse);
        return;
      }

      // Schedule next poll with backoff
      const nextInterval = Math.min(
        config.retryInterval! * Math.pow(config.backoffMultiplier!, session.retryCount),
        config.maxBackoffInterval!
      );

      this.scheduleNextPoll(sessionId, callback, config, nextInterval);

      // Notify callback of status update
      callback({
        status: statusResponse.status,
        statusMessage: statusResponse.statusMessage,
        retryCount: session.retryCount,
        elapsed: Date.now() - session.startTime.getTime(),
        isComplete: false,
        response: statusResponse,
      });

    } catch (error) {
      session.retryCount++;
      this.handlePollingError(sessionId, callback, error);
    }
  }

  /**
   * Handles polling errors
   */
  private handlePollingError(sessionId: string, callback: StatusCallback, error: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.error(`Polling error for session ${sessionId}:`, error);

    callback({
      status: 'failed',
      statusMessage: 'Polling error occurred',
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      error: error instanceof TunaPaymentError ? error : new TunaPaymentError(String(error)),
    });

    this.stopPolling(sessionId);
  }

  /**
   * Handles timeout scenarios
   */
  private handleTimeout(sessionId: string, callback: StatusCallback): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.warn(`Polling timeout for session ${sessionId}`);

    callback({
      status: 'failed',
      statusMessage: 'Payment status polling timeout',
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      error: new TunaPaymentError('Status polling timeout'),
    });

    this.stopPolling(sessionId);
  }

  /**
   * Handles max retries exceeded
   */
  private handleMaxRetriesExceeded(sessionId: string, callback: StatusCallback): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.warn(`Max retries exceeded for session ${sessionId}`);

    callback({
      status: 'failed',
      statusMessage: 'Maximum polling retries exceeded',
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      error: new TunaPaymentError('Maximum polling retries exceeded'),
    });

    this.stopPolling(sessionId);
  }

  /**
   * Handles completed payment
   */
  private handleCompletedPayment(
    sessionId: string,
    callback: StatusCallback,
    response: PaymentStatusResponse
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`Payment completed for session ${sessionId}: ${response.status}`);

    callback({
      status: response.status,
      statusMessage: response.statusMessage,
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      response,
    });

    this.stopPolling(sessionId);
  }

  /**
   * Checks if a status is terminal (no more polling needed)
   */
  private isTerminalStatus(status: PaymentStatus): boolean {
    return ['success', 'failed', 'cancelled', 'expired', 'refunded'].includes(status);
  }

  /**
   * Parses the status response from the API
   */
  private parseStatusResponse(data: any): PaymentStatusResponse {
    return {
      paymentId: data.paymentId || data.methodId,
      status: data.status || 'pending',
      statusMessage: data.statusMessage,
      transactionId: data.transactionId,
      authorizationCode: data.authorizationCode,
      receiptUrl: data.receiptUrl,
      lastUpdated: new Date(data.lastUpdated || Date.now()),
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata || {},
    };
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    return `poll_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Gets debug information
   */
  getDebugInfo(): Record<string, any> {
    return {
      config: this.config,
      activeSessions: this.getActiveSessions().length,
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values()),
    };
  }

  /**
   * Cleanup method to stop all polling and clear resources
   */
  destroy(): void {
    this.stopAllPolling();
    this.sessions.clear();
    this.intervals.clear();
  }
}

/**
 * Creates a new status poller instance
 */
export function createStatusPoller(
  baseUrl: string,
  sessionId: string,
  config?: StatusPollerConfig
): StatusPoller {
  return new StatusPoller(baseUrl, sessionId, config);
}