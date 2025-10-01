import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { withFieldErrorPrefix } from '../../lib/zodErrorMap';
import type { components } from '../../api/types';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId } from '@/lib/formAccessibility';

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

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

  const monthOptions = MONTH_KEYS.map((key, index) => ({
    value: String(index + 1),
    label: t(`form.months.${key}`),
  }));

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<MemberFormValues>({
    resolver,
    defaultValues,
  });

  const showErrorSummary = submitCount > 0;

  return (
    <form
      onSubmit={handleSubmit(
        (vals) =>
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
        createOnInvalidFocus(setFocus),
      )}
      className="space-y-2"
      noValidate
    >
      {showErrorSummary ? (
        <FormErrorSummary
          errors={errors}
          title={tCommon('forms.errorSummary.title')}
          description={tCommon('forms.errorSummary.description')}
        />
      ) : null}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          {t('form.displayName')}
        </label>
        <input
          id="displayName"
          {...register('displayName')}
          className="border p-2 rounded w-full"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={describedBy('displayName', {
            includeError: Boolean(errors.displayName),
          })}
        />
        {errors.displayName && (
          <p id={fieldErrorId('displayName')} className="text-red-500 text-sm">
            {errors.displayName.message}
          </p>
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
          aria-invalid={Boolean(errors.instruments)}
          aria-describedby={describedBy('instruments', {
            includeError: Boolean(errors.instruments),
          })}
        />
        {errors.instruments && (
          <p id={fieldErrorId('instruments')} className="text-red-500 text-sm">
            {errors.instruments.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t('form.email')}
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="border p-2 rounded w-full"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email', {
            includeError: Boolean(errors.email),
          })}
        />
        {errors.email && (
          <p id={fieldErrorId('email')} className="text-red-500 text-sm">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
          {t('form.phoneNumber')}
        </label>
        <input
          id="phoneNumber"
          {...register('phoneNumber')}
          className="border p-2 rounded w-full"
          aria-invalid={Boolean(errors.phoneNumber)}
          aria-describedby={describedBy('phoneNumber', {
            includeError: Boolean(errors.phoneNumber),
          })}
        />
        {errors.phoneNumber && (
          <p id={fieldErrorId('phoneNumber')} className="text-red-500 text-sm">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label htmlFor="birthdayMonth" className="block text-sm font-medium mb-1">
            {t('form.birthdayMonth')}
          </label>
          <select
            id="birthdayMonth"
            {...register('birthdayMonth')}
            className="border p-2 rounded w-full"
            defaultValue={defaultValues?.birthdayMonth
              ? String(defaultValues.birthdayMonth)
              : ''}
            aria-invalid={Boolean(errors.birthdayMonth)}
            aria-describedby={describedBy('birthdayMonth', {
              includeError: Boolean(errors.birthdayMonth),
            })}
          >
            <option value="">{t('form.birthdayMonthPlaceholder')}</option>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.birthdayMonth && (
            <p id={fieldErrorId('birthdayMonth')} className="text-red-500 text-sm">
              {errors.birthdayMonth.message}
            </p>
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
            aria-invalid={Boolean(errors.birthdayDay)}
            aria-describedby={describedBy('birthdayDay', {
              includeError: Boolean(errors.birthdayDay),
            })}
          />
          {errors.birthdayDay && (
            <p id={fieldErrorId('birthdayDay')} className="text-red-500 text-sm">
              {errors.birthdayDay.message}
            </p>
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

