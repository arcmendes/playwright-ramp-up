import { expect, Page, Locator, test as base } from '@playwright/test';

const todoUrl = 'https://demo.playwright.dev/todomvc/';

export class TodoApp {
  constructor(private readonly page: Page) {}

  item(task: string): Locator {
    return this.page
      .locator('.todo-list')
      .getByRole('listitem')
      .filter({ hasText: task });
  }

  async add(task: string) {
    const todoInput = this.page.getByPlaceholder('What needs to be done?');

    await todoInput.fill(task);
    await todoInput.press('Enter');
  }

  async complete(task: string) {
    await this.item(task).getByRole('checkbox').check();
  }

  async delete(task: string) {
    const todoItem = this.item(task);

    await todoItem.hover();
    await todoItem.locator('button.destroy').click();
  }
}

type TodoFixtures = {
  todoApp: TodoApp;
};

export const test = base.extend<TodoFixtures>({
  todoApp: async ({ page }, use) => {
    await page.goto(todoUrl);
    await use(new TodoApp(page));
  },
});

export { expect } from '@playwright/test';
