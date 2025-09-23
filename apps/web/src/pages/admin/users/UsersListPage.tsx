import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { components } from '@/api/types';
import {
  useUsersList,
  useUpdateUser,
  useResetUserPassword,
} from '@/features/users/hooks';
import { isRoleValue, ROLE_VALUES } from '@/features/users/constants';

const PAGE_SIZE = 20;

const formatDateTime = (value: string | undefined) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
};

type User = components['schemas']['User'];

type StatusFilterValue = 'all' | 'active' | 'inactive';

export default function UsersListPage() {
  const { t } = useTranslation('adminUsers');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';
  const roleParam = searchParams.get('role');
  const statusParam = searchParams.get('isActive');
  const pageParam = Number(searchParams.get('page') ?? '0');
  const [search, setSearch] = useState(queryParam);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set('q', search);
      } else {
        params.delete('q');
      }
      params.set('page', '0');
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(handle);
  }, [search]);

  const selectedRole = isRoleValue(roleParam) ? roleParam : undefined;
  const selectedStatus: StatusFilterValue = (() => {
    if (statusParam === 'true') return 'active';
    if (statusParam === 'false') return 'inactive';
    return 'all';
  })();

  const queryPage = Number.isNaN(pageParam) ? 0 : Math.max(pageParam, 0);

  const params = useMemo(
    () => ({
      q: queryParam || undefined,
      role: selectedRole,
      isActive:
        selectedStatus === 'all'
          ? undefined
          : selectedStatus === 'active',
      page: queryPage,
      size: PAGE_SIZE,
    }),
    [queryParam, selectedRole, selectedStatus, queryPage],
  );

  const listQuery = useUsersList(params);
  const updateMutation = useUpdateUser();
  const resetPasswordMutation = useResetUserPassword();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const handleRoleFilterChange = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role && role !== 'all') {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleStatusFilterChange = (status: StatusFilterValue) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'active') {
      params.set('isActive', 'true');
    } else if (status === 'inactive') {
      params.set('isActive', 'false');
    } else {
      params.delete('isActive');
    }
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleResetPassword = async (user: User) => {
    const confirmed = window.confirm(
      t('detail.resetPasswordConfirm', { email: user.email }),
    );

    if (!confirmed) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(user.id);
      toast.success(t('messages.resetPasswordSuccess'));
    } catch (error) {
      toast.error(t('messages.resetPasswordError'));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        body: { isActive: !user.isActive },
      });
      toast.success(t('messages.updateSuccess'));
    } catch (error) {
      toast.error(t('messages.updateError'));
    }
  };

  const totalElements = listQuery.data?.totalElements;
  const hasCount = typeof totalElements === 'number';
  const users = listQuery.data?.content ?? [];
  const currentPage = listQuery.data?.number ?? queryPage ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('page.title')}</h1>
          {hasCount ? (
            <p className="text-sm text-gray-600">
              {t('list.count', { count: totalElements ?? 0 })}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => navigate('new')}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          {t('list.createButton')}
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium" htmlFor="search">
            {t('filters.searchPlaceholder')}
          </label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-1 w-full rounded border p-2"
            placeholder={t('filters.searchPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="role-filter">
            {t('filters.role.label')}
          </label>
          <select
            id="role-filter"
            className="mt-1 rounded border p-2"
            value={selectedRole ?? 'all'}
            onChange={(event) => handleRoleFilterChange(event.target.value)}
          >
            <option value="all">{t('filters.role.any')}</option>
            {ROLE_VALUES.map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="status-filter"
          >
            {t('filters.status.label')}
          </label>
          <select
            id="status-filter"
            className="mt-1 rounded border p-2"
            value={selectedStatus}
            onChange={(event) =>
              handleStatusFilterChange(event.target.value as StatusFilterValue)
            }
          >
            <option value="all">{t('filters.status.any')}</option>
            <option value="active">{t('filters.status.active')}</option>
            <option value="inactive">{t('filters.status.inactive')}</option>
          </select>
        </div>
      </div>

      {listQuery.isLoading ? (
        <div>{tCommon('status.loading')}</div>
      ) : null}
      {listQuery.isError ? <div>{tCommon('status.loadFailed')}</div> : null}

      {!listQuery.isLoading && users.length === 0 ? (
        <div className="rounded border border-dashed p-6 text-center text-gray-500">
          {t('list.empty')}
        </div>
      ) : null}

      {!listQuery.isLoading && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  {t('table.email')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  {t('table.displayName')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  {t('table.roles')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  {t('table.isActive')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  {t('table.createdAt')}
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  {t('table.updatedAt')}
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">
                  {tCommon('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.displayName}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.roles?.map((role) => t(`roles.${role}`)).join(', ')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.isActive
                      ? t('status.active')
                      : t('status.inactive')}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDateTime(user.updatedAt)}
                  </td>
                  <td className="px-4 py-2 text-right text-sm text-gray-900">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        to={`${user.id}`}
                        className="rounded border px-3 py-1"
                      >
                        {t('actions.view')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleResetPassword(user)}
                        className="rounded border px-3 py-1"
                        disabled={resetPasswordMutation.isPending}
                      >
                        {t('actions.resetPassword')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        className="rounded border px-3 py-1"
                        disabled={updateMutation.isPending}
                      >
                        {user.isActive
                          ? t('actions.deactivate')
                          : t('actions.activate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {users.length > 0 ? (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => goToPage(Math.max(0, currentPage - 1))}
            disabled={currentPage <= 0}
          >
            {tCommon('pagination.previous')}
          </button>
          <span className="text-sm text-gray-600">
            {tCommon('pagination.pageOf', {
              page: (currentPage ?? 0) + 1,
              total: totalPages ?? 1,
            })}
          </span>
          <button
            type="button"
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage + 1 >= (totalPages ?? 1)}
          >
            {tCommon('pagination.next')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
