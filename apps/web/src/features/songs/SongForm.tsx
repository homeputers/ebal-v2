import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import type { components } from '../../api/types';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import {
  createOnInvalidFocus,
  describedBy,
  fieldErrorId,
  fieldHelpTextId,
} from '@/lib/formAccessibility';

const schema = z.object({
  title: z.string().min(2, 'validation.titleMin'),
  ccli: z.string().optional(),
  author: z.string().optional(),
  defaultKey: z.string().optional(),
  tags: z.string().optional(),
});

export type SongFormValues = z.infer<typeof schema>;

type FieldName = keyof SongFormValues;

export function SongForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: SongFormValues;
  onSubmit: (values: components['schemas']['SongRequest']) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation('songs');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<SongFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const showErrorSummary = submitCount > 0;

  const getFieldCopy = (field: FieldName) => {
    const label = t(`form.fields.${field}.label`);

    return {
      label,
      placeholder: t(`form.fields.${field}.placeholder`, { defaultValue: label }),
      helpText: t(`form.fields.${field}.helpText`, { defaultValue: '' }),
      ariaLabel: t(`form.fields.${field}.ariaLabel`, { defaultValue: label }),
    };
  };

  const titleField = getFieldCopy('title');
  const ccliField = getFieldCopy('ccli');
  const authorField = getFieldCopy('author');
  const defaultKeyField = getFieldCopy('defaultKey');
  const tagsField = getFieldCopy('tags');

  return (
    <form
      onSubmit={handleSubmit(
        (vals) =>
          onSubmit({
            title: vals.title,
            ccli: vals.ccli || undefined,
            author: vals.author || undefined,
            defaultKey: vals.defaultKey || undefined,
            tags: vals.tags
              ? vals.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [],
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
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          {titleField.label}
        </label>
        <input
          id="title"
          aria-label={titleField.ariaLabel}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describedBy('title', {
            includeError: Boolean(errors.title),
            extraIds: [titleField.helpText ? fieldHelpTextId('title') : undefined],
          })}
          placeholder={titleField.placeholder}
          {...register('title')}
          className="border p-2 rounded w-full"
        />
        {titleField.helpText ? (
          <p id={fieldHelpTextId('title')} className="text-sm text-gray-500">
            {titleField.helpText}
          </p>
        ) : null}
        {errors.title ? (
          <p id={fieldErrorId('title')} className="text-red-500 text-sm">
            {t(errors.title.message ?? '', {
              defaultValue: errors.title.message ?? '',
            })}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="ccli" className="block text-sm font-medium mb-1">
          {ccliField.label}
        </label>
        <input
          id="ccli"
          aria-label={ccliField.ariaLabel}
          aria-invalid={Boolean(errors.ccli)}
          aria-describedby={describedBy('ccli', {
            includeError: Boolean(errors.ccli),
            extraIds: [ccliField.helpText ? fieldHelpTextId('ccli') : undefined],
          })}
          placeholder={ccliField.placeholder}
          {...register('ccli')}
          className="border p-2 rounded w-full"
        />
        {ccliField.helpText ? (
          <p id={fieldHelpTextId('ccli')} className="text-sm text-gray-500">
            {ccliField.helpText}
          </p>
        ) : null}
        {errors.ccli ? (
          <p id={fieldErrorId('ccli')} className="text-red-500 text-sm">
            {t(errors.ccli.message ?? '', {
              defaultValue: errors.ccli.message ?? '',
            })}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-1">
          {authorField.label}
        </label>
        <input
          id="author"
          aria-label={authorField.ariaLabel}
          aria-invalid={Boolean(errors.author)}
          aria-describedby={describedBy('author', {
            includeError: Boolean(errors.author),
            extraIds: [authorField.helpText ? fieldHelpTextId('author') : undefined],
          })}
          placeholder={authorField.placeholder}
          {...register('author')}
          className="border p-2 rounded w-full"
        />
        {authorField.helpText ? (
          <p id={fieldHelpTextId('author')} className="text-sm text-gray-500">
            {authorField.helpText}
          </p>
        ) : null}
        {errors.author ? (
          <p id={fieldErrorId('author')} className="text-red-500 text-sm">
            {t(errors.author.message ?? '', {
              defaultValue: errors.author.message ?? '',
            })}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="defaultKey" className="block text-sm font-medium mb-1">
          {defaultKeyField.label}
        </label>
        <input
          id="defaultKey"
          aria-label={defaultKeyField.ariaLabel}
          aria-invalid={Boolean(errors.defaultKey)}
          aria-describedby={describedBy('defaultKey', {
            includeError: Boolean(errors.defaultKey),
            extraIds: [
              defaultKeyField.helpText ? fieldHelpTextId('defaultKey') : undefined,
            ],
          })}
          placeholder={defaultKeyField.placeholder}
          {...register('defaultKey')}
          className="border p-2 rounded w-full"
        />
        {defaultKeyField.helpText ? (
          <p id={fieldHelpTextId('defaultKey')} className="text-sm text-gray-500">
            {defaultKeyField.helpText}
          </p>
        ) : null}
        {errors.defaultKey ? (
          <p id={fieldErrorId('defaultKey')} className="text-red-500 text-sm">
            {t(errors.defaultKey.message ?? '', {
              defaultValue: errors.defaultKey.message ?? '',
            })}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          {tagsField.label}
        </label>
        <input
          id="tags"
          aria-label={tagsField.ariaLabel}
          aria-invalid={Boolean(errors.tags)}
          aria-describedby={describedBy('tags', {
            includeError: Boolean(errors.tags),
            extraIds: [tagsField.helpText ? fieldHelpTextId('tags') : undefined],
          })}
          placeholder={tagsField.placeholder}
          {...register('tags')}
          className="border p-2 rounded w-full"
        />
        {tagsField.helpText ? (
          <p id={fieldHelpTextId('tags')} className="text-sm text-gray-500">
            {tagsField.helpText}
          </p>
        ) : null}
        {errors.tags ? (
          <p id={fieldErrorId('tags')} className="text-red-500 text-sm">
            {t(errors.tags.message ?? '', {
              defaultValue: errors.tags.message ?? '',
            })}
          </p>
        ) : null}
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

export default SongForm;
