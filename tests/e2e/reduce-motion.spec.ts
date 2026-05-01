import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Reduced motion. The site honors two signals:
//
//   1. localStorage['ut-motion'] = 'reduce' | 'full' (user override),
//      which the inline boot script in src/app/layout.tsx applies as
//      a [data-motion] attribute on <html> before React hydrates.
//   2. The OS-level prefers-reduced-motion media query, picked up
//      lazily by the ThemeProvider.
//
// We test the localStorage path here because it's deterministic and
// directly observable on <html> without needing to inspect every
// animation. We also include a separate test that emulates the OS
// signal via Playwright's `reducedMotion` option.

test.describe('Reduce-motion preferences', () => {
  test('localStorage override applies data-motion before hydration', async ({ page }) => {
    // Seed localStorage on the right origin BEFORE the document loads.
    // Playwright's `addInitScript` runs in every navigated page before
    // its scripts execute, so the boot script in layout.tsx will see
    // our value when it reads localStorage.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('ut-motion', 'reduce');
      } catch {
        /* ignore */
      }
    });

    await page.goto('/en');
    const motionAttr = await page.locator('html').getAttribute('data-motion');
    expect(motionAttr).toBe('reduce');
  });

  test('clearing the override removes the attribute', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('ut-motion');
      } catch {
        /* ignore */
      }
    });

    await page.goto('/en');
    const motionAttr = await page.locator('html').getAttribute('data-motion');
    // No localStorage value -> boot script does not set the attribute.
    expect(motionAttr).toBeNull();
  });

  test('axe finds zero violations under reduced-motion emulation', async ({ browser }) => {
    // OS-level prefers-reduced-motion. We use a fresh context so the
    // emulation flag is set before navigation.
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.setItem('ut-motion', 'reduce');
      } catch {
        /* ignore */
      }
    });
    await page.goto('/en');
    await page.locator('h1').first().waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    await context.close();
  });
});
