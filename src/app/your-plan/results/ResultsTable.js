// Separate component to avoid re-rendering issues
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from 'next/navigation';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function ResultsTable({ momentumResults, currentPathResults }) {
  const router = useRouter();

  if (!momentumResults || !currentPathResults) {
    return null;
  }

  const handleStartPlan = () => {
    router.push('/your-plan/docusign');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/2 pb-4 text-center align-top bg-blue-50">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium mt-4 mb-1">
                Recommended
              </div>
              <p className="text-base font-semibold text-blue-600">Momentum Plan</p>
              <p className="text-xs text-muted-foreground">Pay off debt faster with structured settlement.</p>
            </div>
          </TableHead>
          <TableHead className="w-1/2 pb-4 text-center align-top">
            <div className="flex flex-col items-center">
              <div className="bg-white border border-red-600 text-red-600 text-xs px-2 py-1 rounded-full font-medium mt-4 mb-1">
                Do nothing
              </div>
              <p className="text-base font-semibold">Current Path</p>
              <p className="text-xs text-muted-foreground">Keep making minimum payments.</p>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Payment Details Row */}
        <TableRow>
          <TableCell className="text-center align-top bg-blue-50">
            <div className="text-sm font-bold mb-2">Payment Details</div>
            {momentumResults.belowMinimum ? (
              <div className="text-sm space-y-2">
                <div className="text-red-600 font-medium">Below Minimum Requirement</div>
                <div className="text-xs">
                  Minimum debt required: {formatCurrency(momentumResults.minimumRequired)}
                  <br />
                  Your eligible debt: {formatCurrency(momentumResults.totalDebt)}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  The Momentum Plan requires a minimum of $15,000 in eligible debt.
                  You may need to include more accounts or consider alternative options.
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm space-y-1">
                  <div className="text-lg font-bold">{formatCurrency(momentumResults.monthlyPayment)}/mo</div>
                  <div>{momentumResults.term} months</div>
                  <div>Total cost: {formatCurrency(momentumResults.totalCost)}</div>
                </div>

                {momentumResults.isOptimized && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-left">
                    <div className="font-semibold text-green-800 mb-1">✓ Budget Optimized</div>
                    <div className="text-green-700">
                      Original: {formatCurrency(momentumResults.originalMonthlyPayment)}/mo for {momentumResults.originalTerm} months
                    </div>
                    <div className="text-green-700 mt-1">
                      This plan has been optimized based on your available budget with {formatCurrency(momentumResults.excessLiquidity)} excess liquidity.
                    </div>
                  </div>
                )}

                {momentumResults.accountSettlements && momentumResults.accountSettlements.length > 0 && (
                  <div className="mt-4 text-xs text-left">
                    <div className="text-sm font-bold mb-2">Settlement Breakdown</div>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead className="sticky top-0 bg-blue-50">
                          <tr className="border-b">
                            <th className="text-left py-1 px-2">Creditor</th>
                            <th className="text-right py-1 px-2">Balance</th>
                            <th className="text-right py-1 px-2">Rate</th>
                            <th className="text-right py-1 px-2">Settlement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {momentumResults.accountSettlements.map((acc, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-1 px-2 font-medium">{acc.creditor}</td>
                              <td className="text-right py-1 px-2">{formatCurrency(acc.balance)}</td>
                              <td className="text-right py-1 px-2">{(acc.settlementRate * 100).toFixed(1)}%</td>
                              <td className="text-right py-1 px-2">{formatCurrency(acc.settlementAmount)}</td>
                            </tr>
                          ))}
                          <tr className="font-bold border-t-2">
                            <td className="py-1 px-2" colSpan="3">Total Settlement</td>
                            <td className="text-right py-1 px-2">{formatCurrency(momentumResults.totalSettlement)}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2" colSpan="3">Program Fee ({momentumResults.feePercentage}%)</td>
                            <td className="text-right py-1 px-2">{formatCurrency(momentumResults.programFee)}</td>
                          </tr>
                          <tr className="font-bold border-t">
                            <td className="py-1 px-2" colSpan="3">Total Cost</td>
                            <td className="text-right py-1 px-2">{formatCurrency(momentumResults.totalCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Settlement rates are creditor-specific and based on your {momentumResults.term}-month program term.
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-left">
                  <div className="text-sm font-bold mb-2">Legal Assistance Program</div>
                  <div className="text-xs">
                    Based on your creditors, we require that you sign up for legal assistance program.
                    The cost will not exceed $50/mo and will cover all of your potential legal fees.
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleStartPlan}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Start My Plan
                  </button>
                </div>
              </>
            )}
          </TableCell>
          <TableCell className="text-center align-top">
            <div className="text-sm font-bold mb-2">Payment Details</div>
            <div className="text-sm space-y-1">
              <div className="text-lg font-bold">{formatCurrency(currentPathResults.monthlyPayment)}/mo</div>
              <div>{currentPathResults.term} months</div>
              <div>Total cost {formatCurrency(currentPathResults.totalCost)}</div>
              <div className="text-xs">Payment decreases over time</div>
            </div>
          </TableCell>
        </TableRow>

        {/* Summary Row */}
        <TableRow>
          <TableCell className="text-left align-top bg-blue-50 px-4">
            <div className="text-sm font-bold mb-2">Summary</div>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li><span className="font-semibold">Accounts to settle:</span> {momentumResults.accountCount}</li>
              <li><span className="font-semibold">Total debt amount:</span> {formatCurrency(momentumResults.totalDebt)}</li>
              <li><span className="font-semibold">Settlement amount (60%):</span> {formatCurrency(momentumResults.totalDebt * 0.60)}</li>
              <li><span className="font-semibold">Approval:</span> {momentumResults.belowMinimum ? 'Does not meet minimum' : 'Yes, no credit required'}</li>
              <li><span className="font-semibold">Pros:</span> Immediate relief, faster recovery</li>
              <li><span className="font-semibold">Cons:</span> Temporary harm to credit</li>
            </ul>
          </TableCell>
          <TableCell className="text-left align-top px-4">
            <div className="text-sm font-bold mb-2">Summary</div>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li><span className="font-semibold">Pros:</span> No upfront costs</li>
              <li><span className="font-semibold">Cons:</span> Growing debt, no solution</li>
            </ul>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}