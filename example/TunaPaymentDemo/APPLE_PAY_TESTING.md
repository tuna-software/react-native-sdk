# 🍎 Apple Pay Testing Guide

## Option 1: EAS Build (Recommended - Cloud Build)

### Prerequisites
1. **Apple Developer Account** (required for Apple Pay)
2. **EAS CLI** installed globally:
   ```bash
   npm install -g @expo/eas-cli
   ```

### Steps:

1. **Login to EAS:**
   ```bash
   eas login
   ```

2. **Build Development Version:**
   ```bash
   eas build --profile development --platform ios
   ```
   
   This will:
   - Build your app with native libraries included
   - Create an .ipa file you can install on your iPhone
   - Include Apple Pay capabilities

3. **Install on Your iPhone:**
   - Download the .ipa from the EAS dashboard
   - Install via Xcode or Apple Configurator
   - Or use the QR code provided by EAS

### Apple Pay Setup:
1. **Add Test Cards to iPhone Wallet:**
   - Go to Settings > Wallet & Apple Pay
   - Add a test card (use Apple's test card numbers)

2. **Test Real Apple Pay:**
   - Open the installed app
   - Tap "Apple Pay" button
   - You'll see real Touch ID/Face ID prompt!

---

## Option 2: Local Build with Xcode

### Prerequisites
1. **Xcode** (already installed ✅)
2. **Apple Developer Account**

### Steps:

1. **Generate Native iOS Project:**
   ```bash
   npx expo run:ios --device
   ```
   
   This will:
   - Create ios/ folder with native Xcode project
   - Open Xcode automatically
   - Build and install on connected iPhone

2. **Configure Apple Pay in Xcode:**
   - Open the project in Xcode
   - Select your app target
   - Go to "Signing & Capabilities"
   - Add "Apple Pay" capability
   - Add merchant identifier: `merchant.uy.tunahmlg`

3. **Build and Install:**
   - Connect your iPhone via USB
   - Click "Run" in Xcode
   - App installs directly on your device

---

## Option 3: Quick Local Development Build

If you just want to test quickly:

```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Create development build (will take 10-15 minutes)
eas build --profile development --platform ios --local

# This creates an .ipa file locally that you can install
```

---

## Testing Apple Pay

Once you have the development build installed:

1. **Setup Test Environment:**
   - Make sure you have test cards in Apple Wallet
   - Use Apple's test merchant configuration

2. **Test Flow:**
   - Open the installed TunaPaymentDemo app
   - Go to Apple Pay tab
   - Tap "Pay with Apple Pay"
   - You should see REAL Apple Pay sheet with Touch ID/Face ID!

3. **Expected Logs:**
   ```
   🍎 [TunaReactNative] Starting Apple Pay payment
   🍎 [TunaReactNative] Creating PaymentRequest for real device...
   🍎 [TunaReactNative] Showing Apple Pay sheet on real device...
   🍎 [TunaReactNative] Apple Pay token received, processing with Tuna...
   💳 [TunaReactNative] Processing apple-pay token with Tuna API...
   ✅ Real apple-pay payment processing completed
   ```

---

## Troubleshooting

### Apple Pay Not Available:
- Ensure you have cards added to Apple Wallet
- Check that Apple Pay is enabled in Settings
- Verify merchant identifier in app.json

### Build Fails:
- Make sure you have Apple Developer account
- Check that bundle identifier is unique
- Ensure Xcode command line tools are installed

### Native Libraries Missing:
- Make sure you're using development build, not Expo Go
- Verify @rnw-community/react-native-payments is in dependencies

---

## Quick Start (Recommended):

```bash
# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Login
eas login

# 3. Build for your device
eas build --profile development --platform ios

# 4. Install the .ipa on your iPhone when build completes
```

The build will take 10-15 minutes, but then you'll have a real native app with working Apple Pay! 🎉