import { Locator, Page } from '@playwright/test';

const todoUrl = 'https://demo.playwright.dev/todomvc/';

export class TodoPage {
  private readonly todoInput: Locator;

  constructor(private readonly page: Page) {
    this.todoInput = page.getByPlaceholder('What needs to be done?');
  }

  async goto() {
    await this.page.goto(todoUrl);
  }

  async addTodo(task: string) {
    await this.todoInput.fill(task);
    await this.todoInput.press('Enter');
  }

  todoItem(task: string): Locator {
    return this.page
      .locator('.todo-list')
      .getByRole('listitem')
      .filter({ hasText: task });
  }

  async completeTodo(task: string) {
    await this.todoItem(task).getByRole('checkbox').check();
  }

  async deleteTodo(task: string) {
    const todoItem = this.todoItem(task);

    await todoItem.hover();
    await todoItem.locator('button.destroy').click();
  }
}
