import { describe, expect, it, beforeAll } from 'vitest';
import { z } from 'zod';
import i18n from '../i18n';
import zodErrorMap, { withFieldErrorPrefix } from './zodErrorMap';

describe('zodErrorMap', () => {
  beforeAll(() => {
    z.setErrorMap(zodErrorMap);
  });

  it('applies scoped translation keys when provided via context data', async () => {
    const schema = z.object({
      displayName: z.string().min(3),
    });

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
      i18n.t('validation:members.displayName.min', { minimum: 3 }),
    );
  });
});
