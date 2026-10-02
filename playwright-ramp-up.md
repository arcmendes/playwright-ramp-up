# Exercise 01 - Hello Playwright

## Goal

Understand the basic Playwright test structure:

- `test()` defines a test.
- `page` represents the browser page.
- Actions interact with the page.
- Assertions verify the expected result.

The exercise tests are in:

```text
tests/01-basics/test-basic.spec.ts
tests/01-basics/example.spec.ts
```

## Resolution

The completed test is:

```ts
import { expect, test } from '@playwright/test';

test('Playwright documentation', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
  await expect(
    page.getByRole('heading', { name: 'Playwright Test' }),
  ).toContainText('Playwright Test');
});
```

The test performs these steps:

1. Opens the Playwright homepage.
2. Verifies that the page title contains `Playwright`.
3. Finds the `Playwright Test` heading by its accessible role and name.
4. Verifies that the heading contains the expected text.

## Locator Explanation

This expression is a Playwright locator:

```ts
page.getByRole('heading', { name: 'Playwright Test' })
```

It finds a heading, such as an `h1` or `h2`, whose accessible name is `Playwright Test`.

Role-based locators are preferred because they describe how a user or assistive technology identifies an element. They are usually more stable than relying on generated CSS classes.

The earlier locator was:

```ts
page.getByRole('heading', { name: 'Installation' })
```

That locator failed because the test opened `https://playwright.dev`, where there is no heading named `Installation`. `Installation` is a heading on a documentation page, not the homepage. The locator must match the page that the test actually opens.

## Exercise Questions

### What is the page fixture?

The `page` fixture is a ready-to-use Playwright `Page` object. It represents a browser tab and provides methods for navigating, locating elements, interacting with the page, and inspecting its state.

In this test, Playwright injects `page` into the test function:

```ts
test('Playwright documentation', async ({ page }) => {
```

Playwright creates and manages the browser page for the test and cleans it up afterward.

### What does `expect()` do?

`expect()` creates an assertion. It checks whether the actual state of the application matches the expected state.

Examples from this test:

```ts
await expect(page).toHaveTitle(/Playwright/);
await expect(locator).toContainText('Playwright Test');
```

Playwright assertions automatically wait for the expected condition for a limited time. This is why an explicit `waitForTimeout()` is not needed here.

### What is the difference between an action and an assertion?

An **action** changes or reads the page as part of the test flow. Examples include:

```ts
await page.goto('https://playwright.dev');
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('user@example.com');
```

An **assertion** verifies that the application produced the expected result. Examples include:

```ts
await expect(page).toHaveTitle(/Playwright/);
await expect(locator).toBeVisible();
await expect(locator).toContainText('Playwright Test');
```

In short:

- `page.goto()` is an action.
- `expect()` is an assertion.
- Actions perform the test steps.
- Assertions confirm that the application behaves correctly.

## Exercise 02 - Locator Gym

### Goal

Practice Playwright locator strategies against the TodoMVC application:

```text
https://demo.playwright.dev/todomvc/
```

TodoMVC is a small task-management application. A todo is one task in the list, such as `Learn Playwright` or `Practice locators`.

The locator exercise tests are in:

```text
tests/02-locators/todo-locators.spec.ts
tests/02-locators/todo-locators-mvc.spec.ts
```

### Current Resolution

The Exercise 02 spec uses a shared setup and reusable task data:

```ts
test.describe('Tests for locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  const todoTasks = {
    first: 'Learn Playwright',
    second: 'Practice locators',
    third: 'Write tests',
  } as const;
});
```

The `beforeEach` hook opens a fresh TodoMVC page before every test. Keeping the task data outside individual tests makes the same values available to multiple tests while keeping each test responsible for creating its own data.

The current spec implements:

- Adding multiple tasks by filling the input and pressing `Enter`.
- Checking multiple task checkboxes.
- Opening the `Completed` filter.
- Verifying that the completed tasks are visible.

The remaining exercise scenarios are:

- Adding one todo.
- Deleting a todo.
- Comparing a user-facing locator with CSS and XPath alternatives.

### Locator Strategies Used

The todo input is located by its placeholder:

```ts
const newTodoInput = page.getByPlaceholder('What needs to be done?');
```

The task text is located with `getByText`:

```ts
const taskElement = page.getByText(task);
```

The completed filter is located by its link role and accessible name:

```ts
await page.getByRole('link', { name: 'Completed' }).click();
```

These are user-facing locators. They describe what a user sees or interacts with instead of depending on implementation-specific CSS classes.

### Reusing Tasks Across Tests

Shared test data can be defined once:

```ts
const todoTasks = {
  first: 'Learn Playwright',
  second: 'Practice locators',
  third: 'Write tests',
} as const;
```

Each test should still add the tasks it needs. Tests should not depend on data created by an earlier test because Playwright tests should be independent and safe to run in a different order.

For several tasks, `Object.values(todoTasks)` provides the values:

```ts
for (const task of Object.values(todoTasks)) {
  await newTodoInput.fill(task);
  await newTodoInput.press('Enter');
}
```

### User-Facing Locator Versus CSS and XPath

The preferred locator for the new todo input is:

```ts
page.getByPlaceholder('What needs to be done?');
```

A CSS alternative might be:

```ts
page.locator('.new-todo');
```

An XPath alternative might be:

```ts
page.locator('//input[@class="new-todo"]');
```

The user-facing locator is usually the most readable and resilient. CSS and XPath can be useful when no accessible name, role, label, placeholder, or test id is available, but they couple the test more closely to the page structure or CSS implementation.

The original completion test uses this XPath step to move from the task text to its parent element:

```ts
const checkbox = taskElement.locator('xpath=..').getByRole('checkbox');
```

This demonstrates XPath, but it is more structural and therefore more brittle. The TodoMVC page contains two lists: the todo list and the filter-links list. Therefore, an unscoped `page.getByRole('listitem')` matches both lists and is too broad.

The robust spec scopes to the TodoMVC list and filters its items by visible task text:

```ts
const todoItem = page
  .locator('.todo-list')
  .getByRole('listitem')
  .filter({ hasText: task });
const checkbox = todoItem.getByRole('checkbox');
```

This is a useful example of combining locator strategies: the CSS class identifies the correct application region, the role identifies list items, and `hasText` identifies the specific task. The scoped locator avoids accidentally counting the `All`, `Active`, and `Completed` filter links as todos.

### Recommended Missing Tests

Add one todo:

```ts
test('adds one todo', async ({ page }) => {
  const newTodoInput = page.getByPlaceholder('What needs to be done?');

  await newTodoInput.fill(todoTasks.first);
  await newTodoInput.press('Enter');

  await expect(
    page.getByRole('listitem', { name: todoTasks.first }),
  ).toBeVisible();
});
```

Delete a todo:

```ts
test('deletes a todo', async ({ page }) => {
  const newTodoInput = page.getByPlaceholder('What needs to be done?');

  await newTodoInput.fill(todoTasks.first);
  await newTodoInput.press('Enter');

  const todoItem = page.getByRole('listitem', { name: todoTasks.first });
  await todoItem.hover();
  await todoItem.getByRole('button', { name: 'Delete' }).click();

  await expect(todoItem).not.toBeVisible();
});
```

The exact delete-button accessible name should be confirmed with the Playwright locator picker or Codegen if the demo application exposes a different name.

### Page Object Consideration

A Page Object is not necessary for this small exercise. Keeping locators in the spec makes the locator strategies visible while learning.

A Page Object becomes useful when several tests repeat the same actions and locators. At that point, the page object can expose operations such as `addTodo`, `completeTodo`, and `deleteTodo`, while the tests continue to describe the expected behavior.

### Codegen Note

Codegen can help discover candidate locators:

```bash
npx playwright codegen https://demo.playwright.dev/todomvc/
```

Generated code should be reviewed rather than copied blindly. Prefer the clearest stable locator, and replace long CSS or XPath expressions with a role, label, placeholder, text, or test id when possible.

## Exercise 03 - Make It Robust

### Goal

Exercise 03 focuses on web-first assertions, automatic waiting, retryability, and assertions against collections of locators.

The implementation is in:

```text
tests/03-assertions/robust-assertions.spec.ts
```

It continues to use the TodoMVC application:

```text
https://demo.playwright.dev/todomvc/
```

### Resolution

The spec uses a small helper to create test data consistently:

```ts
async function addTodo(page: Page, task: string) {
  const todoInput = page.getByPlaceholder('What needs to be done?');

  await todoInput.fill(task);
  await todoInput.press('Enter');
}
```

The tests cover:

- Page title and URL assertions.
- Visibility and input value assertions.
- Exact text and partial text assertions.
- Checkbox state and CSS attribute assertions.
- Todo collection count, first item, last item, and an item at a specific index.
- Filtering completed todos and verifying the resulting URL.

### Web-First Assertions

Web-first assertions express the condition the test actually needs and automatically wait and retry until the condition is true or the assertion timeout is reached.

```ts
await expect(todoInput).toBeVisible();
await expect(todoInput).toHaveValue('');
await expect(todoItem).toHaveText('Learn Playwright');
await expect(todoItem).toContainText('Playwright');
await expect(checkbox).toBeChecked();
await expect(todoItem).toHaveAttribute('class', /completed/);
await expect(page).toHaveURL(/#\/completed$/);
await expect(page).toHaveTitle(/TodoMVC/);
```

### `toHaveText()` Versus `toContainText()`

`toHaveText()` checks the complete text value of the locator. It is useful when the expected text should match the element's full content.

```ts
await expect(todoItem).toHaveText('Learn Playwright');
```

`toContainText()` checks that the expected text appears somewhere inside the locator's content. It is useful when the element may contain additional text.

```ts
await expect(todoItem).toContainText('Playwright');
```

### Assertions on Locator Collections

A locator can represent multiple matching elements. These methods select or inspect items in that collection:

```ts
const todoItems = page.getByRole('listitem');

await expect(todoItems).toHaveCount(3);
await expect(todoItems.first()).toContainText('Learn Playwright');
await expect(todoItems.nth(1)).toContainText('Practice assertions');
await expect(todoItems.last()).toContainText('Write robust tests');
```

- `count()` returns the current number of matching elements.
- `first()` returns the first matching element.
- `last()` returns the last matching element.
- `nth(index)` returns the element at a zero-based index.
- `toHaveCount()` asserts the collection size and automatically waits for it.

For assertions, prefer `toHaveCount()` and locator assertions over manually reading values with `count()` unless the count is needed for control flow.

### Why `waitForTimeout()` Is Usually Wrong

This fixed delay does not describe a condition:

```ts
await page.waitForTimeout(5000);
```

It always pauses for five seconds. If the application is ready sooner, the test is unnecessarily slow. If the application needs longer, the test can still fail.

This assertion expresses the real requirement:

```ts
await expect(todoItem).toBeVisible();
```

Playwright checks the condition repeatedly until it succeeds or the configured timeout expires. This makes the test both faster and more reliable.

The repository rule is to avoid arbitrary `waitForTimeout()` calls. A fixed delay should only be used when there is a documented, genuine timing requirement that cannot be represented by a condition-based assertion or another Playwright wait mechanism.

### Assertion Versus Action

The following line is an action because it changes the page state:

```ts
await checkbox.check();
```

The following line is an assertion because it verifies the resulting state:

```ts
await expect(checkbox).toBeChecked();
```

Keeping these roles separate makes failures easier to understand: the action performs the behavior, and the assertion confirms the result.

## Exercise 04 - Fixtures Lab

### Goal

Exercise 04 introduces Playwright's built-in fixtures and custom fixtures. The implementation is split into:

```text
fixtures/todo.fixture.ts
tests/04-fixtures/todo-fixture.spec.ts
```

The custom fixture exposes a small TodoMVC API:

```ts
todoApp.add(task);
todoApp.complete(task);
todoApp.delete(task);
todoApp.item(task);
```

The tests use the TodoMVC application at:

```text
https://demo.playwright.dev/todomvc/
```

### What Is a Fixture?

A fixture is prepared test functionality or test data that Playwright provides to a test. The built-in `page` fixture is a browser page that tests can navigate and interact with:

```ts
test('example', async ({ page }) => {
  await page.goto('https://example.com');
});
```

The custom `todoApp` fixture provides a higher-level object for TodoMVC behavior:

```ts
test('user can create todo', async ({ todoApp }) => {
  await todoApp.add('Learn Playwright');
});
```

The test does not need to know how the input is located or how a todo is submitted. Those implementation details are owned by the fixture.

### What Does `use()` Do?

`use()` passes the prepared fixture value to the test and controls the fixture lifecycle:

```ts
todoApp: async ({ page }, use) => {
  await page.goto('https://demo.playwright.dev/todomvc/');

  const todoApp = new TodoApp(page);
  await use(todoApp);
},
```

The lifecycle is:

1. Playwright creates the fixture and its dependencies.
2. The fixture performs setup, such as navigating to TodoMVC.
3. `use(todoApp)` makes the object available to the test.
4. The test runs.
5. Playwright finishes the fixture lifecycle and cleans up its test-scoped resources.

### Custom Fixture Implementation

The fixture extends Playwright's base test:

```ts
import { test as base } from '@playwright/test';

type TodoFixtures = {
  todoApp: TodoApp;
};

export const test = base.extend<TodoFixtures>({
  todoApp: async ({ page }, use) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
    await use(new TodoApp(page));
  },
});
```

Tests import this extended `test` instead of importing `test` directly from `@playwright/test`:

```ts
import { expect, test } from '../../fixtures/todo.fixture';
```

This makes `todoApp` available as a typed fixture argument alongside built-in fixtures such as `page`.

### Why Use a Custom Fixture Instead of a Helper?

A helper is a reusable function, for example:

```ts
async function addTodo(page: Page, task: string) {
  const todoInput = page.getByPlaceholder('What needs to be done?');
  await todoInput.fill(task);
  await todoInput.press('Enter');
}
```

A custom fixture is a reusable test dependency:

```ts
test('user can create todo', async ({ todoApp }) => {
  await todoApp.add('Learn Playwright');
});
```

Custom fixtures are useful when functionality:

- Is needed by many tests.
- Requires setup or cleanup.
- Depends on other fixtures such as `page`.
- Represents a domain object or application workflow.
- Should be isolated for each test.

Helpers are still appropriate for small, stateless operations. A fixture is a better abstraction when the object has a lifecycle and exposes several related actions.

### What Setup Belongs in a Fixture?

Fixture setup should include work that is shared, repeatable, and required before the test can use the fixture. For `todoApp`, that includes:

- Receiving the Playwright `page` fixture.
- Navigating to the TodoMVC application.
- Creating the `TodoApp` object.
- Passing it to the test with `use()`.
- Performing related cleanup if the fixture later owns external resources.

Assertions that describe a specific behavior should remain in the test. For example, the fixture knows how to complete a task, while the test verifies the result:

```ts
await todoApp.complete(task);
await expect(todoApp.item(task).getByRole('checkbox')).toBeChecked();
```

### Fixture API

The `TodoApp` class hides the page locators and exposes application behavior:

```ts
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
```

The `item()` method remains available for assertions, but the tests do not need to know how the TodoMVC list is scoped or how its delete control is implemented.

### Gherkin-Style Test Organization

Each fixture test follows one `Given`, one `When`, and one `Then` step:

```ts
await test.step('Given a todo has been added', async () => {
  await todoApp.add(task);
});

await test.step('When the user completes the todo', async () => {
  await todoApp.complete(task);
});

await test.step('Then the todo is marked completed', async () => {
  await expect(todoApp.item(task).getByRole('checkbox')).toBeChecked();
});
```

The `Given` establishes preconditions, the `When` performs the behavior under test, and the `Then` verifies the outcome. Keeping one step for each phase makes the report readable and keeps test intent clear.

## Exercise 05 - Page Object Lab

### Goal

Exercise 05 introduces Page Objects without turning the test suite into a second, opaque API. The implementation is in:

```text
pages/TodoPage.ts
pages/HeavyTodoPage.ts
tests/05-page-objects/todo-page.spec.ts
```

The Page Objects use the TodoMVC application at:

```text
https://demo.playwright.dev/todomvc/
```

### What Is a Page Object?

A Page Object is a class that groups the locators and actions for one page or application area. It creates a boundary around page implementation details while allowing tests to describe user behavior.

The minimal `TodoPage` exposes navigation, actions, and an item locator:

```ts
export class TodoPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  async addTodo(task: string) {
    const todoInput = this.page.getByPlaceholder('What needs to be done?');
    await todoInput.fill(task);
    await todoInput.press('Enter');
  }

  todoItem(task: string): Locator {
    return this.page
      .locator('.todo-list')
      .getByRole('listitem')
      .filter({ hasText: task });
  }
}
```

The test remains responsible for the scenario and its assertions:

```ts
const todoPage = new TodoPage(page);

await todoPage.goto();
await todoPage.addTodo('Learn Page Objects');
await expect(todoPage.todoItem('Learn Page Objects')).toBeVisible();
```

### Minimal Page Object Versus Heavy Abstraction

The minimal version exposes actions such as `addTodo`, `completeTodo`, and `deleteTodo`, while leaving assertions in the test. This keeps the test readable and makes failures easy to locate:

```ts
await todoPage.completeTodo(task);
await expect(todoPage.todoItem(task).getByRole('checkbox')).toBeChecked();
```

The deliberately heavy comparison object exposes workflow methods such as:

```ts
await todoPage.addAndVerify(task);
await todoPage.completeAndVerify(task);
await todoPage.assertCompleted(task);
```

This produces shorter tests, but it hides both the Playwright action and the assertion behind another API. It can be useful for a stable, repeated business workflow, but it can also make failures harder to debug and make the available behavior less discoverable.

### Comparison

| Concern | Minimal Page Object | Abstraction-heavy Page Object |
| --- | --- | --- |
| Readability | Shows the action and assertion clearly | Tests are shorter but less explicit |
| Debugging | Failure points to the test assertion or page action | Failure may be several calls deep in the wrapper |
| Discoverability | Methods map directly to page behavior | Many workflow methods must be learned |
| Playwright visibility | Locators and assertions remain visible in tests | More Playwright details are hidden |
| Maintenance | Centralizes locators without hiding test intent | Centralizes more behavior but increases coupling |

The preferred default is the smallest Page Object that removes meaningful locator duplication while keeping scenario-specific assertions in the test.

### What Belongs in a Page Object?

Good Page Object responsibilities include:

- Locators that belong to the page.
- Repeated page actions such as adding or completing a todo.
- Navigation to the page.
- Small page-specific workflows that are genuinely reused.
- Returning locators when tests need to make their own assertions.

Avoid putting every possible assertion and business scenario into the Page Object. Tests should still reveal what behavior is being verified.

### Page Object and Fixture Differences

A Page Object models the page and its actions. A fixture controls how that object is created, prepared, and provided to tests.

```text
Page Object:  TodoPage.addTodo(task)
Fixture:      creates TodoPage, navigates to TodoMVC, and exposes todoApp
Test:         describes the scenario and checks the expected result
```

The Exercise 04 fixture and Exercise 05 Page Object can be combined, but they solve different problems. A fixture owns lifecycle and dependency injection; a Page Object owns page interaction.

### Gherkin-Style Test Organization

The Page Object tests keep one `Given`, one `When`, and one `Then` per scenario:

```ts
await test.step('Given a todo has been added', async () => {
  await todoPage.goto();
  await todoPage.addTodo(task);
});

await test.step('When the user completes the todo', async () => {
  await todoPage.completeTodo(task);
});

await test.step('Then the todo is marked completed', async () => {
  await expect(todoPage.todoItem(task).getByRole('checkbox')).toBeChecked();
});
```

The Page Object keeps implementation details organized, while the `Given`/`When`/`Then` steps keep the test report readable and behavior-focused.


## Exercise 06 - Authentication Lab

### Goal

Exercise 06 covers browsers, browser contexts, pages, cookies, local storage, and reusable authenticated state.

The implementation is in:

```text
tests/06-auth/auth.setup.ts
tests/06-auth/authenticated.spec.ts
```

The example application is Sauce Demo:

```text
https://www.saucedemo.com/
```

The public training credentials used by the setup are `standard_user` and `secret_sauce`.

### What Is a Browser?

A browser is the actual browser engine process, such as Chromium, Firefox, or WebKit. It can contain multiple isolated browser contexts.

Playwright normally launches and manages the browser for the test run. Tests usually work with the `page` fixture instead of managing the browser process directly.

### What Is a BrowserContext?

A `BrowserContext` is an isolated browser session, similar to a separate browser profile. Contexts isolate cookies, local storage, permissions, and other session data from one another.

This makes it possible to test different users independently in the same browser process. A new context also prevents one test's authentication state from leaking into another test.

### What Is a Page?

A `Page` is a single browser tab inside a browser context. It provides the APIs used to navigate, locate elements, interact with the UI, and assert page state.

```ts
test('example', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
});
```

The relationship is:

```text
Browser -> BrowserContext -> Page
```

### What Does `storageState` Preserve?

The setup logs in once and saves the context state:

```ts
await page.context().storageState({
  path: 'playwright/.auth/user.json',
});
```

Playwright storage state includes cookies and origin-scoped local storage. It can also include IndexedDB when explicitly requested with the supported `indexedDB` option.

Storage state does not represent every kind of browser state. For example, session storage is not automatically saved by `storageState`. A test that depends on session storage needs separate setup.

The saved file is ignored by Git through `.gitignore`:

```text
playwright/.auth/
```

Authentication state can contain sensitive session information, so it should not be committed.

### How the Authentication Project Works

The Playwright configuration has a setup project and an authenticated project:

```ts
{
  name: 'setup',
  testMatch: /.*\.setup\.ts/,
},
{
  name: 'chromium-auth',
  dependencies: ['setup'],
  testMatch: /06-auth\/.*\.spec\.ts/,
  use: {
    storageState: 'playwright/.auth/user.json',
  },
},
```

The dependency means the setup project runs before the authenticated tests. The authenticated test can open the inventory page directly:

```ts
await page.goto('https://www.saucedemo.com/inventory.html');
await expect(page.getByText('Products')).toBeVisible();
```

No login steps are repeated in the test because the browser context starts with the saved state.

### Authenticate Once or Per Test?

Authenticate once and reuse storage state when:

- Login is slow or expensive.
- The authenticated state can safely be shared by tests.
- Tests do not modify shared account data in conflicting ways.
- The login flow itself has separate dedicated coverage.

Authenticate per test or per worker when:

- Tests change user-specific state.
- Tests need independent users.
- Authentication expires quickly.
- One test could invalidate or modify another test's session.
- The application requires a unique account or token per test.

The practical pattern is to authenticate once during setup, then use isolated contexts for tests. Do not share a mutable browser context between tests.

## Exercise 07 - API Lab

### Goal

Exercise 07 uses Playwright outside the browser with the built-in `request` fixture. The implementation is in:

```text
tests/07-api/api.spec.ts
```

The spec uses JSONPlaceholder:

```text
https://jsonplaceholder.typicode.com
```

### What Is the `request` Fixture?

The `request` fixture provides an `APIRequestContext`. It can send HTTP requests without opening a browser:

```ts
test('GET request', async ({ request }) => {
  const response = await request.get(
    'https://jsonplaceholder.typicode.com/posts/1',
  );

  expect(response.ok()).toBeTruthy();
});
```

This is useful for API tests, fast test-data setup, authentication helpers, and verifying backend behavior separately from the UI.

### HTTP Methods Covered

The API spec exercises each requested method:

- `GET` reads a resource.
- `POST` sends a new resource and expects a `201` response.
- `PUT` replaces a complete resource.
- `PATCH` updates selected fields.
- `DELETE` removes a resource and expects a successful response.

Each response is checked for both an appropriate status and expected response data where the API provides it.

### API Setup Followed by a Browser Check

The final test uses `request` to prepare and inspect a resource, then opens the same resource in a browser:

```ts
const response = await request.get(`${apiUrl}/posts/1`);
const body = await response.json();

await page.goto(`${apiUrl}/posts/${body.id}`);
await expect(page.locator('body')).toContainText(`"id": ${body.id}`);
```

This demonstrates the API-to-browser handoff. JSONPlaceholder is a mock service: its `POST`, `PUT`, `PATCH`, and `DELETE` responses simulate success but do not persist changes for later requests. A real application with a shared database would allow API-created data to be verified through its actual UI.

### Why Use API Setup?

API setup is often faster and less fragile than creating data through many UI interactions. A typical flow is:

```text
API request -> create or prepare data -> open browser -> verify user-facing behavior
```

Use the UI for behavior that users perform and the API for efficient setup or backend-specific coverage. Keep the boundary clear so an API test does not pretend to verify UI behavior, and a UI test does not duplicate every backend assertion.

### API Assertions

Useful response checks include:

```ts
expect(response.status()).toBe(200);
expect(response.ok()).toBeTruthy();
expect(body).toMatchObject({ id: 1 });
expect(body.title).toEqual(expect.any(String));
```

Status assertions confirm the protocol result. Body assertions confirm the response contract. Both are valuable because a successful HTTP status alone does not guarantee that the returned data is correct.

## Exercise 08 - Network Mocking Lab

### Goal

Exercise 08 covers intercepting and controlling network traffic with `page.route()`.

The implementation is in:

```text
tests/08-mocking/api-mock.spec.ts
```

The spec opens Sauce Demo and intercepts a same-origin request to:

```text
/api/todos
```

### What the Mocking Spec Covers

The test suite provides four deterministic response scenarios:

- Happy path with status `200` and one todo.
- Server error with status `500` and an error body.
- Slow API response with a short simulated delay.
- Empty state with status `200` and an empty array.

The route handler uses `route.fulfill()`:

```ts
await page.route('**/api/todos', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, title: 'Learn route mocking' }]),
  });
});
```

The delay in the slow-API scenario belongs to the mock because it simulates a server condition. The test itself uses a condition-based result and does not call `waitForTimeout()`.

### What Belongs in an Integration Environment?

An integration environment should be close enough to production to exercise real boundaries between the browser, frontend, backend, authentication, databases, and external services. It should contain realistic configuration and representative data, while remaining isolated from production users and data.

Useful integration-environment characteristics include:

- A deployed frontend and backend that can communicate.
- A database or service layer with controlled test data.
- Test accounts and credentials managed outside source control.
- Stable service versions and repeatable setup and cleanup.
- Network access to the dependencies being integrated.
- Logs and diagnostics that make failures investigateable.

Mocks are valuable within focused tests, but they do not replace a smaller number of tests against a real integration environment.

### What Is Better Tested with a Mocked Response?

Mock a response when the behavior under test is the frontend's reaction to a controlled network condition, especially when the real condition is rare, expensive, or difficult to reproduce.

Good candidates include:

- `500` and other server errors.
- Empty data sets.
- Slow responses and timeouts.
- Malformed or incomplete payloads.
- Feature flags or backend states that are difficult to arrange.
- Third-party services that should not be called by every test.

Use real integration responses when verifying the contract between systems, authentication boundaries, serialization, deployment configuration, and real backend behavior.

### How Does Mocking Test Difficult Error States?

Without mocking, a test may have to wait for a real outage or depend on a service behaving incorrectly at exactly the right moment. A route mock makes the state intentional and repeatable:

```ts
await page.route('**/api/todos', async route => {
  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Service unavailable' }),
  });
});
```

The test can then verify the UI's error handling without causing an actual outage. A useful mocking suite should still include at least one real integration test so that the route and response contract are not drifting away from the backend.

## Exercise 09 - Browser Matrix

### Goal

Exercise 09 covers Playwright projects, cross-browser execution, device profiles, and the relationship between configuration and runtime objects.

The implementation is in:

```text
tests/09-browser-matrix/browser-matrix.spec.ts
```

The configuration includes these projects:

- `chromium` using Desktop Chrome.
- `firefox` using Desktop Firefox.
- `webkit` using Desktop Safari.
- `mobile-chromium` using the Pixel 5 device profile.
- `mobile-webkit` using the iPhone 12 device profile.

The mobile projects are scoped to the matrix exercise so the entire learning suite is not needlessly repeated for every mobile profile.

### What Is a Playwright Project?

A project is a named test configuration. It combines a browser or device profile with options such as viewport, user agent, permissions, storage state, retries, and test selection.

Projects allow the same test to run under different environments:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=mobile-chromium
```

### Browser, BrowserContext, Page, and Device

These objects form a hierarchy:

```text
Browser -> BrowserContext -> Page
```

- **Browser:** the Chromium, Firefox, or WebKit engine process.
- **BrowserContext:** an isolated session with its own cookies, storage, permissions, and settings.
- **Page:** one tab inside a browser context.
- **Device profile:** a configuration preset that applies properties such as viewport, user agent, touch support, and device scale factor. It does not create a new browser engine.

The browser engine is selected by the project. The device profile changes how that engine presents and behaves as a desktop or mobile device.

### Investigating Browser-Specific Behavior

The matrix spec reads `navigator.userAgent` and compares it with the active `browserName`. This deliberately exposes an engine difference: Chromium identifies itself with `Chrome`, Firefox with `Firefox`, and WebKit with `Safari`.

The important practice is to investigate a difference before adding a browser-specific workaround. Check the project configuration, viewport, user agent, context options, and application behavior first. Only keep a browser-specific branch when the application genuinely requires different behavior.

### Why Run a Browser Matrix?

Cross-browser execution can reveal differences in:

- Rendering and layout.
- CSS and standards support.
- Input, keyboard, and pointer behavior.
- Storage and permission behavior.
- Mobile viewport and touch interactions.
- Browser-specific networking or media capabilities.

The matrix should remain intentional. Run the full supported matrix for important user workflows, and use a focused project when experimenting or diagnosing one browser-specific behavior.

