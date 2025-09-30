// Persona Test Data System
// This module provides different financial personas for testing various debt settlement scenarios

export const PERSONAS = {
  highDebtHighIncome: {
    id: 'high-debt-high-income',
    name: 'Sarah - High Income, High Debt',
    description: 'Senior Software Engineer with substantial debt from lifestyle inflation',
    creditData: {
      requestedAt: new Date().toISOString(),
      personalInfo: {
        name: 'SARAH JOHNSON',
        address: {
          street: '1234 Silicon Valley Dr',
          city: 'San Jose',
          state: 'CA',
          zip: '95131'
        }
      },
      trades: [
        {
          accountNumber: '****1234',
          creditorName: 'Chase Sapphire Preferred',
          accountType: 'Credit Card',
          dateOpened: '2021-01-15',
          status: 'Open',
          balance: 25000,
          creditLimit: 30000,
          highCredit: 30000,
          paymentStatus: 'Current',
          monthsReviewed: 24,
          minimumPayment: 625, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 750,
          lastPaymentDate: '2024-02-15',
          pastDueAmount: 0,
          lastActivity: '2024-02-10',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****5678',
          creditorName: 'American Express Gold Card',
          accountType: 'Credit Card',
          dateOpened: '2020-06-10',
          status: 'Open',
          balance: 18000,
          creditLimit: 25000,
          highCredit: 25000,
          paymentStatus: 'Current',
          monthsReviewed: 36,
          minimumPayment: 450, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 500,
          lastPaymentDate: '2024-02-12',
          pastDueAmount: 0,
          lastActivity: '2024-02-08',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****9012',
          creditorName: 'Capital One Venture X',
          accountType: 'Credit Card',
          dateOpened: '2022-03-20',
          status: 'Open',
          balance: 12000,
          creditLimit: 20000,
          highCredit: 20000,
          paymentStatus: 'Current',
          monthsReviewed: 18,
          minimumPayment: 300, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 400,
          lastPaymentDate: '2024-02-18',
          pastDueAmount: 0,
          lastActivity: '2024-02-12',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****3456',
          creditorName: 'Citi Double Cash Card',
          accountType: 'Credit Card',
          dateOpened: '2023-01-05',
          status: 'Open',
          balance: 8500,
          creditLimit: 15000,
          highCredit: 15000,
          paymentStatus: 'Current',
          monthsReviewed: 12,
          minimumPayment: 213, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 250,
          lastPaymentDate: '2024-02-20',
          pastDueAmount: 0,
          lastActivity: '2024-02-15',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****7890',
          creditorName: 'Marcus Personal Loan',
          accountType: 'Personal Loan',
          dateOpened: '2022-08-15',
          status: 'Open',
          balance: 15000,
          creditLimit: null,
          highCredit: 20000,
          paymentStatus: '30 Days Late',
          monthsReviewed: 24,
          minimumPayment: 450, // typical personal loan payment
          scheduledPayment: 450,
          actualPayment: 0, // missed payment
          lastPaymentDate: '2024-01-15',
          pastDueAmount: 450,
          lastActivity: '2024-02-15',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'AU', codeabv: 'AU', description: 'Personal loan' }]
        },
        {
          accountNumber: '****2468',
          creditorName: 'Professional Collection Services',
          accountType: 'Medical Collection',
          dateOpened: '2023-05-10',
          status: 'Collection',
          balance: 5200,
          creditLimit: null,
          highCredit: 5200,
          paymentStatus: 'Collections',
          monthsReviewed: 12,
          minimumPayment: 0, // collections don't have minimum payments
          scheduledPayment: null,
          actualPayment: 0,
          lastPaymentDate: null,
          pastDueAmount: 5200,
          lastActivity: '2023-05-10',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: 'MED789456',
          narrativeCodes: [{ code: 'CZ', codeabv: 'CZ', description: 'Collection account' }]
        },
        {
          accountNumber: '****9988',
          creditorName: 'Bank of America Cash Rewards',
          accountType: 'Credit Card',
          dateOpened: '2019-11-22',
          status: 'Open',
          balance: 3800,
          creditLimit: 5000,
          highCredit: 5000,
          paymentStatus: '60 Days Late',
          monthsReviewed: 24,
          minimumPayment: 95, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payments
          lastPaymentDate: '2023-12-22',
          pastDueAmount: 190, // 2 months of minimum payments
          lastActivity: '2024-01-15',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        }
      ]
    },
    plaidData: {
      connectionMetadata: {
        institution: { name: 'Chase Bank' },
        accounts: [{ account_id: 'acc1' }, { account_id: 'acc2' }],
        link_session_id: 'link-session-sarah-123',
        item_id: 'item-sarah-456'
      },
      accounts: {
        accounts: [
          {
            account_id: 'checking-sarah-1',
            name: 'Chase Total Checking',
            subtype: 'checking',
            type: 'depository',
            balances: {
              current: 3500,
              available: 3500,
              iso_currency_code: 'USD'
            }
          },
          {
            account_id: 'savings-sarah-1',
            name: 'Chase Savings',
            subtype: 'savings',
            type: 'depository',
            balances: {
              current: 12000,
              available: 12000,
              iso_currency_code: 'USD'
            }
          }
        ]
      },
      income: {
        income_summary: {
          total_monthly_income: 12000,
          total_annual_income: 144000,
          income_stability: 0.95,
          employment_status: [
            {
              employer: 'TechCorp Inc',
              monthly_income: 12000,
              confidence: 0.95
            }
          ]
        },
        income_streams: [
          {
            name: 'Software Engineering Salary',
            monthly_income: 12000,
            confidence: 0.95,
            employer: { employer_name: 'TechCorp Inc' },
            income_breakdown: {
              type: 'salary',
              rate: 12000,
              pay_frequency: 'monthly'
            }
          }
        ]
      },
      transactions: {
        transactions: [
          // 90-Day Period: June 26 - September 24, 2024 (aligns with Plaid API)
          // Month 1 - July 2024
          {
            transaction_id: 'txn-sarah-1',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-06-28',
            name: 'TechCorp Bi-Weekly Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-1b',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-07-12',
            name: 'TechCorp Bi-Weekly Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-1c',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-07-26',
            name: 'TechCorp Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-2',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-06-26',
            name: 'Rent Payment - Start of 90-day Period',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-2b',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-07-26',
            name: 'Monthly Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-2c',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-08-26',
            name: 'Monthly Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-3',
            account_id: 'checking-sarah-1',
            amount: 1200,
            date: '2024-07-05',
            name: 'Chase Sapphire Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-4',
            account_id: 'checking-sarah-1',
            amount: 650,
            date: '2024-07-03',
            name: 'Whole Foods',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-5',
            account_id: 'checking-sarah-1',
            amount: 180,
            date: '2024-07-07',
            name: 'PG&E Electric',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-6',
            account_id: 'checking-sarah-1',
            amount: 120,
            date: '2024-07-12',
            name: 'Gas Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-7',
            account_id: 'checking-sarah-1',
            amount: 320,
            date: '2024-07-20',
            name: 'Target',
            personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_DEPARTMENT_STORES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-8',
            account_id: 'checking-sarah-1',
            amount: 45,
            date: '2024-07-25',
            name: 'Internet Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_INTERNET_AND_CABLE' },
            payment_channel: 'online'
          },
          // Month 2 - August 2024
          {
            transaction_id: 'txn-sarah-9a',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-08-09',
            name: 'TechCorp Bi-Weekly Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-9b',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-08-23',
            name: 'TechCorp Bi-Weekly Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-10',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-08-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-11',
            account_id: 'checking-sarah-1',
            amount: 1200,
            date: '2024-08-05',
            name: 'Chase Sapphire Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-12',
            account_id: 'checking-sarah-1',
            amount: 600,
            date: '2024-08-10',
            name: 'Marcus Personal Loan',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-13',
            account_id: 'checking-sarah-1',
            amount: 680,
            date: '2024-08-03',
            name: 'Safeway',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-14',
            account_id: 'checking-sarah-1',
            amount: 190,
            date: '2024-08-07',
            name: 'PG&E Electric',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-15',
            account_id: 'checking-sarah-1',
            amount: 125,
            date: '2024-08-12',
            name: 'Gas Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-16',
            account_id: 'checking-sarah-1',
            amount: 280,
            date: '2024-08-20',
            name: 'Nordstrom',
            personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES' },
            payment_channel: 'in store'
          },
          // Month 3 - September 2024
          {
            transaction_id: 'txn-sarah-17a',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-09-06',
            name: 'TechCorp Bi-Weekly Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-17b',
            account_id: 'checking-sarah-1',
            amount: -4000,
            date: '2024-09-20',
            name: 'TechCorp Bi-Weekly Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-18',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-09-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-19',
            account_id: 'checking-sarah-1',
            amount: 1200,
            date: '2024-09-05',
            name: 'Chase Sapphire Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-20',
            account_id: 'checking-sarah-1',
            amount: 600,
            date: '2024-09-10',
            name: 'Marcus Personal Loan',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-21',
            account_id: 'checking-sarah-1',
            amount: 720,
            date: '2024-09-03',
            name: 'Whole Foods',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-22',
            account_id: 'checking-sarah-1',
            amount: 175,
            date: '2024-09-07',
            name: 'PG&E Electric',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-23',
            account_id: 'checking-sarah-1',
            amount: 115,
            date: '2024-09-12',
            name: 'Gas Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-24',
            account_id: 'checking-sarah-1',
            amount: 450,
            date: '2024-09-20',
            name: 'Best Buy',
            personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_ELECTRONICS' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-25',
            account_id: 'checking-sarah-1',
            amount: 85,
            date: '2024-09-24',
            name: 'Starbucks',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_COFFEE' },
            payment_channel: 'in store'
          },
          // Additional comprehensive test transactions for mapping
          {
            transaction_id: 'txn-sarah-26',
            account_id: 'checking-sarah-1',
            amount: 450,
            date: '2024-07-28',
            name: 'State Farm Auto Insurance',
            personal_finance_category: { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_INSURANCE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-27',
            account_id: 'checking-sarah-1',
            amount: 200,
            date: '2024-07-30',
            name: 'CVS Pharmacy',
            personal_finance_category: { primary: 'MEDICAL', detailed: 'MEDICAL_PHARMACIES_AND_SUPPLEMENTS' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-28',
            account_id: 'checking-sarah-1',
            amount: 150,
            date: '2024-08-02',
            name: 'Uber',
            personal_finance_category: { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-29',
            account_id: 'checking-sarah-1',
            amount: 85,
            date: '2024-08-04',
            name: 'Shell Gas Station',
            personal_finance_category: { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_GAS' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-30',
            account_id: 'checking-sarah-1',
            amount: 300,
            date: '2024-08-25',
            name: 'Amazon',
            personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-31',
            account_id: 'checking-sarah-1',
            amount: 75,
            date: '2024-09-01',
            name: 'LA Fitness',
            personal_finance_category: { primary: 'PERSONAL_CARE', detailed: 'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-32',
            account_id: 'checking-sarah-1',
            amount: 120,
            date: '2024-09-03',
            name: 'Hair Salon',
            personal_finance_category: { primary: 'PERSONAL_CARE', detailed: 'PERSONAL_CARE_HAIR_AND_BEAUTY' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-33',
            account_id: 'checking-sarah-1',
            amount: 250,
            date: '2024-09-23',
            name: 'United Airlines',
            personal_finance_category: { primary: 'TRAVEL', detailed: 'TRAVEL_FLIGHTS' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-34',
            account_id: 'checking-sarah-1',
            amount: 95,
            date: '2024-08-15',
            name: 'Verizon Wireless',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_TELEPHONE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-35',
            account_id: 'checking-sarah-1',
            amount: 180,
            date: '2024-07-22',
            name: 'Dr. Smith - Primary Care',
            personal_finance_category: { primary: 'MEDICAL', detailed: 'MEDICAL_PRIMARY_CARE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-36',
            account_id: 'checking-sarah-1',
            amount: 65,
            date: '2024-09-15',
            name: 'Netflix',
            personal_finance_category: { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_TV_AND_MOVIES' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-37',
            account_id: 'checking-sarah-1',
            amount: -500,
            date: '2024-08-28',
            name: 'Dividend Payment - Stock',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_DIVIDENDS' },
            payment_channel: 'other'
          },
          // Month 4 - April 2024
          {
            transaction_id: 'txn-sarah-38',
            account_id: 'checking-sarah-1',
            amount: -12000,
            date: '2024-09-15',
            name: 'TechCorp Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-39',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-09-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-40',
            account_id: 'checking-sarah-1',
            amount: 1200,
            date: '2024-09-05',
            name: 'Chase Sapphire Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-41',
            account_id: 'checking-sarah-1',
            amount: 680,
            date: '2024-09-08',
            name: 'Whole Foods',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-42',
            account_id: 'checking-sarah-1',
            amount: 185,
            date: '2024-09-12',
            name: 'PG&E Electric',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          // Month 5 - May 2024
          {
            transaction_id: 'txn-sarah-43',
            account_id: 'checking-sarah-1',
            amount: -12000,
            date: '2024-06-15',
            name: 'TechCorp Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-sarah-44',
            account_id: 'checking-sarah-1',
            amount: 2800,
            date: '2024-06-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-45',
            account_id: 'checking-sarah-1',
            amount: 1200,
            date: '2024-06-05',
            name: 'Chase Sapphire Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-46',
            account_id: 'checking-sarah-1',
            amount: 720,
            date: '2024-06-08',
            name: 'Trader Joes',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-sarah-47',
            account_id: 'checking-sarah-1',
            amount: 165,
            date: '2024-06-12',
            name: 'PG&E Electric',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-sarah-48',
            account_id: 'checking-sarah-1',
            amount: 95,
            date: '2024-06-20',
            name: 'Chevron Gas',
            personal_finance_category: { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_GAS' },
            payment_channel: 'in store'
          }
        ],
        total_transactions: 107
      },
      fetchedAt: new Date().toISOString()
    }
  },

  moderateDebtModerateIncome: {
    id: 'moderate-debt-moderate-income',
    name: 'Michael - Middle Class Squeeze',
    description: 'Teacher with moderate debt from family expenses and medical bills',
    creditData: {
      requestedAt: new Date().toISOString(),
      personalInfo: {
        name: 'MICHAEL RODRIGUEZ',
        address: {
          street: '456 Maple Street',
          city: 'Austin',
          state: 'TX',
          zip: '78701'
        }
      },
      trades: [
        {
          accountNumber: '****2345',
          creditorName: 'Discover it Cash Back',
          accountType: 'Credit Card',
          dateOpened: '2019-03-15',
          status: 'Open',
          balance: 15000,
          creditLimit: 18000,
          highCredit: 18000,
          paymentStatus: '30 Days Late',
          monthsReviewed: 24,
          minimumPayment: 375, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payment
          lastPaymentDate: '2024-01-15',
          pastDueAmount: 375,
          lastActivity: '2024-02-10',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****6789',
          creditorName: 'Wells Fargo Reflect Card',
          accountType: 'Credit Card',
          dateOpened: '2020-08-22',
          status: 'Open',
          balance: 8500,
          creditLimit: 12000,
          highCredit: 12000,
          paymentStatus: '30 Days Late',
          monthsReviewed: 18,
          minimumPayment: 213, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payment
          lastPaymentDate: '2024-01-20',
          pastDueAmount: 213,
          lastActivity: '2024-02-05',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'CV', codeabv: 'CV', description: 'Line of credit' }]
        },
        {
          accountNumber: '****0123',
          creditorName: 'Southwest Medical Center',
          accountType: 'Medical Collection',
          dateOpened: '2023-09-12',
          status: 'Collection',
          balance: 4200,
          creditLimit: null,
          highCredit: 4200,
          paymentStatus: 'Collections',
          monthsReviewed: 6,
          minimumPayment: 0, // collections don't have minimum payments
          scheduledPayment: null,
          actualPayment: 0,
          lastPaymentDate: null,
          pastDueAmount: 4200,
          lastActivity: '2023-09-12',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: 'MED456789',
          narrativeCodes: [{ code: 'GS', codeabv: 'GS', description: 'Medical' }]
        }
      ]
    },
    plaidData: {
      connectionMetadata: {
        institution: { name: 'Wells Fargo' },
        accounts: [{ account_id: 'acc1' }],
        link_session_id: 'link-session-michael-123',
        item_id: 'item-michael-456'
      },
      accounts: {
        accounts: [
          {
            account_id: 'checking-michael-1',
            name: 'Wells Fargo Everyday Checking',
            subtype: 'checking',
            type: 'depository',
            balances: {
              current: 850,
              available: 850,
              iso_currency_code: 'USD'
            }
          }
        ]
      },
      income: {
        income_summary: {
          total_monthly_income: 4200,
          total_annual_income: 50400,
          income_stability: 0.88,
          employment_status: [
            {
              employer: 'Austin ISD',
              monthly_income: 4200,
              confidence: 0.88
            }
          ]
        },
        income_streams: [
          {
            name: 'Teaching Salary',
            monthly_income: 4200,
            confidence: 0.88,
            employer: { employer_name: 'Austin ISD' },
            income_breakdown: {
              type: 'salary',
              rate: 4200,
              pay_frequency: 'monthly'
            }
          }
        ]
      },
      transactions: {
        transactions: [
          // Month 1 - July 2024 (90-day period: June 26 - September 24)
          {
            transaction_id: 'txn-michael-1',
            account_id: 'checking-michael-1',
            amount: -4200,
            date: '2024-07-15',
            name: 'Austin ISD Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-michael-2',
            account_id: 'checking-michael-1',
            amount: 1400,
            date: '2024-07-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-3',
            account_id: 'checking-michael-1',
            amount: 450,
            date: '2024-07-05',
            name: 'Discover Card Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-4',
            account_id: 'checking-michael-1',
            amount: 380,
            date: '2024-07-03',
            name: 'H-E-B Groceries',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-michael-5',
            account_id: 'checking-michael-1',
            amount: 145,
            date: '2024-07-07',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-6',
            account_id: 'checking-michael-1',
            amount: 85,
            date: '2024-07-12',
            name: 'Gas Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          // Month 2 - August 2024
          {
            transaction_id: 'txn-michael-7',
            account_id: 'checking-michael-1',
            amount: -4200,
            date: '2024-08-15',
            name: 'Austin ISD Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-michael-8',
            account_id: 'checking-michael-1',
            amount: 1400,
            date: '2024-08-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-9',
            account_id: 'checking-michael-1',
            amount: 450,
            date: '2024-08-05',
            name: 'Discover Card Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-10',
            account_id: 'checking-michael-1',
            amount: 275,
            date: '2024-08-10',
            name: 'Wells Fargo Credit Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-11',
            account_id: 'checking-michael-1',
            amount: 420,
            date: '2024-08-03',
            name: 'H-E-B Groceries',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-michael-12',
            account_id: 'checking-michael-1',
            amount: 160,
            date: '2024-08-07',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          // Month 3 - September 2024
          {
            transaction_id: 'txn-michael-13',
            account_id: 'checking-michael-1',
            amount: -4200,
            date: '2024-09-15',
            name: 'Austin ISD Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-michael-14',
            account_id: 'checking-michael-1',
            amount: 1400,
            date: '2024-09-01',
            name: 'Rent Payment',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-15',
            account_id: 'checking-michael-1',
            amount: 450,
            date: '2024-09-05',
            name: 'Discover Card Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-16',
            account_id: 'checking-michael-1',
            amount: 275,
            date: '2024-09-10',
            name: 'Wells Fargo Credit Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-17',
            account_id: 'checking-michael-1',
            amount: 395,
            date: '2024-09-03',
            name: 'Costco',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-michael-18',
            account_id: 'checking-michael-1',
            amount: 140,
            date: '2024-09-07',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          // Additional test transactions for Michael
          {
            transaction_id: 'txn-michael-19',
            account_id: 'checking-michael-1',
            amount: 325,
            date: '2024-07-18',
            name: 'Allstate Auto Insurance',
            personal_finance_category: { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_INSURANCE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-20',
            account_id: 'checking-michael-1',
            amount: 95,
            date: '2024-07-25',
            name: 'Shell Gas',
            personal_finance_category: { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_GAS' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-michael-21',
            account_id: 'checking-michael-1',
            amount: 150,
            date: '2024-08-20',
            name: 'Dentist Visit',
            personal_finance_category: { primary: 'MEDICAL', detailed: 'MEDICAL_DENTAL_CARE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-22',
            account_id: 'checking-michael-1',
            amount: 65,
            date: '2024-09-12',
            name: 'AT&T Wireless',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_TELEPHONE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-23',
            account_id: 'checking-michael-1',
            amount: 200,
            date: '2024-07-30',
            name: 'Daycare Payment',
            personal_finance_category: { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_CHILDCARE' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-michael-24',
            account_id: 'checking-michael-1',
            amount: 45,
            date: '2024-08-14',
            name: 'McDonalds',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_FAST_FOOD' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-michael-25',
            account_id: 'checking-michael-1',
            amount: 85,
            date: '2024-09-20',
            name: 'Walmart Supercenter',
            personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_SUPERSTORES' },
            payment_channel: 'in store'
          }
        ],
        total_transactions: 62
      },
      fetchedAt: new Date().toISOString()
    }
  },

  lowIncomeHighDebt: {
    id: 'low-income-high-debt',
    name: 'Jessica - Financial Hardship',
    description: 'Single mother with high debt-to-income ratio from job loss',
    creditData: {
      requestedAt: new Date().toISOString(),
      personalInfo: {
        name: 'JESSICA MARTINEZ',
        address: {
          street: '789 Oak Avenue',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001'
        }
      },
      trades: [
        {
          accountNumber: '****3456',
          creditorName: 'Capital One Platinum Mastercard',
          accountType: 'Credit Card',
          dateOpened: '2018-11-10',
          status: 'Open',
          balance: 18500,
          creditLimit: 20000,
          highCredit: 20000,
          paymentStatus: '60 Days Late',
          monthsReviewed: 36,
          minimumPayment: 463, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payments
          lastPaymentDate: '2023-12-10',
          pastDueAmount: 926, // 2 months of minimum payments
          lastActivity: '2024-01-15',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****7890',
          creditorName: 'Synchrony Amazon Store Card',
          accountType: 'Credit Card',
          dateOpened: '2019-06-25',
          status: 'Open',
          balance: 12000,
          creditLimit: 15000,
          highCredit: 15000,
          paymentStatus: '90 Days Late',
          monthsReviewed: 24,
          minimumPayment: 300, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payments
          lastPaymentDate: '2023-11-25',
          pastDueAmount: 900, // 3 months of minimum payments
          lastActivity: '2024-01-10',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'AV', codeabv: 'AV', description: 'Charge' }]
        },
        {
          accountNumber: '****1234',
          creditorName: 'Portfolio Recovery Associates',
          accountType: 'Collection Account',
          dateOpened: '2023-02-15',
          status: 'Collection',
          balance: 8700,
          creditLimit: null,
          highCredit: 8700,
          paymentStatus: 'Collections',
          monthsReviewed: 12,
          minimumPayment: 0, // collections don't have minimum payments
          scheduledPayment: null,
          actualPayment: 0,
          lastPaymentDate: null,
          pastDueAmount: 8700,
          lastActivity: '2023-02-15',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: 'PRA987654',
          narrativeCodes: [{ code: 'CZ', codeabv: 'CZ', description: 'Collection account' }]
        },
        {
          accountNumber: '****5555',
          creditorName: 'Valley Medical Billing Services',
          accountType: 'Medical Collection',
          dateOpened: '2023-07-08',
          status: 'Collection',
          balance: 3200,
          creditLimit: null,
          highCredit: 3200,
          paymentStatus: 'Collections',
          monthsReviewed: 8,
          minimumPayment: 0, // collections don't have minimum payments
          scheduledPayment: null,
          actualPayment: 0,
          lastPaymentDate: null,
          pastDueAmount: 3200,
          lastActivity: '2023-07-08',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: 'MED321987',
          narrativeCodes: [{ code: 'GS', codeabv: 'GS', description: 'Medical' }]
        }
      ]
    },
    plaidData: {
      connectionMetadata: {
        institution: { name: 'Bank of America' },
        accounts: [{ account_id: 'acc1' }],
        link_session_id: 'link-session-jessica-123',
        item_id: 'item-jessica-456'
      },
      accounts: {
        accounts: [
          {
            account_id: 'checking-jessica-1',
            name: 'BoA Core Checking',
            subtype: 'checking',
            type: 'depository',
            balances: {
              current: 320,
              available: 320,
              iso_currency_code: 'USD'
            }
          }
        ]
      },
      income: {
        income_summary: {
          total_monthly_income: 2800,
          total_annual_income: 33600,
          income_stability: 0.65,
          employment_status: [
            {
              employer: 'Retail Plus',
              monthly_income: 2800,
              confidence: 0.65
            }
          ]
        },
        income_streams: [
          {
            name: 'Retail Associate',
            monthly_income: 2800,
            confidence: 0.65,
            employer: { employer_name: 'Retail Plus' },
            income_breakdown: {
              type: 'hourly',
              rate: 17.50,
              pay_frequency: 'weekly'
            }
          }
        ]
      },
      transactions: {
        transactions: [
          // Month 1 - July 2024 (90-day period: June 26 - September 24) (4 weekly payments)
          {
            transaction_id: 'txn-jessica-1',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-07-05',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-2',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-07-12',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-3',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-07-19',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-4',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-07-26',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-5',
            account_id: 'checking-jessica-1',
            amount: 950,
            date: '2024-07-01',
            name: 'Apartment Rent',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-jessica-6',
            account_id: 'checking-jessica-1',
            amount: 125,
            date: '2024-07-08',
            name: 'Capital One Min Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-jessica-7',
            account_id: 'checking-jessica-1',
            amount: 280,
            date: '2024-07-10',
            name: 'Walmart Groceries',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-jessica-8',
            account_id: 'checking-jessica-1',
            amount: 120,
            date: '2024-07-15',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          // Month 2 - August 2024
          {
            transaction_id: 'txn-jessica-9',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-08-02',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-10',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-08-09',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-11',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-08-16',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-12',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-08-23',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-13',
            account_id: 'checking-jessica-1',
            amount: 950,
            date: '2024-08-01',
            name: 'Apartment Rent',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-jessica-14',
            account_id: 'checking-jessica-1',
            amount: 125,
            date: '2024-08-08',
            name: 'Capital One Min Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-jessica-15',
            account_id: 'checking-jessica-1',
            amount: 310,
            date: '2024-08-10',
            name: 'Dollar General',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          // Month 3 - September 2024
          {
            transaction_id: 'txn-jessica-16',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-09-01',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-17',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-09-08',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-18',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-09-15',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-19',
            account_id: 'checking-jessica-1',
            amount: -700,
            date: '2024-09-22',
            name: 'Retail Plus Payroll',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-jessica-20',
            account_id: 'checking-jessica-1',
            amount: 950,
            date: '2024-09-01',
            name: 'Apartment Rent',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-jessica-21',
            account_id: 'checking-jessica-1',
            amount: 125,
            date: '2024-09-08',
            name: 'Capital One Min Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-jessica-22',
            account_id: 'checking-jessica-1',
            amount: 295,
            date: '2024-09-12',
            name: 'Family Dollar',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          }
        ],
        total_transactions: 45
      },
      fetchedAt: new Date().toISOString()
    }
  },

  youngProfessional: {
    id: 'young-professional',
    name: 'David - Recent Graduate',
    description: 'Recent college graduate with student loans and starter credit cards',
    creditData: {
      requestedAt: new Date().toISOString(),
      personalInfo: {
        name: 'DAVID CHEN',
        address: {
          street: '321 University Blvd',
          city: 'Denver',
          state: 'CO',
          zip: '80203'
        }
      },
      trades: [
        {
          accountNumber: '****4567',
          creditorName: 'Great Lakes Student Loan Services',
          accountType: 'Student Loan',
          dateOpened: '2020-08-15',
          status: 'Open',
          balance: 45000,
          creditLimit: null,
          highCredit: 50000,
          paymentStatus: 'Current',
          monthsReviewed: 12,
          minimumPayment: 450, // typical student loan payment
          scheduledPayment: 450,
          actualPayment: 450,
          lastPaymentDate: '2024-02-15',
          pastDueAmount: 0,
          lastActivity: '2024-02-15',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: 'SL789012',
          narrativeCodes: [{ code: 'BU', codeabv: 'BU', description: 'Student loan' }]
        },
        {
          accountNumber: '****8901',
          creditorName: 'Discover it Student Cash Back',
          accountType: 'Credit Card',
          dateOpened: '2022-01-10',
          status: 'Open',
          balance: 3200,
          creditLimit: 5000,
          highCredit: 5000,
          paymentStatus: 'Current',
          monthsReviewed: 18,
          minimumPayment: 80, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 125,
          lastPaymentDate: '2024-02-20',
          pastDueAmount: 0,
          lastActivity: '2024-02-18',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****2345',
          creditorName: 'Chase Freedom Student Card',
          accountType: 'Credit Card',
          dateOpened: '2021-09-05',
          status: 'Open',
          balance: 1800,
          creditLimit: 3000,
          highCredit: 3000,
          paymentStatus: 'Current',
          monthsReviewed: 12,
          minimumPayment: 45, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 75,
          lastPaymentDate: '2024-02-22',
          pastDueAmount: 0,
          lastActivity: '2024-02-20',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****9999',
          creditorName: 'SoFi Personal Loan',
          accountType: 'Personal Loan',
          dateOpened: '2022-06-20',
          status: 'Open',
          balance: 8500,
          creditLimit: null,
          highCredit: 12000,
          paymentStatus: 'Current',
          monthsReviewed: 18,
          minimumPayment: 350, // typical personal loan payment
          scheduledPayment: 350,
          actualPayment: 350,
          lastPaymentDate: '2024-02-10',
          pastDueAmount: 0,
          lastActivity: '2024-02-10',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'AU', codeabv: 'AU', description: 'Personal loan' }]
        }
      ]
    },
    plaidData: {
      connectionMetadata: {
        institution: { name: 'Ally Bank' },
        accounts: [{ account_id: 'acc1' }],
        link_session_id: 'link-session-david-123',
        item_id: 'item-david-456'
      },
      accounts: {
        accounts: [
          {
            account_id: 'checking-david-1',
            name: 'Ally Interest Checking',
            subtype: 'checking',
            type: 'depository',
            balances: {
              current: 2400,
              available: 2400,
              iso_currency_code: 'USD'
            }
          },
          {
            account_id: 'savings-david-1',
            name: 'Ally Online Savings',
            subtype: 'savings',
            type: 'depository',
            balances: {
              current: 5600,
              available: 5600,
              iso_currency_code: 'USD'
            }
          }
        ]
      },
      income: {
        income_summary: {
          total_monthly_income: 5200,
          total_annual_income: 62400,
          income_stability: 0.82,
          employment_status: [
            {
              employer: 'StartupCo',
              monthly_income: 5200,
              confidence: 0.82
            }
          ]
        },
        income_streams: [
          {
            name: 'Software Developer',
            monthly_income: 5200,
            confidence: 0.82,
            employer: { employer_name: 'StartupCo' },
            income_breakdown: {
              type: 'salary',
              rate: 5200,
              pay_frequency: 'monthly'
            }
          }
        ]
      },
      transactions: {
        transactions: [
          // Month 1 - July 2024 (90-day period: June 26 - September 24)
          {
            transaction_id: 'txn-david-1',
            account_id: 'checking-david-1',
            amount: -5200,
            date: '2024-07-15',
            name: 'StartupCo Salary',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-david-2',
            account_id: 'checking-david-1',
            amount: 1200,
            date: '2024-07-01',
            name: 'Apartment Rent',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-3',
            account_id: 'checking-david-1',
            amount: 450,
            date: '2024-07-05',
            name: 'Student Loan Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-4',
            account_id: 'checking-david-1',
            amount: 350,
            date: '2024-07-10',
            name: 'SoFi Personal Loan',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-5',
            account_id: 'checking-david-1',
            amount: 320,
            date: '2024-07-08',
            name: 'King Soopers',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-david-6',
            account_id: 'checking-david-1',
            amount: 95,
            date: '2024-07-12',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-7',
            account_id: 'checking-david-1',
            amount: 180,
            date: '2024-07-20',
            name: 'Discover Student Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          // Month 2 - August 2024
          {
            transaction_id: 'txn-david-8',
            account_id: 'checking-david-1',
            amount: -5200,
            date: '2024-08-15',
            name: 'StartupCo Salary',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-david-9',
            account_id: 'checking-david-1',
            amount: 1200,
            date: '2024-08-01',
            name: 'Apartment Rent',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-10',
            account_id: 'checking-david-1',
            amount: 450,
            date: '2024-08-05',
            name: 'Student Loan Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-11',
            account_id: 'checking-david-1',
            amount: 350,
            date: '2024-08-10',
            name: 'SoFi Personal Loan',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-12',
            account_id: 'checking-david-1',
            amount: 340,
            date: '2024-08-08',
            name: 'Whole Foods',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          // Month 3 - September 2024
          {
            transaction_id: 'txn-david-13',
            account_id: 'checking-david-1',
            amount: -5200,
            date: '2024-09-15',
            name: 'StartupCo Salary',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-david-14',
            account_id: 'checking-david-1',
            amount: 1200,
            date: '2024-09-01',
            name: 'Apartment Rent',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-15',
            account_id: 'checking-david-1',
            amount: 450,
            date: '2024-09-05',
            name: 'Student Loan Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-16',
            account_id: 'checking-david-1',
            amount: 350,
            date: '2024-09-10',
            name: 'SoFi Personal Loan',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-david-17',
            account_id: 'checking-david-1',
            amount: 365,
            date: '2024-09-08',
            name: 'Sprouts',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-david-18',
            account_id: 'checking-david-1',
            amount: 105,
            date: '2024-09-12',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          }
        ],
        total_transactions: 65
      },
      fetchedAt: new Date().toISOString()
    }
  },

  seniorFixedIncome: {
    id: 'senior-fixed-income',
    name: 'Robert - Retired Senior',
    description: 'Retired senior with fixed income and accumulated debt',
    creditData: {
      requestedAt: new Date().toISOString(),
      personalInfo: {
        name: 'ROBERT WILLIAMS',
        address: {
          street: '567 Pine Street',
          city: 'Tampa',
          state: 'FL',
          zip: '33601'
        }
      },
      trades: [
        {
          accountNumber: '****5678',
          creditorName: 'Chase Freedom Unlimited',
          accountType: 'Credit Card',
          dateOpened: '2015-04-12',
          status: 'Open',
          balance: 22000,
          creditLimit: 25000,
          highCredit: 25000,
          paymentStatus: '30 Days Late',
          monthsReviewed: 60,
          minimumPayment: 550, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payment
          lastPaymentDate: '2024-01-12',
          pastDueAmount: 550,
          lastActivity: '2024-02-08',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****9012',
          creditorName: 'Citi Simplicity Card',
          accountType: 'Credit Card',
          dateOpened: '2016-08-30',
          status: 'Open',
          balance: 16500,
          creditLimit: 20000,
          highCredit: 20000,
          paymentStatus: '30 Days Late',
          monthsReviewed: 48,
          minimumPayment: 413, // ~2.5% of balance
          scheduledPayment: null,
          actualPayment: 0, // missed payment
          lastPaymentDate: '2024-01-08',
          pastDueAmount: 413,
          lastActivity: '2024-02-02',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'FE', codeabv: 'FE', description: 'Credit card' }]
        },
        {
          accountNumber: '****3456',
          creditorName: 'Tampa General Hospital',
          accountType: 'Medical Collection',
          dateOpened: '2022-11-18',
          status: 'Collection',
          balance: 8900,
          creditLimit: null,
          highCredit: 8900,
          paymentStatus: 'Collections',
          monthsReviewed: 18,
          minimumPayment: 0, // collections don't have minimum payments
          scheduledPayment: null,
          actualPayment: 0,
          lastPaymentDate: null,
          pastDueAmount: 8900,
          lastActivity: '2022-11-18',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: 'TGH654321',
          narrativeCodes: [{ code: 'GS', codeabv: 'GS', description: 'Medical' }]
        },
        {
          accountNumber: '****7777',
          creditorName: 'LendingClub Personal Loan',
          accountType: 'Personal Loan',
          dateOpened: '2021-05-25',
          status: 'Open',
          balance: 12000,
          creditLimit: null,
          highCredit: 18000,
          paymentStatus: '60 Days Late',
          monthsReviewed: 36,
          minimumPayment: 480, // typical personal loan payment
          scheduledPayment: 480,
          actualPayment: 0, // missed payments
          lastPaymentDate: '2023-12-25',
          pastDueAmount: 960, // 2 months of payments
          lastActivity: '2024-02-01',
          dateReported: '2024-02-28',
          accountDesignator: 'Individual',
          customerNumber: null,
          narrativeCodes: [{ code: 'EX', codeabv: 'EX', description: 'Unsecured' }]
        }
      ]
    },
    plaidData: {
      connectionMetadata: {
        institution: { name: 'Navy Federal Credit Union' },
        accounts: [{ account_id: 'acc1' }],
        link_session_id: 'link-session-robert-123',
        item_id: 'item-robert-456'
      },
      accounts: {
        accounts: [
          {
            account_id: 'checking-robert-1',
            name: 'NFCU Checking',
            subtype: 'checking',
            type: 'depository',
            balances: {
              current: 1800,
              available: 1800,
              iso_currency_code: 'USD'
            }
          },
          {
            account_id: 'savings-robert-1',
            name: 'NFCU Savings',
            subtype: 'savings',
            type: 'depository',
            balances: {
              current: 8500,
              available: 8500,
              iso_currency_code: 'USD'
            }
          }
        ]
      },
      income: {
        income_summary: {
          total_monthly_income: 2400,
          total_annual_income: 28800,
          income_stability: 0.98,
          employment_status: [
            {
              employer: 'Social Security Administration',
              monthly_income: 1800,
              confidence: 0.98
            },
            {
              employer: 'Pension Fund',
              monthly_income: 600,
              confidence: 0.98
            }
          ]
        },
        income_streams: [
          {
            name: 'Social Security',
            monthly_income: 1800,
            confidence: 0.98,
            employer: { employer_name: 'Social Security Administration' },
            income_breakdown: {
              type: 'retirement',
              rate: 1800,
              pay_frequency: 'monthly'
            }
          },
          {
            name: 'Pension',
            monthly_income: 600,
            confidence: 0.98,
            employer: { employer_name: 'Pension Fund' },
            income_breakdown: {
              type: 'retirement',
              rate: 600,
              pay_frequency: 'monthly'
            }
          }
        ]
      },
      transactions: {
        transactions: [
          // Month 1 - July 2024 (90-day period: June 26 - September 24)
          {
            transaction_id: 'txn-robert-1',
            account_id: 'checking-robert-1',
            amount: -1800,
            date: '2024-07-03',
            name: 'Social Security Deposit',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_OTHER_INCOME' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-robert-2',
            account_id: 'checking-robert-1',
            amount: -600,
            date: '2024-07-15',
            name: 'Pension Deposit',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_RETIREMENT_PENSION' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-robert-3',
            account_id: 'checking-robert-1',
            amount: 550,
            date: '2024-07-05',
            name: 'Chase Credit Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-4',
            account_id: 'checking-robert-1',
            amount: 480,
            date: '2024-07-10',
            name: 'Unsecured Loan Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-5',
            account_id: 'checking-robert-1',
            amount: 260,
            date: '2024-07-08',
            name: 'Publix',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-robert-6',
            account_id: 'checking-robert-1',
            amount: 145,
            date: '2024-07-12',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-7',
            account_id: 'checking-robert-1',
            amount: 420,
            date: '2024-07-20',
            name: 'Citi Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-8',
            account_id: 'checking-robert-1',
            amount: 85,
            date: '2024-07-25',
            name: 'Medicare Part B',
            personal_finance_category: { primary: 'MEDICAL', detailed: 'MEDICAL_DENTAL_CARE' },
            payment_channel: 'online'
          },
          // Month 2 - August 2024
          {
            transaction_id: 'txn-robert-9',
            account_id: 'checking-robert-1',
            amount: -1800,
            date: '2024-08-03',
            name: 'Social Security Deposit',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_OTHER_INCOME' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-robert-10',
            account_id: 'checking-robert-1',
            amount: -600,
            date: '2024-08-15',
            name: 'Pension Deposit',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_RETIREMENT_PENSION' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-robert-11',
            account_id: 'checking-robert-1',
            amount: 550,
            date: '2024-08-05',
            name: 'Chase Credit Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-12',
            account_id: 'checking-robert-1',
            amount: 480,
            date: '2024-08-10',
            name: 'Unsecured Loan Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-13',
            account_id: 'checking-robert-1',
            amount: 290,
            date: '2024-08-08',
            name: 'Winn-Dixie',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-robert-14',
            account_id: 'checking-robert-1',
            amount: 160,
            date: '2024-08-12',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          },
          // Month 3 - September 2024
          {
            transaction_id: 'txn-robert-15',
            account_id: 'checking-robert-1',
            amount: -1800,
            date: '2024-09-03',
            name: 'Social Security Deposit',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_OTHER_INCOME' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-robert-16',
            account_id: 'checking-robert-1',
            amount: -600,
            date: '2024-09-15',
            name: 'Pension Deposit',
            personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_RETIREMENT_PENSION' },
            payment_channel: 'other'
          },
          {
            transaction_id: 'txn-robert-17',
            account_id: 'checking-robert-1',
            amount: 550,
            date: '2024-09-05',
            name: 'Chase Credit Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-18',
            account_id: 'checking-robert-1',
            amount: 480,
            date: '2024-09-10',
            name: 'Unsecured Loan Payment',
            personal_finance_category: { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT' },
            payment_channel: 'online'
          },
          {
            transaction_id: 'txn-robert-19',
            account_id: 'checking-robert-1',
            amount: 275,
            date: '2024-09-08',
            name: 'Walmart',
            personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' },
            payment_channel: 'in store'
          },
          {
            transaction_id: 'txn-robert-20',
            account_id: 'checking-robert-1',
            amount: 135,
            date: '2024-09-12',
            name: 'Electric Bill',
            personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY' },
            payment_channel: 'online'
          }
        ],
        total_transactions: 48
      },
      fetchedAt: new Date().toISOString()
    }
  }
};

// Helper functions
export const getPersona = (personaId) => {
  return PERSONAS[personaId] || null;
};

export const getAllPersonas = () => {
  return Object.values(PERSONAS);
};

export const getPersonasList = () => {
  return Object.keys(PERSONAS).map(key => ({
    id: key,
    name: PERSONAS[key].name,
    description: PERSONAS[key].description
  }));
};

// Function to apply persona data to localStorage (for testing)
export const applyPersona = (personaId, userId) => {
  const persona = getPersona(personaId);
  if (!persona) {
    throw new Error(`Persona ${personaId} not found`);
  }

  console.log(`[Persona] Applying persona ${personaId} for user ${userId}`);

  // Clear any existing real data first
  clearPersonaData(userId);

  // Ensure narrative codes are set up for testing
  if (typeof window !== 'undefined') {
    import('./narrative-codes-setup').then(({ ensureNarrativeCodesForTesting }) => {
      ensureNarrativeCodesForTesting();
    });
  }

  // Store credit data
  localStorage.setItem(`credit_data_${userId}`, JSON.stringify(persona.creditData));

  // Store plaid data in multiple formats to ensure compatibility
  const plaidDataWithMetadata = {
    data: persona.plaidData,
    timestamp: new Date().toISOString(),
    userId: userId,
    storedAt: new Date().toISOString()
  };

  console.log('[Persona] Storing plaid data:', plaidDataWithMetadata);

  // Store in sessionStorage (for getPlaidData compatibility)
  try {
    sessionStorage.setItem('plaid_session_data', JSON.stringify(plaidDataWithMetadata));
    console.log('[Persona] Successfully stored in sessionStorage');
  } catch (e) {
    // Fallback to localStorage if sessionStorage is not available
    localStorage.setItem('plaid_session_data', JSON.stringify(plaidDataWithMetadata));
    console.log('[Persona] Fallback to localStorage due to error:', e);
  }

  // Also store in localStorage with userId key (for direct access)
  localStorage.setItem(`plaid_data_${userId}`, JSON.stringify(persona.plaidData));

  // Store in the standard plaid_data key as well
  localStorage.setItem('plaid_data', JSON.stringify({
    userId: userId,
    data: persona.plaidData,
    storedAt: new Date().toISOString()
  }));

  console.log('[Persona] Stored plaid data in all storage locations');

  // Update step completion status for persona testing
  const stepStatus = JSON.parse(localStorage.getItem('user_steps') || '{}');
  stepStatus.bank_connection = {
    completed: true,
    completedAt: new Date().toISOString(),
    data: { userId, connectionTime: new Date().toISOString(), isPersonaData: true }
  };
  stepStatus.credit_check = {
    completed: true,
    completedAt: new Date().toISOString(),
    data: { userId, checkTime: new Date().toISOString(), isPersonaData: true }
  };
  localStorage.setItem('user_steps', JSON.stringify(stepStatus));

  console.log('[Persona] Updated step status:', stepStatus);

  // Store persona selection for reference
  localStorage.setItem(`selected_persona_${userId}`, personaId);

  console.log(`[Persona] Successfully applied persona ${personaId}`);
  return persona;
};

// Function to clear persona data
export const clearPersonaData = (userId) => {
  // Clear credit data
  localStorage.removeItem(`credit_data_${userId}`);

  // Clear persona selection
  localStorage.removeItem(`selected_persona_${userId}`);

  // Clear plaid session data
  try {
    sessionStorage.removeItem('plaid_session_data');
  } catch (e) {
    localStorage.removeItem('plaid_session_data');
  }

  // Clear all plaid data storage locations
  localStorage.removeItem('plaid_data');
  localStorage.removeItem(`plaid_data_${userId}`);
  localStorage.removeItem('credit_data');

  // Reset step completion status
  const stepStatus = JSON.parse(localStorage.getItem('user_steps') || '{}');
  if (stepStatus.bank_connection && stepStatus.bank_connection.data?.isPersonaData) {
    delete stepStatus.bank_connection;
  }
  if (stepStatus.credit_check && stepStatus.credit_check.data?.isPersonaData) {
    delete stepStatus.credit_check;
  }
  localStorage.setItem('user_steps', JSON.stringify(stepStatus));
};

// Function to get currently selected persona
export const getCurrentPersona = (userId) => {
  const selectedPersonaId = localStorage.getItem(`selected_persona_${userId}`);
  return selectedPersonaId ? getPersona(selectedPersonaId) : null;
};