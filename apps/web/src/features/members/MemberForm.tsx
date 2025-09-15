import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { components } from '../../api/types';

const schema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  instruments: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof schema>;

export function MemberForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: MemberFormValues;
  onSubmit: (values: components['schemas']['MemberRequest']) => void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit((vals) =>
        onSubmit({
          displayName: vals.displayName,
          instruments: vals.instruments
            ? vals.instruments.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      )}
      className="space-y-2"
    >
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Display Name
        </label>
        <input
          id="displayName"
          {...register('displayName')}
          className="border p-2 rounded w-full"
        />
        {errors.displayName && (
          <p className="text-red-500 text-sm">{errors.displayName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="instruments" className="block text-sm font-medium mb-1">
          Instruments (comma separated)
        </label>
        <input
          id="instruments"
          {...register('instruments')}
          className="border p-2 rounded w-full"
        />
        {errors.instruments && (
          <p className="text-red-500 text-sm">{errors.instruments.message}</p>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default MemberForm;

