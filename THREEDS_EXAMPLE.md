# 3D Secure Integration Example

This example shows how to integrate 3D Secure authentication with the Tuna React Native SDK using the new landing page approach.

## Basic Credit Card Payment with 3DS

```typescript
import React, { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { TunaReactNative, ThreeDSHandler } from '@tuna-software/react-native-sdk';

const PaymentScreen = () => {
  const tunaSDK = new TunaReactNative({
    sessionId: 'your-session-id',
    environment: 'production' // or 'sandbox'
  });

  // Listen for deep link returns from 3DS
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.startsWith('myapp://payment-complete')) {
        Alert.alert('3DS Complete', 'Returning from 3D Secure authentication');
        // Check payment status or navigate to success screen
        checkPaymentStatus();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription?.remove();
  }, []);

  const processPayment = async () => {
    try {
      const cardData = {
        cardHolderName: 'John Doe',
        cardNumber: '4111111111111111',
        expirationMonth: 12,
        expirationYear: 2025,
        cvv: '123'
      };

      const paymentInfo = {
        amount: 100.00,
        currency: 'USD',
        customer: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      };

      // Process the payment
      const result = await tunaSDK.processCreditCardPayment(cardData, paymentInfo);

      if (result.threeDSData) {
        // 3DS authentication required
        await handle3DSChallenge(result.threeDSData);
      } else if (result.success) {
        // Payment completed without 3DS
        Alert.alert('Success', 'Payment completed successfully!');
      } else {
        // Payment failed
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed');
      console.error('Payment error:', error);
    }
  };

  const handle3DSChallenge = async (threeDSData) => {
    try {
      // Build the 3DS challenge URL with deep link
      const challengeUrl = ThreeDSHandler.buildChallengeUrl(threeDSData, {
        deepLink: 'myapp://payment-complete',
        autoClose: true
      });

      // Open in system browser
      const canOpen = await Linking.canOpenURL(challengeUrl);
      if (canOpen) {
        await Linking.openURL(challengeUrl);
      } else {
        Alert.alert('Error', 'Cannot open 3DS challenge');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open 3DS challenge');
      console.error('3DS error:', error);
    }
  };

  const checkPaymentStatus = async () => {
    // Poll payment status after 3DS completion
    // This is where you'd check if the payment was successful
    try {
      // const status = await tunaSDK.getPaymentStatus(paymentId);
      // Handle status result
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  return (
    // Your payment UI here
    // ...
  );
};

export default PaymentScreen;
```

## WebView Approach (Alternative)

If you prefer to handle 3DS within your app using a WebView:

```typescript
import React, { useState } from 'react';
import { View, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThreeDSHandler } from '@tuna-software/react-native-sdk';

const PaymentWithWebView = () => {
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');

  const handle3DSWithWebView = (threeDSData) => {
    // Build challenge URL without deep link (since we're staying in app)
    const challengeUrl = ThreeDSHandler.buildChallengeUrl(threeDSData, {
      autoClose: false // Don't auto-close since we're in WebView
    });

    setWebViewUrl(challengeUrl);
    setShowWebView(true);
  };

  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    
    try {
      const data = JSON.parse(message);
      
      if (data.type === '3DSComplete' || data.type === 'closeWebView') {
        setShowWebView(false);
        // Handle 3DS completion
        if (data.result === 'Success') {
          Alert.alert('Success', '3DS authentication completed!');
        } else {
          Alert.alert('Failed', '3DS authentication failed');
        }
      }
    } catch (error) {
      // Handle non-JSON messages
      console.log('WebView message:', message);
    }
  };

  return (
    <View>
      {/* Your payment UI */}
      
      <Modal visible={showWebView} animationType="slide">
        <WebView
          source={{ uri: webViewUrl }}
          onMessage={handleWebViewMessage}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
        />
      </Modal>
    </View>
  );
};
```

## Configuration Options

```typescript
interface ThreeDSConfig {
  deepLink?: string;      // Deep link to return to app
  autoClose?: boolean;    // Auto-close browser (default: true)  
  landingUrl?: string;    // Custom landing page URL
}

// Example configurations
const configs = {
  // Production with deep link
  production: {
    deepLink: 'myapp://payment-complete',
    autoClose: true
  },
  
  // Development/testing
  development: {
    autoClose: false, // Keep browser open for debugging
  },
  
  // Custom landing page
  custom: {
    landingUrl: 'https://your-custom-landing.com',
    deepLink: 'myapp://3ds-done'
  }
};
```

## Deep Link URL Scheme Setup

### iOS (Info.plist)
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>myapp.payment</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

### Android (AndroidManifest.xml)
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

## Notes

- The 3DS landing page automatically detects when the challenge is complete
- It can either redirect to your deep link or auto-close the browser
- The landing page works on both iOS and Android browsers
- Deep linking is recommended for the best user experience
- WebView approach keeps users within your app but requires more setup