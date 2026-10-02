import { expect, test } from '@playwright/test';

test.describe('Browser matrix', () => {
  test('reports the configured browser engine', async ({ browserName, page }, testInfo) => {
    await test.step('Given a browser project is running', async () => {
      await page.goto('https://playwright.dev/');
    });

    await test.step('When the page reports its user agent', async () => {
      const userAgent = await page.evaluate(() => navigator.userAgent);
      const expectedMarker = {
        chromium: 'Chrome',
        firefox: 'Firefox',
        webkit: 'Safari',
      }[browserName];

      expect(userAgent).toContain(expectedMarker);
    });

    await test.step('Then the project configuration is observable', async () => {
      const viewport = page.viewportSize();

      expect(viewport).not.toBeNull();
      expect(testInfo.project.name).toMatch(
        /^(chromium|firefox|webkit|mobile-chromium|mobile-webkit)$/,
      );
    });
  });
});
