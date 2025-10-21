/**
 * Utility functions for importing creditor settlement data from Excel/CSV
 */

/**
 * Parse creditor settlement data from Excel/CSV rows
 * Expected format:
 * Row 1: Headers with "Creditor" in first column, then month numbers (28, 29, 30, etc.)
 * Row 2+: Creditor name in first column, settlement percentages in month columns
 *
 * @param rows - Array of rows from Excel/CSV file
 * @returns Creditor settlement rates object
 */
export function parseCreditorExcelData(rows: any[][]): Record<string, Record<number, number>> {
  const creditorRates: Record<string, Record<number, number>> = {};

  if (rows.length < 2) {
    throw new Error('Invalid data: Need at least header row and one data row');
  }

  // First row contains headers
  const headerRow = rows[0];
  const monthColumns: { index: number; months: number }[] = [];

  // Find all month columns (numeric headers)
  headerRow.forEach((cell, index) => {
    // Skip first column (creditor name)
    if (index === 0) return;

    // Try to parse as number
    let monthValue: number | null = null;

    if (typeof cell === 'number') {
      monthValue = cell;
    } else if (typeof cell === 'string') {
      // Handle strings like "28", "MONTHS (Program Length)"
      const match = cell.match(/(\d+)/);
      if (match) {
        monthValue = parseInt(match[1], 10);
      }
    }

    if (monthValue && monthValue > 0 && monthValue <= 120) {
      monthColumns.push({ index, months: monthValue });
    }
  });

  if (monthColumns.length === 0) {
    throw new Error('No valid month columns found in header row');
  }

  // Process each creditor row (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Get creditor name from first column
    const creditorName = row[0]?.toString().trim().toUpperCase();

    // Skip empty rows
    if (!creditorName) continue;

    creditorRates[creditorName] = {};

    // Extract settlement rate for each month column
    monthColumns.forEach(({ index, months }) => {
      const cellValue = row[index];
      let rate: number | null = null;

      if (typeof cellValue === 'number') {
        rate = cellValue;
      } else if (typeof cellValue === 'string') {
        // Handle percentage strings like "50%", "52.5%"
        const cleaned = cellValue.replace('%', '').trim();
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
          rate = parsed;
        }
      }

      // Only add valid rates (0-100)
      if (rate !== null && rate >= 0 && rate <= 100) {
        creditorRates[creditorName][months] = rate;
      }
    });

    // If no valid rates found for this creditor, remove it
    if (Object.keys(creditorRates[creditorName]).length === 0) {
      delete creditorRates[creditorName];
    }
  }

  return creditorRates;
}

/**
 * Migrate old single-rate creditor data to new term-based format
 * Applies the same rate to all supported term lengths
 *
 * @param oldData - Old format: { "CHASE": 58 }
 * @param supportedTerms - Array of term lengths to populate (e.g., [28, 29, 30, 32, 33, 34, 39, 42])
 * @returns New format: { "CHASE": { 28: 58, 29: 58, ... } }
 */
export function migrateCreditorData(
  oldData: Record<string, number>,
  supportedTerms: number[] = [28, 29, 30, 32, 33, 34, 39, 42]
): Record<string, Record<number, number>> {
  const newData: Record<string, Record<number, number>> = {};

  for (const [creditor, rate] of Object.entries(oldData)) {
    newData[creditor] = {};

    // Apply same rate to all supported terms
    supportedTerms.forEach(term => {
      newData[creditor][term] = rate;
    });
  }

  return newData;
}

/**
 * Convert CSV text to 2D array of rows
 * @param csvText - CSV file content as string
 * @returns 2D array of rows
 */
export function parseCSVToRows(csvText: string): any[][] {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  return lines.map(line => {
    // Simple CSV parser (doesn't handle quoted commas)
    return line.split(',').map(cell => {
      const trimmed = cell.trim();

      // Try to parse as number
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        return num;
      }

      // Return as string
      return trimmed;
    });
  });
}
