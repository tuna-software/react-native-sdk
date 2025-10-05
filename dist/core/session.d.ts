/**
 * Session management service for Tuna React Native SDK
 *
 * Handles session creation, validation, and renewal with Tuna's backend APIs
 */
import { TunaSessionConfig, TunaSession, SessionCredentials } from '../types/session';
export declare class SessionManager {
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
 * Gets or creates the default session manager
 */
export declare function getDefaultSessionManager(config?: TunaSessionConfig): SessionManager;
/**
 * Creates a new session manager instance
 */
export declare function createSessionManager(config: TunaSessionConfig): SessionManager;
/**
 * Resets the default session manager
 */
export declare function resetDefaultSessionManager(): void;
//# sourceMappingURL=session.d.ts.map