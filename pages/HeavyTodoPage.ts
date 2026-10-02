import { expect, Page } from '@playwright/test';
import { TodoPage } from './TodoPage';

export class HeavyTodoPage {
  private readonly todoPage: TodoPage;

  constructor(page: Page) {
    this.todoPage = new TodoPage(page);
  }

  async goto() {
    await this.todoPage.goto();
  }

  async addAndVerify(task: string) {
    await this.todoPage.addTodo(task);
    await expect(this.todoPage.todoItem(task)).toBeVisible();
  }

  async completeAndVerify(task: string) {
    await this.todoPage.completeTodo(task);

    const todoItem = this.todoPage.todoItem(task);
    await expect(todoItem.getByRole('checkbox')).toBeChecked();
    await expect(todoItem).toHaveAttribute('class', /completed/);
  }

  async assertCompleted(task: string) {
    const todoItem = this.todoPage.todoItem(task);

    await expect(todoItem.getByRole('checkbox')).toBeChecked();
    await expect(todoItem).toHaveAttribute('class', /completed/);
  }

  async deleteAndVerify(task: string) {
    await this.todoPage.deleteTodo(task);
    await expect(this.todoPage.todoItem(task)).toHaveCount(0);
  }
}
