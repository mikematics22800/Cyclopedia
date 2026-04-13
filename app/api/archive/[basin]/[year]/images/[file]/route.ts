import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import {
  localArchiveImagePath,
  mimeForImageFile,
} from '@/libs/archiveImageServer';

export async function GET(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ basin: string; year: string; file: string }> },
) {
  try {
    const { basin, year, file } = await params;

    if (!['atl', 'pac'].includes(basin)) {
      return NextResponse.json(
        { error: 'Invalid basin. Must be "atl" or "pac"' },
        { status: 400 },
      );
    }

    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1850 || yearNum > 2025) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 1850 and 2025' },
        { status: 400 },
      );
    }

    const decoded = decodeURIComponent(file);
    const filePath = localArchiveImagePath(process.cwd(), basin, year, decoded);
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const buf = fs.readFileSync(filePath);
    const res = new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': mimeForImageFile(decoded),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
    return res;
  } catch (error) {
    console.error('Error serving archive image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
