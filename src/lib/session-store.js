/**
 * Session storage utilities for managing step completion and Plaid data
 */

const SESSION_KEYS = {
  BANK_CONNECTED: 'bank_connected',
  PLAID_DATA: 'plaid_data',
  CREDIT_CHECKED: 'credit_checked',
  CREDIT_DATA: 'credit_data',
  PHONE_VERIFIED: 'phone_verified',
  PHONE_DATA: 'phone_data',
  USER_STEPS: 'user_steps',
  DEBT_GOAL_PREFERENCE: 'debt_goal_preference'
};

// Store step completion status
export const setStepCompleted = (stepId, completed = true, data = null) => {
  if (typeof window !== 'undefined') {
    const steps = getStepStatus();
    steps[stepId] = {
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      data
    };
    localStorage.setItem(SESSION_KEYS.USER_STEPS, JSON.stringify(steps));
  }
};

// Get step completion status
export const getStepStatus = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_KEYS.USER_STEPS);
    return stored ? JSON.parse(stored) : {};
  }
  return {};
};

// Check if a step is completed
export const isStepCompleted = (stepId) => {
  const steps = getStepStatus();
  return steps[stepId]?.completed || false;
};

// Get step data
export const getStepData = (stepId) => {
  const steps = getStepStatus();
  return steps[stepId]?.data || null;
};

// Store Plaid data specifically
export const storePlaidData = (userId, data) => {
  if (typeof window !== 'undefined') {
    const plaidData = {
      userId,
      data,
      storedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEYS.PLAID_DATA, JSON.stringify(plaidData));
    setStepCompleted('bank_connection', true, { userId, connectionTime: new Date().toISOString() });
  }
};

// Get Plaid data (checks both sessionStorage and localStorage for persona data)
export const getPlaidData = () => {
  if (typeof window !== 'undefined') {
    console.log('[SessionStore] getPlaidData called');

    // First check sessionStorage for persona data
    try {
      const sessionData = sessionStorage.getItem('plaid_session_data');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        console.log('[SessionStore] Found persona data in sessionStorage:', parsed);
        return parsed;
      }
    } catch (e) {
      console.log('[SessionStore] SessionStorage error:', e);
      // Fallback to localStorage if sessionStorage is not available
      try {
        const localSessionData = localStorage.getItem('plaid_session_data');
        if (localSessionData) {
          const parsed = JSON.parse(localSessionData);
          console.log('[SessionStore] Found persona data in localStorage fallback:', parsed);
          return parsed;
        }
      } catch (e2) {
        console.log('[SessionStore] LocalStorage fallback error:', e2);
        // Continue to original logic
      }
    }

    // Original logic - get from localStorage
    const stored = localStorage.getItem(SESSION_KEYS.PLAID_DATA);
    const result = stored ? JSON.parse(stored) : null;
    console.log('[SessionStore] Using original plaid_data from localStorage:', result);
    return result;
  }
  return null;
};

// Clear all session data
export const clearSessionData = () => {
  if (typeof window !== 'undefined') {
    Object.values(SESSION_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

// Clear only Plaid data (keep credit data)
export const clearPlaidData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEYS.PLAID_DATA);
    localStorage.removeItem(SESSION_KEYS.BANK_CONNECTED);
    // Update user steps to remove bank connection step
    const steps = getStepStatus();
    if (steps.bank_connection) {
      delete steps.bank_connection;
      localStorage.setItem(SESSION_KEYS.USER_STEPS, JSON.stringify(steps));
    }
  }
};

// Clear only credit data (keep Plaid data)
export const clearCreditData = () => {
  if (typeof window !== 'undefined') {
    // Remove credit data for all users
    const userId = localStorage.getItem('loan_user_id');
    if (userId) {
      localStorage.removeItem(`credit_data_${userId}`);
    }
    localStorage.removeItem(SESSION_KEYS.CREDIT_DATA);
    localStorage.removeItem(SESSION_KEYS.CREDIT_CHECKED);
    // Update user steps to remove credit check step
    const steps = getStepStatus();
    if (steps.credit_check) {
      delete steps.credit_check;
      localStorage.setItem(SESSION_KEYS.USER_STEPS, JSON.stringify(steps));
    }
  }
};

// Generate results URL
export const generateResultsUrl = (stepType = 'bank') => {
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  return `/results/${stepType}?session=${sessionId}`;
};

// Store credit check data (placeholder for future)
export const storeCreditData = (userId, data) => {
  if (typeof window !== 'undefined') {
    const creditData = {
      userId,
      data,
      storedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEYS.CREDIT_DATA, JSON.stringify(creditData));
    setStepCompleted('credit_check', true, { userId, checkTime: new Date().toISOString() });
  }
};

// Get credit check data
export const getCreditData = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_KEYS.CREDIT_DATA);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// Store phone verification data
export const storePhoneData = (userId, data) => {
  if (typeof window !== 'undefined') {
    const phoneData = {
      userId,
      data,
      storedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEYS.PHONE_DATA, JSON.stringify(phoneData));
    setStepCompleted('phone_verification', true, { userId, verificationTime: new Date().toISOString() });
  }
};

// Get phone verification data
export const getPhoneData = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_KEYS.PHONE_DATA);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// Clear phone verification data
export const clearPhoneData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEYS.PHONE_DATA);
    localStorage.removeItem(SESSION_KEYS.PHONE_VERIFIED);
    // Update user steps to remove phone verification step
    const steps = getStepStatus();
    if (steps.phone_verification) {
      delete steps.phone_verification;
      localStorage.setItem(SESSION_KEYS.USER_STEPS, JSON.stringify(steps));
    }
  }
};

// Store debt goal preference
export const storeDebtGoalPreference = (userId, preference) => {
  if (typeof window !== 'undefined') {
    const data = {
      userId,
      preference,
      storedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEYS.DEBT_GOAL_PREFERENCE, JSON.stringify(data));
    setStepCompleted('debt_goal_preference', true, { preference });
  }
};

// Get debt goal preference
export const getDebtGoalPreference = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_KEYS.DEBT_GOAL_PREFERENCE);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// Clear debt goal preference
export const clearDebtGoalPreference = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEYS.DEBT_GOAL_PREFERENCE);
    // Update user steps to remove debt goal preference step
    const steps = getStepStatus();
    if (steps.debt_goal_preference) {
      delete steps.debt_goal_preference;
      localStorage.setItem(SESSION_KEYS.USER_STEPS, JSON.stringify(steps));
    }
  }
};