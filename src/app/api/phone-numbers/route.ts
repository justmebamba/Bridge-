
'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// The path to the JSON file, assuming it's in the `src/data` directory
const dataFilePath = path.join(process.cwd(), 'src/data/phone-numbers.json');

export async function GET() {
  try {
    // Read the JSON file
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Return the phone numbers
    return NextResponse.json(data.phoneNumbers);
  } catch (error) {
    console.error('Error reading phone numbers data:', error);
    // In case of an error (e.g., file not found), return an error response
    return NextResponse.json({ message: 'Error fetching phone numbers' }, { status: 500 });
  }
}
