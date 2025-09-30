// Narrative Codes Setup for Persona Testing
// This automatically sets up the narrative codes required for persona testing

// Import the full list from the canonical source (using JSON for better compatibility)
import equifaxCodesData from '../data/equifaxCodes.json';
const equifaxCodes = equifaxCodesData;

// Convert the Equifax narrative codes to the format expected by the app
// and set default includeInSettlement values based on typical debt settlement criteria
const narrativeCodeDefaults = {
  // Include in settlement - typical unsecured debts
  'FE': true, // Credit card
  'AU': true, // Personal loan
  'GS': true, // Medical
  'CV': true, // Line of credit
  'AV': true, // Charge
  'CZ': true, // Collection account
  'EX': true, // Unsecured
  'CA': true, // Charge off - making payments
  'CB': true, // Charged off - check presented was uncollectible
  'DB': true, // Charged off account
  'CY': true, // Account charged to profit and loss
  'BC': true, // Account transferred or sold
  'BY': true, // Collection agency account - status unknown
  'BE': true, // Credit line closed
  'CN': true, // Paying under a partial payment agreement
  'DA': true, // Account closed by consumer
  'DS': true, // Single payment loan
  'EA': true, // Paid or making payments - not according to terms of agreement
  'FR': true, // Making payments
  'GO': true, // Debt consolidation
  'JZ': true, // Debt buyer account
  'JR': true, // Telecommunications/cellular
  'JX': true, // Flexible spending credit card
  'AE': true, // Consumer says acct. Involved in business venture held personally liab
  'AH': true, // Consumer says account slow due to billing dispute with creditor
  'AI': true, // Consumer says account slow due to employment issues
  'AJ': true, // Consumer says account slow due to medical expenses/illness
  'AM': true, // Voluntary surrender; there may be a balance due
  'AN': true, // Involuntary repossession
  'BH': true, // Dispute - resolution pending
  'BL': true, // Consumer says account slow due to domestic problems
  'BX': true, // Payments managed by financial counseling program
  'CW': true, // Account closed by credit grantor
  'DD': true, // Balance is deficiency amount
  'DV': true, // Amount in high credit includes finance charge
  'EY': true, // Business account -personal guarantee
  'FT': true, // Not included in bankruptcy
  'GC': true, // Account being paid through financial counseling plan
  'GD': true, // Account paid through financial counseling plan
  'HX': true, // Transferred to recovery
  'IA': true, // Consumer voluntarily withdrew from bankruptcy
  'IH': true, // Consumer pays balance in full each month
  'JK': true, // 120 days past due
  'JL': true, // 150 days past due
  'JM': true, // 180 days or more past due
  'KG': true, // Chapter 7 bankruptcy dismissed
  'KJ': true, // Chapter 13 bankruptcy dismissed
  'KK': true, // Chapter 7 bankruptcy withdrawn
  'KN': true, // Chapter 13 bankruptcy withdrawn
  'KQ': true, // Credit line no longer available - in repayment phase
  'KT': true, // Collateral released by creditor/balance owing

  // Exclude from settlement - secured debts, student loans, mortgages, etc.
  'BU': false, // Student loan
  'AR': false, // Home loan
  'AS': false, // Home improvement loan
  'EF': false, // Real estate mortgage
  'EG': false, // Guaranteed student loan
  'EH': false, // National direct student loan
  'DJ': false, // Foreclosure
  'DM': false, // Forfeit of deed in lieu of foreclosure
  'BR': false, // Foreclosure process started
  'DT': false, // Amortized mortgage
  'EC': false, // Home equity
  'JU': false, // Home equity line of credit
  'HP': false, // Fha mortgage
  'HQ': false, // Va mortgage
  'HR': false, // Conventional mortgage
  'HS': false, // Second mortgage
  'DG': false, // Title 1 loan
  'DQ': false, // Student loan - payment deferred
  'FD': false, // Defaulted student loan
  'GJ': false, // Student loan assigned to government

  // Bankruptcy related - exclude
  'BW': false, // Included in bankruptcy
  'DO': false, // Bankruptcy chapter 13
  'IL': false, // Bankruptcy chapter 7
  'IM': false, // Bankruptcy chapter 12
  'EV': false, // Bankruptcy chapter 11
  'KO': false, // Bankrupcty – undesignated chapter
  'CP': false, // Consumer says personal bankruptcy filed due to business failure
  'FO': false, // Consumer says bankruptcy discharged
  'FP': false, // Consumer says bankruptcy dismissed
  'IK': false, // Bankruptcy voluntarily withdrawn
  'KB': false, // Bankruptcy petition
  'KC': false, // Bankruptcy discharged
  'KD': false, // Bankruptcy completed
  'KH': false, // Chapter 11 bankruptcy dismissed
  'KI': false, // Chapter 12 bankruptcy dismissed
  'KL': false, // Chapter 11 bankruptcy withdrawn
  'KM': false, // Chapter 12 bankruptcy withdrawn
  'HM': false, // Account included in bankruptcy of primary borrower
  'HN': false, // Account included in bankruptcy of secondary borrower
  'EO': false, // Account included in bankruptcy of another person
};

export const DEFAULT_NARRATIVE_CODES = equifaxCodes['Narrative Codes'].map(code => ({
  code: code.Code,
  description: code.Description,
  includeInSettlement: narrativeCodeDefaults[code.Code] ?? false // Default to false if not specified
}));

export const initializeNarrativeCodes = () => {
  if (typeof window === 'undefined') return;

  const existingCodes = localStorage.getItem('equifax-narrative-codes');

  // Only initialize if no codes exist yet
  if (!existingCodes) {
    localStorage.setItem('equifax-narrative-codes', JSON.stringify(DEFAULT_NARRATIVE_CODES));
    console.log('✅ Narrative codes initialized for persona testing');
  }
};

export const ensureNarrativeCodesForTesting = () => {
  if (typeof window === 'undefined') return;

  const existingCodes = localStorage.getItem('equifax-narrative-codes');

  if (!existingCodes) {
    // Initialize with all 237 narrative codes
    localStorage.setItem('equifax-narrative-codes', JSON.stringify(DEFAULT_NARRATIVE_CODES));
    console.log(`✅ Initialized ${DEFAULT_NARRATIVE_CODES.length} narrative codes for persona testing`);
  } else {
    // Check if we need to update to the full set
    const currentCodes = JSON.parse(existingCodes);

    // If we have significantly fewer codes than the full set, reinitialize
    if (currentCodes.length < DEFAULT_NARRATIVE_CODES.length - 10) {
      localStorage.setItem('equifax-narrative-codes', JSON.stringify(DEFAULT_NARRATIVE_CODES));
      console.log(`✅ Updated narrative codes from ${currentCodes.length} to ${DEFAULT_NARRATIVE_CODES.length} codes`);
    }
  }
};