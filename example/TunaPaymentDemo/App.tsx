import { StatusBar } from 'expo-status-bar';
import React from 'react';
import TunaPaymentExample from './TunaPaymentExample';

export default function App() {
  return (
    <>
      <TunaPaymentExample />
      <StatusBar style="auto" />
    </>
  );
}
