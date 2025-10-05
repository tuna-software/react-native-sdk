/**
 * Formatting utilities for Tuna React Native
 */

/**
 * Masks a credit card number showing only first 6 and last 4 digits
 */
export function maskCreditCard(creditCardNumber: string): string {
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
export function formatCreditCardDisplay(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const chunks = cleanNumber.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}

/**
 * Formats CPF for display (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length <= 3) return cleanCPF;
  if (cleanCPF.length <= 6) return cleanCPF.replace(/(\d{3})(\d+)/, '$1.$2');
  if (cleanCPF.length <= 9) return cleanCPF.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formats CNPJ for display (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
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
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length <= 2) return cleanPhone;
  if (cleanPhone.length <= 6) return cleanPhone.replace(/(\d{2})(\d+)/, '($1) $2');
  if (cleanPhone.length <= 10) return cleanPhone.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number, currencyCode: string = 'BRL', locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100); // Assuming amount is in cents
}

/**
 * Cleans a string removing all non-alphanumeric characters
 */
export function cleanString(str: string): string {
  return str.replace(/[^\da-zA-Z]/g, '');
}

/**
 * Capitalizes first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}

/**
 * Formats expiration date for display (MM/YY)
 */
export function formatExpirationDate(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
}

/**
 * Validates and formats card expiration input
 */
export function formatCardExpiration(input: string): string {
  const cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length >= 2) {
    const month = cleaned.substring(0, 2);
    const year = cleaned.substring(2, 4);
    return year ? `${month}/${year}` : month;
  }
  
  return cleaned;
}