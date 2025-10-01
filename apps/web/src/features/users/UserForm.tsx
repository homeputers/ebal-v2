import {
  Controller,
  useForm,
  type Control,
  type Resolver,
  type Path,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import type { Role } from '@/api/auth';
import type { CreateUserBody, UpdateUserBody } from '@/api/users';
import { withFieldErrorPrefix } from '@/lib/zodErrorMap';
import { ROLE_VALUES } from './constants';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import {
  createOnInvalidFocus,
  describedBy,
  fieldErrorId,
  fieldHelpTextId,
  fieldNameToId,
} from '@/lib/formAccessibility';

const roleEnum = z.enum(ROLE_VALUES);

const baseSchema = z.object({
  displayName: z.string().min(2),
  roles: z.array(roleEnum).min(1),
  isActive: z.boolean(),
});

const createSchema = baseSchema.extend({
  email: z.string().email(),
  temporaryPassword: z.string().optional(),
});

const editSchema = baseSchema;

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

type BaseFormProps = {
  onCancel?: () => void;
  isSubmitting?: boolean;
  autoFocusFirstField?: boolean;
};

type UserCreateFormProps = BaseFormProps & {
  defaultValues?: Partial<CreateFormValues>;
  onSubmit: (values: CreateUserBody) => void;
};

type UserEditFormProps = BaseFormProps & {
  defaultValues: EditFormValues;
  email: string;
  onSubmit: (values: UpdateUserBody) => void;
};

const baseCreateResolver = zodResolver(createSchema);
const createResolver: Resolver<CreateFormValues> = async (
  values,
  context,
  options,
) =>
  withFieldErrorPrefix('adminUsers.form', () =>
    baseCreateResolver(values, context, options),
  );

const baseEditResolver = zodResolver(editSchema);
const editResolver: Resolver<EditFormValues> = async (
  values,
  context,
  options,
) =>
  withFieldErrorPrefix('adminUsers.form', () =>
    baseEditResolver(values, context, options),
  );

export function UserCreateForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  autoFocusFirstField = false,
}: UserCreateFormProps) {
  const { t } = useTranslation('adminUsers');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<CreateFormValues>({
    resolver: createResolver,
    defaultValues: {
      email: '',
      displayName: '',
      roles: [],
      isActive: true,
      temporaryPassword: '',
      ...defaultValues,
    },
  });

  const showErrorSummary = submitCount > 0;

  return (
    <form
      onSubmit={handleSubmit(
        (values) => {
          const payload: CreateUserBody = {
            email: values.email.trim(),
            displayName: values.displayName.trim(),
            roles: values.roles as Role[],
            isActive: values.isActive,
            ...(values.temporaryPassword?.trim()
              ? { temporaryPassword: values.temporaryPassword.trim() }
              : {}),
          };

          onSubmit(payload);
        },
        createOnInvalidFocus(setFocus),
      )}
      className="space-y-4"
      noValidate
    >
      {showErrorSummary ? (
        <FormErrorSummary
          errors={errors}
          title={tCommon('forms.errorSummary.title')}
          description={tCommon('forms.errorSummary.description')}
        />
      ) : null}
      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          {t('form.email')}
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          data-autofocus={autoFocusFirstField ? 'true' : undefined}
          className="mt-1 w-full rounded border p-2"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email', { includeError: Boolean(errors.email) })}
        />
        {errors.email ? (
          <p id={fieldErrorId('email')} className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="displayName">
          {t('form.displayName')}
        </label>
        <input
          id="displayName"
          {...register('displayName')}
          className="mt-1 w-full rounded border p-2"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={describedBy('displayName', {
            includeError: Boolean(errors.displayName),
          })}
        />
        {errors.displayName ? (
          <p id={fieldErrorId('displayName')} className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        ) : null}
      </div>

      <RoleSelector<CreateFormValues>
        control={control}
        error={errors.roles?.message}
      />

      <div className="flex items-center gap-2">
        <input id="isActive" type="checkbox" {...register('isActive')} />
        <label htmlFor="isActive" className="text-sm">
          {t('form.isActive')}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="temporaryPassword">
          {t('form.temporaryPassword')}
        </label>
        <input
          id="temporaryPassword"
          type="password"
          autoComplete="new-password"
          {...register('temporaryPassword')}
          className="mt-1 w-full rounded border p-2"
          aria-invalid={Boolean(errors.temporaryPassword)}
          aria-describedby={describedBy('temporaryPassword', {
            includeError: Boolean(errors.temporaryPassword),
            extraIds: [fieldHelpTextId('temporaryPassword')],
          })}
        />
        <p id={fieldHelpTextId('temporaryPassword')} className="mt-1 text-xs text-gray-600">
          {t('form.temporaryPasswordHelp')}
        </p>
        {errors.temporaryPassword ? (
          <p
            id={fieldErrorId('temporaryPassword')}
            className="mt-1 text-sm text-red-600"
          >
            {errors.temporaryPassword.message}
          </p>
        ) : null}
      </div>

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
    </form>
  );
}

export function UserEditForm({
  defaultValues,
  email,
  onSubmit,
  onCancel,
  isSubmitting,
  autoFocusFirstField = false,
}: UserEditFormProps) {
  const { t } = useTranslation('adminUsers');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<EditFormValues>({
    resolver: editResolver,
    defaultValues,
  });

  const showErrorSummary = submitCount > 0;

  return (
    <form
      onSubmit={handleSubmit(
        (values) => {
          const payload: UpdateUserBody = {
            displayName: values.displayName.trim(),
            roles: values.roles as Role[],
            isActive: values.isActive,
          };

          onSubmit(payload);
        },
        createOnInvalidFocus(setFocus),
      )}
      className="space-y-4"
      noValidate
    >
      {showErrorSummary ? (
        <FormErrorSummary
          errors={errors}
          title={tCommon('forms.errorSummary.title')}
          description={tCommon('forms.errorSummary.description')}
        />
      ) : null}
      <div>
        <label className="block text-sm font-medium" htmlFor="email">
          {t('form.email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="mt-1 w-full rounded border bg-gray-100 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="displayName">
          {t('form.displayName')}
        </label>
        <input
          id="displayName"
          {...register('displayName')}
          data-autofocus={autoFocusFirstField ? 'true' : undefined}
          className="mt-1 w-full rounded border p-2"
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={describedBy('displayName', {
            includeError: Boolean(errors.displayName),
          })}
        />
        {errors.displayName ? (
          <p id={fieldErrorId('displayName')} className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        ) : null}
      </div>

      <RoleSelector<EditFormValues>
        control={control}
        error={errors.roles?.message}
      />

      <div className="flex items-center gap-2">
        <input id="isActive" type="checkbox" {...register('isActive')} />
        <label htmlFor="isActive" className="text-sm">
          {t('form.isActive')}
        </label>
      </div>

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
    </form>
  );
}

type RoleSelectorProps<TFieldValues extends { roles: Role[] }> = {
  control: Control<TFieldValues>;
  error?: string;
};

function RoleSelector<TFieldValues extends { roles: Role[] }>({
  control,
  error,
}: RoleSelectorProps<TFieldValues>) {
  const { t } = useTranslation('adminUsers');
  const fieldId = fieldNameToId('roles');
  const errorId = fieldErrorId('roles');

  return (
    <fieldset
      id={fieldId}
      className="space-y-2"
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy('roles', { includeError: Boolean(error) })}
    >
      <legend className="text-sm font-medium">{t('form.roles')}</legend>
      <Controller
        control={control}
        name={'roles' as Path<TFieldValues>}
        render={({ field }) => {
          const currentRoles = (field.value ?? []) as Role[];

          return (
            <div className="mt-2 space-y-2">
              {ROLE_VALUES.map((role) => {
                const checked = currentRoles.includes(role);

                const toggleRole = (isChecked: boolean) => {
                  if (isChecked) {
                    field.onChange([...currentRoles, role]);
                  } else {
                    field.onChange(
                      currentRoles.filter((currentRole) => currentRole !== role),
                    );
                  }
                };

                return (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={role}
                      checked={checked}
                      onChange={(event) => toggleRole(event.target.checked)}
                    />
                    <span>{t(`roles.${role}`)}</span>
                  </label>
                );
              })}
            </div>
          );
        }}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

type FormActionsProps = {
  onCancel?: () => void;
  isSubmitting?: boolean;
};

function FormActions({ onCancel, isSubmitting }: FormActionsProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex gap-2">
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={isSubmitting}
      >
        {t('actions.save')}
      </button>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-4 py-2"
          disabled={isSubmitting}
        >
          {t('actions.cancel')}
        </button>
      ) : null}
    </div>
  );
}
