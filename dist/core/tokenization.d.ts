/**
 * Tokenization service for Tuna React Native SDK
 *
 * Handles credit card tokenization, saved card management, and PCI compliance
 */
import { TokenizationRequest, TokenizationResponse, SavedToken, TokenBindRequest, TokenListRequest, TokenDeleteRequest } from '../types/tokenization';
import { SessionManager } from './session';
export declare class TokenizationManager {
    private sessionManager;
    private config;
    constructor(sessionManager: SessionManager, config: {
        baseUrl: string;
        timeout?: number;
    });
    /**
     * Generates a new token from card data
     */
    generateToken(request: TokenizationRequest): Promise<TokenizationResponse>;
    /**
     * Lists all saved tokens for a customer
     */
    listTokens(request: TokenListRequest): Promise<SavedToken[]>;
    /**
     * Binds a token to a customer for future use
     */
    bindToken(request: TokenBindRequest): Promise<boolean>;
    /**
     * Deletes a saved token
     */
    deleteToken(request: TokenDeleteRequest): Promise<boolean>;
    /**
     * Validates if a token is still valid and active
     */
    validateToken(token: string, customerId?: string): Promise<boolean>;
    /**
     * Gets a specific token details
     */
    getTokenDetails(token: string, customerId?: string): Promise<SavedToken | null>;
    /**
     * Sets a token as the default for a customer
     */
    setDefaultToken(token: string, customerId: string): Promise<boolean>;
    /**
     * Gets the default token for a customer
     */
    getDefaultToken(customerId: string): Promise<SavedToken | null>;
    /**
     * Masks a card number for display
     */
    private maskCardNumber;
    /**
     * Creates a tokenization request from card data
     */
    static createTokenizationRequest(cardNumber: string, cardholderName: string, expirationMonth: number, expirationYear: number, cvv: string, customerId?: string, brand?: string): TokenizationRequest;
}
/**
 * Gets or creates the default tokenization manager
 */
export declare function getDefaultTokenizationManager(sessionManager?: SessionManager, config?: {
    baseUrl: string;
    timeout?: number;
}): TokenizationManager;
/**
 * Creates a new tokenization manager instance
 */
export declare function createTokenizationManager(sessionManager: SessionManager, config: {
    baseUrl: string;
    timeout?: number;
}): TokenizationManager;
/**
 * Resets the default tokenization manager
 */
export declare function resetDefaultTokenizationManager(): void;
//# sourceMappingURL=tokenization.d.ts.map