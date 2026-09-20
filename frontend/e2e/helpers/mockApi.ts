import { Page } from '@playwright/test';

export interface MockUser {
  username: string;
  email: string;
}

export const defaultMockUser: MockUser = {
  username: 'testuser',
  email: 'testuser@example.com',
};

/**
 * Mocks successful login and registration API calls.
 */
export async function mockSuccessfulAuth(page: Page, user: MockUser = defaultMockUser) {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-12345',
        username: user.username,
        email: user.email,
      }),
    });
  });

  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-12345',
        username: user.username,
        email: user.email,
      }),
    });
  });
}

/**
 * Mocks failed login with an error response.
 */
export async function mockFailedAuth(page: Page, message = 'Invalid credentials') {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message }),
    });
  });
}

/**
 * Mocks common authenticated endpoints (dashboard, groups, user profile).
 */
export async function mockAppApis(page: Page) {
  await page.route('**/api/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        todaySeconds: 3600,
        totalSessions: 4,
        totalFocusSeconds: 14400,
        currentStreak: 5,
        dailyBreakdown: [],
      }),
    });
  });

  await page.route('**/api/groups**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Algorithms Study Group', description: 'LeetCode & CS', memberCount: 3 },
      ]),
    });
  });

  await page.route('**/api/user/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        username: defaultMockUser.username,
        email: defaultMockUser.email,
        pomodoroStudyMinutes: 25,
        pomodoroBreakMinutes: 5,
      }),
    });
  });
}

/**
 * Pre-authenticates the browser session by seeding localStorage before navigation.
 */
export async function setAuthenticatedState(page: Page, user: MockUser = defaultMockUser) {
  await page.addInitScript((userData) => {
    localStorage.setItem('token', 'mock-jwt-token-12345');
    localStorage.setItem('user', JSON.stringify(userData));
  }, user);
}
