/**
 * Plaid Configuration Utility
 * 
 * This module handles Plaid client configuration, environment validation,
 * and provides helper functions for common Plaid operations.
 */

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

/**
 * Configuration object for environment variable validation
 * @type {Object}
 */
const REQUIRED_ENV_VARS = {
  PLAID_CLIENT_ID: 'Plaid Client ID',
  PLAID_SECRET: 'Plaid Secret Key',
  PLAID_ENV: 'Plaid Environment (sandbox, development, or production)'
};

/**
 * Validates that all required environment variables are present
 * 
 * @throws {Error} Throws detailed error if any required environment variables are missing
 * 
 * @example
 * try {
 *   validateEnvironmentVariables();
 *   console.log('All Plaid environment variables are configured');
 * } catch (error) {
 *   console.error('Missing environment variables:', error.message);
 * }
 */
function validateEnvironmentVariables() {
  const missingVars = [];
  
  for (const [envVar, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[envVar]) {
      missingVars.push(`${envVar} (${description})`);
    }
  }
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required Plaid environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}\n\nPlease ensure these are set in your .env.local file.`;
    throw new Error(errorMessage);
  }
}

/**
 * Validates the Plaid environment value
 * 
 * @param {string} env - The environment value to validate
 * @returns {string} The validated environment value
 * @throws {Error} Throws error if environment value is invalid
 */
function validatePlaidEnvironment(env) {
  const validEnvironments = ['sandbox', 'development', 'production'];
  
  if (!validEnvironments.includes(env)) {
    throw new Error(
      `Invalid PLAID_ENV value: "${env}". Must be one of: ${validEnvironments.join(', ')}`
    );
  }
  
  return env;
}

/**
 * Creates and configures a Plaid client instance
 * 
 * @returns {PlaidApi} Configured Plaid API client
 * @throws {Error} Throws error if configuration fails
 */
function createPlaidClient() {
  try {
    validateEnvironmentVariables();
    
    const plaidEnv = validatePlaidEnvironment(process.env.PLAID_ENV);
    
    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });
    
    console.log(`[Plaid] Client configured for ${plaidEnv} environment`);
    return new PlaidApi(configuration);
  } catch (error) {
    console.error('[Plaid] Configuration failed:', error.message);
    throw error;
  }
}

// Initialize the Plaid client on module load
let plaidClient;
try {
  plaidClient = createPlaidClient();
} catch (error) {
  // In development, log the error but don't crash the app
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Plaid] Client initialization failed:', error.message);
    console.warn('[Plaid] API routes will not function until environment variables are configured');
  } else {
    // In production, this should be a hard failure
    throw error;
  }
}

/**
 * Gets the configured Plaid client instance
 * 
 * @returns {PlaidApi} The configured Plaid API client
 * @throws {Error} Throws error if client is not initialized
 * 
 * @example
 * const client = getPlaidClient();
 * const response = await client.accountsGet({ access_token: token });
 */
export function getPlaidClient() {
  if (!plaidClient) {
    throw new Error('Plaid client is not initialized. Please check your environment variables.');
  }
  return plaidClient;
}

/**
 * Creates a link token for Plaid Link initialization
 * 
 * @param {string} userId - The unique identifier for the user
 * @param {string} [clientName='Smart Estimator'] - The name of your application
 * @param {string[]} [products=['transactions', 'income_verification']] - Plaid products to request
 * @param {string[]} [countryCodes=['US']] - Country codes for the user's accounts
 * @param {string} [language='en'] - Language for Plaid Link
 * @returns {Promise<string>} Promise that resolves to the link token
 * @throws {Error} Throws error if link token creation fails
 * 
 * @example
 * const linkToken = await createLinkToken('user123');
 * console.log('Link token created:', linkToken);
 */
export async function createLinkToken(
  userId,
  clientName = 'Smart Estimator',
  products = ['transactions', 'assets', 'identity', 'liabilities', 'income_verification'],
  countryCodes = ['US'],
  language = 'en'
) {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: clientName,
      products,
      country_codes: countryCodes,
      language,
    });

    console.log(`[Plaid] Link token created for user: ${userId}`);
    return response.data.link_token;
  } catch (error) {
    console.error(`[Plaid] Failed to create link token for user ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Exchanges a public token for an access token
 * 
 * @param {string} publicToken - The public token from Plaid Link
 * @returns {Promise<{accessToken: string, itemId: string}>} Promise that resolves to access token and item ID
 * @throws {Error} Throws error if token exchange fails
 * 
 * @example
 * const { accessToken, itemId } = await exchangePublicToken(publicToken);
 * console.log('Access token obtained:', accessToken);
 */
export async function exchangePublicToken(publicToken) {
  try {
    if (!publicToken || typeof publicToken !== 'string') {
      throw new Error('Public token is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    console.log('[Plaid] Public token exchanged successfully');
    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  } catch (error) {
    console.error('[Plaid] Failed to exchange public token:', error.message);
    throw error;
  }
}

/**
 * Fetches account information for a given access token
 * 
 * @param {string} accessToken - The Plaid access token
 * @returns {Promise<{accounts: Array, item: Object}>} Promise that resolves to accounts and item data
 * @throws {Error} Throws error if account fetch fails
 * 
 * @example
 * const { accounts, item } = await getAccounts(accessToken);
 * console.log(`Found ${accounts.length} accounts`);
 */
export async function getAccounts(accessToken) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.accountsGet({
      access_token: accessToken,
    });

    console.log(`[Plaid] Retrieved ${response.data.accounts.length} accounts`);
    return {
      accounts: response.data.accounts,
      item: response.data.item,
    };
  } catch (error) {
    console.error('[Plaid] Failed to fetch accounts:', error.message);
    throw error;
  }
}

/**
 * Fetches transactions for a given access token and date range
 * 
 * @param {string} accessToken - The Plaid access token
 * @param {string} [startDate] - Start date in YYYY-MM-DD format (defaults to 12 months ago)
 * @param {string} [endDate] - End date in YYYY-MM-DD format (defaults to today)
 * @param {number} [count=500] - Number of transactions to fetch
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<{transactions: Array, accounts: Array, totalTransactions: number, item: Object}>} Promise that resolves to transaction data
 * @throws {Error} Throws error if transaction fetch fails
 * 
 * @example
 * const { transactions, totalTransactions } = await getTransactions(accessToken);
 * console.log(`Found ${totalTransactions} total transactions`);
 */
export async function getTransactions(
  accessToken,
  startDate = null,
  endDate = null,
  count = 500,
  offset = 0
) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required and must be a string');
    }

    // Default to last 12 months if no dates provided
    const endDateFormatted = endDate || new Date().toISOString().split('T')[0];
    const startDateFormatted = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const client = getPlaidClient();
    const response = await client.transactionsGet({
      access_token: accessToken,
      start_date: startDateFormatted,
      end_date: endDateFormatted,
      count,
      offset,
    });

    console.log(`[Plaid] Retrieved ${response.data.transactions.length} transactions (${response.data.total_transactions} total)`);
    return {
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      totalTransactions: response.data.total_transactions,
      item: response.data.item,
    };
  } catch (error) {
    console.error('[Plaid] Failed to fetch transactions:', error.message);
    throw error;
  }
}

/**
 * Gets the current Plaid environment
 * 
 * @returns {string} The current Plaid environment
 * 
 * @example
 * const env = getPlaidEnvironment();
 * console.log(`Using Plaid ${env} environment`);
 */
export function getPlaidEnvironment() {
  return process.env.PLAID_ENV || 'sandbox';
}

/**
 * Checks if all required environment variables are configured
 * 
 * @returns {boolean} True if all environment variables are configured
 * 
 * @example
 * if (isConfigured()) {
 *   console.log('Plaid is properly configured');
 * } else {
 *   console.log('Plaid configuration is incomplete');
 * }
 */
export function isConfigured() {
  try {
    validateEnvironmentVariables();
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches identity information for KYC compliance and customer verification
 * 
 * @param {string} accessToken - The Plaid access token
 * @returns {Promise<{accounts: Array, item: Object}>} Promise that resolves to identity data
 * @throws {Error} Throws error if identity fetch fails
 * 
 * @example
 * const { accounts, item } = await getIdentity(accessToken);
 * console.log(`Retrieved identity data for ${accounts.length} accounts`);
 */
export async function getIdentity(accessToken) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.identityGet({
      access_token: accessToken,
    });

    console.log(`[Plaid] Retrieved identity data for ${response.data.accounts.length} accounts`);
    return {
      accounts: response.data.accounts,
      item: response.data.item,
    };
  } catch (error) {
    console.error('[Plaid] Failed to fetch identity data:', error.message);
    throw error;
  }
}

/**
 * Fetches liabilities data including credit cards, mortgages, and student loans
 * 
 * @param {string} accessToken - The Plaid access token
 * @returns {Promise<{accounts: Array, item: Object}>} Promise that resolves to liabilities data
 * @throws {Error} Throws error if liabilities fetch fails
 * 
 * @example
 * const { accounts, item } = await getLiabilities(accessToken);
 * console.log(`Retrieved liabilities for ${accounts.length} accounts`);
 */
export async function getLiabilities(accessToken) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.liabilitiesGet({
      access_token: accessToken,
    });

    console.log(`[Plaid] Retrieved liabilities for ${response.data.accounts.length} accounts`);
    return {
      accounts: response.data.accounts,
      item: response.data.item,
    };
  } catch (error) {
    console.error('[Plaid] Failed to fetch liabilities:', error.message);
    throw error;
  }
}

/**
 * Fetches income verification data for employment and income analysis
 * 
 * @param {string} accessToken - The Plaid access token
 * @returns {Promise<{income: Object, item: Object}>} Promise that resolves to income data
 * @throws {Error} Throws error if income fetch fails
 * 
 * @example
 * const { income, item } = await getIncome(accessToken);
 * console.log(`Retrieved ${income.income_streams.length} income streams`);
 */
export async function getIncome(accessToken) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.incomeGet({
      access_token: accessToken,
    });

    console.log(`[Plaid] Retrieved ${response.data.income.income_streams.length} income streams`);
    return {
      income: response.data.income,
      item: response.data.item,
    };
  } catch (error) {
    console.error('[Plaid] Failed to fetch income data:', error.message);
    throw error;
  }
}

/**
 * Creates a payment recipient for ACH settlement payments
 * 
 * @param {string} name - Recipient name
 * @param {string} iban - Recipient IBAN
 * @param {Object} [address] - Recipient address
 * @returns {Promise<{recipient_id: string}>} Promise that resolves to recipient ID
 * @throws {Error} Throws error if recipient creation fails
 * 
 * @example
 * const { recipient_id } = await createPaymentRecipient('Settlement Company', 'US123456789012345');
 */
export async function createPaymentRecipient(name, iban, address = null) {
  try {
    if (!name || typeof name !== 'string') {
      throw new Error('Recipient name is required and must be a string');
    }
    if (!iban || typeof iban !== 'string') {
      throw new Error('IBAN is required and must be a string');
    }

    const client = getPlaidClient();
    const response = await client.paymentInitiationRecipientCreate({
      name,
      iban,
      address: address || {
        street: [''],
        city: '',
        postal_code: '',
        country: 'US'
      }
    });

    console.log(`[Plaid] Payment recipient created: ${response.data.recipient_id}`);
    return {
      recipient_id: response.data.recipient_id,
    };
  } catch (error) {
    console.error('[Plaid] Failed to create payment recipient:', error.message);
    throw error;
  }
}

// Export the validation function for external use
export { validateEnvironmentVariables };