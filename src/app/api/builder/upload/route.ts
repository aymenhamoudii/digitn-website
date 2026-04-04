import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/api/server';

/**
 * Extract text from a PDF buffer using unpdf (serverless-compatible, no canvas/DOMMatrix needed).
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText } = await import('unpdf');
  const result = await extractText(new Uint8Array(buffer), { mergePages: true });
  return result.text || '';
}

export async function POST(req: Request) {
  try {
    const user = await getUserProfile();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (fileName.endsWith('.txt')) {
      // Plain text
      text = buffer.toString('utf-8');
    } else if (fileName.endsWith('.pdf')) {
      // PDF parsing — uses pdfjs-dist directly (no canvas dependency)
      try {
        text = await extractPdfText(buffer);
      } catch (err: any) {
        console.error('PDF parse error:', err.message);
        return NextResponse.json({ error: 'Failed to parse PDF. Try pasting the text instead.' }, { status: 422 });
      }
    } else if (fileName.endsWith('.docx')) {
      // DOCX parsing
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (err: any) {
        console.error('DOCX parse error:', err.message);
        return NextResponse.json({ error: 'Failed to parse DOCX. Try pasting the text instead.' }, { status: 422 });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' },
        { status: 400 }
      );
    }

    // Clean up extracted text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'Could not extract meaningful text from the file. Try pasting the content directly.' },
        { status: 422 }
      );
    }

    // Truncate very long texts (keep first ~50K chars for AI context)
    const maxChars = 50000;
    if (text.length > maxChars) {
      text = text.substring(0, maxChars) + '\n\n[Content truncated — showing first 50,000 characters]';
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({ text, wordCount });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
