// One-shot inspection of the deployed CSS to verify nav glass rules.
// Run with: node scripts/inspect-css.mjs
const cssUrl =
  'https://unboundedtechnologies.com/_next/static/chunks/16c3x7b.niz29.css';
const res = await fetch(cssUrl);
const css = await res.text();

const checks = [
  { name: 'bg-bg/70 (escaped)', re: /\.bg-bg\\\/70[^{]*\{[^}]+\}/g },
  { name: 'bg-bg-elevated/70', re: /\.bg-bg-elevated\\\/70[^{]*\{[^}]+\}/g },
  { name: 'backdrop-blur-3xl', re: /\.backdrop-blur-3xl[^{]*\{[^}]+\}/g },
  { name: 'backdrop-saturate-200', re: /\.backdrop-saturate-200[^{]*\{[^}]+\}/g },
  { name: 'backdrop-blur-xl', re: /\.backdrop-blur-xl[^{]*\{[^}]+\}/g },
  { name: 'backdrop-saturate-150', re: /\.backdrop-saturate-150[^{]*\{[^}]+\}/g },
  { name: 'apple-glass-nav (should NOT exist)', re: /\.apple-glass-nav[^{]*\{[^}]+\}/g },
];

for (const { name, re } of checks) {
  const matches = css.match(re) || [];
  console.log(`\n=== ${name} (${matches.length} match) ===`);
  for (const m of matches.slice(0, 2)) {
    console.log(m);
  }
}

// Also: count total occurrences of -webkit-backdrop-filter vs backdrop-filter
console.log(`\n=== Counts in entire CSS ===`);
console.log('webkit-backdrop-filter:', (css.match(/-webkit-backdrop-filter/g) || []).length);
console.log('backdrop-filter (non-webkit):', (css.match(/[^-]backdrop-filter/g) || []).length);

// Show how the header uses these classes via the rendered HTML
const htmlRes = await fetch('https://unboundedtechnologies.com/en');
const html = await htmlRes.text();
const headerMatch = html.match(/<header[^>]*>/);
console.log('\n=== Live header element ===');
console.log(headerMatch?.[0] ?? 'not found');
