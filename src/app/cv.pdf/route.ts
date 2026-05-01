import { renderCvPdf } from '@/lib/cv-pdf';

// `/cv.pdf` Capability Statement.
//
// Build-time-rendered PDF served from the public root (outside the [locale]
// segment) so the same URL works for EN and FR users. Content is EN-only for
// v1.0; the i18n link label on /about is translated, but the PDF itself is
// English. A bilingual PDF is deferred to v1.1.
//
// Caching: under Next 16 Cache Components the legacy `dynamic` /
// `revalidate` segment-config exports are rejected. The PDF render is
// cached inside `renderCvPdf` via the `'use cache'` directive and
// `cacheLife('days')`, which gives us the same ~24h refresh window that
// the spec asks for, while letting the route handler itself prerender.

export async function GET(): Promise<Response> {
  const bytes = await renderCvPdf();

  // Slice the underlying buffer to a fresh ArrayBuffer that exactly matches
  // these bytes. `bytes.buffer` may be larger than `bytes.byteLength` (e.g.
  // when the source was a pooled Node Buffer), so passing it directly would
  // risk shipping unrelated trailing bytes. Cast back to ArrayBuffer because
  // the lib.dom Response BodyInit list rejects SharedArrayBuffer.
  const body = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      // attachment (not inline) so modern browsers trigger a download instead
      // of rendering the PDF in the new tab. Combined with target="_blank" on
      // the calling anchor, the user's current view never changes: a new tab
      // briefly opens, the download fires, and Chrome/Firefox auto-close the
      // empty tab.
      'Content-Disposition': 'attachment; filename="unbounded-capability-statement.pdf"',
      'Content-Length': String(bytes.byteLength),
      // Edge / CDN cache hint: 24h fresh, then stale-while-revalidate for
      // another 24h. Mirrors the inner `cacheLife('days')` so any layer in
      // front of the route can reuse the same window.
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
