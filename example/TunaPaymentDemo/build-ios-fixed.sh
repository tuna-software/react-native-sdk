#!/bin/bash

echo "🔧 Building iOS app with sandbox violation fixes..."

# Set environment variables to prevent debug file writing
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"
export RCT_METRO_PORT=8081
export RCT_NO_LAUNCH_PACKAGER=1

# Clean any existing debug files
rm -f ios/build/*/TunaPaymentDemo.app/ip.txt 2>/dev/null || true

# Prebuild with fixes
echo "📱 Prebuilding with sandbox fixes..."
npx expo prebuild --platform ios --clean

# Build the app
echo "🔨 Building iOS app..."
cd ios

# Clean build folder first
rm -rf build/
rm -rf DerivedData/

# Install pods
pod install

# Build with Xcode
echo "🍎 Opening Xcode - build and run from there to avoid sandbox issues..."
open TunaPaymentDemo.xcworkspace

echo ""
echo "✅ Xcode opened! Now:"
echo "1. Wait for indexing to complete"
echo "2. Select your iPhone as target device"
echo "3. Click Run (▶️) to build and install"
echo "4. The sandbox violation should be fixed!"