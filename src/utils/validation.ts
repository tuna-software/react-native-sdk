/**
 * Validation utilities for Tuna React Native
 */

import { TunaPaymentError } from './errors';

/**
 * Credit card validation utilities
 */
export class CardValidator {
  /**
   * Validates a credit card number using Luhn algorithm
   */
  static isValidNumber(cardNumber: string): boolean {
    if (!cardNumber || typeof cardNumber !== 'string') {
      return false;
    }

    // Remove all non-digit characters
    const number = cardNumber.replace(/\D/g, '');
    
    if (number.length < 13 || number.length > 19) {
      return false;
    }

    return this.luhnCheck(number);
  }

  /**
   * Luhn algorithm implementation
   */
  private static luhnCheck(number: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (sum % 10) === 0;
  }

  /**
   * Detects credit card type based on number
   */
  static getCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\D/g, '');
    
    // Visa
    if (/^4/.test(number)) {
      return 'visa';
    }
    
    // Mastercard
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
      return 'mastercard';
    }
    
    // American Express
    if (/^3[47]/.test(number)) {
      return 'amex';
    }
    
    // Diners Club
    if (/^3[0689]/.test(number)) {
      return 'diners';
    }
    
    // Discover
    if (/^6(?:011|5)/.test(number)) {
      return 'discover';
    }
    
    // JCB
    if (/^35/.test(number)) {
      return 'jcb';
    }
    
    // Elo (Brazilian)
    if (/^(4011|4312|4389|4514|4573|5041|5066|5067|6277|6362|6363|6504|6505|6516)/.test(number)) {
      return 'elo';
    }
    
    // Hipercard (Brazilian)
    if (/^606282/.test(number)) {
      return 'hipercard';
    }
    
    return 'unknown';
  }

  /**
   * Validates CVV/CVC based on card type
   */
  static isValidCVV(cvv: string, cardType?: string): boolean {
    if (!cvv || typeof cvv !== 'string') {
      return false;
    }

    const cleanCvv = cvv.replace(/\D/g, '');
    
    // American Express uses 4-digit CVV
    if (cardType === 'amex') {
      return cleanCvv.length === 4;
    }
    
    // Most other cards use 3-digit CVV
    return cleanCvv.length === 3;
  }

  /**
   * Validates expiration date (MM/YY or MM/YYYY format)
   */
  static isValidExpiry(expiry: string): boolean {
    if (!expiry || typeof expiry !== 'string') {
      return false;
    }

    const cleanExpiry = expiry.replace(/\D/g, '');
    
    if (cleanExpiry.length !== 4 && cleanExpiry.length !== 6) {
      return false;
    }

    const month = parseInt(cleanExpiry.substring(0, 2), 10);
    const year = cleanExpiry.length === 4 
      ? parseInt(`20${cleanExpiry.substring(2)}`, 10)
      : parseInt(cleanExpiry.substring(2), 10);

    if (month < 1 || month > 12) {
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  /**
   * Validates cardholder name
   */
  static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 100 && /^[a-zA-Z\s]+$/.test(trimmed);
  }
}

/**
 * Brazilian document validation utilities
 */
export class BrazilianDocumentValidator {
  /**
   * Validates CPF (Brazilian individual taxpayer ID)
   */
  static isValidCPF(cpf: string): boolean {
    if (!cpf || typeof cpf !== 'string') {
      return false;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      return false;
    }

    // Check for known invalid CPFs
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false;
    }

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    
    let remainder = sum % 11;
    let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleanCpf.charAt(9)) !== checkDigit1) {
      return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    
    remainder = sum % 11;
    let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCpf.charAt(10)) === checkDigit2;
  }

  /**
   * Validates CNPJ (Brazilian company taxpayer ID)
   */
  static isValidCNPJ(cnpj: string): boolean {
    if (!cnpj || typeof cnpj !== 'string') {
      return false;
    }

    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      return false;
    }

    // Check for known invalid CNPJs
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    const weight1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight1[i];
    }
    
    let remainder = sum % 11;
    let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleanCnpj.charAt(12)) !== checkDigit1) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    const weight2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight2[i];
    }
    
    remainder = sum % 11;
    let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCnpj.charAt(13)) === checkDigit2;
  }
}

/**
 * Email validation utility
 */
export class EmailValidator {
  /**
   * Validates email format using regex
   */
  static isValid(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
}

/**
 * Phone validation utility
 */
export class PhoneValidator {
  /**
   * Validates Brazilian phone number format
   */
  static isValidBrazilian(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    
    // Brazilian phone: 10 digits (landline) or 11 digits (mobile)
    // Format: (XX) XXXX-XXXX or (XX) 9XXXX-XXXX
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  }
}

/**
 * General payment validation utilities
 */
export class PaymentValidator {
  /**
   * Validates payment amount
   */
  static isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0 && isFinite(amount);
  }

  /**
   * Validates currency code (ISO 4217)
   */
  static isValidCurrency(currency: string): boolean {
    const validCurrencies = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    return validCurrencies.includes(currency?.toUpperCase());
  }

  /**
   * Validates installment count
   */
  static isValidInstallments(installments: number): boolean {
    return Number.isInteger(installments) && installments >= 1 && installments <= 12;
  }
}

/**
 * Comprehensive validation function for payment data
 */
export function validatePaymentData(data: any): TunaPaymentError[] {
  const errors: TunaPaymentError[] = [];

  // Validate amount
  if (!PaymentValidator.isValidAmount(data.amount)) {
    errors.push(new TunaPaymentError('Amount must be a positive number'));
  }

  // Validate currency
  if (!PaymentValidator.isValidCurrency(data.currency)) {
    errors.push(new TunaPaymentError('Invalid currency code'));
  }

  // Validate card data if present
  if (data.cardNumber) {
    if (!CardValidator.isValidNumber(data.cardNumber)) {
      errors.push(new TunaPaymentError('Invalid credit card number'));
    }

    if (data.cvv && !CardValidator.isValidCVV(data.cvv, CardValidator.getCardType(data.cardNumber))) {
      errors.push(new TunaPaymentError('Invalid CVV/CVC'));
    }

    if (data.expiryDate && !CardValidator.isValidExpiry(data.expiryDate)) {
      errors.push(new TunaPaymentError('Invalid or expired card'));
    }

    if (data.cardholderName && !CardValidator.isValidName(data.cardholderName)) {
      errors.push(new TunaPaymentError('Invalid cardholder name'));
    }
  }

  // Validate customer data
  if (data.customerEmail && !EmailValidator.isValid(data.customerEmail)) {
    errors.push(new TunaPaymentError('Invalid email format'));
  }

  if (data.customerDocument) {
    const docLength = data.customerDocument.replace(/\D/g, '').length;
    if (docLength === 11 && !BrazilianDocumentValidator.isValidCPF(data.customerDocument)) {
      errors.push(new TunaPaymentError('Invalid CPF'));
    } else if (docLength === 14 && !BrazilianDocumentValidator.isValidCNPJ(data.customerDocument)) {
      errors.push(new TunaPaymentError('Invalid CNPJ'));
    }
  }

  if (data.customerPhone && !PhoneValidator.isValidBrazilian(data.customerPhone)) {
    errors.push(new TunaPaymentError('Invalid phone number format'));
  }

  return errors;
}

/**
 * Convenience functions for individual validations
 */
export function validateCardNumber(cardNumber: string): boolean {
  return CardValidator.isValidNumber(cardNumber);
}

export function validateCVV(cvv: string, cardNumber?: string): boolean {
  const cardType = cardNumber ? CardValidator.getCardType(cardNumber) : undefined;
  return CardValidator.isValidCVV(cvv, cardType);
}

export function validateExpirationDate(expiry: string): boolean {
  return CardValidator.isValidExpiry(expiry);
}

export function validateCardholderName(name: string): boolean {
  return CardValidator.isValidName(name);
}

export function validateEmail(email: string): boolean {
  return EmailValidator.isValid(email);
}

export function validateCPF(cpf: string): boolean {
  return BrazilianDocumentValidator.isValidCPF(cpf);
}

export function validateCNPJ(cnpj: string): boolean {
  return BrazilianDocumentValidator.isValidCNPJ(cnpj);
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate card data for tokenization
 */
export function validateCardData(cardData: any): ValidationResult {
  const errors: string[] = [];

  if (!cardData) {
    errors.push('Card data is required');
    return { isValid: false, errors };
  }

  if (!cardData.cardHolderName || !CardValidator.isValidName(cardData.cardHolderName)) {
    errors.push('Valid cardholder name is required');
  }

  if (!cardData.cardNumber || !CardValidator.isValidNumber(cardData.cardNumber)) {
    errors.push('Valid card number is required');
  }

  if (!cardData.expirationMonth || !CardValidator.isValidExpiry(`${cardData.expirationMonth}/${cardData.expirationYear}`)) {
    errors.push('Valid expiration date is required');
  }

  if (!cardData.cvv || !CardValidator.isValidCVV(cardData.cvv, CardValidator.getCardType(cardData.cardNumber || ''))) {
    errors.push('Valid CVV is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate customer information
 */
export function validateCustomerInfo(customer: any): ValidationResult {
  const errors: string[] = [];

  if (!customer) {
    errors.push('Customer information is required');
    return { isValid: false, errors };
  }

  if (!customer.email || !EmailValidator.isValid(customer.email)) {
    errors.push('Valid email is required');
  }

  if (!customer.name || customer.name.trim().length < 2) {
    errors.push('Valid customer name is required');
  }

  if (customer.document) {
    // Validate Brazilian documents if provided
    if (!BrazilianDocumentValidator.isValidCPF(customer.document) && 
        !BrazilianDocumentValidator.isValidCNPJ(customer.document)) {
      errors.push('Valid CPF or CNPJ is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}