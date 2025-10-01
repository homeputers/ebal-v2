import type { ReactNode } from 'react';
import { PageHeading } from '@/components/layout/PageHeading';

type AuthPageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageLayout({
  title,
  description,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <PageHeading autoFocus className="text-2xl font-semibold text-gray-900">
              {title}
            </PageHeading>
            {description ? (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            ) : null}
          </div>
          <div className="mt-6">{children}</div>
        </div>
        {footer ? (
          <div className="text-center text-sm text-gray-600">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
