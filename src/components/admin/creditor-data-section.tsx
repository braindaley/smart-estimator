'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Upload, Download, RefreshCw } from 'lucide-react';
import { CreditorData } from '@/lib/types/calculator-settings';
import { format } from 'date-fns';
import { parseCreditorExcelData, migrateCreditorData } from '@/lib/utils/creditor-import';

interface CreditorDataSectionProps {
  creditorData: CreditorData;
  onChange: (creditorData: CreditorData) => void;
}

// Supported term lengths that match current debt tiers
const SUPPORTED_TERMS = [28, 29, 30, 32, 33, 34, 39, 42];

export function CreditorDataSection({ creditorData, onChange }: CreditorDataSectionProps) {
  const [newCreditorName, setNewCreditorName] = useState('');
  const [newSettlementRates, setNewSettlementRates] = useState<Record<number, number>>({});
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [importing, setImporting] = useState(false);

  const creditorEntries = Object.entries(creditorData.creditorSettlementRates);

  // Initialize new settlement rates for all terms
  const initializeNewRates = () => {
    const rates: Record<number, number> = {};
    SUPPORTED_TERMS.forEach(term => {
      rates[term] = 60; // Default rate
    });
    return rates;
  };

  const addCreditor = () => {
    if (!newCreditorName.trim()) {
      alert('Please enter a valid creditor name');
      return;
    }

    // Check if at least one rate is set
    const hasValidRate = Object.values(newSettlementRates).some(rate => rate > 0);
    if (!hasValidRate) {
      alert('Please set at least one settlement rate');
      return;
    }

    const updatedRates = {
      ...creditorData.creditorSettlementRates,
      [newCreditorName.trim().toUpperCase()]: newSettlementRates
    };

    onChange({
      ...creditorData,
      creditorSettlementRates: updatedRates,
      lastUpdated: new Date().toISOString()
    });

    setNewCreditorName('');
    setNewSettlementRates({});
  };

  const removeCreditor = (creditorName: string) => {
    if (confirm(`Are you sure you want to remove ${creditorName}?`)) {
      const updatedRates = { ...creditorData.creditorSettlementRates };
      delete updatedRates[creditorName];

      onChange({
        ...creditorData,
        creditorSettlementRates: updatedRates,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const updateCreditorRateForTerm = (creditorName: string, term: number, newRate: number) => {
    const updatedRates = {
      ...creditorData.creditorSettlementRates,
      [creditorName]: {
        ...creditorData.creditorSettlementRates[creditorName],
        [term]: newRate
      }
    };

    onChange({
      ...creditorData,
      creditorSettlementRates: updatedRates,
      lastUpdated: new Date().toISOString()
    });
  };

  const exportCreditorData = () => {
    const dataStr = JSON.stringify(creditorData.creditorSettlementRates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `creditor-settlement-rates-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      // Read file as text (for CSV) or use library for Excel
      const text = await file.text();

      // Simple CSV parsing
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const rows = lines.map(line =>
        line.split(',').map(cell => {
          const trimmed = cell.trim();
          const num = parseFloat(trimmed);
          return isNaN(num) ? trimmed : num;
        })
      );

      // Parse the data
      const importedData = parseCreditorExcelData(rows);

      onChange({
        ...creditorData,
        creditorSettlementRates: importedData,
        lastUpdated: new Date().toISOString()
      });

      alert(`Successfully imported ${Object.keys(importedData).length} creditors!\n\n⚠️ Don't forget to click "Save Changes" to persist the data.`);
    } catch (error) {
      console.error('Error importing creditor data:', error);
      alert(`Failed to import creditor data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Validate format
        if (typeof importedData !== 'object' || Array.isArray(importedData)) {
          throw new Error('Invalid format');
        }

        // Validate structure: should be Record<string, Record<number, number>>
        for (const [creditor, rates] of Object.entries(importedData)) {
          if (typeof rates !== 'object' || Array.isArray(rates)) {
            throw new Error(`Invalid rates for ${creditor}`);
          }

          for (const [term, rate] of Object.entries(rates as Record<string, any>)) {
            if (typeof rate !== 'number' || rate < 0 || rate > 100) {
              throw new Error(`Invalid rate for ${creditor} term ${term}: ${rate}`);
            }
          }
        }

        onChange({
          ...creditorData,
          creditorSettlementRates: importedData,
          lastUpdated: new Date().toISOString()
        });

        alert('Creditor data imported successfully!');
      } catch (error) {
        console.error('Error importing creditor data:', error);
        alert('Failed to import creditor data. Please check the file format.');
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handleJsonImport = () => {
    try {
      const importedData = JSON.parse(jsonInput);

      // Validate format
      if (typeof importedData !== 'object' || Array.isArray(importedData)) {
        throw new Error('Invalid format');
      }

      // Validate structure
      for (const [creditor, rates] of Object.entries(importedData)) {
        if (typeof rates !== 'object' || Array.isArray(rates)) {
          throw new Error(`Invalid rates for ${creditor}`);
        }
      }

      onChange({
        ...creditorData,
        creditorSettlementRates: importedData,
        lastUpdated: new Date().toISOString()
      });

      setJsonInput('');
      setShowJsonEditor(false);
      alert('Creditor data imported successfully!');
    } catch (error) {
      console.error('Error parsing JSON:', error);
      alert('Failed to parse JSON data. Please check the format.');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">Creditor Data Management</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage creditor-specific settlement rates by program term length
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={exportCreditorData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleExcelImport}
                  className="hidden"
                  disabled={importing}
                />
                <Button variant="outline" size="sm" asChild disabled={importing}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importing...' : 'Import CSV'}
                  </span>
                </Button>
              </label>
              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import JSON
                  </span>
                </Button>
              </label>
              <Button
                onClick={() => setShowJsonEditor(!showJsonEditor)}
                variant="outline"
                size="sm"
              >
                Edit JSON
              </Button>
            </div>
            <p className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
              💡 After importing, click "Save Changes" at the top to persist data
            </p>
          </div>
        </div>

        {/* JSON Editor */}
        {showJsonEditor && (
          <Card className="p-4 bg-muted/50">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">JSON Editor</h3>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"CREDITOR_NAME": {28: 50, 30: 52, 34: 54}, ...}'
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleJsonImport} size="sm">
                  Import JSON
                </Button>
                <Button
                  onClick={() => setJsonInput(JSON.stringify(creditorData.creditorSettlementRates, null, 2))}
                  variant="outline"
                  size="sm"
                >
                  Load Current Data
                </Button>
                <Button onClick={() => setShowJsonEditor(false)} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Add New Creditor */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Add New Creditor</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="creditor-name">Creditor Name</Label>
              <Input
                id="creditor-name"
                value={newCreditorName}
                onChange={(e) => setNewCreditorName(e.target.value)}
                placeholder="Enter creditor name"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SUPPORTED_TERMS.map(term => (
                <div key={term}>
                  <Label htmlFor={`new-rate-${term}`}>{term} mo (%)</Label>
                  <Input
                    id={`new-rate-${term}`}
                    type="number"
                    value={newSettlementRates[term] || ''}
                    onChange={(e) => setNewSettlementRates({
                      ...newSettlementRates,
                      [term]: parseFloat(e.target.value) || 0
                    })}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="60"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={addCreditor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Creditor
              </Button>
              <Button
                onClick={() => setNewSettlementRates(initializeNewRates())}
                variant="outline"
              >
                Set All to 60%
              </Button>
            </div>
          </div>
        </Card>

        {/* Creditor List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Creditor Settlement Rates</h3>
            <div className="text-sm text-muted-foreground">
              Last Updated: {format(new Date(creditorData.lastUpdated), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>

          {creditorEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">Creditor Name</TableHead>
                    {SUPPORTED_TERMS.map(term => (
                      <TableHead key={term} className="text-center">{term} mo</TableHead>
                    ))}
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditorEntries.map(([creditorName, rates]) => (
                    <TableRow key={creditorName}>
                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                        {creditorName}
                      </TableCell>
                      {SUPPORTED_TERMS.map(term => (
                        <TableCell key={term}>
                          <Input
                            type="number"
                            value={rates[term] || ''}
                            onChange={(e) => updateCreditorRateForTerm(creditorName, term, parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-20 text-center"
                            placeholder="-"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Button
                          onClick={() => removeCreditor(creditorName)}
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
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <RefreshCw className="h-8 w-8 mx-auto mb-2" />
              <p>No creditor data configured</p>
              <p className="text-xs">Add creditors manually or import from CSV/JSON</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <Card className="p-4 bg-green-50">
          <h3 className="text-lg font-medium mb-3 text-green-800">Data Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Creditors</div>
              <div className="text-2xl font-bold text-green-600">
                {creditorEntries.length}
              </div>
            </div>
            <div>
              <div className="font-medium">Last Updated</div>
              <div className="text-xs font-medium text-green-600">
                {format(new Date(creditorData.lastUpdated), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-blue-800">
            <strong>Term-Based Rates:</strong> Settlement rates vary by program length (in months).
            The system determines the program term from the debt tier, then looks up the creditor-specific
            rate for that term.
          </p>
          <p className="text-sm text-blue-800">
            <strong>Fallback Logic:</strong> If a creditor is not found in this table, the system will use
            the tier-specific settlement rate from the Debt Tiers configuration.
          </p>
        </div>
      </div>
    </Card>
  );
}
