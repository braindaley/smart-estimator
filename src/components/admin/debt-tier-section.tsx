'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';
import { DebtTier } from '@/lib/types/calculator-settings';

interface DebtTierSectionProps {
  debtTiers: DebtTier[];
  onChange: (debtTiers: DebtTier[]) => void;
}

export function DebtTierSection({ debtTiers, onChange }: DebtTierSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<DebtTier | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTier, setNewTier] = useState<Partial<DebtTier>>({
    programType: 'momentum',
    minAmount: 0,
    maxAmount: 0,
    feePercentage: 0,
    maxTerm: 0,
    legalProcessingFee: 0
  });

  const handleEdit = (tier: DebtTier) => {
    setEditingId(tier.id);
    setEditingTier({ ...tier });
  };

  const handleSaveEdit = () => {
    if (!editingTier) return;

    // Validate ranges don't overlap
    const otherTiers = debtTiers.filter(t => t.id !== editingTier.id && t.programType === editingTier.programType);
    const hasOverlap = otherTiers.some(t => 
      (editingTier.minAmount >= t.minAmount && editingTier.minAmount < t.maxAmount) ||
      (editingTier.maxAmount > t.minAmount && editingTier.maxAmount <= t.maxAmount)
    );

    if (hasOverlap) {
      alert('Debt tier ranges cannot overlap within the same program type!');
      return;
    }

    const updatedTiers = debtTiers.map(t => 
      t.id === editingTier.id ? editingTier : t
    );
    onChange(updatedTiers);
    setEditingId(null);
    setEditingTier(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTier(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this debt tier?')) {
      onChange(debtTiers.filter(t => t.id !== id));
    }
  };

  const handleAddNew = () => {
    if (!newTier.minAmount || !newTier.maxAmount || !newTier.feePercentage || !newTier.maxTerm) {
      alert('Please fill all required fields');
      return;
    }

    // Validate ranges don't overlap
    const sameProgramTiers = debtTiers.filter(t => t.programType === newTier.programType);
    const hasOverlap = sameProgramTiers.some(t => 
      (newTier.minAmount! >= t.minAmount && newTier.minAmount! < t.maxAmount) ||
      (newTier.maxAmount! > t.minAmount && newTier.maxAmount! <= t.maxAmount)
    );

    if (hasOverlap) {
      alert('Debt tier ranges cannot overlap within the same program type!');
      return;
    }

    const tier: DebtTier = {
      id: `tier-${Date.now()}`,
      minAmount: newTier.minAmount!,
      maxAmount: newTier.maxAmount!,
      feePercentage: newTier.feePercentage!,
      maxTerm: newTier.maxTerm!,
      legalProcessingFee: newTier.legalProcessingFee || 0,
      programType: 'momentum'
    };

    onChange([...debtTiers, tier]);
    setIsAddingNew(false);
    setNewTier({
      programType: 'momentum',
      minAmount: 0,
      maxAmount: 0,
      feePercentage: 0,
      maxTerm: 0,
      legalProcessingFee: 0
    });
  };

  const momentumTiers = debtTiers.filter(t => t.programType === 'momentum');

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Debt Tier Configuration</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure debt tiers for the Momentum program
            </p>
          </div>
          {!isAddingNew && (
            <Button onClick={() => setIsAddingNew(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Tier
            </Button>
          )}
        </div>

        {isAddingNew && (
          <Card className="p-4 bg-muted/50">
            <h3 className="text-lg font-medium mb-4">Add New Debt Tier</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Program Type</Label>
                <Select
                  value={newTier.programType}
                  onValueChange={(value) => setNewTier({ ...newTier, programType: value as 'momentum' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momentum">Momentum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min Amount ($)</Label>
                <Input
                  type="number"
                  value={newTier.minAmount}
                  onChange={(e) => setNewTier({ ...newTier, minAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Max Amount ($)</Label>
                <Input
                  type="number"
                  value={newTier.maxAmount}
                  onChange={(e) => setNewTier({ ...newTier, maxAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Fee Percentage (%)</Label>
                <Input
                  type="number"
                  value={newTier.feePercentage}
                  onChange={(e) => setNewTier({ ...newTier, feePercentage: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label>Max Term (months)</Label>
                <Input
                  type="number"
                  value={newTier.maxTerm}
                  onChange={(e) => setNewTier({ ...newTier, maxTerm: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <Label>Legal Processing Fee ($)</Label>
                <Input
                  type="number"
                  value={newTier.legalProcessingFee}
                  onChange={(e) => setNewTier({ ...newTier, legalProcessingFee: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddNew} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsAddingNew(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div>
          <h3 className="text-lg font-medium mb-3">Momentum Program Tiers</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Max Amount</TableHead>
                  <TableHead>Fee %</TableHead>
                  <TableHead>Max Term</TableHead>
                  <TableHead>Legal Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {momentumTiers.map((tier) => (
                  <TableRow key={tier.id}>
                    {editingId === tier.id ? (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingTier?.minAmount}
                            onChange={(e) => setEditingTier({ ...editingTier!, minAmount: parseFloat(e.target.value) })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingTier?.maxAmount}
                            onChange={(e) => setEditingTier({ ...editingTier!, maxAmount: parseFloat(e.target.value) })}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingTier?.feePercentage}
                            onChange={(e) => setEditingTier({ ...editingTier!, feePercentage: parseFloat(e.target.value) })}
                            className="w-20"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingTier?.maxTerm}
                            onChange={(e) => setEditingTier({ ...editingTier!, maxTerm: parseInt(e.target.value) })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingTier?.legalProcessingFee}
                            onChange={(e) => setEditingTier({ ...editingTier!, legalProcessingFee: parseFloat(e.target.value) })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button onClick={handleSaveEdit} size="sm" variant="ghost">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button onClick={handleCancelEdit} size="sm" variant="ghost">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>${tier.minAmount.toLocaleString()}</TableCell>
                        <TableCell>${tier.maxAmount.toLocaleString()}</TableCell>
                        <TableCell>{tier.feePercentage}%</TableCell>
                        <TableCell>{tier.maxTerm} mo</TableCell>
                        <TableCell>${tier.legalProcessingFee}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button onClick={() => handleEdit(tier)} size="sm" variant="ghost">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDelete(tier.id)} size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> Debt tier ranges must not overlap within the same program type. 
            Fee percentages should be between 0-100%. Terms are specified in months.
          </p>
        </div>
      </div>
    </Card>
  );
}