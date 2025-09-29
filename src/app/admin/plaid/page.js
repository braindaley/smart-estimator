'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PlaidAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldMappings, setFieldMappings] = useState({});

  // All available deal sheet fields
  const dealSheetFields = [
    // Income fields
    { value: 'netMonthlyEmploymentIncome', label: 'Net Monthly Employment Income', category: 'Income' },
    { value: 'selfEmployment', label: 'Self Employment', category: 'Income' },
    { value: 'socialSecurity', label: 'Social Security', category: 'Income' },
    { value: 'unemployment', label: 'Unemployment', category: 'Income' },
    { value: 'alimony', label: 'Alimony', category: 'Income' },
    { value: 'childSupport', label: 'Child Support', category: 'Income' },
    { value: 'otherGovtAssistance', label: 'Other Govt. Assistance', category: 'Income' },
    { value: 'annuities', label: 'Annuities', category: 'Income' },
    { value: 'dividends', label: 'Dividends', category: 'Income' },
    { value: 'retirement', label: 'Retirement', category: 'Income' },
    { value: 'otherIncome', label: 'Other Income', category: 'Income' },
    
    // Housing & Utilities
    { value: 'housingPayment', label: 'Housing Payment', category: 'Housing' },
    { value: 'secondaryHousingPayment', label: 'Secondary Housing Payment', category: 'Housing' },
    { value: 'homeOwnersInsurance', label: 'Home Owners Insurance', category: 'Housing' },
    { value: 'gasElectricOil', label: 'Gas/Electric/Oil', category: 'Utilities' },
    { value: 'cableSatelliteInternet', label: 'Cable/Satellite/Internet', category: 'Utilities' },
    { value: 'phoneIncludeCell', label: 'Phone (incl. cell)', category: 'Utilities' },
    { value: 'waterSewerGarbage', label: 'Water/Sewer/Garbage', category: 'Utilities' },
    
    // Transportation
    { value: 'autoPayments', label: 'Auto Payments', category: 'Transportation' },
    { value: 'autoInsurance', label: 'Auto Insurance', category: 'Transportation' },
    { value: 'gasoline', label: 'Gasoline', category: 'Transportation' },
    { value: 'parking', label: 'Parking', category: 'Transportation' },
    { value: 'commuting', label: 'Commuting', category: 'Transportation' },
    { value: 'repairsMaintenance', label: 'Repairs/Maintenance', category: 'Transportation' },
    
    // Food & Living Expenses
    { value: 'groceries', label: 'Food - Groceries', category: 'Food' },
    { value: 'eatingOut', label: 'Food - Eating Out', category: 'Food' },
    { value: 'clothing', label: 'Clothing', category: 'Living Expenses' },
    { value: 'householdItems', label: 'Household Items', category: 'Living Expenses' },
    { value: 'personalCare', label: 'Personal Care', category: 'Living Expenses' },
    { value: 'toiletries', label: 'Toiletries', category: 'Living Expenses' },
    
    // Healthcare
    { value: 'healthLifeInsurance', label: 'Health/Life Insurance', category: 'Healthcare' },
    { value: 'medicalCare', label: 'Medical Care', category: 'Healthcare' },
    { value: 'prescriptionsMedicalExp', label: 'Prescriptions/Medical Exp', category: 'Healthcare' },
    { value: 'medicalDebt', label: 'Medical Debt', category: 'Healthcare' },
    { value: 'nursingCare', label: 'Nursing Care', category: 'Healthcare' },
    
    // Recreation & Personal
    { value: 'entertainment', label: 'Entertainment', category: 'Recreation' },
    { value: 'petCare', label: 'Pet Care', category: 'Recreation' },
    { value: 'gifts', label: 'Gifts', category: 'Recreation' },
    { value: 'hairCare', label: 'Hair Care', category: 'Personal Care' },
    { value: 'laundry', label: 'Laundry', category: 'Personal Care' },
    { value: 'gym', label: 'Gym', category: 'Personal Care' },
    
    // Debt & Financial
    { value: 'debtOther', label: 'Debt Other', category: 'Debt' },
    { value: 'govtStudentLoans', label: 'Gov\'t Student Loans (non-deferred)', category: 'Debt' },
    { value: 'privateStudentLoans', label: 'Private Student Loans (non-deferred)', category: 'Debt' },
    
    // Legal & Court-Ordered
    { value: 'childSupportExpense', label: 'Child Support (Expense)', category: 'Legal' },
    { value: 'alimonyExpense', label: 'Alimony (Expense)', category: 'Legal' },
    { value: 'judgmentPayments', label: 'Judgment Payments', category: 'Legal' },
    { value: 'backTaxes', label: 'Back Taxes', category: 'Legal' },
    
    // Dependent Care
    { value: 'daycareChildExpenses', label: 'Daycare/Child Expenses', category: 'Dependent Care' },
    
    // Other
    { value: 'charityDonations', label: 'Charity Donations', category: 'Other' },
    { value: 'misc', label: 'Miscellaneous', category: 'Other' },
    { value: 'fundsAvailable', label: 'Funds Available', category: 'Other' }
  ];

  // Handle mapping changes
  const handleMappingChange = (categoryId, newMapping) => {
    setFieldMappings(prev => ({
      ...prev,
      [categoryId]: newMapping
    }));
  };

  // Save mapping configuration
  const handleSaveMapping = () => {
    const mappingConfig = {
      timestamp: new Date().toISOString(),
      mappings: fieldMappings
    };
    
    // Save to localStorage for now - in production this would go to a database
    localStorage.setItem('plaid-dealsheet-mapping', JSON.stringify(mappingConfig));
    alert('Mapping configuration saved successfully!');
  };

  // Export mapping as JSON
  const handleExportMapping = () => {
    const mappingConfig = {
      timestamp: new Date().toISOString(),
      mappings: fieldMappings,
      incomeCategories: incomeCategories.map(cat => ({
        plaidCategory: cat.detailed,
        dealSheetField: fieldMappings[cat.id] || cat.dealSheetField,
        doNotMap: (fieldMappings[cat.id] || cat.dealSheetField) === 'do_not_map'
      })),
      expenseCategories: allCategories.map(cat => ({
        plaidCategory: cat.detailed,
        dealSheetField: fieldMappings[cat.id || cat.detailed] || cat.dealSheetField,
        doNotMap: (fieldMappings[cat.id || cat.detailed] || cat.dealSheetField) === 'do_not_map'
      }))
    };
    
    const dataStr = JSON.stringify(mappingConfig, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plaid-dealsheet-mapping.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const incomeCategories = [
    { id: 'INCOME_DIVIDENDS', primary: 'INCOME', detailed: 'INCOME_DIVIDENDS', dealSheetField: 'dividends', formField: 'dividends / coApplicantDividends', description: 'Dividends from investment accounts' },
    { id: 'INCOME_INTEREST_EARNED', primary: 'INCOME', detailed: 'INCOME_INTEREST_EARNED', dealSheetField: 'otherIncome', formField: 'otherIncome / coApplicantOtherIncome', description: 'Income from interest on savings accounts' },
    { id: 'INCOME_RETIREMENT_PENSION', primary: 'INCOME', detailed: 'INCOME_RETIREMENT_PENSION', dealSheetField: 'retirement', formField: 'retirement / coApplicantRetirement', description: 'Income from pension payments' },
    { id: 'INCOME_TAX_REFUND', primary: 'INCOME', detailed: 'INCOME_TAX_REFUND', dealSheetField: 'otherIncome', formField: 'otherIncome / coApplicantOtherIncome', description: 'Income from tax refunds' },
    { id: 'INCOME_UNEMPLOYMENT', primary: 'INCOME', detailed: 'INCOME_UNEMPLOYMENT', dealSheetField: 'unemployment', formField: 'unemployment / coApplicantUnemployment', description: 'Income from unemployment benefits, including unemployment insurance and healthcare' },
    { id: 'INCOME_WAGES', primary: 'INCOME', detailed: 'INCOME_WAGES', dealSheetField: 'netMonthlyEmploymentIncome', formField: 'netMonthlyEmploymentIncome / coApplicantNetMonthlyIncome', description: 'Income from salaries, gig-economy work, and tips earned' },
    { id: 'INCOME_OTHER_INCOME', primary: 'INCOME', detailed: 'INCOME_OTHER_INCOME', dealSheetField: 'otherIncome', formField: 'otherIncome / coApplicantOtherIncome', description: 'Other miscellaneous income, including alimony, social security, child support, and rental' }
  ];

  const allCategories = [
    // TRANSFER_IN
    { id: 'TRANSFER_IN_CASH_ADVANCES_AND_LOANS', primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_CASH_ADVANCES_AND_LOANS', dealSheetField: 'otherIncome', description: 'Loans and cash advances deposited into a bank account' },
    { id: 'TRANSFER_IN_DEPOSIT', primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_DEPOSIT', dealSheetField: 'otherIncome', description: 'Cash, checks, and ATM deposits into a bank account' },
    { id: 'TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS', primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS', dealSheetField: 'otherIncome', description: 'Inbound transfers to an investment or retirement account' },
    { id: 'TRANSFER_IN_SAVINGS', primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_SAVINGS', dealSheetField: 'otherIncome', description: 'Inbound transfers to a savings account' },
    { id: 'TRANSFER_IN_ACCOUNT_TRANSFER', primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER', dealSheetField: 'otherIncome', description: 'General inbound transfers from another account' },
    { id: 'TRANSFER_IN_OTHER_TRANSFER_IN', primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_OTHER_TRANSFER_IN', dealSheetField: 'otherIncome', description: 'Other miscellaneous inbound transactions' },
    
    // TRANSFER_OUT
    { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS', dealSheetField: 'Miscellaneous', description: 'Transfers to an investment or retirement account, including investment apps such as Acorns, Betterment' },
    { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_SAVINGS', dealSheetField: 'Miscellaneous', description: 'Outbound transfers to savings accounts' },
    { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_WITHDRAWAL', dealSheetField: 'Miscellaneous', description: 'Withdrawals from a bank account' },
    { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER', dealSheetField: 'Miscellaneous', description: 'General outbound transfers to another account' },
    { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_OTHER_TRANSFER_OUT', dealSheetField: 'Miscellaneous', description: 'Other miscellaneous outbound transactions' },
    
    // LOAN_PAYMENTS
    { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CAR_PAYMENT', dealSheetField: 'Auto Payments', description: 'Car loans and leases' },
    { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT', dealSheetField: 'Debt Other', description: 'Payments to a credit card. These are positive amounts for credit card subtypes and negative for depository subtypes' },
    { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT', dealSheetField: 'Private Student Loans (non-deferred)', description: 'Personal loans, including cash advances and buy now pay later repayments' },
    { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_MORTGAGE_PAYMENT', dealSheetField: 'Housing Payment', description: 'Payments on mortgages' },
    { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT', dealSheetField: 'Gov\'t Student Loans (non-deferred)', description: 'Payments on student loans. For college tuition, refer to "General Services - Education"' },
    { primary: 'LOAN_PAYMENTS', detailed: 'LOAN_PAYMENTS_OTHER_PAYMENT', dealSheetField: 'Debt Other', description: 'Other miscellaneous debt payments' },
    
    // BANK_FEES
    { primary: 'BANK_FEES', detailed: 'BANK_FEES_ATM_FEES', dealSheetField: 'Miscellaneous', description: 'Fees incurred for out-of-network ATMs' },
    { primary: 'BANK_FEES', detailed: 'BANK_FEES_FOREIGN_TRANSACTION_FEES', dealSheetField: 'Miscellaneous', description: 'Fees incurred on non-domestic transactions' },
    { primary: 'BANK_FEES', detailed: 'BANK_FEES_INSUFFICIENT_FUNDS', dealSheetField: 'Miscellaneous', description: 'Fees relating to insufficient funds' },
    { primary: 'BANK_FEES', detailed: 'BANK_FEES_INTEREST_CHARGE', dealSheetField: 'Miscellaneous', description: 'Fees incurred for interest on purchases, including not-paid-in-full or interest on cash advances' },
    { primary: 'BANK_FEES', detailed: 'BANK_FEES_OVERDRAFT_FEES', dealSheetField: 'Miscellaneous', description: 'Fees incurred when an account is in overdraft' },
    { primary: 'BANK_FEES', detailed: 'BANK_FEES_OTHER_BANK_FEES', dealSheetField: 'Miscellaneous', description: 'Other miscellaneous bank fees' },
    
    // ENTERTAINMENT
    { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_CASINOS_AND_GAMBLING', dealSheetField: 'Entertainment', description: 'Gambling, casinos, and sports betting' },
    { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_MUSIC_AND_AUDIO', dealSheetField: 'Entertainment', description: 'Digital and in-person music purchases, including music streaming services' },
    { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS', dealSheetField: 'Entertainment', description: 'Purchases made at sporting events, music venues, concerts, museums, and amusement parks' },
    { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_TV_AND_MOVIES', dealSheetField: 'Entertainment', description: 'In home movie streaming services and movie theaters' },
    { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_VIDEO_GAMES', dealSheetField: 'Entertainment', description: 'Digital and in-person video game purchases' },
    { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_OTHER_ENTERTAINMENT', dealSheetField: 'Entertainment', description: 'Other miscellaneous entertainment purchases, including night life and adult entertainment' },
    
    // FOOD_AND_DRINK
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR', dealSheetField: 'Eating Out', description: 'Beer, Wine & Liquor Stores' },
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_COFFEE', dealSheetField: 'Eating Out', description: 'Purchases at coffee shops or cafes' },
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_FAST_FOOD', dealSheetField: 'Eating Out', description: 'Dining expenses for fast food chains' },
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES', dealSheetField: 'Groceries', description: 'Purchases for fresh produce and groceries, including farmers\' markets' },
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_RESTAURANT', dealSheetField: 'Eating Out', description: 'Dining expenses for restaurants, bars, gastropubs, and diners' },
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_VENDING_MACHINES', dealSheetField: 'Eating Out', description: 'Purchases made at vending machine operators' },
    { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK', dealSheetField: 'Eating Out', description: 'Other miscellaneous food and drink, including desserts, juice bars, and delis' },
    
    // GENERAL_MERCHANDISE
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS', dealSheetField: 'Entertainment', description: 'Books, magazines, and news ' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES', dealSheetField: 'Clothing', description: 'Apparel, shoes, and jewelry' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_CONVENIENCE_STORES', dealSheetField: 'Household Items', description: 'Purchases at convenience stores' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_DEPARTMENT_STORES', dealSheetField: 'Household Items', description: 'Retail stores with wide ranges of consumer goods, typically specializing in clothing and home goods' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_DISCOUNT_STORES', dealSheetField: 'Household Items', description: 'Stores selling goods at a discounted price' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_ELECTRONICS', dealSheetField: 'Household Items', description: 'Electronics stores and websites' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES', dealSheetField: 'Gifts', description: 'Photo, gifts, cards, and floral stores' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_OFFICE_SUPPLIES', dealSheetField: 'Household Items', description: 'Stores that specialize in office goods' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES', dealSheetField: 'Household Items', description: 'Multi-purpose e-commerce platforms such as Etsy, Ebay and Amazon' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_PET_SUPPLIES', dealSheetField: 'Pet Care', description: 'Pet supplies and pet food' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_SPORTING_GOODS', dealSheetField: 'Entertainment', description: 'Sporting goods, camping gear, and outdoor equipment' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_SUPERSTORES', dealSheetField: 'Household Items', description: 'Superstores such as Target and Walmart, selling both groceries and general merchandise' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_TOBACCO_AND_VAPE', dealSheetField: 'Personal Care', description: 'Purchases for tobacco and vaping products' },
    { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE', dealSheetField: 'Household Items', description: 'Other miscellaneous merchandise, including toys, hobbies, and arts and crafts' },
    
    // HOME_IMPROVEMENT
    { primary: 'HOME_IMPROVEMENT', detailed: 'HOME_IMPROVEMENT_FURNITURE', dealSheetField: 'Household Items', description: 'Furniture, bedding, and home accessories' },
    { primary: 'HOME_IMPROVEMENT', detailed: 'HOME_IMPROVEMENT_HARDWARE', dealSheetField: 'Household Items', description: 'Building materials, hardware stores, paint, and wallpaper' },
    { primary: 'HOME_IMPROVEMENT', detailed: 'HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE', dealSheetField: 'Repairs/Maintenance', description: 'Plumbing, lighting, gardening, and roofing' },
    { primary: 'HOME_IMPROVEMENT', detailed: 'HOME_IMPROVEMENT_SECURITY', dealSheetField: 'Household Items', description: 'Home security system purchases' },
    { primary: 'HOME_IMPROVEMENT', detailed: 'HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT', dealSheetField: 'Household Items', description: 'Other miscellaneous home purchases, including pool installation and pest control' },
    
    // MEDICAL
    { primary: 'MEDICAL', detailed: 'MEDICAL_DENTAL_CARE', dealSheetField: 'Medical Care', description: 'Dentists and general dental care' },
    { primary: 'MEDICAL', detailed: 'MEDICAL_EYE_CARE', dealSheetField: 'Medical Care', description: 'Optometrists, contacts, and glasses stores' },
    { primary: 'MEDICAL', detailed: 'MEDICAL_NURSING_CARE', dealSheetField: 'Nursing Care', description: 'Nursing care and facilities' },
    { primary: 'MEDICAL', detailed: 'MEDICAL_PHARMACIES_AND_SUPPLEMENTS', dealSheetField: 'Prescriptions/Medical Exp', description: 'Pharmacies and nutrition shops' },
    { primary: 'MEDICAL', detailed: 'MEDICAL_PRIMARY_CARE', dealSheetField: 'Medical Care', description: 'Doctors and physicians' },
    { primary: 'MEDICAL', detailed: 'MEDICAL_VETERINARY_SERVICES', dealSheetField: 'Pet Care', description: 'Prevention and care procedures for animals' },
    { primary: 'MEDICAL', detailed: 'MEDICAL_OTHER_MEDICAL', dealSheetField: 'Medical Care', description: 'Other miscellaneous medical, including blood work, hospitals, and ambulances' },
    
    // PERSONAL_CARE
    { primary: 'PERSONAL_CARE', detailed: 'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS', dealSheetField: 'Gym', description: 'Gyms, fitness centers, and workout classes' },
    { primary: 'PERSONAL_CARE', detailed: 'PERSONAL_CARE_HAIR_AND_BEAUTY', dealSheetField: 'Hair Care', description: 'Manicures, haircuts, waxing, spa/massages, and bath and beauty products ' },
    { primary: 'PERSONAL_CARE', detailed: 'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING', dealSheetField: 'Laundry', description: 'Wash and fold, and dry cleaning expenses' },
    { primary: 'PERSONAL_CARE', detailed: 'PERSONAL_CARE_OTHER_PERSONAL_CARE', dealSheetField: 'Personal Care', description: 'Other miscellaneous personal care, including mental health apps and services' },
    
    // GENERAL_SERVICES
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING', dealSheetField: 'Miscellaneous', description: 'Financial planning, and tax and accounting services' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_AUTOMOTIVE', dealSheetField: 'Repairs/Maintenance', description: 'Oil changes, car washes, repairs, and towing' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_CHILDCARE', dealSheetField: 'Daycare/Child Expenses', description: 'Babysitters and daycare' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_CONSULTING_AND_LEGAL', dealSheetField: 'Miscellaneous', description: 'Consulting and legal services' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_EDUCATION', dealSheetField: 'Miscellaneous', description: 'Elementary, high school, professional schools, and college tuition' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_INSURANCE', dealSheetField: 'Health/Life Insurance', description: 'Insurance for auto, home, and healthcare' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_POSTAGE_AND_SHIPPING', dealSheetField: 'Miscellaneous', description: 'Mail, packaging, and shipping services' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_STORAGE', dealSheetField: 'Miscellaneous', description: 'Storage services and facilities' },
    { primary: 'GENERAL_SERVICES', detailed: 'GENERAL_SERVICES_OTHER_GENERAL_SERVICES', dealSheetField: 'Miscellaneous', description: 'Other miscellaneous services, including advertising and cloud storage ' },
    
    // GOVERNMENT_AND_NON_PROFIT
    { primary: 'GOVERNMENT_AND_NON_PROFIT', detailed: 'GOVERNMENT_AND_NON_PROFIT_DONATIONS', dealSheetField: 'Charity Donations', description: 'Charitable, political, and religious donations' },
    { primary: 'GOVERNMENT_AND_NON_PROFIT', detailed: 'GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES', dealSheetField: 'Miscellaneous', description: 'Government departments and agencies, such as driving licences, and passport renewal' },
    { primary: 'GOVERNMENT_AND_NON_PROFIT', detailed: 'GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT', dealSheetField: 'Back Taxes', description: 'Tax payments, including income and property taxes' },
    { primary: 'GOVERNMENT_AND_NON_PROFIT', detailed: 'GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT', dealSheetField: 'Miscellaneous', description: 'Other miscellaneous government and non-profit agencies' },
    
    // TRANSPORTATION
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_BIKES_AND_SCOOTERS', dealSheetField: 'Commuting', description: 'Bike and scooter rentals' },
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_GAS', dealSheetField: 'Gasoline', description: 'Purchases at a gas station' },
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_PARKING', dealSheetField: 'Parking', description: 'Parking fees and expenses' },
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_PUBLIC_TRANSIT', dealSheetField: 'Commuting', description: 'Public transportation, including rail and train, buses, and metro' },
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES', dealSheetField: 'Commuting', description: 'Taxi and ride share services' },
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_TOLLS', dealSheetField: 'Commuting', description: 'Toll expenses' },
    { primary: 'TRANSPORTATION', detailed: 'TRANSPORTATION_OTHER_TRANSPORTATION', dealSheetField: 'Commuting', description: 'Other miscellaneous transportation expenses' },
    
    // TRAVEL
    { primary: 'TRAVEL', detailed: 'TRAVEL_FLIGHTS', dealSheetField: 'Entertainment', description: 'Airline expenses' },
    { primary: 'TRAVEL', detailed: 'TRAVEL_LODGING', dealSheetField: 'Entertainment', description: 'Hotels, motels, and hosted accommodation such as Airbnb' },
    { primary: 'TRAVEL', detailed: 'TRAVEL_RENTAL_CARS', dealSheetField: 'Entertainment', description: 'Rental cars, charter buses, and trucks' },
    { primary: 'TRAVEL', detailed: 'TRAVEL_OTHER_TRAVEL', dealSheetField: 'Entertainment', description: 'Other miscellaneous travel expenses' },
    
    // RENT_AND_UTILITIES
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY', dealSheetField: 'Gas/Electric/Oil', description: 'Gas and electricity bills' },
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_INTERNET_AND_CABLE', dealSheetField: 'Cable/Satellite/Internet', description: 'Internet and cable bills' },
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_RENT', dealSheetField: 'Housing Payment', description: 'Rent payment' },
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT', dealSheetField: 'Water/Sewer/Garbage', description: 'Sewage and garbage disposal bills' },
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_TELEPHONE', dealSheetField: 'Phone (incl. cell)', description: 'Cell phone bills' },
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_WATER', dealSheetField: 'Water/Sewer/Garbage', description: 'Water bills' },
    { primary: 'RENT_AND_UTILITIES', detailed: 'RENT_AND_UTILITIES_OTHER_UTILITIES', dealSheetField: 'Gas/Electric/Oil', description: 'Other miscellaneous utility bills' }
  ];

  // Filter categories based on search
  const filteredCategories = allCategories.filter(category => 
    category.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.detailed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.dealSheetField.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIncomeCategories = incomeCategories.filter(category =>
    category.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.detailed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.dealSheetField.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expenseCategories = filteredCategories.filter(cat => cat.primary !== 'INCOME');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Plaid Personal Finance Category Taxonomy - Deal Sheet Field Mapping
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto mb-6">
                Complete mapping of all 105+ Plaid transaction categories to Deal Sheet fields based on the official Personal Finance Category Taxonomy.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-6">
                <Input
                  type="text"
                  placeholder="Search categories, fields, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredIncomeCategories.length}</div>
              <div className="text-sm text-gray-600">Income Categories</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{expenseCategories.length}</div>
              <div className="text-sm text-gray-600">Expense Categories</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredCategories.length + filteredIncomeCategories.length}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </Card>
          </div>

          {/* Income Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-green-700">Income Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Primary</th>
                    <th className="text-left p-3 font-medium text-gray-700">Detailed Category</th>
                    <th className="text-left p-3 font-medium text-gray-700">Deal Sheet Field</th>
                    <th className="text-left p-3 font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomeCategories.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {item.primary}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-sm text-blue-600">{item.detailed}</td>
                      <td className="p-3">
                        <Select 
                          value={fieldMappings[item.id] || item.dealSheetField} 
                          onValueChange={(value) => handleMappingChange(item.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {(fieldMappings[item.id] || item.dealSheetField) === 'do_not_map' ? 'Do not map' :
                               dealSheetFields.find(field => field.value === (fieldMappings[item.id] || item.dealSheetField))?.label || item.dealSheetField}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="do_not_map">Do not map</SelectItem>
                            {dealSheetFields
                              .filter(field => field.category === 'Income')
                              .map(field => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Expense Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-red-700">Expense Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Primary</th>
                    <th className="text-left p-3 font-medium text-gray-700">Detailed Category</th>
                    <th className="text-left p-3 font-medium text-gray-700">Deal Sheet Field</th>
                    <th className="text-left p-3 font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseCategories.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${item.primary === 'LOAN_PAYMENTS' ? 'bg-red-50 text-red-700 border-red-200' :
                              item.primary === 'TRANSPORTATION' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              item.primary === 'FOOD_AND_DRINK' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              item.primary === 'RENT_AND_UTILITIES' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              item.primary === 'MEDICAL' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                              item.primary === 'ENTERTAINMENT' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'}
                          `}
                        >
                          {item.primary}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-sm text-blue-600">{item.detailed}</td>
                      <td className="p-3">
                        <Select 
                          value={fieldMappings[item.id || item.detailed] || 
                                dealSheetFields.find(field => field.label === item.dealSheetField)?.value || 
                                item.dealSheetField} 
                          onValueChange={(value) => handleMappingChange(item.id || item.detailed, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {(fieldMappings[item.id || item.detailed] ||
                                dealSheetFields.find(f => f.label === item.dealSheetField)?.value ||
                                item.dealSheetField) === 'do_not_map' ? 'Do not map' :
                               dealSheetFields.find(field =>
                                field.value === (fieldMappings[item.id || item.detailed] ||
                                dealSheetFields.find(f => f.label === item.dealSheetField)?.value ||
                                item.dealSheetField))?.label ||
                               item.dealSheetField}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] overflow-y-auto">
                            <SelectItem value="do_not_map">Do not map</SelectItem>
                            {dealSheetFields
                              .filter(field => field.category !== 'Income')
                              .map(field => (
                                <SelectItem key={field.value} value={field.value}>
                                  <span className="text-xs text-gray-500">{field.category}:</span> {field.label}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Implementation Notes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Implementation Notes</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p><strong>Data Source:</strong> Based on the official Plaid Personal Finance Category Taxonomy with 105+ detailed categories.</p>
              <p><strong>Income Frequency:</strong> Plaid transactions don't directly indicate frequency, but you can infer this from transaction patterns and dates.</p>
              <p><strong>INCOME_OTHER_INCOME Subcategorization:</strong> This Plaid category is broad and may need additional logic to properly categorize into specific deal sheet fields like alimony, child support, etc.</p>
              <p><strong>Transaction Direction:</strong> Income categories should be filtered to positive amounts (money coming in), expense categories to negative amounts (money going out).</p>
              <p><strong>Date Range:</strong> Consider using 30-90 day lookback periods to calculate monthly averages for more accurate estimates.</p>
              <p><strong>Manual Review:</strong> Some transactions may require manual categorization or review, especially for ambiguous categories like "Other Income" or "General Merchandise".</p>
              <p><strong>Insurance Categorization:</strong> GENERAL_SERVICES_INSURANCE requires context-based detection to properly categorize as auto, home, or health insurance.</p>
              <p><strong>Search Feature:</strong> Use the search bar above to quickly find specific categories or deal sheet fields.</p>
            </div>
          </Card>

          {/* CSV Data Source */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Data Source</h2>
            <div className="text-sm text-gray-600">
              <p className="mb-2">This mapping is based on the official Plaid Personal Finance Category Taxonomy CSV file:</p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">transactions-personal-finance-category-taxonomy.csv</p>
              <p className="mt-2">Updated to include all primary and detailed categories with their official descriptions and suggested deal sheet field mappings.</p>
            </div>
          </Card>

          {/* Mapping Control Buttons */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Mapping Controls</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleSaveMapping}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Mapping Configuration
              </Button>
              <Button
                onClick={handleExportMapping}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Export Mapping as JSON
              </Button>
              {Object.keys(fieldMappings).length > 0 && (
                <span className="text-sm text-gray-600 self-center">
                  {Object.keys(fieldMappings).length} mappings modified
                </span>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
            >
              Go Back
            </Button>
            <Button
              onClick={() => window.location.href = '/your-plan/deal-sheet'}
            >
              View Deal Sheet
            </Button>
            <Button
              onClick={() => window.location.href = '/results/bank'}
              variant="secondary"
            >
              Test with Bank Data
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}