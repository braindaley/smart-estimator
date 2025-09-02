'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BusinessRules } from '@/lib/types/calculator-settings';

interface BusinessRulesSectionProps {
  businessRules: BusinessRules;
  onChange: (businessRules: BusinessRules) => void;
}

export function BusinessRulesSection({ businessRules, onChange }: BusinessRulesSectionProps) {
  const updateRule = (field: keyof BusinessRules, value: any) => {
    onChange({
      ...businessRules,
      [field]: value
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Business Rules</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure business logic toggles and validation parameters
          </p>
        </div>

        <div className="space-y-6">
          {/* Integration Rules */}
          <div>
            <h3 className="text-lg font-medium mb-4">Integration Requirements</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label htmlFor="plaid-required">
                    Require Plaid Verification
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Users must complete Plaid bank connection for qualification
                  </p>
                </div>
                <Switch
                  id="plaid-required"
                  checked={businessRules.requirePlaidVerification}
                  onCheckedChange={(checked) => updateRule('requirePlaidVerification', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Calculation Rules */}
          <div>
            <h3 className="text-lg font-medium mb-4">Calculation Logic</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label htmlFor="term-optimization">
                    Enable Term Optimization
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically optimize payment terms based on user's financial profile
                  </p>
                </div>
                <Switch
                  id="term-optimization"
                  checked={businessRules.enableTermOptimization}
                  onCheckedChange={(checked) => updateRule('enableTermOptimization', checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label htmlFor="round-terms">
                    Round Terms Up
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Round calculated payment terms up to the next whole month
                  </p>
                </div>
                <Switch
                  id="round-terms"
                  checked={businessRules.roundTermsUp}
                  onCheckedChange={(checked) => updateRule('roundTermsUp', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Qualification Thresholds */}
          <div>
            <h3 className="text-lg font-medium mb-4">Qualification Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-debt">
                  Minimum Debt Amount ($)
                </Label>
                <Input
                  id="min-debt"
                  type="number"
                  value={businessRules.minimumDebtAmount}
                  onChange={(e) => updateRule('minimumDebtAmount', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Users with debt below this amount will not qualify
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-variance">
                  Maximum Budget Variance (%)
                </Label>
                <Input
                  id="budget-variance"
                  type="number"
                  value={businessRules.maximumBudgetVariance}
                  onChange={(e) => updateRule('maximumBudgetVariance', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum allowed variance between estimated and actual budget
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Settings Summary */}
        <Card className="p-4 bg-blue-50">
          <h3 className="text-lg font-medium mb-3 text-blue-800">Current Business Rules Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plaid Verification:</span>
                <span className={businessRules.requirePlaidVerification ? 'text-green-600' : 'text-gray-500'}>
                  {businessRules.requirePlaidVerification ? 'Required' : 'Optional'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Term Optimization:</span>
                <span className={businessRules.enableTermOptimization ? 'text-green-600' : 'text-gray-500'}>
                  {businessRules.enableTermOptimization ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Round Terms Up:</span>
                <span className={businessRules.roundTermsUp ? 'text-green-600' : 'text-gray-500'}>
                  {businessRules.roundTermsUp ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Min Debt Amount:</span>
                <span className="font-medium">
                  ${businessRules.minimumDebtAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Budget Variance:</span>
                <span className="font-medium">
                  {businessRules.maximumBudgetVariance}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Changes to business rules may affect user qualification 
            and program recommendations. Test thoroughly before applying to production.
          </p>
        </div>
      </div>
    </Card>
  );
}