import { errors, expect, test } from '@playwright/test';
import {
  createPagedResponse,
  fulfillJson,
  jsonHeaders,
  runCriticalAxeAudit,
  seedAuthentication,
  tabUntilFocused,
} from './support/a11y-helpers';

test.describe('Accessibility acceptance tour', () => {
  test('planner can complete critical flows with keyboard only', async ({ page }) => {
    await seedAuthentication(page);

    await page.addInitScript(() => {
      window['__printed'] = false;

      window.print = () => {
        window['__printed'] = true;
      };
    });

    const serviceId = 'service-acceptance';
    const services: Array<{ id: string; startsAt: string; location: string | null }>
      = [];

    type PlanItem = {
      id: string;
      type: 'note' | 'song';
      refId?: string | null;
      notes?: string | null;
      sortOrder: number;
    };

    const planItems: PlanItem[] = [
      {
        id: 'plan-note-1',
        type: 'note',
        notes: 'Welcome and announcements',
        sortOrder: 0,
      },
    ];

    const getSortedPlanItems = () =>
      [...planItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const songs = [
      { id: 'song-1', title: 'Living Hope', defaultKey: 'E' },
      { id: 'song-2', title: 'Great Is Thy Faithfulness', defaultKey: 'C' },
    ];

    const arrangementsBySongId: Record<string, Array<{ id: string; songId: string; key: string; bpm: number; meter: string }>> = {
      'song-1': [
        { id: 'arr-1', songId: 'song-1', key: 'E', bpm: 72, meter: '4/4' },
      ],
      'song-2': [
        { id: 'arr-2', songId: 'song-2', key: 'C', bpm: 84, meter: '3/4' },
      ],
    };

    const arrangementById = Object.values(arrangementsBySongId).flat().reduce(
      (acc, arrangement) => {
        acc[arrangement.id] = arrangement;
        return acc;
      },
      {} as Record<string, { id: string; songId: string; key: string; bpm: number; meter: string }>,
    );

    const songSets = [
      {
        id: 'set-1',
        name: 'Morning Worship',
        itemsCount: 2,
      },
    ];

    let songSetItems = [
      {
        id: 'set-item-1',
        arrangementId: 'arr-1',
        transpose: 0,
        capo: 0,
        sortOrder: 0,
      },
      {
        id: 'set-item-2',
        arrangementId: 'arr-2',
        transpose: 0,
        capo: 0,
        sortOrder: 1,
      },
    ];

    await page.route(/\/api\/v1\/services(?:\?.*)?$/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === 'GET' && url.pathname.endsWith('/services')) {
        await fulfillJson(route, createPagedResponse(services));
        return;
      }

      if (request.method() === 'POST' && url.pathname.endsWith('/services')) {
        const payload = request.postDataJSON() as { startsAt: string; location?: string | null };
        const created = {
          id: serviceId,
          startsAt: payload.startsAt,
          location: payload.location ?? null,
        };
        services.splice(0, services.length, created);
        await fulfillJson(route, created, 201);
        return;
      }

      await route.fallback();
    });

    await page.route(new RegExp(`/api/v1/services/${serviceId}(?:\\?.*)?$`), async (route) => {
      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        await route.fulfill({ status: 404 });
        return;
      }

      await fulfillJson(route, service);
    });

    await page.route(new RegExp(`/api/v1/services/${serviceId}/plan-items(?:\\?.*)?$`), async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await fulfillJson(route, getSortedPlanItems());
        return;
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as {
          type: 'song' | 'note' | 'reading';
          refId?: string | null;
          notes?: string | null;
          sortOrder?: number;
        };

        const nextId = `plan-item-${planItems.length + 1}`;
        const newItem: PlanItem = {
          id: nextId,
          type: payload.type === 'song' ? 'song' : 'note',
          refId: payload.refId ?? null,
          notes: payload.notes ?? null,
          sortOrder: payload.sortOrder ?? planItems.length,
        };
        planItems.push(newItem);
        await fulfillJson(route, newItem, 201);
        return;
      }

      await route.fallback();
    });

    await page.route(/\/api\/v1\/songs\/arrangements\/[^/?#]+(?:\?.*)?$/, async (route) => {
      const match = route.request().url().match(/arrangements\/([^/?#]+)/);
      const arrangement = match ? arrangementById[match[1]] : undefined;
      if (!arrangement) {
        await route.fulfill({ status: 404 });
        return;
      }

      await fulfillJson(route, arrangement);
    });

    await page.route(/\/api\/v1\/songs\/[^/?#]+\/arrangements(?:\?.*)?$/, async (route) => {
      const match = route.request().url().match(/songs\/([^/?#]+)\/arrangements/);
      const songId = match ? match[1] : undefined;
      const arrangements = (songId && arrangementsBySongId[songId]) || [];
      await fulfillJson(route, arrangements);
    });

    await page.route(/\/api\/v1\/songs(?:\/[^/?#]+)?(?:\?.*)?$/, async (route) => {
      const url = new URL(route.request().url());
      const { pathname } = url;

      if (pathname.endsWith('/songs')) {
        const query = url.searchParams.get('title')?.toLowerCase() ?? '';
        const filtered = songs.filter((song) => song.title.toLowerCase().includes(query));
        await fulfillJson(route, createPagedResponse(filtered));
        return;
      }

      const match = pathname.match(/\/songs\/([^/]+)$/);
      const songId = match ? match[1] : undefined;
      const song = songs.find((s) => s.id === songId);
      if (!song) {
        await route.fulfill({ status: 404 });
        return;
      }

      await fulfillJson(route, song);
    });

    await page.route(/\/api\/v1\/song-sets(?:\?.*)?$/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());

      if (request.method() === 'GET' && url.pathname.endsWith('/song-sets')) {
        await fulfillJson(route, createPagedResponse(songSets));
        return;
      }

      await route.fallback();
    });

    await page.route(/\/api\/v1\/song-sets\/[^/?#]+(?:\/items(?:\/reorder)?)?(?:\?.*)?$/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const match = url.pathname.match(/\/song-sets\/([^/]+)(?:\/items.*)?$/);
      const setId = match ? match[1] : undefined;

      if (request.method() === 'GET' && url.pathname.endsWith(`/song-sets/${setId}`)) {
        const set = songSets.find((s) => s.id === setId);
        if (!set) {
          await route.fulfill({ status: 404 });
          return;
        }
        await fulfillJson(route, set);
        return;
      }

      if (request.method() === 'GET' && url.pathname.endsWith(`/song-sets/${setId}/items`)) {
        const items = [...songSetItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        await fulfillJson(route, items);
        return;
      }

      if (request.method() === 'POST' && url.pathname.endsWith(`/song-sets/${setId}/items/reorder`)) {
        const body = route.request().postDataJSON() as string[];
        const idToItem = songSetItems.reduce<Record<string, (typeof songSetItems)[number]>>((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {});
        songSetItems = body
          .map((id, index) => ({ ...idToItem[id], sortOrder: index }))
          .filter((item): item is (typeof songSetItems)[number] => Boolean(item));

        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.fulfill({ status: 204, headers: jsonHeaders, body: '' });
        return;
      }

      await route.fallback();
    });

    await page.goto('/en/services');

    const newServiceButton = page.getByRole('button', { name: 'New Service' });
    await expect(newServiceButton).toBeVisible();

    await runCriticalAxeAudit(page);
    await tabUntilFocused(page, newServiceButton);
    await page.keyboard.press('Enter');

    const createDialog = page.getByRole('dialog', { name: 'New Service' });
    await expect(createDialog).toBeVisible();

    const startsAtField = createDialog.getByLabel('Starts At');
    await expect(startsAtField).toBeFocused();
    await page.keyboard.type('2024-06-09T09:00');

    const locationField = createDialog.getByLabel('Location');
    await tabUntilFocused(page, locationField);
    await expect(locationField).toBeFocused();
    await page.keyboard.type('Main Campus Sanctuary');

    const saveButton = createDialog.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled();
    await expect(locationField).toBeFocused();

    await tabUntilFocused(page, saveButton, { direction: 'backward', fallbackDirection: 'forward' });
    await expect(saveButton).toBeFocused();

    const waitForCreateRequest = (key: 'Enter' | 'Space') =>
      Promise.all([
        page.waitForRequest(
          (request) => request.method() === 'POST' && request.url().includes('/api/v1/services'),
          { timeout: 5000 },
        ),
        saveButton.press(key),
      ]).then(([request]) => request);

    let submittedCreateRequest;

    try {
      submittedCreateRequest = await waitForCreateRequest('Enter');
    } catch (error) {
      if (!(error instanceof errors.TimeoutError)) {
        throw error;
      }

      await expect(saveButton).toBeFocused();
      submittedCreateRequest = await waitForCreateRequest('Space');
    }
    expect(submittedCreateRequest.postDataJSON()).toMatchObject({
      startsAt: expect.stringContaining('2024-06-09T09:00'),
      location: 'Main Campus Sanctuary',
    });

    await expect(createDialog).toBeHidden();

    const openPlanLink = page.getByRole('link', { name: 'Open plan' });
    await expect(openPlanLink).toBeVisible();
    await tabUntilFocused(page, openPlanLink);
    await page.keyboard.press('Enter');

    await expect(page.getByText('Main Campus Sanctuary')).toBeVisible();
    await runCriticalAxeAudit(page);

    const typeSelect = page.getByLabel('Item type');
    await tabUntilFocused(page, typeSelect);
    await page.keyboard.press('ArrowDown');

    const songCombobox = page.getByRole('combobox', { name: 'Song' });
    await tabUntilFocused(page, songCombobox);
    await page.keyboard.type('Living');
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/songs') &&
        response.request().method() === 'GET' &&
        response.url().includes('title=Living'),
    );
    await songCombobox.press('ArrowDown');
    await songCombobox.press('Enter');

    const arrangementCombobox = page.getByRole('combobox', { name: 'Arrangement' });
    await tabUntilFocused(page, arrangementCombobox);
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/songs/song-1/arrangements') &&
        response.request().method() === 'GET',
    );
    await arrangementCombobox.press('ArrowDown');
    await arrangementCombobox.press('Enter');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeFocused();

    const addRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes(`/api/v1/services/${serviceId}/plan-items`),
    );
    await page.keyboard.press('Enter');

    const submittedAddRequest = await addRequest;
    expect(submittedAddRequest.postDataJSON()).toMatchObject({ type: 'song', refId: 'arr-1' });

    await expect(page.getByRole('status', { name: 'Item added' })).toBeVisible();
    await expect(page.getByText('Living Hope')).toBeVisible();

    const songSetsLink = page.getByRole('link', { name: 'Song Sets' });
    await tabUntilFocused(page, songSetsLink, 40);
    await page.keyboard.press('Enter');

    const songSetsHeading = page.getByRole('heading', { name: 'Song Sets' });
    await expect(songSetsHeading).toBeFocused();
    await runCriticalAxeAudit(page);

    const openSetLink = page.getByRole('link', { name: 'Open' });
    await tabUntilFocused(page, openSetLink);
    await page.keyboard.press('Enter');

    const setHeading = page.getByRole('heading', { name: 'Morning Worship' });
    await expect(setHeading).toBeFocused();
    await runCriticalAxeAudit(page);

    const reorderHandle = page.getByRole('button', { name: 'Drag to reorder' }).first();
    await tabUntilFocused(page, reorderHandle);

    const reorderRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' && request.url().includes('/song-sets/set-1/items/reorder'),
    );

    await reorderHandle.press('Space');
    await reorderHandle.press('ArrowDown');
    await reorderHandle.press('Space');

    const submittedReorderRequest = await reorderRequest;
    expect(submittedReorderRequest.postDataJSON()).toEqual(['set-item-2', 'set-item-1']);

    const savingAnnouncement = page.getByText('Saving order…');
    await expect(savingAnnouncement).toBeVisible();

    await expect(page.locator('main ul li').first()).toContainText('Great Is Thy Faithfulness');

    const servicesLink = page.getByRole('link', { name: 'Services' });
    await tabUntilFocused(page, servicesLink, 40);
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'Services' })).toBeFocused();

    const reopenPlanLink = page.getByRole('link', { name: 'Open plan' });
    await tabUntilFocused(page, reopenPlanLink);
    await page.keyboard.press('Enter');

    const printLink = page.getByRole('link', { name: 'Print' });
    await tabUntilFocused(page, printLink);
    await page.keyboard.press('Enter');

    const printHeading = page.getByRole('heading', { name: 'Service Plan' });
    await expect(printHeading).toBeFocused();
    await runCriticalAxeAudit(page);

    const exportButton = page.getByRole('button', { name: 'Export PDF' });
    await tabUntilFocused(page, exportButton);
    await page.keyboard.press('Enter');

    await expect(page.getByText('Living Hope')).toBeVisible();
    await page.waitForFunction(() => window['__printed'] === true);
  });
});
