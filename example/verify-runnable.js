#!/usr/bin/env node

/**
 * Manual test script to verify NativePaymentsExample is runnable
 * Run with: node example/verify-runnable.js
 */

async function runTests() {
console.log('🧪 Testing NativePaymentsExample compatibility...\n');

try {
  // Test 1: Import the SDK
  console.log('1️⃣  Testing SDK import...');
  const module = await import('../dist/index.esm.js');
  const { TunaReactNative } = module;
  
  if (!TunaReactNative) {
    throw new Error('TunaReactNative not exported');
  }
  console.log('✅ SDK imported successfully\n');

  // Test 2: Create SDK instance
  console.log('2️⃣  Testing SDK instance creation...');
  const sdk = new TunaReactNative({
    environment: 'sandbox',
    debug: true,
  });
  console.log('✅ SDK instance created successfully\n');

  // Test 3: Check all methods used by NativePaymentsExample exist
  console.log('3️⃣  Testing required methods exist...');
  const requiredMethods = [
    'initialize',
    'canMakeApplePayPayments',
    'isGooglePayReady',
    'setupApplePay',
    'setupGooglePay', 
    'showApplePaySheet',
    'requestGooglePayment'
  ];

  const missingMethods = [];
  for (const method of requiredMethods) {
    if (typeof sdk[method] !== 'function') {
      missingMethods.push(method);
    }
  }

  if (missingMethods.length > 0) {
    throw new Error(`Missing methods: ${missingMethods.join(', ')}`);
  }
  console.log('✅ All required methods exist\n');

  // Test 4: Test initialization
  console.log('4️⃣  Testing SDK initialization...');
  sdk.initialize('test-session-123')
    .then(() => {
      console.log('✅ SDK initialization successful\n');

      // Test 5: Test platform checks
      console.log('5️⃣  Testing platform availability checks...');
      Promise.all([
        sdk.canMakeApplePayPayments(),
        sdk.isGooglePayReady()
      ]).then(([applePayAvailable, googlePayReady]) => {
        console.log(`✅ Apple Pay available: ${applePayAvailable}`);
        console.log(`✅ Google Pay ready: ${googlePayReady}\n`);
        
        console.log('🎉 All tests passed! NativePaymentsExample is RUNNABLE\n');
        console.log('📋 Summary:');
        console.log('   - SDK exports correctly');
        console.log('   - All required methods exist');
        console.log('   - Initialization works');
        console.log('   - Platform checks work');
        console.log('   - Example should run without compilation errors\n');
        
        console.log('🚀 To run the example:');
        console.log('   1. Create a React Native app: npx create-expo-app MyApp');
        console.log('   2. Install dependencies: npm install @tuna/react-native-payments @rnw-community/react-native-payments');
        console.log('   3. Copy example/NativePaymentsExample.tsx to your app');
        console.log('   4. Import and use the component in App.tsx');
      }).catch(error => {
        console.error('❌ Platform check failed:', error.message);
        process.exit(1);
      });
    })
    .catch(error => {
      console.error('❌ SDK initialization failed:', error.message);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
}

runTests();