import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), 'public', 'tax_schema.json');
    const raw = await readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(raw);

    return NextResponse.json(schema, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load tax schema' },
      { status: 500 }
    );
  }
}
