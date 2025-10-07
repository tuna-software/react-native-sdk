/**
 * Saved Cards Management
 * 
 * Handles listing, saving, and deleting saved payment cards
 */

import { TunaApiClient } from '../api/tunaApi';
import { TunaPaymentError } from '../types/errors';

export interface SavedCard {
  token: string;
  brand: string;
  lastFourDigits: string;
  expirationMonth: string;
  expirationYear: string;
  cardHolderName?: string;
}

/**
 * Saved Cards Manager
 */
export class SavedCardsManager {
  private apiClient: TunaApiClient;

  constructor(apiClient: TunaApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * List saved cards for the current session
   */
  async listSavedCards(): Promise<SavedCard[]> {
    try {
      const response = await this.apiClient.listTokens();
      
      if (response.code !== 1 || !response.tokens) {
        console.log('💳 [SavedCards] No saved cards found or API error');
        return [];
      }

      // Transform API response to SavedCard format
      const cards: SavedCard[] = response.tokens.map((token: any) => ({
        token: token.token,
        brand: token.brand || 'unknown',
        lastFourDigits: token.lastFourDigits || token.last4 || 'xxxx',
        expirationMonth: token.expirationMonth || token.expMonth || '12',
        expirationYear: token.expirationYear || token.expYear || '2025',
        cardHolderName: token.cardHolderName || token.holderName
      }));

      console.log('💳 [SavedCards] Loaded saved cards:', cards.length);
      return cards;

    } catch (error) {
      console.error('❌ [SavedCards] Failed to list saved cards:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  }

  /**
   * Delete a saved card
   */
  async deleteSavedCard(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.apiClient.deleteToken(token);
      
      if (response.code === 1 || response.success) {
        console.log('✅ [SavedCards] Card deleted successfully');
        return { success: true, message: 'Card deleted successfully' };
      } else {
        const errorMessage = response.message || 'Failed to delete card';
        console.error('❌ [SavedCards] Failed to delete card:', errorMessage);
        return { success: false, message: errorMessage };
      }

    } catch (error) {
      console.error('❌ [SavedCards] Delete card error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Bind token with CVV for payment
   */
  async bindTokenForPayment(token: string, cvv: string): Promise<any> {
    try {
      const response = await this.apiClient.bindToken(token, cvv);
      
      if (response.code !== 1) {
        throw new TunaPaymentError(`Token bind failed: ${response.message || 'Unknown error'}`);
      }

      return response;

    } catch (error) {
      console.error('❌ [SavedCards] Token bind error:', error);
      throw new TunaPaymentError(
        'Failed to bind token: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }
}