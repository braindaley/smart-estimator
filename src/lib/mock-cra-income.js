/**
 * Mock CRA Income Data - matches the format from /api/plaid/cra/get-income/route.js
 * This data simulates the response from Plaid's CRA income verification API
 */

// Mock CRA income data that matches the API response structure
export const mockCraIncomeData = {
  success: true,
  income: {
    // Primary applicant income - simulates bank account income streams
    primary_income: [
      {
        source: "Chase Bank",
        accounts: [
          {
            name: "Chase Checking ...1234",
            type: "checking",
            income_streams: [
              {
                date: "2024-09-20",
                amount: 4000.00,
                is_income: true
              },
              {
                date: "2024-09-06",
                amount: 4000.00,
                is_income: true
              },
              {
                date: "2024-08-23",
                amount: 4000.00,
                is_income: true
              },
              {
                date: "2024-08-09",
                amount: 4000.00,
                is_income: true
              },
              {
                date: "2024-07-26",
                amount: 4000.00,
                is_income: true
              },
              {
                date: "2024-07-12",
                amount: 4000.00,
                is_income: true
              },
              {
                date: "2024-06-28",
                amount: 12000.00,
                is_income: true
              }
            ]
          }
        ]
      }
    ],
    // Income insights from bank transactions with confidence levels
    income_insights: [
      {
        account_id: "e5gWrMamKbUnkpZQpPmPfGK8zEKaVXHrwJd3a",
        total_amount: 28000.00,
        iso_currency_code: "USD",
        unofficial_currency_code: null,
        number_of_income_streams: 1,
        income_streams: [
          {
            name: "TechCorp Bi-Weekly Payroll",
            confidence: "HIGH", // 95% confidence level
            days: 90,
            monthly_income: 8000.00, // Current period (last 30 days)
            average_monthly_income: 9333.33, // Average across all periods
            last_year_income: 96000.00,
            last_year_income_prior_year: 84000.00,
            projected_yearly_income: 112000.00,
            max_number_of_overlapping_transactions: 2
          }
        ]
      }
    ],
    // Employment details
    employment: [
      {
        employer_name: "TechCorp Solutions Inc.",
        employment_status: "EMPLOYED",
        start_date: "2022-01-15",
        end_date: null,
        pay_frequency: "BIWEEKLY",
        annual_income: 96000.00
      }
    ],
    // Summary statistics - this is what should drive the deal sheet calculations
    summary: {
      total_monthly_income: 8000.00, // Period 1 (Current - last 30 days): 24k / 3 months = 8k
      total_annual_income: 96000.00,
      income_sources_count: 1,
      primary_income_source: "TechCorp Bi-Weekly Payroll",
      income_stability_score: 95 // Based on HIGH confidence
    }
  },
  report_id: "mock_report_12345",
  generated_time: new Date().toISOString(),
  days_requested: 90
};

// Mock data for different periods to match the deal sheet's period calculations
export const mockCraIncomeByPeriod = {
  // Period 1: Current Period (Last 30 days) - $24,000 total income
  period1: {
    ...mockCraIncomeData,
    income: {
      ...mockCraIncomeData.income,
      income_insights: [
        {
          ...mockCraIncomeData.income.income_insights[0],
          income_streams: [
            {
              ...mockCraIncomeData.income.income_insights[0].income_streams[0],
              monthly_income: 24000.00, // Shows $24k for current period
              confidence: "HIGH" // 95%+ confidence
            }
          ]
        }
      ],
      summary: {
        ...mockCraIncomeData.income.summary,
        total_monthly_income: 24000.00
      }
    }
  },

  // Period 2: 31-60 days ago - $12,000 total income
  period2: {
    ...mockCraIncomeData,
    income: {
      ...mockCraIncomeData.income,
      income_insights: [
        {
          ...mockCraIncomeData.income.income_insights[0],
          income_streams: [
            {
              ...mockCraIncomeData.income.income_insights[0].income_streams[0],
              monthly_income: 12000.00, // Shows $12k for period 2
              confidence: "HIGH" // 95%+ confidence
            }
          ]
        }
      ],
      summary: {
        ...mockCraIncomeData.income.summary,
        total_monthly_income: 12000.00
      }
    }
  },

  // Period 3: 61-90 days ago - $16,000 total income
  period3: {
    ...mockCraIncomeData,
    income: {
      ...mockCraIncomeData.income,
      income_insights: [
        {
          ...mockCraIncomeData.income.income_insights[0],
          income_streams: [
            {
              ...mockCraIncomeData.income.income_insights[0].income_streams[0],
              monthly_income: 16000.00, // Shows $16k for period 3
              confidence: "HIGH" // 95%+ confidence
            }
          ]
        }
      ],
      summary: {
        ...mockCraIncomeData.income.summary,
        total_monthly_income: 16000.00
      }
    }
  }
};

/**
 * Get mock CRA income data for a specific period
 * @param {number} period - 1, 2, or 3 representing different time periods
 * @returns {Object} Mock CRA income data for the specified period
 */
export function getMockCraIncomeForPeriod(period = 1) {
  switch (period) {
    case 1:
      return mockCraIncomeByPeriod.period1;
    case 2:
      return mockCraIncomeByPeriod.period2;
    case 3:
      return mockCraIncomeByPeriod.period3;
    default:
      return mockCraIncomeData;
  }
}

/**
 * Calculate average monthly income across all periods
 * This should return $17,333.33 = ($24,000 + $12,000 + $16,000) / 3
 * @returns {number} Average monthly income
 */
export function calculateAverageMonthlyIncome() {
  const period1Income = mockCraIncomeByPeriod.period1.income.summary.total_monthly_income;
  const period2Income = mockCraIncomeByPeriod.period2.income.summary.total_monthly_income;
  const period3Income = mockCraIncomeByPeriod.period3.income.summary.total_monthly_income;

  return (period1Income + period2Income + period3Income) / 3; // Should be 17,333.33
}

/**
 * Get confidence level as percentage
 * @returns {number} Confidence percentage (e.g., 95 for HIGH confidence)
 */
export function getIncomeConfidencePercentage() {
  const confidence = mockCraIncomeData.income.income_insights[0].income_streams[0].confidence;

  switch (confidence) {
    case 'HIGH':
      return 95;
    case 'MEDIUM':
      return 75;
    case 'LOW':
      return 50;
    default:
      return 0;
  }
}