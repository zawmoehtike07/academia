import { test, expect } from '@playwright/test';
import { mockSuccessfulAuth, mockFailedAuth, mockAppApis } from '../helpers/mockApi';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await mockAppApis(page);
    await page.goto('/login');
  });

  test('should display validation error when submitting with invalid credentials', async ({ page }) => {
    await mockFailedAuth(page, 'Bad credentials');

    await page.getByPlaceholder('testuser').fill('wronguser');
    await page.getByPlaceholder('••••••••••••').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify error banner
    const errorBanner = page.locator('.bg-\\[\\#FFEAEA\\]');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Bad credentials');
  });

  test('should successfully log in and navigate to home with valid credentials', async ({ page }) => {
    await mockSuccessfulAuth(page, {
      username: 'johndoe',
      email: 'johndoe@example.com',
    });

    await page.getByPlaceholder('testuser').fill('johndoe');
    await page.getByPlaceholder('••••••••••••').fill('securePassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify redirection to /home
    await expect(page).toHaveURL(/\/home$/);

    // Verify welcome message in sidebar
    await expect(page.getByText('Welcome, johndoe')).toBeVisible();
  });

  test('should allow user to sign out and clear session', async ({ page }) => {
    await mockSuccessfulAuth(page, {
      username: 'johndoe',
      email: 'johndoe@example.com',
    });

    await page.getByPlaceholder('testuser').fill('johndoe');
    await page.getByPlaceholder('••••••••••••').fill('securePassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/home$/);

    // Click Sign out button
    const signOutBtn = page.getByRole('button', { name: 'Sign out' });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login$/);

    // Verify token was cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
