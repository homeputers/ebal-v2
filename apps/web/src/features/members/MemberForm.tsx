import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { withFieldErrorPrefix } from '../../lib/zodErrorMap';
import type { components } from '../../api/types';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value ?? undefined;
};

const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const optionalString = z.preprocess(emptyToUndefined, z.string().max(255).optional());
const optionalMonth = z.preprocess((value) => {
  const cleaned = emptyToUndefined(value);
  if (cleaned === undefined) return undefined;
  return Number(cleaned);
}, z.number().int().min(1).max(12).optional());
const optionalDay = z.preprocess((value) => {
  const cleaned = emptyToUndefined(value);
  if (cleaned === undefined) return undefined;
  return Number(cleaned);
}, z.number().int().min(1).max(31).optional());

const schema = z.object({
  displayName: z.string().min(2),
  instruments: z.string().optional(),
  email: optionalEmail,
  phoneNumber: optionalString,
  birthdayMonth: optionalMonth,
  birthdayDay: optionalDay,
});

export type MemberFormValues = z.infer<typeof schema>;

const baseResolver = zodResolver(schema);

const resolver: typeof baseResolver = async (values, context, options) =>
  withFieldErrorPrefix('members', () => baseResolver(values, context, options));

export function MemberForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: MemberFormValues;
  onSubmit: (values: components['schemas']['MemberRequest']) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver,
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit((vals) =>
        onSubmit({
          displayName: vals.displayName,
          instruments: vals.instruments
            ? vals.instruments.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          email: vals.email || undefined,
          phoneNumber: vals.phoneNumber || undefined,
          birthdayMonth: vals.birthdayMonth ?? undefined,
          birthdayDay: vals.birthdayDay ?? undefined,
        }),
      )}
      className="space-y-2"
    >
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          {t('form.displayName')}
        </label>
        <input
          id="displayName"
          {...register('displayName')}
          className="border p-2 rounded w-full"
        />
        {errors.displayName && (
          <p className="text-red-500 text-sm">{errors.displayName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="instruments" className="block text-sm font-medium mb-1">
          {t('form.instrumentsLabel')}
        </label>
        <input
          id="instruments"
          {...register('instruments')}
          className="border p-2 rounded w-full"
        />
        {errors.instruments && (
          <p className="text-red-500 text-sm">{errors.instruments.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t('form.email')}
        </label>
        <input id="email" type="email" {...register('email')} className="border p-2 rounded w-full" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
          {t('form.phoneNumber')}
        </label>
        <input
          id="phoneNumber"
          {...register('phoneNumber')}
          className="border p-2 rounded w-full"
        />
        {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label htmlFor="birthdayMonth" className="block text-sm font-medium mb-1">
            {t('form.birthdayMonth')}
          </label>
          <input
            id="birthdayMonth"
            type="number"
            min={1}
            max={12}
            {...register('birthdayMonth')}
            className="border p-2 rounded w-full"
          />
          {errors.birthdayMonth && (
            <p className="text-red-500 text-sm">{errors.birthdayMonth.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="birthdayDay" className="block text-sm font-medium mb-1">
            {t('form.birthdayDay')}
          </label>
          <input
            id="birthdayDay"
            type="number"
            min={1}
            max={31}
            {...register('birthdayDay')}
            className="border p-2 rounded w-full"
          />
          {errors.birthdayDay && (
            <p className="text-red-500 text-sm">{errors.birthdayDay.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          {tCommon('actions.save')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {tCommon('actions.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}

export default MemberForm;

