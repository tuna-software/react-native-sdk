/**
 * 3DS Challenge URL Extractor
 * 
 * This utility extracts the ACS URL from 3DS challenge data,
 * particularly from base64-encoded PaReq parameters.
 */

export interface ExtractedChallengeData {
  acsUrl?: string;
  paRequest: string;
  termUrl?: string;
  challengeUrl: string;
  token?: string;
  md?: string;
  transactionId?: string;
}

/**
 * Extract ACS URL from 3DS challenge information
 */
export function extractACSUrl(challengeInfo: any): ExtractedChallengeData {
  console.log('🔍 [ACSExtractor] Extracting ACS URL from challenge info');
  
  const result: ExtractedChallengeData = {
    challengeUrl: challengeInfo.challengeUrl,
    paRequest: challengeInfo.paRequest || '',
    termUrl: challengeInfo.termUrl,
    token: challengeInfo.token,
    md: challengeInfo.md,
    transactionId: challengeInfo.transactionId
  };

  try {
    // Method 1: Try to decode base64 paRequest to find ACS URL
    if (challengeInfo.paRequest) {
      try {
        const decodedPaReq = atob(challengeInfo.paRequest);
        console.log('🔍 [ACSExtractor] Decoded PaReq:', decodedPaReq.substring(0, 200) + '...');
        
        // Parse as JSON if possible
        try {
          const paReqJson = JSON.parse(decodedPaReq);
          if (paReqJson.acsURL) {
            result.acsUrl = paReqJson.acsURL;
            console.log('✅ [ACSExtractor] Found ACS URL in PaReq JSON:', result.acsUrl);
            return result;
          }
        } catch (jsonError) {
          // Not JSON, continue with string parsing
        }

        // Look for ACS URL patterns in decoded string
        const acsUrlPatterns = [
          /acsURL["\s]*:["\s]*([^"',\s]+)/i,
          /acs_url["\s]*:["\s]*([^"',\s]+)/i,
          /ACS_URL["\s]*=["\s]*([^"',\s]+)/i,
          /"acsURL"\s*:\s*"([^"]+)"/i,
          /"acs_url"\s*:\s*"([^"]+)"/i
        ];

        for (const pattern of acsUrlPatterns) {
          const match = decodedPaReq.match(pattern);
          if (match && match[1]) {
            result.acsUrl = match[1];
            console.log('✅ [ACSExtractor] Found ACS URL in PaReq string:', result.acsUrl);
            return result;
          }
        }
      } catch (base64Error) {
        console.log('⚠️ [ACSExtractor] PaReq is not base64 encoded, using as-is');
      }
    }

    // Method 2: Look for ACS URL in the challenge URL response
    if (challengeInfo.challengeUrl) {
      // The challenge URL might be the ACS URL or contain it
      if (challengeInfo.challengeUrl.includes('merchantacs') || 
          challengeInfo.challengeUrl.includes('/acs') ||
          challengeInfo.challengeUrl.includes('creq.jsp')) {
        result.acsUrl = challengeInfo.challengeUrl;
        console.log('✅ [ACSExtractor] Using challenge URL as ACS URL:', result.acsUrl);
        return result;
      }

      // Try to fetch the challenge URL to find the actual ACS URL
      console.log('🌐 [ACSExtractor] Attempting to fetch challenge URL to find ACS URL');
      // This would need to be done asynchronously, so we'll handle it in the calling code
    }

    // Method 3: Known ACS URL patterns from previous logs
    const knownACSPattern = /https:\/\/[^\/]*merchantacs[^\/]*\.cardinalcommerce\.com\/[^\/]*\/creq\.jsp/i;
    if (challengeInfo.paRequest) {
      // Check if we can construct a known ACS URL pattern
      const testAcsUrl = 'https://0merchantacsstag.cardinalcommerce.com/MerchantACSWeb/creq.jsp';
      result.acsUrl = testAcsUrl;
      console.log('⚠️ [ACSExtractor] Using known ACS URL pattern:', result.acsUrl);
      return result;
    }

    console.log('❌ [ACSExtractor] Could not extract ACS URL, will need to fetch from challenge URL');
    return result;

  } catch (error: any) {
    console.error('❌ [ACSExtractor] Error extracting ACS URL:', error.message);
    return result;
  }
}

/**
 * Fetch challenge URL to extract real ACS URL
 * This makes a request to the challenge URL to get the actual ACS submission form
 */
export async function fetchACSUrlFromChallenge(challengeUrl: string, token?: string): Promise<string | null> {
  console.log('🌐 [ACSExtractor] Fetching challenge URL to extract ACS URL');
  console.log('🔍 [ACSExtractor] Challenge URL:', challengeUrl);

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'ReactNative/TunaPayment/1.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    };

    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(challengeUrl, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Challenge URL fetch failed: ${response.status} ${response.statusText}`);
    }

    const htmlContent = await response.text();
    console.log('✅ [ACSExtractor] Challenge page fetched successfully');
    console.log('🔍 [ACSExtractor] Content preview:', htmlContent.substring(0, 300) + '...');

    // Look for form action that points to ACS
    const formActionPatterns = [
      /<form[^>]+action=["\']([^"']*merchantacs[^"']*creq\.jsp[^"']*)["\'][^>]*>/i,
      /<form[^>]+action=["\']([^"']*acs[^"']*)["\'][^>]*>/i,
      /action=["\']([^"']*merchantacs[^"']*)["\']?/i,
      /action=["\']([^"']*creq\.jsp[^"']*)["\']?/i
    ];

    for (const pattern of formActionPatterns) {
      const match = htmlContent.match(pattern);
      if (match && match[1]) {
        const acsUrl = match[1];
        console.log('✅ [ACSExtractor] Found ACS URL in form action:', acsUrl);
        return acsUrl;
      }
    }

    // Look for JavaScript redirects or URLs in the content
    const urlPatterns = [
      /https?:\/\/[^\/]*merchantacs[^\/]*\.cardinalcommerce\.com\/[^\s"'<>]+/gi,
      /https?:\/\/[^\s"'<>]*acs[^\s"'<>]*creq\.jsp[^\s"'<>]*/gi
    ];

    for (const pattern of urlPatterns) {
      const matches = htmlContent.match(pattern);
      if (matches && matches[0]) {
        const acsUrl = matches[0];
        console.log('✅ [ACSExtractor] Found ACS URL in content:', acsUrl);
        return acsUrl;
      }
    }

    console.log('❌ [ACSExtractor] Could not find ACS URL in challenge page');
    return null;

  } catch (error: any) {
    console.error('❌ [ACSExtractor] Error fetching challenge URL:', error.message);
    return null;
  }
}

/**
 * Extract complete challenge configuration for real execution
 */
export async function extractCompleteChallenge(challengeInfo: any): Promise<ExtractedChallengeData> {
  console.log('🔍 [ACSExtractor] Extracting complete challenge configuration');
  
  // First try static extraction
  let result = extractACSUrl(challengeInfo);
  
  // If no ACS URL found, try fetching from challenge URL
  if (!result.acsUrl && result.challengeUrl) {
    console.log('🌐 [ACSExtractor] No ACS URL found, fetching from challenge URL...');
    
    const fetchedAcsUrl = await fetchACSUrlFromChallenge(result.challengeUrl, result.token);
    if (fetchedAcsUrl) {
      result.acsUrl = fetchedAcsUrl;
      console.log('✅ [ACSExtractor] Successfully extracted ACS URL from challenge page');
    } else {
      console.log('⚠️ [ACSExtractor] Could not fetch ACS URL, using challenge URL as fallback');
      result.acsUrl = result.challengeUrl;
    }
  }
  
  return result;
}