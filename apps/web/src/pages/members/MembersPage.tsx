import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/types';
import {
  useMembersList,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from '../../features/members/hooks';
import MemberForm from '../../features/members/MemberForm';

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded shadow max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

type Member = components['schemas']['MemberResponse'];
type MemberRequest = components['schemas']['MemberRequest'];

export default function MembersPage() {
  const { t } = useTranslation('members');
  const { t: tCommon } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') ?? '';
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

  const params = useMemo(
    () => ({ query: queryParam || undefined, page: pageParam, size: 20 }),
    [queryParam, pageParam],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError } = useMembersList(params as any);

  const createMut = useCreateMember();
  const updateMut = useUpdateMember();
  const deleteMut = useDeleteMember();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const handleCreate = (vals: MemberRequest) => {
    createMut.mutate(vals, { onSuccess: () => setCreating(false) });
  };

  const handleUpdate = (id: string, vals: MemberRequest) => {
    updateMut.mutate({ id, body: vals }, { onSuccess: () => setEditing(null) });
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const memberCount = data?.totalElements ?? data?.content?.length ?? 0;
  const shouldShowCount = data?.totalElements !== undefined || data?.content !== undefined;

  const formatBirthday = (member: Member) => {
    if (!member.birthdayMonth || !member.birthdayDay) return undefined;
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
    });
    const date = new Date(Date.UTC(2000, (member.birthdayMonth || 1) - 1, member.birthdayDay || 1));
    return formatter.format(date);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold">{t('page.title')}</h1>
          {shouldShowCount ? (
            <span className="text-sm text-gray-600">
              {t('count', { count: memberCount })}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('list.searchPlaceholder')}
          className="border p-2 rounded w-full max-w-sm"
        />
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {t('actions.new')}
        </button>
      </div>
      {isLoading && <div>{tCommon('status.loading')}</div>}
      {isError && <div>{tCommon('status.loadFailed')}</div>}
      {!isLoading && data ? (
        <div className="mt-4">
          {data.content && data.content.length > 0 ? (
            <>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">{t('table.name')}</th>
                    <th className="text-left p-2">{t('table.instruments')}</th>
                    <th className="text-left p-2">{t('table.contact')}</th>
                    <th className="text-left p-2">{t('table.birthday')}</th>
                    <th className="p-2 text-right">{tCommon('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="p-2">{m.displayName}</td>
                      <td className="p-2">{m.instruments?.join(', ')}</td>
                      <td className="p-2 space-y-1">
                        {m.email ? <div>{m.email}</div> : null}
                        {m.phoneNumber ? <div>{m.phoneNumber}</div> : null}
                        {!m.email && !m.phoneNumber ? <div>{t('table.contactPlaceholder')}</div> : null}
                      </td>
                      <td className="p-2">{formatBirthday(m) ?? t('table.birthdayPlaceholder')}</td>
                      <td className="p-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-2 py-1 text-sm bg-gray-200 rounded"
                            onClick={() => setEditing(m)}
                          >
                            {tCommon('actions.edit')}
                          </button>
                          <button
                            className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                            onClick={() => deleteMut.mutate(m.id!)}
                          >
                            {tCommon('actions.delete')}
                          </button>
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
                    page: (data.number ?? 0) + 1,
                    total: data.totalPages ?? 1,
                  })}
                </span>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  disabled={
                    data.number !== undefined &&
                    data.totalPages !== undefined &&
                    data.number + 1 >= data.totalPages
                  }
                  onClick={() => goToPage(pageParam + 1)}
                >
                  {tCommon('pagination.next')}
                </button>
              </div>
            </>
          ) : (
            <div>{t('list.empty')}</div>
          )}
        </div>
      ) : null}
      <Modal open={creating} onClose={() => setCreating(false)}>
        <h2 className="text-lg font-semibold mb-2">{t('modals.createTitle')}</h2>
        <MemberForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <h2 className="text-lg font-semibold mb-2">{t('modals.editTitle')}</h2>
        {editing && (
          <MemberForm
            defaultValues={{
              displayName: editing.displayName || '',
              instruments: editing.instruments?.join(', ') || '',
              email: editing.email || '',
              phoneNumber: editing.phoneNumber || '',
              birthdayMonth: editing.birthdayMonth ?? undefined,
              birthdayDay: editing.birthdayDay ?? undefined,
            }}
            onSubmit={(vals) => handleUpdate(editing.id!, vals)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}

