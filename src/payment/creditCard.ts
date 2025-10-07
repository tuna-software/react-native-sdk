/**
 * Credit Card Payment Processing
 * 
 * Handles credit card tokenization and payment processing
 */

import { TunaApiClient, CardData, PaymentInitRequest } from '../api/tunaApi';
import { SavedCardsManager } from '../storage/savedCards';
import { TunaPaymentError } from '../types/errors';
import type { CustomerInfo, PaymentResult } from '../types/payment';

/**
 * Credit Card Payment Processor
 */
export class CreditCardProcessor {
  private apiClient: TunaApiClient;
  private savedCardsManager: SavedCardsManager;
  private debug: boolean;

  constructor(apiClient: TunaApiClient, savedCardsManager: SavedCardsManager, debug: boolean = false) {
    this.apiClient = apiClient;
    this.savedCardsManager = savedCardsManager;
    this.debug = debug;
  }

  /**
   * Process credit card payment
   */
  async processCreditCardPayment(
    amount: number,
    cardData: CardData,
    installments: number = 1,
    saveCard: boolean = false,
    customer?: CustomerInfo
  ): Promise<PaymentResult> {
    if (this.debug) {
      console.log('💳 [CreditCard] Processing credit card payment:', { amount, installments, saveCard });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new TunaPaymentError('Invalid payment amount');
    }

    try {
      // Step 1: Generate token for the credit card
      if (this.debug) {
        console.log('🔑 [CreditCard] Generating token for card:', this.maskCreditCard(cardData.cardNumber));
      }

      const tokenResponse = await this.apiClient.generateToken(cardData);
      
      if (tokenResponse.code !== 1 || !tokenResponse.token) {
        throw new TunaPaymentError(`Tokenization failed: ${tokenResponse.message || 'Unknown error'}`);
      }

      const token = tokenResponse.token;
      if (this.debug) {
        console.log('✅ [CreditCard] Token generated successfully:', token.substring(0, 20) + '...');
      }

      // Step 2: Initialize payment with the token
      const paymentRequest: PaymentInitRequest = {
        SessionId: '', // Will be set by API client
        PartnerUniqueId: `cc-payment-${Date.now()}`,
        TotalAmount: amount,
        PaymentMethods: [{
          Amount: amount,
          Token: token,
          CVV: cardData.cvv,
          Installments: installments,
          SaveCard: saveCard,
        }],
        Customer: customer,
        ReturnUrl: 'https://callback.example.com/payment-result',
      };

      if (this.debug) {
        console.log('🔄 [CreditCard] Initializing payment with token...');
      }

      const paymentResponse = await this.apiClient.initializePayment(paymentRequest);
      
      if (paymentResponse.code !== 1) {
        throw new TunaPaymentError(`Payment initialization failed: ${paymentResponse.message || 'Unknown error'}`);
      }

      // Step 3: Get method ID and payment key for status tracking
      const methodId = paymentResponse.methods?.[0]?.methodId || 0;
      const paymentKey = paymentResponse.paymentKey;
      
      if (this.debug) {
        console.log('🔍 [CreditCard] Payment initialized, checking status...', { methodId, paymentKey });
      }

      // Step 4: Get payment status
      const statusResponse = await this.apiClient.getPaymentStatus(paymentKey, methodId);
      
      if (this.debug) {
        console.log('📊 [CreditCard] Payment status:', statusResponse);
      }

      // Return payment result
      return {
        success: statusResponse.success || statusResponse.status === 'approved',
        paymentId: paymentResponse.paymentId || `cc-${Date.now()}`,
        status: statusResponse.status || 'pending',
        statusMessage: statusResponse.statusMessage,
        paymentKey: paymentKey,
        methodId: methodId.toString(),
        token: token,
        amount: amount,
        currency: 'BRL',
        createdAt: new Date(),
        errorMessage: statusResponse.success ? undefined : statusResponse.statusMessage,
        fullResponse: paymentResponse,
        fullStatusResponse: statusResponse
      };

    } catch (error) {
      console.error('❌ [CreditCard] Payment processing failed:', error);
      throw new TunaPaymentError(
        'Credit card payment failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Process payment using a saved card token
   */
  async processSavedCardPayment(
    amount: number,
    token: string,
    cvv: string,
    installments: number = 1,
    customer?: CustomerInfo
  ): Promise<PaymentResult> {
    if (this.debug) {
      console.log('💾 [CreditCard] Processing saved card payment:', { amount, installments });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new TunaPaymentError('Invalid payment amount');
    }

    try {
      // Step 1: Bind token with CVV
      if (this.debug) {
        console.log('🔗 [CreditCard] Binding token with CVV...');
      }

      await this.savedCardsManager.bindTokenForPayment(token, cvv);
      
      if (this.debug) {
        console.log('✅ [CreditCard] Token bound successfully');
      }

      // Step 2: Initialize payment with the bound token
      const paymentRequest: PaymentInitRequest = {
        SessionId: '', // Will be set by API client
        PartnerUniqueId: `saved-cc-payment-${Date.now()}`,
        TotalAmount: amount,
        PaymentMethods: [{
          Amount: amount,
          Token: token,
          CVV: cvv,
          Installments: installments,
          SaveCard: false, // Already saved
        }],
        Customer: customer,
        ReturnUrl: 'https://callback.example.com/payment-result',
      };

      if (this.debug) {
        console.log('🔄 [CreditCard] Initializing payment with saved card...');
      }

      const paymentResponse = await this.apiClient.initializePayment(paymentRequest);
      
      if (paymentResponse.code !== 1) {
        throw new TunaPaymentError(`Payment initialization failed: ${paymentResponse.message || 'Unknown error'}`);
      }

      // Step 3: Get method ID and payment key for status tracking
      const methodId = paymentResponse.methods?.[0]?.methodId || 0;
      const paymentKey = paymentResponse.paymentKey;
      
      if (this.debug) {
        console.log('🔍 [CreditCard] Payment initialized, checking status...', { methodId, paymentKey });
      }

      // Step 4: Get payment status
      const statusResponse = await this.apiClient.getPaymentStatus(paymentKey, methodId);
      
      if (this.debug) {
        console.log('📊 [CreditCard] Payment status:', statusResponse);
      }

      // Return payment result
      return {
        success: statusResponse.success || statusResponse.status === 'approved',
        paymentId: paymentResponse.paymentId || `saved-cc-${Date.now()}`,
        status: statusResponse.status || 'pending',
        statusMessage: statusResponse.statusMessage,
        paymentKey: paymentKey,
        methodId: methodId.toString(),
        token: token,
        amount: amount,
        currency: 'BRL',
        createdAt: new Date(),
        errorMessage: statusResponse.success ? undefined : statusResponse.statusMessage,
        fullResponse: paymentResponse,
        fullStatusResponse: statusResponse
      };

    } catch (error) {
      console.error('❌ [CreditCard] Saved card payment failed:', error);
      throw new TunaPaymentError(
        'Saved card payment failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Mask credit card number
   */
  private maskCreditCard(creditCardNumber: string): string {
    if (!creditCardNumber || typeof creditCardNumber !== "string") {
      return 'xxxx-xxxx-xxxx-xxxx';
    }

    // Clear formatting mask
    const cleanNumber = creditCardNumber.replace(/[^\da-zA-Z]/g, '');
    
    // Mask middle digits
    const maskedNumber = cleanNumber.substring(0, 6) + "xxxxxx" + cleanNumber.slice(-4);
    return maskedNumber;
  }
}