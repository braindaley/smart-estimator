import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export async function POST(request) {
  console.log('[Get CRA Income] Starting request');

  try {
    // Check environment variables
    const requiredEnvVars = {
      PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
      PLAID_SECRET: process.env.PLAID_SECRET,
      PLAID_ENV: process.env.PLAID_ENV
    };

    // Validate environment variables
    const missingVars = [];
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        missingVars.push(key);
      }
    }

    if (missingVars.length > 0) {
      console.error('[Get CRA Income] Missing environment variables:', missingVars);
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: `Missing environment variables: ${missingVars.join(', ')}`
        },
        { status: 500 }
      );
    }

    // Parse request body
    const { userToken } = await request.json();
    console.log('[Get CRA Income] Request:', { hasUserToken: !!userToken });

    if (!userToken) {
      return NextResponse.json(
        { error: 'User token is required' },
        { status: 400 }
      );
    }

    // Configure Plaid client
    const plaidEnv = requiredEnvVars.PLAID_ENV.toLowerCase();
    console.log('[Get CRA Income] Using Plaid environment:', plaidEnv);

    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': requiredEnvVars.PLAID_CLIENT_ID,
          'PLAID-SECRET': requiredEnvVars.PLAID_SECRET,
        },
      },
    });

    const client = new PlaidApi(configuration);

    // Get CRA base report which includes income information
    const response = await client.craCheckReportBaseReportGet({
      user_token: userToken
    });

    console.log('[Get CRA Income] Success! Retrieved CRA report');

    // Extract income information from the CRA report
    const report = response.data.report;
    const incomeData = {
      // Primary applicant income
      primary_income: report.items?.map(item => ({
        source: item.institution_name,
        accounts: item.accounts?.map(account => ({
          name: account.account_name,
          type: account.account_type,
          income_streams: account.historical_balances?.map(balance => ({
            date: balance.date,
            amount: balance.amount,
            is_income: balance.amount > 0
          }))
        }))
      })),
      // Income insights from bank transactions
      income_insights: report.bank_income?.map(income => ({
        account_id: income.account_id,
        total_amount: income.total_amount,
        iso_currency_code: income.iso_currency_code,
        unofficial_currency_code: income.unofficial_currency_code,
        number_of_income_streams: income.income_streams?.length || 0,
        income_streams: income.income_streams?.map(stream => ({
          name: stream.name,
          confidence: stream.confidence,
          days: stream.days,
          monthly_income: stream.monthly_income,
          average_monthly_income: stream.average_monthly_income,
          last_year_income: stream.last_year_income,
          last_year_income_prior_year: stream.last_year_income_prior_year,
          projected_yearly_income: stream.projected_yearly_income,
          max_number_of_overlapping_transactions: stream.max_number_of_overlapping_transactions
        }))
      })),
      // Employment details if available
      employment: report.employment?.map(emp => ({
        employer_name: emp.employer_name,
        employment_status: emp.employment_status,
        start_date: emp.start_date,
        end_date: emp.end_date,
        pay_frequency: emp.pay_frequency,
        annual_income: emp.annual_income
      })),
      // Summary statistics
      summary: {
        total_monthly_income: calculateTotalMonthlyIncome(report),
        total_annual_income: calculateTotalAnnualIncome(report),
        income_sources_count: countIncomeSources(report),
        primary_income_source: getPrimaryIncomeSource(report),
        income_stability_score: calculateIncomeStabilityScore(report)
      },
      // Raw report data for debugging
      raw_report: process.env.NODE_ENV === 'development' ? report : undefined
    };

    return NextResponse.json({
      success: true,
      income: incomeData,
      report_id: response.data.report_id,
      generated_time: response.data.generated_time,
      days_requested: response.data.days_requested
    });

  } catch (error) {
    console.error('[Get CRA Income] Error occurred:', error);
    console.error('[Get CRA Income] Error stack:', error.stack);

    // Handle Plaid-specific errors
    if (error.response) {
      console.error('[Get CRA Income] Plaid API error:', {
        status: error.response.status,
        data: error.response.data,
        error_code: error.response.data?.error_code,
        error_message: error.response.data?.error_message
      });

      const errorCode = error.response.data?.error_code;

      // Handle specific CRA errors
      if (errorCode === 'PRODUCT_NOT_READY') {
        return NextResponse.json(
          {
            error: 'Income verification is still processing. Please try again in a few moments.',
            error_code: errorCode,
            retry_after: 30 // seconds
          },
          { status: 202 }
        );
      }

      if (errorCode === 'USER_PERMISSION_REVOKED') {
        return NextResponse.json(
          {
            error: 'Permission to access income data was revoked. Please reconnect your account.',
            error_code: errorCode
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: error.response.data?.error_message || 'Failed to retrieve income data',
          error_code: errorCode,
          error_type: error.response.data?.error_type
        },
        { status: error.response.status || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to retrieve income data',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// Helper functions for processing CRA report data
function calculateTotalMonthlyIncome(report) {
  try {
    let totalMonthly = 0;

    // Sum up monthly income from bank income streams
    if (report.bank_income) {
      report.bank_income.forEach(bankIncome => {
        if (bankIncome.income_streams) {
          bankIncome.income_streams.forEach(stream => {
            if (stream.average_monthly_income) {
              totalMonthly += stream.average_monthly_income;
            }
          });
        }
      });
    }

    // Add employment income if available
    if (report.employment) {
      report.employment.forEach(emp => {
        if (emp.annual_income) {
          totalMonthly += emp.annual_income / 12;
        }
      });
    }

    return Math.round(totalMonthly * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating total monthly income:', error);
    return 0;
  }
}

function calculateTotalAnnualIncome(report) {
  try {
    let totalAnnual = 0;

    // Sum up annual income from bank income streams
    if (report.bank_income) {
      report.bank_income.forEach(bankIncome => {
        if (bankIncome.income_streams) {
          bankIncome.income_streams.forEach(stream => {
            if (stream.projected_yearly_income) {
              totalAnnual += stream.projected_yearly_income;
            }
          });
        }
      });
    }

    // Add employment income if available
    if (report.employment) {
      report.employment.forEach(emp => {
        if (emp.annual_income) {
          totalAnnual += emp.annual_income;
        }
      });
    }

    return Math.round(totalAnnual * 100) / 100;
  } catch (error) {
    console.error('Error calculating total annual income:', error);
    return 0;
  }
}

function countIncomeSources(report) {
  try {
    let count = 0;

    // Count bank income streams
    if (report.bank_income) {
      report.bank_income.forEach(bankIncome => {
        if (bankIncome.income_streams) {
          count += bankIncome.income_streams.length;
        }
      });
    }

    // Count employment sources
    if (report.employment) {
      count += report.employment.length;
    }

    return count;
  } catch (error) {
    console.error('Error counting income sources:', error);
    return 0;
  }
}

function getPrimaryIncomeSource(report) {
  try {
    let primarySource = null;
    let maxIncome = 0;

    // Check bank income streams
    if (report.bank_income) {
      report.bank_income.forEach(bankIncome => {
        if (bankIncome.income_streams) {
          bankIncome.income_streams.forEach(stream => {
            const yearlyIncome = stream.projected_yearly_income || 0;
            if (yearlyIncome > maxIncome) {
              maxIncome = yearlyIncome;
              primarySource = stream.name || 'Bank Deposit';
            }
          });
        }
      });
    }

    // Check employment income
    if (report.employment) {
      report.employment.forEach(emp => {
        const yearlyIncome = emp.annual_income || 0;
        if (yearlyIncome > maxIncome) {
          maxIncome = yearlyIncome;
          primarySource = emp.employer_name || 'Employment';
        }
      });
    }

    return primarySource || 'Unknown';
  } catch (error) {
    console.error('Error determining primary income source:', error);
    return 'Unknown';
  }
}

function calculateIncomeStabilityScore(report) {
  try {
    // Simple stability score based on confidence levels and consistency
    let totalConfidence = 0;
    let confidenceCount = 0;

    if (report.bank_income) {
      report.bank_income.forEach(bankIncome => {
        if (bankIncome.income_streams) {
          bankIncome.income_streams.forEach(stream => {
            if (stream.confidence) {
              // Convert confidence to numeric score (0-100)
              const confidenceScore =
                stream.confidence === 'HIGH' ? 90 :
                stream.confidence === 'MEDIUM' ? 60 :
                stream.confidence === 'LOW' ? 30 : 0;

              totalConfidence += confidenceScore;
              confidenceCount++;
            }
          });
        }
      });
    }

    // Calculate average confidence score
    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 50;

    // Adjust score based on number of income sources (more sources = more stable)
    const sourceCount = countIncomeSources(report);
    const sourceBonus = Math.min(sourceCount * 5, 20); // Max 20 point bonus

    return Math.min(Math.round(avgConfidence + sourceBonus), 100);
  } catch (error) {
    console.error('Error calculating income stability score:', error);
    return 50; // Default middle score
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST request.' },
    { status: 405 }
  );
}