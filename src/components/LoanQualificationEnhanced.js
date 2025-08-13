'use client';

import { useState, useEffect } from 'react';
import PlaidLink from './PlaidLink';
import { getTokenClient } from '@/lib/client-token-store';

/**
 * Enhanced LoanQualification Component with comprehensive error handling and UX improvements
 */
export default function LoanQualificationEnhanced({ userId, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [financialData, setFinancialData] = useState(null);
  const [qualificationResults, setQualificationResults] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [dataWarnings, setDataWarnings] = useState([]);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  // Step configuration
  const steps = [
    { number: 1, name: 'Get Started', description: 'Learn about the process' },
    { number: 2, name: 'Connect Bank', description: 'Securely link your account' },
    { number: 3, name: 'View Results', description: 'See your qualification' }
  ];

  // Error types and messages
  const errorMessages = {
    NETWORK_ERROR: {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      canRetry: true
    },
    PLAID_ERROR: {
      title: 'Bank Connection Failed',
      message: 'We couldn\'t connect to your bank. Please try again or select a different institution.',
      canRetry: true
    },
    INSUFFICIENT_DATA: {
      title: 'Insufficient Transaction History',
      message: 'We need at least 3 months of transaction history to assess your qualification.',
      canRetry: false
    },
    INVALID_DATA: {
      title: 'Data Validation Error',
      message: 'We detected unusual patterns in your financial data. Please contact support for assistance.',
      canRetry: false
    },
    RATE_LIMIT: {
      title: 'Too Many Requests',
      message: 'Please wait a moment before trying again.',
      canRetry: true,
      retryDelay: 5000
    },
    SERVER_ERROR: {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again later.',
      canRetry: true
    }
  };

  // Fetch with retry mechanism
  const fetchWithRetry = async (url, options, retryAttempt = 0) => {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        throw { type: 'RATE_LIMIT', status: 429 };
      }
      
      if (!response.ok) {
        throw { type: 'SERVER_ERROR', status: response.status };
      }
      
      return response;
    } catch (error) {
      if (retryAttempt < MAX_RETRY_ATTEMPTS && error.type !== 'RATE_LIMIT') {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryAttempt + 1)));
        return fetchWithRetry(url, options, retryAttempt + 1);
      }
      throw error;
    }
  };

  // Enhanced bank connection handler
  const handleBankConnected = async (metadata) => {
    setIsAnalyzing(true);
    setError(null);
    setErrorType(null);
    setDataWarnings([]);
    setAnalysisProgress(0);

    try {
      // Update progress: Fetching accounts
      setAnalysisProgress(20);
      
      // Get client token for API fallback
      const clientToken = getTokenClient(userId);
      console.log('[LoanQualification] Retrieved client token for API calls:', !!clientToken);
      
      const accountsResponse = await fetchWithRetry('/api/plaid/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clientToken }),
      });

      const accountsData = await accountsResponse.json();
      
      // Validate accounts data
      if (!accountsData.accounts || accountsData.accounts.length === 0) {
        throw { type: 'INVALID_DATA', message: 'No bank accounts found' };
      }

      // Update progress: Fetching transactions
      setAnalysisProgress(40);
      
      const transactionsResponse = await fetchWithRetry('/api/plaid/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clientToken }),
      });

      const transactionsData = await transactionsResponse.json();
      
      // Validate transactions data
      if (!transactionsData.transactions || transactionsData.transactions.length < 30) {
        throw { type: 'INSUFFICIENT_DATA', message: 'Not enough transaction history' };
      }

      // Update progress: Analyzing data
      setAnalysisProgress(60);
      
      // Enhanced analysis with validation
      const analysis = analyzeFinancialDataEnhanced(accountsData, transactionsData);
      setFinancialData(analysis);

      // Update progress: Calculating qualification
      setAnalysisProgress(80);
      
      // Calculate qualification with enhanced logic
      const results = calculateQualificationEnhanced(analysis);
      setQualificationResults(results);

      // Update progress: Complete
      setAnalysisProgress(100);
      
      // Show success animation if qualified
      if (results.isQualified) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
      }

      // Move to results step
      setTimeout(() => {
        setCurrentStep(3);
        setAnalysisProgress(0);
      }, 500);

      // Call onComplete callback
      if (onComplete) {
        onComplete(results);
      }
    } catch (err) {
      console.error('Error analyzing financial data:', err);
      
      // Determine error type
      let errorInfo = errorMessages.SERVER_ERROR;
      
      if (err.type && errorMessages[err.type]) {
        errorInfo = errorMessages[err.type];
        setErrorType(err.type);
      } else if (err.name === 'NetworkError' || err.message.includes('network')) {
        errorInfo = errorMessages.NETWORK_ERROR;
        setErrorType('NETWORK_ERROR');
      }
      
      setError(errorInfo);
      setRetryCount(retryCount + 1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced financial data analysis
  const analyzeFinancialDataEnhanced = (accountsData, transactionsData) => {
    const { accounts } = accountsData;
    const { transactions } = transactionsData;
    const warnings = [];

    // Group transactions by month with enhanced categorization
    const monthlyData = {};
    const incomeCategories = ['deposit', 'transfer', 'payroll', 'interest'];
    const debtCategories = ['loan', 'mortgage', 'credit', 'payment'];
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          income: 0,
          expenses: 0,
          debtPayments: 0,
          transactions: [],
          incomeTransactions: [],
          expenseTransactions: []
        };
      }

      // Enhanced categorization
      const category = (transaction.category || []).map(c => c.toLowerCase()).join(' ');
      const name = transaction.name.toLowerCase();
      
      // Identify income vs expense with better logic
      if (transaction.amount < 0 || incomeCategories.some(cat => category.includes(cat))) {
        monthlyData[monthKey].income += Math.abs(transaction.amount);
        monthlyData[monthKey].incomeTransactions.push(transaction);
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
        monthlyData[monthKey].expenseTransactions.push(transaction);
        
        // Track debt payments separately
        if (debtCategories.some(cat => name.includes(cat) || category.includes(cat))) {
          monthlyData[monthKey].debtPayments += transaction.amount;
        }
      }

      monthlyData[monthKey].transactions.push(transaction);
    });

    // Analyze patterns and detect issues
    const months = Object.keys(monthlyData).sort().slice(-6);
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalDebtPayments = 0;
    let monthsWithPositiveNet = 0;
    let monthsWithIrregularIncome = 0;

    months.forEach(month => {
      const data = monthlyData[month];
      const netIncome = data.income - data.expenses;
      
      totalIncome += data.income;
      totalExpenses += data.expenses;
      totalDebtPayments += data.debtPayments;
      
      if (netIncome > 0) {
        monthsWithPositiveNet++;
      }
      
      // Detect irregular income patterns
      if (data.income === 0 || data.incomeTransactions.length < 2) {
        monthsWithIrregularIncome++;
        warnings.push(`Irregular income detected in ${month}`);
      }
    });

    const avgMonthlyIncome = months.length > 0 ? totalIncome / months.length : 0;
    const avgMonthlyExpenses = months.length > 0 ? totalExpenses / months.length : 0;
    const avgMonthlyDebtPayments = months.length > 0 ? totalDebtPayments / months.length : 0;
    const avgMonthlyNet = avgMonthlyIncome - avgMonthlyExpenses;

    // Calculate income stability score
    const incomeStability = monthsWithIrregularIncome === 0 ? 100 : 
      Math.max(0, 100 - (monthsWithIrregularIncome / months.length) * 100);

    // Set warnings
    if (warnings.length > 0) {
      setDataWarnings(warnings);
    }

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => {
      return sum + (account.balances.current || 0);
    }, 0);

    return {
      accounts,
      totalBalance,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      avgMonthlyNet,
      avgMonthlyDebtPayments,
      monthsAnalyzed: months.length,
      monthsWithPositiveNet,
      monthsWithIrregularIncome,
      incomeStability,
      monthlyData,
      debtToIncomeRatio: avgMonthlyIncome > 0 ? (avgMonthlyDebtPayments / avgMonthlyIncome) * 100 : 0,
      expenseToIncomeRatio: avgMonthlyIncome > 0 ? (avgMonthlyExpenses / avgMonthlyIncome) * 100 : 0
    };
  };

  // Enhanced qualification calculation
  const calculateQualificationEnhanced = (analysis) => {
    const {
      avgMonthlyIncome,
      avgMonthlyExpenses,
      avgMonthlyNet,
      debtToIncomeRatio,
      monthsWithPositiveNet,
      monthsAnalyzed,
      incomeStability,
      expenseToIncomeRatio
    } = analysis;

    // Enhanced qualification criteria
    const criteria = {
      hasMinimumIncome: avgMonthlyIncome >= 2000,
      hasPositiveNetIncome: avgMonthlyNet > 0,
      hasConsistentPositiveNet: monthsWithPositiveNet >= 3,
      hasAcceptableDebtRatio: debtToIncomeRatio < 40,
      hasSufficientHistory: monthsAnalyzed >= 3,
      hasStableIncome: incomeStability >= 70,
      hasReasonableExpenses: expenseToIncomeRatio < 90
    };

    // Calculate qualification score
    const qualificationScore = Object.values(criteria).filter(v => v).length / Object.keys(criteria).length * 100;
    const isQualified = qualificationScore >= 70;

    // Calculate loan terms if qualified
    let maxLoanAmount = 0;
    let interestRate = 0;
    let monthlyPayment = 0;
    let denialReasons = [];
    let improvementTips = [];

    if (isQualified) {
      // Calculate max loan with enhanced formula
      const annualNetIncome = avgMonthlyNet * 12;
      const baseAmount = Math.min(annualNetIncome * 3, 50000);
      
      // Adjust based on income stability
      const stabilityMultiplier = 0.8 + (incomeStability / 100) * 0.4;
      maxLoanAmount = Math.round((baseAmount * stabilityMultiplier) / 1000) * 1000;

      // Enhanced interest rate calculation
      if (qualificationScore >= 90 && debtToIncomeRatio < 20) {
        interestRate = 5.99; // Excellent rate
      } else if (qualificationScore >= 80 && debtToIncomeRatio < 30) {
        interestRate = 7.99; // Good rate
      } else if (qualificationScore >= 70 && debtToIncomeRatio < 35) {
        interestRate = 9.99; // Standard rate
      } else {
        interestRate = 11.99; // Higher risk rate
      }

      // Calculate monthly payment
      const monthlyRate = interestRate / 100 / 12;
      const numPayments = 36;
      monthlyPayment = (maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                      (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      // Compile detailed denial reasons
      if (!criteria.hasMinimumIncome) {
        denialReasons.push({
          reason: 'Income below minimum requirement',
          detail: `Your monthly income of ${formatCurrency(avgMonthlyIncome)} is below our $2,000 minimum`
        });
        improvementTips.push('Increase your monthly income to at least $2,000');
      }
      if (!criteria.hasPositiveNetIncome) {
        denialReasons.push({
          reason: 'Negative net income',
          detail: 'Your expenses exceed your income'
        });
        improvementTips.push('Reduce monthly expenses or increase income');
      }
      if (!criteria.hasConsistentPositiveNet) {
        denialReasons.push({
          reason: 'Inconsistent positive cash flow',
          detail: `Only ${monthsWithPositiveNet} months with positive net income`
        });
        improvementTips.push('Maintain positive net income for at least 3 consecutive months');
      }
      if (!criteria.hasAcceptableDebtRatio) {
        denialReasons.push({
          reason: 'High debt-to-income ratio',
          detail: `Your ratio of ${debtToIncomeRatio.toFixed(1)}% exceeds our 40% limit`
        });
        improvementTips.push('Pay down existing debts to reduce your debt-to-income ratio');
      }
      if (!criteria.hasStableIncome) {
        denialReasons.push({
          reason: 'Irregular income pattern',
          detail: 'Your income shows significant variations month-to-month'
        });
        improvementTips.push('Establish a more consistent income pattern');
      }
    }

    return {
      isQualified,
      qualificationScore,
      criteria,
      maxLoanAmount,
      interestRate,
      monthlyPayment,
      denialReasons,
      improvementTips,
      financialSummary: {
        monthlyIncome: avgMonthlyIncome,
        monthlyExpenses: avgMonthlyExpenses,
        monthlyNet: avgMonthlyNet,
        debtToIncomeRatio,
        expenseToIncomeRatio,
        incomeStability
      }
    };
  };

  // Retry handler
  const handleRetry = () => {
    setError(null);
    setErrorType(null);
    
    if (currentStep === 2) {
      // Reset to allow reconnecting bank
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Skeleton loader component
  const SkeletonLoader = ({ className = '' }) => (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  // Progress bar component
  const ProgressBar = ({ progress, label }) => (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  // Success animation component
  const SuccessAnimation = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-full p-8 shadow-2xl animate-bounce-in">
        <svg className="w-24 h-24 text-green-500 animate-check-mark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  );

  // Render step indicator with enhanced visuals
  const renderStepIndicator = () => (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li key={step.number} className="flex-1">
              <div className={`flex flex-col items-center ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="relative flex items-center justify-center">
                  {index !== steps.length - 1 && (
                    <div 
                      className={`absolute left-full w-full h-0.5 transition-all duration-500 ${
                        currentStep > step.number ? 'bg-foreground' : 'bg-border'
                      }`} 
                      style={{ width: 'calc(100% + 2rem)' }} 
                    />
                  )}
                  <span className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    currentStep > step.number
                      ? 'border-foreground text-foreground'
                      : currentStep === step.number
                      ? 'border-foreground text-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    <span className="text-lg font-medium">{step.number}</span>
                  </span>
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );

  // Render Step 1: Enhanced explanation
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Check Your Loan Qualification
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Get instant approval decision in 3 simple steps
        </p>
      </div>

      <div className="rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground">Secure Connection</h4>
            <p className="text-sm text-muted-foreground mt-1">
              256-bit encrypted bank link via Plaid
            </p>
          </div>
          <div className="rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground">Smart Analysis</h4>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered financial assessment
            </p>
          </div>
          <div className="rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground">Instant Decision</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Results in under 2 minutes
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border p-6">
          <h4 className="font-semibold text-foreground mb-3">What We Check</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Monthly income stability</li>
            <li>• Expense patterns</li>
            <li>• Debt-to-income ratio</li>
            <li>• Cash flow consistency</li>
          </ul>
        </div>
        
        <div className="rounded-lg border border-border p-6">
          <h4 className="font-semibold text-foreground mb-3">Requirements</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Minimum $2,000 monthly income</li>
            <li>• 3+ months transaction history</li>
            <li>• Debt-to-income under 40%</li>
            <li>• Active checking account</li>
          </ul>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-foreground">Privacy Notice</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We use read-only access and never store your banking credentials. Your data is processed securely and deleted after analysis.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-8 py-3 border border-border font-semibold rounded-lg hover:bg-muted transition-all duration-200"
        >
          Continue to Bank Connection
        </button>
      </div>
    </div>
  );

  // Render Step 2: Enhanced bank connection
  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Connect Your Bank Account
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Securely link your account for instant analysis
        </p>
      </div>

      {isAnalyzing ? (
        <div className="rounded-lg border border-border p-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <ProgressBar 
                progress={analysisProgress} 
                label={
                  analysisProgress < 30 ? "Fetching account data..." :
                  analysisProgress < 50 ? "Loading transactions..." :
                  analysisProgress < 70 ? "Analyzing patterns..." :
                  analysisProgress < 90 ? "Calculating qualification..." :
                  "Finalizing results..."
                }
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className={`h-4 w-4 rounded-full border-2 mb-2 mx-auto transition-all ${
                    analysisProgress >= 25 ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                  }`}></div>
                  <p className="text-xs text-muted-foreground">Secure Connection</p>
                </div>
                <div className="text-center">
                  <div className={`h-4 w-4 rounded-full border-2 mb-2 mx-auto transition-all ${
                    analysisProgress >= 50 ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                  }`}></div>
                  <p className="text-xs text-muted-foreground">Data Retrieved</p>
                </div>
                <div className="text-center">
                  <div className={`h-4 w-4 rounded-full border-2 mb-2 mx-auto transition-all ${
                    analysisProgress >= 75 ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                  }`}></div>
                  <p className="text-xs text-muted-foreground">Analysis Complete</p>
                </div>
                <div className="text-center">
                  <div className={`h-4 w-4 rounded-full border-2 mb-2 mx-auto transition-all ${
                    analysisProgress >= 100 ? 'border-foreground bg-foreground' : 'border-muted-foreground'
                  }`}></div>
                  <p className="text-xs text-muted-foreground">Results Ready</p>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              This usually takes 30-60 seconds...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {error.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error.message}
                </p>
                {error.canRetry && retryCount < MAX_RETRY_ATTEMPTS && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Try Again ({MAX_RETRY_ATTEMPTS - retryCount} attempts left)
                    </button>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                )}
                {(!error.canRetry || retryCount >= MAX_RETRY_ATTEMPTS) && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Start Over
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Contact Support
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {retryCount > 0 && (
            <div className="border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> If you continue to experience issues, try clearing your browser cache or using a different browser.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Bank-Level Security
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    256-bit encryption protects your data
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Read-only access - we can\'t make changes
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Powered by Plaid, trusted by major banks
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <PlaidLink
              userId={userId}
              onSuccess={handleBankConnected}
              className="w-full max-w-md"
            />
            
            <button
              onClick={() => setCurrentStep(1)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center transition-colors"
            >
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to previous step
            </button>
          </div>

          {dataWarnings.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Data Quality Notice</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {dataWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render Step 3: Enhanced results
  const renderStep3 = () => {
    if (!qualificationResults) return null;

    const { 
      isQualified, 
      qualificationScore,
      maxLoanAmount, 
      interestRate, 
      monthlyPayment, 
      denialReasons,
      improvementTips, 
      financialSummary,
      criteria
    } = qualificationResults;

    return (
      <div className="space-y-6 animate-fadeIn">
        {showSuccessAnimation && <SuccessAnimation />}
        
        {/* Qualification Status Card */}
        <div className="rounded-xl p-8 border border-border">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              {isQualified ? 'Congratulations! You\'re Qualified!' : 'Not Qualified Yet'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isQualified 
                ? `You qualify for a loan up to ${formatCurrency(maxLoanAmount)}`
                : 'Let\'s work on improving your financial profile'}
            </p>
            
            {/* Qualification Score */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Qualification Score</span>
                <span className="text-sm font-bold text-foreground">
                  {qualificationScore.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-1000 bg-foreground"
                  style={{ width: `${qualificationScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Terms (if qualified) */}
        {isQualified && (
          <div className="rounded-lg border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Your Personalized Loan Terms</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Maximum Amount</p>
                <p className="text-4xl font-bold text-foreground">{formatCurrency(maxLoanAmount)}</p>
                <p className="text-xs text-muted-foreground mt-2">Based on your income</p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Interest Rate</p>
                <p className="text-4xl font-bold text-foreground">{formatPercentage(interestRate)}</p>
                <p className="text-xs text-muted-foreground mt-2">APR</p>
              </div>
              <div className="text-center p-6 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">Monthly Payment</p>
                <p className="text-4xl font-bold text-foreground">{formatCurrency(monthlyPayment)}</p>
                <p className="text-xs text-muted-foreground mt-2">36-month term</p>
              </div>
            </div>
          </div>
        )}

        {/* Denial Reasons (if not qualified) */}
        {!isQualified && denialReasons.length > 0 && (
          <div className="rounded-lg border border-border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Qualification Requirements Not Met</h3>
            <div className="space-y-4">
              {denialReasons.map((item, index) => (
                <div key={index} className="rounded-lg p-4 border border-border">
                  <div className="flex items-start">
                    <div>
                      <p className="font-medium text-foreground">{item.reason}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Improvement Tips */}
            <div className="mt-6 rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">How to Improve Your Qualification</h4>
              <ul className="space-y-2">
                {improvementTips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Enhanced Financial Summary */}
        <div className="rounded-lg border border-border p-6">
          <h3 className="text-xl font-semibold text-foreground mb-6">Your Financial Analysis</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Income & Expenses */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Income</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(financialSummary.monthlyIncome)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Expenses</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(financialSummary.monthlyExpenses)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((financialSummary.monthlyExpenses / financialSummary.monthlyIncome) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Net Income</span>
                  <span className={`text-lg font-bold ${
                    financialSummary.monthlyNet > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(financialSummary.monthlyNet)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ratios & Stability */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Debt-to-Income Ratio</span>
                  <span className={`text-sm font-bold ${
                    financialSummary.debtToIncomeRatio < 40 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(financialSummary.debtToIncomeRatio)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      financialSummary.debtToIncomeRatio < 40 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(financialSummary.debtToIncomeRatio, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: Under 40%</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Income Stability</span>
                  <span className={`text-sm font-bold ${
                    financialSummary.incomeStability >= 70 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {formatPercentage(financialSummary.incomeStability)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      financialSummary.incomeStability >= 70 ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${financialSummary.incomeStability}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on consistency</p>
              </div>
            </div>
          </div>

          {/* Qualification Criteria Checklist */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Qualification Criteria</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(criteria).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  {value ? (
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-sm ${value ? 'text-gray-700' : 'text-gray-500'}`}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isQualified ? (
            <>
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Apply for Loan
              </button>
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200">
                Adjust Loan Amount
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setQualificationResults(null);
                  setFinancialData(null);
                  setError(null);
                  setRetryCount(0);
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Try Again
              </button>
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200">
                Get Financial Coaching
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes check-mark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        
        .animate-check-mark {
          stroke-dasharray: 100;
          animation: check-mark 0.5s ease-out forwards;
        }
      `}</style>
      
      {renderStepIndicator()}
      
      <div className="rounded-xl border border-border p-6 sm:p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
}