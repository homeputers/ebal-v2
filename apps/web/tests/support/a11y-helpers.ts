import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, type Route } from '@playwright/test';

type Json = Record<string, unknown> | Array<unknown>;

const AUTH_STORAGE_KEY = 'ebal.auth.tokens';
const AUTH_ME_STORAGE_KEY = 'ebal.auth.me';

const stubMeResponse = {
  id: 'a11y-user',
  email: 'a11y@example.com',
  displayName: 'A11y Planner',
  avatarUrl: null,
  roles: ['ADMIN', 'PLANNER', 'MUSICIAN'],
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const jsonHeaders = { 'content-type': 'application/json' } as const;

const createAuthTokens = () => ({
  accessToken: 'e2e-access-token',
  refreshToken: 'e2e-refresh-token',
  expiresAt: Date.now() + 60 * 60 * 1000,
});

export { jsonHeaders };

export async function seedAuthentication(page: Page) {
  const tokens = createAuthTokens();

  await page.addInitScript(
    ({ tokensKey, meKey, tokens: tokenPayload, me }) => {
      window.localStorage.setItem(tokensKey, JSON.stringify(tokenPayload));
      window.localStorage.setItem(meKey, JSON.stringify(me));
    },
    {
      tokensKey: AUTH_STORAGE_KEY,
      meKey: AUTH_ME_STORAGE_KEY,
      tokens,
      me: stubMeResponse,
    },
  );

  await page.route('**/api/v1/me', async (route) => {
    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify(stubMeResponse),
    });
  });
}

export function createPagedResponse<T extends Json>(content: T[]) {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20,
    first: true,
    last: true,
    numberOfElements: content.length,
    sort: { sorted: false, unsorted: true, empty: true },
    pageable: {
      sort: { sorted: false, unsorted: true, empty: true },
      pageNumber: 0,
      pageSize: 20,
      offset: 0,
      paged: true,
      unpaged: false,
    },
    empty: content.length === 0,
  };
}

export async function fulfillJson(route: Route, body: Json, status = 200) {
  await route.fulfill({
    status,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}

function assertNoCriticalViolations(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  const criticalViolations = results.violations.filter((violation) => violation.impact === 'critical');
  expect(criticalViolations).toEqual([]);
}

export async function runCriticalAxeAudit(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  assertNoCriticalViolations(results);
}

export async function tabUntilFocused(page: Page, locator: Locator, maxPresses = 25) {
  const isAlreadyFocused = await locator.evaluate((node) => node === document.activeElement);

  if (isAlreadyFocused) {
    return;
  }

  for (let attempt = 0; attempt < maxPresses; attempt += 1) {
    await page.keyboard.press('Tab');

    const isFocused = await locator.evaluate((node) => node === document.activeElement);

    if (isFocused) {
      return;
    }
  }

  throw new Error('Unable to reach the requested focus target via Tab navigation.');
}

export type { Json };
