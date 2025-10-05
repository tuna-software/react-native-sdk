import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function NativePaymentsExample() {
  const showInstallInstructions = () => {
    Alert.alert(
      '📦 Install Required Packages',
      'Run these commands in your terminal:\n\n' +
      '1. npm install file:../../\n' +
      '2. npm install @rnw-community/react-native-payments\n' +
      '3. npx expo start --clear',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Tuna Native Payments</Text>
      
      <View style={styles.setupBox}>
        <Text style={styles.setupTitle}>📦 Setup Required</Text>
        <Text style={styles.setupText}>
          Before using native payments, install the required dependencies.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={showInstallInstructions}>
          <Text style={styles.buttonText}>Show Install Instructions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>✨ Coming Soon:</Text>
        <Text style={styles.featureText}>
          • Native Apple Pay integration{'\n'}
          • Native Google Pay integration{'\n'}
          • No WebView dependencies{'\n'}
          • Real payment processing{'\n'}
          • Platform-specific UI
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  setupBox: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404',
  },
  setupText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#856404',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  featureBox: {
    backgroundColor: '#d1ecf1',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0c5460',
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0c5460',
  },
});