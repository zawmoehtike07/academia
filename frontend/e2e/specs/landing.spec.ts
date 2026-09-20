import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the landing page hero with title and description', async ({ page }) => {
    // Check page heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome to Academia');

    // Check descriptive paragraph
    const description = page.locator('p');
    await expect(description).toContainText('Your ultimate collaborative study platform');
  });

  test('should navigate to the Login page when clicking "Log In"', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'Log In' });
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should navigate to the Register page when clicking "Create an Account"', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: 'Create an Account' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  });
});
