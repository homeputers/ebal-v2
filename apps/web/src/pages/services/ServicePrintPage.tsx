import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useService, usePlanItems } from '../../features/services/hooks';
import { usePlanArrangementInfo } from '@/features/services/usePlanArrangementInfo';
import { formatArrangementLine, formatKeyTransform } from '@/lib/arrangement-labels';
import { computeKeys } from '@/lib/keys';

export default function ServicePrintPage() {
  const { id } = useParams();
  const { t } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const { t: tArrangements } = useTranslation('arrangements');
  const { data: service } = useService(id);
  const { data: plan } = usePlanItems(id);
  const { data: arrangementLabels } = usePlanArrangementInfo(plan);
  const arrangementLabelMap = arrangementLabels ?? {};

  const formatType = (type?: string | null) => {
    if (!type) return t('plan.itemTypes.itemFallback');
    return t(`plan.itemTypes.${type}`, {
      defaultValue: type.charAt(0).toUpperCase() + type.slice(1),
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-4 print:p-0">
      <div className="mb-4 flex justify-between print:block">
        <h1 className="text-xl font-semibold">
          {service?.startsAt
            ? new Date(service.startsAt).toLocaleString()
            : t('fallback.title')}
          {service?.location ? ` - ${service.location}` : ''}
        </h1>
        <button
          onClick={handlePrint}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded print:hidden"
        >
          {tCommon('actions.print')}
        </button>
      </div>
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

              line = formatArrangementLine({
                songTitle: label?.songTitle ?? fallbackTitle,
                key: keyInfo?.originalKey ?? label?.key ?? null,
                bpm: label?.bpm ?? null,
                meter: label?.meter ?? null,
              });
              keySummary = formatKeyTransform({
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
    </div>
  );
}
