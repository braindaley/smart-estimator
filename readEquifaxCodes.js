const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = '/Users/briandaley/Downloads/Equifax Codes 2025.xlsx';

try {
  // Read the Excel file
  const workbook = XLSX.readFile(excelPath);

  console.log('Sheet names in the Excel file:');
  workbook.SheetNames.forEach(name => {
    console.log(`  - ${name}`);
  });

  const allData = {};

  // Process each sheet
  workbook.SheetNames.forEach(sheetName => {
    console.log('\n' + '='.repeat(60));
    console.log(`Sheet: ${sheetName}`);
    console.log('='.repeat(60));

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length > 0) {
      console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`Number of rows: ${data.length}`);
      console.log('\nFirst 5 rows:');
      data.slice(0, 5).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    }

    allData[sheetName] = data;
  });

  // Save as JSON for reference
  const outputPath = path.join(__dirname, 'src', 'data', 'equifaxCodes.json');

  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
  console.log(`\n\nData saved to ${outputPath}`);

  // Also create a TypeScript interface file
  const tsContent = `// Generated from Equifax Codes 2025.xlsx
export interface EquifaxCodes {
${Object.keys(allData).map(sheet => {
  if (allData[sheet].length > 0) {
    const sample = allData[sheet][0];
    return `  "${sheet}": Array<{
${Object.keys(sample).map(key => `    "${key}": string | number;`).join('\n')}
  }>;`;
  }
  return `  "${sheet}": Array<any>;`;
}).join('\n')}
}

export const equifaxCodes: EquifaxCodes = ${JSON.stringify(allData, null, 2)};
`;

  const tsOutputPath = path.join(__dirname, 'src', 'data', 'equifaxCodes.ts');
  fs.writeFileSync(tsOutputPath, tsContent);
  console.log(`TypeScript file saved to ${tsOutputPath}`);

} catch (error) {
  console.error('Error reading Excel file:', error);
}