import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { mockAppApis, setAuthenticatedState } from '../../helpers/mockApi';

const { Given, When, Then } = createBdd();

Given('I am an unauthenticated user', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
});

Given('I am logged in as {string}', async ({ page }, username: string) => {
  await mockAppApis(page);
  await setAuthenticatedState(page, {
    username,
    email: `${username}@example.com`,
  });
  await page.goto('/home');
});

When('I navigate to {string}', async ({ page }, path: string) => {
  await page.goto(path);
});

Then('I should be redirected to the login page', async ({ page }) => {
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

When('I click the theme toggle button', async ({ page }) => {
  const themeToggleBtn = page.getByRole('button', { name: /(Dark mode|Light mode)/ });
  await expect(themeToggleBtn).toBeVisible();
  await themeToggleBtn.click();
});

Then('the theme should toggle between light and dark mode', async ({ page }) => {
  const themeToggleBtn = page.getByRole('button', { name: /(Dark mode|Light mode)/ });
  await expect(themeToggleBtn).toBeVisible();
  const text = await themeToggleBtn.innerText();
  if (text.includes('Light mode')) {
    await expect(page.locator('html')).toHaveClass(/dark/);
  } else {
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  }
});
