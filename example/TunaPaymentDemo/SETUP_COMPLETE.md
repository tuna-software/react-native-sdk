# 🚀 Tuna React Native Payments - Complete Setup Guide

## 📦 What You Have Now

✅ **Complete Expo App**: Ready-to-run React Native app with Tuna payments
✅ **Native Payment Support**: Apple Pay (iOS) and Google Pay (Android)
✅ **No WebView Dependencies**: Pure native integration
✅ **TypeScript Support**: Full type safety and autocomplete
✅ **Real Payment Processing**: Connected to Tuna's payment infrastructure

## 🎯 Quick Start

### 1. Run the Demo App
```bash
cd /Users/paul/code/tuna/plugins/react-native/example/TunaPaymentDemo
npx expo start
```

### 2. Test on Device
- **iOS**: Press `i` to open iOS Simulator (or scan QR code with Expo Go on iPhone)
- **Android**: Press `a` to open Android Emulator (or scan QR code with Expo Go on Android)
- **Web**: Press `w` to open in browser (limited payment functionality)

## 🔧 Configuration

### SDK Configuration (TunaPaymentExample.tsx)
```typescript
const TUNA_CONFIG = {
  environment: 'sandbox' as const, // Change to 'production' for live payments
  debug: true, // Set to false in production
};
```

### Session Management
Currently uses a mock session ID. In production:
1. Your backend calls Tuna's session API with your credentials
2. Your backend sends the session ID to your React Native app
3. The app uses this session ID to initialize the SDK

## 🍎 Apple Pay Setup (iOS)

### Development
- Works in iOS Simulator for testing UI
- Requires physical device with Apple Pay configured for real payments

### Production
1. **Apple Developer Account**: Configure Apple Pay capability
2. **Merchant ID**: Create and configure in Apple Developer Console
3. **Certificates**: Download and install payment processing certificate
4. **Xcode**: Enable Apple Pay capability in your project

### Configuration
```typescript
const applePayConfig = {
  merchantIdentifier: 'merchant.com.yourcompany.app', // Your Apple Merchant ID
  supportedNetworks: ['visa', 'mastercard', 'amex'],
  countryCode: 'BR',
  currencyCode: 'BRL',
};
```

## 🤖 Google Pay Setup (Android)

### Development
- Works in Android Emulator for testing UI
- Requires physical device with Google Pay app for real payments

### Production
1. **Google Pay Console**: Register your app
2. **Merchant Account**: Set up Google Pay merchant account
3. **Integration**: Add Google Pay metadata to AndroidManifest.xml

### Configuration
```typescript
const googlePayConfig = {
  environment: 'TEST', // Change to 'PRODUCTION' for live payments
  apiVersion: 2,
  apiVersionMinor: 0,
  merchantInfo: {
    merchantName: 'Your Store Name',
  },
  // ... rest of configuration
};
```

## 🔐 Security & Credentials

### What's Secure ✅
- Session IDs are temporary and safe to use in React Native
- Payment tokens are handled securely by native APIs
- No sensitive API keys in the app

### What to Keep Secret 🔒
- Tuna API keys (backend only)
- Apple Pay certificates (backend/Xcode only)
- Google Pay merchant credentials (backend only)

## 🧪 Testing

### Development Testing
- ✅ UI Testing: Works in simulators/emulators
- ✅ Flow Testing: Test payment flows without real transactions
- ✅ Error Handling: Test various error scenarios

### Production Testing
- Use sandbox/test environments
- Test with real payment methods on devices
- Verify with small amounts before going live

## 📱 Platform Support

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Apple Pay | ✅ | ❌ | ❌ |
| Google Pay | ❌ | ✅ | ❌ |
| Credit Cards | ✅ | ✅ | ✅ |
| PIX (Brazil) | ✅ | ✅ | ✅ |

## 🚀 Next Steps

1. **Run the Demo**: Try the app on your device
2. **Customize**: Modify the example for your needs
3. **Backend Integration**: Connect your backend for session management
4. **Production Config**: Set up Apple Pay and Google Pay credentials
5. **Go Live**: Switch to production environment

## 📞 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Report problems in the repository
- **Examples**: See other examples in the `/example` directory

---

**You're all set! 🎉 Run `npx expo start` to see your Tuna payments in action!**