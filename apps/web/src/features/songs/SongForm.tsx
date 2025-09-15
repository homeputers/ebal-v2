import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { components } from '../../api/types';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  ccli: z.string().optional(),
  author: z.string().optional(),
  defaultKey: z.string().optional(),
  tags: z.string().optional(),
});

export type SongFormValues = z.infer<typeof schema>;

export function SongForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: SongFormValues;
  onSubmit: (values: components['schemas']['SongRequest']) => void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit((vals) =>
        onSubmit({
          title: vals.title,
          ccli: vals.ccli || undefined,
          author: vals.author || undefined,
          defaultKey: vals.defaultKey || undefined,
          tags: vals.tags
            ? vals.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      )}
      className="space-y-2"
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input id="title" {...register('title')} className="border p-2 rounded w-full" />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="ccli" className="block text-sm font-medium mb-1">
          CCLI
        </label>
        <input id="ccli" {...register('ccli')} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-1">
          Author
        </label>
        <input id="author" {...register('author')} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label htmlFor="defaultKey" className="block text-sm font-medium mb-1">
          Default Key
        </label>
        <input
          id="defaultKey"
          {...register('defaultKey')}
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          Tags (comma separated)
        </label>
        <input id="tags" {...register('tags')} className="border p-2 rounded w-full" />
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

export default SongForm;
