
interface BrowserFingerprint {
  userAgent: string;
  language: string;
  timeZone: string;
  screenResolution: string;
  colorDepth: number;
  platform: string;
  cookieEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
}

export const generateBrowserFingerprint = (): string => {
  try {
    const fingerprint: BrowserFingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      localStorage: typeof Storage !== 'undefined' && !!window.localStorage,
      sessionStorage: typeof Storage !== 'undefined' && !!window.sessionStorage,
    };

    // Create a simple hash from the fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.warn('Error generating browser fingerprint:', error);
    // Fallback to a simple timestamp-based identifier
    return Date.now().toString(16);
  }
};

export const getBrowserFingerprint = (): string => {
  const storageKey = process.env.NEXT_PUBLIC_FINGERPRINT_KEY || 'browser_fingerprint';
  
  try {
    // Try to get existing fingerprint from localStorage
    let fingerprint = localStorage.getItem(storageKey);
    
    if (!fingerprint) {
      // Generate new fingerprint and store it
      fingerprint = generateBrowserFingerprint();
      localStorage.setItem(storageKey, fingerprint);
    }
    
    return fingerprint;
  } catch (error) {
    console.warn('Error accessing localStorage for fingerprint:', error);
    // If localStorage is not available, generate a session-only fingerprint
    return generateBrowserFingerprint();
  }
};
