import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';
import { generateReportHTML } from '@/lib/reportGenerator';

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1. Generate the HTML report (you already have this logic)
    const html = generateReportHTML(data);

    // 2. Launch headless Chromium
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // 3. Load HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // 4. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        bottom: '16mm',
        left: '14mm',
        right: '14mm',
      },
    });

    await browser.close();

    // 5. Return as downloadable PDF
    return new Response(
      new Uint8Array(pdfBuffer),
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="payeplus-salary-report.pdf"',
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}
