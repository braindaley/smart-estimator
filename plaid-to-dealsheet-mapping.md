# Plaid Transaction Categories to Deal Sheet Field Mapping

This table maps Plaid transaction categories to the corresponding fields in the Deal Sheet form at `/your-plan/deal-sheet`.

## Income Categories

| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Form Field Name |
|------------------------|------------------------|-------------------|----------------|
| INCOME | INCOME_WAGES | Net Monthly Employment Income | `netMonthlyEmploymentIncome` / `coApplicantNetMonthlyIncome` |
| INCOME | INCOME_OTHER_INCOME (self-employment portion) | Self Employment | `selfEmployment` / `coApplicantSelfEmployment` |
| INCOME | INCOME_OTHER_INCOME (social security portion) | Social Security | `socialSecurity` / `coApplicantSocialSecurity` |
| INCOME | INCOME_UNEMPLOYMENT | Unemployment | `unemployment` / `coApplicantUnemployment` |
| INCOME | INCOME_OTHER_INCOME (alimony portion) | Alimony | `alimony` / `coApplicantAlimony` |
| INCOME | INCOME_OTHER_INCOME (child support portion) | Child Support | `childSupport` / `coApplicantChildSupport` |
| INCOME | INCOME_OTHER_INCOME (government assistance portion) | Other Govt. Assistance | `otherGovtAssistance` / `coApplicantOtherGovtAssistance` |
| INCOME | INCOME_OTHER_INCOME (annuities portion) | Annuities | `annuities` / `coApplicantAnnuities` |
| INCOME | INCOME_DIVIDENDS | Dividends | `dividends` / `coApplicantDividends` |
| INCOME | INCOME_RETIREMENT_PENSION | Retirement | `retirement` / `coApplicantRetirement` |
| INCOME | INCOME_INTEREST_EARNED | Other Income | `otherIncome` / `coApplicantOtherIncome` |
| INCOME | INCOME_TAX_REFUND | Other Income | `otherIncome` / `coApplicantOtherIncome` |

## Monthly Expenses Categories

### Housing
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_RENT | Housing Payment | Primary housing payment |
| LOAN_PAYMENTS | LOAN_PAYMENTS_MORTGAGE_PAYMENT | Housing Payment | Mortgage payments |
| GENERAL_SERVICES | GENERAL_SERVICES_INSURANCE (homeowners) | Home Owners Insurance | Homeowners/renters insurance |
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_RENT (secondary property) | Secondary Housing Payment | Second home/rental property |

### Medical
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| GENERAL_SERVICES | GENERAL_SERVICES_INSURANCE (health/life) | Health/Life Insurance | Health and life insurance premiums |
| MEDICAL | MEDICAL_PRIMARY_CARE | Medical Care | Doctor visits, medical services |
| MEDICAL | MEDICAL_PHARMACY | Prescriptions/Medical Exp | Prescription medications and medical expenses |
| MEDICAL | MEDICAL_DENTAL_CARE | Medical Care | Dental care expenses |
| MEDICAL | MEDICAL_EYE_CARE | Medical Care | Vision/eye care |
| MEDICAL | MEDICAL_VETERINARY_SERVICES | Medical Care | Pet medical expenses |

### Transportation
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| LOAN_PAYMENTS | LOAN_PAYMENTS_CAR_PAYMENT | Auto Payments | Car loan payments |
| GENERAL_SERVICES | GENERAL_SERVICES_INSURANCE (auto) | Auto Insurance | Auto insurance premiums |
| TRANSPORTATION | TRANSPORTATION_GAS | Gasoline | Fuel costs |
| TRANSPORTATION | TRANSPORTATION_PARKING | Parking | Parking fees |
| TRANSPORTATION | TRANSPORTATION_PUBLIC_TRANSPORTATION | Commuting | Public transit costs |
| TRANSPORTATION | TRANSPORTATION_TAXI | Commuting | Rideshare/taxi costs |
| TRANSPORTATION | TRANSPORTATION_TOLLS | Commuting | Highway tolls |
| GENERAL_SERVICES | GENERAL_SERVICES_AUTOMOTIVE | Repairs/Maintenance | Car repairs and maintenance |

### Food
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| FOOD_AND_DRINK | FOOD_AND_DRINK_GROCERIES | Groceries | Grocery store purchases |
| FOOD_AND_DRINK | FOOD_AND_DRINK_RESTAURANT | Eating Out | Restaurant meals |
| FOOD_AND_DRINK | FOOD_AND_DRINK_FAST_FOOD | Eating Out | Fast food purchases |
| FOOD_AND_DRINK | FOOD_AND_DRINK_COFFEE | Eating Out | Coffee shop purchases |
| FOOD_AND_DRINK | FOOD_AND_DRINK_ALCOHOL_AND_BARS | Eating Out | Bar/alcohol purchases |

### Utilities
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_GAS_AND_ELECTRICITY | Gas/Electric/Oil | Gas and electric utilities |
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_INTERNET_AND_CABLE | Cable/Satellite/Internet | Internet and cable services |
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_TELEPHONE | Phone (incl. cell) | Phone services |
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_WATER_AND_SEWER | Water/Sewer/Garbage | Water and sewer services |
| RENT_AND_UTILITIES | RENT_AND_UTILITIES_OTHER_UTILITIES | Gas/Electric/Oil | Other utility services |

### Debt (not in program)
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| LOAN_PAYMENTS | LOAN_PAYMENTS_OTHER_PAYMENT | Debt Other | Other debt payments |
| LOAN_PAYMENTS | LOAN_PAYMENTS_STUDENT_LOAN | Gov't Student Loans (non-deferred) | Government student loans |
| LOAN_PAYMENTS | LOAN_PAYMENTS_PERSONAL_LOAN | Private Student Loans (non-deferred) | Private loans including student loans |
| MEDICAL | (Outstanding medical bills) | Medical Debt | Unpaid medical expenses |

### Legal & Court-Ordered
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| TRANSFER_OUT | TRANSFER_OUT_CHILD_SUPPORT | Child Support | Court-ordered child support |
| TRANSFER_OUT | TRANSFER_OUT_ALIMONY | Alimony | Court-ordered alimony |
| GOVERNMENT_AND_NON_PROFIT | GOVERNMENT_AND_NON_PROFIT_COURT_FEES | Judgment Payments | Legal judgments and court fees |
| GOVERNMENT_AND_NON_PROFIT | GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT | Back Taxes | Tax payments/back taxes |

### Personal Care
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| GENERAL_MERCHANDISE | GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES | Clothing | Clothing and accessories |
| GENERAL_MERCHANDISE | GENERAL_MERCHANDISE_GENERAL | Household Items | General household items |
| ENTERTAINMENT | (All entertainment categories) | Entertainment | Entertainment expenses |
| MEDICAL | MEDICAL_VETERINARY_SERVICES | Pet Care | Pet-related expenses |
| GENERAL_MERCHANDISE | GENERAL_MERCHANDISE_GIFTS | Gifts | Gift purchases |
| PERSONAL_CARE | PERSONAL_CARE_PERSONAL_CARE_SERVICES | Toiletries | Personal care items |
| PERSONAL_CARE | PERSONAL_CARE_HAIR_AND_BEAUTY | Hair Care | Hair and beauty services |
| GENERAL_SERVICES | GENERAL_SERVICES_LAUNDRY_AND_DRY_CLEANING | Laundry | Laundry services |
| GENERAL_SERVICES | GENERAL_SERVICES_GYMS_AND_FITNESS_CENTERS | Gym | Fitness memberships |
| PERSONAL_CARE | PERSONAL_CARE_PERSONAL_CARE_SERVICES | Personal Care | Personal care services |
| GOVERNMENT_AND_NON_PROFIT | GOVERNMENT_AND_NON_PROFIT_DONATIONS | Charity Donations | Charitable giving |

### Dependent Care
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| GENERAL_SERVICES | GENERAL_SERVICES_CHILD_CARE | Daycare/Child Expenses | Childcare services |
| MEDICAL | MEDICAL_MENTAL_HEALTH | Nursing Care | Mental health/nursing care |

### Other Expenses
| Plaid Primary Category | Plaid Detailed Category | Deal Sheet Field | Notes |
|------------------------|------------------------|-------------------|-------|
| (Any uncategorized) | (Any uncategorized) | Misc | Miscellaneous expenses |
| (Calculated field) | (Calculated field) | Funds Available | Computed based on income minus expenses |

## Implementation Notes

1. **Income Frequency**: Plaid transactions don't directly indicate frequency, but you can infer this from transaction patterns and dates.

2. **INCOME_OTHER_INCOME Subcategorization**: This Plaid category is broad and may need additional logic to properly categorize into specific deal sheet fields like alimony, child support, etc.

3. **Multiple Mapping**: Some Plaid categories may map to multiple deal sheet fields depending on context.

4. **Transaction Direction**: 
   - Income categories should be filtered to positive amounts (money coming in)
   - Expense categories should be filtered to negative amounts (money going out)

5. **Date Range**: Consider using 30-90 day lookback periods to calculate monthly averages for more accurate estimates.

6. **Manual Review**: Some transactions may require manual categorization or review, especially for ambiguous categories like "Other Income" or "General Merchandise".