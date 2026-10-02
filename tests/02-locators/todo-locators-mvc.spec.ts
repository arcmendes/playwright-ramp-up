import { expect, test } from '@playwright/test';

test.describe('Tests for locators', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Given navigating to the TodoMVC homepage', async () => {
      await page.goto('https://demo.playwright.dev/todomvc/');
    }); 
  });

  const todoTasks = {
  first: 'Learn Playwright',
  second: 'Practice locators',
  third: 'Write tests',
} as const;


  test('Add multiple tasks to the todo list', async ({ page }) => {
    await test.step('When adding multiple tasks to the todo list', async () => {
      const newTodoInput = page.getByPlaceholder('What needs to be done?');
      for (const task of Object.values(todoTasks)) {
        await newTodoInput.fill(task);
        await newTodoInput.press('Enter');
      }
    });
    await test.step('Then the tasks are visible in the todo list', async () => {
      for (const task of Object.values(todoTasks)) {
        const taskElement = page.getByText(task);
        await expect(taskElement).toBeVisible();
      }
    });
  });

    test('Complete multiple tasks in the todo list', async ({ page }) => {
    await test.step('Given multiple tasks are added to the todo list', async () => {
      const newTodoInput = page.getByPlaceholder('What needs to be done?');
      for (const task of Object.values(todoTasks)) {
        await newTodoInput.fill(task);
        await newTodoInput.press('Enter');
      }
    });
    
    await test.step('When checking the checkboxes for the tasks', async () => {
      for (const task of Object.values(todoTasks)) {
        const taskElement = page.getByText(task);
        const checkbox = taskElement.locator('xpath=..').getByRole('checkbox');
        await checkbox.check();
      }
    });
    await test.step('Then the tasks are visible in the completed list', async () => {
      await page.getByRole('link', { name: 'Completed' }).click();
      for (const task of Object.values(todoTasks)) {
        const taskElement = page.getByText(task);
        await expect(taskElement).toBeVisible();
      }
    });
  });

  });