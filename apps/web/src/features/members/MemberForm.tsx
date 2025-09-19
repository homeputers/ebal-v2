import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { withFieldErrorPrefix } from '../../lib/zodErrorMap';
import type { components } from '../../api/types';

const schema = z.object({
  displayName: z.string().min(2),
  instruments: z.string().optional(),
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

