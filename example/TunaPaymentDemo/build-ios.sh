#!/bin/bash

echo "🍎 Building TunaPaymentDemo for iPhone testing..."
echo ""
echo "This will:"
echo "1. Generate native iOS project"
echo "2. Open Xcode"
echo "3. Build and install on your connected iPhone"
echo ""

# Set deployment target to 15.1
export IPHONEOS_DEPLOYMENT_TARGET=15.1

# Generate ios folder and prebuild
echo "📱 Generating native iOS project..."
npx expo prebuild --platform ios --clean

echo ""
echo "✅ Native iOS project generated!"
echo ""
echo "🔧 Next steps:"
echo "1. Connect your iPhone to this Mac via USB"
echo "2. Open Xcode: open ios/TunaPaymentDemo.xcworkspace"
echo "3. Select your iPhone as the target device"
echo "4. Click the 'Run' button (▶️) in Xcode"
echo ""
echo "📋 Apple Pay Setup:"
echo "1. In Xcode, select your app target"
echo "2. Go to 'Signing & Capabilities'"
echo "3. Add 'Apple Pay' capability"
echo "4. Add merchant ID: merchant.uy.tunahmlg"
echo ""
echo "🎉 Then test real Apple Pay on your iPhone!"