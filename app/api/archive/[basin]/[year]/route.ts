import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ basin: string; year: string }> }
) {
  try {
    const { basin, year } = await params;
    
    // Validate basin parameter
    if (!['atl', 'pac'].includes(basin)) {
      return NextResponse.json(
        { error: 'Invalid basin. Must be "atl" or "pac"' },
        { status: 400 }
      );
    }
    
    // Validate year parameter
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1850 || yearNum > 2025) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 1850 and 2025' },
        { status: 400 }
      );
    }
    
    // Construct file path
    const filePath = path.join(process.cwd(), 'archive', basin, `${year}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Archive data not found for the specified basin and year' },
        { status: 404 }
      );
    }
    
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Set CORS headers
    const response = NextResponse.json(jsonData);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
    
  } catch (error) {
    console.error('Error reading archive data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
