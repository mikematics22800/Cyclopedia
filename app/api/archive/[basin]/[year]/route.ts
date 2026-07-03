import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  BASINS,
  BASIN_ALIASES,
  getArchiveFilePath,
  resolveBasinId,
} from '../../../../../libs/basins';
import { normalizeArchiveData } from '../../../../../libs/normalizeArchive';

const VALID_BASINS = [...Object.keys(BASINS), ...Object.keys(BASIN_ALIASES)];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ basin: string; year: string }> }
) {
  try {
    const { basin, year } = await params;

    if (!VALID_BASINS.includes(basin)) {
      return NextResponse.json(
        { error: `Invalid basin. Must be one of: ${Object.keys(BASINS).join(', ')}` },
        { status: 400 }
      );
    }

    const basinId = resolveBasinId(basin);
    if (!basinId) {
      return NextResponse.json({ error: 'Invalid basin' }, { status: 400 });
    }

    const yearNum = parseInt(year);
    const { startYear, endYear } = BASINS[basinId];
    if (isNaN(yearNum) || yearNum < startYear || yearNum > endYear) {
      return NextResponse.json(
        { error: `Invalid year. Must be between ${startYear} and ${endYear}` },
        { status: 400 }
      );
    }

    const relativePath = getArchiveFilePath(basin, yearNum);
    if (!relativePath) {
      return NextResponse.json({ error: 'Invalid basin' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), ...relativePath.split('/'));

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Archive data not found for the specified basin and year' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = normalizeArchiveData(JSON.parse(fileContent));

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
