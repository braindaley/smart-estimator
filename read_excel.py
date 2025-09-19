import pandas as pd
import json

excel_path = '/Users/briandaley/Downloads/Equifax Codes 2025.xlsx'

try:
    # Read all sheets from the Excel file
    excel_file = pd.ExcelFile(excel_path)

    print("Sheet names in the Excel file:")
    for sheet in excel_file.sheet_names:
        print(f"  - {sheet}")
    print()

    # Store all data
    all_data = {}

    # Read each sheet
    for sheet_name in excel_file.sheet_names:
        print(f"\n{'='*60}")
        print(f"Sheet: {sheet_name}")
        print('='*60)

        df = pd.read_excel(excel_path, sheet_name=sheet_name)

        print(f"Columns: {list(df.columns)}")
        print(f"Number of rows: {len(df)}")
        print("\nFirst 5 rows:")
        print(df.head())

        # Convert to dict for storage
        all_data[sheet_name] = df.to_dict('records')

    # Save as JSON for easy reference
    with open('equifax_codes.json', 'w') as f:
        json.dump(all_data, f, indent=2, default=str)

    print("\n\nData saved to equifax_codes.json")

except Exception as e:
    print(f"Error reading Excel file: {e}")