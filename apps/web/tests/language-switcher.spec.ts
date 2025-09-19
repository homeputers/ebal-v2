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

test.describe('language switcher smoke', () => {
  test('switches navigation language and persists after reload', async ({ page }) => {
    await page.goto('/en/services');

    for (const label of EN_NAV_LABELS) {
      await expect(
        page.getByRole('link', { name: label, exact: true }),
      ).toBeVisible();
    }

    await page.getByRole('button', { name: LANGUAGE_BUTTON_NAME }).click();
    await page.getByRole('option', { name: 'Español' }).click();

    await expect(page).toHaveURL(/\/es\/services$/);

    for (const label of ES_NAV_LABELS) {
      await expect(
        page.getByRole('link', { name: label, exact: true }),
      ).toBeVisible();
    }

    await expect(
      page.getByRole('button', { name: LANGUAGE_BUTTON_NAME }),
    ).toContainText('Español');

    await page.reload();

    await expect(page).toHaveURL(/\/es\/services$/);

    for (const label of ES_NAV_LABELS) {
      await expect(
        page.getByRole('link', { name: label, exact: true }),
      ).toBeVisible();
    }

    await expect(
      page.getByRole('button', { name: LANGUAGE_BUTTON_NAME }),
    ).toContainText('Español');
  });
});
