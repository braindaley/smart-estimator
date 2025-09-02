/**
 * Plaid to Deal Sheet Mapping Utilities
 */

// Income category mappings
const INCOME_MAPPINGS = {
  'INCOME_WAGES': 'netMonthlyEmploymentIncome',
  'INCOME_OTHER_INCOME': 'otherIncome', // This needs subcategorization
  'INCOME_UNEMPLOYMENT': 'unemployment',
  'INCOME_DIVIDENDS': 'dividends',
  'INCOME_RETIREMENT_PENSION': 'retirement',
  'INCOME_INTEREST_EARNED': 'otherIncome',
  'INCOME_TAX_REFUND': 'otherIncome'
};

// Expense category mappings
const EXPENSE_MAPPINGS = {
  // Housing
  'RENT_AND_UTILITIES_RENT': 'housingPayment',
  'LOAN_PAYMENTS_MORTGAGE_PAYMENT': 'housingPayment',
  'GENERAL_SERVICES_INSURANCE_homeowners': 'homeOwnersInsurance',
  
  // Medical
  'GENERAL_SERVICES_INSURANCE_health': 'healthLifeInsurance',
  'MEDICAL_PRIMARY_CARE': 'medicalCare',
  'MEDICAL_PHARMACY': 'prescriptionsMedicalExp',
  'MEDICAL_DENTAL_CARE': 'medicalCare',
  'MEDICAL_EYE_CARE': 'medicalCare',
  'MEDICAL_VETERINARY_SERVICES': 'medicalCare',
  
  // Transportation
  'LOAN_PAYMENTS_CAR_PAYMENT': 'autoPayments',
  'GENERAL_SERVICES_INSURANCE_auto': 'autoInsurance',
  'TRANSPORTATION_GAS': 'gasoline',
  'TRANSPORTATION_PARKING': 'parking',
  'TRANSPORTATION_PUBLIC_TRANSPORTATION': 'commuting',
  'TRANSPORTATION_TAXIS_AND_RIDE_SHARES': 'commuting',
  'TRANSPORTATION_TOLLS': 'commuting',
  'GENERAL_SERVICES_AUTOMOTIVE': 'repairsMaintenance',
  
  // Food
  'FOOD_AND_DRINK_GROCERIES': 'groceries',
  'FOOD_AND_DRINK_RESTAURANTS': 'eatingOut',
  'FOOD_AND_DRINK_FAST_FOOD': 'eatingOut',
  'FOOD_AND_DRINK_COFFEE': 'eatingOut',
  'FOOD_AND_DRINK_BEER_WINE_LIQUOR': 'eatingOut',
  
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
  'ENTERTAINMENT_MUSIC_AND_AUDIO': 'entertainment',
  'ENTERTAINMENT_TV_AND_MOVIES': 'entertainment',
  'ENTERTAINMENT_SPORTING_EVENTS': 'entertainment',
  'GENERAL_MERCHANDISE_PET_SUPPLIES': 'petCare',
  'GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES': 'gifts',
  'PERSONAL_CARE_HAIR_AND_BEAUTY': 'hairCare',
  'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING': 'laundry',
  'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS': 'gym',
  'PERSONAL_CARE_OTHER_PERSONAL_CARE': 'personalCare',
  
  // Debt (not in program)
  'LOAN_PAYMENTS_OTHER_PAYMENT': 'debtOther',
  'LOAN_PAYMENTS_STUDENT_LOAN': 'govtStudentLoans',
  'LOAN_PAYMENTS_PERSONAL_LOAN': 'privateStudentLoans',
  
  // Legal & Court-Ordered
  'TRANSFER_OUT_CHILD_SUPPORT': 'childSupportExpense',
  'TRANSFER_OUT_ALIMONY': 'alimonyExpense',
  'GOVERNMENT_AND_NON_PROFIT_COURT_FEES': 'judgmentPayments',
  'GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT': 'backTaxes',
  
  // Dependent Care
  'GENERAL_SERVICES_CHILD_CARE': 'daycareChildExpenses',
  'MEDICAL_NURSING_CARE': 'nursingCare'
};

/**
 * Maps Plaid transactions to deal sheet format
 * @param {Array} transactions - Array of Plaid transactions
 * @param {Array} accounts - Array of Plaid accounts
 * @returns {Object} Mapped data for deal sheet
 */
export function mapPlaidToDealsSheet(transactions, accounts) {
  const mappedData = {
    income: {},
    expenses: {},
    unmapped: [],
    transactionDetails: {}
  };

  // Initialize all fields to 0
  Object.values(INCOME_MAPPINGS).forEach(field => {
    mappedData.income[field] = 0;
    mappedData.transactionDetails[field] = [];
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
  transactions.forEach(transaction => {
    const category = transaction.personal_finance_category;
    if (!category) {
      mappedData.unmapped.push(transaction);
      return;
    }

    const primaryCategory = category.primary;
    const detailedCategory = category.detailed;
    const amount = Math.abs(transaction.amount); // Plaid amounts are negative for outflows
    
    // Handle income
    if (primaryCategory === 'INCOME') {
      const mappedField = INCOME_MAPPINGS[detailedCategory];
      if (mappedField) {
        mappedData.income[mappedField] += amount;
        mappedData.transactionDetails[mappedField].push({
          ...transaction,
          mappedAmount: amount
        });
      } else {
        mappedData.unmapped.push(transaction);
      }
    }
    // Handle expenses (negative amounts in Plaid represent money going out)
    else if (transaction.amount < 0) {
      // Convert detailed category to mapping key format
      const categoryKey = `${primaryCategory}_${detailedCategory}`.toUpperCase().replace(/[^A-Z_]/g, '_');
      const mappedField = EXPENSE_MAPPINGS[categoryKey];
      
      if (mappedField) {
        if (!mappedData.expenses[mappedField]) {
          mappedData.expenses[mappedField] = 0;
          mappedData.transactionDetails[mappedField] = [];
        }
        mappedData.expenses[mappedField] += amount;
        mappedData.transactionDetails[mappedField].push({
          ...transaction,
          mappedAmount: amount
        });
      } else {
        mappedData.unmapped.push(transaction);
      }
    } else {
      // Positive non-income transactions
      mappedData.unmapped.push(transaction);
    }
  });

  // Convert to monthly averages (assuming data is from last 30-90 days)
  const daysCovered = 30; // This should be calculated from actual date range
  const monthlyMultiplier = 30 / daysCovered;
  
  Object.keys(mappedData.income).forEach(field => {
    mappedData.income[field] = Math.round(mappedData.income[field] * monthlyMultiplier * 100) / 100;
  });
  
  Object.keys(mappedData.expenses).forEach(field => {
    mappedData.expenses[field] = Math.round(mappedData.expenses[field] * monthlyMultiplier * 100) / 100;
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
    nursingCare: 'Nursing Care'
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