/**
 * Validation utilities for Tuna React Native
 */
import { TunaPaymentError } from './errors';
/**
 * Credit card validation utilities
 */
export declare class CardValidator {
    /**
     * Validates a credit card number using Luhn algorithm
     */
    static isValidNumber(cardNumber: string): boolean;
    /**
     * Luhn algorithm implementation
     */
    private static luhnCheck;
    /**
     * Detects credit card type based on number
     */
    static getCardType(cardNumber: string): string;
    /**
     * Validates CVV/CVC based on card type
     */
    static isValidCVV(cvv: string, cardType?: string): boolean;
    /**
     * Validates expiration date (MM/YY or MM/YYYY format)
     */
    static isValidExpiry(expiry: string): boolean;
    /**
     * Validates cardholder name
     */
    static isValidName(name: string): boolean;
}
/**
 * Brazilian document validation utilities
 */
export declare class BrazilianDocumentValidator {
    /**
     * Validates CPF (Brazilian individual taxpayer ID)
     */
    static isValidCPF(cpf: string): boolean;
    /**
     * Validates CNPJ (Brazilian company taxpayer ID)
     */
    static isValidCNPJ(cnpj: string): boolean;
}
/**
 * Email validation utility
 */
export declare class EmailValidator {
    /**
     * Validates email format using regex
     */
    static isValid(email: string): boolean;
}
/**
 * Phone validation utility
 */
export declare class PhoneValidator {
    /**
     * Validates Brazilian phone number format
     */
    static isValidBrazilian(phone: string): boolean;
}
/**
 * General payment validation utilities
 */
export declare class PaymentValidator {
    /**
     * Validates payment amount
     */
    static isValidAmount(amount: number): boolean;
    /**
     * Validates currency code (ISO 4217)
     */
    static isValidCurrency(currency: string): boolean;
    /**
     * Validates installment count
     */
    static isValidInstallments(installments: number): boolean;
}
/**
 * Comprehensive validation function for payment data
 */
export declare function validatePaymentData(data: any): TunaPaymentError[];
/**
 * Convenience functions for individual validations
 */
export declare function validateCardNumber(cardNumber: string): boolean;
export declare function validateCVV(cvv: string, cardNumber?: string): boolean;
export declare function validateExpirationDate(expiry: string): boolean;
export declare function validateCardholderName(name: string): boolean;
export declare function validateEmail(email: string): boolean;
export declare function validateCPF(cpf: string): boolean;
export declare function validateCNPJ(cnpj: string): boolean;
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
export declare function validateCardData(cardData: any): ValidationResult;
/**
 * Validate customer information
 */
export declare function validateCustomerInfo(customer: any): ValidationResult;
//# sourceMappingURL=validation.d.ts.map