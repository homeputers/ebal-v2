import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Group {
  id: string;
  name: string;
}

const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Group | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name });
    } else {
      reset({ name: '' });
    }
  }, [editing, reset]);

  const openDialog = (group: Group | null) => {
    setEditing(group);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const onSubmit = (data: GroupFormValues) => {
    if (editing) {
      setGroups((prev) =>
        prev.map((g) => (g.id === editing.id ? { ...g, ...data } : g)),
      );
    } else {
      setGroups((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    }
    closeDialog();
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups"
          aria-label="Search groups by name"
          className="border p-2 rounded"
        />
        <button
          onClick={() => openDialog(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Group
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
          {filtered.map((group) => (
            <tr key={group.id} className="border-t">
              <td className="p-2">
                <Link
                  to={`/groups/${group.id}`}
                  className="text-blue-600 underline"
                >
                  {group.name}
                </Link>
              </td>
              <td className="p-2 text-right">
                <button
                  onClick={() => openDialog(group)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="p-2" colSpan={2}>
                No groups found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <dialog ref={dialogRef} className="p-0 rounded max-w-md w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <h2 className="text-lg font-bold">
            {editing ? 'Edit Group' : 'Add Group'}
          </h2>
          <div>
            <label className="block mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              {...register('name')}
              className="border p-2 rounded w-full"
            />
            {errors.name && (
              <p role="alert" className="text-red-600 text-sm">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 rounded border"
            >
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

