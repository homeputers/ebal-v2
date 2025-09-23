import type { Role } from '@/api/auth';

export const ROLE_VALUES = ['ADMIN', 'PLANNER', 'MUSICIAN', 'VIEWER'] as const;

export const isRoleValue = (
  value: string | null | undefined,
): value is Role => {
  if (!value) {
    return false;
  }

  return (ROLE_VALUES as readonly string[]).includes(value);
};

export const getRoleOrder = () => ROLE_VALUES.slice();
