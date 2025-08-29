'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import ClickableLabel from '@/components/ClickableLabel';
import { mapPlaidToDealsSheet, getFieldDisplayName, formatCurrency } from '@/lib/plaid-mapping';

// Dynamically import session-store to avoid SSR issues
const getPlaidData = typeof window !== 'undefined' 
  ? require('@/lib/session-store').getPlaidData 
  : () => null;

export default function DealSheetPage() {
  const [plaidData, setPlaidData] = useState(null);
  const [mappedData, setMappedData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [formData, setFormData] = useState({
    // Monthly Expenditure Details
    totalMonthlyIncome: '',
    programCost: '',
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
    coApplicantComments: ''
  });

  // Load Plaid data on component mount
  useEffect(() => {
    try {
      const storedPlaidData = getPlaidData();
      if (storedPlaidData && storedPlaidData.data) {
        setPlaidData(storedPlaidData.data);
        
        // Map Plaid data to deal sheet format
        if (storedPlaidData.data.transactions && storedPlaidData.data.accounts) {
          const mapped = mapPlaidToDealsSheet(
            storedPlaidData.data.transactions,
            storedPlaidData.data.accounts
          );
          setMappedData(mapped);
          
          // Update form data with mapped values
          setFormData(prev => ({
            ...prev,
            ...mapped.income,
            ...mapped.expenses
          }));
        }
      }
    } catch (error) {
      console.error('Error loading Plaid data:', error);
    }
  }, []);

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
    console.log('Saving deal sheet data:', formData);
  };

  const handleCancel = () => {
    console.log('Canceling changes');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Deal Sheet
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
                Your personalized deal sheet with all the details of your debt settlement plan.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="space-y-8">
            {/* Monthly Expenditure Details */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">$</span>
                </div>
                <h2 className="text-lg font-semibold text-green-700">Monthly Expenditure Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Total Monthly Income</Label>
                  <div className="text-lg font-semibold">$0.00</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Program Cost</Label>
                  <div className="text-lg font-semibold">$0.00</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Total Expenses</Label>
                  <div className="text-lg font-semibold">$0.00</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Total Monthly Expense (With Program Cost)</Label>
                  <div className="text-lg font-semibold">$0.00</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Available Funds</Label>
                  <div className="text-lg font-semibold">$0.00</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Monthly Debt to Income Ratio (With Program)</Label>
                  <div className="text-lg font-semibold">0%</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Monthly Debt to Income Ratio (Without Program)</Label>
                  <div className="text-lg font-semibold">0%</div>
                </div>
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
                      <Input
                        placeholder="$0.00"
                        value={formData.netMonthlyEmploymentIncome ? formatCurrency(formData.netMonthlyEmploymentIncome) : ''}
                        onChange={(e) => handleInputChange('netMonthlyEmploymentIncome', e.target.value)}
                      />
                      {mappedData && mappedData.income.netMonthlyEmploymentIncome > 0 && (
                        <p className="text-xs text-green-600">
                          Auto-filled from Plaid: {formatCurrency(mappedData.income.netMonthlyEmploymentIncome)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <ClickableLabel 
                        hasData={mappedData && mappedData.transactionDetails.selfEmployment?.length > 0}
                        onClick={() => handleFieldClick('selfEmployment')}
                      >
                        Self Employment
                      </ClickableLabel>
                      <Input
                        placeholder="$0.00"
                        value={formData.selfEmployment ? formatCurrency(formData.selfEmployment) : ''}
                        onChange={(e) => handleInputChange('selfEmployment', e.target.value)}
                      />
                      {mappedData && mappedData.income.selfEmployment > 0 && (
                        <p className="text-xs text-green-600">
                          Auto-filled from Plaid: {formatCurrency(mappedData.income.selfEmployment)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Social Security</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.socialSecurity}
                        onChange={(e) => handleInputChange('socialSecurity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Unemployment</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.unemployment}
                        onChange={(e) => handleInputChange('unemployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Alimony</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.alimony}
                        onChange={(e) => handleInputChange('alimony', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Child Support</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.childSupport}
                        onChange={(e) => handleInputChange('childSupport', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Govt. Assistance</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.otherGovtAssistance}
                        onChange={(e) => handleInputChange('otherGovtAssistance', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Annuities</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.annuities}
                        onChange={(e) => handleInputChange('annuities', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Dividends</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.dividends}
                        onChange={(e) => handleInputChange('dividends', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Retirement</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.retirement}
                        onChange={(e) => handleInputChange('retirement', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Income</Label>
                      <Input
                        placeholder="$0.00"
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
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantNetMonthlyIncome}
                        onChange={(e) => handleInputChange('coApplicantNetMonthlyIncome', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Self Employment</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantSelfEmployment}
                        onChange={(e) => handleInputChange('coApplicantSelfEmployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Social Security</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantSocialSecurity}
                        onChange={(e) => handleInputChange('coApplicantSocialSecurity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Unemployment</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantUnemployment}
                        onChange={(e) => handleInputChange('coApplicantUnemployment', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Alimony</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantAlimony}
                        onChange={(e) => handleInputChange('coApplicantAlimony', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Child Support</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantChildSupport}
                        onChange={(e) => handleInputChange('coApplicantChildSupport', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Govt. Assistance</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantOtherGovtAssistance}
                        onChange={(e) => handleInputChange('coApplicantOtherGovtAssistance', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Annuities</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantAnnuities}
                        onChange={(e) => handleInputChange('coApplicantAnnuities', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Dividends</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantDividends}
                        onChange={(e) => handleInputChange('coApplicantDividends', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Retirement</Label>
                      <Input
                        placeholder="$0.00"
                        value={formData.coApplicantRetirement}
                        onChange={(e) => handleInputChange('coApplicantRetirement', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Other Income</Label>
                      <Input
                        placeholder="$0.00"
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
                      <span className="text-gray-400">⌄</span>
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
                        <Label className="text-sm text-gray-600">Housing Payment</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Home Owners Insurance</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Secondary Housing Payment</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Medical */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Medical
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Health/Life Insurance</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Medical Care</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Prescriptions/Medical Exp</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Transportation
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Auto Payments</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Auto Insurance</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Repairs/Maintenance</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Gasoline</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Parking</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Commuting</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Food
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Groceries</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Eating Out</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Utilities */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Utilities
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Average Gas/Electricity/Oil</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Average Phone Bill (Including Cell)</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Average Water/Sewer/Garbage</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Cable/Satellite/Internet Bill</Label>
                        <Input placeholder="$0.00" />
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
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Debt Expenses Other</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Govt. Student Loans (non-deferred status)</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Private Student Loans (non-deferred status)</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Medical Debt</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Legal & Court Ordered Expenses */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Legal & Court Ordered Expenses
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Child Support</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Alimony</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Judgment Payments</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Back Taxes</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Personal Care */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Personal Care
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Clothing</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Household Items</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Entertainment</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Pet Care</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Gifts</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Toiletries</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Hair Care</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Laundry</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Gym</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Personal Care</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Charity Donations</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Dependent Care */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Dependent Care
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Daycare/Child Expenses</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Nursing Care</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>

                  {/* Other Expenses */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center justify-between cursor-pointer">
                      Other Expenses
                      <span className="text-gray-400">⌄</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Misc</Label>
                        <Input placeholder="$0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Funds Available</Label>
                        <Input placeholder="$0.00" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Unmapped Data Section */}
            {mappedData && mappedData.unmapped && mappedData.unmapped.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⚠</span>
                  </div>
                  <h2 className="text-lg font-semibold text-yellow-700">
                    Unmapped Transactions ({mappedData.unmapped.length})
                  </h2>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  These transactions from your Plaid data could not be automatically mapped to deal sheet fields:
                </p>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {mappedData.unmapped.slice(0, 20).map((transaction, index) => (
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
                  {mappedData.unmapped.length > 20 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      ... and {mappedData.unmapped.length - 20} more transactions
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
            </div>
          </div>
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