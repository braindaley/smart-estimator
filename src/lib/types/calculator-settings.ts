export interface DebtTier {
  id: string;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  maxTerm: number;
  legalProcessingFee: number;
  programType: 'momentum' | 'standard';
}

export interface SettlementConfig {
  fallbackSettlementRate: number;
  minimumExcessLiquidity: number;
  enableSettlementRateValidation: boolean;
}

export interface FeeStructure {
  legalProcessingMonthlyFee: number;
  bufferAmount: number;
  additionalFees: {
    name: string;
    amount: number;
    enabled: boolean;
  }[];
}

export interface MessagingConfig {
  qualifiedProspect: {
    ctaText: string;
    buttonText: string;
    message: string;
  };
  nonQualifiedProspect: {
    message: string;
    alternativeButtonText: string;
  };
  urgencyMessaging: {
    enabled: boolean;
    text: string;
  };
}

export interface TrustComplianceConfig {
  footerBadges: string[];
  alternativeButtonTexts: string[];
  complianceDisclaimers: string[];
}

export interface BusinessRules {
  requirePlaidVerification: boolean;
  enableTermOptimization: boolean;
  roundTermsUp: boolean;
  minimumDebtAmount: number;
  maximumBudgetVariance: number;
}

export interface CreditorData {
  creditorSettlementRates: Record<string, number>;
  fallbackRate: number;
  lastUpdated: string;
}

export interface CalculatorSettings {
  debtTiers: DebtTier[];
  settlement: SettlementConfig;
  feeStructure: FeeStructure;
  messaging: MessagingConfig;
  trustCompliance: TrustComplianceConfig;
  businessRules: BusinessRules;
  creditorData: CreditorData;
}

export interface SettingsAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  section: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}