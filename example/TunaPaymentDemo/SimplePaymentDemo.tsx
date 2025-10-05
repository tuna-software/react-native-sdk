import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Platform,
  ScrollView 
} from 'react-native';

export default function SimplePaymentDemo() {
  const handlePayment = (method: string) => {
    Alert.alert(
      '🚀 Payment Demo',
      `You selected ${method}!\n\nThis is a demo app showing the Tuna React Native SDK integration.\n\nNext steps:\n1. Configure your Tuna credentials\n2. Set up Apple Pay/Google Pay\n3. Test on a real device`,
      [{ text: 'Got it!' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚀 Tuna Payments</Text>
        <Text style={styles.subtitle}>React Native SDK Demo</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>✅ Setup Complete!</Text>
        <Text style={styles.statusText}>
          Your Tuna React Native SDK is ready for payment processing.
        </Text>
      </View>

      <View style={styles.platformCard}>
        <Text style={styles.cardTitle}>Platform: {Platform.OS}</Text>
        <Text style={styles.cardText}>
          {Platform.OS === 'ios' 
            ? '🍎 Apple Pay integration ready' 
            : '🤖 Google Pay integration ready'}
        </Text>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.cardTitle}>Available Payment Methods</Text>
        
        {Platform.OS === 'ios' && (
          <TouchableOpacity 
            style={[styles.button, styles.applePayButton]}
            onPress={() => handlePayment('Apple Pay')}
          >
            <Text style={styles.applePayText}>🍎 Apple Pay</Text>
          </TouchableOpacity>
        )}

        {Platform.OS === 'android' && (
          <TouchableOpacity 
            style={[styles.button, styles.googlePayButton]}
            onPress={() => handlePayment('Google Pay')}
          >
            <Text style={styles.googlePayText}>G Pay</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.creditCardButton]}
          onPress={() => handlePayment('Credit Card')}
        >
          <Text style={styles.creditCardText}>💳 Credit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.pixButton]}
          onPress={() => handlePayment('PIX')}
        >
          <Text style={styles.pixText}>🇧🇷 PIX</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>ℹ️ Next Steps</Text>
        <Text style={styles.infoText}>
          1. Configure your Tuna merchant credentials{'\n'}
          2. Set up Apple Pay (iOS) or Google Pay (Android){'\n'}
          3. Test on a physical device{'\n'}
          4. Switch to production environment{'\n'}
          5. Launch your payment integration!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#d4edda',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  platformCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
  paymentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  applePayButton: {
    backgroundColor: '#000',
  },
  applePayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  googlePayButton: {
    backgroundColor: '#4285F4',
  },
  googlePayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  creditCardButton: {
    backgroundColor: '#6c757d',
  },
  creditCardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pixButton: {
    backgroundColor: '#28a745',
  },
  pixText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});