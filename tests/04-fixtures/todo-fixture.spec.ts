import { test, expect } from '../../fixtures/todo.fixture';

test.describe('TodoApp fixture', () => {
  test('user can create a todo', async ({ page, todoApp }) => {
    const task = 'Learn Playwright fixtures';

    await test.step('Given the TodoMVC page is ready', async () => {
      await expect(page).toHaveURL(/todomvc/);
    });

    await test.step('When the user adds a todo', async () => {
      await todoApp.add(task);
    });

    await test.step('Then the todo is visible', async () => {
      await expect(todoApp.item(task)).toBeVisible();
    });
  });

  test('user can complete a todo', async ({ todoApp }) => {
    const task = 'Complete a fixture todo';

    await test.step('Given a todo has been added', async () => {
      await todoApp.add(task);
    });

    await test.step('When the user completes the todo', async () => {
      await todoApp.complete(task);
    });

    await test.step('Then the todo is marked completed', async () => {
      const todoItem = todoApp.item(task);

      await expect(todoItem.getByRole('checkbox')).toBeChecked();
      await expect(todoItem).toHaveAttribute('class', /completed/);
    });
  });

  test('user can delete a todo', async ({ todoApp }) => {
    const task = 'Delete a fixture todo';

    await test.step('Given a todo has been added', async () => {
      await todoApp.add(task);
    });

    await test.step('When the user deletes the todo', async () => {
      await todoApp.delete(task);
    });

    await test.step('Then the todo is not visible', async () => {
      await expect(todoApp.item(task)).toHaveCount(0);
    });
  });
});
