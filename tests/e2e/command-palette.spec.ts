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
    // Wait for the search button (rendered by the same client tree as the
    // command palette) so we know the keydown listener is mounted.
    await page.getByRole('button', { name: /search/i }).first().waitFor();

    // Press Meta+K (also dispatched as Ctrl+K by the listener). Dispatch
    // the event directly on the document because the global keydown
    // listener is attached to `window`; relying on Playwright's
    // `keyboard.press` requires an element with focus that won't swallow
    // the event, which the homepage doesn't always provide reliably.
    await page.evaluate(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
      );
    });
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('opens via Control+K too', async ({ page }) => {
    await page.goto('/en');
    await page.locator('h1').first().waitFor();
    await page.getByRole('button', { name: /search/i }).first().waitFor();

    await page.evaluate(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
      );
    });
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
