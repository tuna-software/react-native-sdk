# Tuna React Native SDK

🚀 **Modern React Native payment SDK** for seamless payment integration with **Apple Pay**, **Google Pay**, **Credit Cards**, and **PIX** payments.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-ios%20%7C%20android-lightgrey.svg)](https://github.com/tuna-software/react-native-sdk)
[![React Native](https://img.shields.io/badge/React%20Native-%E2%89%A50.60-blue.svg)](https://reactnative.dev/)

## ✨ Features

- 🍎 **Apple Pay** - Native iOS payment experience
- 🤖 **Google Pay** - Native Android payment experience  
- 💳 **Credit Cards** - Secure tokenization with comprehensive 3D Secure support
- 🔒 **Enhanced 3DS** - Industry-standard browser redirect with cross-platform authentication sessions
- 💾 **Saved Cards** - List, select, and manage saved payment methods with 3DS authentication
- 🇧🇷 **PIX Payments** - Brazilian instant payment system with real-time status
- � **PCI Compliant** - Level 1 PCI DSS certified infrastructure
- 📱 **Native UI** - Platform-specific payment sheets and components
- ⚡ **Real-time** - Live payment status tracking and webhooks
- 🛡️ **Secure** - End-to-end encryption, tokenization, and fraud protection

## 📋 Requirements

- React Native >= 0.60
- iOS 11+ (for Apple Pay)
- Android API level 21+ (for Google Pay)
- Tuna merchant account

## 🚀 Quick Start

### 1. Installation

```bash
npm install @tuna-software/react-native-sdk
```

### 2. Platform Setup

#### iOS (Apple Pay)
Add to your `ios/YourApp/Info.plist`:
```xml
<key>PKPaymentNetworks</key>
<array>
    <string>visa</string>
    <string>masterCard</string>
    <string>amex</string>
</array>
```

#### Android (Google Pay)
Add to your `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
```

### 3. Basic Usage

```typescript
import { TunaReactNative } from '@tuna-software/react-native-sdk';

// Initialize the SDK
const tunaSDK = new TunaReactNative({
  environment: 'sandbox', // or 'production'
  debug: true
});

// Initialize with your session
await tunaSDK.initialize('your-session-id');

// Process a credit card payment
const result = await tunaSDK.processCreditCardPayment(
  100.00, // amount
  {
    cardNumber: '4111111111111111',
    cardHolderName: 'John Doe',
    expirationMonth: '12',
    expirationYear: '2025',
    cvv: '123'
  },
  1, // installments
  true, // save card
  {
    name: 'John Doe',
    email: 'john@example.com'
  }
);

if (result.success) {
  console.log('Payment successful!', result.paymentId);
} else {
  console.log('Payment failed:', result.error);
}
```

## 💳 Payment Methods

### Apple Pay (iOS)

```typescript
// Check availability
const isAvailable = await tunaSDK.canMakeApplePayPayments();

if (isAvailable) {
  // Setup Apple Pay
  await tunaSDK.setupApplePay({
    merchantId: 'your-merchant-id',
    countryCode: 'US',
    currencyCode: 'USD'
  });

  // Process payment
  const result = await tunaSDK.processApplePayPayment(100.00, {
    name: 'Customer Name',
    email: 'customer@example.com'
  });
}
```

### Google Pay (Android)

```typescript
// Check availability
const isReady = await tunaSDK.isGooglePayReady();

if (isReady) {
  // Setup Google Pay
  await tunaSDK.setupGooglePay({
    environment: 'TEST', // or 'PRODUCTION'
    merchantId: 'your-merchant-id',
    gatewayMerchantId: 'your-gateway-merchant-id'
  });

  // Process payment
  const result = await tunaSDK.processGooglePayPayment(100.00, {
    name: 'Customer Name',
    email: 'customer@example.com'
  });
}
```

### PIX (Brazil)

```typescript
// Generate PIX payment
const pixResult = await tunaSDK.generatePIXPayment(100.00, {
  name: 'João Silva',
  email: 'joao@example.com',
  document: '12345678901', // CPF
  phone: '+5511999999999'
});

if (pixResult.success) {
  // Display QR code
  console.log('PIX QR Code:', pixResult.qrCode);
  console.log('Copy & Paste:', pixResult.pixCopyPaste);
}
```

### Saved Cards

```typescript
// List saved cards
const savedCards = await tunaSDK.listSavedCards();

// Pay with saved card (requires CVV)
const result = await tunaSDK.processSavedCardPayment(
  100.00,      // amount
  'card-token', // saved card token
  '123',       // CVV
  1,           // installments
  { name: 'Customer', email: 'customer@example.com' }
);

// Delete saved card
await tunaSDK.deleteSavedCard('card-token');
```

## 🔧 Configuration

### Environment Setup

```typescript
const config = {
  environment: 'sandbox', // 'sandbox' | 'production'
  debug: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};

const sdk = new TunaReactNative(config);
```

### Session Management

```typescript
// Create a new session (server-side)
const sessionResponse = await fetch('https://your-backend.com/create-tuna-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerId: 'user-123' })
});

const { sessionId } = await sessionResponse.json();

// Initialize SDK with session
await sdk.initialize(sessionId);
```

## 📱 Example App

Run the complete example app to see all features in action:

```bash
cd example/TunaPaymentDemo
npm install
npx react-native run-android  # or run-ios
```

The example demonstrates:
- All payment methods (Apple Pay, Google Pay, Credit Cards, PIX)
- Saved card management
- 3D Secure flows
- Real-time status tracking
- Error handling

## 🛡️ Security

- **PCI Level 1** certified infrastructure
- **End-to-end encryption** for all sensitive data
- **Tokenization** - Card data never touches your servers
- **3D Secure** - Strong customer authentication
- **Fraud protection** - Advanced risk analysis

## 📚 API Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `initialize(sessionId)` | Initialize SDK with session | `Promise<void>` |
| `processCreditCardPayment()` | Process credit card payment | `Promise<PaymentResult>` |
| `processApplePayPayment()` | Process Apple Pay payment | `Promise<PaymentResult>` |
| `processGooglePayPayment()` | Process Google Pay payment | `Promise<PaymentResult>` |
| `generatePIXPayment()` | Generate PIX payment | `Promise<PIXResult>` |
| `listSavedCards()` | List customer's saved cards | `Promise<SavedCard[]>` |
| `deleteSavedCard()` | Delete a saved card | `Promise<DeleteResult>` |

### Types

```typescript
interface PaymentResult {
  success: boolean;
  paymentId?: string;
  paymentKey?: string;
  status?: string;
  error?: string;
  threeDSData?: ThreeDSData;
}

interface SavedCard {
  token: string;
  brand: string;
  maskedNumber: string;
  cardHolderName: string;
  expirationMonth: number;
  expirationYear: number;
}
```

## 🔒 3D Secure (3DS) Authentication

The SDK provides **industry-standard 3D Secure authentication** with comprehensive support for both saved cards and new payments. Our implementation follows best practices used by major payment processors like Stripe, Adyen, and Square.

### ✨ Features

- 🔐 **Authentication Sessions** - Uses `openAuthSessionAsync` for secure OAuth-style authentication flows
- 🍎 **iOS Optimized** - Automatic browser closing and seamless user experience  
- 🤖 **Android Enhanced** - Smart success detection with multiple fallback methods
- 💾 **Saved Card Support** - Full 3DS authentication for tokenized payment methods
- 🔄 **Background Polling** - Automatic browser dismissal when payment completes
- 🌐 **Cross-Platform** - Consistent behavior across iOS and Android

### Configuration

```typescript
import { ThreeDSHandler } from '@tuna-software/react-native-sdk';

// Configure 3DS with deep linking  
const threeDSConfig = {
  deepLink: 'myapp://payment-complete', // Return to your app after completion
  autoClose: true, // Auto-close browser when done
};

// Create a handler
const threeDSHandler = new ThreeDSHandler(threeDSConfig);
```

### Handling 3DS Challenges

When a payment requires 3DS authentication, the SDK will provide a `threeDSData` object:

```typescript
const paymentResult = await tunaSDK.processCreditCardPayment(cardData, paymentInfo);

if (paymentResult.threeDSData) {
  // Generate 3DS challenge URL
  const challengeUrl = ThreeDSHandler.buildChallengeUrl(
    paymentResult.threeDSData,
    {
      deepLink: 'myapp://payment-complete',
      autoClose: true
    }
  );
  
  // Open in system browser
  await Linking.openURL(challengeUrl);
  
  // Or use WebView
  // <WebView source={{ uri: challengeUrl }} />
}
```

### Deep Linking Setup

To handle returning to your app after 3DS completion:

**iOS (Info.plist):**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>myapp</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTop">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" />
  </intent-filter>
</activity>
```

**React Native:**
```typescript
import { Linking } from 'react-native';

// Listen for deep link
const handleDeepLink = (url: string) => {
  if (url.startsWith('myapp://payment-complete')) {
    // 3DS completed, check payment status
    // You might want to poll payment status or navigate to success screen
  }
};

useEffect(() => {
  const subscription = Linking.addEventListener('url', handleDeepLink);
  return () => subscription?.remove();
}, []);
```

### 🔧 Enhanced 3DS Architecture

Our 3DS implementation includes several advanced features for reliability and user experience:

#### Authentication Sessions
- Uses `WebBrowser.openAuthSessionAsync` instead of regular browser opening
- Purpose-built for OAuth-style authentication flows
- Automatic redirect detection when deep link is triggered
- Better security context and session management

#### Cross-Platform Reliability  
- **iOS**: Seamless experience with automatic browser closing
- **Android**: Smart success detection with platform-specific handling
- **Fallback System**: App polling automatically closes browsers when payment succeeds

#### Advanced Success Detection
```typescript
// The SDK automatically handles multiple success detection methods:
// 1. Deep link triggered (primary method)
// 2. Authentication session success result  
// 3. URL success parameters (Android fallback)
// 4. Background polling detection (ultimate fallback)
```

#### Smart Browser Management
- Authentication sessions properly detect deep link redirects
- Background payment polling can close browsers automatically  
- Multiple fallback methods ensure browsers don't stay open
- Platform-specific optimizations for iOS and Android

## 🔍 Device Profiling for Fraud Prevention

The SDK supports optional device profiling for enhanced fraud prevention through a **zero-dependencies callback pattern**. This allows you to integrate **any** device profiling provider without adding dependencies to the core SDK.

### Philosophy
- **Provider Agnostic**: Use Cybersource, MercadoPago, Sift, Clearsale, or any custom provider
- **Zero SDK Dependencies**: Only install the profiling libraries you need
- **Flexible Integration**: Implement your own device profiling logic
- **Graceful Fallback**: Payments proceed even if profiling fails

### Quick Start

#### 1. Install Your Preferred Provider (Optional)
```bash
# Example: MercadoPago
npm install @mercadopago/sdk-react

# Example: Cybersource
npm install react-native-cybersource-fingerprint-sdk
```

#### 2. Create Device Profiler
```typescript
// Example: MercadoPago Profiler
import { Platform } from 'react-native';

export class MercadoPagoProfiler {
  private sessionId: string;

  async initialize(): Promise<void> {
    this.sessionId = this.generateSessionId();
  }

  async getDeviceSession(): Promise<string> {
    // Your device profiling implementation
    return this.sessionId;
  }

  private generateSessionId(): string {
    const platform = Platform.OS;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `mp-${platform}-${timestamp}-${random}`;
  }
}
```

#### 3. Configure SDK with Device Profiling
```typescript
import TunaReactNative from '@tuna-software/react-native-sdk';
import { MercadoPagoProfiler } from './deviceProfiling/MercadoPagoProfiler';

// Initialize profiler
const mpProfiler = new MercadoPagoProfiler({
  publicKey: 'YOUR_MP_PUBLIC_KEY',
  environment: 'test'
});
await mpProfiler.initialize();

// Configure SDK with device profiling callback
const sdk = new TunaReactNative({
  environment: 'sandbox',
  deviceProfilingCallback: async () => {
    const sessions = [];
    
    // MercadoPago
    try {
      const mpSession = await mpProfiler.getDeviceSession();
      sessions.push({ key: 'MercadoPago', value: mpSession });
    } catch (error) {
      console.log('MercadoPago profiling failed:', error);
    }
    
    // Add more providers as needed
    // const csSession = await cybersourceProfiler.getSession();
    // sessions.push({ key: 'Cybersource', value: csSession });
    
    return sessions;
  }
});
```

### How It Works

1. **Callback Invocation**: Before each payment, the SDK calls your `deviceProfilingCallback`
2. **Data Collection**: Your profiler collects device fingerprint/session data
3. **Timeout Protection**: 3-second timeout ensures payments aren't blocked
4. **FrontData Transmission**: Device data automatically included in payment requests
5. **Graceful Fallback**: If profiling fails, payment continues normally

### Example Providers

#### MercadoPago
```typescript
deviceProfilingCallback: async () => {
  const mpSession = await mpProfiler.getDeviceSession();
  return [{ key: 'MercadoPago', value: mpSession }];
}
```

#### Cybersource
```typescript
import CybersourceFingerprint from 'react-native-cybersource-fingerprint-sdk';

deviceProfilingCallback: async () => {
  const sessionId = await CybersourceFingerprint.getDeviceId();
  return [{ key: 'Cybersource', value: sessionId }];
}
```

#### Custom Provider
```typescript
deviceProfilingCallback: async () => {
  const customData = await myAnalytics.getDeviceInfo();
  return [
    { key: 'CustomAnalytics', value: customData },
    { key: 'AnotherProvider', value: 'session-123' }
  ];
}
```

### Benefits

✅ **Lightweight SDK** - No forced dependencies  
✅ **Maximum Flexibility** - Use any fraud prevention service  
✅ **Easy Maintenance** - Provider updates don't require SDK updates  
✅ **Future-Proof** - New providers work without SDK changes  
✅ **Non-Blocking** - Payments never delayed by profiling issues

### Demo Implementation

See the complete MercadoPago device profiling implementation in:
- `example/TunaPaymentDemo/src/deviceProfiling/MercadoPagoProfiler.ts`
- `example/TunaPaymentDemo/TunaPaymentExample.tsx`

## 🌍 Supported Countries

- 🇺🇸 **United States** - Apple Pay, Google Pay, Credit Cards
- 🇧🇷 **Brazil** - PIX, Credit Cards, Google Pay
- 🇲🇽 **Mexico** - Credit Cards, Google Pay
- 🇦🇷 **Argentina** - Credit Cards
- 🇨🇱 **Chile** - Credit Cards
- 🇨🇴 **Colombia** - Credit Cards
- 🇺🇾 **Uruguay** - Credit Cards

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: support@tuna.uy
- 📚 **Documentation**: [https://dev.tuna.uy](https://dev.tuna.uy)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tuna-software/react-native-sdk/issues)
- 💬 **Discord**: [Tuna Community](https://discord.gg/tuna)

---

Made with ❤️ by [Tuna](https://tuna.uy)

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
