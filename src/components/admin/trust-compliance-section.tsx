'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { TrustComplianceConfig } from '@/lib/types/calculator-settings';

interface TrustComplianceSectionProps {
  trustCompliance: TrustComplianceConfig;
  onChange: (trustCompliance: TrustComplianceConfig) => void;
}

export function TrustComplianceSection({ trustCompliance, onChange }: TrustComplianceSectionProps) {
  const [newBadge, setNewBadge] = useState('');
  const [newButtonText, setNewButtonText] = useState('');
  const [newDisclaimer, setNewDisclaimer] = useState('');

  const addBadge = () => {
    if (!newBadge.trim()) return;
    onChange({
      ...trustCompliance,
      footerBadges: [...trustCompliance.footerBadges, newBadge.trim()]
    });
    setNewBadge('');
  };

  const removeBadge = (index: number) => {
    onChange({
      ...trustCompliance,
      footerBadges: trustCompliance.footerBadges.filter((_, i) => i !== index)
    });
  };

  const updateBadge = (index: number, value: string) => {
    const updatedBadges = trustCompliance.footerBadges.map((badge, i) => 
      i === index ? value : badge
    );
    onChange({
      ...trustCompliance,
      footerBadges: updatedBadges
    });
  };

  const addButtonText = () => {
    if (!newButtonText.trim()) return;
    onChange({
      ...trustCompliance,
      alternativeButtonTexts: [...trustCompliance.alternativeButtonTexts, newButtonText.trim()]
    });
    setNewButtonText('');
  };

  const removeButtonText = (index: number) => {
    onChange({
      ...trustCompliance,
      alternativeButtonTexts: trustCompliance.alternativeButtonTexts.filter((_, i) => i !== index)
    });
  };

  const updateButtonText = (index: number, value: string) => {
    const updatedTexts = trustCompliance.alternativeButtonTexts.map((text, i) => 
      i === index ? value : text
    );
    onChange({
      ...trustCompliance,
      alternativeButtonTexts: updatedTexts
    });
  };

  const addDisclaimer = () => {
    if (!newDisclaimer.trim()) return;
    onChange({
      ...trustCompliance,
      complianceDisclaimers: [...trustCompliance.complianceDisclaimers, newDisclaimer.trim()]
    });
    setNewDisclaimer('');
  };

  const removeDisclaimer = (index: number) => {
    onChange({
      ...trustCompliance,
      complianceDisclaimers: trustCompliance.complianceDisclaimers.filter((_, i) => i !== index)
    });
  };

  const updateDisclaimer = (index: number, value: string) => {
    const updatedDisclaimers = trustCompliance.complianceDisclaimers.map((disclaimer, i) => 
      i === index ? value : disclaimer
    );
    onChange({
      ...trustCompliance,
      complianceDisclaimers: updatedDisclaimers
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Trust & Compliance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage trust badges, button alternatives, and compliance disclaimers
          </p>
        </div>

        <div className="space-y-6">
          {/* Footer Trust Badges */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Footer Trust Badges</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter badge text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-48"
                />
                <Button onClick={addBadge} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {trustCompliance.footerBadges.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Badge Text</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trustCompliance.footerBadges.map((badge, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={badge}
                          onChange={(e) => updateBadge(index, e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => removeBadge(index)} 
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
              <div className="text-center py-6 text-muted-foreground border rounded-lg">
                No trust badges configured
              </div>
            )}
          </div>

          {/* Alternative Button Texts */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Alternative Button Text Options</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter button text"
                  value={newButtonText}
                  onChange={(e) => setNewButtonText(e.target.value)}
                  className="w-48"
                />
                <Button onClick={addButtonText} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {trustCompliance.alternativeButtonTexts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Button Text</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trustCompliance.alternativeButtonTexts.map((text, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={text}
                          onChange={(e) => updateButtonText(index, e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" disabled className="bg-blue-600 text-white">
                          {text}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => removeButtonText(index)} 
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
              <div className="text-center py-6 text-muted-foreground border rounded-lg">
                No alternative button texts configured
              </div>
            )}
          </div>

          {/* Compliance Disclaimers */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Compliance Disclaimers</h3>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Enter disclaimer text"
                  value={newDisclaimer}
                  onChange={(e) => setNewDisclaimer(e.target.value)}
                  className="w-64 h-12"
                />
                <Button onClick={addDisclaimer} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {trustCompliance.complianceDisclaimers.length > 0 ? (
              <div className="space-y-3">
                {trustCompliance.complianceDisclaimers.map((disclaimer, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Textarea
                      value={disclaimer}
                      onChange={(e) => updateDisclaimer(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button 
                      onClick={() => removeDisclaimer(index)} 
                      size="sm" 
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground border rounded-lg">
                No compliance disclaimers configured
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <Card className="p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Trust Elements Preview</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Trust Badges:</Label>
              <div className="flex gap-2 mt-1">
                {trustCompliance.footerBadges.map((badge, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Button Options:</Label>
              <div className="flex gap-2 mt-1">
                {trustCompliance.alternativeButtonTexts.map((text, index) => (
                  <Button key={index} size="sm" variant="outline" disabled>
                    {text}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Disclaimers:</Label>
              <div className="space-y-1 mt-1">
                {trustCompliance.complianceDisclaimers.map((disclaimer, index) => (
                  <p key={index} className="text-xs text-gray-600">
                    • {disclaimer}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Compliance Note:</strong> All disclaimers should be reviewed by legal counsel 
            to ensure compliance with applicable debt relief and consumer protection regulations.
          </p>
        </div>
      </div>
    </Card>
  );
}