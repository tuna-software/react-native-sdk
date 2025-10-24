/**
 * PIX Payment Processing
 * 
 * Handles Brazilian PIX payment generation and processing
 */

import { TunaApiClient } from '../api/tunaApi';
import { TunaPaymentError } from '../types/errors';
import type { CustomerInfo, PIXResult, FrontData } from '../types/payment';

/**
 * PIX Payment Processor
 */
export class PIXProcessor {
  private apiClient: TunaApiClient;
  private debug: boolean;

  constructor(apiClient: TunaApiClient, debug: boolean = false) {
    this.apiClient = apiClient;
    this.debug = debug;
  }

  /**
   * Generate PIX payment
   */
  async generatePIXPayment(amount: number, customer: CustomerInfo, frontData?: FrontData): Promise<PIXResult> {
    if (this.debug) {
      console.log('🇧🇷 [PIX] Generating PIX payment:', { amount, customer: customer.email });
      if (frontData?.Sessions) {
        console.log('🔍 [PIX] Device profiling data:', frontData.Sessions);
      }
    }

    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new TunaPaymentError('Invalid PIX payment amount');
      }

      // Validate customer data
      if (!customer.document) {
        throw new TunaPaymentError('Customer document (CPF/CNPJ) is required for PIX payments');
      }

      // Prepare PIX payment request
      const pixRequest = {
        SessionId: '', // Will be set by API client
        PartnerUniqueId: `pix-payment-${Date.now()}`,
        TotalAmount: amount,
        PaymentMethods: [{
          Amount: amount,
          PaymentMethod: 'PIX',
        }],
        Customer: {
          Name: customer.name,
          Email: customer.email,
          Document: customer.document,
          Phone: customer.phone,
        },
        ReturnUrl: 'https://callback.example.com/pix-result',
        FrontData: frontData,
      };

      if (this.debug) {
        console.log('🔄 [PIX] Initializing PIX payment...');
      }

      const response = await this.apiClient.initializePayment(pixRequest);
      
      if (response.code !== 1) {
        throw new TunaPaymentError(`PIX initialization failed: ${response.message || 'Unknown error'}`);
      }

      // Extract PIX data from response
      const methodId = response.methods?.[0]?.methodId || 0;
      const paymentKey = response.paymentKey;
      
      if (this.debug) {
        console.log('🔍 [PIX] PIX initialized, extracting QR code...', { methodId, paymentKey });
      }

      // Get PIX details (QR code, copy & paste code)
      const statusResponse = await this.apiClient.getPaymentStatus(paymentKey, methodId);
      
      // Extract PIX codes from the response
      const qrCode = statusResponse.qrCode || statusResponse.pixQrCode || 'PIX_QR_CODE_PLACEHOLDER';
      const copyPasteCode = statusResponse.copyPasteCode || statusResponse.pixCopyPaste || qrCode;
      
      if (this.debug) {
        console.log('✅ [PIX] PIX payment generated successfully');
      }

      return {
        success: true,
        paymentId: response.paymentId || `pix-${Date.now()}`,
        status: 'pending',
        statusMessage: 'PIX payment generated, awaiting payment',
        qrCode: qrCode,
        copyPasteCode: copyPasteCode,
        paymentKey: paymentKey,
        methodId: methodId.toString(),
        amount: amount,
        currency: 'BRL',
        createdAt: new Date(),
        expirationDate: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        fullResponse: statusResponse
      };

    } catch (error) {
      console.error('❌ [PIX] Payment generation failed:', error);
      throw new TunaPaymentError(
        'PIX payment failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }

  /**
   * Check PIX payment status
   */
  async checkPIXStatus(paymentKey: string, methodId?: string | number): Promise<any> {
    try {
      if (this.debug) {
        console.log('🔍 [PIX] Checking PIX payment status:', { paymentKey, methodId });
      }

      const statusResponse = await this.apiClient.getPaymentStatus(paymentKey, methodId);
      
      if (this.debug) {
        console.log('📊 [PIX] PIX status:', statusResponse.status);
      }

      return statusResponse;

    } catch (error) {
      console.error('❌ [PIX] Status check failed:', error);
      throw new TunaPaymentError(
        'PIX status check failed: ' + (error instanceof Error ? error.message : String(error)),
        error
      );
    }
  }
}