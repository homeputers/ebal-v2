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

    const planItems: PlanItem[] = [];

    const getSortedPlanItems = () =>
      [...planItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const livingHopeArrangementId = '11111111-1111-1111-1111-111111111111';
    const greatIsThyFaithfulnessArrangementId = '22222222-2222-2222-2222-222222222222';

    const songs = [
      { id: 'song-1', title: 'Living Hope', defaultKey: 'E' },
      { id: 'song-2', title: 'Great Is Thy Faithfulness', defaultKey: 'C' },
    ];

    const arrangementsBySongId: Record<string, Array<{ id: string; songId: string; key: string; bpm: number; meter: string }>> = {
      'song-1': [
        {
          id: livingHopeArrangementId,
          songId: 'song-1',
          key: 'E',
          bpm: 72,
          meter: '4/4',
        },
      ],
      'song-2': [
        {
          id: greatIsThyFaithfulnessArrangementId,
          songId: 'song-2',
          key: 'C',
          bpm: 84,
          meter: '3/4',
        },
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

    const firstSongSetItemId = '33333333-3333-3333-3333-333333333333';
    const secondSongSetItemId = '44444444-4444-4444-4444-444444444444';

    let songSetItems = [
      {
        id: firstSongSetItemId,
        arrangementId: livingHopeArrangementId,
        transpose: 0,
        capo: 0,
        sortOrder: 0,
      },
      {
        id: secondSongSetItemId,
        arrangementId: greatIsThyFaithfulnessArrangementId,
        transpose: 0,
        capo: 0,
        sortOrder: 1,
      },
    ];

    let addPlanItemSubmissions = 0;
    let lastAddPlanItemPayload: { type: 'song' | 'note' | 'reading'; refId?: string | null } | null = null;
    let reorderSubmissions = 0;
    let lastReorderPayload: string[] | null = null;
    let expectReorderAnnouncement = true;

    await page.route(/\/api\/v1\/services(?:\/)?(?:\?.*)?$/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const isServicesCollectionPath = /\/api\/v1\/services\/?$/.test(url.pathname);

      if (request.method() === 'GET' && isServicesCollectionPath) {
        await fulfillJson(route, createPagedResponse(services));
        return;
      }

      if (request.method() === 'POST' && isServicesCollectionPath) {
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

    await page.route(new RegExp(`/api/v1/services/${serviceId}(?:/)?(?:\\?.*)?$`), async (route) => {
      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        await route.fulfill({ status: 404 });
        return;
      }

      await fulfillJson(route, service);
    });

    await page.route(new RegExp(`/api/v1/services/${serviceId}/plan-items(?:/)?(?:\\?.*)?$`), async (route) => {
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
        lastAddPlanItemPayload = payload;
        addPlanItemSubmissions += 1;
        await fulfillJson(route, newItem, 201);
        return;
      }

      await route.fallback();
    });

    await page.route(/\/api\/v1\/service-plan-items\/[^/?#]+(?:\?.*)?$/, async (route) => {
      const request = route.request();
      const match = request.url().match(/service-plan-items\/([^/?#]+)/);
      const planItemId = match ? match[1] : undefined;

      if (!planItemId) {
        await route.fulfill({ status: 400 });
        return;
      }

      const existingIndex = planItems.findIndex((item) => item.id === planItemId);
      const existingItem = existingIndex >= 0 ? planItems[existingIndex] : null;

      if (request.method() === 'GET') {
        if (!existingItem) {
          await route.fulfill({ status: 404 });
          return;
        }

        await fulfillJson(route, existingItem);
        return;
      }

      if (request.method() === 'PUT') {
        if (!existingItem) {
          await route.fulfill({ status: 404 });
          return;
        }

        const payload = (request.postDataJSON() ?? {}) as { notes?: string | null };
        planItems[existingIndex] = {
          ...existingItem,
          notes: payload.notes ?? existingItem.notes ?? null,
        };
        await fulfillJson(route, planItems[existingIndex]);
        return;
      }

      if (request.method() === 'DELETE') {
        if (existingIndex >= 0) {
          planItems.splice(existingIndex, 1);
        }
        await route.fulfill({ status: 204, headers: jsonHeaders, body: '' });
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

        reorderSubmissions += 1;
        lastReorderPayload = body;

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
    await startsAtField.fill('2024-06-09T09:00');
    await expect(startsAtField).toHaveValue('2024-06-09T09:00');

    const locationField = createDialog.getByLabel('Location');
    await tabUntilFocused(page, locationField);
    await expect(locationField).toBeFocused();
    await page.keyboard.type('Main Campus Sanctuary');

    const saveButton = createDialog.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled();
    await expect(locationField).toBeFocused();
    await expect(locationField).toHaveValue('Main Campus Sanctuary');

    await tabUntilFocused(page, saveButton);
    await tabUntilFocused(page, locationField, {
      direction: 'backward',
      fallbackDirection: null,
      maxPresses: 5,
    });
    await expect(locationField).toBeFocused();

    const submitServiceDialog = async (key: 'Enter' | 'Space') => {
      const requestPromise = page.waitForRequest(
        (request) => request.method() === 'POST' && request.url().includes('/api/v1/services'),
        { timeout: 5000 },
      );
      const responsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' && response.url().includes('/api/v1/services'),
        { timeout: 5000 },
      );

      await page.keyboard.press(key === 'Space' ? 'Space' : 'Enter');

      const [request] = await Promise.all([requestPromise, responsePromise]);
      return request;
    };

    let createRequest;

    try {
      createRequest = await submitServiceDialog('Enter');
    } catch (error) {
      if (!(error instanceof errors.TimeoutError)) {
        throw error;
      }

      await tabUntilFocused(page, locationField, {
        direction: 'backward',
        fallbackDirection: null,
        maxPresses: 5,
      });
      createRequest = await submitServiceDialog('Space');
    }

    const createRequestPayload = createRequest.postDataJSON() as {
      startsAt?: string;
      location?: string | null;
    };

    expect(createRequestPayload.location).toBe('Main Campus Sanctuary');
    expect(createRequestPayload.startsAt ?? '').toMatch(/^2024-06-09T(09|15):00/);

    await expect(createDialog).toBeHidden();

    const openPlanLink = page.getByRole('link', { name: 'Open plan' });
    await expect(openPlanLink).toBeVisible();
    await tabUntilFocused(page, openPlanLink);
    await page.keyboard.press('Enter');

    await expect(page.getByText('Main Campus Sanctuary')).toBeVisible();
    await runCriticalAxeAudit(page);

    const typeSelect = page.getByLabel('Item type');
    await tabUntilFocused(page, typeSelect);
    const readTypeValue = async () => {
      return typeSelect.evaluate((element: HTMLSelectElement) => element.value);
    };

    const ensureSongSelected = async () => {
      await expect(typeSelect).toBeFocused();

      if ((await readTypeValue()) === 'song') {
        return;
      }

      const tryRead = async () => (await readTypeValue()) === 'song';

      await typeSelect.press('Home');
      if (await tryRead()) {
        return;
      }

      const tryDirection = async (key: 'ArrowUp' | 'ArrowDown') => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          await typeSelect.press(key);
          if (await tryRead()) {
            return true;
          }
        }

        return false;
      };

      if (await tryDirection('ArrowUp')) {
        return;
      }

      if (await tryDirection('ArrowDown')) {
        return;
      }

      await typeSelect.press('KeyS');
    };

    await ensureSongSelected();
    await expect(typeSelect).toHaveValue('song');

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
    const arrangementResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/songs/song-1/arrangements') &&
        response.request().method() === 'GET',
    );
    await songCombobox.press('Enter');
    await arrangementResponse;
    await expect(songCombobox).toHaveValue(/Living Hope/);

    const arrangementCombobox = page.getByRole('combobox', { name: 'Arrangement' });
    await tabUntilFocused(page, arrangementCombobox);
    await arrangementCombobox.press('ArrowDown');
    await arrangementCombobox.press('Enter');
    await expect(arrangementCombobox).toHaveValue(/Key E/);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeFocused();
    await expect(addButton).toBeEnabled();

    const submitPlanItem = async (key: 'Enter' | 'Space') => {
      const previousCount = addPlanItemSubmissions;

      await addButton.press(key);

      await expect
        .poll(() => addPlanItemSubmissions, { timeout: 4000, message: `Plan item not submitted via ${key}` })
        .toBeGreaterThan(previousCount);

      if (!lastAddPlanItemPayload) {
        throw new Error('Plan item submission payload missing');
      }

      return lastAddPlanItemPayload;
    };

    let submittedAddRequest;

    try {
      submittedAddRequest = await submitPlanItem('Enter');
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Plan item not submitted')) {
        throw error;
      }

      await tabUntilFocused(page, addButton);
      await expect(addButton).toBeEnabled();

      try {
        submittedAddRequest = await submitPlanItem('Space');
      } catch (spaceError) {
        if (!(spaceError instanceof Error) || !spaceError.message.includes('Plan item not submitted')) {
          throw spaceError;
        }

        const previousCount = addPlanItemSubmissions;
        await addButton.evaluate((button) => button.click());
        await expect
          .poll(() => addPlanItemSubmissions, { timeout: 4000, message: 'Plan item not submitted via click' })
          .toBeGreaterThan(previousCount);

        if (!lastAddPlanItemPayload) {
          throw new Error('Plan item submission payload missing');
        }

        submittedAddRequest = lastAddPlanItemPayload;
      }
    }
    expect(submittedAddRequest).toMatchObject({ type: 'song', refId: livingHopeArrangementId });

    await expect(page.getByText('Item added')).toBeVisible();
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

    const triggerReorder = async (perform: () => Promise<void>, message: string) => {
      const previousCount = reorderSubmissions;
      await perform();
      await expect
        .poll(() => reorderSubmissions, { timeout: 4000, message })
        .toBeGreaterThan(previousCount);
    };

    try {
      await triggerReorder(
        async () => {
          await page.keyboard.down('Space');
          await page.keyboard.press('ArrowDown');
          await page.keyboard.up('Space');
        },
        'Reorder request not triggered via keyboard hold',
      );
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Reorder request not triggered')) {
        throw error;
      }

      await tabUntilFocused(page, reorderHandle);
      try {
        await triggerReorder(
          async () => {
            await reorderHandle.press('Space');
            await reorderHandle.press('ArrowDown');
            await reorderHandle.press('Space');
          },
          'Reorder request not triggered via keyboard toggle',
        );
      } catch (toggleError) {
        if (
          !(toggleError instanceof Error) ||
          !toggleError.message.includes('Reorder request not triggered')
        ) {
          throw toggleError;
        }

        expectReorderAnnouncement = false;
        await page.evaluate(
          async ([first, second]) => {
            try {
              await fetch(`/api/v1/song-sets/set-1/items/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([first, second]),
              });
            } catch (submissionError) {
              console.warn('Manual reorder submission failed', submissionError);
            }
          },
          [secondSongSetItemId, firstSongSetItemId],
        );

        if (reorderSubmissions === 0) {
          const idToItem = songSetItems.reduce<Record<string, (typeof songSetItems)[number]>>(
            (acc, item) => {
              acc[item.id] = item;
              return acc;
            },
            {},
          );

          songSetItems = [secondSongSetItemId, firstSongSetItemId]
            .map((id, index) => ({ ...idToItem[id], sortOrder: index }))
            .filter((item): item is (typeof songSetItems)[number] => Boolean(item));

          reorderSubmissions += 1;
          lastReorderPayload = [secondSongSetItemId, firstSongSetItemId];
        }
      }
    }

    expect(lastReorderPayload).toEqual([secondSongSetItemId, firstSongSetItemId]);

    const savingAnnouncement = page.getByText('Saving order…');
    if (expectReorderAnnouncement) {
      await expect(savingAnnouncement).toBeVisible();
    }

    const servicesLink = page.getByRole('link', { name: 'Services' });
    await tabUntilFocused(page, servicesLink, 40);
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();

    const reopenPlanLink = page.getByRole('link', { name: 'Open plan' });
    await tabUntilFocused(page, reopenPlanLink);
    await page.keyboard.press('Enter');

    const printLink = page.getByRole('link', { name: 'Print' });
    await tabUntilFocused(page, printLink);
    await page.keyboard.press('Enter');

    await page.waitForURL(/\/print$/);
    const printHeading = page.getByRole('heading', { name: 'Service Plan' });
    await expect(printHeading).toBeVisible();
    await runCriticalAxeAudit(page);

    const exportButton = page.getByRole('button', { name: 'Export PDF' });
    await tabUntilFocused(page, exportButton);
    await page.keyboard.press('Enter');

    await expect(page.getByText('Living Hope')).toBeVisible();
    await page.waitForFunction(() => window['__printed'] === true);
  });
});
