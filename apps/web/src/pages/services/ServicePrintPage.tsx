import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/layout/PageHeading';
import { useService, usePlanItems } from '../../features/services/hooks';
import { usePlanArrangementInfo } from '@/features/services/usePlanArrangementInfo';
import { formatArrangementLine, formatKeyTransform } from '@/lib/arrangement-labels';
import { computeKeys } from '@/lib/keys';
import { formatDate } from '@/i18n/intl';

export default function ServicePrintPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const { t: tArrangements } = useTranslation('arrangements');
  const { data: service } = useService(id);
  const { data: plan } = usePlanItems(id);
  const { data: arrangementLabels } = usePlanArrangementInfo(plan);
  const arrangementLabelMap = arrangementLabels ?? {};

  const location = service?.location?.trim();
  const formattedDate = service?.startsAt
    ? formatDate(service.startsAt, i18n.language)
    : null;
  const headerTitle = formattedDate
    ? location
      ? t('print.header.dateWithLocation', {
          date: formattedDate,
          location,
          defaultValue: `${formattedDate} — ${location}`,
        })
      : t('print.header.date', {
          date: formattedDate,
          defaultValue: formattedDate,
        })
    : t('fallback.title');

  const formatType = (type?: string | null) => {
    if (!type) return t('plan.itemTypes.itemFallback');
    return t(`plan.itemTypes.${type}`, {
      defaultValue: type.charAt(0).toUpperCase() + type.slice(1),
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-4 print:p-0">
      <div className="mb-4 flex flex-col gap-3 print:gap-2">
        <div className="flex items-start justify-between gap-4 print:block">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {t('print.title')}
            </p>
            <PageHeading autoFocus className="text-xl font-semibold">
              {headerTitle}
            </PageHeading>
          </div>
          <button
            onClick={handlePrint}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded print:hidden"
          >
            {tCommon('actions.print')}
          </button>
        </div>
      </div>
      <section aria-labelledby="service-print-plan">
        <h2
          id="service-print-plan"
          className="mb-3 text-lg font-semibold text-gray-900"
        >
          {t('print.sections.plan')}
        </h2>
        {plan && plan.length > 0 ? (
          <ol className="space-y-2 list-decimal list-inside">
            {plan.map((item) => {
              const isSong = item.type === 'song' && item.refId;
              let line: string | null = null;
              let keySummary: string | null = null;

              if (isSong && item.refId) {
                const label = arrangementLabelMap[item.refId];
                const fallbackTitle = tArrangements('labels.fallback', { id: item.refId });
                const extras = item as Record<string, unknown>;
                const transpose =
                  typeof extras['transpose'] === 'number' ? (extras['transpose'] as number) : 0;
                const capo = typeof extras['capo'] === 'number' ? (extras['capo'] as number) : 0;
                const keyInfo = label?.key
                  ? computeKeys(label.key, transpose, capo, false)
                  : undefined;

                line = formatArrangementLine(tArrangements, {
                  songTitle: label?.songTitle ?? fallbackTitle,
                  key: keyInfo?.originalKey ?? label?.key ?? null,
                  bpm: label?.bpm ?? null,
                  meter: label?.meter ?? null,
                });
                keySummary = formatKeyTransform(tArrangements, {
                  originalKey:
                    keyInfo?.originalKey ?? label?.key ?? tCommon('labels.notAvailable'),
                  soundingKey:
                    keyInfo?.soundingKey ?? label?.key ?? tCommon('labels.notAvailable'),
                  shapeKey: keyInfo?.shapeKey,
                  transpose,
                  capo,
                });
              }

              return (
                <li key={item.id}>
                  <div className="font-semibold">
                    {isSong && line ? line : formatType(item.type)}
                  </div>
                  {isSong && keySummary ? (
                    <div className="text-sm text-muted-foreground">{keySummary}</div>
                  ) : null}
                  {item.notes && (
                    <div className="text-sm whitespace-pre-line mt-1">{item.notes}</div>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <div>{t('plan.noItems')}</div>
        )}
      </section>
      <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-muted-foreground">
        <p>{t('print.footer.keySummaryNote')}</p>
        <p className="mt-1">{t('print.footer.generatedBy', { app: tCommon('app.title') })}</p>
      </footer>
    </div>
  );
}
