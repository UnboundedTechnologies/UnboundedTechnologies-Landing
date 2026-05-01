import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// Locale switching. The site has English + French with locale-prefixed
// URLs and per-route slug mappings (e.g. /work in EN -> /travaux in FR).
// We exercise the language-switcher button on a couple of routes to
// confirm both directions work and the URL prefix changes correctly.

async function switchLocale(page: Page, target: 'en' | 'fr') {
  // The button has aria-label "Language: EN" or "Language: FR" depending on
  // current locale. Click it to open the popover, then click the target.
  const trigger = page.getByRole('button', { name: /language:/i }).first();
  await trigger.click();
  // Inside the popover, the option uses role=menuitemradio and the visible
  // label is the human-readable language name. Wait for the menu to mount
  // before clicking; under heavy parallel load the popover sometimes
  // doesn't paint before the next click is dispatched.
  const targetLabel = target === 'en' ? 'English' : 'Français';
  const item = page.getByRole('menuitemradio', { name: new RegExp(targetLabel, 'i') });
  await item.waitFor({ state: 'visible' });
  await item.click();
}

test.describe('i18n routing', () => {
  test('switches locale on the home route', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en\/?$/);

    await switchLocale(page, 'fr');
    await expect(page).toHaveURL(/\/fr\/?$/);

    await switchLocale(page, 'en');
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('preserves the about route across locales (/en/about <-> /fr/a-propos)', async ({
    page,
  }) => {
    await page.goto('/en/about');
    await expect(page.locator('h1').first()).toBeVisible();

    await switchLocale(page, 'fr');
    // FR slug for /about is /a-propos per src/i18n/routing.ts.
    await expect(page).toHaveURL(/\/fr\/a-propos\/?$/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('preserves the work route across locales (/en/work <-> /fr/travaux)', async ({ page }) => {
    await page.goto('/en/work');
    await expect(page.locator('h1').first()).toBeVisible();

    await switchLocale(page, 'fr');
    await expect(page).toHaveURL(/\/fr\/travaux\/?$/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('axe finds zero violations on /fr/about (a-propos)', async ({ page }) => {
    await page.goto('/fr/a-propos');
    await page.locator('h1').first().waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
