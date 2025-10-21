'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SettlementConfig } from '@/lib/types/calculator-settings';
import { Info } from 'lucide-react';

interface ProgramSettlementSectionProps {
  settlement: SettlementConfig;
  onChange: (settlement: SettlementConfig) => void;
}

export function ProgramSettlementSection({ settlement, onChange }: ProgramSettlementSectionProps) {
  const updateStandardRate = (rate: number) => {
    onChange({
      ...settlement,
      programFallbackRates: {
        ...settlement.programFallbackRates,
        standard: rate,
        momentum: settlement.programFallbackRates?.momentum || 60
      }
    });
  };

  // Ensure programFallbackRates exists with defaults
  const standardRate = settlement.programFallbackRates?.standard ?? 60;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Program Settlement Rates</h3>
          <p className="text-sm text-muted-foreground">
            Configure default settlement rates for each program type. These rates are used when a specific creditor rate is not available.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Standard Program Settlement Rate */}
          <Card className="p-4 border-blue-200 bg-blue-50/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-blue-900">Standard Program</h4>
                <Info className="h-4 w-4 text-blue-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="standard-settlement">
                  Fallback Settlement Rate (%)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="standard-settlement"
                    type="number"
                    value={standardRate}
                    onChange={(e) => updateStandardRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    Default: 60%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for debt amounts $1,000 - $100,000
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-2">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">About Settlement Rates</p>
              <p className="text-xs text-amber-800">
                Settlement rates represent the percentage of the original debt amount that will be paid to settle the account.
                For example, a 60% rate means paying $6,000 to settle a $10,000 debt. The Momentum Program uses tier-specific
                settlement rates (configured in the table below). This fallback rate is used for the Standard Program when
                a specific creditor rate is not configured in the Creditor Data section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}