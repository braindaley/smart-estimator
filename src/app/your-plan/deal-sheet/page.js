'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import ClickableLabel from '@/components/ClickableLabel';
import { mapPlaidToDealsSheet, getFieldDisplayName, formatCurrency } from '@/lib/plaid-mapping';
import { getMockCraIncomeForPeriod, calculateAverageMonthlyIncome, getIncomeConfidencePercentage } from '@/lib/mock-cra-income';
import { calculateMonthlyMomentumPayment } from '@/lib/calculations';

// Dynamically import session-store to avoid SSR issues
const getPlaidData = typeof window !== 'undefined' 
  ? require('@/lib/session-store').getPlaidData 
  : () => null;

// Function to get credit data
const getCreditData = () => {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem('loan_user_id');
  if (!userId) return null;
  const storedCreditData = localStorage.getItem(`credit_data_${userId}`);
  if (!storedCreditData) return null;
  try {
    return JSON.parse(storedCreditData);
  } catch {
    return null;
  }
};

// Function to get Equifax narrative codes configuration
const getEquifaxNarrativeCodes = () => {
  if (typeof window === 'undefined') return [];
  const savedConfig = localStorage.getItem('equifax-narrative-codes');
  if (!savedConfig) return [];
  try {
    return JSON.parse(savedConfig);
  } catch {
    return [];
  }
};

// Function to check if an account's narrative codes are included in settlement
const isNarrativeCodeIncludedInSettlement = (account, narrativeCodes) => {
  if (narrativeCodes.length === 0) {
    return false;
  }

  const accountNarrativeCodes = [];
  if (account.narrativeCodes && Array.isArray(account.narrativeCodes)) {
    account.narrativeCodes.forEach(nc => {
      if (nc.codeabv) accountNarrativeCodes.push(nc.codeabv);
      if (nc.code) accountNarrativeCodes.push(nc.code);
    });
  }

  if (accountNarrativeCodes.length === 0) {
    return false;
  }

  const hasIncludedCode = accountNarrativeCodes.some(accountCode => {
    const narrativeConfig = narrativeCodes.find(config => config.code === accountCode);
    return narrativeConfig && narrativeConfig.includeInSettlement;
  });

  return hasIncludedCode;
};

// Function to determine display category from narrative codes
const getDisplayCategoryFromNarrativeCodes = (account) => {
  // Check narrative codes for account type indicators
  if (!account.narrativeCodes || !Array.isArray(account.narrativeCodes)) {
    return 'Other';
  }

  // Map narrative codes to display categories (for UI purposes only)
  const narrativeCodeToDisplayCategory = {
    // Credit Cards
    'FE': 'Credit Card',
    'AV': 'Credit Card', // Charge
    'CV': 'Credit Card', // Line of credit
    'CK': 'Credit Card', // Debit card
    'GR': 'Credit Card', // Secured credit card
    'JX': 'Credit Card', // Flexible spending credit card

    // Personal Loans
    'AU': 'Personal Loan',
    'DS': 'Personal Loan', // Single payment loan
    'JO': 'Personal Loan', // Note loan
    'EX': 'Personal Loan', // Unsecured
    'EY': 'Personal Loan', // Business account -personal guarantee

    // Auto Loans
    'AO': 'Auto Loan',
    'AM': 'Auto Loan', // Voluntary surrender; there may be a balance due
    'AN': 'Auto Loan', // Involuntary repossession
    'JQ': 'Auto Loan', // Auto lease

    // Medical
    'GS': 'Medical',

    // Collections (display as Personal Loan for settlement purposes)
    'CZ': 'Personal Loan', // Collection account
    'BY': 'Personal Loan', // Collection agency account - status unknown
    'ER': 'Personal Loan', // Paid collection

    // Retail/Store Credit
    'AQ': 'Retail Credit', // Household goods
    'GQ': 'Retail Credit', // Recreational merchandise

    // Student Loans (if they somehow get through admin filter)
    'BU': 'Student Loan', // Student loan
    'EG': 'Student Loan', // Guaranteed student loan
    'EH': 'Student Loan', // National direct student loan
    'DQ': 'Student Loan', // Student loan - payment deferred
    'FD': 'Student Loan', // Defaulted student loan
    'GJ': 'Student Loan', // Student loan assigned to government

    // Mortgages (if they somehow get through admin filter)
    'AR': 'Mortgage', // Home loan
    'AS': 'Mortgage', // Home improvement loan
    'EF': 'Mortgage', // Real estate mortgage
    'EC': 'Mortgage', // Home equity
    'JU': 'Mortgage', // Home equity line of credit
    'JW': 'Mortgage', // Construction loan
    'HP': 'Mortgage', // Fha mortgage
    'HQ': 'Mortgage', // Va mortgage
    'HR': 'Mortgage', // Conventional mortgage
    'HS': 'Mortgage', // Second mortgage
    'DT': 'Mortgage', // Amortized mortgage
    'GP': 'Mortgage', // Manufactured housing
  };

  // Check all narrative codes for the account
  for (const narrativeCode of account.narrativeCodes) {
    const code = narrativeCode.code || narrativeCode.codeabv;
    if (code && narrativeCodeToDisplayCategory.hasOwnProperty(code)) {
      return narrativeCodeToDisplayCategory[code];
    }
  }

  // If no specific mapping found, return 'Other'
  return 'Other';
};

// Note: Account types are now determined directly from narrative codes
// No longer need keyword-based matching configuration


export default function DealSheetPage() {
  const [plaidData, setPlaidData] = useState(null);
  const [mappedData, setMappedData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [hasPlaidData, setHasPlaidData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [creditData, setCreditData] = useState(null);
  const [debtAccounts, setDebtAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [liabilitiesData, setLiabilitiesData] = useState(null);
  const [calculatedProgramCost, setCalculatedProgramCost] = useState(0);
  const [formData, setFormData] = useState({
    // Monthly Expenditure Details
    totalMonthlyIncome: '',
    programCost: '',
    settlementDebt: '',
    totalExpenses: '',
    totalMonthlyExpenseWithProgram: '',
    availableFunds: '',
    monthlyDebtToIncomeRatio: '',
    monthlyDebtToIncomeRatioWithoutProgram: '',
    
    // Hardship Reason (placeholder for now)
    hardshipReason: '',
    
    // Applicant Details
    netMonthlyEmploymentIncome: '',
    selfEmployment: '',
    socialSecurity: '',
    unemployment: '',
    alimony: '',
    childSupport: '',
    otherGovtAssistance: '',
    annuities: '',
    dividends: '',
    retirement: '',
    otherIncome: '',
    incomeFrequency: '',
    applicantComments: '',
    
    // Co-Applicant Details
    coApplicantNetMonthlyIncome: '',
    coApplicantSelfEmployment: '',
    coApplicantSocialSecurity: '',
    coApplicantUnemployment: '',
    coApplicantAlimony: '',
    coApplicantChildSupport: '',
    coApplicantOtherGovtAssistance: '',
    coApplicantAnnuities: '',
    coApplicantDividends: '',
    coApplicantRetirement: '',
    coApplicantOtherIncome: '',
    coApplicantIncomeFrequency: '',
    coApplicantComments: '',
    
    // Monthly Expense fields
    housingPayment: '',
    homeOwnersInsurance: '',
    secondaryHousingPayment: '',
    healthLifeInsurance: '',
    medicalCare: '',
    prescriptionsMedicalExp: '',
    autoPayments: '',
    autoInsurance: '',
    repairsMaintenance: '',
    gasoline: '',
    parking: '',
    commuting: '',
    groceries: '',
    eatingOut: '',
    gasElectricOil: '',
    phoneIncludeCell: '',
    waterSewerGarbage: '',
    cableSatelliteInternet: '',
    clothing: '',
    householdItems: '',
    entertainment: '',
    petCare: '',
    gifts: '',
    toiletries: '',
    hairCare: '',
    laundry: '',
    gym: '',
    personalCare: '',
    charityDonations: '',
    daycareChildExpenses: '',
    nursingCare: '',
    misc: '',
    fundsAvailable: ''
  });

  // Function to load and process credit data
  const loadCreditData = () => {
    try {
      const data = getCreditData();
      const narrativeCodes = getEquifaxNarrativeCodes();

      if (data && data.trades && Array.isArray(data.trades)) {
        setCreditData(data);

        // Filter accounts with positive balance first (same logic as results page)
        const accountsWithBalance = data.trades.filter(account => {
          const balance = typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0;
          return balance > 0;
        });

        // Filter accounts eligible for settlement using narrative codes (same logic as results page)
        const eligibleAccounts = accountsWithBalance.filter(account =>
          isNarrativeCodeIncludedInSettlement(account, narrativeCodes)
        );

        // Add display category based on narrative codes (all eligible accounts are included)
        const accountsWithTypes = eligibleAccounts.map(account => {
          const matchedType = getDisplayCategoryFromNarrativeCodes(account);
          return {
            ...account,
            matchedType,
            balance: typeof account.balance === 'number' ? account.balance : parseFloat(account.balance) || 0
          };
        });

        setDebtAccounts(accountsWithTypes);
        console.log('[DealSheet] Loaded eligible debt accounts (settlement-eligible only):', accountsWithTypes);
        console.log('[DealSheet] Total accounts in credit report:', data.trades.length);
        console.log('[DealSheet] Accounts with positive balance:', accountsWithBalance.length);
        console.log('[DealSheet] Accounts eligible for settlement:', accountsWithTypes.length);
      } else {
        console.log('[DealSheet] No credit data or trades found');
        setCreditData(null);
        setDebtAccounts([]);
      }
    } catch (error) {
      console.error('Error loading credit data:', error);
      setCreditData(null);
      setDebtAccounts([]);
    }
  };

  // Function to load liabilities data
  const loadLiabilitiesData = async () => {
    try {
      const userId = sessionStorage.getItem('userId') || 'demo-user';
      const clientToken = sessionStorage.getItem('plaidAccessToken');

      const response = await fetch('/api/plaid/liabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          clientToken
        }),
      });

      if (response.ok) {
        const liabilities = await response.json();
        console.log('[DealSheet] Liabilities data loaded:', liabilities);
        setLiabilitiesData(liabilities);
      } else {
        console.log('[DealSheet] Failed to load liabilities data');
        setLiabilitiesData(null);
      }
    } catch (error) {
      console.error('[DealSheet] Error loading liabilities data:', error);
      setLiabilitiesData(null);
    }
  };

  // Function to load and process Plaid data
  const loadPlaidData = () => {
    setIsRefreshing(true);
    try {
      const storedPlaidData = getPlaidData();
      console.log('[DealSheet] Stored Plaid data:', storedPlaidData);
      
      if (!storedPlaidData) {
        console.log('[DealSheet] No Plaid data found in session storage. Please connect your bank account first.');
        setHasPlaidData(false);
        return;
      }
      
      if (storedPlaidData && storedPlaidData.data) {
        setHasPlaidData(true);
        setPlaidData(storedPlaidData.data);
        
        // Map Plaid data to deal sheet format
        // Note: data structure is { data: { transactions: [...], accounts: [...] } }
        if (storedPlaidData.data.transactions && storedPlaidData.data.accounts) {
          console.log('[DealSheet] Processing transactions:', storedPlaidData.data.transactions.transactions?.length || storedPlaidData.data.transactions.length);
          
          // Extract the actual transactions array from the API response
          const transactionsArray = storedPlaidData.data.transactions.transactions || storedPlaidData.data.transactions;
          const accountsArray = storedPlaidData.data.accounts.accounts || storedPlaidData.data.accounts;
          
          console.log('[DealSheet] Transactions array:', transactionsArray);
          console.log('[DealSheet] Accounts array:', accountsArray);
          
          // Set available accounts for filtering
          const accounts = accountsArray.map(account => ({
            account_id: account.account_id,
            name: account.name,
            official_name: account.official_name,
            type: account.type,
            subtype: account.subtype
          }));
          
          // Only update selected accounts if the available accounts have actually changed
          setAvailableAccounts(prevAccounts => {
            const newAccountIds = accounts.map(acc => acc.account_id).sort();
            const prevAccountIds = prevAccounts.map(acc => acc.account_id).sort();
            const accountsChanged = JSON.stringify(newAccountIds) !== JSON.stringify(prevAccountIds);
            
            if (accountsChanged) {
              console.log('[DealSheet] Available accounts changed, resetting selection');
              // Initialize all accounts as selected by default when accounts change
              setSelectedAccounts(accounts.map(acc => acc.account_id));
            } else {
              console.log('[DealSheet] Available accounts unchanged, preserving selection');
            }
            
            return accounts;
          });
          
          const mapped = mapPlaidToDealsSheet(transactionsArray, accountsArray);
          console.log('[DealSheet] Mapped data:', mapped);
          setMappedData(mapped);
          
          // Update form data with 3-period averages (delayed to allow mappedData state to update)
          setTimeout(() => {
            const updatedFormData = {};
            
            // Map income fields using mock CRA data (3-period averages)
            // Use mock CRA income data instead of transaction-based mapping
            const mockCraPeriod1 = getMockCraIncomeForPeriod(1);
            const mockCraPeriod2 = getMockCraIncomeForPeriod(2);
            const mockCraPeriod3 = getMockCraIncomeForPeriod(3);

            const period1Income = mockCraPeriod1.income.summary.total_monthly_income;
            const period2Income = mockCraPeriod2.income.summary.total_monthly_income;
            const period3Income = mockCraPeriod3.income.summary.total_monthly_income;
            const averageIncome = calculateAverageMonthlyIncome();

            // Set the Net Monthly Employment Income based on mock CRA data
            updatedFormData.netMonthlyEmploymentIncome = averageIncome.toFixed(2);

            console.log('[DealSheet] Mock CRA Income Data:', {
              period1: period1Income,
              period2: period2Income,
              period3: period3Income,
              average: averageIncome,
              confidence: getIncomeConfidencePercentage() + '%'
            });
            
            // Map expense fields using 3-period averages
            const expenseFieldMapping = {
              housingPayment: 'housingPayment',
              homeOwnersInsurance: 'homeOwnersInsurance',
              secondaryHousingPayment: 'secondaryHousingPayment',
              healthLifeInsurance: 'healthLifeInsurance',
              medicalCare: 'medicalCare',
              prescriptionsMedicalExp: 'prescriptionsMedicalExp',
              autoPayments: 'autoPayments',
              autoInsurance: 'autoInsurance',
              repairsMaintenance: 'repairsMaintenance',
              gasoline: 'gasoline',
              parking: 'parking',
              commuting: 'commuting',
              groceries: 'groceries',
              eatingOut: 'eatingOut',
              gasElectricOil: 'gasElectricOil',
              phoneIncludeCell: 'phoneIncludeCell',
              waterSewerGarbage: 'waterSewerGarbage',
              cableSatelliteInternet: 'cableSatelliteInternet',
              clothing: 'clothing',
              householdItems: 'householdItems',
              entertainment: 'entertainment',
              petCare: 'petCare',
              gifts: 'gifts',
              toiletries: 'toiletries',
              hairCare: 'hairCare',
              laundry: 'laundry',
              gym: 'gym',
              personalCare: 'personalCare',
              charityDonations: 'charityDonations',
              daycareChildExpenses: 'daycareChildExpenses',
              nursingCare: 'nursingCare',
              misc: 'misc'
            };
            
            Object.keys(mapped.expenses).forEach(key => {
              if (expenseFieldMapping[key]) {
                const average = getFieldAverage(key, true);
                if (average > 0) {
                  updatedFormData[expenseFieldMapping[key]] = average.toFixed(2);
                }
              }
            });
          
            console.log('[DealSheet] Setting form data with 3-period averages:', updatedFormData);
            
            // Update the form data state with the new values
            setFormData(prev => ({
              ...prev,
              ...updatedFormData
            }));
          }, 100); // Small delay to ensure mappedData state has been set
        }
      }
    } catch (error) {
      console.error('Error loading Plaid data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPlaidData();
    loadCreditData();
    loadLiabilitiesData();
  }, []);

  // Calculate program cost after liabilities data is loaded
  useEffect(() => {
    const getMomentumResults = () => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = sessionStorage.getItem('momentumResults');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    };

    // Get program cost from stored momentum results or calculate as fallback
    const momentumResults = getMomentumResults();
    console.log('[DealSheet] Retrieved momentum results:', momentumResults);

    let programCost = momentumResults?.monthlyPayment || 0;
    console.log('[DealSheet] Monthly payment from stored results:', programCost);

    // Fallback: calculate program cost if no stored results and we have debt data
    if (programCost === 0 && liabilitiesData?.debt_summary) {
      const totalDebtAmount = liabilitiesData.debt_summary.total_credit_card_debt +
        liabilitiesData.debt_summary.total_student_loan_debt;

      if (totalDebtAmount >= 15000) { // Minimum for Momentum plan
        programCost = calculateMonthlyMomentumPayment(totalDebtAmount);
        console.log('[DealSheet] Calculated fallback program cost:', programCost, 'for debt amount:', totalDebtAmount);
      }
    }

    console.log('[DealSheet] Final monthly program cost:', programCost);
    console.log('[DealSheet] Is using stored results?', !!momentumResults);
    console.log('[DealSheet] Is using fallback calculation?', programCost > 0 && !momentumResults);
    setCalculatedProgramCost(programCost);
  }, [liabilitiesData]);

  // Listen for storage events to refresh when Plaid data is updated
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'plaidData') {
        console.log('[DealSheet] Plaid data updated in session storage, refreshing...');
        loadPlaidData();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically (in case of same-tab updates)
    const interval = setInterval(() => {
      const currentData = getPlaidData();
      if (currentData && (!plaidData || currentData.storedAt !== plaidData.storedAt)) {
        console.log('[DealSheet] Plaid data timestamp changed, refreshing...');
        loadPlaidData();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [plaidData]);

  const handleFieldClick = (fieldName) => {
    if (mappedData && mappedData.transactionDetails[fieldName]) {
      setSelectedField({
        name: getFieldDisplayName(fieldName),
        fieldKey: fieldName,
        transactions: mappedData.transactionDetails[fieldName],
        totalAmount: mappedData.income[fieldName] || mappedData.expenses[fieldName] || 0
      });
      setModalOpen(true);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Create comprehensive deal sheet data including Plaid mappings
    const dealSheetData = {
      // Basic form data
      ...formData,
      
      // Plaid integration metadata
      plaidData: {
        connected: hasPlaidData,
        sessionId: plaidData?.storedAt,
        mappingSource: '/admin/plaid', // Reference to mapping definitions
        lastUpdated: new Date().toISOString(),
      },
      
      // Mapped amounts from Plaid (read-only, for reference)
      plaidMappings: mappedData ? {
        income: {
          totalMappedIncome: Object.values(mappedData.income).reduce((a, b) => a + b, 0),
          mappedFields: Object.entries(mappedData.income)
            .filter(([key, value]) => value > 0)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        },
        expenses: {
          totalMappedExpenses: Object.values(mappedData.expenses).reduce((a, b) => a + b, 0),
          mappedFields: Object.entries(mappedData.expenses)
            .filter(([key, value]) => value > 0)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        },
        transactionSummary: {
          totalTransactions: (mappedData.unmapped?.length || 0) + 
            Object.values(mappedData.transactionDetails || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0),
          mappedTransactions: Object.values(mappedData.transactionDetails || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0),
          unmappedTransactions: mappedData.unmapped?.length || 0,
        }
      } : null,
      
      // Deal sheet calculations
      calculations: {
        totalMonthlyIncome: mappedData ? Object.values(mappedData.income).reduce((a, b) => a + b, 0) : 0,
        totalMonthlyExpenses: mappedData ? Object.values(mappedData.expenses).reduce((a, b) => a + b, 0) : 0,
        netCashFlow: mappedData ? 
          Object.values(mappedData.income).reduce((a, b) => a + b, 0) - 
          Object.values(mappedData.expenses).reduce((a, b) => a + b, 0) : 0,
      },
      
      // Timestamp
      savedAt: new Date().toISOString(),
    };
    
    console.log('Saving comprehensive deal sheet data:', dealSheetData);
    
    // Here you would typically send this to your backend API
    // Example: await fetch('/api/deal-sheet', { method: 'POST', body: JSON.stringify(dealSheetData) })
    
    alert(`Deal Sheet Saved!\n\nPlaid Data: ${hasPlaidData ? 'Connected' : 'Not Connected'}\nTotal Income: ${formatCurrency(dealSheetData.calculations.totalMonthlyIncome)}\nTotal Expenses: ${formatCurrency(dealSheetData.calculations.totalMonthlyExpenses)}\nNet Cash Flow: ${formatCurrency(dealSheetData.calculations.netCashFlow)}`);
  };

  const handleCancel = () => {
    console.log('Canceling changes');
  };

  // Function to get transactions for a specific date range
  const getTransactionsForPeriod = (transactions, startDate, endDate) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  // Function to calculate period date ranges based on actual transaction data
  const getPeriodDateRanges = () => {
    // Get actual date range from transaction data
    const allTransactions = mappedData?.transactionDetails ?
      Object.values(mappedData.transactionDetails).flat() : [];

    if (allTransactions.length === 0) {
      // Fallback to current date if no transactions
      const now = new Date();
      const period1Start = new Date(now); period1Start.setDate(period1Start.getDate() - 30);
      const period2Start = new Date(now); period2Start.setDate(period2Start.getDate() - 60);
      const period3Start = new Date(now); period3Start.setDate(period3Start.getDate() - 90);

      return {
        period1: { start: period1Start, end: new Date(now) },
        period2: { start: period2Start, end: period1Start },
        period3: { start: period3Start, end: period2Start }
      };
    }

    // Find actual date range from transactions
    let minDate = null;
    let maxDate = null;
    allTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (!minDate || transactionDate < minDate) minDate = transactionDate;
      if (!maxDate || transactionDate > maxDate) maxDate = transactionDate;
    });

    // Calculate 30-day periods based on actual data range
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const periodLength = Math.ceil(totalDays / 3);

    // Period 1: Most recent period
    const period1End = new Date(maxDate);
    const period1Start = new Date(maxDate);
    period1Start.setDate(period1Start.getDate() - periodLength);

    // Period 2: Middle period
    const period2End = new Date(period1Start);
    const period2Start = new Date(period1Start);
    period2Start.setDate(period2Start.getDate() - periodLength);

    // Period 3: Oldest period
    const period3End = new Date(period2Start);
    const period3Start = new Date(minDate);

    console.log('[Periods] Date ranges calculated:', {
      totalDays,
      periodLength,
      period1: { start: period1Start.toDateString(), end: period1End.toDateString() },
      period2: { start: period2Start.toDateString(), end: period2End.toDateString() },
      period3: { start: period3Start.toDateString(), end: period3End.toDateString() }
    });

    return {
      period1: { start: period1Start, end: period1End },
      period2: { start: period2Start, end: period2End },
      period3: { start: period3Start, end: period3End }
    };
  };

  // Function to filter mapped data based on selected accounts
  const getFilteredMappedData = () => {
    if (!mappedData) {
      return null;
    }

    // If no accounts are selected, return empty structure (not null)
    if (selectedAccounts.length === 0) {
      const emptyData = {
        income: {},
        expenses: {},
        unmapped: [],
        transactionDetails: {}
      };

      // Initialize all fields to 0
      Object.keys(mappedData.income).forEach(field => {
        emptyData.income[field] = 0;
        emptyData.transactionDetails[field] = [];
      });
      
      Object.keys(mappedData.expenses).forEach(field => {
        emptyData.expenses[field] = 0;
        emptyData.transactionDetails[field] = [];
      });

      return emptyData;
    }

    const filteredData = {
      income: {},
      expenses: {},
      unmapped: [],
      transactionDetails: {}
    };

    // Initialize all fields to 0
    Object.keys(mappedData.income).forEach(field => {
      filteredData.income[field] = 0;
      filteredData.transactionDetails[field] = [];
    });
    
    Object.keys(mappedData.expenses).forEach(field => {
      filteredData.expenses[field] = 0;
      filteredData.transactionDetails[field] = [];
    });

    // Filter income transactions
    Object.entries(mappedData.transactionDetails).forEach(([field, transactions]) => {
      if (transactions) {
        const filteredTransactions = transactions.filter(transaction => 
          selectedAccounts.includes(transaction.account_id)
        );
        
        if (filteredTransactions.length > 0) {
          filteredData.transactionDetails[field] = filteredTransactions;
          
          // Recalculate totals for income fields
          if (mappedData.income[field] !== undefined) {
            filteredData.income[field] = filteredTransactions.reduce((sum, tx) => 
              sum + Math.abs(tx.mappedAmount), 0
            );
          }
          
          // Recalculate totals for expense fields
          if (mappedData.expenses[field] !== undefined) {
            filteredData.expenses[field] = filteredTransactions.reduce((sum, tx) => 
              sum + tx.mappedAmount, 0
            );
          }
        }
      }
    });

    // Filter unmapped transactions
    if (mappedData.unmapped) {
      filteredData.unmapped = mappedData.unmapped.filter(transaction => 
        selectedAccounts.includes(transaction.account_id)
      );
    }

    return filteredData;
  };

  // Function to calculate 3-period average for a specific field
  const getFieldAverage = (fieldKey, isExpense = false) => {
    const periodData = getPeriodData();
    if (!periodData) return 0;
    
    const dataSource = isExpense ? 'expenses' : 'income';
    const period1Value = periodData.period1[dataSource][fieldKey] || 0;
    const period2Value = periodData.period2[dataSource][fieldKey] || 0;
    const period3Value = periodData.period3[dataSource][fieldKey] || 0;
    
    return (period1Value + period2Value + period3Value) / 3;
  };

  // Function to get period-specific data with date filtering
  const getPeriodData = () => {
    if (!mappedData) return null;

    const filteredData = getFilteredMappedData();
    if (!filteredData) return null;
    
    // Check if we have any selected accounts - if not, we should still process the empty structure
    const dataToUse = filteredData;
    const periods = getPeriodDateRanges();

    const periodData = {
      period1: { income: {}, expenses: {}, transactionDetails: {} },
      period2: { income: {}, expenses: {}, transactionDetails: {} },
      period3: { income: {}, expenses: {}, transactionDetails: {} }
    };

    // Initialize all fields for each period
    Object.keys(dataToUse.income).forEach(field => {
      periodData.period1.income[field] = 0;
      periodData.period2.income[field] = 0;
      periodData.period3.income[field] = 0;
      periodData.period1.transactionDetails[field] = [];
      periodData.period2.transactionDetails[field] = [];
      periodData.period3.transactionDetails[field] = [];
    });

    Object.keys(dataToUse.expenses).forEach(field => {
      periodData.period1.expenses[field] = 0;
      periodData.period2.expenses[field] = 0;
      periodData.period3.expenses[field] = 0;
      periodData.period1.transactionDetails[field] = [];
      periodData.period2.transactionDetails[field] = [];
      periodData.period3.transactionDetails[field] = [];
    });

    // Process each field's transactions and distribute by date
    Object.entries(dataToUse.transactionDetails).forEach(([field, transactions]) => {
      if (transactions && transactions.length > 0) {
        // Filter transactions for each period
        const period1Transactions = getTransactionsForPeriod(transactions, periods.period1.start, periods.period1.end);
        const period2Transactions = getTransactionsForPeriod(transactions, periods.period2.start, periods.period2.end);
        const period3Transactions = getTransactionsForPeriod(transactions, periods.period3.start, periods.period3.end);

        // Debug logging for transaction distribution
        if (field === 'netMonthlyEmploymentIncome' && period1Transactions.length + period2Transactions.length + period3Transactions.length > 0) {
          console.log(`[Debug] Field: ${field}`, {
            total: transactions.length,
            period1Count: period1Transactions.length,
            period2Count: period2Transactions.length,
            period3Count: period3Transactions.length,
            sampleDates: transactions.slice(0, 5).map(tx => tx.date)
          });
        }

        // Calculate totals and store transactions for each period
        if (dataToUse.income[field] !== undefined) {
          // Income field
          periodData.period1.income[field] = period1Transactions.reduce((sum, tx) => sum + Math.abs(tx.mappedAmount), 0);
          periodData.period2.income[field] = period2Transactions.reduce((sum, tx) => sum + Math.abs(tx.mappedAmount), 0);
          periodData.period3.income[field] = period3Transactions.reduce((sum, tx) => sum + Math.abs(tx.mappedAmount), 0);
        } else if (dataToUse.expenses[field] !== undefined) {
          // Expense field
          periodData.period1.expenses[field] = period1Transactions.reduce((sum, tx) => sum + tx.mappedAmount, 0);
          periodData.period2.expenses[field] = period2Transactions.reduce((sum, tx) => sum + tx.mappedAmount, 0);
          periodData.period3.expenses[field] = period3Transactions.reduce((sum, tx) => sum + tx.mappedAmount, 0);
        }

        periodData.period1.transactionDetails[field] = period1Transactions;
        periodData.period2.transactionDetails[field] = period2Transactions;
        periodData.period3.transactionDetails[field] = period3Transactions;
      }
    });

    // Override income calculations with mock CRA data
    const mockCraPeriod1 = getMockCraIncomeForPeriod(1);
    const mockCraPeriod2 = getMockCraIncomeForPeriod(2);
    const mockCraPeriod3 = getMockCraIncomeForPeriod(3);

    // Replace netMonthlyEmploymentIncome with mock CRA values
    if (periodData.period1.income.hasOwnProperty('netMonthlyEmploymentIncome')) {
      periodData.period1.income.netMonthlyEmploymentIncome = mockCraPeriod1.income.summary.total_monthly_income;
      periodData.period2.income.netMonthlyEmploymentIncome = mockCraPeriod2.income.summary.total_monthly_income;
      periodData.period3.income.netMonthlyEmploymentIncome = mockCraPeriod3.income.summary.total_monthly_income;

      console.log('[getPeriodData] Overriding income with mock CRA data:', {
        period1: periodData.period1.income.netMonthlyEmploymentIncome,
        period2: periodData.period2.income.netMonthlyEmploymentIncome,
        period3: periodData.period3.income.netMonthlyEmploymentIncome,
        average: (periodData.period1.income.netMonthlyEmploymentIncome +
                 periodData.period2.income.netMonthlyEmploymentIncome +
                 periodData.period3.income.netMonthlyEmploymentIncome) / 3
      });
    }

    return periodData;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">
                  Deal Sheet
                </h1>
                {hasPlaidData && (
                  <div className="flex items-center gap-2">
                    {isRefreshing && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    )}
                    <Button
                      onClick={loadPlaidData}
                      variant="outline"
                      size="sm"
                      disabled={isRefreshing}
                      className="text-xs"
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                    <Button
                      onClick={() => window.open('/results/bank?session=' + (plaidData?.storedAt || Date.now()), '_blank')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      View Bank Results
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
                Your personalized deal sheet with all the details of your debt settlement plan.
                {hasPlaidData && (
                  <span className="block mt-1 text-gray-600">
                    ✓ Connected to bank data - values update automatically
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12">
          <Tabs defaultValue="deal-sheet" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deal-sheet">Deal Sheet</TabsTrigger>
              <TabsTrigger value="calculations">Calculations</TabsTrigger>
            </TabsList>

            <TabsContent value="deal-sheet" className="space-y-8">
          {/* Debt Portfolio Section */}
          <Card className="p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700">Debt Portfolio</h2>
            </div>
            
            {debtAccounts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {debtAccounts.map((account, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                            {account.matchedType}
                          </span>
                          <span className="text-xs text-gray-500">
                            ...{(account.accountNumber || '').slice(-4)}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 truncate">
                            {account.customerName || 'Unknown Creditor'}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {account.portfolioTypeCode?.description || account.portfolioTypeCode?.code || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Balance</span>
                            <span className="font-semibold text-sm text-gray-600">
                              {account.balance && account.balance !== 'N/A' 
                                ? `$${account.balance.toLocaleString()}` 
                                : 'N/A'}
                            </span>
                          </div>
                          {(account.minimumPayment || account.scheduledPaymentAmount) && (account.minimumPayment !== 'N/A' && account.scheduledPaymentAmount !== 'N/A') && (
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-600">Min Payment</span>
                              <span className="text-xs text-gray-800">
                                ${(account.minimumPayment || account.scheduledPaymentAmount || 0).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {account.rate?.description && (
                          <div className="pt-1">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                              account.rate.description.toLowerCase().includes('current')
                                ? 'bg-gray-100 text-gray-700'
                                : account.rate.description.toLowerCase().includes('past due')
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {account.rate.description}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary row */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {debtAccounts.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Accounts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        ${debtAccounts
                          .reduce((sum, account) => sum + (account.balance || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Balance</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        ${debtAccounts
                          .reduce((sum, account) => sum + (account.minimumPayment || account.scheduledPaymentAmount || 0), 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Payments</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        {[...new Set(debtAccounts.map(account => account.matchedType))].length}
                      </div>
                      <div className="text-sm text-gray-600">Account Types</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Data Available</h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-md">
                      Complete your credit check to see your debt portfolio including credit cards, personal loans, medical debts, and retail credit accounts.
                    </p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <p>• Credit Card accounts (Visa, Mastercard, Discover, etc.)</p>
                      <p>• Personal Loans (SoFi, Upstart, Prosper, etc.)</p>
                      <p>• Medical debts and healthcare accounts</p>
                      <p>• Retail Credit (Macy's, Best Buy, Target, etc.)</p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/your-plan'}
                      className="mt-6 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Complete Credit Check
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* No Plaid Data Warning */}
          {!hasPlaidData && (
            <div className="mb-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">No Bank Data Connected</h3>
                    <p className="mt-1 text-sm text-gray-700">
                      To see auto-filled income and expense data in your deal sheet, you need to connect your bank account first. 
                      <a href="/your-plan" className="ml-1 underline hover:no-underline">Go back to connect your bank account</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Monthly Expenditure Details */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700">Monthly Expenditure Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
                {(() => {
                  // Calculate dynamic values from Plaid data
                  // Calculate total income including wages + dividends
                  const wagesIncome = formData.netMonthlyEmploymentIncome ?
                    parseFloat(formData.netMonthlyEmploymentIncome) :
                    calculateAverageMonthlyIncome();
                  const dividendsIncome = formData.dividends ? parseFloat(formData.dividends) : 0;
                  const totalMonthlyIncome = wagesIncome + dividendsIncome;
                  // Calculate total minimum payments from debt accounts
                  const totalDebtMinimumPayments = debtAccounts
                    .reduce((sum, account) => sum + (account.minimumPayment || account.scheduledPaymentAmount || 0), 0);

                  // Calculate total expenses using the 3-period averages from form data
                  // Exclude debt payments since they're being replaced by program cost
                  const expenseFields = [
                    'housingPayment', 'homeOwnersInsurance', 'secondaryHousingPayment', 'healthLifeInsurance',
                    'medicalCare', 'prescriptionsMedicalExp', 'autoPayments', 'gasoline', 'repairsMaintenance',
                    'parking', 'commuting', 'groceries', 'eatingOut', 'entertainment', 'hobbies',
                    'miscellaneousPersonal', 'petCare', 'clothingHousehold', 'taxPreparation',
                    'tuition', 'childcare', 'alimonyChildSupport', 'gym', 'personalCare', 'charityDonations',
                    'daycareChildExpenses', 'nursingCare', 'misc'
                  ];

                  const baseExpenses = expenseFields.reduce((total, field) => {
                    const value = formData[field] ? parseFloat(formData[field]) : 0;
                    return total + (isNaN(value) ? 0 : value);
                  }, 0);

                  // Add back any debtOther if it exists but subtract actual minimum payments
                  const debtOther = formData.debtOther ? parseFloat(formData.debtOther) : 0;
                  const totalExpenses = baseExpenses + Math.max(0, debtOther - totalDebtMinimumPayments);

                  // Use the calculated program cost from state
                  const programCost = calculatedProgramCost;
                  const totalExpensesWithProgram = totalExpenses + programCost;
                  const availableFunds = totalMonthlyIncome - totalExpensesWithProgram;
                  const debtToIncomeWithProgram = totalMonthlyIncome > 0 ? 
                    (totalExpensesWithProgram / totalMonthlyIncome * 100) : 0;
                  const debtToIncomeWithoutProgram = totalMonthlyIncome > 0 ? 
                    (totalExpenses / totalMonthlyIncome * 100) : 0;
                  
                  return (
                    <>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${totalMonthlyIncome > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {formatCurrency(totalMonthlyIncome)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Total Monthly Income</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Wages: ${formatCurrency(wagesIncome)} {dividendsIncome > 0 ? `+ Dividends: ${formatCurrency(dividendsIncome)}` : ''}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(programCost)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Program Cost</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${totalExpenses > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {formatCurrency(totalExpenses)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Total Expenses</div>
                        <div className="text-xs text-gray-500 mt-1">Excludes debt minimum payments (${totalDebtMinimumPayments.toLocaleString()})</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(totalExpensesWithProgram)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Total Monthly Expense (With Program Cost)</div>
                        <div className="text-xs text-gray-500 mt-1">Total Expenses + Program Cost (${formatCurrency(programCost)})</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${availableFunds >= 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {formatCurrency(availableFunds)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Available Funds</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${
                          debtToIncomeWithProgram > 50 ? 'text-gray-900' :
                          debtToIncomeWithProgram > 30 ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {debtToIncomeWithProgram.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Monthly Debt to Income Ratio (With Program)</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${
                          debtToIncomeWithoutProgram > 50 ? 'text-gray-900' :
                          debtToIncomeWithoutProgram > 30 ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {debtToIncomeWithoutProgram.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Monthly Debt to Income Ratio (Without Program)</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>


            {/* Applicant and Co-Applicant Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Applicant Details */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Applicant Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.netMonthlyEmploymentIncome?.length > 0}
                        onClick={() => handleFieldClick('netMonthlyEmploymentIncome')}
                      >
                        Net Monthly Employment Income
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.netMonthlyEmploymentIncome ? formatCurrency(formData.netMonthlyEmploymentIncome) : ''}
                        onChange={(e) => handleInputChange('netMonthlyEmploymentIncome', e.target.value)}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.selfEmployment?.length > 0}
                        onClick={() => handleFieldClick('selfEmployment')}
                      >
                        Self Employment
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.selfEmployment ? formatCurrency(formData.selfEmployment) : ''}
                        onChange={(e) => handleInputChange('selfEmployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.socialSecurity?.length > 0}
                        onClick={() => handleFieldClick('socialSecurity')}
                      >
                        Social Security
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.socialSecurity}
                        onChange={(e) => handleInputChange('socialSecurity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.unemployment?.length > 0}
                        onClick={() => handleFieldClick('unemployment')}
                      >
                        Unemployment
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.unemployment}
                        onChange={(e) => handleInputChange('unemployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.alimony?.length > 0}
                        onClick={() => handleFieldClick('alimony')}
                      >
                        Alimony
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.alimony}
                        onChange={(e) => handleInputChange('alimony', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.childSupport?.length > 0}
                        onClick={() => handleFieldClick('childSupport')}
                      >
                        Child Support
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.childSupport}
                        onChange={(e) => handleInputChange('childSupport', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Govt. Assistance</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.otherGovtAssistance}
                        onChange={(e) => handleInputChange('otherGovtAssistance', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Annuities</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.annuities}
                        onChange={(e) => handleInputChange('annuities', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.dividends?.length > 0}
                        onClick={() => handleFieldClick('dividends')}
                      >
                        Dividends
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.dividends}
                        onChange={(e) => handleInputChange('dividends', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.retirement?.length > 0}
                        onClick={() => handleFieldClick('retirement')}
                      >
                        Retirement
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.retirement}
                        onChange={(e) => handleInputChange('retirement', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.otherIncome?.length > 0}
                        onClick={() => handleFieldClick('otherIncome')}
                      >
                        Other Income
                      </ClickableLabel>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.otherIncome}
                        onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Income Frequency</Label>
                      <Select
                        value={formData.incomeFrequency}
                        onValueChange={(value) => handleInputChange('incomeFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Comments</Label>
                    <Textarea
                      placeholder="Comments"
                      value={formData.applicantComments}
                      onChange={(e) => handleInputChange('applicantComments', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </Card>

              {/* Co-Applicant Details */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Co-Applicant Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Net Monthly Employment Income</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantNetMonthlyIncome}
                        onChange={(e) => handleInputChange('coApplicantNetMonthlyIncome', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Self Employment</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantSelfEmployment}
                        onChange={(e) => handleInputChange('coApplicantSelfEmployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Social Security</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantSocialSecurity}
                        onChange={(e) => handleInputChange('coApplicantSocialSecurity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Unemployment</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantUnemployment}
                        onChange={(e) => handleInputChange('coApplicantUnemployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Alimony</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantAlimony}
                        onChange={(e) => handleInputChange('coApplicantAlimony', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Child Support</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantChildSupport}
                        onChange={(e) => handleInputChange('coApplicantChildSupport', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Govt. Assistance</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantOtherGovtAssistance}
                        onChange={(e) => handleInputChange('coApplicantOtherGovtAssistance', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Annuities</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantAnnuities}
                        onChange={(e) => handleInputChange('coApplicantAnnuities', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Dividends</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantDividends}
                        onChange={(e) => handleInputChange('coApplicantDividends', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Retirement</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantRetirement}
                        onChange={(e) => handleInputChange('coApplicantRetirement', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Income</Label>
                      <Input readOnly
                        placeholder="$0.00"
                        readOnly
                        readOnly
                        value={formData.coApplicantOtherIncome}
                        onChange={(e) => handleInputChange('coApplicantOtherIncome', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Income Frequency</Label>
                      <Select
                        value={formData.coApplicantIncomeFrequency}
                        onValueChange={(value) => handleInputChange('coApplicantIncomeFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Comments</Label>
                    <Textarea
                      placeholder="Comments"
                      value={formData.coApplicantComments}
                      onChange={(e) => handleInputChange('coApplicantComments', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Monthly Expenses Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Monthly Expenses</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Housing */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Housing
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Housing</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="mortgage">Mortgage</SelectItem>
                            <SelectItem value="own">Own</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.housingPayment?.length > 0}
                          onClick={() => handleFieldClick('housingPayment')}
                        >
                          Housing Payment
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.housingPayment}
                          onChange={(e) => handleInputChange('housingPayment', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.homeOwnersInsurance?.length > 0}
                          onClick={() => handleFieldClick('homeOwnersInsurance')}
                        >
                          Home Owners Insurance
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.homeOwnersInsurance}
                          onChange={(e) => handleInputChange('homeOwnersInsurance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Secondary Housing Payment</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                    </div>
                  </div>

                  {/* Medical */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Medical
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.healthLifeInsurance?.length > 0}
                          onClick={() => handleFieldClick('healthLifeInsurance')}
                        >
                          Health/Life Insurance
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.healthLifeInsurance}
                          onChange={(e) => handleInputChange('healthLifeInsurance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.medicalCare?.length > 0}
                          onClick={() => handleFieldClick('medicalCare')}
                        >
                          Medical Care
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.medicalCare}
                          onChange={(e) => handleInputChange('medicalCare', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.prescriptionsMedicalExp?.length > 0}
                          onClick={() => handleFieldClick('prescriptionsMedicalExp')}
                        >
                          Prescriptions/Medical Exp
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.prescriptionsMedicalExp}
                          onChange={(e) => handleInputChange('prescriptionsMedicalExp', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Transportation
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.autoPayments?.length > 0}
                          onClick={() => handleFieldClick('autoPayments')}
                        >
                          Auto Payments
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.autoPayments}
                          onChange={(e) => handleInputChange('autoPayments', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.autoInsurance?.length > 0}
                          onClick={() => handleFieldClick('autoInsurance')}
                        >
                          Auto Insurance
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.autoInsurance}
                          onChange={(e) => handleInputChange('autoInsurance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.repairsMaintenance?.length > 0}
                          onClick={() => handleFieldClick('repairsMaintenance')}
                        >
                          Repairs/Maintenance
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.repairsMaintenance}
                          onChange={(e) => handleInputChange('repairsMaintenance', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.gasoline?.length > 0}
                          onClick={() => handleFieldClick('gasoline')}
                        >
                          Gasoline
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.gasoline}
                          onChange={(e) => handleInputChange('gasoline', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.parking?.length > 0}
                          onClick={() => handleFieldClick('parking')}
                        >
                          Parking
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.parking}
                          onChange={(e) => handleInputChange('parking', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.commuting?.length > 0}
                          onClick={() => handleFieldClick('commuting')}
                        >
                          Commuting
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.commuting}
                          onChange={(e) => handleInputChange('commuting', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Food
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.groceries?.length > 0}
                          onClick={() => handleFieldClick('groceries')}
                        >
                          Groceries
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.groceries}
                          onChange={(e) => handleInputChange('groceries', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.eatingOut?.length > 0}
                          onClick={() => handleFieldClick('eatingOut')}
                        >
                          Eating Out
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.eatingOut}
                          onChange={(e) => handleInputChange('eatingOut', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Utilities */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Utilities
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.gasElectricOil?.length > 0}
                          onClick={() => handleFieldClick('gasElectricOil')}
                        >
                          Average Gas/Electricity/Oil
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.gasElectricOil}
                          onChange={(e) => handleInputChange('gasElectricOil', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.phoneIncludeCell?.length > 0}
                          onClick={() => handleFieldClick('phoneIncludeCell')}
                        >
                          Average Phone Bill (Including Cell)
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.phoneIncludeCell}
                          onChange={(e) => handleInputChange('phoneIncludeCell', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.waterSewerGarbage?.length > 0}
                          onClick={() => handleFieldClick('waterSewerGarbage')}
                        >
                          Average Water/Sewer/Garbage
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.waterSewerGarbage}
                          onChange={(e) => handleInputChange('waterSewerGarbage', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.cableSatelliteInternet?.length > 0}
                          onClick={() => handleFieldClick('cableSatelliteInternet')}
                        >
                          Cable/Satellite/Internet Bill
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.cableSatelliteInternet}
                          onChange={(e) => handleInputChange('cableSatelliteInternet', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Debt Expenses (Not Enrolled in The Program) */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Debt Expenses (Not Enrolled in The Program)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.debtOther?.length > 0}
                          onClick={() => handleFieldClick('debtOther')}
                        >
                          Debt Expenses Other
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.debtOther}
                          onChange={(e) => handleInputChange('debtOther', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.govtStudentLoans?.length > 0}
                          onClick={() => handleFieldClick('govtStudentLoans')}
                        >
                          Govt. Student Loans (non-deferred status)
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.govtStudentLoans}
                          onChange={(e) => handleInputChange('govtStudentLoans', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.privateStudentLoans?.length > 0}
                          onClick={() => handleFieldClick('privateStudentLoans')}
                        >
                          Private Student Loans (non-deferred status)
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.privateStudentLoans}
                          onChange={(e) => handleInputChange('privateStudentLoans', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Medical Debt</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                    </div>
                  </div>

                  {/* Legal & Court Ordered Expenses */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Legal & Court Ordered Expenses
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Child Support</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Alimony</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Judgment Payments</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Back Taxes</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                    </div>
                  </div>

                  {/* Personal Care */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Personal Care
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.clothing?.length > 0}
                          onClick={() => handleFieldClick('clothing')}
                        >
                          Clothing
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.clothing}
                          onChange={(e) => handleInputChange('clothing', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.householdItems?.length > 0}
                          onClick={() => handleFieldClick('householdItems')}
                        >
                          Household Items
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.householdItems}
                          onChange={(e) => handleInputChange('householdItems', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.entertainment?.length > 0}
                          onClick={() => handleFieldClick('entertainment')}
                        >
                          Entertainment
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.entertainment}
                          onChange={(e) => handleInputChange('entertainment', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Pet Care</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Gifts</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Toiletries</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Hair Care</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Laundry</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <ClickableLabel 
                          hasData={mappedData && mappedData.transactionDetails.gym?.length > 0}
                          onClick={() => handleFieldClick('gym')}
                        >
                          Gym
                        </ClickableLabel>
                        <Input readOnly
                          placeholder="$0.00"
                        readOnly
                          readOnly 
                          value={formData.gym}
                          onChange={(e) => handleInputChange('gym', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Personal Care</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Charity Donations</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                    </div>
                  </div>

                  {/* Dependent Care */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Dependent Care
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Daycare/Child Expenses</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Nursing Care</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                    </div>
                  </div>

                  {/* Other Expenses */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Other Expenses
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Misc</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Funds Available</Label>
                        <Input placeholder="$0.00"
                        readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Unmapped Data Section */}
            {mappedData && mappedData.unmapped && mappedData.unmapped.length > 0 && (
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Unmapped Transactions ({mappedData.unmapped.length})
                  </h2>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  These transactions from your Plaid data could not be automatically mapped to deal sheet fields:
                </p>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {mappedData.unmapped.map((transaction, index) => (
                    <div key={transaction.transaction_id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {transaction.name || transaction.merchant_name || 'Unknown Transaction'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                          {transaction.personal_finance_category && (
                            <span className="ml-2">
                              {transaction.personal_finance_category.primary} → {transaction.personal_finance_category.detailed}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.amount > 0 ? 'Income' : 'Expense'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gray-600 hover:bg-gray-700">
                Save
              </Button>
            </div>
          </div>
            </TabsContent>

            <TabsContent value="calculations">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Transaction Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  30-day period breakdown of your Plaid transaction data across all deal sheet fields.
                </p>
                
                {/* Account Filter Section */}
                {availableAccounts.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Filter by Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableAccounts.map((account) => {
                        const isSelected = selectedAccounts.includes(account.account_id);
                        return (
                          <div key={account.account_id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`account-${account.account_id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked === true) {
                                  setSelectedAccounts(prev => {
                                    // Avoid duplicates
                                    if (!prev.includes(account.account_id)) {
                                      return [...prev, account.account_id];
                                    }
                                    return prev;
                                  });
                                } else if (checked === false) {
                                  setSelectedAccounts(prev => prev.filter(id => id !== account.account_id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`account-${account.account_id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <div className="font-medium">
                                {account.name || account.official_name || 'Unknown Account'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {account.subtype} • {account.type}
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAccounts(availableAccounts.map(acc => acc.account_id))}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAccounts([])}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Show message when no accounts are selected */}
                {availableAccounts.length > 0 && selectedAccounts.length === 0 && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>No accounts selected.</strong> Please select at least one account to view transaction data.
                    </p>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left font-semibold">Field</th>
                        <th className="border border-gray-300 p-3 text-center font-semibold">Current Period<br/><span className="text-xs font-normal text-gray-600">Last 30 days</span></th>
                        <th className="border border-gray-300 p-3 text-center font-semibold">Period 2<br/><span className="text-xs font-normal text-gray-600">31-60 days ago</span></th>
                        <th className="border border-gray-300 p-3 text-center font-semibold">Period 3<br/><span className="text-xs font-normal text-gray-600">61-90 days ago</span></th>
                        <th className="border border-gray-300 p-3 text-center font-semibold bg-gray-50">Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Income Section */}
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="border border-gray-300 p-2 font-semibold text-gray-800">
                          INCOME FIELDS <span className="text-xs font-normal ml-2">(95% Confidence - Plaid CRA Income Verification)</span>
                        </td>
                      </tr>
                      {(() => {
                        const periodData = getPeriodData();
                        if (!periodData) return null;

                        // Get all income fields that have transactions in any period
                        // If no accounts are selected, show all fields to demonstrate the filtering is working
                        const shouldShowAllFields = selectedAccounts.length === 0;
                        const incomeFields = new Set([
                          ...Object.keys(periodData.period1.income).filter(field => 
                            shouldShowAllFields || periodData.period1.income[field] > 0),
                          ...Object.keys(periodData.period2.income).filter(field => 
                            shouldShowAllFields || periodData.period2.income[field] > 0),
                          ...Object.keys(periodData.period3.income).filter(field => 
                            shouldShowAllFields || periodData.period3.income[field] > 0)
                        ]);

                        return Array.from(incomeFields).map(fieldKey => {
                          const fieldName = getFieldDisplayName(fieldKey);
                          const period1Value = periodData.period1.income[fieldKey] || 0;
                          const period2Value = periodData.period2.income[fieldKey] || 0;
                          const period3Value = periodData.period3.income[fieldKey] || 0;
                          const average = (period1Value + period2Value + period3Value) / 3;

                          const period1Transactions = periodData.period1.transactionDetails[fieldKey] || [];
                          const period2Transactions = periodData.period2.transactionDetails[fieldKey] || [];
                          const period3Transactions = periodData.period3.transactionDetails[fieldKey] || [];

                          // Create rows for category header and all transactions from all periods
                          const rows = [];
                          
                          // Category header row
                          rows.push(
                            <tr key={fieldKey}>
                              <td className="border border-gray-300 p-3 font-semibold">{fieldName}</td>
                              <td className="border border-gray-300 p-3 text-center font-semibold">{formatCurrency(period1Value)}</td>
                              <td className="border border-gray-300 p-3 text-center font-semibold">{formatCurrency(period2Value)}</td>
                              <td className="border border-gray-300 p-3 text-center font-semibold">{formatCurrency(period3Value)}</td>
                              <td className="border border-gray-300 p-3 text-center bg-gray-50 font-semibold">{formatCurrency(average)}</td>
                            </tr>
                          );

                          // Find the maximum number of transactions in any period for this field
                          const maxTransactions = Math.max(
                            period1Transactions.length,
                            period2Transactions.length,
                            period3Transactions.length
                          );

                          // Add transaction detail rows
                          for (let i = 0; i < maxTransactions; i++) {
                            const tx1 = period1Transactions[i];
                            const tx2 = period2Transactions[i];
                            const tx3 = period3Transactions[i];

                            rows.push(
                              <tr key={`${fieldKey}-tx-${i}`} className="bg-gray-50 text-sm">
                                <td className="border border-gray-300 p-2 pl-6 text-gray-600">
                                  {(tx1 || tx2 || tx3) ? `→ ${(tx1 || tx2 || tx3).name || (tx1 || tx2 || tx3).merchant_name || 'Unknown Transaction'}` : ''}
                                  {(tx1 || tx2 || tx3) && (tx1 || tx2 || tx3).personal_finance_category?.detailed && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      → {(tx1 || tx2 || tx3).personal_finance_category.detailed}
                                    </div>
                                  )}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-600">
                                  {tx1 ? (
                                    <div>
                                      <div className="font-medium">{formatCurrency(Math.abs(tx1.mappedAmount))}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(tx1.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-600">
                                  {tx2 ? (
                                    <div>
                                      <div className="font-medium">{formatCurrency(Math.abs(tx2.mappedAmount))}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(tx2.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-600">
                                  {tx3 ? (
                                    <div>
                                      <div className="font-medium">{formatCurrency(Math.abs(tx3.mappedAmount))}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(tx3.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-400">--</td>
                              </tr>
                            );
                          }

                          return <React.Fragment key={fieldKey}>{rows}</React.Fragment>;
                        });
                      })()}

                      {/* Total Income Summary Row */}
                      {(() => {
                        const periodData = getPeriodData();
                        if (!periodData) return null;

                        // Calculate total income for each period
                        const period1Total = Object.values(periodData.period1.income).reduce((sum, val) => sum + (val || 0), 0);
                        const period2Total = Object.values(periodData.period2.income).reduce((sum, val) => sum + (val || 0), 0);
                        const period3Total = Object.values(periodData.period3.income).reduce((sum, val) => sum + (val || 0), 0);
                        const averageTotal = (period1Total + period2Total + period3Total) / 3;

                        return (
                          <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                            <td className="border border-gray-300 p-3 font-bold text-gray-800">TOTAL INCOME</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period1Total)}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period2Total)}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period3Total)}</td>
                            <td className="border border-gray-300 p-3 text-center bg-blue-100 font-bold text-gray-800">{formatCurrency(averageTotal)}</td>
                          </tr>
                        );
                      })()}

                      {/* Expense Section */}
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="border border-gray-300 p-2 font-semibold text-gray-800">
                          EXPENSE FIELDS
                        </td>
                      </tr>
                      {(() => {
                        const periodData = getPeriodData();
                        if (!periodData) return null;

                        // Get all expense fields that have transactions in any period
                        // If no accounts are selected, show all fields to demonstrate the filtering is working
                        const shouldShowAllFields = selectedAccounts.length === 0;
                        const expenseFields = new Set([
                          ...Object.keys(periodData.period1.expenses).filter(field => 
                            shouldShowAllFields || periodData.period1.expenses[field] > 0),
                          ...Object.keys(periodData.period2.expenses).filter(field => 
                            shouldShowAllFields || periodData.period2.expenses[field] > 0),
                          ...Object.keys(periodData.period3.expenses).filter(field => 
                            shouldShowAllFields || periodData.period3.expenses[field] > 0)
                        ]);

                        return Array.from(expenseFields).map(fieldKey => {
                          const fieldName = getFieldDisplayName(fieldKey);
                          const period1Value = periodData.period1.expenses[fieldKey] || 0;
                          const period2Value = periodData.period2.expenses[fieldKey] || 0;
                          const period3Value = periodData.period3.expenses[fieldKey] || 0;
                          const average = (period1Value + period2Value + period3Value) / 3;

                          const period1Transactions = periodData.period1.transactionDetails[fieldKey] || [];
                          const period2Transactions = periodData.period2.transactionDetails[fieldKey] || [];
                          const period3Transactions = periodData.period3.transactionDetails[fieldKey] || [];

                          // Create rows for category header and all transactions from all periods
                          const rows = [];
                          
                          // Category header row
                          rows.push(
                            <tr key={fieldKey}>
                              <td className="border border-gray-300 p-3 font-semibold">{fieldName}</td>
                              <td className="border border-gray-300 p-3 text-center font-semibold">{formatCurrency(period1Value)}</td>
                              <td className="border border-gray-300 p-3 text-center font-semibold">{formatCurrency(period2Value)}</td>
                              <td className="border border-gray-300 p-3 text-center font-semibold">{formatCurrency(period3Value)}</td>
                              <td className="border border-gray-300 p-3 text-center bg-gray-50 font-semibold">{formatCurrency(average)}</td>
                            </tr>
                          );

                          // Find the maximum number of transactions in any period for this field
                          const maxTransactions = Math.max(
                            period1Transactions.length,
                            period2Transactions.length,
                            period3Transactions.length
                          );

                          // Add transaction detail rows
                          for (let i = 0; i < maxTransactions; i++) {
                            const tx1 = period1Transactions[i];
                            const tx2 = period2Transactions[i];
                            const tx3 = period3Transactions[i];

                            rows.push(
                              <tr key={`${fieldKey}-tx-${i}`} className="bg-gray-50 text-sm">
                                <td className="border border-gray-300 p-2 pl-6 text-gray-600">
                                  {(tx1 || tx2 || tx3) ? `→ ${(tx1 || tx2 || tx3).name || (tx1 || tx2 || tx3).merchant_name || 'Unknown Transaction'}` : ''}
                                  {(tx1 || tx2 || tx3) && (tx1 || tx2 || tx3).personal_finance_category?.detailed && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      → {(tx1 || tx2 || tx3).personal_finance_category.detailed}
                                    </div>
                                  )}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-600">
                                  {tx1 ? (
                                    <div>
                                      <div className="font-medium">{formatCurrency(tx1.mappedAmount)}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(tx1.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-600">
                                  {tx2 ? (
                                    <div>
                                      <div className="font-medium">{formatCurrency(tx2.mappedAmount)}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(tx2.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-600">
                                  {tx3 ? (
                                    <div>
                                      <div className="font-medium">{formatCurrency(tx3.mappedAmount)}</div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(tx3.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-gray-400">--</td>
                              </tr>
                            );
                          }

                          return <React.Fragment key={fieldKey}>{rows}</React.Fragment>;
                        });
                      })()}

                      {/* Total Expenses Summary Row */}
                      {(() => {
                        const periodData = getPeriodData();
                        if (!periodData) return null;

                        // Calculate total expenses for each period
                        const period1Total = Object.values(periodData.period1.expenses).reduce((sum, val) => sum + (val || 0), 0);
                        const period2Total = Object.values(periodData.period2.expenses).reduce((sum, val) => sum + (val || 0), 0);
                        const period3Total = Object.values(periodData.period3.expenses).reduce((sum, val) => sum + (val || 0), 0);
                        const averageTotal = (period1Total + period2Total + period3Total) / 3;

                        return (
                          <tr className="bg-red-50 font-bold border-t-2 border-red-200">
                            <td className="border border-gray-300 p-3 font-bold text-gray-800">TOTAL EXPENSES</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period1Total)}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period2Total)}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period3Total)}</td>
                            <td className="border border-gray-300 p-3 text-center bg-red-100 font-bold text-gray-800">{formatCurrency(averageTotal)}</td>
                          </tr>
                        );
                      })()}

                      {/* Net Income Summary Row (Income - Expenses) */}
                      {(() => {
                        const periodData = getPeriodData();
                        if (!periodData) return null;

                        // Calculate total income for each period
                        const period1Income = Object.values(periodData.period1.income).reduce((sum, val) => sum + (val || 0), 0);
                        const period2Income = Object.values(periodData.period2.income).reduce((sum, val) => sum + (val || 0), 0);
                        const period3Income = Object.values(periodData.period3.income).reduce((sum, val) => sum + (val || 0), 0);

                        // Calculate total expenses for each period
                        const period1Expenses = Object.values(periodData.period1.expenses).reduce((sum, val) => sum + (val || 0), 0);
                        const period2Expenses = Object.values(periodData.period2.expenses).reduce((sum, val) => sum + (val || 0), 0);
                        const period3Expenses = Object.values(periodData.period3.expenses).reduce((sum, val) => sum + (val || 0), 0);

                        // Calculate net income (income - expenses) for each period
                        const period1Net = period1Income - period1Expenses;
                        const period2Net = period2Income - period2Expenses;
                        const period3Net = period3Income - period3Expenses;
                        const averageNet = (period1Net + period2Net + period3Net) / 3;

                        return (
                          <tr className="bg-green-50 font-bold border-t-2 border-green-200">
                            <td className="border border-gray-300 p-3 font-bold text-gray-800">NET INCOME (Income - Expenses)</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period1Net)}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period2Net)}</td>
                            <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">{formatCurrency(period3Net)}</td>
                            <td className="border border-gray-300 p-3 text-center bg-green-100 font-bold text-gray-800">{formatCurrency(averageNet)}</td>
                          </tr>
                        );
                      })()}

                      {/* Uncategorized Items Section */}
                      {(() => {
                        const filteredData = getFilteredMappedData();
                        const dataToUse = filteredData || mappedData;
                        return dataToUse && dataToUse.unmapped && dataToUse.unmapped.length > 0 && (
                          <>
                            <tr className="bg-gray-50">
                              <td colSpan={5} className="border border-gray-300 p-2 font-semibold text-gray-800">
                                UNCATEGORIZED TRANSACTIONS ({dataToUse.unmapped.length})
                              </td>
                            </tr>
                            {dataToUse.unmapped.map((transaction, idx) => (
                            <tr key={`unmapped-${idx}`} className="bg-gray-25 text-sm">
                              <td className="border border-gray-300 p-2 pl-6 text-gray-600">
                                → {transaction.name || transaction.merchant_name || 'Unknown Transaction'}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {new Date(transaction.date).toLocaleDateString()}
                                  {transaction.personal_finance_category && (
                                    <span className="ml-2">
                                      {transaction.personal_finance_category.primary} → {transaction.personal_finance_category.detailed}
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="border border-gray-300 p-2 text-center text-gray-600">
                                {formatCurrency(Math.abs(transaction.amount))}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {transaction.amount > 0 ? 'Expense' : 'Income'}
                                </span>
                              </td>
                              <td className="border border-gray-300 p-2 text-center text-gray-400">--</td>
                              <td className="border border-gray-300 p-2 text-center text-gray-400">--</td>
                              <td className="border border-gray-300 p-2 text-center text-gray-400">--</td>
                            </tr>
                            ))}
                          </>
                        );
                      })()}
                      
                    </tbody>
                  </table>
                </div>
                
                {(() => {
                  const filteredData = getFilteredMappedData();
                  const dataToUse = filteredData || mappedData;
                  return !mappedData && (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bank Data Available</h3>
                        <p className="text-sm text-gray-600 mb-4 max-w-md">
                          Connect your bank account to see detailed transaction analysis across multiple time periods.
                        </p>
                        <button
                          onClick={() => window.location.href = '/your-plan'}
                          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Connect Bank Account
                        </button>
                      </div>
                    </div>
                    </div>
                  );
                })()}
                
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">About This Analysis</h4>
                  <p className="text-sm text-gray-600">
                    This table shows your actual Plaid transaction data analyzed across three 30-day periods. 
                    The data helps identify spending patterns and provides more accurate monthly averages for your deal sheet calculations.
                    {!hasPlaidData && " Connect your bank account to see your actual transaction data here."}
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fieldName={selectedField?.name || ''}
        transactions={selectedField?.transactions || []}
        totalAmount={selectedField?.totalAmount || 0}
      />
    </div>
  );
}