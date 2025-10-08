# Changelog

All notable changes to the Tuna React Native SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-10-08

### 🤖 Google Pay Library Migration

#### Changed
- ✅ **Migrated from `react-native-google-pay`** to `@rnw-community/react-native-payments`
- ✅ **Updated Google Pay implementation** - Now uses actively maintained library with Android Pay API
- ✅ **Enhanced merchant configuration** - Real Tuna credentials with TEST environment for development
- ✅ **Improved error handling** - Better support for Google Pay availability and payment processing

#### Added
- ✅ **@rnw-community/react-native-payments** as peer dependency
- ✅ **Android Pay API support** - Proper PaymentRequest implementation for Google Pay
- ✅ **Environment-aware configuration** - Automatic TEST/PRODUCTION environment handling
- ✅ **Enhanced debugging** - Improved logging for Google Pay operations

#### Fixed
- 🐛 **Google Pay merchant errors** - Resolved "merchant is having trouble" issues with proper TEST environment
- 🐛 **Library compatibility** - Replaced abandoned package with actively maintained alternative
- 🐛 **Payment sheet display** - Fixed Google Pay sheet appearance and interaction

#### Security
- 🔒 **Real merchant credentials** - Uses actual Tuna merchant ID (BCR2DN6TR7QYLIKK) in TEST environment
- 🔒 **Proper tokenization** - Maintained secure token handling through migration

## [1.2.0] - 2025-10-07

### 🔒 Enhanced 3D Secure Authentication

#### Added
- ✅ **Comprehensive 3DS integration** with CyberSource CheckEnrollment support
- ✅ **AuthenticationInformation flow** - Proper bind operation with authentication data for saved cards
- ✅ **Status 'P' handling** - Enhanced pending payment support with continued polling
- ✅ **Cross-platform browser management** - `openAuthSessionAsync` for proper authentication sessions
- ✅ **Android-specific success detection** - Smart fallback for authentication session quirks
- ✅ **App-controlled browser closing** - Background polling with automatic browser dismissal
- ✅ **Enhanced cloud function** - Multi-method deep link triggering and success communication
- ✅ **Real 3DS challenge execution** - Industry-standard browser redirect implementation

#### Fixed
- 🐛 **Saved card 3DS issues** - Missing AuthenticationInformation.ReferenceId for CyberSource
- 🐛 **Android browser management** - Proper success detection vs false cancellation errors
- 🐛 **Status 'P' polling** - Continued monitoring for pending payments like PIX
- 🐛 **Browser closing reliability** - Multiple fallback methods for window dismissal

#### Improved
- 🚀 **3DS Challenge Architecture** - Purpose-built authentication session handling
- 🚀 **Cross-platform compatibility** - Consistent behavior on iOS and Android
- 🚀 **Error handling** - Better distinction between user cancellation and technical issues
- 🚀 **Developer experience** - Enhanced logging and debugging for 3DS flows

### Technical Details
- **Authentication Sessions**: Migrated from `openBrowserAsync` to `openAuthSessionAsync` for proper OAuth-style flows
- **Android Enhancements**: Platform-specific handling for authentication session result interpretation
- **Cloud Function**: Enhanced 3DS landing page with multiple deep link triggering methods
- **Background Polling**: Smart browser dismissal when payment succeeds during challenge
- **URL Success Detection**: Multiple methods to detect 3DS completion across different browser contexts

## [1.0.0] - 2025-10-06

### Added
- 🎉 **Initial release** of Tuna React Native SDK
- 🍎 **Apple Pay integration** with native iOS payment sheets
- 🤖 **Google Pay integration** with native Android payment sheets
- 💳 **Credit card payments** with secure tokenization
- 🔒 **3D Secure authentication** support
- 💾 **Saved cards management** (list, select, delete)
- 🇧🇷 **PIX payments** for Brazilian market
- ⚡ **Real-time payment status** tracking with polling
- 🛡️ **PCI Level 1 compliance** with end-to-end encryption
- 📱 **Native UI components** following platform guidelines
- 🔧 **TypeScript support** with comprehensive type definitions
- 📚 **Complete example app** demonstrating all features
- 🧪 **Comprehensive testing** with Jest
- 📖 **Detailed documentation** and API reference

### Features
- **Multi-platform support**: iOS 11+, Android API 21+
- **Multiple payment methods**: Credit cards, Apple Pay, Google Pay, PIX
- **Advanced security**: 3DS, tokenization, fraud protection
- **Developer experience**: TypeScript, comprehensive docs, example app
- **Production ready**: Error handling, status tracking, webhooks

### Supported Countries
- 🇺🇸 United States
- 🇧🇷 Brazil  
- 🇲🇽 Mexico
- 🇦🇷 Argentina
- 🇨🇱 Chile
- 🇨🇴 Colombia
- 🇺🇾 Uruguay

### Dependencies
- React Native >= 0.60
- @rnw-community/react-native-payments ^1.6.0
- card-validator ^8.1.1

---

## Versioning Strategy

- **Major** (X.0.0): Breaking changes, major new features
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, security updates

## Support

For questions about releases or upgrade paths:
- 📧 Email: support@tuna.uy
- 🐛 Issues: [GitHub Issues](https://github.com/tuna-software/react-native-sdk/issues)
- 💬 Discord: [Tuna Community](https://discord.gg/tuna)