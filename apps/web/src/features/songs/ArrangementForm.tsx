import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import type { components } from '../../api/types';
import { ChordProView } from '../../components/chordpro/ChordProView';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { createOnInvalidFocus, describedBy, fieldErrorId } from '@/lib/formAccessibility';

const schema = z.object({
  key: z.string().min(1, 'validation.keyRequired'),
  bpm: z
    .number({ invalid_type_error: 'validation.bpmNumber' })
    .min(30)
    .max(300)
    .optional(),
  meter: z.string().optional(),
  lyricsChordpro: z.string().min(1, 'validation.lyricsRequired'),
});

export type ArrangementFormValues = z.infer<typeof schema>;

type ArrangementFormProps = {
  defaultValues?: ArrangementFormValues;
  onSubmit: (values: components['schemas']['ArrangementRequest']) => void;
  onCancel?: () => void;
  autoFocusFirstField?: boolean;
};

export function ArrangementForm({
  defaultValues,
  onSubmit,
  onCancel,
  autoFocusFirstField = false,
}: ArrangementFormProps) {
  const { t } = useTranslation('arrangements');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<ArrangementFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [transpose, setTranspose] = useState(0);
  const [useFlats, setUseFlats] = useState(false);
  const [layout, setLayout] = useState<'inline' | 'above'>('above');

  const lyrics = watch('lyricsChordpro') || '';
  const normalizedLyrics = lyrics.replace(/\r\n?/g, '\n');

  const showErrorSummary = submitCount > 0;

  return (
    <form
      onSubmit={handleSubmit(
        (vals) =>
          onSubmit({
            key: vals.key,
            bpm: vals.bpm,
            meter: vals.meter,
            lyricsChordpro: vals.lyricsChordpro,
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
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div>
            <label htmlFor="key" className="block text-sm font-medium mb-1">
              {t('form.keyLabel')}
            </label>
            <input
              id="key"
              {...register('key')}
              data-autofocus={autoFocusFirstField ? 'true' : undefined}
              className="border p-2 rounded w-full"
              aria-invalid={Boolean(errors.key)}
              aria-describedby={describedBy('key', { includeError: Boolean(errors.key) })}
            />
            {errors.key && (
              <p id={fieldErrorId('key')} className="text-red-500 text-sm">
                {t(errors.key.message ?? '', {
                  defaultValue: errors.key.message ?? '',
                })}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="bpm" className="block text-sm font-medium mb-1">
              {t('form.bpmLabel')}
            </label>
            <input
              id="bpm"
              type="number"
              {...register('bpm', { valueAsNumber: true })}
              className="border p-2 rounded w-full"
              aria-invalid={Boolean(errors.bpm)}
              aria-describedby={describedBy('bpm', { includeError: Boolean(errors.bpm) })}
            />
            {errors.bpm && (
              <p id={fieldErrorId('bpm')} className="text-red-500 text-sm">
                {t(errors.bpm.message ?? '', {
                  defaultValue: errors.bpm.message ?? '',
                })}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="meter" className="block text-sm font-medium mb-1">
              {t('form.meterLabel')}
            </label>
            <input
              id="meter"
              {...register('meter')}
              className="border p-2 rounded w-full"
              aria-invalid={Boolean(errors.meter)}
              aria-describedby={describedBy('meter', { includeError: Boolean(errors.meter) })}
            />
            {errors.meter && (
              <p id={fieldErrorId('meter')} className="text-red-500 text-sm">
                {t(errors.meter.message ?? '', {
                  defaultValue: errors.meter.message ?? '',
                })}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="lyricsChordpro" className="block text-sm font-medium mb-1">
              {t('form.chordProLabel')}
            </label>
            <textarea
              id="lyricsChordpro"
              {...register('lyricsChordpro')}
              className="border p-2 rounded w-full h-48 font-mono"
              aria-invalid={Boolean(errors.lyricsChordpro)}
              aria-describedby={describedBy('lyricsChordpro', {
                includeError: Boolean(errors.lyricsChordpro),
              })}
            />
            {errors.lyricsChordpro && (
              <p id={fieldErrorId('lyricsChordpro')} className="text-red-500 text-sm">
                {t(errors.lyricsChordpro.message ?? '', {
                  defaultValue: errors.lyricsChordpro.message ?? '',
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
        </div>
        <div className="flex-1 flex flex-col">
          <div className="mb-2 flex gap-2 items-center">
            <button
              type="button"
              className="px-2 py-1 border rounded"
              onClick={() => setTranspose((t) => t + 1)}
            >
              {t('controls.transposeUp')}
            </button>
            <button
              type="button"
              className="px-2 py-1 border rounded"
              onClick={() => setTranspose((t) => t - 1)}
            >
              {t('controls.transposeDown')}
            </button>
            <button
              type="button"
              className="px-2 py-1 border rounded"
              onClick={() => setUseFlats((f) => !f)}
            >
              {useFlats ? t('controls.useSharps') : t('controls.useFlats')}
            </button>
            <div className="text-sm">
              <label className="mr-2" htmlFor="layout">
                {t('controls.layout')}
              </label>
              <select
                id="layout"
                value={layout}
                onChange={(event) =>
                  setLayout(event.target.value === 'above' ? 'above' : 'inline')
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="above">{t('controls.layoutAbove')}</option>
                <option value="inline">{t('controls.layoutInline')}</option>
              </select>
            </div>
          </div>
          <ChordProView
            source={normalizedLyrics}
            transpose={transpose}
            useFlats={useFlats}
            layout={layout}
            className="flex-1 overflow-auto p-3 border rounded font-mono text-sm max-h-96"
          />
        </div>
      </div>
    </form>
  );
}

export default ArrangementForm;
