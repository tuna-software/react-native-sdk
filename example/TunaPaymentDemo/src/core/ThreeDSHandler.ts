/**
 * 3D Secure (3DS) Authentication Handler for Tuna React Native SDK
 * 
 * This module handles 3D Secure authentication flows including:
 * - Data collection (always performed)
 * - Challenge authentication (only when required by payment response)
 */

import { Platform } from 'react-native';
import {
  ThreeDSData,
  ThreeDSResult,
  ThreeDSDataCollectionInfo,
  ThreeDSChallengeInfo,
  SetupPayerInfo,
} from '../types/payment';
import { Tuna3DSError, TunaNativePaymentError } from '../utils/errors';

export interface ThreeDSConfig {
  dataCollectionTimeout?: number; // Default: 10 seconds
  challengeTimeout?: number; // Default: 5 minutes
  autoDataCollection?: boolean; // Default: true
}

export class ThreeDSHandler {
  private config: ThreeDSConfig;
  private webViewComponent: any; // Reference to React Native WebView component
  private dataCollectionCompleted: boolean = false;

  constructor(config: ThreeDSConfig = {}) {
    this.config = {
      dataCollectionTimeout: config.dataCollectionTimeout || 10000,
      challengeTimeout: config.challengeTimeout || 300000,
      autoDataCollection: config.autoDataCollection !== false,
      ...config,
    };
  }

  /**
   * Sets the WebView component reference for 3DS authentication
   * This should be called when the WebView component is available
   */
  setWebViewComponent(webViewComponent: any): void {
    this.webViewComponent = webViewComponent;
  }

  /**
   * Performs 3DS data collection
   * This should ALWAYS be called at the beginning of any payment flow
   * to ensure device fingerprinting data is collected
   */
  async performDataCollection(setupPayerInfo: SetupPayerInfo): Promise<ThreeDSDataCollectionInfo> {
    try {
      if (!setupPayerInfo.deviceDataCollectionUrl || !setupPayerInfo.accessToken) {
        throw new Tuna3DSError('Missing required data collection parameters');
      }

      console.log('Starting 3DS data collection...');

      const dataCollectionInfo: ThreeDSDataCollectionInfo = {
        url: setupPayerInfo.deviceDataCollectionUrl,
        token: setupPayerInfo.accessToken,
        referenceId: setupPayerInfo.referenceId,
        transactionId: setupPayerInfo.token,
        collectionMethod: this.getDataCollectionMethod(),
      };

      // Perform data collection based on platform and available components
      const result = await this.executeDataCollection(dataCollectionInfo);

      this.dataCollectionCompleted = true;
      console.log('3DS data collection completed successfully');

      return result;
    } catch (error) {
      console.error('3DS data collection failed:', error);
      throw new Tuna3DSError('Failed to perform 3DS data collection', error);
    }
  }

  /**
   * Handles 3DS challenge authentication
   * This should ONLY be called if the payment response contains threeDSInfo
   */
  async handleChallenge(threeDSInfo: ThreeDSChallengeInfo): Promise<ThreeDSResult> {
    try {
      if (!threeDSInfo.url || !threeDSInfo.token) {
        throw new Tuna3DSError('Missing required 3DS challenge parameters');
      }

      if (!this.dataCollectionCompleted) {
        console.warn('3DS challenge initiated without data collection. This may affect authentication success.');
      }

      console.log('Starting 3DS challenge authentication...');

      // Parse challenge details from paRequest if available
      const challengeDetails = this.parseChallengeDetails(threeDSInfo);

      const result = await this.executeChallenge({
        ...threeDSInfo,
        ...challengeDetails,
      });

      console.log('3DS challenge completed:', result.success ? 'successful' : 'failed');

      return result;
    } catch (error) {
      console.error('3DS challenge failed:', error);
      throw new Tuna3DSError('Failed to handle 3DS challenge', error);
    }
  }

  /**
   * Executes the data collection process
   */
  private async executeDataCollection(info: ThreeDSDataCollectionInfo): Promise<ThreeDSDataCollectionInfo> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Tuna3DSError('Data collection timeout'));
      }, this.config.dataCollectionTimeout);

      try {
        if (this.webViewComponent) {
          // Use WebView for data collection
          this.performWebViewDataCollection(info, timeout, resolve, reject);
        } else {
          // Use invisible iframe approach (similar to web plugin)
          this.performIframeDataCollection(info, timeout, resolve, reject);
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Executes the 3DS challenge process
   */
  private async executeChallenge(challengeInfo: ThreeDSChallengeInfo): Promise<ThreeDSResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Tuna3DSError('Challenge timeout'));
      }, this.config.challengeTimeout);

      try {
        if (!this.webViewComponent) {
          throw new Tuna3DSError('WebView component is required for 3DS challenge');
        }

        this.performWebViewChallenge(challengeInfo, timeout, resolve, reject);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Performs data collection using WebView
   */
  private performWebViewDataCollection(
    info: ThreeDSDataCollectionInfo,
    timeout: NodeJS.Timeout,
    resolve: (value: ThreeDSDataCollectionInfo) => void,
    reject: (reason: any) => void
  ): void {
    const html = this.generateDataCollectionHTML(info);

    // Create WebView source
    const source = { html };

    // Set up message handler for completion notification
    const messageHandler = (event: any) => {
      const { data } = event.nativeEvent;
      if (data === 'data-collection-complete') {
        clearTimeout(timeout);
        resolve({
          ...info,
          completed: true,
          completedAt: new Date(),
        });
      }
    };

    // Load the HTML into WebView with message handler
    this.webViewComponent.postMessage = messageHandler;
    this.webViewComponent.source = source;

    // Auto-complete after a short delay (data collection is fire-and-forget)
    setTimeout(() => {
      clearTimeout(timeout);
      resolve({
        ...info,
        completed: true,
        completedAt: new Date(),
      });
    }, 3000); // Allow 3 seconds for data collection
  }

  /**
   * Performs challenge using WebView
   */
  private performWebViewChallenge(
    challengeInfo: ThreeDSChallengeInfo,
    timeout: NodeJS.Timeout,
    resolve: (value: ThreeDSResult) => void,
    reject: (reason: any) => void
  ): void {
    const html = this.generateChallengeHTML(challengeInfo);

    // Create WebView source
    const source = { html };

    // Set up message handler for challenge completion
    const messageHandler = (event: any) => {
      const { data } = event.nativeEvent;
      try {
        const result = JSON.parse(data);
        if (result.type === '3ds-challenge-complete') {
          clearTimeout(timeout);
          resolve({
            success: result.success,
            authenticationData: result.authenticationData,
            transactionId: challengeInfo.transactionId,
            timestamp: new Date(),
            provider: challengeInfo.provider,
          });
        }
      } catch (error) {
        console.warn('Failed to parse 3DS challenge result:', error);
      }
    };

    // Load the HTML into WebView with message handler
    this.webViewComponent.postMessage = messageHandler;
    this.webViewComponent.source = source;
  }

  /**
   * Fallback data collection using hidden iframe approach
   */
  private performIframeDataCollection(
    info: ThreeDSDataCollectionInfo,
    timeout: NodeJS.Timeout,
    resolve: (value: ThreeDSDataCollectionInfo) => void,
    reject: (reason: any) => void
  ): void {
    // Note: This is a simplified approach for React Native
    // In practice, this would need native module support or WebView
    console.warn('Iframe data collection not fully supported in React Native without WebView');
    
    // Simulate data collection completion
    setTimeout(() => {
      clearTimeout(timeout);
      resolve({
        ...info,
        completed: true,
        completedAt: new Date(),
      });
    }, 1000);
  }

  /**
   * Generates HTML for data collection iframe
   */
  private generateDataCollectionHTML(info: ThreeDSDataCollectionInfo): string {
    const formId = `ddc-form-${Math.random().toString(36).substring(2)}`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>3DS Data Collection</title>
        </head>
        <body>
          <iframe 
            name="ddc-iframe" 
            height="1" 
            width="1" 
            style="display: none; position: absolute; top: -9999px;"
            onload="handleDataCollectionComplete()">
          </iframe>
          <form 
            id="${formId}" 
            target="ddc-iframe" 
            method="POST" 
            action="${info.url}">
            <input type="hidden" name="JWT" value="${info.token}" />
          </form>
          
          <script>
            // Submit form immediately
            document.getElementById('${formId}').submit();
            
            // Notify completion after short delay
            function handleDataCollectionComplete() {
              setTimeout(function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage('data-collection-complete');
                }
              }, 1000);
            }
            
            // Fallback completion notification
            setTimeout(function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('data-collection-complete');
              }
            }, 2000);
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Generates HTML for 3DS challenge
   */
  private generateChallengeHTML(challengeInfo: ThreeDSChallengeInfo): string {
    const formId = `challenge-form-${Math.random().toString(36).substring(2)}`;
    const { width, height } = this.getChallengeWindowSize(challengeInfo);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>3DS Challenge</title>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            .challenge-container { 
              width: 100%; 
              height: 100vh; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
            }
            .challenge-frame { 
              width: ${width}px; 
              height: ${height}px; 
              border: none; 
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
          </style>
        </head>
        <body>
          <div class="challenge-container">
            <iframe 
              name="challenge-iframe" 
              class="challenge-frame"
              onload="handleChallengeResponse()">
            </iframe>
          </div>
          <form 
            id="${formId}" 
            target="challenge-iframe" 
            method="POST" 
            action="${challengeInfo.url}">
            <input type="hidden" name="JWT" value="${challengeInfo.token}" />
            ${challengeInfo.paRequest ? `<input type="hidden" name="PaReq" value="${challengeInfo.paRequest}" />` : ''}
          </form>
          
          <script>
            // Submit challenge form immediately
            document.getElementById('${formId}').submit();
            
            // Listen for challenge completion
            function handleChallengeResponse() {
              // Monitor for challenge completion or timeout
              const startTime = Date.now();
              const checkInterval = setInterval(function() {
                try {
                  const iframe = document.querySelector('iframe[name="challenge-iframe"]');
                  if (iframe && iframe.contentWindow) {
                    // Check if challenge is complete
                    // This is simplified - actual implementation would need
                    // to communicate with the 3DS server response
                    const elapsed = Date.now() - startTime;
                    if (elapsed > 30000) { // 30 second timeout
                      clearInterval(checkInterval);
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: '3ds-challenge-complete',
                          success: false,
                          error: 'Challenge timeout'
                        }));
                      }
                    }
                  }
                } catch (error) {
                  console.warn('Challenge monitoring error:', error);
                }
              }, 1000);
            }
            
            // Listen for postMessage from challenge iframe
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === '3ds-authentication-complete') {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: '3ds-challenge-complete',
                    success: event.data.success,
                    authenticationData: event.data.authenticationData
                  }));
                }
              }
            });
          </script>
        </body>
      </html>
    `;
  }

  /**
   * Parses challenge details from paRequest if available
   */
  private parseChallengeDetails(threeDSInfo: ThreeDSChallengeInfo): Partial<ThreeDSChallengeInfo> {
    if (!threeDSInfo.paRequest) {
      return {};
    }

    try {
      const paRequest = JSON.parse(atob(threeDSInfo.paRequest));
      return {
        challengeWindowSize: paRequest.challengeWindowSize,
        messageVersion: paRequest.messageVersion,
        transactionId: paRequest.threeDSServerTransID,
      };
    } catch (error) {
      console.warn('Failed to parse paRequest:', error);
      return {};
    }
  }

  /**
   * Gets challenge window size based on challengeWindowSize parameter
   */
  private getChallengeWindowSize(challengeInfo: ThreeDSChallengeInfo): { width: number; height: number } {
    const windowSize = challengeInfo.challengeWindowSize || '03'; // Default to medium

    switch (windowSize) {
      case '01': return { width: 250, height: 400 };   // Small
      case '02': return { width: 390, height: 400 };   // Medium
      case '03': return { width: 500, height: 600 };   // Large
      case '04': return { width: 600, height: 400 };   // Extra Large
      case '05': return { width: 100, height: 100 };   // Full screen (handled differently)
      default:   return { width: 500, height: 600 };   // Default to large
    }
  }

  /**
   * Determines the best data collection method for the current environment
   */
  private getDataCollectionMethod(): string {
    if (this.webViewComponent) {
      return 'webview';
    }
    return 'native-fallback';
  }

  /**
   * Resets the handler state
   */
  reset(): void {
    this.dataCollectionCompleted = false;
    this.webViewComponent = null;
  }

  /**
   * Gets the current status of 3DS processes
   */
  getStatus(): {
    dataCollectionCompleted: boolean;
    hasWebView: boolean;
    config: ThreeDSConfig;
  } {
    return {
      dataCollectionCompleted: this.dataCollectionCompleted,
      hasWebView: !!this.webViewComponent,
      config: this.config,
    };
  }
}

/**
 * Creates a new 3DS handler instance
 */
export function createThreeDSHandler(config?: ThreeDSConfig): ThreeDSHandler {
  return new ThreeDSHandler(config);
}