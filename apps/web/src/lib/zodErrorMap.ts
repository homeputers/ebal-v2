import { ZodIssueCode, type ZodErrorMap } from 'zod';
import i18n from '../i18n';

type TranslationParams = Record<string, unknown>;
type ErrorMapIssue = Parameters<ZodErrorMap>[0];

const fieldErrorPrefixStack: string[] = [];

const getCurrentFieldErrorPrefix = () =>
  fieldErrorPrefixStack[fieldErrorPrefixStack.length - 1];

export const withFieldErrorPrefix = async <T>(
  prefix: string | undefined,
  callback: () => Promise<T> | T,
) => {
  if (!prefix) {
    return await callback();
  }

  fieldErrorPrefixStack.push(prefix);

  try {
    return await callback();
  } finally {
    fieldErrorPrefixStack.pop();
  }
};

const normaliseKey = (key: string) => {
  if (key.startsWith('validation:')) {
    return key.slice('validation:'.length);
  }

  if (key.startsWith('validation.')) {
    return key.slice('validation.'.length);
  }

  return key;
};

const translate = (key: string, params: TranslationParams, fallback: string) => {
  const result = i18n.t(normaliseKey(key), {
    defaultValue: fallback,
    ns: 'validation',
    ...params,
  });

  return typeof result === 'string' ? result : fallback;
};

const getFieldScopedKey = (issue: ErrorMapIssue) => {
  const prefix = getCurrentFieldErrorPrefix();

  if (!prefix || !issue.path?.length) {
    return undefined;
  }

  switch (issue.code) {
    case ZodIssueCode.too_small:
      return `${prefix}.${issue.path.join('.')}.min`;
    case ZodIssueCode.too_big:
      return `${prefix}.${issue.path.join('.')}.max`;
    default:
      return undefined;
  }
};

export const zodErrorMap: ZodErrorMap = (issue, ctx) => {
  const issueParams: TranslationParams = (() => {
    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        return {
          expected: issue.expected,
          received: issue.received,
        };

      case ZodIssueCode.too_small: {
        const exact = (issue as typeof issue & { exact?: boolean }).exact ?? false;

        return {
          minimum: issue.minimum,
          inclusive: issue.inclusive,
          exact,
        };
      }

      case ZodIssueCode.too_big: {
        const exact = (issue as typeof issue & { exact?: boolean }).exact ?? false;

        return {
          maximum: issue.maximum,
          inclusive: issue.inclusive,
          exact,
        };
      }

      case ZodIssueCode.invalid_enum_value:
        return {
          options: issue.options.map((option) => String(option)).join(', '),
        };

      default:
        return {};
    }
  })();

  const baseParams: TranslationParams = {
    ...(issue.path?.length ? { path: issue.path.join('.') } : {}),
    ...issueParams,
  };

  const scopedKey = getFieldScopedKey(issue);

  if (scopedKey) {
    const message = translate(scopedKey, baseParams, '');

    if (message) {
      return { message };
    }
  }

  if (issue.message) {
    return {
      message: translate(issue.message, baseParams, issue.message),
    };
  }

  switch (issue.code) {
    case ZodIssueCode.invalid_type: {
      if (issue.received === 'undefined' || issue.received === 'null') {
        return {
          message: translate('required', baseParams, ctx.defaultError),
        };
      }

      return {
        message: translate('invalidType', baseParams, ctx.defaultError),
      };
    }

    case ZodIssueCode.too_small: {
      return {
        message: translate(`tooSmall.${issue.type}`, baseParams, ctx.defaultError),
      };
    }

    case ZodIssueCode.too_big: {
      return {
        message: translate(`tooBig.${issue.type}`, baseParams, ctx.defaultError),
      };
    }

    case ZodIssueCode.invalid_enum_value: {
      return {
        message: translate('invalidEnumValue', baseParams, ctx.defaultError),
      };
    }

    default:
      return {
        message: translate('default', baseParams, ctx.defaultError),
      };
  }
};

export default zodErrorMap;
