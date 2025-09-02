'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Eye } from 'lucide-react';
import { MessagingConfig } from '@/lib/types/calculator-settings';

interface MessagingSectionProps {
  messaging: MessagingConfig;
  onChange: (messaging: MessagingConfig) => void;
}

export function MessagingSection({ messaging, onChange }: MessagingSectionProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">Messaging & CTAs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure user-facing messages and call-to-action text
            </p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        <div className="space-y-6">
          {/* Qualified Prospect Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Qualified Prospect Messages</h3>
              <ChevronDown className="h-5 w-5 text-green-600" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="qualified-cta">CTA Text</Label>
                <Input
                  id="qualified-cta"
                  value={messaging.qualifiedProspect.ctaText}
                  onChange={(e) => 
                    onChange({
                      ...messaging,
                      qualifiedProspect: {
                        ...messaging.qualifiedProspect,
                        ctaText: e.target.value
                      }
                    })
                  }
                  placeholder="Enter the main call-to-action text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualified-button">Button Text</Label>
                <Input
                  id="qualified-button"
                  value={messaging.qualifiedProspect.buttonText}
                  onChange={(e) => 
                    onChange({
                      ...messaging,
                      qualifiedProspect: {
                        ...messaging.qualifiedProspect,
                        buttonText: e.target.value
                      }
                    })
                  }
                  placeholder="Enter the button text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualified-message">Supporting Message</Label>
                <Textarea
                  id="qualified-message"
                  value={messaging.qualifiedProspect.message}
                  onChange={(e) => 
                    onChange({
                      ...messaging,
                      qualifiedProspect: {
                        ...messaging.qualifiedProspect,
                        message: e.target.value
                      }
                    })
                  }
                  placeholder="Enter the supporting message that appears below the CTA"
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Non-Qualified Prospect Section */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800">Non-Qualified Prospect Messages</h3>
              <ChevronDown className="h-5 w-5 text-yellow-600" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nonqualified-message">Main Message</Label>
                <Textarea
                  id="nonqualified-message"
                  value={messaging.nonQualifiedProspect.message}
                  onChange={(e) => 
                    onChange({
                      ...messaging,
                      nonQualifiedProspect: {
                        ...messaging.nonQualifiedProspect,
                        message: e.target.value
                      }
                    })
                  }
                  placeholder="Message shown to non-qualified prospects"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternative-button">Alternative Button Text</Label>
                <Input
                  id="alternative-button"
                  value={messaging.nonQualifiedProspect.alternativeButtonText}
                  onChange={(e) => 
                    onChange({
                      ...messaging,
                      nonQualifiedProspect: {
                        ...messaging.nonQualifiedProspect,
                        alternativeButtonText: e.target.value
                      }
                    })
                  }
                  placeholder="Button text for non-qualified prospects"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Urgency Messaging Section */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-red-50 rounded-lg">
              <h3 className="text-lg font-medium text-red-800">Urgency Messaging</h3>
              <ChevronDown className="h-5 w-5 text-red-600" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-1">
                  <Label htmlFor="urgency-toggle">
                    Enable Urgency Messaging
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show time-sensitive messaging to encourage action
                  </p>
                </div>
                <Switch
                  id="urgency-toggle"
                  checked={messaging.urgencyMessaging.enabled}
                  onCheckedChange={(checked) => 
                    onChange({
                      ...messaging,
                      urgencyMessaging: {
                        ...messaging.urgencyMessaging,
                        enabled: checked
                      }
                    })
                  }
                />
              </div>

              {messaging.urgencyMessaging.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="urgency-text">Urgency Message</Label>
                  <Input
                    id="urgency-text"
                    value={messaging.urgencyMessaging.text}
                    onChange={(e) => 
                      onChange({
                        ...messaging,
                        urgencyMessaging: {
                          ...messaging.urgencyMessaging,
                          text: e.target.value
                        }
                      })
                    }
                    placeholder="Limited time offer - act now!"
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {showPreview && (
          <Card className="p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Message Preview</h3>
            
            <div className="space-y-6">
              <div className="bg-white p-4 rounded border-2 border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Qualified Prospect View:</h4>
                <div className="space-y-2">
                  <p className="font-semibold">{messaging.qualifiedProspect.ctaText}</p>
                  <p className="text-sm text-gray-600">{messaging.qualifiedProspect.message}</p>
                  {messaging.urgencyMessaging.enabled && (
                    <p className="text-xs text-red-600 font-medium">{messaging.urgencyMessaging.text}</p>
                  )}
                  <Button className="mt-2">{messaging.qualifiedProspect.buttonText}</Button>
                </div>
              </div>

              <div className="bg-white p-4 rounded border-2 border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Non-Qualified Prospect View:</h4>
                <div className="space-y-2">
                  <p className="text-sm">{messaging.nonQualifiedProspect.message}</p>
                  <Button variant="outline" className="mt-2">
                    {messaging.nonQualifiedProspect.alternativeButtonText}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tips:</strong> Keep messages concise and action-oriented. Use urgency messaging sparingly 
            to maintain credibility. Test different variations to optimize conversion rates.
          </p>
        </div>
      </div>
    </Card>
  );
}