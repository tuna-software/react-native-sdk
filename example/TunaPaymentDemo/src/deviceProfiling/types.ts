/**
 * Device Profiling Types
 */

export interface MercadoPagoConfig {
  publicKey: string;
  environment: 'test' | 'production';
}

export interface DeviceProfilerResult {
  sessionId: string;
  provider: string;
  timestamp: Date;
}
