import { expect, test } from '@playwright/test';

test.describe('Tests for locators', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Given navigating to the Playwright homepage', async () => {
      await page.goto('https://playwright.dev/');
    });
  });

  test('Click on get Started button', async ({ page }) => {
    await test.step('When clicking on the Get Started button', async () => {
      const getStartedButton = page.getByRole('link', { name: 'Get Started' });
      await getStartedButton.click();
    });
    await test.step('Then Installation page is displayed', async () => {
      const installationHeading = page.getByRole('heading', { name: 'Installation' });
      await expect(installationHeading).toBeVisible();
    });
  });

  test('Click on get Started button and verify Installation page', async ({ page }) => {
    await test.step('When clicking on the Get Started button', async () => {
      const getStartedButton = page.getByRole('link', { name: 'Get Started' });
      await getStartedButton.click();
    });
    await test.step('Then Installation page is displayed', async () => {
      const installationHeading = page.getByRole('heading', { name: 'Installation' });
      await expect(installationHeading).toBeVisible();
    });
    await test.step(
      'And all fast links for the page are visible and clickable',
      async () => {
        const expectedLinks = [
          'Introduction',
          'Installing Playwright',
          'Using npm, yarn or pnpm',
          'Using the VS Code Extension',
          "What's Installed",
          'Running the Example Test',
          'HTML Test Reports',
          'Running the Example Test in UI Mode',
          'Updating Playwright',
          'System requirements',
          "What's next",
        ];

        for (const linkName of expectedLinks) {
          const link = page.getByRole('link', {
            name: linkName,
            exact: true,
          });

          await expect(link).toBeVisible();
          await expect(link).toBeEnabled();
        }
      },
    );
  });
});