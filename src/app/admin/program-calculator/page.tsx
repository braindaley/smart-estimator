'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { CalculatorSettings } from '@/lib/types/calculator-settings';
import { defaultCalculatorSettings } from '@/lib/config/default-calculator-settings';

// Import section components
import { DebtTierSection } from '@/components/admin/debt-tier-section';
import { CreditorDataSection } from '@/components/admin/creditor-data-section';

export default function ProgramCalculatorPage() {
  const [settings, setSettings] = useState<CalculatorSettings>(defaultCalculatorSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) {
          handleSave();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, settings]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/calculator-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load settings. Using defaults.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Using defaults.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/calculator-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        toast({
          title: 'Success',
          description: 'Settings saved successfully!',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/calculator-settings', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setHasUnsavedChanges(false);
        toast({
          title: 'Success',
          description: 'Settings reset to defaults successfully!',
        });
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `calculator-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setHasUnsavedChanges(true);
        toast({
          title: 'Success',
          description: 'Settings imported successfully! Remember to save.',
        });
      } catch (error) {
        console.error('Error importing settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to import settings. Invalid file format.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const updateSettings = (updates: Partial<CalculatorSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="text-center">
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <Toaster />
      <main className="flex-1">
        <div className="bg-background border-b">
          <div className="container mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Program Calculator Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage business logic and configuration for the Momentum Program Calculator
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving}
                  size="sm"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
            {hasUnsavedChanges && (
              <div className="mt-2 text-sm text-yellow-600">
                You have unsaved changes. Press Ctrl+S to save.
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Tabs defaultValue="debt-tiers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="debt-tiers">Debt Tiers</TabsTrigger>
              <TabsTrigger value="creditors">Creditor Data</TabsTrigger>
            </TabsList>

            <TabsContent value="debt-tiers">
              <DebtTierSection
                debtTiers={settings.debtTiers}
                onChange={(debtTiers) => updateSettings({ debtTiers })}
              />
            </TabsContent>

            <TabsContent value="creditors">
              <CreditorDataSection
                creditorData={settings.creditorData}
                onChange={(creditorData) => updateSettings({ creditorData })}
              />
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t">
            <Link href="/admin">
              <Button variant="outline">
                Back to Admin
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving}
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}