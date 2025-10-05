/**
 * Status Poller for Tuna React Native SDK
 *
 * This module handles long polling for payment status updates,
 * providing real-time payment status tracking.
 */
import { PaymentStatus, PaymentStatusResponse, StatusCallback, StatusPollingConfig } from '../types/payment';
export interface StatusPollerConfig {
    maxRetries?: number;
    retryInterval?: number;
    timeout?: number;
    backoffMultiplier?: number;
    maxBackoffInterval?: number;
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
export declare class StatusPoller {
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
export declare function createStatusPoller(baseUrl: string, sessionId: string, config?: StatusPollerConfig): StatusPoller;
//# sourceMappingURL=StatusPoller.d.ts.map