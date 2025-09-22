import { expect, test } from '@playwright/test';

const EN_NAV_LABELS = ['Members', 'Groups', 'Songs', 'Song Sets', 'Services'];
const ES_NAV_LABELS = [
  'Miembros',
  'Grupos',
  'Canciones',
  'Listas de canciones',
  'Servicios',
];

const LANGUAGE_BUTTON_NAME = /Change language|Cambiar idioma/;
const AUTH_STORAGE_KEY = 'ebal.auth.tokens';

const stubAuthMeResponse = {
  id: 'e2e-user',
  email: 'e2e@example.com',
  displayName: 'E2E User',
  roles: ['ADMIN'],
};

const emptyServicesPage = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  numberOfElements: 0,
  sort: { sorted: false, unsorted: true, empty: true },
  pageable: {
    sort: { sorted: false, unsorted: true, empty: true },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false,
  },
  empty: true,
};

const createAuthTokens = () => ({
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
  expiresAt: Date.now() + 60 * 60 * 1000,
});

test('language switcher smoke: switches navigation language and persists after reload', async ({
  page,
}) => {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(stubAuthMeResponse),
    });
  });

  await page.route('**/api/v1/services**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyServicesPage),
    });
  });

  await page.addInitScript(
    ({ storageKey, tokens }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(tokens));
    },
    { storageKey: AUTH_STORAGE_KEY, tokens: createAuthTokens() },
  );

  await page.goto('/en/services');

  for (const label of EN_NAV_LABELS) {
    await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await page.getByRole('button', { name: LANGUAGE_BUTTON_NAME }).click();
  await page.getByRole('option', { name: 'Español' }).click();

  await expect(page).toHaveURL(/\/es\/services$/);

  for (const label of ES_NAV_LABELS) {
    await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await expect(page.getByRole('button', { name: LANGUAGE_BUTTON_NAME })).toContainText(
    'Español',
  );

  await page.reload();

  await expect(page).toHaveURL(/\/es\/services$/);

  for (const label of ES_NAV_LABELS) {
    await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await expect(page.getByRole('button', { name: LANGUAGE_BUTTON_NAME })).toContainText(
    'Español',
  );
});
