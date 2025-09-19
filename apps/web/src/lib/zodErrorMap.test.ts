import { describe, expect, it, beforeAll } from 'vitest';
import { z } from 'zod';
import i18n from '../i18n';
import zodErrorMap, { withFieldErrorPrefix } from './zodErrorMap';

describe('zodErrorMap', () => {
  const schema = z.object({
    displayName: z.string().min(3),
  });

  beforeAll(async () => {
    z.setErrorMap(zodErrorMap);
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('applies scoped translation keys when provided via context data', async () => {
    const result = await withFieldErrorPrefix('members', () =>
      schema.safeParse({ displayName: '' }),
    );

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected parsing to fail');
    }

    const { issues } = result.error;

    expect(issues).toHaveLength(1);
    expect(issues[0].path).toEqual(['displayName']);
    expect(issues[0].message).toBe(
      i18n.t('validation:members.displayName.min', { minimum: 3, lng: 'en' }),
    );
  });

  it('switches translated error messages when the language changes', async () => {
    const englishResult = await withFieldErrorPrefix('members', () =>
      schema.safeParse({ displayName: '' }),
    );

    expect(englishResult.success).toBe(false);

    if (englishResult.success) {
      throw new Error('Expected parsing to fail');
    }

    const englishMessage = englishResult.error.issues[0]?.message;
    const expectedEnglish = i18n.t('validation:members.displayName.min', {
      minimum: 3,
      lng: 'en',
    });

    expect(englishMessage).toBe(expectedEnglish);

    await i18n.changeLanguage('es');

    const spanishResult = await withFieldErrorPrefix('members', () =>
      schema.safeParse({ displayName: '' }),
    );

    expect(spanishResult.success).toBe(false);

    if (spanishResult.success) {
      throw new Error('Expected parsing to fail');
    }

    const spanishMessage = spanishResult.error.issues[0]?.message;
    const expectedSpanish = i18n.t('validation:members.displayName.min', {
      minimum: 3,
      lng: 'es',
    });

    expect(spanishMessage).toBe(expectedSpanish);
  });
});
