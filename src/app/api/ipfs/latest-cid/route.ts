import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the latest-db-cid.json file
    const filePath = path.join(process.cwd(), 'src', 'utils', 'ipfs', 'latest-db-cid.json');
    
    // Read the file using fs
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse the JSON content
    const data = JSON.parse(fileContents);
    
    // Return the data
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error reading latest CID file:', error);
    return NextResponse.json(
      { error: 'Failed to read latest CID', message: error.message },
      { status: 500 }
    );
  }
} 