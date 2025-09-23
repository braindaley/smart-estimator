'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

interface NarrativeCode {
  code: string;
  description: string;
  includeInSettlement: boolean;
}

interface DebtPortfolioFilters {
  requireActiveAccounts: boolean;
  excludeClosedByNarrativeCodes: boolean;
  requirePositiveBalance: boolean;
  allowScheduledPayments: boolean;
  minimumBalance: number;
  allowRevolvingAccounts: boolean;
  allowInstallmentAccounts: boolean;
}

export default function EquifaxCodesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [narrativeCodes, setNarrativeCodes] = useState<NarrativeCode[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [portfolioFilters, setPortfolioFilters] = useState<DebtPortfolioFilters>({
    requireActiveAccounts: true,
    excludeClosedByNarrativeCodes: true,
    requirePositiveBalance: true,
    allowScheduledPayments: true,
    minimumBalance: 0,
    allowRevolvingAccounts: true,
    allowInstallmentAccounts: true
  });

  // Initialize the narrative codes data
  useEffect(() => {
    // Clear any old industry codes data
    localStorage.removeItem('equifax-industry-codes');

    // Load saved configuration from localStorage if it exists
    const savedConfig = localStorage.getItem('equifax-narrative-codes');
    const savedFilters = localStorage.getItem('debt-portfolio-filters');
    let shouldInitializeDefaults = true;

    // Load portfolio filters if they exist
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setPortfolioFilters(parsedFilters);
        console.log('Loaded saved portfolio filters:', parsedFilters);
      } catch (error) {
        console.error('Error parsing saved portfolio filters:', error);
      }
    }

    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNarrativeCodes(parsed);
          console.log('Loaded saved narrative codes:', parsed.length);
          shouldInitializeDefaults = false;
        }
      } catch (error) {
        console.error('Error parsing saved config, using defaults:', error);
      }
    }

    if (shouldInitializeDefaults) {
      // Initialize with the narrative codes data - pre-marking typical debt settlement codes
      const allCodes: NarrativeCode[] = [
        { code: 'AA', description: 'Consumer says merchandise or service unsatisfactory', includeInSettlement: false },
        { code: 'AB', description: 'Consumer says account paid/being paid by insurance', includeInSettlement: false },
        { code: 'AC', description: 'Consumer says acct is responsibility of separated or divorced spouse', includeInSettlement: false },
        { code: 'AE', description: 'Consumer says acct. Involved in business venture held personally liab', includeInSettlement: false },
        { code: 'AF', description: 'Consumer says account involves lease agreement dispute', includeInSettlement: false },
        { code: 'AG', description: 'Consumer disputes account - litigation pending', includeInSettlement: false },
        { code: 'AH', description: 'Consumer says account slow due to billing dispute with creditor', includeInSettlement: false },
        { code: 'AI', description: 'Consumer says account slow due to employment issues', includeInSettlement: false },
        { code: 'AJ', description: 'Consumer says account slow due to medical expenses/illness', includeInSettlement: false },
        { code: 'AL', description: 'Consumer says warranty dispute', includeInSettlement: false },
        { code: 'AM', description: 'Voluntary surrender; there may be a balance due', includeInSettlement: false },
        { code: 'AN', description: 'Involuntary repossession', includeInSettlement: false },
        { code: 'AO', description: 'Auto', includeInSettlement: false },
        { code: 'AP', description: 'Commercial account', includeInSettlement: false },
        { code: 'AQ', description: 'Household goods', includeInSettlement: false },
        { code: 'AR', description: 'Home loan', includeInSettlement: false },
        { code: 'AS', description: 'Home improvement loan', includeInSettlement: false },
        { code: 'AT', description: 'Checking account loan plan', includeInSettlement: false },
        { code: 'AU', description: 'Personal loan', includeInSettlement: true },
        { code: 'AV', description: 'Charge', includeInSettlement: true },
        { code: 'AW', description: 'Secured by household goods', includeInSettlement: false },
        { code: 'AX', description: 'Paid by dealer', includeInSettlement: false },
        { code: 'AY', description: 'Voluntarily surrendered – then redeemed or reinstated', includeInSettlement: false },
        { code: 'AZ', description: 'Amount in h/c column is credit limit', includeInSettlement: false },
        { code: 'BB', description: 'Consumer disputes this account information', includeInSettlement: false },
        { code: 'BC', description: 'Account transferred or sold', includeInSettlement: false },
        { code: 'BD', description: 'Paid - credit line closed', includeInSettlement: false },
        { code: 'BE', description: 'Credit line closed', includeInSettlement: false },
        { code: 'BG', description: 'Claim filed with government', includeInSettlement: false },
        { code: 'BH', description: 'Dispute - resolution pending', includeInSettlement: false },
        { code: 'BK', description: 'Redeemed or reinstated repossession', includeInSettlement: false },
        { code: 'BL', description: 'Consumer says account slow due to domestic problems', includeInSettlement: false },
        { code: 'BM', description: 'Consumer says paid on notification - no prior knowledge of balance due', includeInSettlement: false },
        { code: 'BN', description: 'Consumer says co-signed account - not aware of delinquency', includeInSettlement: false },
        { code: 'BO', description: 'Consumer says no statement received due to address change', includeInSettlement: false },
        { code: 'BP', description: 'Consumer says this account spouse\'s responsibility', includeInSettlement: false },
        { code: 'BQ', description: 'Paid charge off', includeInSettlement: false },
        { code: 'BR', description: 'Foreclosure process started', includeInSettlement: false },
        { code: 'BS', description: 'Paid or being paid by government guarantor', includeInSettlement: false },
        { code: 'BT', description: 'Lease', includeInSettlement: false },
        { code: 'BU', description: 'Student loan', includeInSettlement: false },
        { code: 'BV', description: 'Consumer dispute following resolution', includeInSettlement: false },
        { code: 'BW', description: 'Included in bankruptcy', includeInSettlement: false },
        { code: 'BX', description: 'Payments managed by financial counseling program', includeInSettlement: false },
        { code: 'BY', description: 'Collection agency account - status unknown', includeInSettlement: false },
        { code: 'BZ', description: 'Account paid for less than full balance', includeInSettlement: false },
        { code: 'CA', description: 'Charge off - making payments', includeInSettlement: false },
        { code: 'CB', description: 'Charged off - check presented was uncollectible', includeInSettlement: false },
        { code: 'CD', description: 'Customer has now located consumer', includeInSettlement: false },
        { code: 'CE', description: 'Refinanced', includeInSettlement: false },
        { code: 'CF', description: 'Closed account', includeInSettlement: false },
        { code: 'CG', description: 'Account closed - reason unknown', includeInSettlement: false },
        { code: 'CH', description: 'Account paid after foreclosure started', includeInSettlement: false },
        { code: 'CI', description: 'Insurance claim pending', includeInSettlement: false },
        { code: 'CJ', description: 'Customer unable to locate consumer', includeInSettlement: false },
        { code: 'CK', description: 'Debit card', includeInSettlement: false },
        { code: 'CL', description: 'Paid or being paid by co-signer or guarantor', includeInSettlement: false },
        { code: 'CM', description: 'Account assumed by another party', includeInSettlement: false },
        { code: 'CN', description: 'Paying under a partial payment agreement', includeInSettlement: false },
        { code: 'CP', description: 'Consumer says personal bankruptcy filed due to business failure', includeInSettlement: false },
        { code: 'CQ', description: 'Pltff verified judgment paid/satisfaction not recorded with court', includeInSettlement: false },
        { code: 'CS', description: 'Secured credit line', includeInSettlement: false },
        { code: 'CT', description: 'Voluntary', includeInSettlement: false },
        { code: 'CU', description: 'Involuntary', includeInSettlement: false },
        { code: 'CV', description: 'Line of credit', includeInSettlement: true },
        { code: 'CW', description: 'Account closed by credit grantor', includeInSettlement: false },
        { code: 'CX', description: 'Payment is payroll deductible', includeInSettlement: false },
        { code: 'CY', description: 'Account charged to profit and loss', includeInSettlement: false },
        { code: 'CZ', description: 'Collection account', includeInSettlement: true },
        { code: 'DA', description: 'Account closed by consumer', includeInSettlement: false },
        { code: 'DB', description: 'Charged off account', includeInSettlement: false },
        { code: 'DC', description: 'Consumer says account not paid promptly - insurance claim delayed', includeInSettlement: false },
        { code: 'DD', description: 'Balance is deficiency amount', includeInSettlement: false },
        { code: 'DE', description: 'Consumer says account paid in full', includeInSettlement: false },
        { code: 'DG', description: 'Title 1 loan', includeInSettlement: false },
        { code: 'DH', description: 'Balance not paid by insurance', includeInSettlement: false },
        { code: 'DI', description: 'Balance paid or being paid by insurance company', includeInSettlement: false },
        { code: 'DJ', description: 'Foreclosure', includeInSettlement: false },
        { code: 'DK', description: 'Paid or being paid by garnishment', includeInSettlement: false },
        { code: 'DL', description: 'Consumer recalled to active military duty', includeInSettlement: false },
        { code: 'DM', description: 'Forfeit of deed in lieu of foreclosure', includeInSettlement: false },
        { code: 'DN', description: 'Broken lease agreement', includeInSettlement: false },
        { code: 'DO', description: 'Bankruptcy chapter 13', includeInSettlement: false },
        { code: 'DP', description: 'Conversion loss paid by insurance', includeInSettlement: false },
        { code: 'DQ', description: 'Student loan - payment deferred', includeInSettlement: false },
        { code: 'DS', description: 'Single payment loan', includeInSettlement: false },
        { code: 'DT', description: 'Amortized mortgage', includeInSettlement: false },
        { code: 'DU', description: 'Sheriff sale', includeInSettlement: false },
        { code: 'DV', description: 'Amount in high credit includes finance charge', includeInSettlement: false },
        { code: 'DW', description: 'Return mail', includeInSettlement: false },
        { code: 'DX', description: 'Balance owing - amount not reported', includeInSettlement: false },
        { code: 'EA', description: 'Paid or making payments - not according to terms of agreement', includeInSettlement: false },
        { code: 'EB', description: 'Lease - early termination by default', includeInSettlement: false },
        { code: 'EC', description: 'Home equity', includeInSettlement: false },
        { code: 'ED', description: 'Making payment - foreclosure was initiated', includeInSettlement: false },
        { code: 'EE', description: 'Secured', includeInSettlement: false },
        { code: 'EF', description: 'Real estate mortgage', includeInSettlement: false },
        { code: 'EG', description: 'Guaranteed student loan', includeInSettlement: false },
        { code: 'EH', description: 'National direct student loan', includeInSettlement: false },
        { code: 'EI', description: 'Consumer disputes account - litigation filed by creditor pending', includeInSettlement: false },
        { code: 'EJ', description: 'Consumer disputes account - litigation filed by consumer pending', includeInSettlement: false },
        { code: 'EK', description: 'Child/family support obligation', includeInSettlement: false },
        { code: 'EL', description: 'Defendant verified item pd/satisfaction not recorded with court', includeInSettlement: false },
        { code: 'EM', description: 'Voluntary return of purchase', includeInSettlement: false },
        { code: 'EN', description: 'Account included in wep filed by another person', includeInSettlement: false },
        { code: 'EO', description: 'Account included in bankruptcy of another person', includeInSettlement: false },
        { code: 'EP', description: 'Fixed rate', includeInSettlement: false },
        { code: 'EQ', description: 'Variable/adjustable rate', includeInSettlement: false },
        { code: 'ER', description: 'Paid collection', includeInSettlement: false },
        { code: 'ES', description: 'Charged back to dealer', includeInSettlement: false },
        { code: 'ET', description: 'Paid repossession', includeInSettlement: false },
        { code: 'EU', description: 'See consumer statement', includeInSettlement: false },
        { code: 'EV', description: 'Bankruptcy chapter 11', includeInSettlement: false },
        { code: 'EX', description: 'Unsecured', includeInSettlement: true },
        { code: 'EY', description: 'Business account -personal guarantee', includeInSettlement: true },
        { code: 'EZ', description: 'Has co-signer', includeInSettlement: false },
        { code: 'FA', description: 'Closed or paid account/zero balance', includeInSettlement: false },
        { code: 'FB', description: 'Included in orderly payment debt', includeInSettlement: false },
        { code: 'FC', description: 'Credit line suspended', includeInSettlement: false },
        { code: 'FD', description: 'Defaulted student loan', includeInSettlement: false },
        { code: 'FE', description: 'Credit card', includeInSettlement: true },
        { code: 'FF', description: 'Consumer says account not his/hers', includeInSettlement: false },
        { code: 'FG', description: 'Consumer says account never late', includeInSettlement: false },
        { code: 'FH', description: 'Consumer says this public record not his/hers', includeInSettlement: false },
        { code: 'FL', description: 'Consumer says this public record filed in error', includeInSettlement: false },
        { code: 'FM', description: 'Consumer says this public record item satisfied or released', includeInSettlement: false },
        { code: 'FO', description: 'Consumer says bankruptcy discharged', includeInSettlement: false },
        { code: 'FP', description: 'Consumer says bankruptcy dismissed', includeInSettlement: false },
        { code: 'FQ', description: 'Consumer says current rate/status incorrect', includeInSettlement: false },
        { code: 'FR', description: 'Making payments', includeInSettlement: false },
        { code: 'FS', description: 'Annual payment', includeInSettlement: false },
        { code: 'FT', description: 'Not included in bankruptcy', includeInSettlement: false },
        { code: 'FU', description: 'Charged off checking account', includeInSettlement: false },
        { code: 'FV', description: 'Pltff verified lien pd/release not recorded with court', includeInSettlement: false },
        { code: 'FW', description: 'Consumer disputes – reinvestigation in progress', includeInSettlement: false },
        { code: 'FX', description: 'Account listed as public record', includeInSettlement: false },
        { code: 'FZ', description: 'Account reinstated with lender', includeInSettlement: false },
        { code: 'GA', description: 'Paid by collateral', includeInSettlement: false },
        { code: 'GB', description: 'Account being paid through wep', includeInSettlement: false },
        { code: 'GC', description: 'Account being paid through financial counseling plan', includeInSettlement: false },
        { code: 'GD', description: 'Account paid through financial counseling plan', includeInSettlement: false },
        { code: 'GE', description: 'Consumer disputes this item', includeInSettlement: false },
        { code: 'GF', description: 'Reaffirmation of debt', includeInSettlement: false },
        { code: 'GH', description: 'Plaintiff/counsel verified judgement paid', includeInSettlement: false },
        { code: 'GI', description: 'Utility', includeInSettlement: false },
        { code: 'GJ', description: 'Student loan assigned to government', includeInSettlement: false },
        { code: 'GK', description: 'Affected by natural disaster', includeInSettlement: false },
        { code: 'GL', description: 'First payment never received', includeInSettlement: false },
        { code: 'GM', description: 'Account acquired by fdic/ncua', includeInSettlement: false },
        { code: 'GN', description: 'Government debt', includeInSettlement: false },
        { code: 'GO', description: 'Debt consolidation', includeInSettlement: false },
        { code: 'GP', description: 'Manufactured housing', includeInSettlement: false },
        { code: 'GQ', description: 'Recreational merchandise', includeInSettlement: false },
        { code: 'GR', description: 'Secured credit card', includeInSettlement: false },
        { code: 'GS', description: 'Medical', includeInSettlement: true },
        { code: 'HF', description: 'Account closed by consumer', includeInSettlement: false },
        { code: 'HL', description: '100% payment to creditors filing claims', includeInSettlement: false },
        { code: 'HM', description: 'Account included in bankruptcy of primary borrower', includeInSettlement: false },
        { code: 'HN', description: 'Account included in bankruptcy of secondary borrower', includeInSettlement: false },
        { code: 'HO', description: 'Returned check', includeInSettlement: false },
        { code: 'HP', description: 'Fha mortgage', includeInSettlement: false },
        { code: 'HQ', description: 'Va mortgage', includeInSettlement: false },
        { code: 'HR', description: 'Conventional mortgage', includeInSettlement: false },
        { code: 'HS', description: 'Second mortgage', includeInSettlement: false },
        { code: 'HT', description: 'Agricultural', includeInSettlement: false },
        { code: 'HU', description: 'Commercial mortgage-individual liable, company is guarantor', includeInSettlement: false },
        { code: 'HV', description: 'Deposit related', includeInSettlement: false },
        { code: 'HW', description: 'Child/family support', includeInSettlement: false },
        { code: 'HX', description: 'Transferred to recovery', includeInSettlement: false },
        { code: 'IA', description: 'Consumer voluntarily withdrew from bankruptcy', includeInSettlement: false },
        { code: 'IB', description: 'Lease - full termination', includeInSettlement: false },
        { code: 'IC', description: 'Lease - early termination', includeInSettlement: false },
        { code: 'ID', description: 'Status pending', includeInSettlement: false },
        { code: 'IE', description: 'Fannie mae account', includeInSettlement: false },
        { code: 'IF', description: 'Freddie mac account', includeInSettlement: false },
        { code: 'IG', description: 'Prepaid lease', includeInSettlement: false },
        { code: 'IH', description: 'Consumer pays balance in full each month', includeInSettlement: false },
        { code: 'II', description: 'Principal deferred/interest payment only', includeInSettlement: false },
        { code: 'IJ', description: 'Payment deferred', includeInSettlement: false },
        { code: 'IK', description: 'Bankruptcy voluntarily withdrawn', includeInSettlement: false },
        { code: 'IL', description: 'Bankruptcy chapter 7', includeInSettlement: false },
        { code: 'IM', description: 'Bankruptcy chapter 12', includeInSettlement: false },
        { code: 'IN', description: 'Reaffirmation of debt rescinded', includeInSettlement: false },
        { code: 'IP', description: 'Consumer disputes this account information', includeInSettlement: false },
        { code: 'IQ', description: 'Consumer disputes after resolution', includeInSettlement: false },
        { code: 'IR', description: 'Account closed at consumer\'s request', includeInSettlement: false },
        { code: 'IT', description: 'Account acquired from another lender', includeInSettlement: false },
        { code: 'IZ', description: 'Amount in high credit is original charge-off amount', includeInSettlement: false },
        { code: 'JA', description: 'Election of remedy', includeInSettlement: false },
        { code: 'JD', description: 'Consumer deceased', includeInSettlement: false },
        { code: 'JE', description: 'Adjustment pending', includeInSettlement: false },
        { code: 'JF', description: 'Inactive account', includeInSettlement: false },
        { code: 'JG', description: 'Dollar amount in excess of $1 billion', includeInSettlement: false },
        { code: 'JH', description: 'Personal receivership – repayment managed by court trustee', includeInSettlement: false },
        { code: 'JI', description: 'Guaranteed/insured', includeInSettlement: false },
        { code: 'JJ', description: 'Time share loan', includeInSettlement: false },
        { code: 'JK', description: '120 days past due', includeInSettlement: false },
        { code: 'JL', description: '150 days past due', includeInSettlement: false },
        { code: 'JM', description: '180 days or more past due', includeInSettlement: false },
        { code: 'JN', description: 'Partially secured', includeInSettlement: false },
        { code: 'JO', description: 'Note loan', includeInSettlement: false },
        { code: 'JP', description: 'Rental agreement', includeInSettlement: false },
        { code: 'JQ', description: 'Auto lease', includeInSettlement: false },
        { code: 'JR', description: 'Telecommunications/cellular', includeInSettlement: false },
        { code: 'JS', description: 'Unsecured government loan', includeInSettlement: false },
        { code: 'JT', description: 'Secured government loan', includeInSettlement: false },
        { code: 'JU', description: 'Home equity line of credit', includeInSettlement: false },
        { code: 'JV', description: 'Attorney fees', includeInSettlement: false },
        { code: 'JW', description: 'Construction loan', includeInSettlement: false },
        { code: 'JX', description: 'Flexible spending credit card', includeInSettlement: false },
        { code: 'JY', description: 'Combined credit plan', includeInSettlement: false },
        { code: 'JZ', description: 'Debt buyer account', includeInSettlement: false },
        { code: 'KA', description: 'Installment sales contract', includeInSettlement: false },
        { code: 'KB', description: 'Bankruptcy petition', includeInSettlement: false },
        { code: 'KC', description: 'Bankruptcy discharged', includeInSettlement: false },
        { code: 'KD', description: 'Bankruptcy completed', includeInSettlement: false },
        { code: 'KE', description: 'Lease assumption', includeInSettlement: false },
        { code: 'KF', description: 'Account previously in dispute – now resolved by data furnisher', includeInSettlement: false },
        { code: 'KG', description: 'Chapter 7 bankruptcy dismissed', includeInSettlement: false },
        { code: 'KH', description: 'Chapter 11 bankruptcy dismissed', includeInSettlement: false },
        { code: 'KI', description: 'Chapter 12 bankruptcy dismissed', includeInSettlement: false },
        { code: 'KJ', description: 'Chapter 13 bankruptcy dismissed', includeInSettlement: false },
        { code: 'KK', description: 'Chapter 7 bankruptcy withdrawn', includeInSettlement: false },
        { code: 'KL', description: 'Chapter 11 bankruptcy withdrawn', includeInSettlement: false },
        { code: 'KM', description: 'Chapter 12 bankruptcy withdrawn', includeInSettlement: false },
        { code: 'KN', description: 'Chapter 13 bankruptcy withdrawn', includeInSettlement: false },
        { code: 'KO', description: 'Bankrupcty – undesignated chapter', includeInSettlement: false },
        { code: 'KP', description: 'Account closed due to inactivity', includeInSettlement: false },
        { code: 'KQ', description: 'Credit line no longer available - in repayment phase', includeInSettlement: false },
        { code: 'KR', description: 'Credit line reduced due to collateral depreciation', includeInSettlement: false },
        { code: 'KS', description: 'Credit line suspended due to collateral depreciation', includeInSettlement: false },
        { code: 'KT', description: 'Collateral released by creditor/balance owing', includeInSettlement: false },
        { code: 'KU', description: 'Loan modified under a federal government plan', includeInSettlement: false },
        { code: 'KV', description: 'Loan modified', includeInSettlement: false },
        { code: 'KW', description: 'Account in forbearance', includeInSettlement: false },
        { code: 'KZ', description: 'Account paid in full; was a voluntary surrender', includeInSettlement: false },
        { code: 'LB', description: 'Homeowners association (hoa)', includeInSettlement: false }
      ];

      setNarrativeCodes(allCodes);
      console.log('Initialized narrative codes:', allCodes.length);
    }
  }, []);

  // Handle checkbox toggle
  const handleToggleSettlement = (code: string) => {
    setNarrativeCodes(prev =>
      prev.map(item =>
        item.code === code
          ? { ...item, includeInSettlement: !item.includeInSettlement }
          : item
      )
    );
    setHasChanges(true);
  };

  // Handle portfolio filter changes
  const handleFilterChange = (filterKey: keyof DebtPortfolioFilters, value: boolean | number) => {
    setPortfolioFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setHasChanges(true);
  };

  // Save configuration
  const handleSaveConfiguration = () => {
    localStorage.setItem('equifax-narrative-codes', JSON.stringify(narrativeCodes));
    localStorage.setItem('debt-portfolio-filters', JSON.stringify(portfolioFilters));
    setHasChanges(false);
    alert('Configuration saved successfully!');
  };

  // Export configuration as JSON
  const handleExportConfiguration = () => {
    const dataStr = JSON.stringify(narrativeCodes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equifax-narrative-codes-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter codes based on search
  const filteredCodes = narrativeCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Narrative codes state:', narrativeCodes.length);
  console.log('Filtered codes:', filteredCodes.length);

  // Count active codes
  const activeCodesCount = narrativeCodes.filter(code => code.includeInSettlement).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="bg-background">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Equifax Narrative Codes
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto mb-6">
                Manage which narrative codes are typically included in debt settlement programs
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-6">
                <Input
                  type="text"
                  placeholder="Search by code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{narrativeCodes.length}</div>
              <div className="text-sm text-gray-600">Total Narrative Codes</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeCodesCount}</div>
              <div className="text-sm text-gray-600">Included in Settlement</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{filteredCodes.length}</div>
              <div className="text-sm text-gray-600">Filtered Results</div>
            </Card>
          </div>

          {/* Debt Portfolio Filtering Rules */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Debt Portfolio Filtering Rules</h2>
              <div className="text-sm text-gray-600">
                Controls which accounts appear in debt settlement calculations
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Account Status Filters */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Account Status Filters</h3>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={portfolioFilters.requireActiveAccounts}
                    onCheckedChange={(checked) => handleFilterChange('requireActiveAccounts', checked as boolean)}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Require Active Accounts</label>
                    <p className="text-xs text-gray-600">Exclude accounts with "closed" or "paid" status descriptions</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={portfolioFilters.excludeClosedByNarrativeCodes}
                    onCheckedChange={(checked) => handleFilterChange('excludeClosedByNarrativeCodes', checked as boolean)}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Exclude Closed by Narrative Codes</label>
                    <p className="text-xs text-gray-600">Exclude accounts with narrative codes 158, 066, 114 (closed/paid accounts)</p>
                  </div>
                </div>
              </div>

              {/* Balance Filters */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Balance Requirements</h3>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={portfolioFilters.requirePositiveBalance}
                    onCheckedChange={(checked) => handleFilterChange('requirePositiveBalance', checked as boolean)}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Require Positive Balance</label>
                    <p className="text-xs text-gray-600">Only include accounts with outstanding balance > 0</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={portfolioFilters.allowScheduledPayments}
                    onCheckedChange={(checked) => handleFilterChange('allowScheduledPayments', checked as boolean)}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Allow Scheduled Payments</label>
                    <p className="text-xs text-gray-600">Include accounts with scheduled payments even if balance is 0</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Minimum Balance Threshold</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={portfolioFilters.minimumBalance}
                    onChange={(e) => handleFilterChange('minimumBalance', parseFloat(e.target.value) || 0)}
                    className="w-32"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-600">Exclude accounts below this balance amount</p>
                </div>
              </div>

              {/* Portfolio Type Filters */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Portfolio Type Filters</h3>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={portfolioFilters.allowRevolvingAccounts}
                    onCheckedChange={(checked) => handleFilterChange('allowRevolvingAccounts', checked as boolean)}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Allow Revolving Accounts</label>
                    <p className="text-xs text-gray-600">Include credit cards and revolving credit lines (code R/RE)</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={portfolioFilters.allowInstallmentAccounts}
                    onCheckedChange={(checked) => handleFilterChange('allowInstallmentAccounts', checked as boolean)}
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Allow Installment Accounts</label>
                    <p className="text-xs text-gray-600">Include personal loans and installment debt (code I/IN)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Rules Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Filtering Logic Summary:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>✓ Accounts must match configured narrative codes for settlement inclusion</p>
                {portfolioFilters.requireActiveAccounts && <p>✓ Account status must be active (not "closed" or "paid")</p>}
                {portfolioFilters.excludeClosedByNarrativeCodes && <p>✓ Exclude accounts with closed narrative codes (158, 066, 114)</p>}
                {portfolioFilters.requirePositiveBalance && <p>✓ Account balance must be greater than ${portfolioFilters.minimumBalance}</p>}
                {portfolioFilters.allowScheduledPayments && <p>✓ Include accounts with scheduled payments even if balance is 0</p>}
                {portfolioFilters.allowRevolvingAccounts && <p>✓ Include revolving accounts (credit cards, revolving credit)</p>}
                {portfolioFilters.allowInstallmentAccounts && <p>✓ Include installment accounts (personal loans, installment debt)</p>}
                {!portfolioFilters.allowRevolvingAccounts && <p>✗ Exclude revolving accounts (credit cards, revolving credit)</p>}
                {!portfolioFilters.allowInstallmentAccounts && <p>✗ Exclude installment accounts (personal loans, installment debt)</p>}
              </div>
            </div>
          </Card>

          {/* Main Table */}
          <Card className="p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Narrative Codes Configuration</h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveConfiguration}
                  disabled={!hasChanges}
                  className={hasChanges ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Save Configuration
                </Button>
                <Button
                  onClick={handleExportConfiguration}
                  variant="outline"
                >
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">Code</th>
                    <th className="text-left p-3 font-medium text-gray-700">Description</th>
                    <th className="text-center p-3 font-medium text-gray-700">Include in Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((item, index) => (
                    <tr
                      key={item.code}
                      className={`border-b hover:bg-gray-50 ${item.includeInSettlement ? 'bg-green-50' : ''}`}
                    >
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">
                          {item.code}
                        </Badge>
                      </td>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={item.includeInSettlement}
                          onCheckedChange={() => handleToggleSettlement(item.code)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No narrative codes found matching your search
              </div>
            )}
          </Card>

          {/* Notes Section */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Notes</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Narrative Codes:</strong></p>
              <p>• Narrative codes marked with checkmarks are typically included in debt settlement programs</p>
              <p>• Codes like Credit Card (FE), Personal Loan (AU), Medical (GS), Collection Account (CZ) are commonly settled</p>
              <p>• Codes related to mortgages, student loans, bankruptcies, and government debt are typically excluded</p>
              <p className="mt-3"><strong>Portfolio Filtering Rules:</strong></p>
              <p>• Active Account Filter: Excludes accounts marked as "closed" or "paid" in the status description</p>
              <p>• Narrative Code Exclusions: Automatically excludes accounts with codes 158, 066, 114 (closed accounts)</p>
              <p>• Balance Requirements: Controls minimum balance thresholds and scheduled payment allowances</p>
              <p>• Portfolio Type Filters: Controls inclusion of Revolving (R/RE) and Installment (I/IN) account types</p>
              <p>• All settings work together to determine final debt portfolio eligibility</p>
              <p className="mt-3"><strong>Storage:</strong></p>
              <p>• Configuration is saved to browser local storage for persistence across sessions</p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/admin">
              <Button variant="outline">
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}