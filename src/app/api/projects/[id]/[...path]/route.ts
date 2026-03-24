import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string; path: string[] } }
) {
  try {
    const { id, path: filePathArray } = params;

    // Construct the requested file path safely
    // Next.js runs from digitn-pro directory, so projects are in ./projects
    const basePath = path.join(process.cwd(), 'projects', id);
    const requestedPath = filePathArray ? filePathArray.join('/') : 'index.html';

    // Prevent directory traversal
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const absolutePath = path.join(basePath, normalizedPath);

    if (!absolutePath.startsWith(basePath)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      // Check if path is a directory, if so try to serve index.html inside it
      const stats = await fs.stat(absolutePath);
      let targetPath = absolutePath;

      if (stats.isDirectory()) {
        targetPath = path.join(absolutePath, 'index.html');
      }

      const fileBuffer = await fs.readFile(targetPath);

      // Determine content type
      const ext = path.extname(targetPath).toLowerCase();
      let contentType = 'text/plain';

      switch (ext) {
        case '.html': contentType = 'text/html; charset=utf-8'; break;
        case '.css': contentType = 'text/css; charset=utf-8'; break;
        case '.js': contentType = 'application/javascript; charset=utf-8'; break;
        case '.json': contentType = 'application/json; charset=utf-8'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg':
        case '.jpeg': contentType = 'image/jpeg'; break;
        case '.svg': contentType = 'image/svg+xml'; break;
      }

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (e) {
      // If file not found in Next.js, and we are in production, Nginx handles it
      // But in dev, we return 404
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}