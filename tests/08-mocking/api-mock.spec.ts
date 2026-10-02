import { expect, test } from '@playwright/test';

const appUrl = 'https://www.saucedemo.com/';
const apiPath = '**/api/todos';

async function requestTodos(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const response = await fetch('/api/todos');

    return {
      status: response.status,
      body: await response.json(),
    };
  });
}

test.describe('Mocked todo API responses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl);
  });

  test('handles the happy path with a 200 response', async ({ page }) => {
    await test.step('Given the API returns todos successfully', async () => {
      await page.route(apiPath, async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, title: 'Learn route mocking', completed: false },
          ]),
        });
      });
    });

    await test.step('When the page requests todos', async () => {
      const response = await requestTodos(page);

      expect(response.status).toBe(200);
    });

    await test.step('Then the response contains the todo', async () => {
      const response = await requestTodos(page);

      expect(response.body).toEqual([
        { id: 1, title: 'Learn route mocking', completed: false },
      ]);
    });
  });

  test('handles a server error with a 500 response', async ({ page }) => {
    await test.step('Given the API returns a server error', async () => {
      await page.route(apiPath, async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service unavailable' }),
        });
      });
    });

    await test.step('When the page requests todos', async () => {
      const response = await requestTodos(page);

      expect(response.status).toBe(500);
    });

    await test.step('Then the error response is available to the UI', async () => {
      const response = await requestTodos(page);

      expect(response.body).toEqual({ error: 'Service unavailable' });
    });
  });

  test('handles a slow API response', async ({ page }) => {
    await test.step('Given the API responds slowly', async () => {
      await page.route(apiPath, async route => {
        await new Promise(resolve => setTimeout(resolve, 250));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 2, title: 'Slow todo' }]),
        });
      });
    });

    await test.step('When the page waits for todos', async () => {
      const response = await requestTodos(page);

      expect(response.status).toBe(200);
    });

    await test.step('Then the delayed response is eventually returned', async () => {
      const response = await requestTodos(page);

      expect(response.body).toEqual([{ id: 2, title: 'Slow todo' }]);
    });
  });

  test('handles an empty todo state', async ({ page }) => {
    await test.step('Given the API returns no todos', async () => {
      await page.route(apiPath, async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });
    });

    await test.step('When the page requests todos', async () => {
      const response = await requestTodos(page);

      expect(response.status).toBe(200);
    });

    await test.step('Then the response contains an empty list', async () => {
      const response = await requestTodos(page);

      expect(response.body).toEqual([]);
    });
  });
});
