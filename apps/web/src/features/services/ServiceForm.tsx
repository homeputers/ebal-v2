import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { withFieldErrorPrefix } from '../../lib/zodErrorMap';
import type { components } from '../../api/types';

const schema = z.object({
  startsAt: z.string().min(1),
  location: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof schema>;

const baseResolver = zodResolver(schema);

const resolver: typeof baseResolver = async (values, context, options) =>
  withFieldErrorPrefix('services', () => baseResolver(values, context, options));

export function ServiceForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: ServiceFormValues;
  onSubmit: (values: components['schemas']['ServiceRequest']) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({ resolver, defaultValues });

  return (
    <form
      onSubmit={handleSubmit((vals) =>
        onSubmit({ startsAt: new Date(vals.startsAt).toISOString(), location: vals.location }),
      )}
      className="space-y-2"
    >
      <div>
        <label htmlFor="startsAt" className="block text-sm font-medium mb-1">
          {t('form.startsAtLabel')}
        </label>
        <input
          id="startsAt"
          type="datetime-local"
          {...register('startsAt')}
          className="border p-2 rounded w-full"
        />
        {errors.startsAt && (
          <p className="text-red-500 text-sm">{errors.startsAt.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          {t('form.locationLabel')}
        </label>
        <input
          id="location"
          {...register('location')}
          className="border p-2 rounded w-full"
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location.message}</p>
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

export default ServiceForm;
