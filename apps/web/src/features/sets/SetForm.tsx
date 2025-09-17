import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type SetFormValues = z.infer<typeof schema>;

type SetFormProps = {
  defaultValues?: Partial<SetFormValues>;
  onSubmit: (values: SetFormValues) => void;
  onCancel?: () => void;
};

export function SetForm({ defaultValues, onSubmit, onCancel }: SetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input id="name" {...register('name')} className="border p-2 rounded w-full" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
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

export default SetForm;
