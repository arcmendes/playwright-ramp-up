import { expect, test } from '@playwright/test';

test('Playwright documentation', async ({ page }) => {
	await page.goto('https://playwright.dev');
	await expect(page).toHaveTitle(/Playwright/);
    await expect(page.getByRole('heading', { name: 'Playwright Test' })).toContainText('Playwright Test'); 
});