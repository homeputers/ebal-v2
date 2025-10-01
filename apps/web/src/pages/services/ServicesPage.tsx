import { useEffect, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/layout/PageHeading';
import {
  useServicesList,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../../features/services/hooks';
import ServiceForm from '../../features/services/ServiceForm';
import type { ListServicesResponse } from '../../api/services';
import { formatDate } from '@/i18n/intl';
import { useAuth } from '@/features/auth/useAuth';
import Modal from '../../components/Modal';

export default function ServicesPage() {
  const { t, i18n } = useTranslation('services');
  const { t: tCommon } = useTranslation('common');
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') ?? '';
  const fromParam = searchParams.get('from') ?? '';
  const toParam = searchParams.get('to') ?? '';
  const pageParam = Number(searchParams.get('page') ?? '0');

  const [search, setSearch] = useState(queryParam);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const h = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set('query', search);
      else params.delete('query');
      params.set('page', '0');
      setSearchParams(params);
    }, 300);
    return () => clearTimeout(h);
  }, [search]);

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '0');
    setSearchParams(params);
  };

  const params = useMemo(() => ({ page: pageParam, size: 20 }), [pageParam]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError } = useServicesList(params as any);

  const createMut = useCreateService();
  const updateMut = useUpdateService();
  const deleteMut = useDeleteService();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<
    NonNullable<ListServicesResponse['content']>[number] | null
  >(null);
  const createTitleId = useId();
  const editTitleId = useId();

  const canManageServices = hasRole('ADMIN') || hasRole('PLANNER');

  useEffect(() => {
    if (!canManageServices) {
      setCreating(false);
      setEditing(null);
    }
  }, [canManageServices]);

  const handleCreate = (vals: Parameters<typeof createMut.mutate>[0]) => {
    createMut.mutate(vals, { onSuccess: () => setCreating(false) });
  };

  const handleUpdate = (id: string, vals: Parameters<typeof updateMut.mutate>[0]['body']) => {
    updateMut.mutate({ id, body: vals }, { onSuccess: () => setEditing(null) });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('list.deleteConfirm'))) {
      return;
    }

    deleteMut.mutate(id);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const services = useMemo(() => data?.content ?? [], [data]);
  const fromDate = useMemo(
    () => (fromParam ? new Date(`${fromParam}T00:00:00`) : null),
    [fromParam],
  );
  const toDate = useMemo(
    () => (toParam ? new Date(`${toParam}T23:59:59.999`) : null),
    [toParam],
  );
  const filteredServices = useMemo(() => {
    const normalizedQuery = queryParam.trim().toLowerCase();

    return services.filter((service) => {
      const location = service.location ?? '';
      const formattedDate = service.startsAt
        ? formatDate(service.startsAt, i18n.language)
        : '';
      const matchesQuery =
        !normalizedQuery ||
        location.toLowerCase().includes(normalizedQuery) ||
        formattedDate.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) {
        return false;
      }

      const startsAtDate = service.startsAt ? new Date(service.startsAt) : null;
      const matchesFrom = !fromDate || (startsAtDate && startsAtDate >= fromDate);
      const matchesTo = !toDate || (startsAtDate && startsAtDate <= toDate);

      return matchesFrom && matchesTo;
    });
  }, [fromDate, i18n.language, queryParam, services, toDate]);
  const hasResults = filteredServices.length > 0;

  return (
    <div className="p-4">
      <PageHeading autoFocus className="text-xl font-semibold mb-4">
        {t('page.title')}
      </PageHeading>
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('list.searchPlaceholder')}
          className="border p-2 rounded w-full max-w-sm"
        />
        <input
          type="date"
          value={fromParam}
          onChange={(e) => handleDateChange('from', e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={toParam}
          onChange={(e) => handleDateChange('to', e.target.value)}
          className="border p-2 rounded"
        />
        {canManageServices ? (
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {t('actions.new')}
          </button>
        ) : null}
      </div>
      {isLoading && <div>{tCommon('status.loading')}</div>}
      {isError && <div>{tCommon('status.loadFailed')}</div>}
      {!isLoading && data ? (
        <div className="mt-4">
          {hasResults ? (
            <>
              <table className="w-full border">
                <caption className="sr-only">{t('table.caption')}</caption>
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="text-left p-2">
                      {t('table.startsAt')}
                    </th>
                    <th scope="col" className="text-left p-2">
                      {t('table.location')}
                    </th>
                    <th scope="col" className="p-2 text-right">
                      {tCommon('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((s) => (
                    <tr key={s.id} className="border-t">
                      <th scope="row" className="p-2 text-left font-normal">
                        {s.startsAt ? formatDate(s.startsAt, i18n.language) : ''}
                      </th>
                      <td className="p-2">{s.location}</td>
                      <td className="p-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link
                            to={
                              canManageServices
                                ? s.id ?? ''
                                : `${s.id ?? ''}/plan`
                            }
                            className="px-2 py-1 text-sm bg-green-500 text-white rounded"
                          >
                            {t(
                              canManageServices
                                ? 'actions.openPlan'
                                : 'actions.planView',
                            )}
                          </Link>
                          {canManageServices ? (
                            <>
                              <button
                                className="px-2 py-1 text-sm bg-gray-200 rounded"
                                onClick={() => setEditing(s)}
                              >
                                {tCommon('actions.edit')}
                              </button>
                              <button
                                className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                                onClick={() => s.id && handleDelete(s.id)}
                              >
                                {tCommon('actions.delete')}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={pageParam === 0}
                  onClick={() => goToPage(Math.max(0, pageParam - 1))}
                >
                  {tCommon('pagination.previous')}
                </button>
                <span>
                  {tCommon('pagination.pageOf', {
                    page: (data?.number ?? 0) + 1,
                    total: data?.totalPages ?? 1,
                  })}
                </span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={
                    data?.number !== undefined &&
                    data?.totalPages !== undefined &&
                    data.number + 1 >= data.totalPages
                  }
                  onClick={() => goToPage(pageParam + 1)}
                >
                  {tCommon('pagination.next')}
                </button>
              </div>
            </>
          ) : (
            <div role="status" aria-live="polite">
              {t('list.empty')}
            </div>
          )}
        </div>
      ) : null}

      {canManageServices ? (
        <>
          <Modal
            open={creating}
            onClose={() => setCreating(false)}
            closeLabel={tCommon('actions.close', { defaultValue: 'Close dialog' })}
            titleId={createTitleId}
          >
            <h2 id={createTitleId} className="text-lg font-semibold mb-2">
              {t('modals.createTitle')}
            </h2>
            <ServiceForm
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
              autoFocusFirstField
            />
          </Modal>

          <Modal
            open={!!editing}
            onClose={() => setEditing(null)}
            closeLabel={tCommon('actions.close', { defaultValue: 'Close dialog' })}
            titleId={editTitleId}
          >
            <h2 id={editTitleId} className="text-lg font-semibold mb-2">
              {t('modals.editTitle')}
            </h2>
            {editing && (
              <ServiceForm
                defaultValues={{
                  startsAt: editing.startsAt
                    ? editing.startsAt.slice(0, 16)
                    : '',
                  location: editing.location || '',
                }}
                onSubmit={(vals) => handleUpdate(editing.id!, vals)}
                onCancel={() => setEditing(null)}
                autoFocusFirstField
              />
            )}
          </Modal>
        </>
      ) : null}
    </div>
  );
}
