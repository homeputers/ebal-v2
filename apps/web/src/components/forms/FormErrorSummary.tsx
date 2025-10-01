import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldValues, FieldErrors } from 'react-hook-form';

import { fieldNameToId, flattenErrors } from '@/lib/formAccessibility';

type FormErrorSummaryProps<TFieldValues extends FieldValues> = {
  errors: FieldErrors<TFieldValues>;
  title: string;
  description?: string;
  className?: string;
  getFieldId?: (name: string) => string;
  getItemLabel?: (name: string) => string | undefined;
};

export function FormErrorSummary<TFieldValues extends FieldValues>({
  errors,
  title,
  description,
  className,
  getFieldId,
  getItemLabel,
}: FormErrorSummaryProps<TFieldValues>) {
  const items = useMemo(() => flattenErrors(errors), [errors]);
  const { t: tValidation } = useTranslation('validation');

  if (items.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={
        className ??
        'border border-red-200 bg-red-50 text-red-800 rounded p-3 space-y-2'
      }
    >
      <div className="font-semibold">{title}</div>
      {description ? <p>{description}</p> : null}
      <ul className="list-disc list-inside space-y-1">
        {items.map((item) => {
          const fieldId = (getFieldId ?? fieldNameToId)(item.name);
          const itemLabel = getItemLabel?.(item.name);
          const message = tValidation(item.message, {
            defaultValue: item.message,
          });
          const linkText = itemLabel ? `${itemLabel}: ${message}` : message;
          return (
            <li key={item.name}>
              <a
                href={`#${fieldId}`}
                className="underline"
                onClick={(event) => {
                  event.preventDefault();
                  const element = document.getElementById(fieldId);
                  element?.focus({ preventScroll: true });
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                {linkText}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FormErrorSummary;
