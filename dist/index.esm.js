import { Platform } from 'react-native';
import { PaymentRequest } from '@rnw-community/react-native-payments';
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Error types and handling for Tuna React Native
 */
class TunaError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', originalError) {
    super(message);
    this.name = 'TunaError';
    this.code = code;
    this.originalError = originalError;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TunaError);
    }
  }
}
class TunaNetworkError extends TunaError {
  constructor(message, originalError) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'TunaNetworkError';
  }
}
class TunaValidationError extends TunaError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', {
      field
    });
    this.name = 'TunaValidationError';
  }
}
class TunaSessionError extends TunaError {
  constructor(message) {
    super(message, 'SESSION_ERROR');
    this.name = 'TunaSessionError';
  }
}
class TunaTokenizationError extends TunaError {
  constructor(message, originalError) {
    super(message, 'TOKENIZATION_ERROR', originalError);
    this.name = 'TunaTokenizationError';
  }
}
class TunaPaymentError extends TunaError {
  constructor(message, originalError) {
    super(message, 'PAYMENT_ERROR', originalError);
    this.name = 'TunaPaymentError';
  }
}
class TunaNativePaymentError extends TunaError {
  constructor(message, originalError) {
    super(message, 'NATIVE_PAYMENT_ERROR', originalError);
    this.name = 'TunaNativePaymentError';
  }
}
class Tuna3DSError extends TunaError {
  constructor(message, originalError) {
    super(message, 'THREE_DS_ERROR', originalError);
    this.name = 'Tuna3DSError';
  }
}
// Error codes mapping similar to the existing JS plugin
const TunaErrorCodes = {
  // Session errors
  ERR_34: 'Session ID is required',
  ERR_01: 'Session has expired',
  // Validation errors
  ERR_19: 'Invalid Google Pay configuration',
  ERR_09: 'Checkout callback function is required',
  ERR_18: 'Container selector not found',
  ERR_25: 'Checkout callback or checkout and pay config is required',
  ERR_26: 'Checkout and pay config must be an object',
  ERR_27: 'Total payment amount must be a positive number',
  ERR_28: 'Payment method amount must be a positive number',
  ERR_29: 'Callback function is required',
  ERR_30: 'Invalid checkout and pay configuration',
  ERR_38: 'Custom area title is required',
  ERR_39: 'Custom area fields are required',
  // Payment errors
  ERR_36: 'Invalid payment method type',
  ERR_37: 'Checkout data is required',
  ERR_42: 'Invalid card data for payment processing',
  // Generic errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network connection error',
  VALIDATION_ERROR: 'Validation error',
  SESSION_ERROR: 'Session error',
  TOKENIZATION_ERROR: 'Tokenization error',
  PAYMENT_ERROR: 'Payment processing error',
  NATIVE_PAYMENT_ERROR: 'Native payment error',
  THREE_DS_ERROR: '3D Secure authentication error'
};
/**
 * Creates a TunaError from an error code
 */
function createTunaError(code, originalError) {
  const message = TunaErrorCodes[code] || TunaErrorCodes.UNKNOWN_ERROR;
  return new TunaError(message, code, originalError);
}
/**
 * Type guard to check if an error is a TunaError
 */
function isTunaError(error) {
  return error instanceof TunaError;
}
/**
 * Handles and converts various error types to TunaError
 */
function handleError(error, defaultCode = 'UNKNOWN_ERROR') {
  if (isTunaError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new TunaError(error.message, defaultCode, error);
  }
  if (typeof error === 'string') {
    return new TunaError(error, defaultCode);
  }
  return new TunaError('An unknown error occurred', defaultCode, error);
}

/**
 * Formatting utilities for Tuna React Native
 */
/**
 * Masks a credit card number showing only first 6 and last 4 digits
 */
function maskCreditCard(creditCardNumber) {
  if (!creditCardNumber || typeof creditCardNumber !== 'string') {
    return '';
  }
  // Clear formatting mask
  const cleanNumber = creditCardNumber.replace(/[^\da-zA-Z]/g, '');
  if (cleanNumber.length < 10) {
    return creditCardNumber; // Return original if too short
  }
  const maskedCreditCard = cleanNumber.substring(0, 6) + 'xxxxxx' + cleanNumber.slice(-4);
  return maskedCreditCard;
}
/**
 * Formats a credit card number with spaces for display
 */
function formatCreditCardDisplay(cardNumber) {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const chunks = cleanNumber.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}
/**
 * Formats CPF for display (XXX.XXX.XXX-XX)
 */
function formatCPF(cpf) {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length <= 3) return cleanCPF;
  if (cleanCPF.length <= 6) return cleanCPF.replace(/(\d{3})(\d+)/, '$1.$2');
  if (cleanCPF.length <= 9) return cleanCPF.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
/**
 * Formats CNPJ for display (XX.XXX.XXX/XXXX-XX)
 */
function formatCNPJ(cnpj) {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  if (cleanCNPJ.length <= 2) return cleanCNPJ;
  if (cleanCNPJ.length <= 5) return cleanCNPJ.replace(/(\d{2})(\d+)/, '$1.$2');
  if (cleanCNPJ.length <= 8) return cleanCNPJ.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (cleanCNPJ.length <= 12) return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
/**
 * Formats phone number for display
 */
function formatPhone(phone) {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.length <= 2) return cleanPhone;
  if (cleanPhone.length <= 6) return cleanPhone.replace(/(\d{2})(\d+)/, '($1) $2');
  if (cleanPhone.length <= 10) return cleanPhone.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}
/**
 * Formats currency for display
 */
function formatCurrency(amount, currencyCode = 'BRL', locale = 'pt-BR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  }).format(amount / 100); // Assuming amount is in cents
}
/**
 * Cleans a string removing all non-alphanumeric characters
 */
function cleanString(str) {
  return str.replace(/[^\da-zA-Z]/g, '');
}
/**
 * Capitalizes first letter of each word
 */
function capitalizeWords(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
/**
 * Truncates text to specified length with ellipsis
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}
/**
 * Formats expiration date for display (MM/YY)
 */
function formatExpirationDate(month, year) {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
}
/**
 * Validates and formats card expiration input
 */
function formatCardExpiration(input) {
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    const month = cleaned.substring(0, 2);
    const year = cleaned.substring(2, 4);
    return year ? `${month}/${year}` : month;
  }
  return cleaned;
}

/**
 * Error handling utilities for Tuna React Native
 */
/**
 * Handles HTTP response errors and converts to appropriate TunaError
 */
function handleHttpError(response, responseText) {
  const status = response.status;
  const statusText = response.statusText;
  let errorCode = 'NETWORK_ERROR';
  let message = `HTTP ${status}: ${statusText}`;
  if (responseText) {
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.message) {
        message = parsed.message;
      }
      if (parsed.code) {
        errorCode = parsed.code;
      }
    } catch (_a) {
      // Ignore JSON parse errors
    }
  }
  if (status >= 500) {
    return new TunaNetworkError(message);
  } else if (status === 401 || status === 403) {
    return new TunaSessionError(message);
  } else if (status === 400) {
    return new TunaValidationError(message);
  }
  return new TunaNetworkError(message);
}
/**
 * Handles API response and checks for errors
 */
function handleApiResponse(response) {
  if (response.code && response.code < 0) {
    const errorMessage = response.message || 'API request failed';
    throw new TunaError(errorMessage, response.code.toString());
  }
  return response;
}
/**
 * Safely parses JSON and handles errors
 */
function safeJsonParse(json, defaultValue) {
  try {
    return JSON.parse(json);
  } catch (_a) {
    return defaultValue;
  }
}
/**
 * Creates a timeout promise for network requests
 */
function createTimeoutPromise(timeoutMs) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TunaNetworkError('Request timeout'));
    }, timeoutMs);
  });
}
/**
 * Wraps a promise with timeout functionality
 */
function withTimeout(promise, timeoutMs) {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)]);
}
/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        break;
      }
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw handleError(lastError);
}
/**
 * Logs error information for debugging
 */
function logError(error, context) {
  if (__DEV__) {
    console.error(`[TunaRN${context ? ` - ${context}` : ''}]:`, error);
    if (error instanceof TunaError && error.originalError) {
      console.error('Original error:', error.originalError);
    }
  }
}
/**
 * Creates a user-friendly error message
 */
function getUserFriendlyErrorMessage(error) {
  // Map technical errors to user-friendly messages
  const userFriendlyMessages = {
    'ERR_34': 'Session is required. Please restart the payment process.',
    'ERR_01': 'Your session has expired. Please restart the payment process.',
    'ERR_19': 'Google Pay configuration is invalid.',
    'ERR_36': 'Invalid payment method selected.',
    'ERR_37': 'Payment information is incomplete.',
    'NETWORK_ERROR': 'Connection error. Please check your internet connection and try again.',
    'VALIDATION_ERROR': 'Please check your payment information and try again.',
    'SESSION_ERROR': 'Session error. Please restart the payment process.',
    'TOKENIZATION_ERROR': 'Error processing card information. Please try again.',
    'PAYMENT_ERROR': 'Payment processing error. Please try again.',
    'NATIVE_PAYMENT_ERROR': 'Payment service is not available. Please try again.',
    'THREE_DS_ERROR': 'Authentication error. Please try again.'
  };
  return userFriendlyMessages[error.code] || 'An unexpected error occurred. Please try again.';
}

/**
 * Validation utilities for Tuna React Native
 */
/**
 * Credit card validation utilities
 */
class CardValidator {
  /**
   * Validates a credit card number using Luhn algorithm
   */
  static isValidNumber(cardNumber) {
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
  static luhnCheck(number) {
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
    return sum % 10 === 0;
  }
  /**
   * Detects credit card type based on number
   */
  static getCardType(cardNumber) {
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
  static isValidCVV(cvv, cardType) {
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
  static isValidExpiry(expiry) {
    if (!expiry || typeof expiry !== 'string') {
      return false;
    }
    const cleanExpiry = expiry.replace(/\D/g, '');
    if (cleanExpiry.length !== 4 && cleanExpiry.length !== 6) {
      return false;
    }
    const month = parseInt(cleanExpiry.substring(0, 2), 10);
    const year = cleanExpiry.length === 4 ? parseInt(`20${cleanExpiry.substring(2)}`, 10) : parseInt(cleanExpiry.substring(2), 10);
    if (month < 1 || month > 12) {
      return false;
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear || year === currentYear && month < currentMonth) {
      return false;
    }
    return true;
  }
  /**
   * Validates cardholder name
   */
  static isValidName(name) {
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
class BrazilianDocumentValidator {
  /**
   * Validates CPF (Brazilian individual taxpayer ID)
   */
  static isValidCPF(cpf) {
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
  static isValidCNPJ(cnpj) {
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
class EmailValidator {
  /**
   * Validates email format using regex
   */
  static isValid(email) {
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
class PhoneValidator {
  /**
   * Validates Brazilian phone number format
   */
  static isValidBrazilian(phone) {
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
class PaymentValidator {
  /**
   * Validates payment amount
   */
  static isValidAmount(amount) {
    return typeof amount === 'number' && amount > 0 && isFinite(amount);
  }
  /**
   * Validates currency code (ISO 4217)
   */
  static isValidCurrency(currency) {
    const validCurrencies = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    return validCurrencies.includes(currency === null || currency === void 0 ? void 0 : currency.toUpperCase());
  }
  /**
   * Validates installment count
   */
  static isValidInstallments(installments) {
    return Number.isInteger(installments) && installments >= 1 && installments <= 12;
  }
}
/**
 * Comprehensive validation function for payment data
 */
function validatePaymentData(data) {
  const errors = [];
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
function validateCardNumber(cardNumber) {
  return CardValidator.isValidNumber(cardNumber);
}
function validateCVV(cvv, cardNumber) {
  const cardType = cardNumber ? CardValidator.getCardType(cardNumber) : undefined;
  return CardValidator.isValidCVV(cvv, cardType);
}
function validateExpirationDate(expiry) {
  return CardValidator.isValidExpiry(expiry);
}
function validateCardholderName(name) {
  return CardValidator.isValidName(name);
}
function validateEmail(email) {
  return EmailValidator.isValid(email);
}
function validateCPF(cpf) {
  return BrazilianDocumentValidator.isValidCPF(cpf);
}
function validateCNPJ(cnpj) {
  return BrazilianDocumentValidator.isValidCNPJ(cnpj);
}
/**
 * Validate card data for tokenization
 */
function validateCardData(cardData) {
  const errors = [];
  if (!cardData) {
    errors.push('Card data is required');
    return {
      isValid: false,
      errors
    };
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
function validateCustomerInfo(customer) {
  const errors = [];
  if (!customer) {
    errors.push('Customer information is required');
    return {
      isValid: false,
      errors
    };
  }
  if (!customer.email || !EmailValidator.isValid(customer.email)) {
    errors.push('Valid email is required');
  }
  if (!customer.name || customer.name.trim().length < 2) {
    errors.push('Valid customer name is required');
  }
  if (customer.document) {
    // Validate Brazilian documents if provided
    if (!BrazilianDocumentValidator.isValidCPF(customer.document) && !BrazilianDocumentValidator.isValidCNPJ(customer.document)) {
      errors.push('Valid CPF or CNPJ is required');
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Constants for Tuna React Native SDK
 */
/**
 * API endpoints for Tuna services
 */
const TUNA_API_ENDPOINTS = {
  // Session management
  NEW_SESSION: '/api/Token/NewSession',
  // Tokenization
  GENERATE_TOKEN: '/api/Token/Generate',
  LIST_TOKENS: '/api/Token/List',
  BIND_TOKEN: '/api/Token/Bind',
  DELETE_TOKEN: '/api/Token/Delete',
  // Payment processing
  INIT_PAYMENT: '/api/Payment/Init',
  PAYMENT_STATUS: '/api/Payment/Status',
  PAYMENT_CANCEL: '/api/Payment/Cancel',
  // 3DS
  THREEDS_AUTHENTICATE: '/api/3DS/Authenticate',
  THREEDS_CALLBACK: '/api/3DS/Callback',
  // Anti-fraud
  ANTIFRAUD_VALIDATE: '/api/AntifraudValidate'
};
// Alias for backwards compatibility and easier imports
const ENDPOINTS = TUNA_API_ENDPOINTS;
/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  // Session timeout in minutes
  SESSION_TIMEOUT: 30,
  // Payment timeout in seconds
  PAYMENT_TIMEOUT: 120,
  // Maximum retry attempts
  MAX_RETRIES: 3,
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,
  // Default currency
  DEFAULT_CURRENCY: 'BRL',
  // Default environment
  DEFAULT_ENVIRONMENT: 'sandbox'
};

/**
 * Session management service for Tuna React Native SDK
 *
 * Handles session creation, validation, and renewal with Tuna's backend APIs
 */
class SessionManager {
  constructor(config) {
    this.session = null;
    this.sessionTimeout = null;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }
  /**
   * Creates a new session with Tuna's backend
   */
  async createSession(credentials) {
    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.NEW_SESSION}`;
      const requestBody = {
        AppToken: credentials.appToken,
        Account: credentials.account,
        IsSandbox: this.config.environment === 'sandbox',
        ...(credentials.customerId && {
          CustomerId: credentials.customerId
        }),
        ...(credentials.sessionId && {
          SessionId: credentials.sessionId
        })
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.config.headers
        },
        body: JSON.stringify(requestBody)
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
        expiresAt: new Date(Date.now() + (this.config.sessionTimeout || DEFAULT_CONFIG.SESSION_TIMEOUT) * 60 * 1000),
        isActive: true
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
  getCurrentSession() {
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
  isSessionValid() {
    const session = this.getCurrentSession();
    return session !== null && session.isActive;
  }
  /**
   * Refreshes the current session
   */
  async refreshSession() {
    if (!this.session) {
      throw new TunaSessionError('No active session to refresh');
    }
    const credentials = {
      appToken: this.session.sessionId,
      // Use current session as app token for refresh
      account: this.session.account,
      customerId: this.session.customerId
    };
    return this.createSession(credentials);
  }
  /**
   * Expires the current session
   */
  expireSession() {
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
  onSessionExpiredCallback(callback) {
    this.onSessionExpired = callback;
  }
  /**
   * Updates session configuration
   */
  updateConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
  }
  /**
   * Schedules session expiry timer
   */
  scheduleSessionExpiry() {
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
  getSessionHeaders() {
    const session = this.getCurrentSession();
    if (!session) {
      throw new TunaSessionError('No active session available');
    }
    return {
      'Session-Id': session.sessionId,
      'Account': session.account,
      ...(session.customerId && {
        'Customer-Id': session.customerId
      })
    };
  }
  /**
   * Cleans up session manager resources
   */
  destroy() {
    this.expireSession();
    this.session = null;
    this.onSessionExpired = undefined;
  }
}

/**
 * Tokenization service for Tuna React Native SDK
 *
 * Handles credit card tokenization, saved card management, and PCI compliance
 */
class TokenizationManager {
  constructor(sessionManager, config) {
    this.sessionManager = sessionManager;
    this.config = {
      timeout: 30000,
      ...config
    };
  }
  /**
   * Generates a new token from card data
   */
  async generateToken(request) {
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
      const requestBody = {
        CardNumber: request.cardNumber,
        CardHolderName: request.cardholderName,
        ExpirationMonth: request.expirationMonth,
        ExpirationYear: request.expirationYear,
        CVV: request.cvv,
        ...(request.customerId && {
          CustomerId: request.customerId
        }),
        ...(request.brand && {
          Brand: request.brand
        })
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout)
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
        createdAt: new Date()
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
  async listTokens(request) {
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
          ...sessionHeaders
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }
      const responseData = await response.json();
      if (!Array.isArray(responseData.Tokens)) {
        return [];
      }
      return responseData.Tokens.map(token => ({
        token: token.Token,
        maskedCardNumber: token.MaskedCardNumber,
        cardBrand: token.Brand,
        lastFourDigits: token.LastFourDigits,
        expirationMonth: token.ExpirationMonth,
        expirationYear: token.ExpirationYear,
        customerId: token.CustomerId,
        createdAt: new Date(token.CreatedAt),
        isDefault: token.IsDefault || false
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
  async bindToken(request) {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to bind token');
    }
    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.BIND_TOKEN}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();
      const requestBody = {
        Token: request.token,
        CustomerId: request.customerId,
        ...(request.isDefault && {
          IsDefault: request.isDefault
        })
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout)
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
  async deleteToken(request) {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to delete token');
    }
    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.DELETE_TOKEN}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();
      const requestBody = {
        Token: request.token,
        ...(request.customerId && {
          CustomerId: request.customerId
        })
      };
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout)
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
  async validateToken(token, customerId) {
    try {
      const tokens = await this.listTokens({
        customerId
      });
      return tokens.some(t => t.token === token);
    } catch (error) {
      return false;
    }
  }
  /**
   * Gets a specific token details
   */
  async getTokenDetails(token, customerId) {
    try {
      const tokens = await this.listTokens({
        customerId
      });
      return tokens.find(t => t.token === token) || null;
    } catch (error) {
      return null;
    }
  }
  /**
   * Sets a token as the default for a customer
   */
  async setDefaultToken(token, customerId) {
    return this.bindToken({
      token,
      customerId,
      isDefault: true
    });
  }
  /**
   * Gets the default token for a customer
   */
  async getDefaultToken(customerId) {
    try {
      const tokens = await this.listTokens({
        customerId
      });
      return tokens.find(t => t.isDefault) || tokens[0] || null;
    } catch (error) {
      return null;
    }
  }
  /**
   * Masks a card number for display
   */
  maskCardNumber(cardNumber) {
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
  static createTokenizationRequest(cardNumber, cardholderName, expirationMonth, expirationYear, cvv, customerId, brand) {
    return {
      cardNumber: cardNumber.replace(/\D/g, ''),
      cardholderName: cardholderName.trim(),
      expirationMonth,
      expirationYear,
      cvv: cvv.replace(/\D/g, ''),
      customerId,
      brand
    };
  }
}

/**
 * Payment processing service for Tuna React Native SDK
 *
 * Handles payment initialization, processing, and status monitoring
 */
class PaymentManager {
  constructor(sessionManager, tokenizationManager, config) {
    this.sessionManager = sessionManager;
    this.tokenizationManager = tokenizationManager;
    this.config = {
      timeout: 30000,
      statusPollingInterval: 2000,
      maxStatusPollingAttempts: 30,
      ...config
    };
  }
  /**
   * Initializes a payment transaction
   */
  async initializePayment(request) {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required for payment processing');
    }
    // Validate payment data
    const validationErrors = validatePaymentData(request);
    if (validationErrors.length > 0) {
      throw new TunaPaymentError(`Payment validation failed: ${validationErrors[0].message}`);
    }
    try {
      // Handle token-based payments
      if (request.token) {
        return this.processTokenPayment(request);
      }
      // Handle new card payments with tokenization
      if (request.cardData) {
        return this.processNewCardPayment(request);
      }
      // Handle native payments (Apple Pay / Google Pay)
      if (request.nativePaymentData) {
        return this.processNativePayment(request);
      }
      throw new TunaPaymentError('Invalid payment method specified');
    } catch (error) {
      if (error instanceof TunaPaymentError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaPaymentError('Payment initialization failed');
    }
  }
  /**
   * Processes payment with an existing token
   */
  async processTokenPayment(request) {
    const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.INIT_PAYMENT}`;
    const sessionHeaders = this.sessionManager.getSessionHeaders();
    const requestBody = {
      Amount: request.amount,
      Currency: request.currency,
      Token: request.token,
      OrderId: request.orderId,
      CustomerId: request.customerId,
      Description: request.description,
      Installments: request.installments || 1,
      ...(request.antifraudData && {
        AntifraudData: request.antifraudData
      }),
      ...(request.metadata && {
        Metadata: request.metadata
      })
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...sessionHeaders
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout)
    });
    if (!response.ok) {
      const responseText = await response.text();
      throw handleHttpError(response, responseText);
    }
    const responseData = await response.json();
    return this.parsePaymentResponse(responseData);
  }
  /**
   * Processes payment with new card data (tokenizes first)
   */
  async processNewCardPayment(request) {
    if (!request.cardData) {
      throw new TunaPaymentError('Card data is required for new card payments');
    }
    // First, tokenize the card
    const tokenRequest = {
      cardNumber: request.cardData.number,
      cardholderName: request.cardData.holderName,
      expirationMonth: request.cardData.expirationMonth,
      expirationYear: request.cardData.expirationYear,
      cvv: request.cardData.cvv,
      customerId: request.customerId,
      brand: request.cardData.brand
    };
    const tokenResponse = await this.tokenizationManager.generateToken(tokenRequest);
    // Process payment with the new token
    const paymentRequest = {
      ...request,
      token: tokenResponse.token,
      cardData: undefined // Remove card data for security
    };
    return this.processTokenPayment(paymentRequest);
  }
  /**
   * Processes native payment (Apple Pay / Google Pay)
   */
  async processNativePayment(request) {
    const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.INIT_PAYMENT}`;
    const sessionHeaders = this.sessionManager.getSessionHeaders();
    const requestBody = {
      Amount: request.amount,
      Currency: request.currency,
      OrderId: request.orderId,
      CustomerId: request.customerId,
      Description: request.description,
      PaymentMethod: request.paymentMethod,
      NativePaymentData: request.nativePaymentData,
      ...(request.antifraudData && {
        AntifraudData: request.antifraudData
      }),
      ...(request.metadata && {
        Metadata: request.metadata
      })
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...sessionHeaders
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout)
    });
    if (!response.ok) {
      const responseText = await response.text();
      throw handleHttpError(response, responseText);
    }
    const responseData = await response.json();
    return this.parsePaymentResponse(responseData);
  }
  /**
   * Gets payment status
   */
  async getPaymentStatus(paymentId) {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to get payment status');
    }
    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.PAYMENT_STATUS}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();
      const queryParams = new URLSearchParams({
        PaymentId: paymentId
      });
      const url = `${endpoint}?${queryParams}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...sessionHeaders
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }
      const responseData = await response.json();
      return {
        paymentId,
        status: this.mapPaymentStatus(responseData.Status),
        statusMessage: responseData.StatusMessage,
        transactionId: responseData.TransactionId,
        authorizationCode: responseData.AuthorizationCode,
        receiptUrl: responseData.ReceiptUrl,
        lastUpdated: new Date(responseData.LastUpdated || Date.now()),
        amount: responseData.Amount,
        currency: responseData.Currency,
        metadata: responseData.Metadata
      };
    } catch (error) {
      if (error instanceof TunaPaymentError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaPaymentError('Failed to get payment status');
    }
  }
  /**
   * Polls payment status until completion or timeout
   */
  async pollPaymentStatus(paymentId, onStatusUpdate) {
    let attempts = 0;
    while (attempts < this.config.maxStatusPollingAttempts) {
      try {
        const status = await this.getPaymentStatus(paymentId);
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
        // Check if payment is in a final state
        if (this.isPaymentFinal(status.status)) {
          return status;
        }
        // Wait before next poll
        await this.delay(this.config.statusPollingInterval);
        attempts++;
      } catch (error) {
        attempts++;
        if (attempts >= this.config.maxStatusPollingAttempts) {
          throw error;
        }
        await this.delay(this.config.statusPollingInterval);
      }
    }
    throw new TunaPaymentError('Payment status polling timeout');
  }
  /**
   * Cancels a payment
   */
  async cancelPayment(request) {
    if (!this.sessionManager.isSessionValid()) {
      throw new TunaSessionError('Valid session required to cancel payment');
    }
    try {
      const endpoint = `${this.config.baseUrl}${TUNA_API_ENDPOINTS.PAYMENT_CANCEL}`;
      const sessionHeaders = this.sessionManager.getSessionHeaders();
      const requestBody = {
        PaymentId: request.paymentId,
        Reason: request.reason || 'User cancelled',
        ...(request.metadata && {
          Metadata: request.metadata
        })
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...sessionHeaders
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.config.timeout)
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw handleHttpError(response, responseText);
      }
      const responseData = await response.json();
      return responseData.Success === true;
    } catch (error) {
      if (error instanceof TunaPaymentError || error instanceof TunaNetworkError) {
        throw error;
      }
      throw new TunaPaymentError('Failed to cancel payment');
    }
  }
  /**
   * Validates payment configuration
   */
  validatePaymentConfig(config) {
    if (!config.amount || config.amount <= 0) {
      throw new TunaPaymentError('Valid payment amount is required');
    }
    if (!config.currency) {
      throw new TunaPaymentError('Currency is required');
    }
    if (!config.orderId) {
      throw new TunaPaymentError('Order ID is required');
    }
    return true;
  }
  /**
   * Gets supported payment methods for current session
   */
  async getSupportedPaymentMethods() {
    // This would typically come from a dedicated API endpoint
    // For now, return default supported methods
    return [{
      type: 'credit_card',
      name: 'Credit Card',
      enabled: true,
      supportedBrands: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
      maxInstallments: 12
    }, {
      type: 'debit_card',
      name: 'Debit Card',
      enabled: true,
      supportedBrands: ['visa', 'mastercard'],
      maxInstallments: 1
    }, {
      type: 'pix',
      name: 'PIX',
      enabled: true,
      qrCodeEnabled: true
    }, {
      type: 'boleto',
      name: 'Boleto',
      enabled: true,
      daysToExpire: 3
    }];
  }
  /**
   * Parses payment response from API
   */
  parsePaymentResponse(responseData) {
    return {
      paymentId: responseData.PaymentId,
      status: this.mapPaymentStatus(responseData.Status),
      statusMessage: responseData.StatusMessage,
      transactionId: responseData.TransactionId,
      authorizationCode: responseData.AuthorizationCode,
      receiptUrl: responseData.ReceiptUrl,
      threeDSData: responseData.ThreeDSData ? {
        url: responseData.ThreeDSData.Url,
        token: responseData.ThreeDSData.Token,
        paRequest: responseData.ThreeDSData.PaRequest
      } : undefined,
      qrCodeData: responseData.QrCodeData,
      boletoData: responseData.BoletoData,
      amount: responseData.Amount,
      currency: responseData.Currency,
      createdAt: new Date(responseData.CreatedAt || Date.now()),
      metadata: responseData.Metadata
    };
  }
  /**
   * Maps API status to PaymentStatus enum
   */
  mapPaymentStatus(apiStatus) {
    const statusMap = {
      'pending': 'pending',
      'processing': 'processing',
      'authorized': 'authorized',
      'captured': 'captured',
      'success': 'success',
      'failed': 'failed',
      'cancelled': 'cancelled',
      'expired': 'expired',
      'refunded': 'refunded'
    };
    return statusMap[apiStatus === null || apiStatus === void 0 ? void 0 : apiStatus.toLowerCase()] || 'pending';
  }
  /**
   * Checks if payment status is final
   */
  isPaymentFinal(status) {
    const finalStatuses = ['success', 'failed', 'cancelled', 'expired', 'refunded'];
    return finalStatuses.includes(status);
  }
  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * Updates payment manager configuration
   */
  updateConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
  }
}

/**
 * 3D Secure (3DS) Authentication Handler for Tuna React Native SDK
 *
 * This module handles 3D Secure authentication flows including:
 * - Data collection (always performed)
 * - Challenge authentication (only when required by payment response)
 */
class ThreeDSHandler {
  constructor(config = {}) {
    this.dataCollectionCompleted = false;
    this.config = {
      dataCollectionTimeout: config.dataCollectionTimeout || 10000,
      challengeTimeout: config.challengeTimeout || 300000,
      autoDataCollection: config.autoDataCollection !== false,
      ...config
    };
  }
  /**
   * Sets the WebView component reference for 3DS authentication
   * This should be called when the WebView component is available
   */
  setWebViewComponent(webViewComponent) {
    this.webViewComponent = webViewComponent;
  }
  /**
   * Performs 3DS data collection
   * This should ALWAYS be called at the beginning of any payment flow
   * to ensure device fingerprinting data is collected
   */
  async performDataCollection(setupPayerInfo) {
    try {
      if (!setupPayerInfo.deviceDataCollectionUrl || !setupPayerInfo.accessToken) {
        throw new Tuna3DSError('Missing required data collection parameters');
      }
      console.log('Starting 3DS data collection...');
      const dataCollectionInfo = {
        url: setupPayerInfo.deviceDataCollectionUrl,
        token: setupPayerInfo.accessToken,
        referenceId: setupPayerInfo.referenceId,
        transactionId: setupPayerInfo.token,
        collectionMethod: this.getDataCollectionMethod()
      };
      // Perform data collection based on platform and available components
      const result = await this.executeDataCollection(dataCollectionInfo);
      this.dataCollectionCompleted = true;
      console.log('3DS data collection completed successfully');
      return result;
    } catch (error) {
      console.error('3DS data collection failed:', error);
      throw new Tuna3DSError('Failed to perform 3DS data collection', error);
    }
  }
  /**
   * Handles 3DS challenge authentication
   * This should ONLY be called if the payment response contains threeDSInfo
   */
  async handleChallenge(threeDSInfo) {
    try {
      if (!threeDSInfo.url || !threeDSInfo.token) {
        throw new Tuna3DSError('Missing required 3DS challenge parameters');
      }
      if (!this.dataCollectionCompleted) {
        console.warn('3DS challenge initiated without data collection. This may affect authentication success.');
      }
      console.log('Starting 3DS challenge authentication...');
      // Parse challenge details from paRequest if available
      const challengeDetails = this.parseChallengeDetails(threeDSInfo);
      const result = await this.executeChallenge({
        ...threeDSInfo,
        ...challengeDetails
      });
      console.log('3DS challenge completed:', result.success ? 'successful' : 'failed');
      return result;
    } catch (error) {
      console.error('3DS challenge failed:', error);
      throw new Tuna3DSError('Failed to handle 3DS challenge', error);
    }
  }
  /**
   * Executes the data collection process
   */
  async executeDataCollection(info) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Tuna3DSError('Data collection timeout'));
      }, this.config.dataCollectionTimeout);
      try {
        if (this.webViewComponent) {
          // Use WebView for data collection
          this.performWebViewDataCollection(info, timeout, resolve, reject);
        } else {
          // Use invisible iframe approach (similar to web plugin)
          this.performIframeDataCollection(info, timeout, resolve, reject);
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }
  /**
   * Executes the 3DS challenge process
   */
  async executeChallenge(challengeInfo) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Tuna3DSError('Challenge timeout'));
      }, this.config.challengeTimeout);
      try {
        if (!this.webViewComponent) {
          throw new Tuna3DSError('WebView component is required for 3DS challenge');
        }
        this.performWebViewChallenge(challengeInfo, timeout, resolve, reject);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }
  /**
   * Performs data collection using WebView
   */
  performWebViewDataCollection(info, timeout, resolve, reject) {
    const html = this.generateDataCollectionHTML(info);
    // Create WebView source
    const source = {
      html
    };
    // Set up message handler for completion notification
    const messageHandler = event => {
      const {
        data
      } = event.nativeEvent;
      if (data === 'data-collection-complete') {
        clearTimeout(timeout);
        resolve({
          ...info,
          completed: true,
          completedAt: new Date()
        });
      }
    };
    // Load the HTML into WebView with message handler
    this.webViewComponent.postMessage = messageHandler;
    this.webViewComponent.source = source;
    // Auto-complete after a short delay (data collection is fire-and-forget)
    setTimeout(() => {
      clearTimeout(timeout);
      resolve({
        ...info,
        completed: true,
        completedAt: new Date()
      });
    }, 3000); // Allow 3 seconds for data collection
  }
  /**
   * Performs challenge using WebView
   */
  performWebViewChallenge(challengeInfo, timeout, resolve, reject) {
    const html = this.generateChallengeHTML(challengeInfo);
    // Create WebView source
    const source = {
      html
    };
    // Set up message handler for challenge completion
    const messageHandler = event => {
      const {
        data
      } = event.nativeEvent;
      try {
        const result = JSON.parse(data);
        if (result.type === '3ds-challenge-complete') {
          clearTimeout(timeout);
          resolve({
            success: result.success,
            authenticationData: result.authenticationData,
            transactionId: challengeInfo.transactionId,
            timestamp: new Date(),
            provider: challengeInfo.provider
          });
        }
      } catch (error) {
        console.warn('Failed to parse 3DS challenge result:', error);
      }
    };
    // Load the HTML into WebView with message handler
    this.webViewComponent.postMessage = messageHandler;
    this.webViewComponent.source = source;
  }
  /**
   * Fallback data collection using hidden iframe approach
   */
  performIframeDataCollection(info, timeout, resolve, reject) {
    // Note: This is a simplified approach for React Native
    // In practice, this would need native module support or WebView
    console.warn('Iframe data collection not fully supported in React Native without WebView');
    // Simulate data collection completion
    setTimeout(() => {
      clearTimeout(timeout);
      resolve({
        ...info,
        completed: true,
        completedAt: new Date()
      });
    }, 1000);
  }
  /**
   * Generates HTML for data collection iframe
   */
  generateDataCollectionHTML(info) {
    const formId = `ddc-form-${Math.random().toString(36).substring(2)}`;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>3DS Data Collection</title>
        </head>
        <body>
          <iframe 
            name="ddc-iframe" 
            height="1" 
            width="1" 
            style="display: none; position: absolute; top: -9999px;"
            onload="handleDataCollectionComplete()">
          </iframe>
          <form 
            id="${formId}" 
            target="ddc-iframe" 
            method="POST" 
            action="${info.url}">
            <input type="hidden" name="JWT" value="${info.token}" />
          </form>
          
          <script>
            // Submit form immediately
            document.getElementById('${formId}').submit();
            
            // Notify completion after short delay
            function handleDataCollectionComplete() {
              setTimeout(function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage('data-collection-complete');
                }
              }, 1000);
            }
            
            // Fallback completion notification
            setTimeout(function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('data-collection-complete');
              }
            }, 2000);
          </script>
        </body>
      </html>
    `;
  }
  /**
   * Generates HTML for 3DS challenge
   */
  generateChallengeHTML(challengeInfo) {
    const formId = `challenge-form-${Math.random().toString(36).substring(2)}`;
    const {
      width,
      height
    } = this.getChallengeWindowSize(challengeInfo);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>3DS Challenge</title>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            .challenge-container { 
              width: 100%; 
              height: 100vh; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
            }
            .challenge-frame { 
              width: ${width}px; 
              height: ${height}px; 
              border: none; 
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
          </style>
        </head>
        <body>
          <div class="challenge-container">
            <iframe 
              name="challenge-iframe" 
              class="challenge-frame"
              onload="handleChallengeResponse()">
            </iframe>
          </div>
          <form 
            id="${formId}" 
            target="challenge-iframe" 
            method="POST" 
            action="${challengeInfo.url}">
            <input type="hidden" name="JWT" value="${challengeInfo.token}" />
            ${challengeInfo.paRequest ? `<input type="hidden" name="PaReq" value="${challengeInfo.paRequest}" />` : ''}
          </form>
          
          <script>
            // Submit challenge form immediately
            document.getElementById('${formId}').submit();
            
            // Listen for challenge completion
            function handleChallengeResponse() {
              // Monitor for challenge completion or timeout
              const startTime = Date.now();
              const checkInterval = setInterval(function() {
                try {
                  const iframe = document.querySelector('iframe[name="challenge-iframe"]');
                  if (iframe && iframe.contentWindow) {
                    // Check if challenge is complete
                    // This is simplified - actual implementation would need
                    // to communicate with the 3DS server response
                    const elapsed = Date.now() - startTime;
                    if (elapsed > 30000) { // 30 second timeout
                      clearInterval(checkInterval);
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: '3ds-challenge-complete',
                          success: false,
                          error: 'Challenge timeout'
                        }));
                      }
                    }
                  }
                } catch (error) {
                  console.warn('Challenge monitoring error:', error);
                }
              }, 1000);
            }
            
            // Listen for postMessage from challenge iframe
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === '3ds-authentication-complete') {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: '3ds-challenge-complete',
                    success: event.data.success,
                    authenticationData: event.data.authenticationData
                  }));
                }
              }
            });
          </script>
        </body>
      </html>
    `;
  }
  /**
   * Parses challenge details from paRequest if available
   */
  parseChallengeDetails(threeDSInfo) {
    if (!threeDSInfo.paRequest) {
      return {};
    }
    try {
      const paRequest = JSON.parse(atob(threeDSInfo.paRequest));
      return {
        challengeWindowSize: paRequest.challengeWindowSize,
        messageVersion: paRequest.messageVersion,
        transactionId: paRequest.threeDSServerTransID
      };
    } catch (error) {
      console.warn('Failed to parse paRequest:', error);
      return {};
    }
  }
  /**
   * Gets challenge window size based on challengeWindowSize parameter
   */
  getChallengeWindowSize(challengeInfo) {
    const windowSize = challengeInfo.challengeWindowSize || '03'; // Default to medium
    switch (windowSize) {
      case '01':
        return {
          width: 250,
          height: 400
        };
      // Small
      case '02':
        return {
          width: 390,
          height: 400
        };
      // Medium
      case '03':
        return {
          width: 500,
          height: 600
        };
      // Large
      case '04':
        return {
          width: 600,
          height: 400
        };
      // Extra Large
      case '05':
        return {
          width: 100,
          height: 100
        };
      // Full screen (handled differently)
      default:
        return {
          width: 500,
          height: 600
        };
      // Default to large
    }
  }
  /**
   * Determines the best data collection method for the current environment
   */
  getDataCollectionMethod() {
    if (this.webViewComponent) {
      return 'webview';
    }
    return 'native-fallback';
  }
  /**
   * Resets the handler state
   */
  reset() {
    this.dataCollectionCompleted = false;
    this.webViewComponent = null;
  }
  /**
   * Gets the current status of 3DS processes
   */
  getStatus() {
    return {
      dataCollectionCompleted: this.dataCollectionCompleted,
      hasWebView: !!this.webViewComponent,
      config: this.config
    };
  }
}
/**
 * Creates a new 3DS handler instance
 */
function createThreeDSHandler(config) {
  return new ThreeDSHandler(config);
}

/**
 * Anti-fraud Manager for Tuna React Native SDK
 *
 * This module handles anti-fraud provider initialization and device data collection
 * for fraud prevention systems including ClearSale, SiftScience, Konduto, and CyberSource.
 */
// Optional dependency - gracefully handle if not installed
let DeviceInfo;
try {
  DeviceInfo = require('react-native-device-info');
} catch (error) {
  console.warn('react-native-device-info not available. Some device data collection features will be limited.');
  DeviceInfo = null;
}
class AntifraudManager {
  constructor(sessionId, config = {}) {
    this.providers = new Map();
    this.deviceData = null;
    this.sessionId = sessionId;
    this.config = {
      autoCollectDeviceData: config.autoCollectDeviceData !== false,
      enabledProviders: config.enabledProviders || ['clearsale', 'siftscience', 'konduto', 'cybersource'],
      timeout: config.timeout || 10000,
      ...config
    };
  }
  /**
   * Initializes anti-fraud providers with their configurations
   */
  async initializeProviders(antifraudConfigs) {
    try {
      console.log('Initializing anti-fraud providers...');
      // Process each anti-fraud configuration
      for (const config of antifraudConfigs) {
        const provider = this.getProviderFromKey(config.key);
        if (provider && this.config.enabledProviders.includes(provider)) {
          await this.initializeProvider(provider, config);
        }
      }
      // Auto-collect device data if enabled
      if (this.config.autoCollectDeviceData) {
        await this.collectDeviceData();
      }
      console.log('Anti-fraud providers initialized successfully');
    } catch (error) {
      console.error('Failed to initialize anti-fraud providers:', error);
      throw new TunaPaymentError('Anti-fraud initialization failed');
    }
  }
  /**
   * Sets the customer ID for anti-fraud tracking
   */
  setCustomerId(customerId) {
    this.customerId = customerId;
    // Update providers that need customer ID
    this.providers.forEach((providerData, provider) => {
      if (provider === 'konduto' && providerData.setCustomerID) {
        providerData.setCustomerID(customerId);
      }
    });
  }
  /**
   * Collects comprehensive device data for anti-fraud analysis
   */
  async collectDeviceData() {
    try {
      console.log('Collecting device data for anti-fraud analysis...');
      const deviceData = {
        // Basic device information
        deviceId: DeviceInfo ? await DeviceInfo.getUniqueId() : this.generateFallbackDeviceId(),
        platform: Platform.OS,
        platformVersion: Platform.Version.toString(),
        appVersion: DeviceInfo ? DeviceInfo.getVersion() : 'unknown',
        deviceModel: DeviceInfo ? await DeviceInfo.getModel() : 'unknown',
        deviceBrand: DeviceInfo ? await DeviceInfo.getBrand() : 'unknown',
        systemName: DeviceInfo ? await DeviceInfo.getSystemName() : Platform.OS,
        systemVersion: DeviceInfo ? await DeviceInfo.getSystemVersion() : Platform.Version.toString(),
        // Network information
        ipAddress: await this.getIpAddress(),
        userAgent: DeviceInfo ? await DeviceInfo.getUserAgent() : this.generateFallbackUserAgent(),
        // Screen information
        screenResolution: await this.getScreenResolution(),
        timezone: this.getTimezone(),
        locale: DeviceInfo ? await DeviceInfo.getDeviceLocale() : 'unknown',
        // Additional security data
        isEmulator: DeviceInfo ? await DeviceInfo.isEmulator() : false,
        isTablet: DeviceInfo ? await DeviceInfo.isTablet() : false,
        hasNotch: DeviceInfo ? await DeviceInfo.hasNotch() : false,
        batteryLevel: DeviceInfo ? await DeviceInfo.getBatteryLevel() : -1,
        // Session data
        sessionId: this.sessionId,
        customerId: this.customerId,
        timestamp: new Date().toISOString(),
        // Network carrier info (mobile only)
        ...(Platform.OS !== 'web' && DeviceInfo && {
          carrier: await DeviceInfo.getCarrier()
        }),
        // iOS specific
        ...(Platform.OS === 'ios' && DeviceInfo && {
          iosIdForVendor: await DeviceInfo.getIosIdForVendor()
        }),
        // Android specific
        ...(Platform.OS === 'android' && DeviceInfo && {
          androidId: await DeviceInfo.getAndroidId(),
          buildNumber: await DeviceInfo.getBuildNumber()
        })
      };
      this.deviceData = deviceData;
      console.log('Device data collection completed');
      return deviceData;
    } catch (error) {
      console.error('Failed to collect device data:', error);
      throw new TunaPaymentError('Device data collection failed');
    }
  }
  /**
   * Initializes a specific anti-fraud provider
   */
  async initializeProvider(provider, config) {
    try {
      switch (provider) {
        case 'clearsale':
          await this.initializeClearSale(config);
          break;
        case 'siftscience':
          await this.initializeSiftScience(config);
          break;
        case 'konduto':
          await this.initializeKonduto(config);
          break;
        case 'cybersource':
          await this.initializeCyberSource(config);
          break;
        default:
          console.warn(`Unknown anti-fraud provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Failed to initialize ${provider}:`, error);
      // Don't throw - allow other providers to initialize
    }
  }
  /**
   * Initializes ClearSale anti-fraud
   */
  async initializeClearSale(config) {
    try {
      // Note: In React Native, we would need a native module or WebView
      // to properly initialize ClearSale. This is a simplified implementation.
      const clearSaleData = {
        appKey: config.value,
        sessionId: this.sessionId,
        initialized: true,
        timestamp: new Date()
      };
      this.providers.set('clearsale', clearSaleData);
      console.log('ClearSale initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('ClearSale initialization failed');
    }
  }
  /**
   * Initializes SiftScience anti-fraud
   */
  async initializeSiftScience(config) {
    try {
      // SiftScience integration for React Native
      const siftData = {
        accountKey: config.value,
        sessionId: this.sessionId,
        userId: this.customerId,
        initialized: true,
        timestamp: new Date()
      };
      this.providers.set('siftscience', siftData);
      console.log('SiftScience initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('SiftScience initialization failed');
    }
  }
  /**
   * Initializes Konduto anti-fraud
   */
  async initializeKonduto(config) {
    try {
      // Konduto integration for React Native
      const kondutoData = {
        publicKey: config.value,
        customerId: this.customerId,
        initialized: true,
        timestamp: new Date(),
        setCustomerID: customerId => {
          kondutoData.customerId = customerId;
        }
      };
      this.providers.set('konduto', kondutoData);
      console.log('Konduto initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('Konduto initialization failed');
    }
  }
  /**
   * Initializes CyberSource anti-fraud
   */
  async initializeCyberSource(config) {
    try {
      // CyberSource Device Fingerprinting
      const cybersourceData = {
        orgId: this.extractOrgId(config.value),
        sessionId: `${config.value}${this.sessionId}`,
        initialized: true,
        timestamp: new Date()
      };
      this.providers.set('cybersource', cybersourceData);
      console.log('CyberSource initialized successfully');
    } catch (error) {
      throw new TunaPaymentError('CyberSource initialization failed');
    }
  }
  /**
   * Gets the provider type from configuration key
   */
  getProviderFromKey(key) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('clearsale')) return 'clearsale';
    if (keyLower.includes('sift')) return 'siftscience';
    if (keyLower.includes('konduto')) return 'konduto';
    if (keyLower.includes('cyber')) return 'cybersource';
    return null;
  }
  /**
   * Extracts org ID from CyberSource configuration
   */
  extractOrgId(value) {
    // CyberSource key format typically includes org ID
    // This is a simplified extraction - adjust based on actual key format
    return value.split('_')[0] || value;
  }
  /**
   * Gets device IP address (simplified for React Native)
   */
  async getIpAddress() {
    try {
      // In React Native, IP address detection is limited
      // This would typically require a network request to a service
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }
  /**
   * Gets screen resolution information
   */
  async getScreenResolution() {
    try {
      const {
        Dimensions
      } = require('react-native');
      const {
        width,
        height
      } = Dimensions.get('screen');
      return `${width}x${height}`;
    } catch (error) {
      return 'unknown';
    }
  }
  /**
   * Gets device timezone
   */
  getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      return 'unknown';
    }
  }
  /**
   * Generates a fallback device ID when DeviceInfo is not available
   */
  generateFallbackDeviceId() {
    // Generate a pseudo-unique ID based on available information
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${Platform.OS}-${timestamp}-${random}`;
  }
  /**
   * Generates a fallback user agent when DeviceInfo is not available
   */
  generateFallbackUserAgent() {
    const platform = Platform.OS;
    const version = Platform.Version;
    return `ReactNative/${platform}/${version}`;
  }
  /**
   * Gets anti-fraud results for payment processing
   */
  getAntifraudResults() {
    const results = [];
    this.providers.forEach((data, provider) => {
      results.push({
        provider,
        sessionId: this.sessionId,
        customerId: this.customerId,
        deviceFingerprint: this.generateFingerprint(provider, data),
        timestamp: new Date(),
        metadata: {
          ...data,
          deviceData: this.deviceData
        }
      });
    });
    return results;
  }
  /**
   * Generates device fingerprint for a specific provider
   */
  generateFingerprint(provider, data) {
    var _a;
    // Generate a provider-specific fingerprint
    const baseData = {
      provider,
      sessionId: this.sessionId,
      timestamp: data.timestamp,
      deviceId: (_a = this.deviceData) === null || _a === void 0 ? void 0 : _a.deviceId
    };
    return Buffer.from(JSON.stringify(baseData)).toString('base64');
  }
  /**
   * Gets the current device data
   */
  getDeviceData() {
    return this.deviceData;
  }
  /**
   * Gets initialized providers
   */
  getInitializedProviders() {
    return Array.from(this.providers.keys());
  }
  /**
   * Checks if a specific provider is initialized
   */
  isProviderInitialized(provider) {
    return this.providers.has(provider);
  }
  /**
   * Gets debug information about anti-fraud state
   */
  getDebugInfo() {
    return {
      sessionId: this.sessionId,
      customerId: this.customerId,
      initializedProviders: this.getInitializedProviders(),
      deviceDataCollected: !!this.deviceData,
      config: this.config,
      providerData: Object.fromEntries(this.providers)
    };
  }
  /**
   * Resets anti-fraud state
   */
  reset() {
    this.providers.clear();
    this.deviceData = null;
    this.customerId = undefined;
  }
}
/**
 * Creates a new anti-fraud manager instance
 */
function createAntifraudManager(sessionId, config) {
  return new AntifraudManager(sessionId, config);
}

/**
 * Status Poller for Tuna React Native SDK
 *
 * This module handles long polling for payment status updates,
 * providing real-time payment status tracking.
 */
class StatusPoller {
  constructor(baseUrl, sessionId, config = {}) {
    this.sessions = new Map();
    this.intervals = new Map();
    this.baseUrl = baseUrl;
    this.sessionId = sessionId;
    this.config = {
      maxRetries: config.maxRetries || 30,
      retryInterval: config.retryInterval || 2000,
      timeout: config.timeout || 600000,
      // 10 minutes
      backoffMultiplier: config.backoffMultiplier || 1.2,
      maxBackoffInterval: config.maxBackoffInterval || 10000,
      ...config
    };
  }
  /**
   * Starts polling for payment status
   */
  async startPolling(methodId, paymentKey, callback, config) {
    const sessionId = this.generateSessionId();
    const mergedConfig = {
      ...this.config,
      ...config
    };
    try {
      console.log(`Starting status polling for payment ${methodId}/${paymentKey}`);
      // Create polling session
      const session = {
        id: sessionId,
        methodId,
        paymentKey,
        startTime: new Date(),
        lastUpdate: new Date(),
        retryCount: 0,
        status: 'pending',
        isActive: true
      };
      this.sessions.set(sessionId, session);
      // Start polling with exponential backoff
      this.scheduleNextPoll(sessionId, callback, mergedConfig, mergedConfig.retryInterval);
      return sessionId;
    } catch (error) {
      console.error('Failed to start status polling:', error);
      throw new TunaPaymentError('Status polling initialization failed');
    }
  }
  /**
   * Stops polling for a specific session
   */
  stopPolling(sessionId) {
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
  stopAllPolling() {
    const sessionIds = Array.from(this.sessions.keys());
    sessionIds.forEach(sessionId => this.stopPolling(sessionId));
  }
  /**
   * Gets the current status of a polling session
   */
  getPollingStatus(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
  /**
   * Gets all active polling sessions
   */
  getActiveSessions() {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }
  /**
   * Performs a single status check
   */
  async checkStatus(methodId, paymentKey) {
    try {
      const url = `${this.baseUrl}${ENDPOINTS.PAYMENT_STATUS}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionId}`
        },
        body: JSON.stringify({
          methodId,
          paymentKey,
          sessionId: this.sessionId
        })
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
  scheduleNextPoll(sessionId, callback, config, interval) {
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
  async performPoll(sessionId, callback, config) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return;
    }
    try {
      // Check if timeout exceeded
      const elapsed = Date.now() - session.startTime.getTime();
      if (elapsed > config.timeout) {
        this.handleTimeout(sessionId, callback);
        return;
      }
      // Check if max retries exceeded
      if (session.retryCount >= config.maxRetries) {
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
      const nextInterval = Math.min(config.retryInterval * Math.pow(config.backoffMultiplier, session.retryCount), config.maxBackoffInterval);
      this.scheduleNextPoll(sessionId, callback, config, nextInterval);
      // Notify callback of status update
      callback({
        status: statusResponse.status,
        statusMessage: statusResponse.statusMessage,
        retryCount: session.retryCount,
        elapsed: Date.now() - session.startTime.getTime(),
        isComplete: false,
        response: statusResponse
      });
    } catch (error) {
      session.retryCount++;
      this.handlePollingError(sessionId, callback, error);
    }
  }
  /**
   * Handles polling errors
   */
  handlePollingError(sessionId, callback, error) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    console.error(`Polling error for session ${sessionId}:`, error);
    callback({
      status: 'failed',
      statusMessage: 'Polling error occurred',
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      error: error instanceof TunaPaymentError ? error : new TunaPaymentError(String(error))
    });
    this.stopPolling(sessionId);
  }
  /**
   * Handles timeout scenarios
   */
  handleTimeout(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    console.warn(`Polling timeout for session ${sessionId}`);
    callback({
      status: 'failed',
      statusMessage: 'Payment status polling timeout',
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      error: new TunaPaymentError('Status polling timeout')
    });
    this.stopPolling(sessionId);
  }
  /**
   * Handles max retries exceeded
   */
  handleMaxRetriesExceeded(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    console.warn(`Max retries exceeded for session ${sessionId}`);
    callback({
      status: 'failed',
      statusMessage: 'Maximum polling retries exceeded',
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      error: new TunaPaymentError('Maximum polling retries exceeded')
    });
    this.stopPolling(sessionId);
  }
  /**
   * Handles completed payment
   */
  handleCompletedPayment(sessionId, callback, response) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    console.log(`Payment completed for session ${sessionId}: ${response.status}`);
    callback({
      status: response.status,
      statusMessage: response.statusMessage,
      retryCount: session.retryCount,
      elapsed: Date.now() - session.startTime.getTime(),
      isComplete: true,
      response
    });
    this.stopPolling(sessionId);
  }
  /**
   * Checks if a status is terminal (no more polling needed)
   */
  isTerminalStatus(status) {
    return ['success', 'failed', 'cancelled', 'expired', 'refunded'].includes(status);
  }
  /**
   * Parses the status response from the API
   */
  parseStatusResponse(data) {
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
      metadata: data.metadata || {}
    };
  }
  /**
   * Generates a unique session ID
   */
  generateSessionId() {
    return `poll_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
  /**
   * Gets debug information
   */
  getDebugInfo() {
    return {
      config: this.config,
      activeSessions: this.getActiveSessions().length,
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values())
    };
  }
  /**
   * Cleanup method to stop all polling and clear resources
   */
  destroy() {
    this.stopAllPolling();
    this.sessions.clear();
    this.intervals.clear();
  }
}
/**
 * Creates a new status poller instance
 */
function createStatusPoller(baseUrl, sessionId, config) {
  return new StatusPoller(baseUrl, sessionId, config);
}

/**
 * Base adapter for React Native Payments integration with Tuna
 *
 * This adapter bridges @rnw-community/react-native-payments with Tuna's payment infrastructure
 */
class ReactNativePaymentsAdapter {
  constructor(sessionManager, tokenizationManager, paymentManager, config) {
    this.supportedMethods = new Set();
    this.sessionManager = sessionManager;
    this.tokenizationManager = tokenizationManager;
    this.paymentManager = paymentManager;
    this.config = config;
  }
  /**
   * Initializes the adapter and checks for native payment capabilities
   */
  async initialize() {
    try {
      // Check which payment methods are available
      await this.checkNativePaymentCapabilities();
    } catch (error) {
      throw new TunaNativePaymentError('Failed to initialize native payments adapter');
    }
  }
  /**
   * Checks what native payment capabilities are available
   */
  async checkNativePaymentCapabilities() {
    this.supportedMethods.clear();
    try {
      // We'll implement Apple Pay and Google Pay checks in their respective adapters
      // For now, we'll assume basic capability checking
      const {
        Platform
      } = require('react-native');
      if (Platform.OS === 'ios') {
        // Apple Pay might be available
        this.supportedMethods.add('apple-pay');
      } else if (Platform.OS === 'android') {
        // Google Pay might be available
        this.supportedMethods.add('google-pay');
      }
      // Credit cards are always supported through tokenization
      this.supportedMethods.add('credit-card');
    } catch (error) {
      // React Native might not be available in test environment
      console.warn('Platform detection failed, assuming test environment');
    }
  }
  /**
   * Converts Tuna payment configuration to React Native Payments format
   */
  createPaymentRequest(paymentDetails, methodConfig) {
    const methodData = [];
    // Add supported payment methods based on configuration
    if (methodConfig.applePay && this.supportedMethods.has('apple-pay')) {
      methodData.push({
        supportedMethods: ['apple-pay'],
        data: {
          merchantIdentifier: methodConfig.applePay.merchantIdentifier,
          supportedNetworks: methodConfig.applePay.supportedNetworks,
          countryCode: methodConfig.applePay.countryCode,
          currencyCode: methodConfig.applePay.currencyCode,
          requestBillingAddress: methodConfig.applePay.requestBillingAddress,
          requestPayerEmail: methodConfig.applePay.requestPayerEmail,
          requestShipping: methodConfig.applePay.requestShipping
        }
      });
    }
    if (methodConfig.googlePay && this.supportedMethods.has('google-pay')) {
      methodData.push({
        supportedMethods: ['google-pay'],
        data: {
          environment: methodConfig.googlePay.environment,
          apiVersion: methodConfig.googlePay.apiVersion || 2,
          apiVersionMinor: methodConfig.googlePay.apiVersionMinor || 0,
          merchantInfo: methodConfig.googlePay.merchantInfo,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: methodConfig.googlePay.allowedAuthMethods,
              allowedCardNetworks: methodConfig.googlePay.allowedCardNetworks,
              billingAddressRequired: methodConfig.googlePay.billingAddressRequired,
              billingAddressParameters: methodConfig.googlePay.billingAddressParameters
            },
            tokenizationSpecification: methodConfig.googlePay.tokenizationSpecification
          }],
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: paymentDetails.total.amount.value,
            currencyCode: methodConfig.googlePay.currencyCode || paymentDetails.total.amount.currency
          },
          shippingAddressRequired: methodConfig.googlePay.shippingAddressRequired,
          shippingAddressParameters: methodConfig.googlePay.shippingAddressParameters,
          emailRequired: methodConfig.googlePay.emailRequired
        }
      });
    }
    return new PaymentRequest(methodData, {
      id: paymentDetails.id || `tuna-${Date.now()}`,
      displayItems: paymentDetails.displayItems,
      total: paymentDetails.total,
      ...(paymentDetails.shippingOptions && {
        shippingOptions: paymentDetails.shippingOptions
      })
    });
  }
  /**
   * Processes a native payment response and converts it to Tuna payment
   */
  async processNativePaymentResponse(paymentResponse, originalDetails) {
    try {
      if (!this.sessionManager.isSessionValid()) {
        throw new TunaPaymentError('Valid session required for payment processing');
      }
      // Extract payment method and token from the response
      const {
        methodName,
        details
      } = paymentResponse;
      let tunaPaymentRequest;
      switch (methodName) {
        case 'apple-pay':
          tunaPaymentRequest = await this.processApplePayResponse(details, originalDetails);
          break;
        case 'google-pay':
          tunaPaymentRequest = await this.processGooglePayResponse(details, originalDetails);
          break;
        default:
          throw new TunaNativePaymentError(`Unsupported payment method: ${methodName}`);
      }
      // Process payment through Tuna's payment manager
      const result = await this.paymentManager.initializePayment(tunaPaymentRequest);
      // Complete the payment response
      await paymentResponse.complete('success');
      return result;
    } catch (error) {
      // Complete the payment response with failure
      try {
        await paymentResponse.complete('fail');
      } catch (completeError) {
        console.warn('Failed to complete payment response:', completeError);
      }
      if (error instanceof TunaPaymentError || error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to process native payment response');
    }
  }
  /**
   * Processes Apple Pay payment response
   */
  async processApplePayResponse(details, originalDetails) {
    return {
      amount: parseFloat(originalDetails.total.amount.value),
      currency: originalDetails.total.amount.currency,
      orderId: originalDetails.id || `apple-pay-${Date.now()}`,
      paymentMethod: 'apple_pay',
      nativePaymentData: {
        paymentToken: details.paymentToken,
        paymentMethod: details.paymentMethod,
        transactionIdentifier: details.transactionIdentifier,
        billingContact: details.billingContact,
        shippingContact: details.shippingContact
      },
      metadata: {
        source: 'apple-pay',
        platform: 'ios'
      }
    };
  }
  /**
   * Processes Google Pay payment response
   */
  async processGooglePayResponse(details, originalDetails) {
    return {
      amount: parseFloat(originalDetails.total.amount.value),
      currency: originalDetails.total.amount.currency,
      orderId: originalDetails.id || `google-pay-${Date.now()}`,
      paymentMethod: 'google_pay',
      nativePaymentData: {
        paymentToken: details.paymentToken,
        paymentMethodData: details.paymentMethodData,
        shippingAddress: details.shippingAddress,
        payerEmail: details.payerEmail
      },
      metadata: {
        source: 'google-pay',
        platform: 'android'
      }
    };
  }
  /**
   * Shows the native payment sheet
   */
  async showPaymentSheet(paymentDetails, methodConfig) {
    try {
      const paymentRequest = this.createPaymentRequest(paymentDetails, methodConfig);
      // Check if payment can be made
      const canMakePayment = await paymentRequest.canMakePayment();
      if (!canMakePayment) {
        throw new TunaNativePaymentError('No supported payment methods available');
      }
      // Show the payment sheet
      const paymentResponse = await paymentRequest.show();
      // Process the response
      return await this.processNativePaymentResponse(paymentResponse, paymentDetails);
    } catch (error) {
      if (error instanceof TunaNativePaymentError || error instanceof TunaPaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to show payment sheet');
    }
  }
  /**
   * Checks if the specified payment method is supported
   */
  isPaymentMethodSupported(method) {
    return this.supportedMethods.has(method);
  }
  /**
   * Gets all supported payment methods
   */
  getSupportedPaymentMethods() {
    return Array.from(this.supportedMethods);
  }
  /**
   * Validates payment method configuration
   */
  validatePaymentMethodConfig(methodConfig) {
    var _a, _b, _c, _d;
    const {
      Platform
    } = require('react-native');
    // Validate Apple Pay configuration on iOS
    if (Platform.OS === 'ios' && methodConfig.applePay) {
      if (!methodConfig.applePay.merchantIdentifier) {
        throw new TunaPaymentError('Apple Pay merchant identifier is required');
      }
      if (!((_a = methodConfig.applePay.supportedNetworks) === null || _a === void 0 ? void 0 : _a.length)) {
        throw new TunaPaymentError('Apple Pay supported networks are required');
      }
    }
    // Validate Google Pay configuration on Android
    if (Platform.OS === 'android' && methodConfig.googlePay) {
      if (!((_b = methodConfig.googlePay.merchantInfo) === null || _b === void 0 ? void 0 : _b.merchantName)) {
        throw new TunaPaymentError('Google Pay merchant name is required');
      }
      if (!((_c = methodConfig.googlePay.allowedCardNetworks) === null || _c === void 0 ? void 0 : _c.length)) {
        throw new TunaPaymentError('Google Pay allowed card networks are required');
      }
      if (!((_d = methodConfig.googlePay.tokenizationSpecification) === null || _d === void 0 ? void 0 : _d.parameters)) {
        throw new TunaPaymentError('Google Pay tokenization specification is required');
      }
    }
    return true;
  }
  /**
   * Updates the adapter configuration
   */
  updateConfig(config) {
    this.config = {
      ...this.config,
      ...config
    };
  }
  /**
   * Cleans up adapter resources
   */
  destroy() {
    this.supportedMethods.clear();
  }
}

/**
 * Apple Pay adapter for Tuna React Native SDK
 *
 * Provides Apple Pay integration using @rnw-community/react-native-payments
 */
class ApplePayAdapter {
  constructor(baseAdapter) {
    this.baseAdapter = baseAdapter;
  }
  /**
   * Checks if Apple Pay is available on the device
   */
  async canMakePayments() {
    try {
      const {
        Platform
      } = require('react-native');
      // Apple Pay is only available on iOS
      if (Platform.OS !== 'ios') {
        return false;
      }
      // Check if Apple Pay is supported and configured
      if (!this.config) {
        return false;
      }
      // Create a minimal payment request to test capability
      const testMethodData = [{
        supportedMethods: ['apple-pay'],
        data: {
          merchantIdentifier: this.config.merchantIdentifier,
          supportedNetworks: this.config.supportedNetworks,
          // Type conversion for library compatibility
          countryCode: this.config.countryCode,
          currencyCode: this.config.currencyCode
        }
      }];
      const testDetails = {
        total: {
          label: 'Test',
          amount: {
            currency: this.config.currencyCode,
            value: '0.01'
          }
        }
      };
      const paymentRequest = new PaymentRequest(testMethodData, testDetails);
      return await paymentRequest.canMakePayment();
    } catch (error) {
      console.warn('Apple Pay capability check failed:', error);
      return false;
    }
  }
  /**
   * Initializes Apple Pay with the provided configuration
   */
  async setup(config) {
    try {
      const {
        Platform
      } = require('react-native');
      if (Platform.OS !== 'ios') {
        throw new TunaNativePaymentError('Apple Pay is only available on iOS');
      }
      // Validate configuration
      this.validateApplePayConfig(config);
      this.config = config;
      // Test if Apple Pay can be configured with these settings
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Apple Pay cannot be configured with the provided settings');
      }
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to setup Apple Pay');
    }
  }
  /**
   * Shows the Apple Pay payment sheet
   */
  async showPaymentSheet(paymentDetails) {
    var _a;
    try {
      if (!this.config) {
        throw new TunaNativePaymentError('Apple Pay must be configured before showing payment sheet');
      }
      // Check if Apple Pay is available
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Apple Pay is not available');
      }
      // Create Apple Pay specific payment request
      const methodData = [{
        supportedMethods: ['apple-pay'],
        data: {
          merchantIdentifier: this.config.merchantIdentifier,
          supportedNetworks: this.config.supportedNetworks,
          // Type conversion for library compatibility
          countryCode: this.config.countryCode,
          currencyCode: this.config.currencyCode,
          requestBillingAddress: this.config.requestBillingAddress,
          requestPayerEmail: this.config.requestPayerEmail,
          requestShipping: this.config.requestShipping
        }
      }];
      const details = {
        id: paymentDetails.id || `apple-pay-${Date.now()}`,
        displayItems: paymentDetails.displayItems,
        total: paymentDetails.total,
        shippingOptions: paymentDetails.shippingOptions
      };
      const paymentRequest = new PaymentRequest(methodData, details);
      // Show Apple Pay sheet
      const paymentResponse = await paymentRequest.show();
      // Process the response through the base adapter
      const result = await this.baseAdapter.processNativePaymentResponse(paymentResponse, paymentDetails);
      return {
        ...result,
        applePayToken: (_a = paymentResponse.details) === null || _a === void 0 ? void 0 : _a.paymentToken,
        success: result.status === 'success'
      };
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to show Apple Pay payment sheet');
    }
  }
  /**
   * Validates Apple Pay configuration
   */
  validateApplePayConfig(config) {
    if (!config.merchantIdentifier) {
      throw new TunaNativePaymentError('Apple Pay merchant identifier is required');
    }
    if (!config.supportedNetworks || config.supportedNetworks.length === 0) {
      throw new TunaNativePaymentError('Apple Pay supported networks are required');
    }
    if (!config.countryCode) {
      throw new TunaNativePaymentError('Apple Pay country code is required');
    }
    if (!config.currencyCode) {
      throw new TunaNativePaymentError('Apple Pay currency code is required');
    }
    // Validate supported networks
    const validNetworks = ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay'];
    for (const network of config.supportedNetworks) {
      if (!validNetworks.includes(network.toLowerCase())) {
        throw new TunaNativePaymentError(`Unsupported Apple Pay network: ${network}`);
      }
    }
    // Validate currency code format (should be 3-letter ISO code)
    if (!/^[A-Z]{3}$/.test(config.currencyCode)) {
      throw new TunaNativePaymentError('Apple Pay currency code must be a 3-letter ISO code');
    }
    // Validate country code format (should be 2-letter ISO code)
    if (!/^[A-Z]{2}$/.test(config.countryCode)) {
      throw new TunaNativePaymentError('Apple Pay country code must be a 2-letter ISO code');
    }
  }
  /**
   * Gets the current Apple Pay configuration
   */
  getConfig() {
    return this.config;
  }
  /**
   * Checks if Apple Pay is properly configured
   */
  isConfigured() {
    return !!this.config;
  }
  /**
   * Resets the Apple Pay configuration
   */
  reset() {
    this.config = undefined;
  }
  /**
   * Gets Apple Pay capabilities for the current configuration
   */
  async getCapabilities() {
    var _a, _b;
    const canMakePayments = await this.canMakePayments();
    return {
      canMakePayments,
      supportedNetworks: ((_a = this.config) === null || _a === void 0 ? void 0 : _a.supportedNetworks) || [],
      merchantIdentifier: (_b = this.config) === null || _b === void 0 ? void 0 : _b.merchantIdentifier
    };
  }
  /**
   * Creates a formatted Apple Pay configuration for debugging
   */
  getDebugInfo() {
    return {
      configured: this.isConfigured(),
      config: this.config ? {
        merchantIdentifier: this.config.merchantIdentifier,
        supportedNetworks: this.config.supportedNetworks,
        countryCode: this.config.countryCode,
        currencyCode: this.config.currencyCode,
        requestBillingAddress: this.config.requestBillingAddress,
        requestPayerEmail: this.config.requestPayerEmail,
        requestShipping: this.config.requestShipping
      } : null
    };
  }
}
/**
 * Creates a new Apple Pay adapter instance
 */
function createApplePayAdapter(baseAdapter) {
  return new ApplePayAdapter(baseAdapter);
}

/**
 * Google Pay adapter for Tuna React Native SDK
 *
 * Provides Google Pay integration using @rnw-community/react-native-payments
 */
class GooglePayAdapter {
  constructor(baseAdapter) {
    this.baseAdapter = baseAdapter;
  }
  /**
   * Checks if Google Pay is available on the device
   */
  async canMakePayments() {
    try {
      const {
        Platform
      } = require('react-native');
      // Google Pay is only available on Android
      if (Platform.OS !== 'android') {
        return false;
      }
      // Check if Google Pay is configured
      if (!this.config) {
        return false;
      }
      // Create a minimal payment request to test capability
      const testMethodData = [{
        supportedMethods: ['google-pay'],
        data: {
          environment: this.config.environment,
          apiVersion: this.config.apiVersion,
          apiVersionMinor: this.config.apiVersionMinor,
          merchantInfo: {
            merchantName: this.config.merchantInfo.merchantName,
            merchantId: this.config.merchantInfo.merchantId
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: this.config.allowedAuthMethods,
              allowedCardNetworks: this.config.allowedCardNetworks // Type conversion
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: this.config.tokenizationSpecification.parameters
            }
          }]
        }
      }];
      const testDetails = {
        total: {
          label: 'Test',
          amount: {
            currency: this.config.currencyCode || 'USD',
            value: '0.01'
          }
        }
      };
      const paymentRequest = new PaymentRequest(testMethodData, testDetails);
      return await paymentRequest.canMakePayment();
    } catch (error) {
      console.warn('Google Pay capability check failed:', error);
      return false;
    }
  }
  /**
   * Initializes Google Pay with the provided configuration
   */
  async setup(config) {
    try {
      const {
        Platform
      } = require('react-native');
      if (Platform.OS !== 'android') {
        throw new TunaNativePaymentError('Google Pay is only available on Android');
      }
      // Validate configuration
      this.validateGooglePayConfig(config);
      this.config = config;
      // Test if Google Pay can be configured with these settings
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Google Pay cannot be configured with the provided settings');
      }
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to setup Google Pay');
    }
  }
  /**
   * Shows the Google Pay payment sheet
   */
  async showPaymentSheet(paymentDetails) {
    var _a, _b, _c;
    try {
      if (!this.config) {
        throw new TunaNativePaymentError('Google Pay must be configured before showing payment sheet');
      }
      // Check if Google Pay is available
      const canMake = await this.canMakePayments();
      if (!canMake) {
        throw new TunaNativePaymentError('Google Pay is not available');
      }
      // Create Google Pay specific payment request
      const methodData = [{
        supportedMethods: ['google-pay'],
        data: {
          environment: this.config.environment,
          apiVersion: this.config.apiVersion,
          apiVersionMinor: this.config.apiVersionMinor,
          merchantInfo: {
            merchantName: this.config.merchantInfo.merchantName,
            merchantId: this.config.merchantInfo.merchantId
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: this.config.allowedAuthMethods,
              allowedCardNetworks: this.config.allowedCardNetworks,
              // Type conversion
              billingAddressRequired: this.config.billingAddressRequired,
              billingAddressParameters: this.config.billingAddressParameters
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: this.config.tokenizationSpecification.parameters
            }
          }],
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: paymentDetails.total.amount.value,
            currencyCode: this.config.currencyCode || paymentDetails.total.amount.currency
          },
          shippingAddressRequired: this.config.shippingAddressRequired,
          shippingAddressParameters: this.config.shippingAddressParameters,
          emailRequired: this.config.emailRequired
        }
      }];
      const details = {
        id: paymentDetails.id || `google-pay-${Date.now()}`,
        displayItems: paymentDetails.displayItems,
        total: paymentDetails.total,
        shippingOptions: paymentDetails.shippingOptions
      };
      const paymentRequest = new PaymentRequest(methodData, details);
      // Show Google Pay sheet
      const paymentResponse = await paymentRequest.show();
      // Process the response through the base adapter
      const result = await this.baseAdapter.processNativePaymentResponse(paymentResponse, paymentDetails);
      return {
        ...result,
        googlePayToken: (_c = (_b = (_a = paymentResponse.details) === null || _a === void 0 ? void 0 : _a.paymentMethodData) === null || _b === void 0 ? void 0 : _b.tokenizationData) === null || _c === void 0 ? void 0 : _c.token,
        success: result.status === 'success'
      };
    } catch (error) {
      if (error instanceof TunaNativePaymentError) {
        throw error;
      }
      throw new TunaNativePaymentError('Failed to show Google Pay payment sheet');
    }
  }
  /**
   * Validates Google Pay configuration
   */
  validateGooglePayConfig(config) {
    if (!config.environment) {
      throw new TunaNativePaymentError('Google Pay environment is required');
    }
    if (!['TEST', 'PRODUCTION'].includes(config.environment)) {
      throw new TunaNativePaymentError('Google Pay environment must be TEST or PRODUCTION');
    }
    if (!config.merchantInfo) {
      throw new TunaNativePaymentError('Google Pay merchant info is required');
    }
    if (!config.merchantInfo.merchantName) {
      throw new TunaNativePaymentError('Google Pay merchant name is required');
    }
    if (!config.allowedAuthMethods || config.allowedAuthMethods.length === 0) {
      throw new TunaNativePaymentError('Google Pay allowed auth methods are required');
    }
    if (!config.allowedCardNetworks || config.allowedCardNetworks.length === 0) {
      throw new TunaNativePaymentError('Google Pay allowed card networks are required');
    }
    if (!config.tokenizationSpecification) {
      throw new TunaNativePaymentError('Google Pay tokenization specification is required');
    }
    if (!config.tokenizationSpecification.parameters) {
      throw new TunaNativePaymentError('Google Pay tokenization parameters are required');
    }
    // Validate auth methods
    const validAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
    for (const method of config.allowedAuthMethods) {
      if (!validAuthMethods.includes(method)) {
        throw new TunaNativePaymentError(`Invalid Google Pay auth method: ${method}`);
      }
    }
    // Validate card networks
    const validNetworks = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
    for (const network of config.allowedCardNetworks) {
      if (!validNetworks.includes(network.toUpperCase())) {
        throw new TunaNativePaymentError(`Invalid Google Pay card network: ${network}`);
      }
    }
    // Validate API version
    if (typeof config.apiVersion !== 'number' || config.apiVersion < 1) {
      throw new TunaNativePaymentError('Google Pay API version must be a positive number');
    }
    if (typeof config.apiVersionMinor !== 'number' || config.apiVersionMinor < 0) {
      throw new TunaNativePaymentError('Google Pay API version minor must be a non-negative number');
    }
  }
  /**
   * Gets the current Google Pay configuration
   */
  getConfig() {
    return this.config;
  }
  /**
   * Checks if Google Pay is properly configured
   */
  isConfigured() {
    return !!this.config;
  }
  /**
   * Resets the Google Pay configuration
   */
  reset() {
    this.config = undefined;
  }
  /**
   * Gets Google Pay capabilities for the current configuration
   */
  async getCapabilities() {
    var _a, _b;
    const canMakePayments = await this.canMakePayments();
    return {
      canMakePayments,
      allowedCardNetworks: ((_a = this.config) === null || _a === void 0 ? void 0 : _a.allowedCardNetworks) || [],
      environment: (_b = this.config) === null || _b === void 0 ? void 0 : _b.environment
    };
  }
  /**
   * Creates a formatted Google Pay configuration for debugging
   */
  getDebugInfo() {
    return {
      configured: this.isConfigured(),
      config: this.config ? {
        environment: this.config.environment,
        apiVersion: this.config.apiVersion,
        apiVersionMinor: this.config.apiVersionMinor,
        merchantInfo: this.config.merchantInfo,
        allowedAuthMethods: this.config.allowedAuthMethods,
        allowedCardNetworks: this.config.allowedCardNetworks,
        billingAddressRequired: this.config.billingAddressRequired,
        shippingAddressRequired: this.config.shippingAddressRequired,
        emailRequired: this.config.emailRequired,
        currencyCode: this.config.currencyCode
      } : null
    };
  }
}
/**
 * Creates a new Google Pay adapter instance
 */
function createGooglePayAdapter(baseAdapter) {
  return new GooglePayAdapter(baseAdapter);
}

/**
 * Main TunaReactNative SDK Class (Simplified Implementation)
 *
 * This is a simplified implementation of the main SDK class that works with
 * the existing core components. It provides the basic unified interface
 * while adapting to the current implementation constraints.
 */
/**
 * Main TunaReactNative SDK Class
 *
 * This class provides a unified interface for payment operations.
 * It's designed to be simple and extensible for Phase 5.
 */
class TunaReactNative {
  constructor(config) {
    this.isInitialized = false;
    this.config = config;
  }
  /**
   * Initialize the SDK with a session
   */
  async initialize(sessionId) {
    try {
      this.currentSessionId = sessionId;
      this.isInitialized = true;
    } catch (error) {
      throw new TunaPaymentError('Failed to initialize TunaReactNative SDK: ' + (error instanceof Error ? error.message : String(error)), error);
    }
  }
  /**
   * Check if the SDK is initialized
   */
  isReady() {
    return this.isInitialized && !!this.currentSessionId;
  }
  // ===========================================
  // APPLE PAY METHODS
  // ===========================================
  /**
   * Check if Apple Pay is available on this device
   */
  async canMakeApplePayPayments() {
    if (Platform.OS !== 'ios') {
      return false;
    }
    try {
      // For now, return a basic platform check
      // This would be enhanced with actual Apple Pay availability check
      return true;
    } catch (error) {
      if (this.config.debug) {
        console.warn('Apple Pay availability check failed:', error);
      }
      return false;
    }
  }
  /**
   * Setup Apple Pay configuration
   */
  async setupApplePay(config) {
    this.ensureInitialized();
    if (Platform.OS !== 'ios') {
      throw new TunaPaymentError('Apple Pay is only available on iOS');
    }
    try {
      // Store Apple Pay configuration
      // This would be enhanced to actually configure the adapter
      if (this.config.debug) {
        console.log('Apple Pay configured:', config);
      }
    } catch (error) {
      throw new TunaPaymentError('Failed to setup Apple Pay: ' + (error instanceof Error ? error.message : String(error)), error);
    }
  }
  /**
   * Show Apple Pay payment sheet
   */
  async showApplePaySheet(paymentDetails) {
    this.ensureInitialized();
    if (Platform.OS !== 'ios') {
      throw new TunaPaymentError('Apple Pay is only available on iOS');
    }
    try {
      // This would integrate with the actual Apple Pay adapter
      // For now, return a mock result
      return {
        paymentId: `apple_pay_${Date.now()}`,
        status: 'pending',
        createdAt: new Date(),
        success: true,
        applePayToken: 'mock_apple_pay_token'
      };
    } catch (error) {
      throw new TunaPaymentError('Apple Pay payment failed: ' + (error instanceof Error ? error.message : String(error)), error);
    }
  }
  // ===========================================
  // GOOGLE PAY METHODS
  // ===========================================
  /**
   * Check if Google Pay is ready to pay
   */
  async isGooglePayReady() {
    if (Platform.OS !== 'android') {
      return false;
    }
    try {
      // For now, return a basic platform check
      // This would be enhanced with actual Google Pay readiness check
      return true;
    } catch (error) {
      if (this.config.debug) {
        console.warn('Google Pay readiness check failed:', error);
      }
      return false;
    }
  }
  /**
   * Setup Google Pay configuration
   */
  async setupGooglePay(config) {
    this.ensureInitialized();
    if (Platform.OS !== 'android') {
      throw new TunaPaymentError('Google Pay is only available on Android');
    }
    try {
      // Store Google Pay configuration
      // This would be enhanced to actually configure the adapter
      if (this.config.debug) {
        console.log('Google Pay configured:', config);
      }
    } catch (error) {
      throw new TunaPaymentError('Failed to setup Google Pay: ' + (error instanceof Error ? error.message : String(error)), error);
    }
  }
  /**
   * Request Google Pay payment
   */
  async requestGooglePayment(paymentDetails) {
    this.ensureInitialized();
    if (Platform.OS !== 'android') {
      throw new TunaPaymentError('Google Pay is only available on Android');
    }
    try {
      // This would integrate with the actual Google Pay adapter
      // For now, return a mock result
      return {
        paymentId: `google_pay_${Date.now()}`,
        status: 'pending',
        createdAt: new Date(),
        success: true,
        googlePayToken: 'mock_google_pay_token'
      };
    } catch (error) {
      throw new TunaPaymentError('Google Pay payment failed: ' + (error instanceof Error ? error.message : String(error)), error);
    }
  }
  // ===========================================
  // PIX PAYMENT METHODS
  // ===========================================
  /**
   * Initiate PIX payment
   */
  async initiatePIXPayment(amount, customer) {
    this.ensureInitialized();
    try {
      // Validate customer info
      const validation = validateCustomerInfo(customer);
      if (!validation.isValid) {
        throw new TunaPaymentError(`Customer validation failed: ${validation.errors.join(', ')}`);
      }
      // This would integrate with the actual PIX payment processing
      // For now, return a mock result
      return {
        success: true,
        qrCode: `pix_qr_code_${Date.now()}`,
        qrCodeBase64: 'mock_base64_qr_code',
        paymentKey: `pix_${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      };
    } catch (error) {
      if (error instanceof TunaPaymentError) {
        throw error;
      }
      throw new TunaPaymentError('PIX payment initiation failed: ' + (error instanceof Error ? error.message : String(error)), error);
    }
  }
  // ===========================================
  // UTILITY METHODS
  // ===========================================
  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      this.isInitialized = false;
      this.currentSessionId = undefined;
    } catch (error) {
      if (this.config.debug) {
        console.warn('Cleanup failed:', error);
      }
    }
  }
  /**
   * Get current session ID
   */
  getSessionId() {
    return this.currentSessionId;
  }
  /**
   * Get current environment
   */
  getEnvironment() {
    return this.config.environment;
  }
  // ===========================================
  // PRIVATE HELPER METHODS
  // ===========================================
  ensureInitialized() {
    if (!this.isInitialized || !this.currentSessionId) {
      throw new TunaPaymentError('TunaReactNative SDK is not initialized. Call initialize() first.');
    }
  }
}
// ===========================================
// FACTORY FUNCTIONS
// ===========================================
/**
 * Create a new TunaReactNative instance
 */
function createTunaReactNative(config) {
  return new TunaReactNative(config);
}

/**
 * React Hooks for Tuna React Native SDK
 *
 * This file provides React hooks for integrating Tuna payment functionality
 * into React Native applications using @rnw-community/react-native-payments
 */
// ========================================
// Main Tuna Payments Hook
// ========================================
/**
 * Main Tuna Payments Hook
 *
 * This is the primary hook for integrating Tuna payments into your React Native app.
 * It provides automatic initialization, state management, and platform-specific methods.
 */
function useTunaPayments(config) {
  const [tunaSDK, setTunaSDK] = useState(null);
  const [state, setState] = useState({
    isInitialized: false,
    isLoading: true,
    error: null
  });
  const initializationAttempted = useRef(false);
  /**
   * Initialize the Tuna SDK
   */
  const initialize = useCallback(async initConfig => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;
    const configToUse = initConfig || config;
    if (!configToUse) {
      setState({
        isInitialized: false,
        isLoading: false,
        error: new TunaPaymentError('Configuration required')
      });
      return;
    }
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      const sdk = new TunaReactNative(configToUse);
      await sdk.initialize('session-' + Date.now());
      setTunaSDK(sdk);
      setState({
        isInitialized: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState({
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error : new TunaPaymentError(String(error))
      });
    }
  }, [config]);
  /**
   * Process a payment using native payment sheets
   */
  const processPayment = useCallback(async paymentDetails => {
    if (!(tunaSDK === null || tunaSDK === void 0 ? void 0 : tunaSDK.isReady())) {
      setState(prev => ({
        ...prev,
        error: new TunaPaymentError('SDK not ready')
      }));
      return null;
    }
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      let result;
      // Use platform-specific native payment methods
      if (Platform.OS === 'ios' && (await tunaSDK.canMakeApplePayPayments())) {
        const applePayResult = await tunaSDK.showApplePaySheet(paymentDetails);
        result = {
          paymentId: applePayResult.transactionId || 'apple-pay-' + Date.now(),
          status: applePayResult.success ? 'success' : 'failed',
          transactionId: applePayResult.transactionId,
          amount: paymentDetails.amount,
          createdAt: new Date()
        };
      } else if (Platform.OS === 'android' && (await tunaSDK.isGooglePayReady())) {
        const googlePayResult = await tunaSDK.requestGooglePayment(paymentDetails);
        result = {
          paymentId: googlePayResult.transactionId || 'google-pay-' + Date.now(),
          status: googlePayResult.success ? 'success' : 'failed',
          transactionId: googlePayResult.transactionId,
          amount: paymentDetails.amount,
          createdAt: new Date()
        };
      } else {
        throw new TunaPaymentError('No supported native payment methods available');
      }
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new TunaPaymentError(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);
  // Auto-initialize on mount if config is provided
  useEffect(() => {
    if (config && !initializationAttempted.current) {
      initialize();
    }
  }, [config, initialize]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      var _a;
      if (tunaSDK) {
        (_a = tunaSDK.cleanup) === null || _a === void 0 ? void 0 : _a.call(tunaSDK);
      }
    };
  }, [tunaSDK]);
  return {
    // SDK instance
    tunaSDK,
    // State
    ...state,
    // Methods
    initialize,
    processPayment
  };
}
// ========================================
// Apple Pay Hook
// ========================================
/**
 * Apple Pay Hook
 *
 * Hook for Apple Pay integration using native payment capabilities
 */
function useApplePay(tunaSDK) {
  const [applePayState, setApplePayState] = useState({
    isAvailable: false,
    isConfigured: false,
    isLoading: false,
    error: null
  });
  /**
   * Check Apple Pay availability
   */
  const checkAvailability = useCallback(async () => {
    if (Platform.OS !== 'ios' || !(tunaSDK === null || tunaSDK === void 0 ? void 0 : tunaSDK.isReady())) {
      setApplePayState(prev => ({
        ...prev,
        isAvailable: false
      }));
      return;
    }
    try {
      const available = await tunaSDK.canMakeApplePayPayments();
      setApplePayState(prev => ({
        ...prev,
        isAvailable: available
      }));
    } catch (error) {
      setApplePayState(prev => ({
        ...prev,
        isAvailable: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [tunaSDK]);
  /**
   * Setup Apple Pay configuration
   */
  const setupApplePay = useCallback(async config => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setApplePayState(prev => ({
        ...prev,
        error
      }));
      return false;
    }
    setApplePayState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      await tunaSDK.setupApplePay(config);
      setApplePayState(prev => ({
        ...prev,
        isLoading: false,
        isConfigured: true
      }));
      return true;
    } catch (error) {
      setApplePayState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return false;
    }
  }, [tunaSDK]);
  /**
   * Show Apple Pay payment sheet
   */
  const showPaymentSheet = useCallback(async paymentDetails => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setApplePayState(prev => ({
        ...prev,
        error
      }));
      return null;
    }
    setApplePayState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      const result = await tunaSDK.showApplePaySheet(paymentDetails);
      setApplePayState(prev => ({
        ...prev,
        isLoading: false
      }));
      return result;
    } catch (error) {
      setApplePayState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);
  // Check availability when SDK becomes ready
  useEffect(() => {
    if (tunaSDK === null || tunaSDK === void 0 ? void 0 : tunaSDK.isReady()) {
      checkAvailability();
    }
  }, [tunaSDK, checkAvailability]);
  return {
    ...applePayState,
    setupApplePay,
    showPaymentSheet,
    checkAvailability
  };
}
// ========================================
// Google Pay Hook
// ========================================
/**
 * Google Pay Hook
 *
 * Hook for Google Pay integration using native payment capabilities
 */
function useGooglePay(tunaSDK) {
  const [googlePayState, setGooglePayState] = useState({
    isAvailable: false,
    isConfigured: false,
    isLoading: false,
    error: null
  });
  /**
   * Check Google Pay availability
   */
  const checkAvailability = useCallback(async () => {
    if (Platform.OS !== 'android' || !(tunaSDK === null || tunaSDK === void 0 ? void 0 : tunaSDK.isReady())) {
      setGooglePayState(prev => ({
        ...prev,
        isAvailable: false
      }));
      return;
    }
    try {
      const available = await tunaSDK.isGooglePayReady();
      setGooglePayState(prev => ({
        ...prev,
        isAvailable: available
      }));
    } catch (error) {
      setGooglePayState(prev => ({
        ...prev,
        isAvailable: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [tunaSDK]);
  /**
   * Setup Google Pay configuration
   */
  const setupGooglePay = useCallback(async config => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setGooglePayState(prev => ({
        ...prev,
        error
      }));
      return false;
    }
    setGooglePayState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      await tunaSDK.setupGooglePay(config);
      setGooglePayState(prev => ({
        ...prev,
        isLoading: false,
        isConfigured: true
      }));
      return true;
    } catch (error) {
      setGooglePayState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return false;
    }
  }, [tunaSDK]);
  /**
   * Show Google Pay payment sheet
   */
  const showPaymentSheet = useCallback(async paymentDetails => {
    if (!tunaSDK) {
      const error = new TunaPaymentError('SDK not available');
      setGooglePayState(prev => ({
        ...prev,
        error
      }));
      return null;
    }
    setGooglePayState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      const result = await tunaSDK.requestGooglePayment(paymentDetails);
      setGooglePayState(prev => ({
        ...prev,
        isLoading: false
      }));
      return result;
    } catch (error) {
      setGooglePayState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);
  // Check availability when SDK becomes ready
  useEffect(() => {
    if (tunaSDK === null || tunaSDK === void 0 ? void 0 : tunaSDK.isReady()) {
      checkAvailability();
    }
  }, [tunaSDK, checkAvailability]);
  return {
    ...googlePayState,
    setupGooglePay,
    showPaymentSheet,
    checkAvailability
  };
}
// ========================================
// PIX Payments Hook
// ========================================
/**
 * PIX Payments Hook
 *
 * Hook for PIX payment integration
 */
function usePIXPayments(tunaSDK) {
  const [pixState, setPixState] = useState({
    isLoading: false,
    qrCode: null,
    qrCodeImage: null,
    expirationTime: null,
    paymentKey: null,
    error: null
  });
  /**
   * Generate PIX payment
   */
  const generatePIXPayment = useCallback(async (amount, customer) => {
    if (!(tunaSDK === null || tunaSDK === void 0 ? void 0 : tunaSDK.isReady())) {
      const error = new TunaPaymentError('SDK not ready');
      setPixState(prev => ({
        ...prev,
        error
      }));
      return null;
    }
    setPixState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));
    try {
      const result = await tunaSDK.initiatePIXPayment(amount, customer);
      setPixState(prev => ({
        ...prev,
        isLoading: false,
        qrCode: result.qrCode || null,
        qrCodeImage: result.qrCodeBase64 || null,
        expirationTime: result.expiresAt ? new Date(result.expiresAt) : null,
        paymentKey: result.paymentKey || null
      }));
      return result;
    } catch (error) {
      setPixState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
      return null;
    }
  }, [tunaSDK]);
  /**
   * Clear PIX payment data
   */
  const clearPIXPayment = useCallback(() => {
    setPixState({
      isLoading: false,
      qrCode: null,
      qrCodeImage: null,
      expirationTime: null,
      paymentKey: null,
      error: null
    });
  }, []);
  return {
    ...pixState,
    generatePIXPayment,
    clearPIXPayment
  };
}
// ========================================
// Composite Hook
// ========================================
/**
 * Complete Tuna integration with all features
 */
function useTunaComplete(config) {
  // Main SDK
  const mainHook = useTunaPayments(config);
  // Platform-specific hooks
  const applePayHook = useApplePay(mainHook.tunaSDK);
  const googlePayHook = useGooglePay(mainHook.tunaSDK);
  // Feature hooks
  const pixPaymentHook = usePIXPayments(mainHook.tunaSDK);
  return {
    // Main SDK
    ...mainHook,
    // Apple Pay
    applePay: applePayHook,
    // Google Pay
    googlePay: googlePayHook,
    // PIX Payments
    pixPayments: pixPaymentHook
  };
}

export { AntifraudManager, ApplePayAdapter, BrazilianDocumentValidator, CardValidator, EmailValidator, GooglePayAdapter, PaymentManager, PaymentValidator, PhoneValidator, ReactNativePaymentsAdapter, SessionManager, StatusPoller, ThreeDSHandler, TokenizationManager, Tuna3DSError, TunaError, TunaErrorCodes, TunaNativePaymentError, TunaNetworkError, TunaPaymentError, TunaReactNative, TunaSessionError, TunaTokenizationError, TunaValidationError, capitalizeWords, cleanString, createAntifraudManager, createApplePayAdapter, createGooglePayAdapter, createStatusPoller, createThreeDSHandler, createTimeoutPromise, createTunaError, createTunaReactNative, TunaReactNative as default, formatCNPJ, formatCPF, formatCardExpiration, formatCreditCardDisplay, formatCurrency, formatExpirationDate, formatPhone, getUserFriendlyErrorMessage, handleApiResponse, handleError, handleHttpError, isTunaError, logError, maskCreditCard, retryWithBackoff, safeJsonParse, truncateText, useApplePay, useGooglePay, usePIXPayments, useTunaComplete, useTunaPayments, validateCNPJ, validateCPF, validateCVV, validateCardData, validateCardNumber, validateCardholderName, validateCustomerInfo, validateEmail, validateExpirationDate, validatePaymentData, withTimeout };
//# sourceMappingURL=index.esm.js.map
