// Simple Node.js test for PIX authentication fix
const { TunaReactNativeReal } = require('./src/TunaReactNativeReal.ts');

async function testPIX() {
  console.log('🧪 Testing PIX payment authentication...');
  
  try {
    const tuna = new TunaReactNativeReal();
    
    // Initialize with test configuration
    await tuna.initSession({
      appToken: 'test_token_123',
      partnerUniqueId: 'test_partner_123',
      amount: 100,
      customerEmail: 'test@example.com',
      environment: 'staging', // Use staging for tests
      debug: true
    });
    
    // Test PIX payment generation
    const customer = {
      name: 'João Silva',
      document: '12345678901', // CPF
      email: 'joao@test.com'
    };
    
    const pixResult = await tuna.generatePIXPayment(100, customer);
    console.log('✅ PIX payment result:', pixResult);
    
  } catch (error) {
    console.log('❌ PIX test error:', error.message);
    console.log('📊 Error details:', error);
  }
}

testPIX();