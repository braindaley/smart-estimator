'use client';

import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MappingTablePage() {
  const incomeCategories = [
    { plaidCategory: 'INCOME → Wages', dealSheetField: 'Net Monthly Employment Income', formField: 'netMonthlyEmploymentIncome / coApplicantNetMonthlyIncome' },
    { plaidCategory: 'INCOME → Other Income (self-employment)', dealSheetField: 'Self Employment', formField: 'selfEmployment / coApplicantSelfEmployment' },
    { plaidCategory: 'INCOME → Other Income (social security)', dealSheetField: 'Social Security', formField: 'socialSecurity / coApplicantSocialSecurity' },
    { plaidCategory: 'INCOME → Unemployment', dealSheetField: 'Unemployment', formField: 'unemployment / coApplicantUnemployment' },
    { plaidCategory: 'INCOME → Other Income (alimony)', dealSheetField: 'Alimony', formField: 'alimony / coApplicantAlimony' },
    { plaidCategory: 'INCOME → Other Income (child support)', dealSheetField: 'Child Support', formField: 'childSupport / coApplicantChildSupport' },
    { plaidCategory: 'INCOME → Other Income (government assistance)', dealSheetField: 'Other Govt. Assistance', formField: 'otherGovtAssistance / coApplicantOtherGovtAssistance' },
    { plaidCategory: 'INCOME → Other Income (annuities)', dealSheetField: 'Annuities', formField: 'annuities / coApplicantAnnuities' },
    { plaidCategory: 'INCOME → Dividends', dealSheetField: 'Dividends', formField: 'dividends / coApplicantDividends' },
    { plaidCategory: 'INCOME → Retirement/Pension', dealSheetField: 'Retirement', formField: 'retirement / coApplicantRetirement' },
    { plaidCategory: 'INCOME → Interest Earned', dealSheetField: 'Other Income', formField: 'otherIncome / coApplicantOtherIncome' },
    { plaidCategory: 'INCOME → Tax Refund', dealSheetField: 'Other Income', formField: 'otherIncome / coApplicantOtherIncome' }
  ];

  const expenseCategories = [
    // Housing
    { category: 'Housing', plaidCategory: 'RENT_AND_UTILITIES → Rent', dealSheetField: 'Housing Payment', notes: 'Primary housing payment' },
    { category: 'Housing', plaidCategory: 'LOAN_PAYMENTS → Car Payment (mortgage)', dealSheetField: 'Housing Payment', notes: 'Mortgage payments' },
    { category: 'Housing', plaidCategory: 'GENERAL_SERVICES → Insurance', dealSheetField: 'Home Owners Insurance', notes: 'Homeowners/renters insurance' },
    { category: 'Housing', plaidCategory: 'RENT_AND_UTILITIES → Rent (secondary)', dealSheetField: 'Secondary Housing Payment', notes: 'Second home/rental property' },
    
    // Medical
    { category: 'Medical', plaidCategory: 'GENERAL_SERVICES → Insurance', dealSheetField: 'Health/Life Insurance', notes: 'Health and life insurance premiums' },
    { category: 'Medical', plaidCategory: 'MEDICAL → Primary care', dealSheetField: 'Medical Care', notes: 'Doctor visits, medical services' },
    { category: 'Medical', plaidCategory: 'MEDICAL → Pharmacies and supplements', dealSheetField: 'Prescriptions/Medical Exp', notes: 'Prescription medications' },
    { category: 'Medical', plaidCategory: 'MEDICAL → Dental care', dealSheetField: 'Medical Care', notes: 'Dental care expenses' },
    { category: 'Medical', plaidCategory: 'MEDICAL → Eye care', dealSheetField: 'Medical Care', notes: 'Vision/eye care' },
    { category: 'Medical', plaidCategory: 'MEDICAL → Veterinary services', dealSheetField: 'Medical Care', notes: 'Pet medical expenses' },
    
    // Transportation
    { category: 'Transportation', plaidCategory: 'LOAN_PAYMENTS → Car Payment', dealSheetField: 'Auto Payments', notes: 'Car loan payments' },
    { category: 'Transportation', plaidCategory: 'GENERAL_SERVICES → Insurance', dealSheetField: 'Auto Insurance', notes: 'Auto insurance premiums' },
    { category: 'Transportation', plaidCategory: 'TRANSPORTATION → Gas', dealSheetField: 'Gasoline', notes: 'Fuel costs' },
    { category: 'Transportation', plaidCategory: 'TRANSPORTATION → Parking', dealSheetField: 'Parking', notes: 'Parking fees' },
    { category: 'Transportation', plaidCategory: 'TRANSPORTATION → Public transit', dealSheetField: 'Commuting', notes: 'Public transit costs' },
    { category: 'Transportation', plaidCategory: 'TRANSPORTATION → Taxis and ride shares', dealSheetField: 'Commuting', notes: 'Rideshare/taxi costs' },
    { category: 'Transportation', plaidCategory: 'TRANSPORTATION → Tolls', dealSheetField: 'Commuting', notes: 'Highway tolls' },
    { category: 'Transportation', plaidCategory: 'GENERAL_SERVICES → Automotive', dealSheetField: 'Repairs/Maintenance', notes: 'Car repairs and maintenance' },
    
    // Food
    { category: 'Food', plaidCategory: 'FOOD_AND_DRINK → Groceries', dealSheetField: 'Groceries', notes: 'Grocery store purchases' },
    { category: 'Food', plaidCategory: 'FOOD_AND_DRINK → Restaurants/bars', dealSheetField: 'Eating Out', notes: 'Restaurant meals' },
    { category: 'Food', plaidCategory: 'FOOD_AND_DRINK → Fast food chains', dealSheetField: 'Eating Out', notes: 'Fast food purchases' },
    { category: 'Food', plaidCategory: 'FOOD_AND_DRINK → Coffee shops/cafes', dealSheetField: 'Eating Out', notes: 'Coffee shop purchases' },
    { category: 'Food', plaidCategory: 'FOOD_AND_DRINK → Beer, Wine & Liquor Stores', dealSheetField: 'Eating Out', notes: 'Alcohol purchases' },
    
    // Utilities
    { category: 'Utilities', plaidCategory: 'RENT_AND_UTILITIES → Gas and electricity', dealSheetField: 'Gas/Electric/Oil', notes: 'Gas and electric utilities' },
    { category: 'Utilities', plaidCategory: 'RENT_AND_UTILITIES → Internet and cable', dealSheetField: 'Cable/Satellite/Internet', notes: 'Internet and cable services' },
    { category: 'Utilities', plaidCategory: 'RENT_AND_UTILITIES → Telephone', dealSheetField: 'Phone (incl. cell)', notes: 'Phone services' },
    { category: 'Utilities', plaidCategory: 'RENT_AND_UTILITIES → Water', dealSheetField: 'Water/Sewer/Garbage', notes: 'Water services' },
    { category: 'Utilities', plaidCategory: 'RENT_AND_UTILITIES → Sewage and waste management', dealSheetField: 'Water/Sewer/Garbage', notes: 'Sewer and garbage services' },
    { category: 'Utilities', plaidCategory: 'RENT_AND_UTILITIES → Other utilities', dealSheetField: 'Gas/Electric/Oil', notes: 'Other utility services' },
    
    // Personal Care
    { category: 'Personal Care', plaidCategory: 'GENERAL_MERCHANDISE → Clothing and accessories', dealSheetField: 'Clothing', notes: 'Clothing and accessories' },
    { category: 'Personal Care', plaidCategory: 'GENERAL_MERCHANDISE → Department stores', dealSheetField: 'Household Items', notes: 'General household items' },
    { category: 'Personal Care', plaidCategory: 'ENTERTAINMENT → Music and audio', dealSheetField: 'Entertainment', notes: 'Entertainment expenses' },
    { category: 'Personal Care', plaidCategory: 'ENTERTAINMENT → TV and movies', dealSheetField: 'Entertainment', notes: 'Entertainment expenses' },
    { category: 'Personal Care', plaidCategory: 'ENTERTAINMENT → Sporting events/amusement parks', dealSheetField: 'Entertainment', notes: 'Entertainment expenses' },
    { category: 'Personal Care', plaidCategory: 'GENERAL_MERCHANDISE → Pet supplies', dealSheetField: 'Pet Care', notes: 'Pet-related expenses' },
    { category: 'Personal Care', plaidCategory: 'GENERAL_MERCHANDISE → Gifts and novelties', dealSheetField: 'Gifts', notes: 'Gift purchases' },
    { category: 'Personal Care', plaidCategory: 'PERSONAL_CARE → Hair and beauty', dealSheetField: 'Hair Care', notes: 'Hair and beauty services' },
    { category: 'Personal Care', plaidCategory: 'PERSONAL_CARE → Laundry and dry cleaning', dealSheetField: 'Laundry', notes: 'Laundry services' },
    { category: 'Personal Care', plaidCategory: 'PERSONAL_CARE → Gyms and fitness centers', dealSheetField: 'Gym', notes: 'Fitness memberships' },
    { category: 'Personal Care', plaidCategory: 'PERSONAL_CARE → Other personal care', dealSheetField: 'Personal Care', notes: 'Personal care services' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Plaid to Deal Sheet Mapping
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
                This table shows how Plaid transaction categories map to fields in the Deal Sheet form.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12 space-y-8">
          {/* Income Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-green-700">Income Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Plaid Category</th>
                    <th className="text-left p-3 font-medium text-gray-700">Deal Sheet Field</th>
                    <th className="text-left p-3 font-medium text-gray-700">Form Field Name</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeCategories.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm text-blue-600">{item.plaidCategory}</td>
                      <td className="p-3">{item.dealSheetField}</td>
                      <td className="p-3 font-mono text-sm text-gray-600">{item.formField}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Expense Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-red-700">Monthly Expense Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Category</th>
                    <th className="text-left p-3 font-medium text-gray-700">Plaid Category</th>
                    <th className="text-left p-3 font-medium text-gray-700">Deal Sheet Field</th>
                    <th className="text-left p-3 font-medium text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseCategories.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.category}</td>
                      <td className="p-3 font-mono text-sm text-blue-600">{item.plaidCategory}</td>
                      <td className="p-3">{item.dealSheetField}</td>
                      <td className="p-3 text-sm text-gray-600">{item.notes}</td>
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
              <p><strong>Income Frequency:</strong> Plaid transactions don't directly indicate frequency, but you can infer this from transaction patterns and dates.</p>
              <p><strong>INCOME_OTHER_INCOME Subcategorization:</strong> This Plaid category is broad and may need additional logic to properly categorize into specific deal sheet fields.</p>
              <p><strong>Transaction Direction:</strong> Income categories should be filtered to positive amounts (money coming in), expense categories to negative amounts (money going out).</p>
              <p><strong>Date Range:</strong> Consider using 30-90 day lookback periods to calculate monthly averages for more accurate estimates.</p>
              <p><strong>Manual Review:</strong> Some transactions may require manual categorization or review, especially for ambiguous categories.</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}