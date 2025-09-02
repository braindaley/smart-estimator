import { NextRequest, NextResponse } from 'next/server';
import { CalculatorSettings } from '@/lib/types/calculator-settings';
import { defaultCalculatorSettings } from '@/lib/config/default-calculator-settings';
import * as fs from 'fs/promises';
import * as path from 'path';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'calculator-settings.json');

async function loadSettings(): Promise<CalculatorSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default settings
    return defaultCalculatorSettings;
  }
}

async function saveSettings(settings: CalculatorSettings): Promise<void> {
  await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
}

export async function GET() {
  try {
    const settings = await loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings: CalculatorSettings = await request.json();
    
    // Validate settings structure
    if (!settings.debtTiers || !settings.settlement || !settings.feeStructure) {
      return NextResponse.json(
        { error: 'Invalid settings structure' },
        { status: 400 }
      );
    }
    
    // Save settings
    await saveSettings(settings);
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const partialSettings = await request.json();
    const currentSettings = await loadSettings();
    
    // Merge partial updates with current settings
    const updatedSettings = {
      ...currentSettings,
      ...partialSettings
    };
    
    await saveSettings(updatedSettings);
    
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Reset to default settings
    await saveSettings(defaultCalculatorSettings);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings reset to defaults',
      settings: defaultCalculatorSettings 
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}