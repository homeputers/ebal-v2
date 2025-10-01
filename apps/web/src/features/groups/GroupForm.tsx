import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId } from '@/lib/formAccessibility';

const schema = z.object({
  name: z.string().min(2, 'validation.nameMin'),
});

export type GroupFormValues = z.infer<typeof schema>;

type GroupFormProps = {
  defaultValues?: GroupFormValues;
  onSubmit: (values: GroupFormValues) => void;
  onCancel?: () => void;
  autoFocusFirstField?: boolean;
};

export function GroupForm({
  defaultValues,
  onSubmit,
  onCancel,
  autoFocusFirstField = false,
}: GroupFormProps) {
  const { t } = useTranslation('groups');
  const { t: tCommon } = useTranslation('common');
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<GroupFormValues>({ resolver: zodResolver(schema), defaultValues });

  const showErrorSummary = submitCount > 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, createOnInvalidFocus(setFocus))}
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
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          {t('form.nameLabel')}
        </label>
        <input
          id="name"
          {...register('name')}
          data-autofocus={autoFocusFirstField ? 'true' : undefined}
          className="border p-2 rounded w-full"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name', { includeError: Boolean(errors.name) })}
        />
        {errors.name && (
          <p id={fieldErrorId('name')} className="text-red-500 text-sm">
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

export default GroupForm;

