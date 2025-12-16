import { Resvg } from '@cf-wasm/resvg';
import type { Fetcher } from '@cloudflare/workers-types';
import type { RequestHandler } from './$types';

let fontCache: { bold: Uint8Array | null; regular: Uint8Array | null } = { bold: null, regular: null };

async function loadFonts(fetchFn: typeof fetch, origin: string, assets?: Fetcher) {
  if (fontCache.bold && fontCache.regular) return;

  const boldPath = '/fonts/Google_Sans_Flex/static/GoogleSansFlex_36pt-Bold.ttf';
  const regularPath = '/fonts/Google_Sans_Code/static/GoogleSansCode-Regular.ttf';

  // Use ASSETS binding in production, regular fetch in dev
  const fetchBold = assets
    ? assets.fetch(new URL(boldPath, origin).toString())
    : fetchFn(`${origin}${boldPath}`);
  const fetchRegular = assets
    ? assets.fetch(new URL(regularPath, origin).toString())
    : fetchFn(`${origin}${regularPath}`);

  const [boldRes, regularRes] = await Promise.all([fetchBold, fetchRegular]);

  if (!boldRes.ok) throw new Error(`Failed to fetch bold font: ${boldRes.status}`);
  if (!regularRes.ok) throw new Error(`Failed to fetch regular font: ${regularRes.status}`);

  const [boldBuf, regularBuf] = await Promise.all([boldRes.arrayBuffer(), regularRes.arrayBuffer()]);
  fontCache.bold = new Uint8Array(boldBuf);
  fontCache.regular = new Uint8Array(regularBuf);
}

function escapeXml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxChars) currentLine = testLine;
    else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function generateOGImageSVG(title: string, description: string): string {
  const titleLines = wrapText(title, 30).slice(0, 3);
  const descLines = description ? wrapText(description, 50).slice(0, 2) : [];

  const titleText = titleLines
    .map((line, i) => `<text x="60" y="${260 + i * 70}" font-family="Google Sans Flex" font-size="58" font-weight="700" fill="#FFFFFF">${escapeXml(line)}</text>`)
    .join('\n');

  const descText = descLines
    .map((line, i) => `<text x="60" y="${260 + titleLines.length * 70 + 30 + i * 32}" font-family="Google Sans Code" font-size="24" fill="rgba(255,255,255,0.8)">${escapeXml(line)}</text>`)
    .join('\n');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F6821F"/>
  ${titleText}
  ${descText}
  <text x="60" y="590" font-family="Google Sans Flex" font-size="18" font-weight="600" fill="rgba(255,255,255,0.7)">cf-tutorial.coey.dev</text>
</svg>`;
}

export const GET: RequestHandler = async ({ url, fetch, platform }) => {
  const title = url.searchParams.get('title') || 'Cloudflare Tutorial';
  const description = url.searchParams.get('description') || '';
  const format = url.searchParams.get('format');

  const svg = generateOGImageSVG(title, description);

  if (format === 'svg') {
    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  }

  await loadFonts(fetch, url.origin, platform?.env?.ASSETS);

  const resvg = new Resvg(svg, {
    font: {
      fontBuffers: [fontCache.bold!, fontCache.regular!],
      defaultFontFamily: 'Google Sans Flex'
    },
    fitTo: { mode: 'width', value: 1200 }
  });

  const png = resvg.render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' }
  });
};
