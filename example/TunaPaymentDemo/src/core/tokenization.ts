/**
 * Tokenization service for Tuna React Native SDK
 * 
 * Handles credit card tokenization, saved card management, and PCI compliance
 */

import { 
  TokenizationRequest, 
  TokenizationResponse, 
  SavedToken, 
  CardTokenizationData,
  TokenBindRequest,
  TokenListRequest,
  TokenDeleteRequest
} from '../types/tokenization';
import { TunaTokenizationError, TunaNetworkError, TunaSessionError } from '../utils/errors';
import { TUNA_API_ENDPOINTS } from '../utils/constants';
import { SessionManager } from './session';
import { validatePaymentData } from '../utils/validation';
import { handleHttpError } from '../utils/errors';

export class TokenizationManager {
  private sessionManager: SessionManager;
  private config: {
    baseUrl: string;
    timeout: number;
  };

  constructor(sessionManager: SessionManager, config: { baseUrl: string; timeout?: number }) {
    this.sessionManager = sessionManager;
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Generates a new token from card data
   */
  async generateToken(request: TokenizationRequest): Promise<TokenizationResponse> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required for tokenization');
    }

    // Validate card data before tokenization
    const validationErrors = validatePaymentData(request);
    if (validationErrors.length > 0) {
      throw new TunaTokenizationError(`Validation failed: ${validationErrors[0].message}`);
    }

    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.GENERATE_TOKEN}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();

      const requestBody: CardTokenizationData = {
        CardNumber: request.cardNumber,
        CardHolderName: request.cardholderName,
        ExpirationMonth: request.expirationMonth,
        ExpirationYear: request.expirationYear,
        CVV: request.cvv,
        ...(request.customerId && { CustomerId: request.customerId }),
        ...(request.brand && { Brand: request.brand }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const responseData = await response.json();
      
      if (!responseData.Token) {
        throw new TunaTokenizationError('Invalid tokenization response from server');
      }

      return {
        token: responseData.Token,
        maskedCardNumber: responseData.MaskedCardNumber || this.maskCardNumber(request.cardNumber),
        cardBrand: responseData.Brand || request.brand,
        lastFourDigits: responseData.LastFourDigits || request.cardNumber.slice(-4),
        expirationMonth: request.expirationMonth,
        expirationYear: request.expirationYear,
        customerId: request.customerId,
        createdAt: new Date(),
      };
    } catch (error) {
      if (error instanceof TunaTokenizationError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaTokenizationError('Failed to generate token');
    }
  }

  /**
   * Lists all saved tokens for a customer
   */
  async listTokens(request: TokenListRequest): Promise<SavedToken[]> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to list tokens');
    }

    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.LIST_TOKENS}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();

      const queryParams = new URLSearchParams();
      if (request.customerId) {
        queryParams.append('CustomerId', request.customerId);
      }

      const url = queryParams.toString() ? `${endpoint}?${queryParams}` : endpoint;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...sessionHeaders,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const responseData = await response.json();
      
      if (!Array.isArray(responseData.Tokens)) {
        return [];
      }

      return responseData.Tokens.map((token: any) => ({
        token: token.Token,
        maskedCardNumber: token.MaskedCardNumber,
        cardBrand: token.Brand,
        lastFourDigits: token.LastFourDigits,
        expirationMonth: token.ExpirationMonth,
        expirationYear: token.ExpirationYear,
        customerId: token.CustomerId,
        createdAt: new Date(token.CreatedAt),
        isDefault: token.IsDefault || false,
      }));
    } catch (error) {
      if (error instanceof TunaTokenizationError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaTokenizationError('Failed to list tokens');
    }
  }

  /**
   * Binds a token to a customer for future use
   */
  async bindToken(request: TokenBindRequest): Promise<boolean> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to bind token');
    }

    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.BIND_TOKEN}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();

      const requestBody = {
        Token: request.token,
        CustomerId: request.customerId,
        ...(request.isDefault && { IsDefault: request.isDefault }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const responseData = await response.json();
      return responseData.Success === true;
    } catch (error) {
      if (error instanceof TunaTokenizationError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaTokenizationError('Failed to bind token');
    }
  }

  /**
   * Deletes a saved token
   */
  async deleteToken(request: TokenDeleteRequest): Promise<boolean> {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to delete token');
    }

    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.DELETE_TOKEN}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();

      const requestBody = {
        Token: request.token,
        ...(request.customerId && { CustomerId: request.customerId }),
      };

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }

      const responseData = await response.json();
      return responseData.Success === true;
    } catch (error) {
      if (error instanceof TunaTokenizationError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaTokenizationError('Failed to delete token');
    }
  }

  /**
   * Validates if a token is still valid and active
   */
  async validateToken(token: string, customerId?: string): Promise<boolean> {
    try {
      const tokens = await this.listTokens({ customerId });
      return tokens.some(t => t.token === token);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets a specific token details
   */
  async getTokenDetails(token: string, customerId?: string): Promise<SavedToken | null> {
    try {
      const tokens = await this.listTokens({ customerId });
      return tokens.find(t => t.token === token) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sets a token as the default for a customer
   */
  async setDefaultToken(token: string, customerId: string): Promise<boolean> {
    return this.bindToken({
      token,
      customerId,
      isDefault: true,
    });
  }

  /**
   * Gets the default token for a customer
   */
  async getDefaultToken(customerId: string): Promise<SavedToken | null> {
    try {
      const tokens = await this.listTokens({ customerId });
      return tokens.find(t => t.isDefault) || tokens[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Masks a card number for display
   */
  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) {
      return '*'.repeat(cleaned.length);
    }
    
    const firstFour = cleaned.slice(0, 4);
    const lastFour = cleaned.slice(-4);
    const middle = '*'.repeat(Math.max(0, cleaned.length - 8));
    
    return `${firstFour}${middle}${lastFour}`;
  }

  /**
   * Creates a tokenization request from card data
   */
  static createTokenizationRequest(
    cardNumber: string,
    cardholderName: string,
    expirationMonth: number,
    expirationYear: number,
    cvv: string,
    customerId?: string,
    brand?: string
  ): TokenizationRequest {
    return {
      cardNumber: cardNumber.replace(/\D/g, ''),
      cardholderName: cardholderName.trim(),
      expirationMonth,
      expirationYear,
      cvv: cvv.replace(/\D/g, ''),
      customerId,
      brand,
    };
  }
}

/**
 * Default tokenization manager instance
 */
let defaultTokenizationManager: TokenizationManager | null = null;

/**
 * Gets or creates the default tokenization manager
 */
export function getDefaultTokenizationManager(
  sessionManager?: SessionManager,
  config?: { baseUrl: string; timeout?: number }
): TokenizationManager {
  if (!defaultTokenizationManager) {
    if (!sessionManager || !config) {
      throw new TunaTokenizationError('Session manager and configuration are required');
    }
    defaultTokenizationManager = new TokenizationManager(sessionManager, config);
  }
  return defaultTokenizationManager;
}

/**
 * Creates a new tokenization manager instance
 */
export function createTokenizationManager(
  sessionManager: SessionManager,
  config: { baseUrl: string; timeout?: number }
): TokenizationManager {
  return new TokenizationManager(sessionManager, config);
}

/**
 * Resets the default tokenization manager
 */
export function resetDefaultTokenizationManager(): void {
  defaultTokenizationManager = null;
}