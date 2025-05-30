import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Require authentication for this endpoint in production
    // This is a simple implementation - in production, use proper auth
    const authHeader = request.headers.get('authorization');
    
    // In production, uncomment this block and implement proper auth
    /*
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    // Validate the token against your auth system
    if (token !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    */
    
    // Parse the request body
    const body = await request.json();
    const { databaseCID } = body;
    
    if (!databaseCID) {
      return NextResponse.json(
        { error: 'databaseCID is required' },
        { status: 400 }
      );
    }
    
    // Path to the latest-db-cid.json file
    const filePath = path.join(process.cwd(), 'src', 'utils', 'ipfs', 'latest-db-cid.json');
    
    // Create the JSON content
    const jsonContent = JSON.stringify({ databaseCID }, null, 2);
    
    // Write to the file
    fs.writeFileSync(filePath, jsonContent, 'utf8');
    
    return NextResponse.json({ success: true, databaseCID }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating CID file:', error);
    return NextResponse.json(
      { error: 'Failed to update CID file', message: error.message },
      { status: 500 }
    );
  }
} 