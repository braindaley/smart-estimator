// Generated from Equifax Codes 2025.xlsx
export interface EquifaxCodes {
  "Account Ratings": Array<{
    "Account Rating": string | number;
    "Description": string | number;
  }>;
  "Bankrupty Codes": Array<{
    "Code": string | number;
    "Type": string | number;
    "Description": string | number;
  }>;
  "Collection Codes": Array<{
    "Collection Code": string | number;
    "Description": string | number;
  }>;
  "Credit Score Factors": Array<{
    "Code": string | number;
    "Credit Score Description": string | number;
  }>;
  "Narrative Codes": Array<{
    "Code": string | number;
    "Description": string | number;
  }>;
  "Payment History Codes": Array<{
    "Code": string | number;
    "Description": string | number;
  }>;
  "Industry Type Codes": Array<{
    "industryCode": string | number;
    "industryType": string | number;
  }>;
}

export const equifaxCodes: EquifaxCodes = {
  "Account Ratings": [
    {
      "Account Rating": 0,
      "Description": "Too new to rate; approved but not used."
    },
    {
      "Account Rating": 1,
      "Description": "Pays (or paid) within 30 days of payment due date or not more than one payment past due."
    },
    {
      "Account Rating": 2,
      "Description": "Pays (or paid) in more than 30 days from payment due date, but not more than 60 days, or not more than two payments past due."
    },
    {
      "Account Rating": 3,
      "Description": "Pays (or paid) in more than 60 days from payment due date, but not more than 90 days, or not more than three payments past due."
    },
    {
      "Account Rating": 4,
      "Description": "Pays (or paid) in more than 90 days from payment due date, but not more than 120 days, or four payments past due."
    },
    {
      "Account Rating": 5,
      "Description": "Account is at least 120 days overdue but is not yet in collections."
    },
    {
      "Account Rating": 6,
      "Description": "Collection"
    },
    {
      "Account Rating": 7,
      "Description": "Included in Chapter 13"
    },
    {
      "Account Rating": 8,
      "Description": "Repossession (voluntary or involuntary return of merchandise)."
    },
    {
      "Account Rating": 9,
      "Description": "Charged Off"
    },
    {
      "Account Rating": "A",
      "Description": "Account is inactive"
    },
    {
      "Account Rating": "B",
      "Description": "Lost or stoled card"
    },
    {
      "Account Rating": "C",
      "Description": "Contact member for status"
    },
    {
      "Account Rating": "D",
      "Description": "Refinanced or renewed"
    },
    {
      "Account Rating": "E",
      "Description": "Consumer deceased"
    },
    {
      "Account Rating": "F",
      "Description": "In financial counseling"
    },
    {
      "Account Rating": "G",
      "Description": "Foreclosure process started"
    },
    {
      "Account Rating": "H",
      "Description": "In WEP of other partner (retired 2-02-2009)"
    },
    {
      "Account Rating": "J",
      "Description": "Adjustment pending"
    },
    {
      "Account Rating": "M",
      "Description": "Included in Chapter 13 alternative"
    },
    {
      "Account Rating": "S",
      "Description": "Dispute - resolution pending"
    },
    {
      "Account Rating": "Z",
      "Description": "Included in bankruptcy"
    },
    {
      "Account Rating": "#",
      "Description": "In Bankruptcy of another person (retired 2-02-2009)"
    },
    {
      "Account Rating": "$",
      "Description": "Assigned to US Dept of Ed"
    }
  ],
  "Bankrupty Codes": [
    {
      "Code": "A",
      "Type": "DISCHARGED CH-7",
      "Description": "The amount owed was included in the “order of relief.\" Debtor no longer liable for debts listed in \"order or relief.\""
    },
    {
      "Code": "C",
      "Type": "CH-13 FILED",
      "Description": "Adjustment of debts of an individual with consistent income. Debtor petitions the court for permission to pay a percent of his income over a period of years until debt is satisfied (usually not over three years)."
    },
    {
      "Code": "D",
      "Type": "CH-11 FILED",
      "Description": "Business Reorganization. Business debtor is granted relief from payment under terms of initial contract reorganization period."
    },
    {
      "Code": "E",
      "Type": "DISMSD/CLSD CH11",
      "Description": "Petition for reorganization of debt has been withdrawn by debtor or honored - subject liable for debts."
    },
    {
      "Code": "F",
      "Type": "DISCHARGED CH-11",
      "Description": "Petition by debtor for complete relief of all debts is honored. Debtor no longer liable for debts listed in “order of relief.\""
    },
    {
      "Code": "G",
      "Type": "CH-12 FILED",
      "Description": "The Chapter 12 plan applies only to family farmers who have regular annual incomes sufficient to make payments under a proposed plan. Payment under the plan must be completed in three years. In certain situations, payment of no longer than five years is permitted."
    },
    {
      "Code": "H",
      "Type": "DISCHARGED CH-12",
      "Description": "A discharge is entered after the completion of all payments under the plan. However, certain payments on some long term claims, which are due after the last payment under the plan, will continue after the date of discharge."
    },
    {
      "Code": "I",
      "Type": "INVOLUNTARY CH-7",
      "Description": "The debtor is forced into bankruptcy by the petition of a sufficient number of his creditors."
    },
    {
      "Code": "J",
      "Type": "DISMSD/CLSD CH12",
      "Description": "The court may dismiss the plan or terminate the plan for various reasons, including unreasonable delays, gross mismanagement, non payment of any fees and charges, failure to file a plan in a timely manner, failure to make timely payments required by a confirmed plan, denial of confirmation or request made for additional time, and so forth."
    },
    {
      "Code": "K",
      "Type": "DISMSD/CLSD CH13",
      "Description": "The petition by debtor for permission to pay a percent of his income over a period of years has been withdrawn by debtor or has not been followed by debtor. Debtor remains liable for his debts under initial terms of the contract."
    },
    {
      "Code": "L",
      "Type": "DISCHARGED CH-13",
      "Description": "Plan by debtor to pay percent of income over a period of years has been completed. Debtor no longer liable for debts listed in payment plan."
    },
    {
      "Code": "M",
      "Type": "DISMSD/CLSD CH7",
      "Description": "The bankruptcy petition has been withdrawn by or has not been honored by the court. Subject remains liable for his debts under the terms of the initial contract."
    },
    {
      "Code": "V",
      "Type": "VOLUNTARY CH-7",
      "Description": "Bankruptcy proceeding is initiated by the debtor's own petition to be declared bankrupt and have benefit of the law."
    }
  ],
  "Collection Codes": [
    {
      "Collection Code": "UNPAID",
      "Description": "Subject has not satisfied debt."
    },
    {
      "Collection Code": "FINANCIAL_COUNSELOR",
      "Description": "Identifies that a subject is receiving professional guidance on financial matters, and is under a payment plan."
    },
    {
      "Collection Code": "ADJUSTMENT",
      "Description": "Settlement of a debt in which full payment is not made or when the amount involved is not certain."
    },
    {
      "Collection Code": "WAGE_EARNER",
      "Description": "Chapter 13 (Debtors with regular income). This chapter allows an individual to reorganize finances and protect assets while a court approved repayment plan is in effect."
    },
    {
      "Collection Code": "NEW_LISTING",
      "Description": "Collection account which has just been turned over for collection of past due debt."
    },
    {
      "Collection Code": "PAID",
      "Description": "Subject has satisfied debt."
    },
    {
      "Collection Code": "ACCOUNT_DISPUTED",
      "Description": "Merchant and consumer disagree on various particulars regarding merchandise, terms of agreement or amount owing."
    },
    {
      "Collection Code": "PAYMENT",
      "Description": "Subject submits portion of money owing."
    },
    {
      "Collection Code": "STATUS_UNKNOWN",
      "Description": "Indicates status is not verified."
    },
    {
      "Collection Code": "CHECKED",
      "Description": "As of the date reported, the balance was not paid and the account was verified at the request of the consumer via a dispute."
    },
    {
      "Collection Code": "IN_BANKRUPTCY",
      "Description": "The legal process under the Federal Bankruptcy Act by which debtors are granted some form of relief from their financial obligations."
    }
  ],
  "Credit Score Factors": [
    {
      "Code": 1,
      "Credit Score Description": "The tradeline owner is deceased"
    },
    {
      "Code": 4,
      "Credit Score Description": "There is no available tradeline data for the user"
    },
    {
      "Code": "Code",
      "Credit Score Description": "Factor Description"
    },
    {
      "Code": 4,
      "Credit Score Description": "The balances on your accounts are too high compared to loan amounts"
    },
    {
      "Code": 5,
      "Credit Score Description": "Too many of the delinquencies on your accounts are recent"
    },
    {
      "Code": 6,
      "Credit Score Description": "You have too many accounts that were opened recently"
    },
    {
      "Code": 7,
      "Credit Score Description": "You have too many delinquent or derogatory accounts"
    },
    {
      "Code": 8,
      "Credit Score Description": "You have either too few loans or too many loans with recent delinquencies"
    },
    {
      "Code": 9,
      "Credit Score Description": "The worst payment status on your accounts is delinquent or derogatory"
    },
    {
      "Code": 10,
      "Credit Score Description": "You have either very few loans or too many loans with delinquencies"
    },
    {
      "Code": 11,
      "Credit Score Description": "The total of your delinquent or derogatory account balances is too high"
    },
    {
      "Code": 12,
      "Credit Score Description": "The date that you opened your oldest account is too recent"
    },
    {
      "Code": 13,
      "Credit Score Description": "Your most recently opened account is too new"
    },
    {
      "Code": 14,
      "Credit Score Description": "Lack of sufficient credit history"
    },
    {
      "Code": 15,
      "Credit Score Description": "Newest delinquent/derogatory payment status on your accts is too recent"
    },
    {
      "Code": 16,
      "Credit Score Description": "The total of all balances on your open accounts is too high"
    },
    {
      "Code": 17,
      "Credit Score Description": "Balance on previously delinquent accts are too high compared to loan amts"
    },
    {
      "Code": 18,
      "Credit Score Description": "Total of balances on accts never late is too high compared to loan amts"
    },
    {
      "Code": 21,
      "Credit Score Description": "No open accounts in your credit file"
    },
    {
      "Code": 22,
      "Credit Score Description": "No recently reported account information"
    },
    {
      "Code": 23,
      "Credit Score Description": "Lack of sufficient relevant account information"
    },
    {
      "Code": 29,
      "Credit Score Description": "Too many of your open bankcard or revolving accounts have a balance"
    },
    {
      "Code": 30,
      "Credit Score Description": "Too few of your bankcard or other revolving accounts have high limits"
    },
    {
      "Code": 31,
      "Credit Score Description": "Too many bankcard or other revolving accounts were opened recently"
    },
    {
      "Code": 32,
      "Credit Score Description": "Balances on bankcard/revolving accts too high compared to credit limits"
    },
    {
      "Code": 33,
      "Credit Score Description": "Your worst bankcard or revolving account status is delinquent/derogatory"
    },
    {
      "Code": 34,
      "Credit Score Description": "Total of all balances on bankcard or revolving accounts is too high"
    },
    {
      "Code": 35,
      "Credit Score Description": "Your highest bankcard or revolving account balance is too high"
    },
    {
      "Code": 36,
      "Credit Score Description": "Your largest credit limit on open bankcard or revolving accts is too low"
    },
    {
      "Code": 39,
      "Credit Score Description": "Available credit on your open bankcard or revolving accounts is too low"
    },
    {
      "Code": 40,
      "Credit Score Description": "The date you opened your oldest bankcard or revolving acct is too recent"
    },
    {
      "Code": 42,
      "Credit Score Description": "The date you opened your newest bankcard or revolving acct is too recent"
    },
    {
      "Code": 43,
      "Credit Score Description": "Lack of sufficient credit history on bankcard or revolving accounts"
    },
    {
      "Code": 44,
      "Credit Score Description": "Too many bankcard or revolving accounts with delinquent/derogatory status"
    },
    {
      "Code": 45,
      "Credit Score Description": "Total balances too high on delinquent/derogatory bankcard/revolving accts"
    },
    {
      "Code": 47,
      "Credit Score Description": "No open bankcard or revolving accounts in your credit file"
    },
    {
      "Code": 48,
      "Credit Score Description": "No bankcard or revolving recently reported account information"
    },
    {
      "Code": 49,
      "Credit Score Description": "Lack of sufficient relevant bankcard or revolving account information"
    },
    {
      "Code": 53,
      "Credit Score Description": "The worst status on your real estate accounts is delinquent or derogatory"
    },
    {
      "Code": 54,
      "Credit Score Description": "The amt of balance paid down on your open real estate accounts is too low"
    },
    {
      "Code": 55,
      "Credit Score Description": "Open real estate acct balances are too high compared to their loan amts"
    },
    {
      "Code": 57,
      "Credit Score Description": "Too many real estate accts with delinquent or derogatory payment status"
    },
    {
      "Code": 58,
      "Credit Score Description": "The total of all balances on your open real estate accounts is too high"
    },
    {
      "Code": 61,
      "Credit Score Description": "No open real estate accounts in your credit file"
    },
    {
      "Code": 62,
      "Credit Score Description": "No recently reported real estate account information"
    },
    {
      "Code": 63,
      "Credit Score Description": "Lack of sufficient relevant real estate account information"
    },
    {
      "Code": 64,
      "Credit Score Description": "No open first mortgage accounts in your credit file"
    },
    {
      "Code": 65,
      "Credit Score Description": "Lack of sufficient relevant first mortgage account information"
    },
    {
      "Code": 66,
      "Credit Score Description": "Your open auto account balances are too high compared to their loan amts"
    },
    {
      "Code": 68,
      "Credit Score Description": "No open auto accounts in your credit file"
    },
    {
      "Code": 69,
      "Credit Score Description": "Lack of sufficient relevant auto account information"
    },
    {
      "Code": 71,
      "Credit Score Description": "You have either very few installment loans or too many with delinquencies"
    },
    {
      "Code": 72,
      "Credit Score Description": "Too many installment accts with a delinquent or derogatory payment status"
    },
    {
      "Code": 73,
      "Credit Score Description": "The worst status on your installment accounts is delinquent or derogatory"
    },
    {
      "Code": 74,
      "Credit Score Description": "The balance amount paid down on your open installment accounts is too low"
    },
    {
      "Code": 75,
      "Credit Score Description": "The installment account that you opened most recently is too new"
    },
    {
      "Code": 76,
      "Credit Score Description": "You have insufficient credit history on installment loans"
    },
    {
      "Code": 77,
      "Credit Score Description": "Newest delinquent or derogatory status on installment accts is too recent"
    },
    {
      "Code": 78,
      "Credit Score Description": "Balances on installment accts are too high compared to their loan amounts"
    },
    {
      "Code": 79,
      "Credit Score Description": "Too many of the delinquencies on your installment accounts are recent"
    },
    {
      "Code": 81,
      "Credit Score Description": "No open installment accounts in your credit file"
    },
    {
      "Code": 83,
      "Credit Score Description": "Lack of sufficient relevant installment account information"
    },
    {
      "Code": 84,
      "Credit Score Description": "The number of inquiries was also a factor, but effect was not significant"
    },
    {
      "Code": 85,
      "Credit Score Description": "You have too many inquiries on your credit report."
    },
    {
      "Code": 86,
      "Credit Score Description": "Your credit report contains too many derogatory public records"
    },
    {
      "Code": 87,
      "Credit Score Description": "Your credit report contains too many unsatisfied public records"
    },
    {
      "Code": 88,
      "Credit Score Description": "One or more derogatory public records in your credit file is too recent"
    },
    {
      "Code": 90,
      "Credit Score Description": "Too few discharged bankruptcies"
    },
    {
      "Code": 93,
      "Credit Score Description": "The worst status on your student loan accts is delinquent or derogatory"
    },
    {
      "Code": 94,
      "Credit Score Description": "The balance amount paid down on your open student loan accts is too low"
    },
    {
      "Code": 95,
      "Credit Score Description": "You have too many collection agency accounts that are unpaid"
    },
    {
      "Code": 96,
      "Credit Score Description": "The total you owe on collection agency accounts is high"
    },
    {
      "Code": 97,
      "Credit Score Description": "You have too few credit accounts"
    },
    {
      "Code": 98,
      "Credit Score Description": "There is a bankruptcy on your credit report"
    }
  ],
  "Narrative Codes": [
    {
      "Code": "AA",
      "Description": "Consumer says merchandise or service unsatisfactory"
    },
    {
      "Code": "AB",
      "Description": "Consumer says account paid/being paid by insurance"
    },
    {
      "Code": "AC",
      "Description": "Consumer says acct is responsibility of separated or divorced spouse"
    },
    {
      "Code": "AE",
      "Description": "Consumer says acct. Involved in business venture held personally liab"
    },
    {
      "Code": "AF",
      "Description": "Consumer says account involves lease agreement dispute"
    },
    {
      "Code": "AG",
      "Description": "Consumer disputes account - litigation pending"
    },
    {
      "Code": "AH",
      "Description": "Consumer says account slow due to billing dispute with creditor"
    },
    {
      "Code": "AI",
      "Description": "Consumer says account slow due to employment issues"
    },
    {
      "Code": "AJ",
      "Description": "Consumer says account slow due to medical expenses/illness"
    },
    {
      "Code": "AL",
      "Description": "Consumer says warranty dispute"
    },
    {
      "Code": "AM",
      "Description": "Voluntary surrender; there may be a balance due"
    },
    {
      "Code": "AN",
      "Description": "Involuntary repossession"
    },
    {
      "Code": "AO",
      "Description": "Auto"
    },
    {
      "Code": "AP",
      "Description": "Commercial account"
    },
    {
      "Code": "AQ",
      "Description": "Household goods"
    },
    {
      "Code": "AR",
      "Description": "Home loan"
    },
    {
      "Code": "AS",
      "Description": "Home improvement loan"
    },
    {
      "Code": "AT",
      "Description": "Checking account loan plan"
    },
    {
      "Code": "AU",
      "Description": "Personal loan"
    },
    {
      "Code": "AV",
      "Description": "Charge"
    },
    {
      "Code": "AW",
      "Description": "Secured by household goods"
    },
    {
      "Code": "AX",
      "Description": "Paid by dealer"
    },
    {
      "Code": "AY",
      "Description": "Voluntarily surrendered – then redeemed or reinstated"
    },
    {
      "Code": "AZ",
      "Description": "Amount in h/c column is credit limit"
    },
    {
      "Code": "BB",
      "Description": "Consumer disputes this account information"
    },
    {
      "Code": "BC",
      "Description": "Account transferred or sold"
    },
    {
      "Code": "BD",
      "Description": "Paid - credit line closed"
    },
    {
      "Code": "BE",
      "Description": "Credit line closed"
    },
    {
      "Code": "BG",
      "Description": "Claim filed with government"
    },
    {
      "Code": "BH",
      "Description": "Dispute - resolution pending"
    },
    {
      "Code": "BK",
      "Description": "Redeemed or reinstated repossession"
    },
    {
      "Code": "BL",
      "Description": "Consumer says account slow due to domestic problems"
    },
    {
      "Code": "BM",
      "Description": "Consumer says paid on notification - no prior knowledge of balance due"
    },
    {
      "Code": "BN",
      "Description": "Consumer says co-signed account - not aware of delinquency"
    },
    {
      "Code": "BO",
      "Description": "Consumer says no statement received due to address change"
    },
    {
      "Code": "BP",
      "Description": "Consumer says this account spouse’s responsibility"
    },
    {
      "Code": "BQ",
      "Description": "Paid charge off"
    },
    {
      "Code": "BR",
      "Description": "Foreclosure process started"
    },
    {
      "Code": "BS",
      "Description": "Paid or being paid by government guarantor"
    },
    {
      "Code": "BT",
      "Description": "Lease"
    },
    {
      "Code": "BU",
      "Description": "Student loan"
    },
    {
      "Code": "BV",
      "Description": "Consumer dispute following resolution"
    },
    {
      "Code": "BW",
      "Description": "Included in bankruptcy"
    },
    {
      "Code": "BX",
      "Description": "Payments managed by financial counseling program"
    },
    {
      "Code": "BY",
      "Description": "Collection agency account - status unknown"
    },
    {
      "Code": "BZ",
      "Description": "Account paid for less than full balance"
    },
    {
      "Code": "CA",
      "Description": "Charge off - making payments"
    },
    {
      "Code": "CB",
      "Description": "Charged off - check presented was uncollectible"
    },
    {
      "Code": "CD",
      "Description": "Customer has now located consumer"
    },
    {
      "Code": "CE",
      "Description": "Refinanced"
    },
    {
      "Code": "CF",
      "Description": "Closed account"
    },
    {
      "Code": "CG",
      "Description": "Account closed - reason unknown"
    },
    {
      "Code": "CH",
      "Description": "Account paid after foreclosure started"
    },
    {
      "Code": "CI",
      "Description": "Insurance claim pending"
    },
    {
      "Code": "CJ",
      "Description": "Customer unable to locate consumer"
    },
    {
      "Code": "CK",
      "Description": "Debit card"
    },
    {
      "Code": "CL",
      "Description": "Paid or being paid by co-signer or guarantor"
    },
    {
      "Code": "CM",
      "Description": "Account assumed by another party"
    },
    {
      "Code": "CN",
      "Description": "Paying under a partial payment agreement"
    },
    {
      "Code": "CP",
      "Description": "Consumer says personal bankruptcy filed due to business failure"
    },
    {
      "Code": "CQ",
      "Description": "Pltff verified judgment paid/satisfaction not recorded with court"
    },
    {
      "Code": "CS",
      "Description": "Secured credit line"
    },
    {
      "Code": "CT",
      "Description": "Voluntary"
    },
    {
      "Code": "CU",
      "Description": "Involuntary"
    },
    {
      "Code": "CV",
      "Description": "Line of credit"
    },
    {
      "Code": "CW",
      "Description": "Account closed by credit grantor"
    },
    {
      "Code": "CX",
      "Description": "Payment is payroll deductible"
    },
    {
      "Code": "CY",
      "Description": "Account charged to profit and loss"
    },
    {
      "Code": "CZ",
      "Description": "Collection account"
    },
    {
      "Code": "DA",
      "Description": "Account closed by consumer"
    },
    {
      "Code": "DB",
      "Description": "Charged off account"
    },
    {
      "Code": "DC",
      "Description": "Consumer says account not paid promptly - insurance claim delayed"
    },
    {
      "Code": "DD",
      "Description": "Balance is deficiency amount"
    },
    {
      "Code": "DE",
      "Description": "Consumer says account paid in full"
    },
    {
      "Code": "DG",
      "Description": "Title 1 loan"
    },
    {
      "Code": "DH",
      "Description": "Balance not paid by insurance"
    },
    {
      "Code": "DI",
      "Description": "Balance paid or being paid by insurance company"
    },
    {
      "Code": "DJ",
      "Description": "Foreclosure"
    },
    {
      "Code": "DK",
      "Description": "Paid or being paid by garnishment"
    },
    {
      "Code": "DL",
      "Description": "Consumer recalled to active military duty"
    },
    {
      "Code": "DM",
      "Description": "Forfeit of deed in lieu of foreclosure"
    },
    {
      "Code": "DN",
      "Description": "Broken lease agreement"
    },
    {
      "Code": "DO",
      "Description": "Bankruptcy chapter 13"
    },
    {
      "Code": "DP",
      "Description": "Conversion loss paid by insurance"
    },
    {
      "Code": "DQ",
      "Description": "Student loan - payment deferred"
    },
    {
      "Code": "DS",
      "Description": "Single payment loan"
    },
    {
      "Code": "DT",
      "Description": "Amortized mortgage"
    },
    {
      "Code": "DU",
      "Description": "Sheriff sale"
    },
    {
      "Code": "DV",
      "Description": "Amount in high credit includes finance charge"
    },
    {
      "Code": "DW",
      "Description": "Return mail"
    },
    {
      "Code": "DX",
      "Description": "Balance owing - amount not reported"
    },
    {
      "Code": "EA",
      "Description": "Paid or making payments - not according to terms of agreement"
    },
    {
      "Code": "EB",
      "Description": "Lease - early termination by default"
    },
    {
      "Code": "EC",
      "Description": "Home equity"
    },
    {
      "Code": "ED",
      "Description": "Making payment - foreclosure was initiated"
    },
    {
      "Code": "EE",
      "Description": "Secured"
    },
    {
      "Code": "EF",
      "Description": "Real estate mortgage"
    },
    {
      "Code": "EG",
      "Description": "Guaranteed student loan"
    },
    {
      "Code": "EH",
      "Description": "National direct student loan"
    },
    {
      "Code": "EI",
      "Description": "Consumer disputes account - litigation filed by creditor pending"
    },
    {
      "Code": "EJ",
      "Description": "Consumer disputes account - litigation filed by consumer pending"
    },
    {
      "Code": "EK",
      "Description": "Child/family support obligation"
    },
    {
      "Code": "EL",
      "Description": "Defendant verified item pd/satisfaction not recorded with court"
    },
    {
      "Code": "EM",
      "Description": "Voluntary return of purchase"
    },
    {
      "Code": "EN",
      "Description": "Account included in wep filed by another person"
    },
    {
      "Code": "EO",
      "Description": "Account included in bankruptcy of another person"
    },
    {
      "Code": "EP",
      "Description": "Fixed rate"
    },
    {
      "Code": "EQ",
      "Description": "Variable/adjustable rate"
    },
    {
      "Code": "ER",
      "Description": "Paid collection"
    },
    {
      "Code": "ES",
      "Description": "Charged back to dealer"
    },
    {
      "Code": "ET",
      "Description": "Paid repossession"
    },
    {
      "Code": "EU",
      "Description": "See consumer statement"
    },
    {
      "Code": "EV",
      "Description": "Bankruptcy chapter 11"
    },
    {
      "Code": "EX",
      "Description": "Unsecured"
    },
    {
      "Code": "EY",
      "Description": "Business account -personal guarantee"
    },
    {
      "Code": "EZ",
      "Description": "Has co-signer"
    },
    {
      "Code": "FA",
      "Description": "Closed or paid account/zero balance"
    },
    {
      "Code": "FB",
      "Description": "Included in orderly payment debt"
    },
    {
      "Code": "FC",
      "Description": "Credit line suspended"
    },
    {
      "Code": "FD",
      "Description": "Defaulted student loan"
    },
    {
      "Code": "FE",
      "Description": "Credit card"
    },
    {
      "Code": "FF",
      "Description": "Consumer says account not his/hers"
    },
    {
      "Code": "FG",
      "Description": "Consumer says account never late"
    },
    {
      "Code": "FH",
      "Description": "Consumer says this public record not his/hers"
    },
    {
      "Code": "FL",
      "Description": "Consumer says this public record filed in error"
    },
    {
      "Code": "FM",
      "Description": "Consumer says this public record item satisfied or released"
    },
    {
      "Code": "FO",
      "Description": "Consumer says bankruptcy discharged"
    },
    {
      "Code": "FP",
      "Description": "Consumer says bankruptcy dismissed"
    },
    {
      "Code": "FQ",
      "Description": "Consumer says current rate/status incorrect"
    },
    {
      "Code": "FR",
      "Description": "Making payments"
    },
    {
      "Code": "FS",
      "Description": "Annual payment"
    },
    {
      "Code": "FT",
      "Description": "Not included in bankruptcy"
    },
    {
      "Code": "FU",
      "Description": "Charged off checking account"
    },
    {
      "Code": "FV",
      "Description": "Pltff verified lien pd/release not recorded with court"
    },
    {
      "Code": "FW",
      "Description": "Consumer disputes – reinvestigation in progress"
    },
    {
      "Code": "FX",
      "Description": "Account listed as public record"
    },
    {
      "Code": "FZ",
      "Description": "Account reinstated with lender"
    },
    {
      "Code": "GA",
      "Description": "Paid by collateral"
    },
    {
      "Code": "GB",
      "Description": "Account being paid through wep"
    },
    {
      "Code": "GC",
      "Description": "Account being paid through financial counseling plan"
    },
    {
      "Code": "GD",
      "Description": "Account paid through financial counseling plan"
    },
    {
      "Code": "GE",
      "Description": "Consumer disputes this item"
    },
    {
      "Code": "GF",
      "Description": "Reaffirmation of debt"
    },
    {
      "Code": "GH",
      "Description": "Plaintiff/counsel verified judgement paid"
    },
    {
      "Code": "GI",
      "Description": "Utility"
    },
    {
      "Code": "GJ",
      "Description": "Student loan assigned to government"
    },
    {
      "Code": "GK",
      "Description": "Affected by natural disaster"
    },
    {
      "Code": "GL",
      "Description": "First payment never received"
    },
    {
      "Code": "GM",
      "Description": "Account acquired by fdic/ncua"
    },
    {
      "Code": "GN",
      "Description": "Government debt"
    },
    {
      "Code": "GO",
      "Description": "Debt consolidation"
    },
    {
      "Code": "GP",
      "Description": "Manufactured housing"
    },
    {
      "Code": "GQ",
      "Description": "Recreational merchandise"
    },
    {
      "Code": "GR",
      "Description": "Secured credit card"
    },
    {
      "Code": "GS",
      "Description": "Medical"
    },
    {
      "Code": "HF",
      "Description": "Account closed by consumer"
    },
    {
      "Code": "HL",
      "Description": "100% payment to creditors filing claims"
    },
    {
      "Code": "HM",
      "Description": "Account included in bankruptcy of primary borrower"
    },
    {
      "Code": "HN",
      "Description": "Account included in bankruptcy of secondary borrower"
    },
    {
      "Code": "HO",
      "Description": "Returned check"
    },
    {
      "Code": "HP",
      "Description": "Fha mortgage"
    },
    {
      "Code": "HQ",
      "Description": "Va mortgage"
    },
    {
      "Code": "HR",
      "Description": "Conventional mortgage"
    },
    {
      "Code": "HS",
      "Description": "Second mortgage"
    },
    {
      "Code": "HT",
      "Description": "Agricultural"
    },
    {
      "Code": "HU",
      "Description": "Commercial mortgage-individual liable, company is guarantor"
    },
    {
      "Code": "HV",
      "Description": "Deposit related"
    },
    {
      "Code": "HW",
      "Description": "Child/family support"
    },
    {
      "Code": "HX",
      "Description": "Transferred to recovery"
    },
    {
      "Code": "IA",
      "Description": "Consumer voluntarily withdrew from bankruptcy"
    },
    {
      "Code": "IB",
      "Description": "Lease - full termination"
    },
    {
      "Code": "IC",
      "Description": "Lease - early termination"
    },
    {
      "Code": "ID",
      "Description": "Status pending"
    },
    {
      "Code": "IE",
      "Description": "Fannie mae account"
    },
    {
      "Code": "IF",
      "Description": "Freddie mac account"
    },
    {
      "Code": "IG",
      "Description": "Prepaid lease"
    },
    {
      "Code": "IH",
      "Description": "Consumer pays balance in full each month"
    },
    {
      "Code": "II",
      "Description": "Principal deferred/interest payment only"
    },
    {
      "Code": "IJ",
      "Description": "Payment deferred"
    },
    {
      "Code": "IK",
      "Description": "Bankruptcy voluntarily withdrawn"
    },
    {
      "Code": "IL",
      "Description": "Bankruptcy chapter 7"
    },
    {
      "Code": "IM",
      "Description": "Bankruptcy chapter 12"
    },
    {
      "Code": "IN",
      "Description": "Reaffirmation of debt rescinded"
    },
    {
      "Code": "IP",
      "Description": "Consumer disputes this account information"
    },
    {
      "Code": "IQ",
      "Description": "Consumer disputes after resolution"
    },
    {
      "Code": "IR",
      "Description": "Account closed at consumer’s request"
    },
    {
      "Code": "IT",
      "Description": "Account acquired from another lender"
    },
    {
      "Code": "IZ",
      "Description": "Amount in high credit is original charge-off amount"
    },
    {
      "Code": "JA",
      "Description": "Election of remedy"
    },
    {
      "Code": "JD",
      "Description": "Consumer deceased"
    },
    {
      "Code": "JE",
      "Description": "Adjustment pending"
    },
    {
      "Code": "JF",
      "Description": "Inactive account"
    },
    {
      "Code": "JG",
      "Description": "Dollar amount in excess of $1 billion"
    },
    {
      "Code": "JH",
      "Description": "Personal receivership – repayment managed by court trustee"
    },
    {
      "Code": "JI",
      "Description": "Guaranteed/insured"
    },
    {
      "Code": "JJ",
      "Description": "Time share loan"
    },
    {
      "Code": "JK",
      "Description": "120 days past due"
    },
    {
      "Code": "JL",
      "Description": "150 days past due"
    },
    {
      "Code": "JM",
      "Description": "180 days or more past due"
    },
    {
      "Code": "JN",
      "Description": "Partially secured"
    },
    {
      "Code": "JO",
      "Description": "Note loan"
    },
    {
      "Code": "JP",
      "Description": "Rental agreement"
    },
    {
      "Code": "JQ",
      "Description": "Auto lease"
    },
    {
      "Code": "JR",
      "Description": "Telecommunications/cellular"
    },
    {
      "Code": "JS",
      "Description": "Unsecured government loan"
    },
    {
      "Code": "JT",
      "Description": "Secured government loan"
    },
    {
      "Code": "JU",
      "Description": "Home equity line of credit"
    },
    {
      "Code": "JV",
      "Description": "Attorney fees"
    },
    {
      "Code": "JW",
      "Description": "Construction loan"
    },
    {
      "Code": "JX",
      "Description": "Flexible spending credit card"
    },
    {
      "Code": "JY",
      "Description": "Combined credit plan"
    },
    {
      "Code": "JZ",
      "Description": "Debt buyer account"
    },
    {
      "Code": "KA",
      "Description": "Installment sales contract"
    },
    {
      "Code": "KB",
      "Description": "Bankruptcy petition"
    },
    {
      "Code": "KC",
      "Description": "Bankruptcy discharged"
    },
    {
      "Code": "KD",
      "Description": "Bankruptcy completed"
    },
    {
      "Code": "KE",
      "Description": "Lease assumption"
    },
    {
      "Code": "KF",
      "Description": "Account previously in dispute – now resolved by data furnisher"
    },
    {
      "Code": "KG",
      "Description": "Chapter 7 bankruptcy dismissed"
    },
    {
      "Code": "KH",
      "Description": "Chapter 11 bankruptcy dismissed"
    },
    {
      "Code": "KI",
      "Description": "Chapter 12 bankruptcy dismissed"
    },
    {
      "Code": "KJ",
      "Description": "Chapter 13 bankruptcy dismissed"
    },
    {
      "Code": "KK",
      "Description": "Chapter 7 bankruptcy withdrawn"
    },
    {
      "Code": "KL",
      "Description": "Chapter 11 bankruptcy withdrawn"
    },
    {
      "Code": "KM",
      "Description": "Chapter 12 bankruptcy withdrawn"
    },
    {
      "Code": "KN",
      "Description": "Chapter 13 bankruptcy withdrawn"
    },
    {
      "Code": "KO",
      "Description": "Bankrupcty – undesignated chapter"
    },
    {
      "Code": "KP",
      "Description": "Account closed due to inactivity"
    },
    {
      "Code": "KQ",
      "Description": "Credit line no longer available - in repayment phase"
    },
    {
      "Code": "KR",
      "Description": "Credit line reduced due to collateral depreciation"
    },
    {
      "Code": "KS",
      "Description": "Credit line suspended due to collateral depreciation"
    },
    {
      "Code": "KT",
      "Description": "Collateral released by creditor/balance owing"
    },
    {
      "Code": "KU",
      "Description": "Loan modified under a federal government plan"
    },
    {
      "Code": "KV",
      "Description": "Loan modified"
    },
    {
      "Code": "KW",
      "Description": "Account in forbearance"
    },
    {
      "Code": "KZ",
      "Description": "Account paid in full; was a voluntary surrender"
    },
    {
      "Code": "LB",
      "Description": "Homeowners association (hoa)"
    }
  ],
  "Payment History Codes": [
    {
      "Code": 0,
      "Description": "The account is current"
    },
    {
      "Code": 1,
      "Description": "The account has been late for 1 billing cycle"
    },
    {
      "Code": 2,
      "Description": "The account has been late for 2 billing cycles"
    },
    {
      "Code": 3,
      "Description": "The account has been late for 3 billing cycles"
    },
    {
      "Code": 4,
      "Description": "The account has been late for 4 billing cycles"
    },
    {
      "Code": 5,
      "Description": "The account has been late for 5 billing cycles"
    },
    {
      "Code": 6,
      "Description": "The account has been late for 6 billing cycles"
    },
    {
      "Code": "G",
      "Description": "The account is in collections"
    },
    {
      "Code": "H",
      "Description": "The account is in foreclosure"
    },
    {
      "Code": "J",
      "Description": "The account was voluntarily surrendered"
    },
    {
      "Code": "R",
      "Description": "The collateral for the account has been repossessed"
    },
    {
      "Code": "L",
      "Description": "The account is in charge off"
    },
    {
      "Code": "E",
      "Description": "The account is current and has a zero balance"
    },
    {
      "Code": "B",
      "Description": "No data available for this period"
    },
    {
      "Code": "D",
      "Description": "No data available for this period"
    }
  ],
  "Industry Type Codes": [
    {
      "industryCode": "A",
      "industryType": "Automotive"
    },
    {
      "industryCode": "AF",
      "industryType": "Farm implement dealers"
    },
    {
      "industryCode": "AL",
      "industryType": "Truck dealers"
    },
    {
      "industryCode": "AN",
      "industryType": "Automobile dealers, New"
    },
    {
      "industryCode": "AP",
      "industryType": "Automotive parts"
    },
    {
      "industryCode": "AR",
      "industryType": "Automotive repair, Body shops"
    },
    {
      "industryCode": "AS",
      "industryType": "Service Stations"
    },
    {
      "industryCode": "AT",
      "industryType": "TBA stores, Tire dealers"
    },
    {
      "industryCode": "AU",
      "industryType": "Automobile dealers, Used"
    },
    {
      "industryCode": "AZ",
      "industryType": "Miscellaneous automotive"
    },
    {
      "industryCode": "B",
      "industryType": "Banks and S&L"
    },
    {
      "industryCode": "BB",
      "industryType": "All Banks"
    },
    {
      "industryCode": "BC",
      "industryType": "Bancard"
    },
    {
      "industryCode": "C",
      "industryType": "Clothing"
    },
    {
      "industryCode": "CG",
      "industryType": "General Clothing Stores"
    },
    {
      "industryCode": "CS",
      "industryType": "Specialty clothing"
    },
    {
      "industryCode": "CZ",
      "industryType": "Miscellaneous clothing"
    },
    {
      "industryCode": "D",
      "industryType": "Department/variety and other retail"
    },
    {
      "industryCode": "DC",
      "industryType": "Complete Department store"
    },
    {
      "industryCode": "DM",
      "industryType": "Mail Order Firms"
    },
    {
      "industryCode": "DV",
      "industryType": "Variety store"
    },
    {
      "industryCode": "DZ",
      "industryType": "Miscellaneous department/variety and other retail"
    },
    {
      "industryCode": "F",
      "industryType": "Finance/personal"
    },
    {
      "industryCode": "FA",
      "industryType": "Auto financing"
    },
    {
      "industryCode": "FB",
      "industryType": "Financial brokerage firms"
    },
    {
      "industryCode": "FC",
      "industryType": "Credit cards issued by finance companies"
    },
    {
      "industryCode": "FE",
      "industryType": "Education finance"
    },
    {
      "industryCode": "FF",
      "industryType": "Sales financing"
    },
    {
      "industryCode": "FM",
      "industryType": "Mortgage loans"
    },
    {
      "industryCode": "FO",
      "industryType": "Buy now pay later"
    },
    {
      "industryCode": "FP",
      "industryType": "Personal loan companies"
    },
    {
      "industryCode": "FR",
      "industryType": "Mortgage brokers"
    },
    {
      "industryCode": "FS",
      "industryType": "Savings and loan co."
    },
    {
      "industryCode": "FY",
      "industryType": "Finance collection"
    },
    {
      "industryCode": "FZ",
      "industryType": "Miscellaneous finance/personal"
    },
    {
      "industryCode": "G",
      "industryType": "Groceries"
    },
    {
      "industryCode": "GC",
      "industryType": "Bakeries"
    },
    {
      "industryCode": "GN",
      "industryType": "Neighborhood grocery"
    },
    {
      "industryCode": "GS",
      "industryType": "Supermarkets"
    },
    {
      "industryCode": "GZ",
      "industryType": "Miscellaneous groceries"
    },
    {
      "industryCode": "H",
      "industryType": "Home/office furnishings"
    },
    {
      "industryCode": "HA",
      "industryType": "Appliance sales and service"
    },
    {
      "industryCode": "HC",
      "industryType": "Carpet/floor coverings"
    },
    {
      "industryCode": "HF",
      "industryType": "Furniture and home/office furnishings stores"
    },
    {
      "industryCode": "HM",
      "industryType": "Music/record stores"
    },
    {
      "industryCode": "HT",
      "industryType": "Television/radio sales and service"
    },
    {
      "industryCode": "HZ",
      "industryType": "Miscellaneous home/office furnishings"
    },
    {
      "industryCode": "I",
      "industryType": "Insurance"
    },
    {
      "industryCode": "IG",
      "industryType": "General insurance"
    },
    {
      "industryCode": "IL",
      "industryType": "Life insurance"
    },
    {
      "industryCode": "IZ",
      "industryType": "Miscellaneous insurance"
    },
    {
      "industryCode": "J",
      "industryType": "Jewelry, cameras, and computers"
    },
    {
      "industryCode": "JA",
      "industryType": "Jewelers"
    },
    {
      "industryCode": "JC",
      "industryType": "Cameras"
    },
    {
      "industryCode": "JZ",
      "industryType": "Miscellaneous jewelry, cameras, and computers"
    },
    {
      "industryCode": "K",
      "industryType": "Contractors"
    },
    {
      "industryCode": "KG",
      "industryType": "General contractors"
    },
    {
      "industryCode": "KI",
      "industryType": "Home improvement contractors"
    },
    {
      "industryCode": "KS",
      "industryType": "Subcontractors"
    },
    {
      "industryCode": "KZ",
      "industryType": "Miscellaneous contractors"
    },
    {
      "industryCode": "L",
      "industryType": "Lumber/building materials/hardware"
    },
    {
      "industryCode": "LA",
      "industryType": "Air conditioning, heating, plumbing, electrical"
    },
    {
      "industryCode": "LF",
      "industryType": "Fixture and cabinet supplies"
    },
    {
      "industryCode": "LH",
      "industryType": "Hardware stores"
    },
    {
      "industryCode": "LP",
      "industryType": "Paint, glass, wallpaper stores"
    },
    {
      "industryCode": "LY",
      "industryType": "Lumber yards/mills"
    },
    {
      "industryCode": "LZ",
      "industryType": "Miscellaneous lumber/building material/hardware"
    },
    {
      "industryCode": "M",
      "industryType": "Medical/related health"
    },
    {
      "industryCode": "MB",
      "industryType": "Dentists"
    },
    {
      "industryCode": "MC",
      "industryType": "Chiropractors"
    },
    {
      "industryCode": "MD",
      "industryType": "Doctors/clinics"
    },
    {
      "industryCode": "MF",
      "industryType": "Funeral homes"
    },
    {
      "industryCode": "MH",
      "industryType": "Hospitals"
    },
    {
      "industryCode": "MO",
      "industryType": "Osteopaths"
    },
    {
      "industryCode": "MP",
      "industryType": "Pharmacies/drug stores"
    },
    {
      "industryCode": "MS",
      "industryType": "Optomertrists, etc"
    },
    {
      "industryCode": "MV",
      "industryType": "Veterinarians/animal services"
    },
    {
      "industryCode": "MZ",
      "industryType": "Miscellaneous medical/related health"
    },
    {
      "industryCode": "O",
      "industryType": "Oil & national credit cards"
    },
    {
      "industryCode": "OC",
      "industryType": "Oil companies"
    },
    {
      "industryCode": "ON",
      "industryType": "National credit card companies"
    },
    {
      "industryCode": "OZ",
      "industryType": "Miscellaneous oil companies"
    },
    {
      "industryCode": "P",
      "industryType": "Personal services other than medical"
    },
    {
      "industryCode": "PA",
      "industryType": "Accountants/related"
    },
    {
      "industryCode": "PB",
      "industryType": "Barber/beauty shops"
    },
    {
      "industryCode": "PD",
      "industryType": "Dry cleaning/laundry and related services"
    },
    {
      "industryCode": "PE",
      "industryType": "Engineering of all kinds"
    },
    {
      "industryCode": "PG",
      "industryType": "Photographers"
    },
    {
      "industryCode": "PL",
      "industryType": "Legal and related services"
    },
    {
      "industryCode": "PZ",
      "industryType": "Miscellaneous personal services other than medical"
    },
    {
      "industryCode": "R",
      "industryType": "Real estate and public accommodations"
    },
    {
      "industryCode": "RA",
      "industryType": "Apartments"
    },
    {
      "industryCode": "RE",
      "industryType": "Real estate, sales, and rentals"
    },
    {
      "industryCode": "RH",
      "industryType": "Hotels"
    },
    {
      "industryCode": "RM",
      "industryType": "Motels"
    },
    {
      "industryCode": "RZ",
      "industryType": "Miscellaneous real estate and public accommodations"
    },
    {
      "industryCode": "S",
      "industryType": "Sporting goods"
    },
    {
      "industryCode": "SB",
      "industryType": "Boats/marinas sales and service"
    },
    {
      "industryCode": "SG",
      "industryType": "Sporting goods stores"
    },
    {
      "industryCode": "SM",
      "industryType": "Motorcycles/bicycles sales and service"
    },
    {
      "industryCode": "SZ",
      "industryType": "Miscellaneous sporting goods"
    },
    {
      "industryCode": "T",
      "industryType": "Farm and garden suppliers"
    },
    {
      "industryCode": "TC",
      "industryType": "Farm chemicals/fertilizer stores"
    },
    {
      "industryCode": "TF",
      "industryType": "Feed/seed stores"
    },
    {
      "industryCode": "TN",
      "industryType": "Nursery/landscaping supplies/services"
    },
    {
      "industryCode": "TZ",
      "industryType": "Miscellaneous farm and garden suppliers"
    },
    {
      "industryCode": "U",
      "industryType": "Utilities and fuel"
    },
    {
      "industryCode": "UC",
      "industryType": "Coal/wood dealers"
    },
    {
      "industryCode": "UD",
      "industryType": "Garbage/rubbish disposal companies"
    },
    {
      "industryCode": "UE",
      "industryType": "Electric light/power companies"
    },
    {
      "industryCode": "UF",
      "industryType": "Fuel/oil distributors"
    },
    {
      "industryCode": "UG",
      "industryType": "Gas companies, natural/bottled"
    },
    {
      "industryCode": "UH",
      "industryType": "Cable Companies"
    },
    {
      "industryCode": "UI",
      "industryType": "Wireless Companies"
    },
    {
      "industryCode": "UT",
      "industryType": "Telephone companies"
    },
    {
      "industryCode": "UW",
      "industryType": "Water/sanitary service companies"
    },
    {
      "industryCode": "UZ",
      "industryType": "Miscellaneous utilities and fuel"
    },
    {
      "industryCode": "V",
      "industryType": "Government"
    },
    {
      "industryCode": "VC",
      "industryType": "City/county"
    },
    {
      "industryCode": "VF",
      "industryType": "Federal"
    },
    {
      "industryCode": "VS",
      "industryType": "State"
    },
    {
      "industryCode": "VZ",
      "industryType": "Miscellaneous government"
    },
    {
      "industryCode": "W",
      "industryType": "Wholesale"
    },
    {
      "industryCode": "WA",
      "industryType": "Automotive supplies"
    },
    {
      "industryCode": "WB",
      "industryType": "Building supplies/hardware"
    },
    {
      "industryCode": "WC",
      "industryType": "Clothing/dry goods"
    },
    {
      "industryCode": "WD",
      "industryType": "Drugs/chemicals"
    },
    {
      "industryCode": "WE",
      "industryType": "Bldg supplies and hardware"
    },
    {
      "industryCode": "WG",
      "industryType": "Groceries/related products"
    },
    {
      "industryCode": "WH",
      "industryType": "Home/office furnishings"
    },
    {
      "industryCode": "WM",
      "industryType": "Machinery/equipment supplies"
    },
    {
      "industryCode": "WP",
      "industryType": "Petroleum products"
    },
    {
      "industryCode": "WZ",
      "industryType": "Miscellaneous wholesale"
    },
    {
      "industryCode": "X",
      "industryType": "Advertising"
    },
    {
      "industryCode": "XA",
      "industryType": "Agencies"
    },
    {
      "industryCode": "XM",
      "industryType": "Media"
    },
    {
      "industryCode": "XZ",
      "industryType": "Miscellaneous advertising"
    },
    {
      "industryCode": "Y",
      "industryType": "Collection services"
    },
    {
      "industryCode": "YA",
      "industryType": "Collection departments within ACB credit bureaus"
    },
    {
      "industryCode": "YC",
      "industryType": "Other collection agencies"
    },
    {
      "industryCode": "Z",
      "industryType": "Miscellaneous"
    },
    {
      "industryCode": "ZB",
      "industryType": "Credit report brokers"
    },
    {
      "industryCode": "ZC",
      "industryType": "Credit bureau inquiries"
    },
    {
      "industryCode": "ZD",
      "industryType": "Authentication products"
    },
    {
      "industryCode": "ZF",
      "industryType": "Credit builder"
    },
    {
      "industryCode": "ZR",
      "industryType": "Retail Not Elsewhere"
    },
    {
      "industryCode": "ZS",
      "industryType": "Services Not Elsewhere"
    },
    {
      "industryCode": "ZW",
      "industryType": "Wholesale Not Elsewhere"
    },
    {
      "industryCode": "ZZ",
      "industryType": "All Others-Not Elsewhere"
    },
    {
      "industryCode": "AA",
      "industryType": "Auctions/Wholesale"
    },
    {
      "industryCode": "AC",
      "industryType": "Auto/Truck leasing"
    },
    {
      "industryCode": "BA",
      "industryType": "Auto loans"
    },
    {
      "industryCode": "BH",
      "industryType": "Home equity loans"
    },
    {
      "industryCode": "BI",
      "industryType": "Installment loans"
    },
    {
      "industryCode": "BL",
      "industryType": "Line of credit"
    },
    {
      "industryCode": "BM",
      "industryType": "Mortgage loans"
    },
    {
      "industryCode": "BO",
      "industryType": "Full service banks"
    },
    {
      "industryCode": "BS",
      "industryType": "Student loans"
    },
    {
      "industryCode": "BY",
      "industryType": "Bank collection"
    },
    {
      "industryCode": "BZ",
      "industryType": "Miscellaneous banks and S&L"
    },
    {
      "industryCode": "CB",
      "industryType": "Men’s apparel"
    },
    {
      "industryCode": "CO",
      "industryType": "Off price clothing"
    },
    {
      "industryCode": "CT",
      "industryType": "Textile mills"
    },
    {
      "industryCode": "CU",
      "industryType": "Upscale clothing"
    },
    {
      "industryCode": "CW",
      "industryType": "Women’s apparel"
    },
    {
      "industryCode": "CY",
      "industryType": "Clothing store collection"
    },
    {
      "industryCode": "DG",
      "industryType": "Complete department store"
    },
    {
      "industryCode": "DN",
      "industryType": "National chain"
    },
    {
      "industryCode": "DO",
      "industryType": "Off price store"
    },
    {
      "industryCode": "DP",
      "industryType": "Mail order firms"
    },
    {
      "industryCode": "DU",
      "industryType": "Used merchandise"
    },
    {
      "industryCode": "DY",
      "industryType": "Department store collection"
    },
    {
      "industryCode": "E",
      "industryType": "Education/employment"
    },
    {
      "industryCode": "EB",
      "industryType": "Business education"
    },
    {
      "industryCode": "EL",
      "industryType": "Student loan servicing"
    },
    {
      "industryCode": "ES",
      "industryType": "Employment services"
    },
    {
      "industryCode": "ET",
      "industryType": "Junior colleges/technical education"
    },
    {
      "industryCode": "EU",
      "industryType": "Universities/colleges"
    },
    {
      "industryCode": "EV",
      "industryType": "Vocational/trade schools"
    },
    {
      "industryCode": "EY",
      "industryType": "Education collection"
    },
    {
      "industryCode": "EZ",
      "industryType": "Miscellaneous education"
    },
    {
      "industryCode": "FH",
      "industryType": "Home equity loans"
    },
    {
      "industryCode": "FI",
      "industryType": "Investment firms"
    },
    {
      "industryCode": "GB",
      "industryType": "Bakeries"
    },
    {
      "industryCode": "GD",
      "industryType": "Dairies"
    },
    {
      "industryCode": "GL",
      "industryType": "Liquor stores"
    },
    {
      "industryCode": "GM",
      "industryType": "Meat/fish markets"
    },
    {
      "industryCode": "HD",
      "industryType": "Interior decorators/design"
    },
    {
      "industryCode": "HE",
      "industryType": "Home electronics sales and service"
    },
    {
      "industryCode": "HR",
      "industryType": "Furniture rentals/leasing"
    },
    {
      "industryCode": "HY",
      "industryType": "Home/office furnishings collection"
    },
    {
      "industryCode": "IH",
      "industryType": "Health and accident insurance"
    },
    {
      "industryCode": "IP",
      "industryType": "Property and casualty insurance"
    },
    {
      "industryCode": "IR",
      "industryType": "Retirement/pension plans"
    },
    {
      "industryCode": "JP",
      "industryType": "Computer sales and service"
    },
    {
      "industryCode": "LC",
      "industryType": "Concrete/clay/stone products"
    },
    {
      "industryCode": "LD",
      "industryType": "Doors/windows sales and service"
    },
    {
      "industryCode": "ME",
      "industryType": "Medical equipment"
    },
    {
      "industryCode": "MI",
      "industryType": "Payers"
    },
    {
      "industryCode": "MM",
      "industryType": "Cemeteries"
    },
    {
      "industryCode": "MX",
      "industryType": "HCIT firms"
    },
    {
      "industryCode": "N",
      "industryType": "Credit card, travel, entertainment companies"
    },
    {
      "industryCode": "NA",
      "industryType": "Airline card"
    },
    {
      "industryCode": "NB",
      "industryType": "Airline card"
    },
    {
      "industryCode": "NC",
      "industryType": "Affinity credit card"
    },
    {
      "industryCode": "ND",
      "industryType": "National drug chain"
    },
    {
      "industryCode": "NR",
      "industryType": "Auto rental companies"
    },
    {
      "industryCode": "NT",
      "industryType": "Travel/entertainment card"
    },
    {
      "industryCode": "NZ",
      "industryType": "Miscellaneous credit card, travel, entertainment companies"
    },
    {
      "industryCode": "PC",
      "industryType": "Equipment rentals/leasing"
    },
    {
      "industryCode": "PF",
      "industryType": "Florists"
    },
    {
      "industryCode": "PH",
      "industryType": "Health and fitness clubs"
    },
    {
      "industryCode": "PI",
      "industryType": "Investigative/detective services"
    },
    {
      "industryCode": "PJ",
      "industryType": "Janitorial services"
    },
    {
      "industryCode": "PM",
      "industryType": "Management/investment services"
    },
    {
      "industryCode": "PN",
      "industryType": "Entertainment"
    },
    {
      "industryCode": "PP",
      "industryType": "Pest control"
    },
    {
      "industryCode": "PR",
      "industryType": "Restaurants/bars/country clubs"
    },
    {
      "industryCode": "PS",
      "industryType": "Storage/warehouse"
    },
    {
      "industryCode": "PT",
      "industryType": "Transportation/delivery service"
    },
    {
      "industryCode": "PW",
      "industryType": "Animal specialty services"
    },
    {
      "industryCode": "Q",
      "industryType": "Finance companies other than personal finance companies"
    },
    {
      "industryCode": "QA",
      "industryType": "Auto finance company"
    },
    {
      "industryCode": "QC",
      "industryType": "Credit cards issued by credit unions"
    },
    {
      "industryCode": "QF",
      "industryType": "Sales financing companies"
    },
    {
      "industryCode": "QM",
      "industryType": "Mortgage companies"
    },
    {
      "industryCode": "QU",
      "industryType": "Credit unions"
    },
    {
      "industryCode": "QY",
      "industryType": "Line of credit"
    },
    {
      "industryCode": "QZ",
      "industryType": "Miscellaneous finance companies other than personal finance companies"
    },
    {
      "industryCode": "RC",
      "industryType": "Office leasing"
    },
    {
      "industryCode": "RD",
      "industryType": "Mobile home manufacturers/dealers"
    },
    {
      "industryCode": "RP",
      "industryType": "Mobile home parks"
    },
    {
      "industryCode": "RR",
      "industryType": "Property management"
    },
    {
      "industryCode": "SA",
      "industryType": "Aircraft sales and service"
    },
    {
      "industryCode": "UB",
      "industryType": "Cable/satellite companies"
    },
    {
      "industryCode": "UR",
      "industryType": "Cellular telephone/paging companies"
    },
    {
      "industryCode": "VG",
      "industryType": "Government student loans"
    },
    {
      "industryCode": "VL",
      "industryType": "Law enforcement"
    },
    {
      "industryCode": "ZA",
      "industryType": "Credit bureau/automotive processing"
    },
    {
      "industryCode": "ZM",
      "industryType": "Credit bureaus/mortgage processing"
    },
    {
      "industryCode": "ZP",
      "industryType": "Public records"
    },
    {
      "industryCode": "ZT",
      "industryType": "Tenant screeners"
    }
  ]
};
