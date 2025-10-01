import type {
  FieldErrors,
  FieldValues,
  Path,
  SubmitErrorHandler,
  UseFormSetFocus,
} from 'react-hook-form';

const NON_ID_CHARS = /[^a-zA-Z0-9_-]/g;

export const fieldNameToId = (name: string) => name.replace(NON_ID_CHARS, '-');

export const fieldErrorId = (name: string) => `${fieldNameToId(name)}-error`;

export const fieldHelpTextId = (name: string) => `${fieldNameToId(name)}-helptext`;

export const describedBy = (
  name: string,
  options?: { includeError?: boolean; extraIds?: Array<string | false | null | undefined> },
) => {
  const ids: string[] = [];
  if (options?.includeError) {
    ids.push(fieldErrorId(name));
  }
  if (options?.extraIds) {
    ids.push(...options.extraIds.filter((id): id is string => typeof id === 'string'));
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
};

type FlattenedError<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  message: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function flattenErrors<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  parent?: string,
): FlattenedError<TFieldValues>[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    if (!value) return [];

    const path = parent ? `${parent}.${key}` : key;

    if (isRecord(value) && 'message' in value && value.message) {
      return [
        {
          name: path as Path<TFieldValues>,
          message: String(value.message),
        },
      ];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item, index) => {
        if (!item) return [];
        const arrayPath = `${path}.${index}`;
        if (isRecord(item) && 'message' in item && item.message) {
          return [
            {
              name: arrayPath as Path<TFieldValues>,
              message: String(item.message),
            },
          ];
        }
        if (isRecord(item)) {
          return flattenErrors(item as FieldErrors<TFieldValues>, arrayPath);
        }
        return [];
      });
    }

    if (isRecord(value)) {
      return flattenErrors(value as FieldErrors<TFieldValues>, path);
    }

    return [];
  });
}

export function getFirstErrorName<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
): Path<TFieldValues> | undefined {
  const [first] = flattenErrors(errors);
  return first?.name;
}

export function createOnInvalidFocus<TFieldValues extends FieldValues>(
  setFocus: UseFormSetFocus<TFieldValues>,
): SubmitErrorHandler<TFieldValues> {
  return (errors) => {
    const fieldName = getFirstErrorName(errors);
    if (!fieldName) return;

    setFocus(fieldName, { shouldSelect: true });

    const element = document.getElementById(fieldNameToId(fieldName));
    if (element && 'focus' in element) {
      (element as HTMLElement).focus({ preventScroll: true });
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
}

