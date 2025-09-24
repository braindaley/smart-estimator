// Narrative Codes Setup for Persona Testing
// This automatically sets up the narrative codes required for persona testing

export const DEFAULT_NARRATIVE_CODES = [
  // Standard Credit Rating Codes
  {
    code: 'R1',
    description: 'Pays as agreed',
    includeInSettlement: false
  },
  {
    code: 'R2',
    description: '30 days past due',
    includeInSettlement: true
  },
  {
    code: 'R3',
    description: '60 days past due',
    includeInSettlement: true
  },
  {
    code: 'R4',
    description: '90 days past due',
    includeInSettlement: true
  },
  {
    code: 'R9',
    description: 'Collection account',
    includeInSettlement: true
  },
  {
    code: 'R7',
    description: 'Making regular payments under wage garnishment or similar arrangement',
    includeInSettlement: false
  },
  {
    code: 'R8',
    description: 'Repossession',
    includeInSettlement: false
  },
  // Persona-specific Narrative Codes
  {
    code: 'FE',
    description: 'Credit card',
    includeInSettlement: true
  },
  {
    code: 'AU',
    description: 'Personal loan',
    includeInSettlement: true
  },
  {
    code: 'GS',
    description: 'Medical debt',
    includeInSettlement: true
  },
  {
    code: 'CV',
    description: 'Line of credit',
    includeInSettlement: true
  },
  {
    code: 'AV',
    description: 'Charge account',
    includeInSettlement: true
  },
  {
    code: 'CZ',
    description: 'Collection account',
    includeInSettlement: true
  },
  {
    code: 'BU',
    description: 'Student loan',
    includeInSettlement: false
  },
  {
    code: 'EX',
    description: 'Unsecured loan',
    includeInSettlement: true
  }
];

export const initializeNarrativeCodes = () => {
  if (typeof window === 'undefined') return;

  const existingCodes = localStorage.getItem('equifax-narrative-codes');

  // Only initialize if no codes exist yet
  if (!existingCodes) {
    localStorage.setItem('equifax-narrative-codes', JSON.stringify(DEFAULT_NARRATIVE_CODES));
    console.log('✅ Narrative codes initialized for persona testing');
  }
};

export const ensureNarrativeCodesForTesting = () => {
  if (typeof window === 'undefined') return;

  const existingCodes = localStorage.getItem('equifax-narrative-codes');

  if (!existingCodes) {
    localStorage.setItem('equifax-narrative-codes', JSON.stringify(DEFAULT_NARRATIVE_CODES));
  } else {
    // Ensure all required codes are present
    const currentCodes = JSON.parse(existingCodes);
    let needsUpdate = false;

    const requiredCodes = ['R1', 'R2', 'R3', 'R4', 'R9', 'FE', 'AU', 'GS', 'CV', 'AV', 'CZ', 'BU', 'EX'];

    requiredCodes.forEach(code => {
      const exists = currentCodes.find(c => c.code === code);
      if (!exists) {
        const defaultCode = DEFAULT_NARRATIVE_CODES.find(dc => dc.code === code);
        if (defaultCode) {
          currentCodes.push(defaultCode);
          needsUpdate = true;
        }
      }
    });

    if (needsUpdate) {
      localStorage.setItem('equifax-narrative-codes', JSON.stringify(currentCodes));
      console.log('✅ Narrative codes updated with required codes for persona testing');
    }
  }
};