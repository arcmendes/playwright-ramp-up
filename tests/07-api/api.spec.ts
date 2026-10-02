import { expect, test } from '@playwright/test';

const apiUrl = 'https://jsonplaceholder.typicode.com';

test.describe('JSONPlaceholder API lab', () => {
  test('GET returns a post', async ({ request }) => {
    let response;

    await test.step('Given the posts API is available', async () => {
      response = await request.get(`${apiUrl}/posts/1`);
    });

    await test.step('When the post response is received', async () => {
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Then the response contains the expected post', async () => {
      const body = await response.json();

      expect(body).toMatchObject({
        id: 1,
        userId: 1,
      });
      expect(body.title).toEqual(expect.any(String));
    });
  });

  test('POST creates a post response', async ({ request }) => {
    let response;

    await test.step('Given a new post payload', async () => {
      response = await request.post(`${apiUrl}/posts`, {
        data: {
          title: 'Learn Playwright API testing',
          body: 'Create test data with the request fixture',
          userId: 1,
        },
      });
    });

    await test.step('When the create response is received', async () => {
      expect(response.status()).toBe(201);
    });

    await test.step('Then the created response contains the payload', async () => {
      const body = await response.json();

      expect(body).toMatchObject({
        title: 'Learn Playwright API testing',
        body: 'Create test data with the request fixture',
        userId: 1,
      });
      expect(body.id).toEqual(expect.any(Number));
    });
  });

  test('PUT replaces a post', async ({ request }) => {
    let response;

    await test.step('Given a replacement post payload', async () => {
      response = await request.put(`${apiUrl}/posts/1`, {
        data: {
          id: 1,
          title: 'Updated with PUT',
          body: 'The complete resource was replaced',
          userId: 1,
        },
      });
    });

    await test.step('When the replacement response is received', async () => {
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Then the response contains the replacement', async () => {
      const body = await response.json();

      expect(body).toMatchObject({
        id: 1,
        title: 'Updated with PUT',
        body: 'The complete resource was replaced',
      });
    });
  });

  test('PATCH updates part of a post', async ({ request }) => {
    let response;

    await test.step('Given a partial post update', async () => {
      response = await request.patch(`${apiUrl}/posts/1`, {
        data: {
          title: 'Updated with PATCH',
        },
      });
    });

    await test.step('When the partial update response is received', async () => {
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Then only the requested field is updated', async () => {
      const body = await response.json();

      expect(body).toMatchObject({
        id: 1,
        title: 'Updated with PATCH',
      });
    });
  });

  test('DELETE removes a post response', async ({ request }) => {
    let response;

    await test.step('Given an existing post', async () => {
      response = await request.delete(`${apiUrl}/posts/1`);
    });

    await test.step('When the delete response is received', async () => {
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Then the API confirms the delete request', async () => {
      expect(response.status()).toBe(200);
    });
  });

  test('API setup can feed a browser check', async ({ page, request }) => {
    let postId: number;
    let postTitle: string;

    await test.step('Given a post is prepared through the API', async () => {
      const response = await request.get(`${apiUrl}/posts/1`);
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      postId = body.id;
      postTitle = body.title;
    });

    await test.step('When the browser opens the prepared post', async () => {
      await page.goto(`${apiUrl}/posts/${postId}`);
    });

    await test.step('Then the browser displays the API resource', async () => {
      await expect(page.locator('body')).toContainText(`"id": ${postId}`);
      await expect(page.locator('body')).toContainText(`"title": "${postTitle}"`);
    });
  });
});
