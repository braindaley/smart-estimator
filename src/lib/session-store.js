/**
 * Session storage utilities for managing step completion and Plaid data
 */

const SESSION_KEYS = {
  BANK_CONNECTED: 'bank_connected',
  PLAID_DATA: 'plaid_data',
  CREDIT_CHECKED: 'credit_checked',
  CREDIT_DATA: 'credit_data',
  USER_STEPS: 'user_steps'
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

// Get Plaid data
export const getPlaidData = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_KEYS.PLAID_DATA);
    return stored ? JSON.parse(stored) : null;
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