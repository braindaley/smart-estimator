
import { DebtTier } from '@/lib/types/calculator-settings';

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
    if (debtAmountEstimate >= 15000 && debtAmountEstimate <= 20000) return 0.20;
    if (debtAmountEstimate >= 20001 && debtAmountEstimate <= 24000) return 0.15;
    if (debtAmountEstimate >= 24001) return 0.15;
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
    if (debtAmountEstimate >= 15000 && debtAmountEstimate <= 20000) return 30;
    if (debtAmountEstimate >= 20001 && debtAmountEstimate <= 24000) return 36;
    if (debtAmountEstimate >= 24001) return 42;
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

// Monthly Payment Calculations
export const calculateMonthlyMomentumPayment = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  const feePercentage = getMomentumFeePercentage(debtAmountEstimate, debtTiers);
  const termLength = getMomentumTermLength(debtAmountEstimate, debtTiers);
  if (termLength === 0) return 0;
  return (debtAmountEstimate * feePercentage + debtAmountEstimate * 0.60) / termLength;
};

export const calculateMonthlyStandardPayment = (debtAmountEstimate: number, debtTiers?: DebtTier[]): number => {
  const feePercentage = getStandardFeePercentage(debtAmountEstimate, debtTiers);
  const termLength = getStandardTermLength(debtAmountEstimate, debtTiers);
  if (termLength === 0) return 0;
  return (debtAmountEstimate * feePercentage + debtAmountEstimate * 0.60) / termLength;
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
    if (debtAmount >= 15000 && debtAmount < 25000) return 3;   // was 5, now ~3.5 -> 3
    if (debtAmount >= 25000 && debtAmount < 35000) return 11;  // was 15, now ~10.5 -> 11
    if (debtAmount >= 35000 && debtAmount < 50000) return 8;   // was 12, now ~8.4 -> 8
    if (debtAmount >= 50000 && debtAmount < 75000) return 6;   // was 8, now ~5.6 -> 6
    if (debtAmount >= 75000) return 2;                          // was 3, now ~2.1 -> 2
    return 0; // Below minimum
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
