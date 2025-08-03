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
