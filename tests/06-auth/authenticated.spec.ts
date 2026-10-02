import { expect, test } from '@playwright/test';

test.describe('Authenticated Sauce Demo session', () => {
  test('opens the inventory page already authenticated', async ({ page }) => {
    await test.step('Given an authenticated browser context', async () => {
      await page.goto('https://www.saucedemo.com/inventory.html');
    });

    await test.step('When the authenticated page is loaded', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await test.step('Then the inventory is visible', async () => {
      await expect(page.getByText('Products')).toBeVisible();
      await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
    });
  });
});
