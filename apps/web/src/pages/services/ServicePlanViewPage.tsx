import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePlanItems, useService } from '@/features/services/hooks';
import { usePlanArrangementInfo } from '@/features/services/usePlanArrangementInfo';
import { formatArrangementLine, formatKeyTransform } from '@/lib/arrangement-labels';
import { computeKeys } from '@/lib/keys';

function formatType(type?: string | null) {
  if (!type) return 'Item';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function ServicePlanViewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('share');

  const {
    data: service,
    isLoading: serviceLoading,
    isError: serviceError,
  } = useService(id);
  const {
    data: planItems,
    isLoading: planLoading,
    isError: planError,
  } = usePlanItems(id);
  const { data: arrangementLabels } = usePlanArrangementInfo(planItems);

  const arrangementLabelMap = arrangementLabels ?? {};

  const plan = useMemo(() => planItems ?? [], [planItems]);

  if (!shareToken) {
    return (
      <div className="plan-view px-4 py-10">
        <div className="mx-auto max-w-3xl rounded border border-dashed border-red-200 bg-red-50 p-6 text-center text-red-700">
          <h1 className="text-lg font-semibold">Share token required</h1>
          <p className="mt-2 text-sm">
            A valid share link is required to view this service plan. Please check your link and try
            again.
          </p>
        </div>
      </div>
    );
  }

  if (serviceLoading || planLoading) {
    return (
      <div className="plan-view px-4 py-10">
        <div className="mx-auto max-w-3xl text-center text-muted-foreground">Loading plan…</div>
      </div>
    );
  }

  if (serviceError || planError || !service) {
    return (
      <div className="plan-view px-4 py-10">
        <div className="mx-auto max-w-3xl rounded border border-red-100 bg-red-50 p-6 text-center text-red-700">
          <h1 className="text-lg font-semibold">Plan unavailable</h1>
          <p className="mt-2 text-sm">
            We were unable to load this service plan. Please try again later or contact the organizer.
          </p>
        </div>
      </div>
    );
  }

  const handleExport = () => window.print();

  return (
    <div className="plan-view px-4 py-6 sm:py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-4 print:border-0 print:pb-0">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Service Plan</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              {service.startsAt ? new Date(service.startsAt).toLocaleString() : 'Service'}
            </h1>
            {service.location ? (
              <p className="mt-1 text-base text-gray-600">{service.location}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="rounded bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
              Share Token: <span className="font-semibold text-gray-800">{shareToken}</span>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="rounded border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              Export PDF
            </button>
          </div>
        </header>

        {plan.length > 0 ? (
          <ol className="space-y-6">
            {plan.map((item, index) => {
              const isSong = item.type === 'song' && item.refId;
              let line: string | null = null;
              let keySummary: string | null = null;

              if (isSong && item.refId) {
                const label = arrangementLabelMap[item.refId];
                const fallbackTitle = `Arrangement ${item.refId}`;
                const extras = item as Record<string, unknown>;
                const transpose =
                  typeof extras['transpose'] === 'number' ? (extras['transpose'] as number) : 0;
                const capo = typeof extras['capo'] === 'number' ? (extras['capo'] as number) : 0;
                const keyInfo = label?.key ? computeKeys(label.key, transpose, capo, false) : undefined;

                line = formatArrangementLine({
                  songTitle: label?.songTitle ?? fallbackTitle,
                  key: keyInfo?.originalKey ?? label?.key ?? null,
                  bpm: label?.bpm ?? null,
                  meter: label?.meter ?? null,
                });
                keySummary = formatKeyTransform({
                  originalKey: keyInfo?.originalKey ?? label?.key ?? 'N/A',
                  soundingKey: keyInfo?.soundingKey ?? label?.key ?? 'N/A',
                  shapeKey: keyInfo?.shapeKey,
                  transpose,
                  capo,
                });
              }

              return (
                <li
                  key={item.id ?? `${index}-${item.type}`}
                  className="plan-view__item rounded-lg border border-gray-200 bg-white p-5 shadow-sm print:shadow-none"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {formatType(item.type)}
                      </div>
                      {line ? (
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-gray-900">{line}</p>
                          {keySummary ? (
                            <p className="text-sm text-gray-600">{keySummary}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-2xl font-semibold text-gray-200">{index + 1}</div>
                  </div>
                  {item.notes ? (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                      {item.notes}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
            No plan items have been scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
}

