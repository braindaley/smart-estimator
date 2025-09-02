'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { FeeStructure } from '@/lib/types/calculator-settings';

interface FeeStructureSectionProps {
  feeStructure: FeeStructure;
  onChange: (feeStructure: FeeStructure) => void;
}

export function FeeStructureSection({ feeStructure, onChange }: FeeStructureSectionProps) {
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState(0);

  const addAdditionalFee = () => {
    if (!newFeeName.trim() || newFeeAmount <= 0) {
      alert('Please enter a valid fee name and amount');
      return;
    }

    const newFee = {
      name: newFeeName.trim(),
      amount: newFeeAmount,
      enabled: true
    };

    onChange({
      ...feeStructure,
      additionalFees: [...feeStructure.additionalFees, newFee]
    });

    setNewFeeName('');
    setNewFeeAmount(0);
  };

  const removeFee = (index: number) => {
    const updatedFees = feeStructure.additionalFees.filter((_, i) => i !== index);
    onChange({
      ...feeStructure,
      additionalFees: updatedFees
    });
  };

  const updateFee = (index: number, field: 'name' | 'amount' | 'enabled', value: any) => {
    const updatedFees = feeStructure.additionalFees.map((fee, i) => {
      if (i === index) {
        return { ...fee, [field]: value };
      }
      return fee;
    });

    onChange({
      ...feeStructure,
      additionalFees: updatedFees
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Fee Structure</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure monthly fees and additional charges
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="legal-fee">
              Legal/Processing Monthly Fee ($)
            </Label>
            <Input
              id="legal-fee"
              type="number"
              value={feeStructure.legalProcessingMonthlyFee}
              onChange={(e) => 
                onChange({ 
                  ...feeStructure, 
                  legalProcessingMonthlyFee: parseFloat(e.target.value) || 0 
                })
              }
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Monthly fee charged for legal and processing services
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buffer-amount">
              Buffer Amount ($)
            </Label>
            <Input
              id="buffer-amount"
              type="number"
              value={feeStructure.bufferAmount}
              onChange={(e) => 
                onChange({ 
                  ...feeStructure, 
                  bufferAmount: parseFloat(e.target.value) || 0 
                })
              }
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Buffer amount added to calculations for safety margin
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Additional Fees</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Fee name"
                value={newFeeName}
                onChange={(e) => setNewFeeName(e.target.value)}
                className="w-32"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newFeeAmount}
                onChange={(e) => setNewFeeAmount(parseFloat(e.target.value) || 0)}
                className="w-24"
                min="0"
                step="0.01"
              />
              <Button onClick={addAdditionalFee} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {feeStructure.additionalFees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Name</TableHead>
                  <TableHead>Amount ($)</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructure.additionalFees.map((fee, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={fee.name}
                        onChange={(e) => updateFee(index, 'name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={fee.amount}
                        onChange={(e) => updateFee(index, 'amount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={fee.enabled}
                        onCheckedChange={(checked) => updateFee(index, 'enabled', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => removeFee(index)} 
                        size="sm" 
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No additional fees configured
            </div>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Fee Structure Summary:</strong>
            <br />
            • Legal/Processing: ${feeStructure.legalProcessingMonthlyFee}/month
            <br />
            • Buffer: ${feeStructure.bufferAmount}
            <br />
            • Additional Fees: {feeStructure.additionalFees.filter(f => f.enabled).length} enabled
          </p>
        </div>
      </div>
    </Card>
  );
}