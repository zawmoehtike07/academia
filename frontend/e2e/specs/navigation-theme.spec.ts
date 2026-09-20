import { test, expect } from '@playwright/test';
import { mockAppApis, setAuthenticatedState } from '../helpers/mockApi';

test.describe('Navigation & Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppApis(page);
    await setAuthenticatedState(page);
    await page.goto('/home');
  });

  test('should navigate between sidebar sections', async ({ page }) => {
    // Navigate to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Navigate to Groups
    await page.getByRole('link', { name: 'Groups' }).click();
    await expect(page).toHaveURL(/\/groups$/);

    // Navigate to Study
    await page.getByRole('link', { name: 'Study' }).click();
    await expect(page).toHaveURL(/\/study$/);

    // Navigate to Profile
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/\/profile$/);

    // Return to Home
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/home$/);
  });

  test('should toggle dark/light theme when clicking theme toggle button', async ({ page }) => {
    // Ensure initial state is light
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
    });
    await page.reload();

    const themeToggleBtn = page.getByRole('button', { name: /(Dark mode|Light mode)/ });
    await expect(themeToggleBtn).toBeVisible();

    const initialText = await themeToggleBtn.innerText();

    // Click toggle button
    await themeToggleBtn.click();

    // The button text should invert and html class should reflect it
    if (initialText.includes('Dark mode')) {
      await expect(page.locator('html')).toHaveClass(/dark/);
      await expect(themeToggleBtn).toContainText('Light mode');
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
      await expect(themeToggleBtn).toContainText('Dark mode');
    }
  });
});
