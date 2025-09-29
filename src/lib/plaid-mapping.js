/**
 * Plaid to Deal Sheet Mapping Utilities
 */

// Income category mappings - based on actual Plaid category structure
export const INCOME_MAPPINGS = {
  // Primary INCOME categories
  'INCOME_WAGES': 'netMonthlyEmploymentIncome',
  'INCOME_DIVIDENDS': 'dividends',
  'INCOME_RETIREMENT': 'retirement',
  'INCOME_INTEREST_EARNED': 'otherIncome',
  'INCOME_TAX_REFUND': 'otherIncome',
  'INCOME_UNEMPLOYMENT': 'unemployment',
  'INCOME_OTHER_INCOME': 'otherIncome',
  'INCOME_RENTAL': 'otherIncome',
  'INCOME_SOCIAL_SECURITY': 'socialSecurity',
  'INCOME_CHILD_SUPPORT': 'childSupport',
  'INCOME_ALIMONY': 'alimony'
};

// Expense category mappings - updated to match actual Plaid detailed categories
export const EXPENSE_MAPPINGS = {
  // Housing
  'RENT_AND_UTILITIES_RENT': 'housingPayment',
  'LOAN_PAYMENTS_MORTGAGE_PAYMENT': 'housingPayment',
  'LOAN_PAYMENTS_CAR_PAYMENT': 'autoPayments',
  'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT': 'debtOther',
  'GENERAL_SERVICES_INSURANCE': 'homeOwnersInsurance', // Will need context-based detection
  
  // Travel (for the United Airlines example we saw)
  'TRAVEL_FLIGHTS': 'entertainment', // Could map to entertainment or travel category
  
  // Medical
  'MEDICAL_PRIMARY_CARE': 'medicalCare',
  'MEDICAL_PHARMACIES_AND_SUPPLEMENTS': 'prescriptionsMedicalExp',
  'MEDICAL_DENTAL_CARE': 'medicalCare',
  'MEDICAL_EYE_CARE': 'medicalCare',
  'MEDICAL_VETERINARY_SERVICES': 'petCare', // Actually pet care, not medical
  
  // Transportation  
  'TRANSPORTATION_GAS': 'gasoline',
  'TRANSPORTATION_PARKING': 'parking',
  'TRANSPORTATION_PUBLIC_TRANSIT': 'commuting',
  'TRANSPORTATION_TAXIS_AND_RIDE_SHARES': 'commuting',
  'TRANSPORTATION_TOLLS': 'commuting',
  'GENERAL_SERVICES_AUTOMOTIVE': 'repairsMaintenance',
  
  // Food
  'FOOD_AND_DRINK_GROCERIES': 'groceries',
  'FOOD_AND_DRINK_RESTAURANT': 'eatingOut',
  'FOOD_AND_DRINK_FAST_FOOD': 'eatingOut',
  'FOOD_AND_DRINK_COFFEE': 'eatingOut',
  'FOOD_AND_DRINK_COFFEE_SHOPS': 'eatingOut',
  'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR_STORES': 'eatingOut',
  
  // Utilities
  'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY': 'gasElectricOil',
  'RENT_AND_UTILITIES_INTERNET_AND_CABLE': 'cableSatelliteInternet',
  'RENT_AND_UTILITIES_TELEPHONE': 'phoneIncludeCell',
  'RENT_AND_UTILITIES_WATER': 'waterSewerGarbage',
  'RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT': 'waterSewerGarbage',
  'RENT_AND_UTILITIES_OTHER_UTILITIES': 'gasElectricOil',
  
  // Personal Care
  'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES': 'clothing',
  'GENERAL_MERCHANDISE_DEPARTMENT_STORES': 'householdItems',
  'GENERAL_MERCHANDISE_ELECTRONICS': 'householdItems',
  'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES': 'householdItems',
  'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE': 'householdItems',
  'GENERAL_MERCHANDISE_SPORTING_GOODS': 'entertainment',
  'ENTERTAINMENT_MUSIC_AND_AUDIO': 'entertainment',
  'ENTERTAINMENT_TV_AND_MOVIES': 'entertainment',
  'ENTERTAINMENT_SPORTING_EVENTS': 'entertainment',
  'ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS': 'entertainment',
  'GENERAL_MERCHANDISE_PET_SUPPLIES': 'petCare',
  'GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES': 'gifts',
  'PERSONAL_CARE_HAIR_AND_BEAUTY': 'hairCare',
  'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING': 'laundry',
  'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS': 'gym',
  'PERSONAL_CARE_OTHER_PERSONAL_CARE': 'personalCare',
  
  // Alternative mappings without primary category prefix (in case Plaid sends detailed category only)
  'HAIR_AND_BEAUTY': 'hairCare',
  'LAUNDRY_AND_DRY_CLEANING': 'laundry',
  'GYMS_AND_FITNESS_CENTERS': 'gym',
  'OTHER_PERSONAL_CARE': 'personalCare',
  
  // Additional food category alternatives
  'GROCERIES': 'groceries',
  'RESTAURANT': 'eatingOut',
  'FAST_FOOD': 'eatingOut',
  'COFFEE': 'eatingOut',
  'COFFEE_SHOPS': 'eatingOut',
  'BEER_WINE_AND_LIQUOR_STORES': 'eatingOut',
  
  // Additional transportation alternatives
  'GAS': 'gasoline',
  'PARKING': 'parking',
  'PUBLIC_TRANSIT': 'commuting',
  'TAXIS_AND_RIDE_SHARES': 'commuting',
  'TOLLS': 'commuting',
  'AUTOMOTIVE': 'repairsMaintenance',
  
  // Additional utility alternatives
  'GAS_AND_ELECTRICITY': 'gasElectricOil',
  'INTERNET_AND_CABLE': 'cableSatelliteInternet',
  'TELEPHONE': 'phoneIncludeCell',
  'WATER': 'waterSewerGarbage',
  'SEWAGE_AND_WASTE_MANAGEMENT': 'waterSewerGarbage',
  'OTHER_UTILITIES': 'gasElectricOil',
  
  // Debt (not in program)
  'LOAN_PAYMENTS_OTHER_PAYMENT': 'debtOther',
  'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT': 'debtOther',
  'LOAN_PAYMENTS_STUDENT_LOAN': 'govtStudentLoans',
  'LOAN_PAYMENTS_PERSONAL_LOAN': 'privateStudentLoans',
  
  // Alternative debt mappings without primary category prefix
  'OTHER_PAYMENT': 'debtOther',
  'CREDIT_CARD_PAYMENT': 'debtOther',
  'STUDENT_LOAN': 'govtStudentLoans',
  'PERSONAL_LOAN': 'privateStudentLoans',
  
  // Legal & Court-Ordered
  'TRANSFER_OUT_CHILD_SUPPORT': 'childSupportExpense',
  'TRANSFER_OUT_ALIMONY': 'alimonyExpense',
  'GOVERNMENT_AND_NON_PROFIT_COURT_FEES': 'judgmentPayments',
  'GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT': 'backTaxes',
  
  // Dependent Care
  'GENERAL_SERVICES_CHILD_CARE': 'daycareChildExpenses',
  'MEDICAL_NURSING_CARE': 'nursingCare',
  
  // Financial Services
  'GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING': 'misc',
  'GENERAL_SERVICES_FINANCIAL_ADVISORS': 'misc',
  'GENERAL_SERVICES_LEGAL': 'misc',
  
  // Additional mappings for completeness
  'CHARITY_AND_GIFTS_CHARITY': 'charityDonations',
  'GENERAL_MERCHANDISE_TOILETRIES': 'toiletries',
  'TRANSFER_OUT_TRANSFER': 'misc'
};

/**
 * Maps Plaid transactions to deal sheet format
 * @param {Array} transactions - Array of Plaid transactions
 * @param {Array} accounts - Array of Plaid accounts
 * @returns {Object} Mapped data for deal sheet
 */
export function mapPlaidToDealsSheet(transactions, accounts) {
  console.log('[Mapping] Starting with transactions:', transactions?.length, 'accounts:', accounts?.length);

  // Load custom mappings from localStorage if available
  let customMappings = {};
  try {
    const storedMapping = localStorage.getItem('plaid-dealsheet-mapping');
    if (storedMapping) {
      const mappingConfig = JSON.parse(storedMapping);
      customMappings = mappingConfig.mappings || {};
      console.log('[Mapping] Loaded custom mappings:', Object.keys(customMappings).length, 'custom rules');
    }
  } catch (err) {
    console.warn('[Mapping] Could not load custom mappings:', err);
  }
  
  const mappedData = {
    income: {},
    expenses: {},
    unmapped: [],
    transactionDetails: {}
  };

  // Initialize all fields to 0
  Object.entries(INCOME_MAPPINGS).forEach(([key, field]) => {
    if (typeof field === 'string') {
      mappedData.income[field] = 0;
      mappedData.transactionDetails[field] = [];
    } else if (typeof field === 'object') {
      // Handle INCOME_OTHER_INCOME subcategories
      Object.values(field).forEach(subField => {
        if (typeof subField === 'string') {
          mappedData.income[subField] = 0;
          mappedData.transactionDetails[subField] = [];
        }
      });
    }
  });
  
  Object.values(EXPENSE_MAPPINGS).forEach(field => {
    mappedData.expenses[field] = 0;
    mappedData.transactionDetails[field] = [];
  });

  // Ensure transactions is an array
  if (!Array.isArray(transactions)) {
    console.warn('Transactions is not an array:', transactions);
    return mappedData;
  }

  // Process transactions
  let incomeCount = 0;
  let expenseCount = 0;
  const categoryStats = {};
  
  transactions.forEach(transaction => {
    const category = transaction.personal_finance_category;
    if (!category) {
      console.log('[Mapping] No category for transaction:', transaction.name);
      mappedData.unmapped.push(transaction);
      return;
    }

    const primaryCategory = category.primary;
    const detailedCategory = category.detailed;
    const amount = Math.abs(transaction.amount);
    
    // Track category statistics
    const categoryKey = detailedCategory.toUpperCase().replace(/[^A-Z_]/g, '_');
    if (!categoryStats[categoryKey]) {
      categoryStats[categoryKey] = {
        count: 0,
        totalAmount: 0,
        primary: primaryCategory,
        detailed: detailedCategory,
        mapped: false
      };
    }
    categoryStats[categoryKey].count++;
    categoryStats[categoryKey].totalAmount += amount;
    
    // Log first few transactions for debugging
    if (incomeCount < 3 && primaryCategory === 'INCOME') {
      console.log('[Mapping] Income transaction:', {
        name: transaction.name,
        primary: primaryCategory,
        detailed: detailedCategory,
        amount: amount,
        rawAmount: transaction.amount
      });
      incomeCount++;
    }
    if (expenseCount < 5 && transaction.amount > 0) {
      console.log('[Mapping] Expense transaction:', {
        name: transaction.name,
        primary: primaryCategory,
        detailed: detailedCategory,
        amount: amount,
        rawAmount: transaction.amount
      });
      expenseCount++;
    }
    
    // Special debugging for Uber transactions
    if (transaction.name && transaction.name.toLowerCase().includes('uber')) {
      console.log('[Mapping] UBER DEBUG:', {
        name: transaction.name,
        primary: primaryCategory,
        detailed: detailedCategory,
        amount: amount,
        rawAmount: transaction.amount,
        isIncome: primaryCategory === 'INCOME',
        isNegative: transaction.amount < 0
      });
    }
    
    // Handle income
    if (primaryCategory === 'INCOME') {
      // The detailedCategory already includes the primary, so just use it directly
      const categoryKey = detailedCategory.toUpperCase().replace(/[^A-Z_]/g, '_');

      // Check for custom mapping first
      const customMapping = customMappings[categoryKey] || customMappings[`INCOME_${categoryKey}`];
      if (customMapping === 'do_not_map') {
        console.log(`[Mapping] Skipping income category ${categoryKey} - marked as 'do not map'`);
        return; // Skip this transaction entirely
      }

      const mappedField = customMapping || INCOME_MAPPINGS[categoryKey];
      
      if (mappedField) {
        if (!mappedData.income[mappedField]) {
          mappedData.income[mappedField] = 0;
          mappedData.transactionDetails[mappedField] = [];
        }
        mappedData.income[mappedField] += Math.abs(transaction.amount);
        mappedData.transactionDetails[mappedField].push({
          ...transaction,
          mappedAmount: -transaction.amount // Income should show as negative in Plaid (money coming in)
        });
        categoryStats[categoryKey].mapped = true;
        console.log(`[Mapping] Mapped income: ${categoryKey} -> ${mappedField} ($${amount}) [rawAmount: ${transaction.amount}]`);
      } else {
        console.log(`[Mapping] Unmapped income category: ${categoryKey}`);
        mappedData.unmapped.push(transaction);
      }
    }
    // Handle expenses (positive amounts in Plaid represent money going out)
    else if (transaction.amount > 0 ||
             primaryCategory === 'TRANSPORTATION' ||
             primaryCategory === 'FOOD_AND_DRINK' ||
             primaryCategory === 'GENERAL_MERCHANDISE' ||
             primaryCategory === 'GENERAL_SERVICES' ||
             primaryCategory === 'ENTERTAINMENT' ||
             primaryCategory === 'PERSONAL_CARE' ||
             primaryCategory === 'LOAN_PAYMENTS' ||
             primaryCategory === 'TRAVEL') {
      // The detailedCategory already includes the primary, so just use it directly
      const categoryKey = detailedCategory.toUpperCase().replace(/[^A-Z_]/g, '_');

      // Check for custom mapping first
      const customMapping = customMappings[categoryKey] || customMappings[detailedCategory];
      if (customMapping === 'do_not_map') {
        console.log(`[Mapping] Skipping expense category ${categoryKey} - marked as 'do not map'`);
        return; // Skip this transaction entirely
      }

      let mappedField = customMapping || EXPENSE_MAPPINGS[categoryKey];
      
      // Special handling for GENERAL_SERVICES_INSURANCE - need to detect type
      if (categoryKey === 'GENERAL_SERVICES_INSURANCE') {
        const transactionName = (transaction.name || '').toLowerCase();
        const merchantName = (transaction.merchant_name || '').toLowerCase();
        
        if (transactionName.includes('home') || transactionName.includes('renters') || 
            merchantName.includes('home') || merchantName.includes('renters')) {
          mappedField = 'homeOwnersInsurance';
        } else if (transactionName.includes('auto') || transactionName.includes('car') || 
                   merchantName.includes('auto') || merchantName.includes('geico') || 
                   merchantName.includes('progressive') || merchantName.includes('allstate')) {
          mappedField = 'autoInsurance';
        } else if (transactionName.includes('health') || transactionName.includes('life') ||
                   transactionName.includes('medical') || merchantName.includes('health')) {
          mappedField = 'healthLifeInsurance';
        } else {
          // Default to health/life insurance if we can't determine
          mappedField = 'healthLifeInsurance';
        }
      }
      
      // Special handling for LOAN_PAYMENTS - distinguish between mortgage and auto
      if (primaryCategory === 'LOAN_PAYMENTS') {
        const transactionName = (transaction.name || '').toLowerCase();
        const merchantName = (transaction.merchant_name || '').toLowerCase();
        
        if (detailedCategory === 'CAR_PAYMENT' || 
            transactionName.includes('auto') || transactionName.includes('car') ||
            merchantName.includes('auto') || merchantName.includes('motor')) {
          mappedField = 'autoPayments';
        } else if (detailedCategory === 'MORTGAGE_PAYMENT' || 
                   transactionName.includes('mortgage') || transactionName.includes('home loan')) {
          mappedField = 'housingPayment';
        }
      }
      
      if (mappedField) {
        if (!mappedData.expenses[mappedField]) {
          mappedData.expenses[mappedField] = 0;
          mappedData.transactionDetails[mappedField] = [];
        }
        mappedData.expenses[mappedField] += transaction.amount;
        mappedData.transactionDetails[mappedField].push({
          ...transaction,
          mappedAmount: transaction.amount // Expenses should show as positive (money going out)
        });
        categoryStats[categoryKey].mapped = true;
        console.log(`[Mapping] Mapped expense: ${categoryKey} -> ${mappedField} ($${amount}) [rawAmount: ${transaction.amount}]`);
      } else {
        console.log(`[Mapping] Unmapped expense category: ${categoryKey}`);
        mappedData.unmapped.push(transaction);
      }
    } else {
      // Negative non-income transactions (potential income/refunds not categorized as INCOME)
      console.log('[Mapping] Unmapped negative transaction (possible income):', {
        name: transaction.name,
        primary: primaryCategory,
        detailed: detailedCategory,
        amount: transaction.amount
      });
      mappedData.unmapped.push(transaction);
    }
  });

  // Process unmapped expense transactions - add them to "misc" category
  console.log(`[Mapping] Processing ${mappedData.unmapped.length} unmapped transactions for misc category`);

  // Initialize misc field if not already initialized
  if (!mappedData.expenses.misc) {
    mappedData.expenses.misc = 0;
    mappedData.transactionDetails.misc = [];
  }

  // Filter unmapped transactions to only include expense transactions
  const unmappedExpenses = mappedData.unmapped.filter(transaction => {
    // Include positive amounts (expenses) or transactions from expense categories
    return transaction.amount > 0 ||
           (transaction.personal_finance_category &&
            transaction.personal_finance_category.primary !== 'INCOME');
  });

  // Add unmapped expenses to misc category
  unmappedExpenses.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    mappedData.expenses.misc += transaction.amount > 0 ? transaction.amount : amount;
    mappedData.transactionDetails.misc.push({
      ...transaction,
      mappedAmount: transaction.amount > 0 ? transaction.amount : amount,
      note: 'Auto-mapped to Miscellaneous (unmapped category)'
    });
    console.log(`[Mapping] Added unmapped expense to misc: ${transaction.name} ($${amount})`);
  });

  // Update unmapped to only include true income transactions that couldn't be mapped
  mappedData.unmapped = mappedData.unmapped.filter(transaction => {
    return transaction.personal_finance_category &&
           transaction.personal_finance_category.primary === 'INCOME' &&
           transaction.amount < 0; // Only keep unmapped income (negative amounts)
  });

  console.log(`[Mapping] Moved ${unmappedExpenses.length} expense transactions to misc category`);
  console.log(`[Mapping] Remaining unmapped transactions: ${mappedData.unmapped.length} (income only)`);

  // Convert to monthly averages (assuming data is from last 30-90 days)
  const daysCovered = 30; // This should be calculated from actual date range
  const monthlyMultiplier = 30 / daysCovered;

  Object.keys(mappedData.income).forEach(field => {
    mappedData.income[field] = Math.round(mappedData.income[field] * monthlyMultiplier * 100) / 100;
  });

  Object.keys(mappedData.expenses).forEach(field => {
    mappedData.expenses[field] = Math.round(mappedData.expenses[field] * monthlyMultiplier * 100) / 100;
  });

  // Log comprehensive category analysis
  console.log('[Mapping] Category Analysis:');
  const unmappedCategories = Object.entries(categoryStats)
    .filter(([key, stats]) => !stats.mapped)
    .sort((a, b) => b[1].totalAmount - a[1].totalAmount);
    
  console.table(unmappedCategories.map(([key, stats]) => ({
    Category: key,
    Primary: stats.primary,
    Count: stats.count,
    'Total Amount': `$${stats.totalAmount.toFixed(2)}`
  })));

  // Log summary
  console.log('[Mapping] Summary:', {
    totalIncome: Object.values(mappedData.income).reduce((a, b) => a + b, 0),
    totalExpenses: Object.values(mappedData.expenses).reduce((a, b) => a + b, 0),
    unmappedCount: mappedData.unmapped.length,
    unmappedCategories: unmappedCategories.length,
    incomeFields: Object.entries(mappedData.income).filter(([k, v]) => v > 0).map(([k, v]) => `${k}: $${v}`),
    expenseFields: Object.entries(mappedData.expenses).filter(([k, v]) => v > 0).map(([k, v]) => `${k}: $${v}`)
  });

  return mappedData;
}

/**
 * Gets human-readable field name for deal sheet field
 */
export function getFieldDisplayName(fieldName) {
  const fieldNames = {
    // Income fields
    netMonthlyEmploymentIncome: 'Net Monthly Employment Income',
    selfEmployment: 'Self Employment',
    socialSecurity: 'Social Security',
    unemployment: 'Unemployment',
    alimony: 'Alimony',
    childSupport: 'Child Support',
    otherGovtAssistance: 'Other Govt. Assistance',
    annuities: 'Annuities',
    dividends: 'Dividends',
    retirement: 'Retirement',
    otherIncome: 'Other Income',
    
    // Expense fields
    housingPayment: 'Housing Payment',
    homeOwnersInsurance: 'Home Owners Insurance',
    healthLifeInsurance: 'Health/Life Insurance',
    medicalCare: 'Medical Care',
    prescriptionsMedicalExp: 'Prescriptions/Medical Exp',
    autoPayments: 'Auto Payments',
    autoInsurance: 'Auto Insurance',
    gasoline: 'Gasoline',
    parking: 'Parking',
    commuting: 'Commuting',
    repairsMaintenance: 'Repairs/Maintenance',
    groceries: 'Groceries',
    eatingOut: 'Eating Out',
    gasElectricOil: 'Gas/Electric/Oil',
    cableSatelliteInternet: 'Cable/Satellite/Internet',
    phoneIncludeCell: 'Phone (incl. cell)',
    waterSewerGarbage: 'Water/Sewer/Garbage',
    clothing: 'Clothing',
    householdItems: 'Household Items',
    entertainment: 'Entertainment',
    petCare: 'Pet Care',
    gifts: 'Gifts',
    hairCare: 'Hair Care',
    laundry: 'Laundry',
    gym: 'Gym',
    personalCare: 'Personal Care',
    debtOther: 'Debt Other',
    govtStudentLoans: 'Gov\'t Student Loans (non-deferred)',
    privateStudentLoans: 'Private Student Loans (non-deferred)',
    childSupportExpense: 'Child Support',
    alimonyExpense: 'Alimony',
    judgmentPayments: 'Judgment Payments',
    backTaxes: 'Back Taxes',
    daycareChildExpenses: 'Daycare/Child Expenses',
    nursingCare: 'Nursing Care',
    
    // Additional expense fields
    secondaryHousingPayment: 'Secondary Housing Payment',
    healthLifeInsurance: 'Health/Life Insurance',
    debtOther: 'Debt Expenses Other',
    medicalDebt: 'Medical Debt',
    charityDonations: 'Charity Donations',
    toiletries: 'Toiletries',
    misc: 'Miscellaneous',
    fundsAvailable: 'Funds Available'
  };
  
  return fieldNames[fieldName] || fieldName;
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
}