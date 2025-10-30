
import { DebtTier, CreditorData } from '@/lib/types/calculator-settings';

// Basic Calculations
export const calculateDtiEstimate = (monthlyPaymentEstimate: number, monthlyIncomeEstimate: number): number => {
  if (monthlyIncomeEstimate === 0) return 0;
  return (monthlyPaymentEstimate / monthlyIncomeEstimate) * 100;
};

export const calculateMonthlySurplusEstimate = (monthlyIncomeEstimate: number, monthlyPaymentEstimate: number): number => {
  return monthlyIncomeEstimate - monthlyPaymentEstimate;
};

// Helper function to find the appropriate debt tier
function findDebtTier(debtAmount: number, tiers: DebtTier[], programType: 'momentum' | 'standard'): DebtTier | null {
  const programTiers = tiers.filter(tier => tier.programType === programType);
  return programTiers.find(tier =>
    debtAmount >= tier.minAmount && debtAmount <= tier.maxAmount
  ) || null;
}

// Fee Percentage Calculations with dynamic tiers
export const getMomentumFeePercentage = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  if (!debtTiers) {
    // Fallback to hardcoded values if no tiers provided
    if (debtAmountEstimate >= 10000 && debtAmountEstimate <= 12499) return 0.15;
    if (debtAmountEstimate >= 12500 && debtAmountEstimate <= 14999) return 0.15;
    if (debtAmountEstimate >= 15000 && debtAmountEstimate <= 19000) return 0.20;
    if (debtAmountEstimate >= 20000 && debtAmountEstimate <= 23999) return 0.15;
    if (debtAmountEstimate >= 24000 && debtAmountEstimate <= 49999) return 0.15;
    return 0;
  }

  const tier = findDebtTier(debtAmountEstimate, debtTiers, 'momentum');
  return tier ? tier.feePercentage / 100 : 0;
};

export const getStandardFeePercentage = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  if (!debtTiers) {
    // Fallback to hardcoded values if no tiers provided
    if (debtAmountEstimate >= 10000 && debtAmountEstimate < 18000) return 0.28;
    if (debtAmountEstimate >= 18000) return 0.25;
    return 0;
  }

  const tier = findDebtTier(debtAmountEstimate, debtTiers, 'standard');
  return tier ? tier.feePercentage / 100 : 0;
};

// Term Length Calculations with dynamic tiers
export const getMomentumTermLength = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  if (!debtTiers) {
    // Fallback to hardcoded values if no tiers provided
    if (debtAmountEstimate >= 10000 && debtAmountEstimate <= 12499) return 28;
    if (debtAmountEstimate >= 12500 && debtAmountEstimate <= 14999) return 30;
    if (debtAmountEstimate >= 15000 && debtAmountEstimate <= 19000) return 34;
    if (debtAmountEstimate >= 20000 && debtAmountEstimate <= 23999) return 39;
    if (debtAmountEstimate >= 24000 && debtAmountEstimate <= 49999) return 42;
    return 0;
  }

  const tier = findDebtTier(debtAmountEstimate, debtTiers, 'momentum');
  return tier ? tier.maxTerm : 0;
};

export const getStandardTermLength = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  if (!debtTiers) {
    // Fallback to hardcoded values if no tiers provided
    if (debtAmountEstimate >= 10000 && debtAmountEstimate < 15000) return 24;
    if (debtAmountEstimate >= 15000 && debtAmountEstimate < 20000) return 36;
    if (debtAmountEstimate >= 20000 && debtAmountEstimate < 24000) return 42;
    if (debtAmountEstimate >= 24000) return 48;
    return 0;
  }

  const tier = findDebtTier(debtAmountEstimate, debtTiers, 'standard');
  return tier ? tier.maxTerm : 0;
};

// Settlement Rate Calculations with dynamic tiers
export const getMomentumSettlementRate = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  if (!debtTiers) {
    // Fallback to hardcoded values if no tiers provided
    if (debtAmountEstimate >= 10000 && debtAmountEstimate <= 12499) return 0.52;
    if (debtAmountEstimate >= 12500 && debtAmountEstimate <= 14999) return 0.52;
    if (debtAmountEstimate >= 15000 && debtAmountEstimate <= 19000) return 0.52;
    if (debtAmountEstimate >= 20000 && debtAmountEstimate <= 23999) return 0.54;
    if (debtAmountEstimate >= 24000 && debtAmountEstimate <= 49999) return 0.55;
    return 0.60; // Default fallback
  }

  const tier = findDebtTier(debtAmountEstimate, debtTiers, 'momentum');
  return tier ? tier.settlementRate / 100 : 0.60;
};

export const getStandardSettlementRate = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  if (!debtTiers) {
    // Fallback to hardcoded value
    return 0.60;
  }

  const tier = findDebtTier(debtAmountEstimate, debtTiers, 'standard');
  return tier ? tier.settlementRate / 100 : 0.60;
};

/**
 * Get creditor-specific settlement rate based on program term
 * @param creditorName - Name of creditor (e.g., "CHASE", "DISCOVER")
 * @param programTermMonths - Program length in months (e.g., 28, 30, 34)
 * @param creditorData - Creditor settlement data with term-based rates
 * @param tierSettlementRate - Fallback tier rate as decimal (e.g., 0.52)
 * @returns Settlement rate as decimal (e.g., 0.50 for 50%)
 */
export const getCreditorSettlementRate = (
  creditorName: string,
  programTermMonths: number,
  creditorData?: CreditorData,
  tierSettlementRate?: number
): number => {
  // If no creditor data available, use tier rate
  if (!creditorData) {
    return tierSettlementRate || 0.60;
  }

  // Normalize creditor name (uppercase, trim)
  const normalizedName = creditorName.toUpperCase().trim();

  // Look up creditor in database
  const creditorRates = creditorData.creditorSettlementRates[normalizedName];

  // If creditor not found, use tier-specific settlement rate
  if (!creditorRates) {
    return tierSettlementRate || (creditorData.fallbackRate / 100);
  }

  // Look up rate for specific term length
  const rate = creditorRates[programTermMonths];

  // If term not found, use tier rate as fallback
  if (rate === undefined || rate === null) {
    return tierSettlementRate || (creditorData.fallbackRate / 100);
  }

  return rate / 100; // Convert percentage to decimal
};

// Monthly Payment Calculations
export const calculateMonthlyMomentumPayment = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  const feePercentage = getMomentumFeePercentage(debtAmountEstimate, debtTiers);
  const termLength = getMomentumTermLength(debtAmountEstimate, debtTiers);
  const settlementRate = getMomentumSettlementRate(debtAmountEstimate, debtTiers);
  if (termLength === 0) return 0;
  return (debtAmountEstimate * feePercentage + debtAmountEstimate * settlementRate) / termLength;
};

export const calculateMonthlyStandardPayment = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  const feePercentage = getStandardFeePercentage(debtAmountEstimate, debtTiers);
  const termLength = getStandardTermLength(debtAmountEstimate, debtTiers);
  const settlementRate = getStandardSettlementRate(debtAmountEstimate, debtTiers);
  if (termLength === 0) return 0;
  return (debtAmountEstimate * feePercentage + debtAmountEstimate * settlementRate) / termLength;
};

/**
 * Account settlement details
 */
export interface AccountSettlement {
  creditor: string;
  balance: number;
  settlementRate: number;
  settlementAmount: number;
}

/**
 * Detailed Momentum Plan calculation result
 */
export interface MomentumPlanDetailed {
  totalDebt: number;
  tier: string;
  maxTermLength: number;
  feePercentage: number;
  tierSettlementRate: number;
  accountSettlements: AccountSettlement[];
  totalSettlement: number;
  programFee: number;
  totalCost: number;
  minMonthlyPayment: number;
  qualifies: boolean;
  availableFunds: number;
  excessLiquidity: number;
  isOptimized: boolean;
  term: number;
  monthlyPayment: number;
  accountCount: number;
  originalMonthlyPayment?: number;
  originalTerm?: number;
}

/**
 * Calculate detailed Momentum Plan with creditor-specific settlement rates
 * @param eligibleAccounts - Array of accounts with creditor name and balance
 * @param debtTiers - Debt tier configuration
 * @param creditorData - Creditor settlement data with term-based rates
 * @param monthlyIncome - Optional: User's monthly income for qualification check
 * @param monthlyExpenses - Optional: User's monthly expenses for qualification check
 * @returns Detailed calculation results or null if no tier found
 */
export const calculateMomentumPlanDetailed = (
  eligibleAccounts: Array<{creditor: string, balance: number}>,
  debtTiers: DebtTier[],
  creditorData?: CreditorData,
  monthlyIncome?: number,
  monthlyExpenses?: number
): MomentumPlanDetailed | null => {
  // 1. Calculate total debt
  const totalDebt = eligibleAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // 2. Get tier info
  const tier = findDebtTier(totalDebt, debtTiers, 'momentum');
  if (!tier) return null;

  const maxTermLength = tier.maxTerm;
  const feePercentage = tier.feePercentage / 100;
  const tierSettlementRate = tier.settlementRate / 100;

  // 3. Calculate settlement per account using creditor-specific rates
  const accountSettlements: AccountSettlement[] = eligibleAccounts.map(account => {
    const creditorRate = getCreditorSettlementRate(
      account.creditor,
      maxTermLength,
      creditorData,
      tierSettlementRate
    );

    return {
      creditor: account.creditor,
      balance: account.balance,
      settlementRate: creditorRate,
      settlementAmount: account.balance * creditorRate
    };
  });

  // 4. Calculate totals
  const totalSettlement = accountSettlements.reduce((sum, acc) => sum + acc.settlementAmount, 0);
  const programFee = totalDebt * feePercentage;
  const totalCost = totalSettlement + programFee;
  const minMonthlyPayment = totalCost / maxTermLength;

  // 5. Income comparison and qualification (if income/expenses provided)
  let qualifies = true;
  let availableFunds = 0;
  let excessLiquidity = 0;
  let optimized = false;
  let optimizedTerm = maxTermLength;
  let optimizedMonthlyPayment = minMonthlyPayment;

  if (monthlyIncome !== undefined && monthlyExpenses !== undefined) {
    availableFunds = monthlyIncome - monthlyExpenses;
    qualifies = minMonthlyPayment <= availableFunds;

    // 6. Term optimization (if qualifies and has excess)
    if (qualifies) {
      excessLiquidity = availableFunds - minMonthlyPayment;

      if (excessLiquidity >= 50) {
        optimized = true;
        optimizedMonthlyPayment = availableFunds - 50; // Leave $50 affordability buffer
        optimizedTerm = Math.round(totalCost / optimizedMonthlyPayment);

        // Ensure optimized term is at least 1 month
        if (optimizedTerm < 1) optimizedTerm = 1;
      }
    }
  }

  return {
    totalDebt,
    tier: tier.id,
    maxTermLength,
    feePercentage: tier.feePercentage,
    tierSettlementRate: tier.settlementRate,
    accountSettlements,
    totalSettlement,
    programFee,
    totalCost,
    minMonthlyPayment,
    qualifies,
    availableFunds,
    excessLiquidity,
    isOptimized: optimized,
    term: optimized ? optimizedTerm : maxTermLength,
    monthlyPayment: optimized ? optimizedMonthlyPayment : minMonthlyPayment,
    accountCount: eligibleAccounts.length,
    originalMonthlyPayment: optimized ? minMonthlyPayment : undefined,
    originalTerm: optimized ? maxTermLength : undefined
  };
};

// Personal Loan Calculations
export const getPersonalLoanApr = (ficoScore: number): number => {
  if (ficoScore >= 720) return 0.1025;
  if (ficoScore >= 690) return 0.1325;
  if (ficoScore >= 660) return 0.18;
  if (ficoScore >= 620) return 0.25;
  return 1.50; // for scores < 620
};

export const calculatePersonalLoanPayment = (debtAmountEstimate: number, apr: number): number => {
    const monthlyRate = apr / 12;
    const termInMonths = 36;
    if (monthlyRate === 0) {
      return debtAmountEstimate / termInMonths;
    }
    return (
      (debtAmountEstimate * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) /
      (Math.pow(1 + monthlyRate, termInMonths) - 1)
    );
};
  
export const getMaximumPersonalLoanAmount = (ficoScore: number): number => {
    if (ficoScore >= 720) return 50000;
    if (ficoScore >= 690) return 40000;
    if (ficoScore >= 660) return 30000;
    if (ficoScore >= 620) return 20000;
    return 5000;
};

export const isEligibleForPersonalLoan = (debtAmount: number, ficoScore: number): boolean => {
    const maxLoanAmount = getMaximumPersonalLoanAmount(ficoScore);
    return debtAmount <= maxLoanAmount;
};

// Momentum Score Calculations

// Financial Hardship Components (use exact logic)
function calculateDebtHardship(debtAmountEstimate: number) {
    if (debtAmountEstimate < 15000 || debtAmountEstimate > 50000) return 0;
    return Math.min(95, Math.max(80, 80 + (debtAmountEstimate - 15000) * (95 - 80) / (50000 - 15000)));
}

function calculateDTIHardship(dtiEstimate: number) {
    if (dtiEstimate <= 0.4) return 95;
    if (dtiEstimate <= 0.6) return 95 + (dtiEstimate - 0.4) * (80 - 95) / (0.6 - 0.4);
    if (dtiEstimate <= 0.8) return 79 + (dtiEstimate - 0.59) * (60 - 79) / (0.8 - 0.59);
    if (dtiEstimate <= 0.9) return 49 + (dtiEstimate - 0.79) * (40 - 49) / (0.9 - 0.79);
    if (dtiEstimate <= 0.95) return 39 + (dtiEstimate - 0.89) * (20 - 39) / (0.95 - 0.89);
    return 0;
}

function calculateCreditorHardship(creditorCountEstimate: number) {
    if (creditorCountEstimate < 2) return 0;
    if (creditorCountEstimate <= 5) return 80 + (creditorCountEstimate - 2) * (95 - 80) / (5 - 2);
    if (creditorCountEstimate <= 10) return 50 + (creditorCountEstimate - 6) * (79 - 50) / (10 - 6);
    if (creditorCountEstimate <= 20) return 30 + (creditorCountEstimate - 10) * (49 - 30) / (20 - 10);
    return 30;
}

function calculateSurplusScore(monthlySurplusEstimate: number) {
    if (monthlySurplusEstimate < 100) return 20;
    if (monthlySurplusEstimate < 200) return 50;
    if (monthlySurplusEstimate < 500) return 70;
    return 90;
}

interface MomentumScoreInput {
    debtAmountEstimate: number;
    creditorCountEstimate: number;
    debtPaymentStatus: string;
    hasSteadyIncome: boolean;
    userFicoScoreEstimate: number;
}

function mapDebtAmountToPoints(debtAmount: number): number {
    if (debtAmount < 11250) return 0;                           // Below $11,250: 0 pts
    if (debtAmount >= 11250 && debtAmount < 13750) return 0;    // $11,250: 0 pts
    if (debtAmount >= 13750 && debtAmount < 17000) return 2;    // $13,750: 2 pts
    if (debtAmount >= 17000 && debtAmount < 22000) return 4;    // $17,000: 4 pts
    if (debtAmount >= 22000 && debtAmount < 37000) return 11;   // $22,000: 11 pts
    if (debtAmount >= 37000) return 10;                         // $37,000: 10 pts
    return 0;
}

function mapCreditorsToPoints(creditorCount: number): number {
    if (creditorCount <= 2) return 1;   // was 2, now ~1.4 -> 1
    if (creditorCount <= 5) return 8;   // was 12, now ~8.4 -> 8
    if (creditorCount <= 10) return 6;  // was 8, now ~5.6 -> 6
    return 4; // 10+ (was 5, now ~3.5 -> 4)
}

function mapPaymentStatusToPoints(paymentStatus: string): number {
    switch (paymentStatus) {
        case 'current': return 2;        // was 3, now ~2.1 -> 2
        case 'late': return 8;           // was 12, now ~8.4 -> 8
        case 'collections': return 6;    // was 8, now ~5.6 -> 6
        default: return 0;
    }
}

function mapIncomeToPoints(hasIncome: boolean): number {
    return hasIncome ? 6 : 0;  // was 8, now ~5.6 -> 6
}

function mapCreditScoreToPoints(ficoScore: number): number {
    if (ficoScore >= 720) return 1;     // Prime 720+ (was 1, stays 1)
    if (ficoScore >= 690) return 1;     // Good 690-719 (was 2, now ~1.4 -> 1)
    if (ficoScore >= 580) return 2;     // Fair 580-689 (was 3, now ~2.1 -> 2)
    return 1; // Subprime <580 (was 1, stays 1)
}

export function calculateMomentumScore(formData: MomentumScoreInput) {
    // Calculate points for each component
    const debtPoints = mapDebtAmountToPoints(formData.debtAmountEstimate);
    const creditorsPoints = mapCreditorsToPoints(formData.creditorCountEstimate);
    const paymentPoints = mapPaymentStatusToPoints(formData.debtPaymentStatus);
    const incomePoints = mapIncomeToPoints(formData.hasSteadyIncome);
    const creditPoints = mapCreditScoreToPoints(formData.userFicoScoreEstimate);

    // Calculate total score (sum of all points)
    const totalScore = debtPoints + creditorsPoints + paymentPoints + incomePoints + creditPoints;

    return {
        score: totalScore,
        breakdown: {
            debtAmount: debtPoints,
            creditors: creditorsPoints,
            paymentStatus: paymentPoints,
            income: incomePoints,
            creditScore: creditPoints
        },
        maxPossible: 35, // 11 + 8 + 8 + 6 + 2 = 35
        // Legacy compatibility
        totalScore: totalScore
    };
}
