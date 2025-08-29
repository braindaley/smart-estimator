'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';

export default function CreditResultsPage() {
  const router = useRouter();
  const [creditData, setCreditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user ID from localStorage
    const userId = localStorage.getItem('loan_user_id');
    console.log('Credit Results - User ID:', userId);
    
    if (!userId) {
      console.log('No user ID found, redirecting to your-plan');
      router.push('/your-plan');
      return;
    }

    // Get credit data from session storage
    const storedCreditData = sessionStorage.getItem(`credit_data_${userId}`);
    console.log('Credit Results - Stored data exists:', !!storedCreditData);
    console.log('Credit Results - Raw stored data:', storedCreditData);
    
    if (!storedCreditData) {
      console.log('No credit data found, redirecting to your-plan');
      // Don't redirect immediately, show a message instead
      setIsLoading(false);
      return;
    }

    try {
      const data = JSON.parse(storedCreditData);
      console.log('Credit Results - Parsed data:', data);
      setCreditData(data);
    } catch (error) {
      console.error('Error parsing credit data:', error);
      setCreditData(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!creditData) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">No Credit Data Found</h1>
              <p className="text-muted-foreground mb-6">
                Please complete the credit check first to view your results.
              </p>
              <button
                onClick={() => router.push('/your-plan')}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Your Plan
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Determine credit score rating
  const getScoreRating = (score) => {
    if (score >= 800) return { rating: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 740) return { rating: 'Very Good', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 670) return { rating: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    if (score >= 580) return { rating: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { rating: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };

  const scoreInfo = creditData.creditScore ? getScoreRating(creditData.creditScore.score) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                Your Credit Report Results
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Here's a comprehensive overview of your credit profile and qualifying debts
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Report Status */}
          <div className="mb-6 rounded-xl p-4 border border-border bg-white">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {creditData.status && (
                <div>
                  <span className="text-muted-foreground">Report Status</span>
                  <p className="font-medium capitalize">{creditData.status}</p>
                </div>
              )}
              {creditData.reportDate && (
                <div>
                  <span className="text-muted-foreground">Report Date</span>
                  <p className="font-medium">{creditData.reportDate}</p>
                </div>
              )}
              {creditData.timestamp && (
                <div>
                  <span className="text-muted-foreground">Generated At</span>
                  <p className="font-medium">{new Date(creditData.timestamp).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Credit Score Card */}
            {creditData.creditScore && (
              <div className={`rounded-xl p-6 border ${scoreInfo.borderColor} ${scoreInfo.bgColor}`}>
                <h2 className="text-lg font-semibold mb-4">Credit Score</h2>
                <div className="text-center py-4">
                  <div className={`text-5xl font-bold ${scoreInfo.color}`}>
                    {creditData.creditScore.score}
                  </div>
                  <div className={`text-lg font-medium mt-2 ${scoreInfo.color}`}>
                    {scoreInfo.rating}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {creditData.creditScore.range}
                  </div>
                </div>
                
                {creditData.creditScore.factors && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium mb-2">Key Factors</h3>
                    <ul className="space-y-1">
                      {creditData.creditScore.factors.map((factor, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start">
                          <span className="mr-1">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Account Summary from API */}
            {creditData.summary && (
              <div className="rounded-xl p-6 border border-border bg-white">
                <h2 className="text-lg font-semibold mb-4">Account Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Accounts</span>
                    <span className="font-semibold">{creditData.summary.totalAccounts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Open Accounts</span>
                    <span className="font-semibold">{creditData.summary.openAccounts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Debt</span>
                    <span className="font-semibold">
                      ${creditData.summary.totalDebt?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Payments</span>
                    <span className="font-semibold">
                      ${creditData.summary.monthlyPayments?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>


          {/* Consumer Information from API */}
          {creditData.consumer && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Consumer Information</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(creditData.consumer.firstName || creditData.consumer.lastName) && (
                  <div>
                    <span className="text-sm text-muted-foreground">Full Name</span>
                    <p className="font-medium">
                      {creditData.consumer.firstName} {creditData.consumer.lastName}
                    </p>
                  </div>
                )}
                {creditData.consumer.socialSecurity && (
                  <div>
                    <span className="text-sm text-muted-foreground">SSN</span>
                    <p className="font-medium">***-**-{creditData.consumer.socialSecurity.slice(-4)}</p>
                  </div>
                )}
                {creditData.consumer.customerNumber && (
                  <div>
                    <span className="text-sm text-muted-foreground">Customer Number</span>
                    <p className="font-medium">{creditData.consumer.customerNumber}</p>
                  </div>
                )}
                {creditData.consumer.birthDate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                    <p className="font-medium">{creditData.consumer.birthDate}</p>
                  </div>
                )}
                {creditData.consumer.addressDiscrepancy && (
                  <div>
                    <span className="text-sm text-muted-foreground">Address Discrepancy</span>
                    <p className="font-medium">{creditData.consumer.addressDiscrepancy}</p>
                  </div>
                )}
                {creditData.consumer.ECOAinquiryType && (
                  <div>
                    <span className="text-sm text-muted-foreground">ECOA Inquiry Type</span>
                    <p className="font-medium">
                      {creditData.consumer.ECOAinquiryType.code}
                      {creditData.consumer.ECOAinquiryType.description && (
                        <span className="block text-xs text-gray-500">
                          {creditData.consumer.ECOAinquiryType.description}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Credit Accounts */}
          {creditData.trades && creditData.trades.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Credit Accounts ({creditData.trades.length})</h2>
              <div className="space-y-4">
                {creditData.trades.map((account, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Creditor</span>
                        <p className="text-sm font-semibold">{account.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Account Type</span>
                        <p className="text-sm">
                          {account.portfolioTypeCode?.description || account.portfolioTypeCode?.code || 'N/A'}
                          {account.narrativeCodes && account.narrativeCodes[0] && (
                            <span className="block text-xs text-gray-500">
                              {account.narrativeCodes[0].description}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Date Opened</span>
                        <p className="text-sm">{account.dateOpened || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <p className="text-sm">
                          {account.rate?.description || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Credit Limit / High Credit</span>
                        <p className="text-sm">
                          {account.creditLimit && account.creditLimit !== 'N/A' 
                            ? `$${account.creditLimit.toLocaleString()} (Limit)` 
                            : account.highCredit 
                              ? `$${account.highCredit.toLocaleString()} (High)` 
                              : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Current Balance</span>
                        <p className="text-sm">
                          {account.balance && account.balance !== 'N/A' 
                            ? `$${account.balance.toLocaleString()}` 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Scheduled Payment</span>
                        <p className="text-sm">
                          {account.scheduledPaymentAmount && account.scheduledPaymentAmount !== 'N/A' 
                            ? `$${account.scheduledPaymentAmount.toLocaleString()}` 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Date Reported</span>
                        <p className="text-sm">{account.dateReported || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Last Activity</span>
                        <p className="text-sm">{account.lastActivityDate || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Last Payment Date</span>
                        <p className="text-sm">{account.lastPaymentDate || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Actual Payment</span>
                        <p className="text-sm">
                          {account.actualPaymentAmount && account.actualPaymentAmount !== 'N/A' 
                            ? `$${account.actualPaymentAmount.toLocaleString()}` 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Past Due Amount</span>
                        <p className="text-sm">
                          {account.pastDueAmount && account.pastDueAmount !== 'N/A' 
                            ? `$${account.pastDueAmount.toLocaleString()}` 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs font-medium text-gray-700">Account Number</span>
                          <p className="text-xs text-gray-600">***{account.accountNumber?.slice(-4) || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Months Reviewed</span>
                          <p className="text-xs text-gray-600">{account.monthsReviewed || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Account Designator</span>
                          <p className="text-xs text-gray-600">
                            {account.accountDesignator?.description || account.accountDesignator?.code || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Customer Number</span>
                          <p className="text-xs text-gray-600">{account.customerNumber || 'N/A'}</p>
                        </div>
                        {account.termsFrequencyCode && account.termsFrequencyCode !== 'N/A' && (
                          <div>
                            <span className="text-xs font-medium text-gray-700">Terms Frequency</span>
                            <p className="text-xs text-gray-600">{account.termsFrequencyCode.code || account.termsFrequencyCode}</p>
                          </div>
                        )}
                        {account.termsDurationCode && account.termsDurationCode !== 'N/A' && (
                          <div>
                            <span className="text-xs font-medium text-gray-700">Terms Duration</span>
                            <p className="text-xs text-gray-600">{account.termsDurationCode.code || account.termsDurationCode}</p>
                          </div>
                        )}
                        {account.mortgageIDNumber && account.mortgageIDNumber !== 'N/A' && (
                          <div>
                            <span className="text-xs font-medium text-gray-700">Mortgage ID</span>
                            <p className="text-xs text-gray-600">{account.mortgageIDNumber}</p>
                          </div>
                        )}
                        {account.accountTypeCode && (
                          <div>
                            <span className="text-xs font-medium text-gray-700">Account Type Code</span>
                            <p className="text-xs text-gray-600">
                              {account.accountTypeCode.description || account.accountTypeCode.code || account.accountTypeCode}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {account.narrativeCodes && account.narrativeCodes.length > 1 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700">Additional Notes</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {account.narrativeCodes.slice(1).map((code, idx) => (
                              <span key={idx} className="block">{code.description}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credit Inquiries */}
          {creditData.inquiries && creditData.inquiries.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Recent Credit Inquiries ({creditData.inquiries.length})</h2>
              <div className="space-y-3">
                {creditData.inquiries.map((inquiry, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{inquiry.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {inquiry.industryName} ({inquiry.type})
                      </p>
                      <p className="text-xs text-gray-500">
                        Industry Code: {inquiry.industryCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{inquiry.inquiryDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addresses */}
          {creditData.addresses && creditData.addresses.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Address History ({creditData.addresses.length})</h2>
              <div className="space-y-3">
                {creditData.addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-blue-50">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-700">Address</span>
                        <p className="text-sm">
                          {address.addressLine1}<br />
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Type</span>
                        <p className="text-sm capitalize">{address.type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Date Range</span>
                        <p className="text-sm">
                          {address.dateFirstReported} to {address.dateLastReported}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employment */}
          {creditData.employments && creditData.employments.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Employment Information</h2>
              <div className="space-y-3">
                {creditData.employments.map((employment, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-green-50">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Employer</span>
                        <p className="text-sm">{employment.employer}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Occupation</span>
                        <p className="text-sm">{employment.occupation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bankruptcies */}
          {creditData.bankruptcies && creditData.bankruptcies.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Bankruptcies ({creditData.bankruptcies.length})</h2>
              <div className="space-y-3">
                {creditData.bankruptcies.map((bankruptcy, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-red-50">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Type</span>
                        <p className="text-sm">{bankruptcy.type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Date Filed</span>
                        <p className="text-sm">{bankruptcy.dateFiled}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <p className="text-sm">{bankruptcy.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {creditData.collections && creditData.collections.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Collections Accounts ({creditData.collections.length})</h2>
              <div className="space-y-3">
                {creditData.collections.map((collection, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-yellow-50">
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Agency</span>
                        <p className="text-sm">{collection.agencyName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Original Creditor</span>
                        <p className="text-sm">{collection.originalCreditor}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Balance</span>
                        <p className="text-sm">{collection.balance ? `$${collection.balance.toLocaleString()}` : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Date Opened</span>
                        <p className="text-sm">{collection.dateOpened}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fraud Alerts */}
          {creditData.fraudIDScanAlertCodes && creditData.fraudIDScanAlertCodes.length > 0 && (
            <div className="mt-6 rounded-xl p-6 border border-red-300 bg-red-50">
              <h2 className="text-lg font-semibold mb-4 text-red-800">Fraud Alerts ({creditData.fraudIDScanAlertCodes.length})</h2>
              <div className="space-y-3">
                {creditData.fraudIDScanAlertCodes.map((alert, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-100">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium text-red-800">Code: {alert.code}</p>
                        <p className="text-sm text-red-700">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Credit Report Data */}
          {creditData.creditReport && (
            <div className="mt-6 rounded-xl p-6 border border-border bg-white">
              <h2 className="text-lg font-semibold mb-4">Additional Credit Information</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Display any other fields from creditReport */}
                {Object.entries(creditData.creditReport).map(([key, value]) => {
                  // Skip arrays that we've already displayed above
                  if (['tradeLines', 'inquiries', 'publicRecords', 'collections'].includes(key)) {
                    return null;
                  }
                  
                  // Handle simple values
                  if (typeof value !== 'object' || value === null) {
                    return (
                      <div key={key}>
                        <span className="text-sm font-medium text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <p className="text-sm">{String(value)}</p>
                      </div>
                    );
                  }
                  
                  // Handle objects with multiple properties
                  return (
                    <div key={key} className="md:col-span-2 lg:col-span-3">
                      <span className="text-sm font-medium text-gray-700 block mb-2">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <div className="bg-gray-50 rounded p-3">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between items-center py-1">
                            <span className="text-xs text-gray-600">
                              {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <span className="text-xs font-medium">
                              {typeof subValue === 'object' ? JSON.stringify(subValue) : String(subValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* API Response Metadata */}
          <div className="mt-6 rounded-xl p-6 border border-border bg-white">
            <h2 className="text-lg font-semibold mb-4">API Response Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creditData.timestamp && (
                <div>
                  <span className="text-sm text-muted-foreground">Response Timestamp</span>
                  <p className="font-medium">{new Date(creditData.timestamp).toLocaleString()}</p>
                </div>
              )}
              {creditData.requestedAt && (
                <div>
                  <span className="text-sm text-muted-foreground">Request Time</span>
                  <p className="font-medium">{new Date(creditData.requestedAt).toLocaleString()}</p>
                </div>
              )}
              {creditData.rawResponse && (
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="text-sm text-muted-foreground">Response Type</span>
                  <p className="font-medium">
                    {creditData.isHtml ? 'HTML Response' : 'JSON Response'}
                  </p>
                </div>
              )}
            </div>

            {/* Show raw response if it exists */}
            {creditData.rawResponse && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Raw Response Content</h3>
                <div className="bg-gray-50 rounded p-3 overflow-auto max-h-60">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {creditData.rawResponse}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Complete Raw API Response Data */}
          <div className="mt-6 rounded-xl p-6 border border-border bg-white">
            <h2 className="text-lg font-semibold mb-4">Complete API Response (JSON)</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(creditData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/your-plan')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Your Plan
            </button>
            <button
              onClick={() => {
                // Check if both bank and credit are complete
                const stepStatus = JSON.parse(sessionStorage.getItem('loan_step_status') || '{}');
                if (stepStatus.bank_connection?.completed && stepStatus.credit_check?.completed) {
                  router.push('/results/plan');
                } else {
                  alert('Please complete both bank connection and credit check first.');
                  router.push('/your-plan');
                }
              }}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              View Complete Plan
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> This is a soft credit inquiry that does not affect your credit score. 
              The information shown is for debt settlement planning purposes only. Actual settlement amounts 
              and terms will be negotiated with your creditors if you choose to enroll in our program.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}