import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

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

const createPagedResponse = <T extends Json>(content: T[]) => ({
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
});

async function seedAuthentication(page: Page) {
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

async function fulfillJson(route: Route, body: Json, status = 200) {
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

async function runCriticalAxeAudit(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  assertNoCriticalViolations(results);
}

test.describe('Admin surface accessibility', () => {
  test('Members page supports keyboard flows without critical violations', async ({ page }) => {
    await seedAuthentication(page);

    const members = [
      {
        id: 'member-1',
        displayName: 'Ada Lovelace',
        instruments: ['Piano'],
        email: 'ada@example.com',
        phoneNumber: '555-0100',
      },
      {
        id: 'member-2',
        displayName: 'Clara Schumann',
        instruments: ['Voice'],
        email: 'clara@example.com',
        phoneNumber: '555-0101',
      },
    ];

    await page.route('**/api/v1/members**', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await fulfillJson(route, createPagedResponse(members));
        return;
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as {
          displayName: string;
          instruments?: string[];
          email?: string | null;
        };

        const created = {
          id: `member-${members.length + 1}`,
          displayName: payload.displayName,
          instruments: payload.instruments ?? [],
          email: payload.email ?? null,
          phoneNumber: null,
        };

        members.push(created);
        await fulfillJson(route, created, 201);
        return;
      }

      await route.fallback();
    });

    await page.goto('/en/members');

    const heading = page.getByRole('heading', { name: 'Members' });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();

    await runCriticalAxeAudit(page);

    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Search by name...')).toBeFocused();
    await page.keyboard.press('Tab');
    const newMemberButton = page.getByRole('button', { name: 'New Member' });
    await expect(newMemberButton).toBeFocused();

    await newMemberButton.click();
    const createMemberDialog = page.getByRole('dialog', { name: 'New Member' });
    await expect(createMemberDialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(createMemberDialog).toBeHidden();
    await expect(newMemberButton).toBeFocused();

    await newMemberButton.click();
    await expect(createMemberDialog).toBeVisible();

    const displayNameField = page.getByLabel('Display Name');
    await displayNameField.fill('Test Member');

    const submission = page.waitForRequest((request) =>
      request.method() === 'POST' && request.url().includes('/api/v1/members'),
    );

    await page.keyboard.press('Enter');

    const createRequest = await submission;
    expect(createRequest.postDataJSON()).toMatchObject({ displayName: 'Test Member' });

    await expect(createMemberDialog).toBeHidden();
  });

  test('Songs listing is accessible and keyboard reachable', async ({ page }) => {
    await seedAuthentication(page);

    const songs = [
      {
        id: 'song-1',
        title: 'Great Is Thy Faithfulness',
        defaultKey: 'C',
        tags: ['Hymn', 'Classic'],
      },
      {
        id: 'song-2',
        title: 'Living Hope',
        defaultKey: 'E',
        tags: ['Modern'],
      },
    ];

    await page.route('**/api/v1/songs**', async (route) => {
      const request = route.request();

      if (request.method() === 'GET' && !/\/songs\/[A-Za-z0-9-]+/.test(request.url())) {
        await fulfillJson(route, createPagedResponse(songs));
        return;
      }

      await route.fallback();
    });

    await page.goto('/en/songs');

    const heading = page.getByRole('heading', { name: 'Songs' });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();

    await runCriticalAxeAudit(page);

    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Search by title...')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'New Song' })).toBeFocused();
  });

  test('Song detail with arrangements passes axe audit', async ({ page }) => {
    await seedAuthentication(page);

    const songId = 'song-1';
    const songDetail = {
      id: songId,
      title: 'Living Hope',
      author: 'Phil Wickham',
      defaultKey: 'E',
      tags: ['Modern Worship'],
      ccli: '7106807',
      updatedAt: '2024-05-10T12:00:00.000Z',
    };
    const arrangements = [
      {
        id: 'arr-1',
        songId,
        key: 'E',
        bpm: 72,
        meter: '4/4',
      },
      {
        id: 'arr-2',
        songId,
        key: 'D',
        bpm: 70,
        meter: '4/4',
      },
    ];

    await page.route(`**/api/v1/songs/${songId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await fulfillJson(route, songDetail);
        return;
      }

      await route.fallback();
    });

    await page.route(`**/api/v1/songs/${songId}/arrangements`, async (route) => {
      if (route.request().method() === 'GET') {
        await fulfillJson(route, arrangements);
        return;
      }

      await route.fallback();
    });

    await page.goto(`/en/songs/${songId}`);

    const heading = page.getByRole('heading', { name: songDetail.title });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();

    await runCriticalAxeAudit(page);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'New Arrangement' })).toBeFocused();
  });

  test('Services page exposes actions to keyboard users and menu arrow keys', async ({ page }) => {
    await seedAuthentication(page);

    const services = [
      {
        id: 'service-1',
        startsAt: '2024-06-09T09:00:00.000Z',
        location: 'Main Campus',
      },
      {
        id: 'service-2',
        startsAt: '2024-06-16T09:00:00.000Z',
        location: 'Downtown Campus',
      },
    ];

    await page.route('**/api/v1/services**', async (route) => {
      if (route.request().method() === 'GET') {
        await fulfillJson(route, createPagedResponse(services));
        return;
      }

      await route.fallback();
    });

    await page.goto('/en/services');

    const heading = page.getByRole('heading', { name: 'Services' });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();

    await runCriticalAxeAudit(page);

    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Search...')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('From date')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('To date')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'New Service' })).toBeFocused();

    const accountMenuTrigger = page.getByRole('button', {
      name: /Account options for A11y Planner/,
    });
    await accountMenuTrigger.click();

    const profileItem = page.getByRole('menuitem', { name: 'Profile' });
    await expect(profileItem).toBeVisible();
    await expect(profileItem).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('ArrowDown');
    const changePasswordItem = page.getByRole('menuitem', { name: 'Change password' });
    await expect(changePasswordItem).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('ArrowDown');
    const logoutItem = page.getByRole('menuitem', { name: 'Log out' });
    await expect(logoutItem).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('ArrowUp');
    await expect(changePasswordItem).toHaveAttribute('data-active', 'true');

    await page.keyboard.press('Escape');
    await expect(accountMenuTrigger).toBeFocused();
  });

  test('Song sets listing remains accessible with modals', async ({ page }) => {
    await seedAuthentication(page);

    const sets = [
      {
        id: 'set-1',
        name: 'June 9 - AM',
        itemsCount: 4,
      },
      {
        id: 'set-2',
        name: 'June 16 - AM',
        itemsCount: 5,
      },
    ];

    await page.route('**/api/v1/song-sets**', async (route) => {
      if (route.request().method() === 'GET' && !route.request().url().includes('/items')) {
        await fulfillJson(route, createPagedResponse(sets));
        return;
      }

      await route.fallback();
    });

    await page.goto('/en/song-sets');

    const heading = page.getByRole('heading', { name: 'Song Sets' });
    await expect(heading).toBeVisible();
    await expect(heading).toBeFocused();

    await runCriticalAxeAudit(page);

    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Search by name...')).toBeFocused();
    await page.keyboard.press('Tab');
    const newSetButton = page.getByRole('button', { name: 'New Set' });
    await expect(newSetButton).toBeFocused();

    await newSetButton.click();
    const createSetDialog = page.getByRole('dialog', { name: 'New Set' });
    await expect(createSetDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(createSetDialog).toBeHidden();
    await expect(newSetButton).toBeFocused();
  });
});
