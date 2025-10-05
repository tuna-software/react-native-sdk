/**
 * Formatting utilities for Tuna React Native
 */
/**
 * Masks a credit card number showing only first 6 and last 4 digits
 */
export declare function maskCreditCard(creditCardNumber: string): string;
/**
 * Formats a credit card number with spaces for display
 */
export declare function formatCreditCardDisplay(cardNumber: string): string;
/**
 * Formats CPF for display (XXX.XXX.XXX-XX)
 */
export declare function formatCPF(cpf: string): string;
/**
 * Formats CNPJ for display (XX.XXX.XXX/XXXX-XX)
 */
export declare function formatCNPJ(cnpj: string): string;
/**
 * Formats phone number for display
 */
export declare function formatPhone(phone: string): string;
/**
 * Formats currency for display
 */
export declare function formatCurrency(amount: number, currencyCode?: string, locale?: string): string;
/**
 * Cleans a string removing all non-alphanumeric characters
 */
export declare function cleanString(str: string): string;
/**
 * Capitalizes first letter of each word
 */
export declare function capitalizeWords(str: string): string;
/**
 * Truncates text to specified length with ellipsis
 */
export declare function truncateText(text: string, maxLength: number): string;
/**
 * Formats expiration date for display (MM/YY)
 */
export declare function formatExpirationDate(month: number, year: number): string;
/**
 * Validates and formats card expiration input
 */
export declare function formatCardExpiration(input: string): string;
//# sourceMappingURL=formatting.d.ts.map