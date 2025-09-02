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

interface CreditorDataSectionProps {
  creditorData: CreditorData;
  onChange: (creditorData: CreditorData) => void;
}

export function CreditorDataSection({ creditorData, onChange }: CreditorDataSectionProps) {
  const [newCreditorName, setNewCreditorName] = useState('');
  const [newSettlementRate, setNewSettlementRate] = useState(0);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);

  const creditorEntries = Object.entries(creditorData.creditorSettlementRates);

  const addCreditor = () => {
    if (!newCreditorName.trim() || newSettlementRate <= 0) {
      alert('Please enter a valid creditor name and settlement rate');
      return;
    }

    const updatedRates = {
      ...creditorData.creditorSettlementRates,
      [newCreditorName.trim()]: newSettlementRate
    };

    onChange({
      ...creditorData,
      creditorSettlementRates: updatedRates,
      lastUpdated: new Date().toISOString()
    });

    setNewCreditorName('');
    setNewSettlementRate(0);
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

  const updateCreditorRate = (creditorName: string, newRate: number) => {
    const updatedRates = {
      ...creditorData.creditorSettlementRates,
      [creditorName]: newRate
    };

    onChange({
      ...creditorData,
      creditorSettlementRates: updatedRates,
      lastUpdated: new Date().toISOString()
    });
  };

  const updateFallbackRate = (rate: number) => {
    onChange({
      ...creditorData,
      fallbackRate: rate,
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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate that it's a valid creditor rates object
        if (typeof importedData !== 'object' || Array.isArray(importedData)) {
          throw new Error('Invalid format');
        }

        // Validate all values are numbers
        for (const [key, value] of Object.entries(importedData)) {
          if (typeof value !== 'number' || value < 0 || value > 100) {
            throw new Error(`Invalid rate for ${key}: ${value}`);
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
    
    // Reset file input
    event.target.value = '';
  };

  const handleJsonImport = () => {
    try {
      const importedData = JSON.parse(jsonInput);
      
      // Validate format
      if (typeof importedData !== 'object' || Array.isArray(importedData)) {
        throw new Error('Invalid format');
      }

      // Validate all values are numbers
      for (const [key, value] of Object.entries(importedData)) {
        if (typeof value !== 'number' || value < 0 || value > 100) {
          throw new Error(`Invalid rate for ${key}: ${value}`);
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
              Manage creditor-specific settlement rates and fallback values
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportCreditorData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
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
                  Import File
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
        </div>

        {/* Fallback Rate Configuration */}
        <Card className="p-4 bg-yellow-50">
          <div className="space-y-2">
            <Label htmlFor="fallback-rate">
              Fallback Settlement Rate (%)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="fallback-rate"
                type="number"
                value={creditorData.fallbackRate}
                onChange={(e) => updateFallbackRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                Used when creditor is not found in the database
              </span>
            </div>
          </div>
        </Card>

        {/* JSON Editor */}
        {showJsonEditor && (
          <Card className="p-4 bg-muted/50">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">JSON Editor</h3>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"creditor_name": settlement_rate, ...}'
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
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="creditor-name">Creditor Name</Label>
              <Input
                id="creditor-name"
                value={newCreditorName}
                onChange={(e) => setNewCreditorName(e.target.value)}
                placeholder="Enter creditor name"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="settlement-rate">Settlement Rate (%)</Label>
              <Input
                id="settlement-rate"
                type="number"
                value={newSettlementRate}
                onChange={(e) => setNewSettlementRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <Button onClick={addCreditor}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
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
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creditor Name</TableHead>
                    <TableHead>Settlement Rate (%)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditorEntries.map(([creditorName, rate]) => (
                    <TableRow key={creditorName}>
                      <TableCell className="font-medium">
                        {creditorName}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={rate}
                          onChange={(e) => updateCreditorRate(creditorName, parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
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
              <p className="text-xs">Add creditors manually or import from JSON</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <Card className="p-4 bg-green-50">
          <h3 className="text-lg font-medium mb-3 text-green-800">Data Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Creditors</div>
              <div className="text-2xl font-bold text-green-600">
                {creditorEntries.length}
              </div>
            </div>
            <div>
              <div className="font-medium">Avg Settlement Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {creditorEntries.length > 0 
                  ? (creditorEntries.reduce((sum, [, rate]) => sum + rate, 0) / creditorEntries.length).toFixed(1)
                  : '0'
                }%
              </div>
            </div>
            <div>
              <div className="font-medium">Fallback Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {creditorData.fallbackRate}%
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

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Data Format:</strong> Settlement rates should be entered as percentages (0-100). 
            The system will use creditor-specific rates when available, falling back to the default rate 
            for unknown creditors.
          </p>
        </div>
      </div>
    </Card>
  );
}