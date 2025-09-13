import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface SongSet {
  id: string;
  name: string;
}

const setSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type SetFormValues = z.infer<typeof setSchema>;

export default function SongSets() {
  const [sets, setSets] = useState<SongSet[]>([]);
  const [editing, setEditing] = useState<SongSet | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetFormValues>({
    resolver: zodResolver(setSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name });
    } else {
      reset({ name: '' });
    }
  }, [editing, reset]);

  const openDialog = (set: SongSet | null) => {
    setEditing(set);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const onSubmit = (data: SetFormValues) => {
    if (editing) {
      setSets((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s)));
    } else {
      setSets((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    }
    closeDialog();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => openDialog(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Set
        </button>
      </div>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Name</th>
            <th className="p-2" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <tr key={set.id} className="border-t">
              <td className="p-2">
                <Link to={`/song-sets/${set.id}`} className="text-blue-600 underline">
                  {set.name}
                </Link>
              </td>
              <td className="p-2 text-right">
                <button
                  onClick={() => openDialog(set)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {sets.length === 0 && (
            <tr>
              <td className="p-2" colSpan={2}>
                No sets found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <dialog ref={dialogRef} className="p-0 rounded max-w-md w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <h2 className="text-lg font-bold">{editing ? 'Edit Set' : 'Add Set'}</h2>
          <div>
            <label htmlFor="name" className="block mb-1">
              Name
            </label>
            <input id="name" {...register('name')} className="border p-2 rounded w-full" />
            {errors.name && (
              <p role="alert" className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeDialog} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

