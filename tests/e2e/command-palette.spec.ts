import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Command palette (cmdk). Keyboard shortcut Cmd/Ctrl+K opens it; the
// nav search button dispatches a 'palette:open' window event that the
// palette listens for. We assert both entry points and that Escape
// closes the dialog.

test.describe('Command palette', () => {
  test('opens via Meta+K and closes via Escape', async ({ page }) => {
    await page.goto('/en');
    await page.locator('h1').first().waitFor();
    await page.getByRole('button', { name: /search/i }).first().waitFor();

    // Use Playwright's real keyboard event. Synthetic
    // window.dispatchEvent(new KeyboardEvent(...)) does NOT fire the
    // useEffect-registered listener in CommandPalette under React 19 +
    // reactCompiler in production builds (verified via console-log
    // probes - the listener is registered but synthetic events never
    // trigger it). Real keyboard events via page.keyboard.press fire it
    // as expected.
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('Meta+k');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('opens via Control+K too', async ({ page }) => {
    await page.goto('/en');
    await page.locator('h1').first().waitFor();
    await page.getByRole('button', { name: /search/i }).first().waitFor();

    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('opens via the nav search button', async ({ page }) => {
    await page.goto('/en');
    await page.locator('h1').first().waitFor();

    await page.getByRole('button', { name: /search/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('axe finds zero violations with the palette open', async ({ page }) => {
    await page.goto('/en');
    await page.locator('h1').first().waitFor();
    // Open via the search button (deterministic across keyboard layouts).
    await page.getByRole('button', { name: /search/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Only scope the dialog itself: the underlying homepage has its own
    // axe sweep in homepage.spec.ts, and the homepage's dimmed
    // backdrop-blur background can flag color-contrast false positives
    // for elements that are visually obscured behind the palette.
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
