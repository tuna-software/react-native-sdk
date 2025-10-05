/**
 * Basic tests for Tuna React Native validation utilities
 */

import {
  CardValidator,
  BrazilianDocumentValidator,
  EmailValidator,
  PaymentValidator,
  validateCardNumber,
  validateCVV,
  validateCPF,
  validateEmail,
} from '../validation';

describe('CardValidator', () => {
  describe('isValidNumber', () => {
    test('should validate correct Visa card', () => {
      expect(CardValidator.isValidNumber('4111111111111111')).toBe(true);
    });

    test('should reject invalid card', () => {
      expect(CardValidator.isValidNumber('1234567890123456')).toBe(false);
    });

    test('should handle empty input', () => {
      expect(CardValidator.isValidNumber('')).toBe(false);
    });
  });

  describe('getCardType', () => {
    test('should detect Visa', () => {
      expect(CardValidator.getCardType('4111111111111111')).toBe('visa');
    });

    test('should detect Mastercard', () => {
      expect(CardValidator.getCardType('5555555555554444')).toBe('mastercard');
    });

    test('should detect Amex', () => {
      expect(CardValidator.getCardType('378282246310005')).toBe('amex');
    });
  });

  describe('isValidCVV', () => {
    test('should validate 3-digit CVV for most cards', () => {
      expect(CardValidator.isValidCVV('123')).toBe(true);
    });

    test('should validate 4-digit CVV for Amex', () => {
      expect(CardValidator.isValidCVV('1234', 'amex')).toBe(true);
    });

    test('should reject invalid CVV', () => {
      expect(CardValidator.isValidCVV('12')).toBe(false);
    });
  });

  describe('isValidExpiry', () => {
    test('should validate future date', () => {
      const futureYear = (new Date().getFullYear() + 1).toString().slice(-2);
      expect(CardValidator.isValidExpiry(`12${futureYear}`)).toBe(true);
    });

    test('should reject past date', () => {
      expect(CardValidator.isValidExpiry('1220')).toBe(false);
    });

    test('should reject invalid month', () => {
      expect(CardValidator.isValidExpiry('1325')).toBe(false);
    });
  });
});

describe('BrazilianDocumentValidator', () => {
  describe('isValidCPF', () => {
    test('should validate correct CPF', () => {
      expect(BrazilianDocumentValidator.isValidCPF('11144477735')).toBe(true);
    });

    test('should reject invalid CPF', () => {
      expect(BrazilianDocumentValidator.isValidCPF('12345678901')).toBe(false);
    });

    test('should reject sequential numbers', () => {
      expect(BrazilianDocumentValidator.isValidCPF('11111111111')).toBe(false);
    });

    test('should handle formatted CPF', () => {
      expect(BrazilianDocumentValidator.isValidCPF('111.444.777-35')).toBe(true);
    });
  });

  describe('isValidCNPJ', () => {
    test('should validate correct CNPJ', () => {
      expect(BrazilianDocumentValidator.isValidCNPJ('11222333000181')).toBe(true);
    });

    test('should reject invalid CNPJ', () => {
      expect(BrazilianDocumentValidator.isValidCNPJ('12345678901234')).toBe(false);
    });

    test('should handle formatted CNPJ', () => {
      expect(BrazilianDocumentValidator.isValidCNPJ('11.222.333/0001-81')).toBe(true);
    });
  });
});

describe('EmailValidator', () => {
  test('should validate correct email', () => {
    expect(EmailValidator.isValid('test@example.com')).toBe(true);
  });

  test('should reject invalid email', () => {
    expect(EmailValidator.isValid('invalid-email')).toBe(false);
  });

  test('should handle empty input', () => {
    expect(EmailValidator.isValid('')).toBe(false);
  });
});

describe('PaymentValidator', () => {
  describe('isValidAmount', () => {
    test('should validate positive amount', () => {
      expect(PaymentValidator.isValidAmount(100.50)).toBe(true);
    });

    test('should reject negative amount', () => {
      expect(PaymentValidator.isValidAmount(-10)).toBe(false);
    });

    test('should reject zero amount', () => {
      expect(PaymentValidator.isValidAmount(0)).toBe(false);
    });
  });

  describe('isValidCurrency', () => {
    test('should validate BRL', () => {
      expect(PaymentValidator.isValidCurrency('BRL')).toBe(true);
    });

    test('should validate USD', () => {
      expect(PaymentValidator.isValidCurrency('USD')).toBe(true);
    });

    test('should reject invalid currency', () => {
      expect(PaymentValidator.isValidCurrency('INVALID')).toBe(false);
    });
  });

  describe('isValidInstallments', () => {
    test('should validate valid installments', () => {
      expect(PaymentValidator.isValidInstallments(6)).toBe(true);
    });

    test('should reject zero installments', () => {
      expect(PaymentValidator.isValidInstallments(0)).toBe(false);
    });

    test('should reject too many installments', () => {
      expect(PaymentValidator.isValidInstallments(24)).toBe(false);
    });
  });
});

describe('convenience functions', () => {
  test('validateCardNumber', () => {
    expect(validateCardNumber('4111111111111111')).toBe(true);
  });

  test('validateCVV', () => {
    expect(validateCVV('123')).toBe(true);
  });

  test('validateCPF', () => {
    expect(validateCPF('11144477735')).toBe(true);
  });

  test('validateEmail', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});