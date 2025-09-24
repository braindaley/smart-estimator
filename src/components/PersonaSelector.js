'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  getPersonasList,
  applyPersona,
  clearPersonaData,
  getCurrentPersona
} from '@/lib/personas';

export default function PersonaSelector({ userId, onPersonaChange, className = '' }) {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personas] = useState(getPersonasList());

  useEffect(() => {
    // Load currently selected persona on mount
    const currentPersona = getCurrentPersona(userId);
    if (currentPersona) {
      setSelectedPersona(currentPersona.id);
    }
  }, [userId]);

  const handlePersonaSelect = async (personaId) => {
    if (personaId === selectedPersona) return;

    setIsLoading(true);

    try {
      if (personaId === 'clear') {
        clearPersonaData(userId);
        setSelectedPersona(null);
        if (onPersonaChange) {
          onPersonaChange(null);
        }
      } else {
        const persona = applyPersona(personaId, userId);
        setSelectedPersona(personaId);
        if (onPersonaChange) {
          onPersonaChange(persona);
        }
      }

      // Small delay to ensure data is stored before refresh
      setTimeout(() => {
        setIsLoading(false);
        // Force page refresh to update all components with new persona data
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error applying persona:', error);
      alert('Failed to apply persona. Please try again.');
      setIsLoading(false);
    }
  };

  const getPersonaBadgeColor = (personaId) => {
    const colorMap = {
      'high-debt-high-income': 'bg-purple-100 text-purple-800 border-purple-200',
      'moderate-debt-moderate-income': 'bg-blue-100 text-blue-800 border-blue-200',
      'low-income-high-debt': 'bg-red-100 text-red-800 border-red-200',
      'young-professional': 'bg-green-100 text-green-800 border-green-200',
      'senior-fixed-income': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colorMap[personaId] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPersonaIcon = (personaId) => {
    const iconMap = {
      'high-debt-high-income': '💼',
      'moderate-debt-moderate-income': '🏫',
      'low-income-high-debt': '👩‍👧',
      'young-professional': '🎓',
      'senior-fixed-income': '👴'
    };
    return iconMap[personaId] || '👤';
  };

  return (
    <Card className={`border-2 border-dashed border-blue-300 bg-blue-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">🧪 Persona Testing Mode</h3>
            <p className="text-sm text-blue-700">
              Select a financial persona to test different debt settlement scenarios
            </p>
          </div>
          {selectedPersona && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-700">Active:</span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getPersonaBadgeColor(selectedPersona)}`}>
                {getPersonaIcon(selectedPersona)}
                {personas.find(p => p.id === selectedPersona)?.name}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handlePersonaSelect(persona.id)}
              disabled={isLoading}
              className={`p-3 rounded-lg border text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPersona === persona.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getPersonaIcon(persona.id)}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{persona.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{persona.description}</p>
                </div>
              </div>
            </button>
          ))}

          {/* Clear Selection Button */}
          <button
            onClick={() => handlePersonaSelect('clear')}
            disabled={isLoading || !selectedPersona}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚫</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">Clear Selection</h4>
                <p className="text-xs text-gray-600 mt-1">Use real Plaid/Credit data</p>
              </div>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-blue-700">Applying persona...</span>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Persona data is stored locally and will override real API data.
            Use "Clear Selection" to return to live data from Plaid and credit APIs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}