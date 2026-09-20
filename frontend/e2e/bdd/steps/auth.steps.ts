import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { mockFailedAuth, mockSuccessfulAuth, mockAppApis } from '../../helpers/mockApi';

const { Given, When, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
  await mockAppApis(page);
  await page.goto('/login');
});

When('I attempt to log in with username {string} and password {string}', async ({ page }, username: string, password: string) => {
  if (username === 'invaliduser') {
    await mockFailedAuth(page, 'Invalid credentials');
  } else {
    await mockSuccessfulAuth(page, {
      username,
      email: `${username}@example.com`,
    });
  }

  await page.getByPlaceholder('testuser').fill(username);
  await page.getByPlaceholder('••••••••••••').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
});

Then('I should see an error message {string}', async ({ page }, errorMessage: string) => {
  const errorBanner = page.locator('.bg-\\[\\#FFEAEA\\]');
  await expect(errorBanner).toBeVisible();
  await expect(errorBanner).toContainText(errorMessage);
});

Then('I should be redirected to the home page', async ({ page }) => {
  await expect(page).toHaveURL(/\/home$/);
});

Then('I should see {string} in the sidebar', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});
