import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Member {
  id: string;
  displayName: string;
  instruments: string[];
}

const instrumentOptions = ['Guitar', 'Bass', 'Drums', 'Piano', 'Vocals'];

const memberSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  instruments: z.array(z.string()).min(1, 'Select at least one instrument'),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Member | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { displayName: '', instruments: [] },
  });

  useEffect(() => {
    if (editing) {
      reset({ displayName: editing.displayName, instruments: editing.instruments });
    } else {
      reset({ displayName: '', instruments: [] });
    }
  }, [editing, reset]);

  const openDialog = (member: Member | null) => {
    setEditing(member);
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const onSubmit = (data: MemberFormValues) => {
    if (editing) {
      setMembers((prev) => prev.map((m) => (m.id === editing.id ? { ...m, ...data } : m)));
    } else {
      setMembers((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    }
    closeDialog();
  };

  const filtered = members.filter((m) =>
    m.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members"
          aria-label="Search members by name"
          className="border p-2 rounded"
        />
        <button
          onClick={() => openDialog(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Member
        </button>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Instruments</th>
            <th className="p-2" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((member) => (
            <tr key={member.id} className="border-t">
              <td className="p-2">{member.displayName}</td>
              <td className="p-2">{member.instruments.join(', ')}</td>
              <td className="p-2 text-right">
                <button
                  onClick={() => openDialog(member)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="p-2" colSpan={3}>
                No members found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <dialog ref={dialogRef} className="p-0 rounded max-w-md w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <h2 className="text-lg font-bold">
            {editing ? 'Edit Member' : 'Add Member'}
          </h2>
          <div>
            <label className="block mb-1" htmlFor="displayName">
              Display Name
            </label>
            <input
              id="displayName"
              {...register('displayName')}
              className="border p-2 rounded w-full"
            />
            {errors.displayName && (
              <p role="alert" className="text-red-600 text-sm">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1" htmlFor="instruments">
              Instruments
            </label>
            <select
              id="instruments"
              multiple
              {...register('instruments')}
              className="border p-2 rounded w-full h-40"
            >
              {instrumentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.instruments && (
              <p role="alert" className="text-red-600 text-sm">
                {errors.instruments.message}
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

