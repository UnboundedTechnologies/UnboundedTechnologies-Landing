import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Funnel form smoke. The actual POST path requires Turnstile +
// Notion + Resend secrets that aren't present in test envs, so we
// stop short of submitting and assert validation behavior instead:
// the description character counter updates as the user types, an
// empty submit doesn't navigate (validation blocks), and the form
// stays on /contact.
//
// A separate `test.skip` documents the live-submission case so the
// gap is explicit and easy to grep.

test.describe('Contact funnel', () => {
  test('renders the form with all required fields', async ({ page }) => {
    await page.goto('/en/contact');

    await expect(page.getByPlaceholder('Jane Doe')).toBeVisible();
    await expect(page.getByPlaceholder('jane@company.com')).toBeVisible();
    await expect(page.getByPlaceholder('Company Inc.')).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('description hint updates as user types (live counter)', async ({ page }) => {
    await page.goto('/en/contact');
    const textarea = page.getByRole('textbox', { name: /what are you trying to solve/i });

    // The hint key is `descriptionHint` and renders with `{count}`. We don't
    // care about exact wording: just that the rendered hint reflects the
    // typed length somehow (the count number appears in the hint text).
    const sample = 'A short description that exceeds thirty characters comfortably.';
    await textarea.fill(sample);

    // The hint sits inside the same <label> as the textarea. Find the
    // surrounding label and assert that some sibling text contains the
    // current length value (or at least the description text we typed).
    const labelText = await textarea.evaluate((el) => {
      const label = el.closest('label');
      return label?.textContent ?? '';
    });
    expect(labelText).toMatch(new RegExp(String(sample.length)));
  });

  test('empty submission does not navigate away', async ({ page }) => {
    await page.goto('/en/contact');
    const url = page.url();

    // Click the submit button without filling anything; HTML form
    // validation + zod resolver should prevent navigation.
    await page.getByRole('button', { name: /send/i }).click();

    // Give the resolver a tick to surface errors. We're on the same URL
    // and the form is still visible (no thank-you screen).
    await page.waitForTimeout(300);
    expect(page.url()).toBe(url);
    await expect(page.getByPlaceholder('Jane Doe')).toBeVisible();
  });

  test.skip('submits a qualified inquiry end-to-end', () => {
    // Skipped: the live POST path requires TURNSTILE_SECRET_KEY,
    // NOTION_TOKEN + NOTION_DATABASE_ID, and RESEND_API_KEY in the
    // server's environment, plus a real Turnstile site key on the
    // client. Without them the API returns 400 turnstile-failed and
    // the form surfaces an error toast instead of navigating to the
    // thank-you screen. Re-enable in a CI job that injects test keys.
  });

  test('axe finds zero violations on /en/contact', async ({ page }) => {
    await page.goto('/en/contact');
    await page.locator('h1').first().waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The Turnstile iframe is a third-party widget mounted by Cloudflare;
      // any violations inside it are out of our control. We exclude it from
      // the sweep so a Cloudflare regression doesn't fail our build.
      .exclude('iframe[src*="challenges.cloudflare.com"]')
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
