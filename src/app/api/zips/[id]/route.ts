import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Construct the requested zip path safely
    // id should contain the .zip extension, e.g. "123-abc.zip"
    // Next.js runs from digitn-pro directory, so zips are in ./zips
    const basePath = path.join(process.cwd(), 'zips');

    const normalizedPath = path.normalize(id).replace(/^(\.\.(\/|\\|$))+/, '');
    const absolutePath = path.join(basePath, normalizedPath);

    if (!absolutePath.startsWith(basePath)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      const fileBuffer = await fs.readFile(absolutePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${normalizedPath}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (e) {
      // If file not found
      return new NextResponse('ZIP file not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}