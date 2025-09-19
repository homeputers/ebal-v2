import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import type { components } from '../../api/types';

const schema = z.object({
  startsAt: z.string(),
  location: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof schema>;

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
  } = useForm<ServiceFormValues>({ resolver: zodResolver(schema), defaultValues });

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
          <p className="text-red-500 text-sm">
            {t(errors.startsAt.message ?? '', {
              defaultValue: errors.startsAt.message ?? '',
            })}
          </p>
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
          <p className="text-red-500 text-sm">
            {t(errors.location.message ?? '', {
              defaultValue: errors.location.message ?? '',
            })}
          </p>
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
