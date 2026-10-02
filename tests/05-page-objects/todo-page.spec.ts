import { expect, test } from '@playwright/test';
import { HeavyTodoPage } from '../../pages/HeavyTodoPage';
import { TodoPage } from '../../pages/TodoPage';

test.describe('Minimal TodoPage', () => {
  test('user can add a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const task = 'Learn Page Objects';

    await test.step('Given the TodoMVC page is open', async () => {
      await todoPage.goto();
    });

    await test.step('When the user adds a todo', async () => {
      await todoPage.addTodo(task);
    });

    await test.step('Then the todo is visible', async () => {
      await expect(todoPage.todoItem(task)).toBeVisible();
    });
  });

  test('user can complete a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const task = 'Practice Page Objects';

    await test.step('Given a todo has been added', async () => {
      await todoPage.goto();
      await todoPage.addTodo(task);
    });

    await test.step('When the user completes the todo', async () => {
      await todoPage.completeTodo(task);
    });

    await test.step('Then the todo is marked completed', async () => {
      const todoItem = todoPage.todoItem(task);

      await expect(todoItem.getByRole('checkbox')).toBeChecked();
      await expect(todoItem).toHaveAttribute('class', /completed/);
    });
  });

  test('user can delete a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const task = 'Keep Page Objects focused';

    await test.step('Given a todo has been added', async () => {
      await todoPage.goto();
      await todoPage.addTodo(task);
    });

    await test.step('When the user deletes the todo', async () => {
      await todoPage.deleteTodo(task);
    });

    await test.step('Then the todo is absent', async () => {
      await expect(todoPage.todoItem(task)).toHaveCount(0);
    });
  });
});

test.describe('Abstraction-heavy TodoPage', () => {
  test('user can complete a todo through a workflow API', async ({ page }) => {
    const todoPage = new HeavyTodoPage(page);
    const task = 'Compare Page Object styles';

    await test.step('Given the TodoMVC page is open', async () => {
      await todoPage.goto();
    });

    await test.step('When the user adds and completes a todo', async () => {
      await todoPage.addAndVerify(task);
      await todoPage.completeAndVerify(task);
    });

    await test.step('Then the workflow has completed successfully', async () => {
      await todoPage.assertCompleted(task);
    });
  });
});
