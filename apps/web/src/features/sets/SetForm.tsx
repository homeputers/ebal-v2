import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(2, 'validation.nameMin'),
});

export type SetFormValues = z.infer<typeof schema>;

type SetFormProps = {
  defaultValues?: Partial<SetFormValues>;
  onSubmit: (values: SetFormValues) => void;
  onCancel?: () => void;
};

export function SetForm({ defaultValues, onSubmit, onCancel }: SetFormProps) {
  const { t } = useTranslation('songSets');
  const { t: tCommon } = useTranslation('common');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          {t('form.nameLabel')}
        </label>
        <input id="name" {...register('name')} className="border p-2 rounded w-full" />
        {errors.name && (
          <p className="text-red-500 text-sm">
            {t(errors.name.message ?? '', {
              defaultValue: errors.name.message ?? '',
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

export default SetForm;
