/**
 * 3D Secure (3DS) Authentication Handler for Tuna React Native SDK
 *
 * This module handles 3D Secure authentication flows including:
 * - Data collection (always performed)
 * - Challenge authentication (only when required by payment response)
 */
import { ThreeDSResult, ThreeDSDataCollectionInfo, ThreeDSChallengeInfo, SetupPayerInfo } from '../types/payment';
export interface ThreeDSConfig {
    dataCollectionTimeout?: number;
    challengeTimeout?: number;
    autoDataCollection?: boolean;
}
export declare class ThreeDSHandler {
    private config;
    private webViewComponent;
    private dataCollectionCompleted;
    constructor(config?: ThreeDSConfig);
    /**
     * Sets the WebView component reference for 3DS authentication
     * This should be called when the WebView component is available
     */
    setWebViewComponent(webViewComponent: any): void;
    /**
     * Performs 3DS data collection
     * This should ALWAYS be called at the beginning of any payment flow
     * to ensure device fingerprinting data is collected
     */
    performDataCollection(setupPayerInfo: SetupPayerInfo): Promise<ThreeDSDataCollectionInfo>;
    /**
     * Handles 3DS challenge authentication
     * This should ONLY be called if the payment response contains threeDSInfo
     */
    handleChallenge(threeDSInfo: ThreeDSChallengeInfo): Promise<ThreeDSResult>;
    /**
     * Executes the data collection process
     */
    private executeDataCollection;
    /**
     * Executes the 3DS challenge process
     */
    private executeChallenge;
    /**
     * Performs data collection using WebView
     */
    private performWebViewDataCollection;
    /**
     * Performs challenge using WebView
     */
    private performWebViewChallenge;
    /**
     * Fallback data collection using hidden iframe approach
     */
    private performIframeDataCollection;
    /**
     * Generates HTML for data collection iframe
     */
    private generateDataCollectionHTML;
    /**
     * Generates HTML for 3DS challenge
     */
    private generateChallengeHTML;
    /**
     * Parses challenge details from paRequest if available
     */
    private parseChallengeDetails;
    /**
     * Gets challenge window size based on challengeWindowSize parameter
     */
    private getChallengeWindowSize;
    /**
     * Determines the best data collection method for the current environment
     */
    private getDataCollectionMethod;
    /**
     * Resets the handler state
     */
    reset(): void;
    /**
     * Gets the current status of 3DS processes
     */
    getStatus(): {
        dataCollectionCompleted: boolean;
        hasWebView: boolean;
        config: ThreeDSConfig;
    };
}
/**
 * Creates a new 3DS handler instance
 */
export declare function createThreeDSHandler(config?: ThreeDSConfig): ThreeDSHandler;
//# sourceMappingURL=ThreeDSHandler.d.ts.map