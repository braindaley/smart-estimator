
// Basic Calculations
export const calculateDtiEstimate = (monthlyPaymentEstimate: number, monthlyIncomeEstimate: number): number => {
  if (monthlyIncomeEstimate === 0) return 0;
  return (monthlyPaymentEstimate / monthlyIncomeEstimate) * 100;
};

export const calculateMonthlySurplusEstimate = (monthlyIncomeEstimate: number, monthlyPaymentEstimate: number): number => {
  return monthlyIncomeEstimate - monthlyPaymentEstimate;
};

// Fee Percentage Calculations
export const getMomentumFeePercentage = (debtAmountEstimate: number): number => {
  if (debtAmountEstimate >= 15000 && debtAmountEstimate < 20000) {
    return 0.25;
  }
  if (debtAmountEstimate >= 20000) {
    return 0.19;
  }
  return 0; // Should not happen based on program qualification
};

export const getStandardFeePercentage = (debtAmountEstimate: number): number => {
  if (debtAmountEstimate >= 10000 && debtAmountEstimate < 18000) {
    return 0.28;
  }
  if (debtAmountEstimate >= 18000) {
    return 0.25;
  }
  return 0; // Should not happen based on program qualification
};

// Term Length Calculations
export const getMomentumTermLength = (debtAmountEstimate: number): number => {
  if (debtAmountEstimate >= 15000 && debtAmountEstimate < 20000) {
    return 25;
  }
  if (debtAmountEstimate >= 20000 && debtAmountEstimate < 24000) {
    return 38;
  }
  if (debtAmountEstimate >= 24000) {
    return 42;
  }
  return 0;
};

export const getStandardTermLength = (debtAmountEstimate: number): number => {
  if (debtAmountEstimate >= 10000 && debtAmountEstimate < 15000) {
    return 24;
  }
  if (debtAmountEstimate >= 15000 && debtAmountEstimate < 20000) {
    return 36;
  }
  if (debtAmountEstimate >= 20000 && debtAmountEstimate < 24000) {
    return 42;
  }
  if (debtAmountEstimate >= 24000) {
    return 48;
  }
  return 0;
};

// Monthly Payment Calculations
export const calculateMonthlyMomentumPayment = (debtAmountEstimate: number): number => {
  const feePercentage = getMomentumFeePercentage(debtAmountEstimate);
  const termLength = getMomentumTermLength(debtAmountEstimate);
  if (termLength === 0) return 0;
  return (debtAmountEstimate * feePercentage + debtAmountEstimate * 0.60) / termLength;
};

export const calculateMonthlyStandardPayment = (debtAmountEstimate: number): number => {
  const feePercentage = getStandardFeePercentage(debtAmountEstimate);
  const termLength = getStandardTermLength(debtAmountEstimate);
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
    monthlyIncomeEstimate: number;
    monthlyPaymentEstimate: number;
    creditorCountEstimate: number;
}

export function calculateMomentumScore(formData: MomentumScoreInput) {
    const dti = calculateDtiEstimate(formData.monthlyPaymentEstimate, formData.monthlyIncomeEstimate);
    const dtiEstimate = dti / 100; // Convert to decimal for calculation
    const monthlySurplusEstimate = calculateMonthlySurplusEstimate(formData.monthlyIncomeEstimate, formData.monthlyPaymentEstimate);

    // Calculate hardship components
    const debtHardship = calculateDebtHardship(formData.debtAmountEstimate);
    const dtiHardship = calculateDTIHardship(dtiEstimate);
    const creditorHardship = calculateCreditorHardship(formData.creditorCountEstimate);

    // Financial Hardship (40% weight)
    const financialHardshipScore = (debtHardship + dtiHardship + creditorHardship) / 3;

    // Mental Mindset (30% weight) - Not available in Smart Estimator
    const mentalMindsetScore = 0;

    // Financial Means (30% weight) - Partial (only surplus available)
    const surplusScore = calculateSurplusScore(monthlySurplusEstimate);
    const financialMeansScore = surplusScore / 3; // Only 1/3 components available

    // Calculate raw score
    const rawScore = (financialHardshipScore * 0.4) + (mentalMindsetScore * 0.3) + (financialMeansScore * 0.3);

    // Apply Smart Estimator cap of 50 points
    const smartEstimatorScore = Math.min(50, rawScore);

    return {
        totalScore: Math.round(smartEstimatorScore),
        breakdown: {
            financialHardship: Math.round(financialHardshipScore * 0.4),
            mentalMindset: 0,
            financialMeans: Math.round(financialMeansScore * 0.3)
        },
        components: {
            debtHardship,
            dtiHardship,
            creditorHardship,
            surplusScore
        }
    };
}
