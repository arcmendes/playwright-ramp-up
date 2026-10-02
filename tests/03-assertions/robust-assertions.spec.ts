import { expect, Page, test } from '@playwright/test';

const todoTasks = {
  first: 'Learn Playwright',
  second: 'Practice assertions',
  third: 'Write robust tests',
} as const;

async function addTodo(page: Page, task: string) {
  const todoInput = page.getByPlaceholder('What needs to be done?');

  await todoInput.fill(task);
  await todoInput.press('Enter');
}

function getTodoItem(page: Page, task: string) {
  return page
    .locator('.todo-list')
    .getByRole('listitem')
    .filter({ hasText: task });
}

test.describe('Web-first assertions and locator collections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test('uses web-first assertions for page and input state', async ({ page }) => {
    const todoInput = page.getByPlaceholder('What needs to be done?');

    await test.step('Given the page and todo input are ready', async () => {
      await expect(page).toHaveTitle(/TodoMVC/);
      await expect(page).toHaveURL(/todomvc/);
      await expect(todoInput).toBeVisible();
      await expect(todoInput).toHaveValue('');
    });

    await test.step('When adding one todo', async () => {
      await addTodo(page, todoTasks.first);
    });

    await test.step('Then the todo text is displayed', async () => {
      const todoItem = getTodoItem(page, todoTasks.first);
      const taskText = todoItem.getByText(todoTasks.first, { exact: true });

      await expect(taskText).toHaveText(todoTasks.first);
      await expect(todoItem).toContainText('Playwright');
    });
  });

  test('uses count, first, last, and nth for todo collections', async ({ page }) => {
    await test.step('Given the TodoMVC page is open', async () => {
      await expect(page).toHaveURL(/todomvc/);
    });

    await test.step('When adding multiple todos', async () => {
      for (const task of Object.values(todoTasks)) {
        await addTodo(page, task);
      }
    });

    await test.step('Then the todo collection has the expected items', async () => {
      const todoItems = page.locator('.todo-list').getByRole('listitem');

      await expect(todoItems).toHaveCount(3);
      await expect(todoItems.first()).toContainText(todoTasks.first);
      await expect(todoItems.nth(1)).toContainText(todoTasks.second);
      await expect(todoItems.last()).toContainText(todoTasks.third);
    });
  });

  test('asserts checkbox state, attributes, and filtered URL', async ({ page }) => {
    await test.step('Given one todo is added', async () => {
      await addTodo(page, todoTasks.first);
    });

    await test.step('When completing and filtering the todo', async () => {
      const todoItem = getTodoItem(page, todoTasks.first);
      const checkbox = todoItem.getByRole('checkbox');

      await checkbox.check();
      await page.getByRole('link', { name: 'Completed', exact: true }).click();
    });

    await test.step('Then the todo is checked, completed, and visible', async () => {
      const todoItem = getTodoItem(page, todoTasks.first);
      const checkbox = todoItem.getByRole('checkbox');

      await expect(checkbox).toBeChecked();
      await expect(todoItem).toHaveAttribute('class', /completed/);
      await expect(page).toHaveURL(/#\/completed$/);
      await expect(todoItem).toBeVisible();
    });
  });
});
