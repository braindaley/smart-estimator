/**
 * Token Store Utility for Plaid Access Tokens
 * 
 * WARNING: This is an in-memory store for development purposes only.
 * In production, replace this with a proper database solution (Redis, PostgreSQL, etc.)
 * to ensure tokens persist across server restarts and scale across multiple instances.
 */

/**
 * In-memory storage for access tokens
 * @type {Map<string, string>}
 */
const tokenStorage = new Map();

/**
 * Debug function to log token operations
 */
function logTokenOperation(operation, userId, details = '') {
  const timestamp = new Date().toISOString();
  console.log(`[TokenStore ${timestamp}] ${operation} - UserID: ${userId}${details ? ` - ${details}` : ''}`);
  console.log(`[TokenStore] Current storage size: ${tokenStorage.size}`);
  console.log(`[TokenStore] All stored users:`, Array.from(tokenStorage.keys()));
}

/**
 * Stores an access token for a given user ID
 * 
 * @param {string} userId - The unique identifier for the user
 * @param {string} accessToken - The Plaid access token to store
 * @returns {boolean} Returns true if token was stored successfully
 * @throws {Error} Throws error if userId or accessToken is invalid
 * 
 * @example
 * const success = storeToken('user123', 'access-sandbox-abc123');
 * if (success) {
 *   console.log('Token stored successfully');
 * }
 */
export function storeToken(userId, accessToken) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
    
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token must be a non-empty string');
    }

    tokenStorage.set(userId, accessToken);
    logTokenOperation('STORED', userId, `Token: ${accessToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logTokenOperation('STORE_ERROR', userId, error.message);
    throw error;
  }
}

/**
 * Retrieves an access token for a given user ID
 * 
 * @param {string} userId - The unique identifier for the user
 * @returns {string|null} Returns the access token if found, null otherwise
 * @throws {Error} Throws error if userId is invalid
 * 
 * @example
 * const token = getToken('user123');
 * if (token) {
 *   console.log('Token found:', token);
 * } else {
 *   console.log('No token found for user');
 * }
 */
export function getToken(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const token = tokenStorage.get(userId);
    if (!token) {
      logTokenOperation('GET_MISS', userId, 'Token not found');
      return null;
    }

    logTokenOperation('GET_HIT', userId, `Token: ${token.substring(0, 20)}...`);
    return token;
  } catch (error) {
    logTokenOperation('GET_ERROR', userId, error.message);
    throw error;
  }
}

/**
 * Removes an access token for a given user ID
 * 
 * @param {string} userId - The unique identifier for the user
 * @returns {boolean} Returns true if token was removed, false if token didn't exist
 * @throws {Error} Throws error if userId is invalid
 * 
 * @example
 * const removed = removeToken('user123');
 * if (removed) {
 *   console.log('Token removed successfully');
 * } else {
 *   console.log('No token found to remove');
 * }
 */
export function removeToken(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const existed = tokenStorage.delete(userId);
    if (existed) {
      logTokenOperation('REMOVED', userId, '');
    } else {
      logTokenOperation('REMOVE_MISS', userId, 'Token did not exist');
    }
    return existed;
  } catch (error) {
    logTokenOperation('REMOVE_ERROR', userId, error.message);
    throw error;
  }
}

/**
 * Checks if a token exists for a given user ID
 * 
 * @param {string} userId - The unique identifier for the user
 * @returns {boolean} Returns true if token exists, false otherwise
 * @throws {Error} Throws error if userId is invalid
 * 
 * @example
 * if (hasToken('user123')) {
 *   console.log('User has a stored token');
 * }
 */
export function hasToken(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    const exists = tokenStorage.has(userId);
    logTokenOperation('HAS_CHECK', userId, `Exists: ${exists}`);
    return exists;
  } catch (error) {
    logTokenOperation('HAS_ERROR', userId, error.message);
    throw error;
  }
}

/**
 * Gets the current number of stored tokens (for debugging/monitoring)
 * 
 * @returns {number} The number of tokens currently stored
 * 
 * @example
 * console.log(`Currently storing ${getTokenCount()} tokens`);
 */
export function getTokenCount() {
  return tokenStorage.size;
}

/**
 * Clears all stored tokens (useful for testing or cleanup)
 * 
 * @returns {void}
 * 
 * @example
 * clearAllTokens(); // Removes all stored tokens
 */
export function clearAllTokens() {
  const count = tokenStorage.size;
  tokenStorage.clear();
  logTokenOperation('CLEAR_ALL', 'system', `Cleared ${count} tokens`);
}

/**
 * Gets debug information about all stored tokens
 * 
 * @returns {Array} Array of token information for debugging
 */
export function getDebugInfo() {
  const info = [];
  for (const [userId, token] of tokenStorage.entries()) {
    info.push({
      userId,
      tokenPrefix: token.substring(0, 20) + '...',
      tokenLength: token.length
    });
  }
  return info;
}

// Log when the module is loaded
console.log('[TokenStore] Module loaded, storage initialized');

// In development, log storage state periodically
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (tokenStorage.size > 0) {
      console.log(`[TokenStore Debug] Currently storing ${tokenStorage.size} tokens:`, getDebugInfo());
    }
  }, 30000); // Log every 30 seconds if there are tokens
}