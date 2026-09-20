import { test, expect } from '@playwright/test';

test.describe('Protected Routes Access Control', () => {
  const protectedPaths = ['/home', '/dashboard', '/groups', '/study', '/profile'];

  for (const path of protectedPaths) {
    test(`unauthenticated visit to ${path} should redirect to /login`, async ({ page }) => {
      // Ensure clean storage
      await page.addInitScript(() => {
        localStorage.clear();
      });

      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    });
  }
});
