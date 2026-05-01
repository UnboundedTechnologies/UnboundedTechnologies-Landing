import { notFound } from 'next/navigation';

// Catch-all that lets the locale layout's not-found.tsx render branded 404
// content for any unmatched path under /en/* or /fr/*. Without this, an
// unmatched URL bubbles up to the root not-found.tsx (no locale, no nav).
export default function CatchAll() {
  notFound();
}
