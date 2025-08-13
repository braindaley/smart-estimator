'use client';

/**
 * Client-side token storage for development
 * This persists tokens across server restarts during development
 */

const TOKEN_STORAGE_KEY = 'plaid_access_tokens';

/**
 * Store token on client side (localStorage) for development persistence
 */
export function storeTokenClient(userId, accessToken) {
  if (typeof window === 'undefined') return false;
  
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || '{}');
    tokens[userId] = {
      token: accessToken,
      timestamp: Date.now()
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    console.log('[ClientTokenStore] Token stored for user:', userId);
    return true;
  } catch (error) {
    console.error('[ClientTokenStore] Error storing token:', error);
    return false;
  }
}

/**
 * Get token from client side storage
 */
export function getTokenClient(userId) {
  if (typeof window === 'undefined') return null;
  
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || '{}');
    const tokenData = tokens[userId];
    
    if (!tokenData) {
      console.log('[ClientTokenStore] No token found for user:', userId);
      return null;
    }
    
    // Check if token is too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - tokenData.timestamp > maxAge) {
      console.log('[ClientTokenStore] Token expired for user:', userId);
      delete tokens[userId];
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      return null;
    }
    
    console.log('[ClientTokenStore] Token retrieved for user:', userId);
    return tokenData.token;
  } catch (error) {
    console.error('[ClientTokenStore] Error retrieving token:', error);
    return null;
  }
}

/**
 * Clear all tokens
 */
export function clearAllTokensClient() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  console.log('[ClientTokenStore] All tokens cleared');
}

/**
 * Get debug info about stored tokens
 */
export function getTokenDebugInfo() {
  if (typeof window === 'undefined') return [];
  
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || '{}');
    return Object.entries(tokens).map(([userId, data]) => ({
      userId,
      tokenPrefix: data.token.substring(0, 20) + '...',
      age: Date.now() - data.timestamp,
      ageHours: Math.round((Date.now() - data.timestamp) / (1000 * 60 * 60))
    }));
  } catch (error) {
    console.error('[ClientTokenStore] Error getting debug info:', error);
    return [];
  }
}