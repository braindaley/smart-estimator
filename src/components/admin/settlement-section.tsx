'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SettlementConfig } from '@/lib/types/calculator-settings';

interface SettlementSectionProps {
  settlement: SettlementConfig;
  onChange: (settlement: SettlementConfig) => void;
}

export function SettlementSection({ settlement, onChange }: SettlementSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Settlement Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure default settlement rates and validation rules
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fallback-rate">
              Fallback Settlement Rate: {settlement.fallbackSettlementRate}%
            </Label>
            <Slider
              id="fallback-rate"
              min={0}
              max={100}
              step={1}
              value={[settlement.fallbackSettlementRate]}
              onValueChange={(value) => 
                onChange({ ...settlement, fallbackSettlementRate: value[0] })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Used when a specific creditor settlement rate is not available
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-liquidity">
              Minimum Excess Liquidity Amount ($)
            </Label>
            <Input
              id="min-liquidity"
              type="number"
              value={settlement.minimumExcessLiquidity}
              onChange={(e) => 
                onChange({ ...settlement, minimumExcessLiquidity: parseFloat(e.target.value) || 0 })
              }
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Minimum amount of excess liquidity required for qualification
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="validation-toggle">
                Enable Settlement Rate Validation
              </Label>
              <p className="text-xs text-muted-foreground">
                Validate settlement rates against creditor-specific data
              </p>
            </div>
            <Switch
              id="validation-toggle"
              checked={settlement.enableSettlementRateValidation}
              onCheckedChange={(checked) => 
                onChange({ ...settlement, enableSettlementRateValidation: checked })
              }
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Settlement rates are applied as a percentage of the total debt amount. 
            The fallback rate is used when specific creditor data is unavailable.
          </p>
        </div>
      </div>
    </Card>
  );
}