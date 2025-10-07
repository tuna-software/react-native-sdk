# Tuna React Native SDK Example

This folder contains a complete React Native example app demonstrating the Tuna Payment SDK integration.

## TunaPaymentDemo

The `TunaPaymentDemo` is a full-featured example application showcasing:

- **Apple Pay integration** (iOS)
- **Google Pay integration** (Android) 
- **Credit Card payments** with 3D Secure support
- **Saved Cards management** (list, select, delete)
- **PIX payments** (Brazil)
- **Real-time payment status tracking**

## Running the Example

```bash
cd TunaPaymentDemo
npm install
npx react-native run-android  # or run-ios
```

## Key Features Demonstrated

- ✅ Real Tuna API integration
- ✅ Native payment methods (Apple Pay, Google Pay)
- ✅ Secure credit card tokenization
- ✅ 3DS authentication flows
- ✅ Saved card management
- ✅ PIX QR code generation
- ✅ Payment status polling
- ✅ Error handling and validation

## Integration Guide

See the main README for complete integration instructions.
```

### 2. iOS Setup (Apple Pay)

Add to your `ios/Runner/Info.plist`:

```xml
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>nfc</string>
</array>
```

### 3. Android Setup (Google Pay)

Add to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

### 4. Basic Usage

```tsx
import React from 'react';
import { useTunaPayments, useApplePay, useGooglePay } from '@tuna/react-native-payments';

function MyPaymentComponent() {
  const { tunaSDK, isInitialized } = useTunaPayments({
    environment: 'sandbox',
    debug: true,
  });

  const applePay = useApplePay(tunaSDK);
  const googlePay = useGooglePay(tunaSDK);

  // Your payment logic here...
}
```

## Configuration

### Environment Setup

```tsx
const config = {
  environment: 'sandbox', // or 'production'
  debug: true, // Enable debug logging
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};
```

### Apple Pay Configuration

```tsx
const applePayConfig = {
  merchantIdentifier: 'merchant.com.yourcompany.app',
  supportedNetworks: ['visa', 'mastercard', 'amex'],
  countryCode: 'BR',
  currencyCode: 'BRL',
  requestBillingAddress: true,
  requestPayerEmail: true,
};
```

### Google Pay Configuration

```tsx
const googlePayConfig = {
  environment: 'TEST', // or 'PRODUCTION'
  merchantInfo: {
    merchantName: 'Your Store',
    merchantId: 'your-merchant-id',
  },
  allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'tuna',
      gatewayMerchantId: 'your-gateway-merchant-id',
    },
  },
};
```

## Available Hooks

### Core Hooks

- `useTunaPayments(config)` - Main SDK hook with auto-initialization
- `useTunaComplete(config)` - Complete integration with all features

### Platform-Specific Hooks

- `useApplePay(tunaSDK)` - Apple Pay integration for iOS
- `useGooglePay(tunaSDK)` - Google Pay integration for Android

### Payment Method Hooks

- `usePIXPayments(tunaSDK)` - PIX payments for Brazil

## Architecture

### No WebView Approach
Unlike many payment SDKs that rely on WebView for payment processing, this SDK uses:

- **Native Payment APIs**: Direct integration with Apple Pay and Google Pay
- **Platform-Specific UIs**: Native payment sheets that follow platform guidelines
- **Secure Tokenization**: Payments are tokenized through secure native channels
- **Better Performance**: No web rendering overhead
- **Better UX**: Native look and feel

### TypeScript Support
All components and hooks are fully typed with comprehensive TypeScript definitions:

```tsx
interface PaymentResult {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  amount?: number;
  createdAt: Date;
}
```

### Error Handling
Comprehensive error handling with specific error types:

```tsx
try {
  const result = await processPayment(paymentDetails);
} catch (error) {
  if (error instanceof TunaPaymentError) {
    // Handle payment-specific error
  } else if (error instanceof TunaNetworkError) {
    // Handle network error
  }
}
```

## Testing

Run the test suite:

```bash
npm test
```

Build the project:

```bash
npm run build
```

## Production Deployment

### 1. Environment Configuration
- Change `environment` to `'production'`
- Set `debug` to `false`
- Use real merchant identifiers

### 2. Apple Pay
- Register with Apple Developer Program
- Create merchant identifier
- Configure payment processing certificate

### 3. Google Pay
- Register with Google Pay Business Console
- Configure merchant profile
- Set up production tokenization

### 4. Security
- Implement proper backend validation
- Use HTTPS for all communications
- Follow PCI compliance guidelines

## Support

For issues and questions:
- Check the [main documentation](../README.md)
- Review TypeScript definitions in `src/types/`
- Examine test cases in `src/**/__tests__/`

## License

This project is licensed under the MIT License.